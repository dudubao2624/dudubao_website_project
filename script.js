const form = document.querySelector("[data-placeholder-form]");
const statusMessage = document.querySelector("[data-form-status]");
const formSubmitEndpoint = "https://formsubmit.co/ajax/ryan@dudubao.net";
const requestTimeoutMs = 15000;
const header = document.querySelector(".site-header");
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const contactLayout = document.querySelector("[data-contact-layout]");
const contactSuccess = document.querySelector("[data-contact-success]");
const returnHomeLink = document.querySelector("[data-return-home]");

if (header && mobileMenuToggle && mobileMenu) {
  const closeMobileMenu = () => {
    header.classList.remove("menu-open");
    mobileMenu.hidden = true;
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.setAttribute("aria-label", "Open navigation menu");
  };

  mobileMenuToggle.addEventListener("click", () => {
    const isOpen = mobileMenuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMobileMenu();
      return;
    }

    header.classList.add("menu-open");
    mobileMenu.hidden = false;
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenuToggle.setAttribute("aria-label", "Close navigation menu");
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) {
      closeMobileMenu();
    }
  });
}

const showContactSuccess = () => {
  if (!contactLayout || !contactSuccess || !form) {
    return;
  }

  form.hidden = true;
  contactSuccess.hidden = false;
  contactLayout.classList.add("is-success");
  contactSuccess.setAttribute("tabindex", "-1");
  contactSuccess.focus({ preventScroll: true });

  window.requestAnimationFrame(() => {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const targetTop = contactSuccess.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  });
};

if (returnHomeLink) {
  returnHomeLink.addEventListener("click", () => {
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  });
}

if (form && statusMessage) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);

    formData.set("_subject", `New DUDUBAO inquiry from ${formData.get("company") || formData.get("name") || "website"}`);
    formData.set("_url", window.location.href);

    statusMessage.setAttribute("role", "status");
    statusMessage.textContent = "Sending your project details...";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      if (window.location.protocol === "file:") {
        throw new Error(
          "Email delivery requires the website to be opened through a web server, not directly as an HTML file."
        );
      }

      const response = await fetch(formSubmitEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        signal: controller.signal,
      });

      const result = await response.json().catch(() => ({}));
      const providerMessage = String(result.message || result.error || "");
      const providerSuccess = result.success === true || result.success === "true";
      const providerFailure = result.success === false || result.success === "false";
      const needsActivation = /activat|confirm|verify/i.test(providerMessage);
      const needsWebServer = /web server|html files/i.test(providerMessage);

      window.dudubaoLastFormSubmitResponse = {
        status: response.status,
        ok: response.ok,
        result,
      };

      if (!response.ok || providerFailure || !providerSuccess || needsActivation || needsWebServer) {
        const deliveryFailure = {
          status: response.status,
          result,
        };
        console.error("DUDUBAO contact form delivery failed", deliveryFailure);
        console.error("DUDUBAO contact form provider response", JSON.stringify(deliveryFailure));
        throw new Error(
          needsActivation
            ? "Email delivery is not activated yet. Please confirm the FormSubmit activation email for ryan@dudubao.net."
            : needsWebServer
              ? "Email delivery requires the website to be opened through a web server, not directly as an HTML file."
            : providerMessage || "Unable to send your inquiry right now."
        );
      }

      console.info("DUDUBAO contact form accepted by email service", {
        status: response.status,
        result,
      });
      form.reset();
      showContactSuccess();
    } catch (error) {
      console.error("DUDUBAO contact form submission error", error);
      statusMessage.textContent =
        error.name === "AbortError"
          ? "Email delivery timed out. Please try again shortly."
          : error.message || "Unable to send your inquiry right now. Please try again shortly.";
    } finally {
      window.clearTimeout(timeoutId);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Project Details";
      }
    }
  });
}
