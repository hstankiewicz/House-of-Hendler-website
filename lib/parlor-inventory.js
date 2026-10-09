const LIMITS = require('./parlor-allocation.json');
const IDS = Object.keys(LIMITS);
// Website only. Preview has its own ledger, so testing cannot consume live stock.
const namespace = () => `hoh:parlor:website:20261009:${process.env.VERCEL_ENV === 'production' ? 'production' : 'preview'}`;
async function command(args) {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Inventory storage is not configured');
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error('Inventory storage unavailable');
  return data.result;
}
const RESERVE = `
local limits=cjson.decode(ARGV[1]);local items=cjson.decode(ARGV[2])
for id,qty in pairs(limits) do redis.call('HSETNX',KEYS[1],id,qty) end
if redis.call('HEXISTS',KEYS[2],ARGV[3])==1 then return 1 end
for _,item in ipairs(items) do
 if not limits[item.productId] or item.quantity<1 or item.quantity~=math.floor(item.quantity) then return -1 end
 if tonumber(redis.call('HGET',KEYS[1],item.productId))<item.quantity then return 0 end
end
for _,item in ipairs(items) do redis.call('HINCRBY',KEYS[1],item.productId,-item.quantity) end
redis.call('HSET',KEYS[2],ARGV[3],ARGV[2]);return 1`;
const RELEASE = `
local raw=redis.call('HGET',KEYS[2],ARGV[1]);if not raw then return 0 end
for _,item in ipairs(cjson.decode(raw)) do redis.call('HINCRBY',KEYS[1],item.productId,item.quantity) end
redis.call('HDEL',KEYS[2],ARGV[1]);redis.call('HDEL',KEYS[3],ARGV[1]);return 1`;
async function reserve(id, items) {
  const merged = new Map();
  for (const item of items) {
    if (!LIMITS[item.productId] || !Number.isInteger(item.quantity) || item.quantity < 1) throw new Error('Invalid inventory item');
    merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  }
  const selected = [...merged].map(([productId, quantity]) => ({productId, quantity}));
  const n = namespace();
  const result = await command(['EVAL', RESERVE, 2, `${n}:stock`, `${n}:holds`, JSON.stringify(LIMITS), JSON.stringify(selected), id]);
  if (result !== 1) { const error = new Error('Insufficient stock'); error.code = 'OUT_OF_STOCK'; throw error; }
}
async function attach(id, sessionId) { await command(['HSET', `${namespace()}:sessions`, id, sessionId]); }
async function reconcile(secret) {
  const n = namespace(), raw = await command(['HGETALL', `${n}:sessions`]);
  const entries = Array.isArray(raw) ? Array.from({length:raw.length/2},(_,i)=>[raw[i*2],raw[i*2+1]]) : Object.entries(raw || {});
  for (const [id, sessionId] of entries) {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(10000)});
    const session = await response.json();
    if (!response.ok) throw new Error('Unable to reconcile inventory');
    if (session.status === 'expired') await command(['EVAL', RELEASE, 3, `${n}:stock`, `${n}:holds`, `${n}:sessions`, id]);
    // Completed checkouts retain their deduction permanently. No automatic restock.
    else if (session.status === 'complete') await command(['HDEL', `${n}:sessions`, id]);
  }
}
async function inventory(secret) {
  if (secret) await reconcile(secret);
  const n=namespace();
  const args=['EVAL',"local limits=cjson.decode(ARGV[1]);for id,qty in pairs(limits) do redis.call('HSETNX',KEYS[1],id,qty) end;return redis.call('HGETALL',KEYS[1])",1,`${n}:stock`,JSON.stringify(LIMITS)];
  const raw=await command(args);
  const values=Array.isArray(raw)?Object.fromEntries(Array.from({length:raw.length/2},(_,i)=>[raw[i*2],Number(raw[i*2+1])])):raw;
  return Object.fromEntries(IDS.map(id=>[id,{limit:LIMITS[id],available:Number(values[id])}]));
}
module.exports = { inventory, reserve, attach, reconcile, IDS, LIMITS, RESERVE, RELEASE };
