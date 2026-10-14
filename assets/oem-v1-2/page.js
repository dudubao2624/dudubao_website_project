const oemProductSelect = document.querySelector("[data-product-select]");
const oemSubmitButton = document.querySelector("[data-oem-submit]");

document.querySelectorAll("[data-product]").forEach((link) => {
  link.addEventListener("click", () => {
    if (!oemProductSelect) {
      return;
    }

    const product = link.getAttribute("data-product");
    const matchingOption = Array.from(oemProductSelect.options).find(
      (option) => option.value === product
    );

    if (matchingOption) {
      oemProductSelect.value = product;
    }
  });
});

if (oemSubmitButton) {
  const restoreSubmitLabel = () => {
    if (!oemSubmitButton.disabled && oemSubmitButton.textContent.trim() === "Send Project Details") {
      oemSubmitButton.innerHTML =
        '<span>Discuss Your Magnetic Tile Project</span><span aria-hidden="true">↗</span>';
    }
  };

  new MutationObserver(restoreSubmitLabel).observe(oemSubmitButton, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}
