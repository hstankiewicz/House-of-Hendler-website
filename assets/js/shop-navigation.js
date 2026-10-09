(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const setOpen = (button, panel, open) => {
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (!open) panel.querySelectorAll('button[aria-expanded="true"]').forEach(child => setOpen(child, child.nextElementSibling, false));
  };
  const closeAll = () => document.querySelectorAll('[data-shop-menu]').forEach(menu => setOpen(menu.firstElementChild, menu.lastElementChild, false));
  document.querySelectorAll('[data-shop-menu], .shop-submenu').forEach(group => {
    const button = group.firstElementChild, panel = button.nextElementSibling;
    button.addEventListener('click', event => setOpen(button, panel, event.pointerType === 'mouse' && finePointer.matches ? true : panel.hidden));
    group.addEventListener('pointerenter', () => { if (finePointer.matches) setOpen(button, panel, true); });
    group.addEventListener('pointerleave', () => { if (finePointer.matches && !group.contains(document.activeElement)) setOpen(button, panel, false); });
    group.addEventListener('focusout', event => { if (!group.contains(event.relatedTarget)) setOpen(button, panel, false); });
    group.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); setOpen(button, panel, false); button.focus(); }
      if (event.target === button && event.key === 'ArrowDown') { event.preventDefault(); setOpen(button, panel, true); panel.querySelector('button,a').focus(); }
    });
  });
  document.addEventListener('click', event => { if (!event.target.closest('[data-shop-menu]')) closeAll(); });
})();
