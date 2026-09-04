/* Clean House of Hendler dynamic checkout: address entered once, EasyPost rate updates in place. */
(() => {
  const CART_KEY = "hoh-cart-rebuild";
  const STRIPE_PUBLISHABLE_KEY = "pk_live_51U8UJRKEDXkXigZmaUO0gBl9CBatEAQ3keZAAC5scQD8nCIzDuMUUy48By2uPzq2R0lFALO4IzV1NJsldHLtrP3g00NaUyX9Wy";
  let checkout;
  let actions;
  let sessionId = "";
  let shippingReady = false;
  let canConfirm = false;
  let lastSignature = "";
  let timer;

  function product(id){ return window.SITE_CONFIG?.products?.find((p) => p.id === id) || null; }
  function loadCart(){ try { const v=JSON.parse(localStorage.getItem(CART_KEY)||"{}"); return v&&typeof v==="object"&&!Array.isArray(v)?v:{}; } catch(_){ return {}; } }
  function cartItems(){ return Object.entries(loadCart()).map(([productId,quantity])=>({productId,quantity:Number(quantity),product:product(productId)})).filter((x)=>x.product&&x.quantity>0); }
  function minderCount(items){ return items.reduce((sum,item)=>sum+item.quantity*(item.productId==="trio"?3:1),0); }
  function showError(message){ const el=document.getElementById("checkout-error"); if(!el)return; el.textContent=message||""; el.hidden=!message; }
  function updatePay(){ const b=document.getElementById("pay-button"); if(b)b.disabled=!(shippingReady&&canConfirm&&actions); }
  function renderCart(){ const items=cartItems(); const list=document.getElementById("checkout-items"); const summary=document.getElementById("checkout-summary"); if(!items.length){ list.innerHTML='<p>Your cart is empty. <a class="checkout-link" href="shop.html">Return to the shop</a>.</p>'; summary.textContent=""; return false; } list.innerHTML=items.map((item)=>`<div class="checkout-item"><div><div class="checkout-item-name">${item.product.name}</div><div>${item.product.price} × ${item.quantity}</div></div><strong>${item.quantity}</strong></div>`).join(""); const count=minderCount(items); summary.textContent=`${count} needle minder${count===1?"":"s"} in this order.`; return true; }
  function signature(value){ const a=value?.address||{}; return [value?.name,a.line1,a.line2,a.city,a.state,a.postal_code,a.country].map((v)=>String(v||"").trim().toLowerCase()).join("|"); }

  async function serverUpdate(shippingDetails){
    const status=document.getElementById("shipping-status");
    shippingReady=false; updatePay(); showError(""); status.textContent="Calculating USPS shipping…";
    const response=await fetch("/api/update-dynamic-shipping",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({checkout_session_id:sessionId,shipping_details:shippingDetails})});
    const result=await response.json();
    if(!response.ok||result.type==="error") throw new Error(result.message||"We couldn't calculate shipping for this address.");
    shippingReady=true;
    status.textContent=`${result.shipping?.service||"USPS shipping"}: $${Number(result.shipping?.amount||0).toFixed(2)}`;
    updatePay();
    return {type:"object",value:{succeeded:true}};
  }

  async function init(){
    const loading=document.getElementById("checkout-loading");
    const form=document.getElementById("checkout-form");
    const payload=cartItems().map(({productId,quantity})=>({productId,quantity}));
    if(!payload.length){ loading.textContent="Add an item to your cart to check out."; return; }
    try {
      const response=await fetch("/api/create-dynamic-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:payload})});
      const data=await response.json();
      if(!response.ok||!data.clientSecret||!data.sessionId) throw new Error(data.error||"Unable to start checkout.");
      sessionId=data.sessionId;
      const stripe=Stripe(STRIPE_PUBLISHABLE_KEY);
      checkout=stripe.initCheckoutElementsSdk({clientSecret:data.clientSecret});
      const load=await checkout.loadActions();
      if(load.type!=="success") throw new Error(load.error?.message||"Unable to load checkout.");
      actions=load.actions;

      const contact=checkout.createContactDetailsElement(); contact.mount("#contact-details-element");
      const shippingAddress=checkout.createShippingAddressElement(); shippingAddress.mount("#shipping-address-element");
      const payment=checkout.createPaymentElement(); payment.mount("#payment-element");

      checkout.on("change",(session)=>{ canConfirm=Boolean(session.canConfirm); updatePay(); });
      shippingAddress.on("change",(event)=>{
        clearTimeout(timer);
        if(!event.complete){ shippingReady=false; document.getElementById("shipping-status").textContent="Shipping will calculate automatically after your address is complete."; updatePay(); return; }
        timer=setTimeout(async()=>{
          try {
            const valueResult=await shippingAddress.getValue();
            if(!valueResult.complete) return;
            const next=signature(valueResult.value);
            if(!next||next===lastSignature) return;
            lastSignature=next;
            await actions.runServerUpdate(()=>serverUpdate(valueResult.value));
          } catch(error){ shippingReady=false; document.getElementById("shipping-status").textContent="Shipping could not be calculated yet."; showError(error?.message||"Please check the address and try again."); updatePay(); }
        },450);
      });

      document.getElementById("pay-button").addEventListener("click",async()=>{
        const button=document.getElementById("pay-button"); button.disabled=true; button.textContent="Processing…"; showError("");
        try { const result=await actions.confirm(); if(result?.type==="error") throw new Error(result.error?.message||"Payment could not be completed."); }
        catch(error){ showError(error?.message||"Payment could not be completed. Please try again."); button.textContent="Pay securely"; updatePay(); }
      });

      loading.hidden=true; form.hidden=false; canConfirm=Boolean(actions.getSession().canConfirm); updatePay();
    } catch(error){ console.error(error); loading.textContent=error?.message||"Unable to load secure checkout."; }
  }

  document.addEventListener("DOMContentLoaded",()=>{ if(renderCart()) init(); });
})();
