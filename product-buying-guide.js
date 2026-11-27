/* Keep local inquiry entrances and the visible selection aligned with the existing form. */
(() => {
  const form = document.querySelector('.product-deep-page #contact-form');
  const modelSelect = form?.querySelector('select[name="requested-sku"]');
  if (!form || !modelSelect) return;

  const syncModel = () => {
    const option = modelSelect.selectedOptions[0];
    const sku = option?.value.split(' | ')[0];
    document.querySelectorAll('[data-inquiry-model]').forEach((element) => {
      element.textContent = option?.value ? option.textContent.trim() : 'Choose a model below';
    });
    document.querySelectorAll('[data-current-model-link]').forEach((link) => {
      const url = new URL(link.href);
      if (sku) url.searchParams.set('sku', sku);
      else url.searchParams.delete('sku');
      link.href = url.href;
      if (link.classList.contains('mobile-contact-inquiry')) {
        link.textContent = sku ? `Inquire: ${sku}` : 'Send inquiry';
      }
    });
  };

  // script.js owns SKU preselection and same-page inquiry navigation.
  // This listener runs after it and only reflects the resulting form value.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash === '#inquiry') {
      queueMicrotask(syncModel);
    }
  });
  form.addEventListener('change', syncModel);
  form.addEventListener('reset', () => setTimeout(syncModel, 0));
  window.addEventListener('pageshow', syncModel);
  syncModel();
})();
