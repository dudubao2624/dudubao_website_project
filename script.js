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
const heroCarousel = document.querySelector("[data-hero-carousel]");
const mobilePriorityImages = document.querySelectorAll("img[data-mobile-image-priority]");
const preheatImages = document.querySelectorAll("img[data-image-preheat]");
const productInterestSelect = document.querySelector('select[name="product-interest"]');
const floatingContact = document.querySelector(".floating-contact");

if (window.matchMedia("(max-width: 768px)").matches) {
  mobilePriorityImages.forEach((image) => {
    image.loading = "eager";
    image.removeAttribute("data-mobile-image-priority");
  });
}

if ("IntersectionObserver" in window && preheatImages.length) {
  const imagePreheatObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.loading = "eager";
        entry.target.removeAttribute("data-image-preheat");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px 1100px 0px" }
  );

  preheatImages.forEach((image) => imagePreheatObserver.observe(image));
}

const analyticsConsentStorageKey = "dudubao_analytics_consent_v1";
const googleAnalyticsId = "G-R1SKJ6HSXM";
const clarityProjectId = "ygnxvami74";
// Only the verified canonical production origin may use the production trackers.
const analyticsProductionHosts = new Set(["www.dudubaotoys.com"]);
const isProductionAnalytics =
  window.location.protocol === "https:" &&
  analyticsProductionHosts.has(window.location.hostname) &&
  (window.location.port === "" || window.location.port === "443");
const analyticsEventNames = new Set([
  "form_submit_success",
  "whatsapp_click",
  "email_click",
  "product_detail_click",
  "product_inquiry_click",
]);
const analyticsProductFamilies = new Set(["music_magnetic_systems", "magnetic_tiles"]);
const analyticsSourceSections = new Set(["featured_innovations", "product_system"]);
const analyticsState = {
  googleInitialized: false,
  clarityInitialized: false,
  consent: null,
  revoking: false,
};

const readAnalyticsConsent = () => {
  try {
    const value = window.localStorage.getItem(analyticsConsentStorageKey);
    analyticsState.consent = value === "granted" || value === "denied" ? value : null;
    return analyticsState.consent;
  } catch (error) {
    console.warn("DUDUBAO analytics preference could not be read", error);
    return null;
  }
};

const writeAnalyticsConsent = (value) => {
  analyticsState.consent = value;
  try {
    window.localStorage.setItem(analyticsConsentStorageKey, value);
  } catch (error) {
    console.warn("DUDUBAO analytics preference could not be saved", error);
  }
};

const initializeGoogleAnalytics = () => {
  if (!isProductionAnalytics || analyticsState.revoking ||
      analyticsState.googleInitialized || window.dudubaoGoogleAnalyticsInitialized) {
    return;
  }

  analyticsState.googleInitialized = true;
  window.dudubaoGoogleAnalyticsInitialized = true;
  window[`ga-disable-${googleAnalyticsId}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", googleAnalyticsId);

  if (!document.getElementById("dudubao-ga4-script")) {
    const googleScript = document.createElement("script");
    googleScript.id = "dudubao-ga4-script";
    googleScript.async = true;
    googleScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.append(googleScript);
  }
};

const initializeClarity = () => {
  if (!isProductionAnalytics || analyticsState.revoking ||
      analyticsState.clarityInitialized || window.dudubaoClarityInitialized) {
    return;
  }

  analyticsState.clarityInitialized = true;
  window.dudubaoClarityInitialized = true;
  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "granted",
  });

  if (!document.getElementById("dudubao-clarity-script")) {
    const clarityScript = document.createElement("script");
    clarityScript.id = "dudubao-clarity-script";
    clarityScript.async = true;
    clarityScript.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
    document.head.append(clarityScript);
  }
};

const initializeAnalytics = () => {
  if (!isProductionAnalytics || analyticsState.revoking || readAnalyticsConsent() !== "granted") {
    return;
  }

  initializeGoogleAnalytics();
  initializeClarity();
};

const clearAnalyticsCookies = () => {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)|^_clck$|^_clsk$/.test(name));
  const hostname = window.location.hostname;
  const hostnameParts = hostname.split(".");
  const parentDomain =
    hostnameParts.length > 1 ? `.${hostnameParts.slice(-2).join(".")}` : "";
  const domains = [...new Set(["", hostname, hostname ? `.${hostname}` : "", parentDomain])];

  cookieNames.forEach((name) => {
    domains.forEach((domain) => {
      const domainAttribute = domain ? `; Domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; Path=/${domainAttribute}; SameSite=Lax`;
    });
  });
};

// One-use, per-tab bridge for the immediate consent-withdrawal reload only.
const inquiryReloadDraftKey = "dudubao_inquiry_reload_draft_v1";
const inquiryDraftFields = [
  "name", "company", "email", "phone", "country", "business-type",
  "product-interest", "requested-sku", "sourcing-preference", "estimated-quantity", "message",
];
const inquiryDraftLifetimeMs = 60000;
const inquiryDraftMaxLength = 65536;

const saveInquiryForConsentReload = () => {
  try {
    window.sessionStorage.removeItem(inquiryReloadDraftKey);
    if (!form) return;
    const values = {};
    inquiryDraftFields.forEach((name) => {
      const field = form.elements.namedItem(name);
      if (field && typeof field.value === "string") values[name] = field.value;
    });
    if (!Object.values(values).some((value) => value !== "")) return;
    const draft = JSON.stringify({
      savedAt: Date.now(), path: window.location.pathname, values,
    });
    if (draft.length <= inquiryDraftMaxLength) {
      window.sessionStorage.setItem(inquiryReloadDraftKey, draft);
      // If a reload is interrupted, expire the bridge in the surviving document.
      window.setTimeout(() => {
        try { window.sessionStorage.removeItem(inquiryReloadDraftKey); } catch {}
      }, inquiryDraftLifetimeMs);
    }
  } catch {
    // Storage failure must never delay withdrawal or log customer information.
  }
};

const restoreInquiryAfterConsentReload = () => {
  try {
    const raw = window.sessionStorage.getItem(inquiryReloadDraftKey);
    // Consume before parsing/restoring, including invalid or expired entries.
    window.sessionStorage.removeItem(inquiryReloadDraftKey);
    if (!raw || !form || raw.length > inquiryDraftMaxLength ||
        window.performance.getEntriesByType("navigation")[0]?.type !== "reload") return;
    const draft = JSON.parse(raw);
    const age = Date.now() - draft.savedAt;
    if (!Number.isFinite(draft.savedAt) || age < 0 || age > inquiryDraftLifetimeMs ||
        draft.path !== window.location.pathname || !draft.values ||
        typeof draft.values !== "object") return;
    inquiryDraftFields.forEach((name) => {
      const field = form.elements.namedItem(name);
      const value = draft.values[name];
      if (!field || typeof value !== "string") return;
      if (field.tagName === "SELECT" &&
          !Array.from(field.options).some((option) => option.value === value)) return;
      field.value = value;
    });
  } catch {
    // Invalid/unavailable storage leaves the normal form usable; no payload logs.
  }
};

const revokeAnalytics = () => {
  // Block new business events before updating either SDK or flushing old data.
  if (analyticsState.revoking) return;
  const trackersWereInitialized =
    analyticsState.googleInitialized || analyticsState.clarityInitialized;
  analyticsState.revoking = Boolean(trackersWereInitialized);
  window[`ga-disable-${googleAnalyticsId}`] = true;

  if (isProductionAnalytics && analyticsState.googleInitialized && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }

  if (isProductionAnalytics && analyticsState.clarityInitialized && typeof window.clarity === "function") {
    window.clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    window.clarity("consent", false);
    window.clarity("stop");
  }
  clearAnalyticsCookies();

  if (trackersWereInitialized) {
    // Trackers are already disabled; preserve only this tab's immediate draft.
    saveInquiryForConsentReload();
    window.location.reload();
  }
};

const sanitizeAnalyticsParameters = (eventName, parameters) => {
  if (eventName === "product_detail_click") {
    const { product_family: productFamily, source_section: sourceSection } = parameters;
    return analyticsProductFamilies.has(productFamily) && analyticsSourceSections.has(sourceSection)
      ? { product_family: productFamily, source_section: sourceSection }
      : null;
  }

  if (eventName === "product_inquiry_click") {
    const { product_family: productFamily } = parameters;
    return analyticsProductFamilies.has(productFamily)
      ? { product_family: productFamily }
      : null;
  }

  return {};
};

const trackAnalyticsEvent = (eventName, parameters = {}) => {
  if (!isProductionAnalytics || analyticsState.revoking ||
      readAnalyticsConsent() !== "granted" || !analyticsEventNames.has(eventName)) {
    return;
  }

  const safeParameters = sanitizeAnalyticsParameters(eventName, parameters);
  if (!safeParameters) {
    return;
  }

  if (analyticsState.googleInitialized && typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      ...safeParameters,
      send_to: googleAnalyticsId,
      transport_type: "beacon",
    });
  }

  if (analyticsState.clarityInitialized && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
};

const setupAnalyticsConsent = () => {
  let lastSyncedConsent = readAnalyticsConsent();
  const consentBanner = document.createElement("section");
  consentBanner.className = "analytics-consent";
  consentBanner.hidden = true;
  consentBanner.setAttribute("role", "region");
  consentBanner.setAttribute("aria-labelledby", "analytics-consent-title");
  consentBanner.innerHTML = `
    <div class="analytics-consent-copy">
      <h2 id="analytics-consent-title">Analytics Cookies</h2>
      <p>We use optional analytics technologies to understand how visitors use our website and improve the experience. You can accept or reject analytics without affecting website functionality.</p>
    </div>
    <div class="analytics-consent-actions">
      <button type="button" class="analytics-consent-choice" data-consent-accept>Accept Analytics</button>
      <button type="button" class="analytics-consent-choice" data-consent-reject>Reject</button>
      <a href="privacy.html">Privacy Policy</a>
    </div>
  `;
  document.body.append(consentBanner);

  const acceptButton = consentBanner.querySelector("[data-consent-accept]");
  const rejectButton = consentBanner.querySelector("[data-consent-reject]");
  const consentTitle = consentBanner.querySelector("#analytics-consent-title");

  const openConsentBanner = (moveFocus = false) => {
    consentBanner.hidden = false;
    if (moveFocus && consentTitle) {
      consentTitle.setAttribute("tabindex", "-1");
      consentTitle.focus({ preventScroll: true });
    }
  };

  const closeConsentBanner = () => {
    consentBanner.hidden = true;
  };

  acceptButton.addEventListener("click", () => {
    writeAnalyticsConsent("granted");
    lastSyncedConsent = "granted";
    closeConsentBanner();
    initializeAnalytics();
  });

  rejectButton.addEventListener("click", () => {
    writeAnalyticsConsent("denied");
    lastSyncedConsent = "denied";
    closeConsentBanner();
    revokeAnalytics();
  });

  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", () => openConsentBanner(true));
  });

  const syncAnalyticsConsent = () => {
    const consent = readAnalyticsConsent();
    // Focus/visibility alone must not dismiss explicitly opened settings.
    if (consent === lastSyncedConsent) return;
    lastSyncedConsent = consent;
    if (consent === "granted") {
      closeConsentBanner();
      initializeAnalytics();
    } else {
      revokeAnalytics();
      if (consent === "denied") closeConsentBanner();
      else openConsentBanner();
    }
  };
  window.addEventListener("storage", (event) => {
    if (event.storageArea === window.localStorage &&
        (event.key === analyticsConsentStorageKey || event.key === null)) {
      syncAnalyticsConsent();
    }
  });
  // Recheck when a suspended/background or back-forward cached page resumes.
  window.addEventListener("pageshow", syncAnalyticsConsent);
  window.addEventListener("focus", syncAnalyticsConsent);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncAnalyticsConsent();
  });

  const storedConsent = lastSyncedConsent;
  if (storedConsent === "granted") {
    initializeAnalytics();
  } else {
    revokeAnalytics();
    if (storedConsent === null) openConsentBanner();
  }
};

const preselectProductInterest = () => {
  if (!productInterestSelect) {
    return;
  }

  const selectedProduct = new URLSearchParams(window.location.search).get("product");
  if (!selectedProduct) {
    return;
  }

  const matchingOption = Array.from(productInterestSelect.options).find(
    (option) => option.value === selectedProduct || option.textContent.trim() === selectedProduct
  );

  if (matchingOption) {
    productInterestSelect.value = matchingOption.value;
  }
};

// Accept only model values listed in the product selection cards.
const requestedSkuSelect = form?.querySelector('select[name="requested-sku"]');
const requestedSkuField = form?.querySelector('[data-requested-sku-field]');
const knownProductSkus = new Map([
  [
    "D01-C",
    {
      "value": "D01-C | 102 pieces | Rainbow",
      "family": "Magnetic Tiles"
    }
  ],
  [
    "D10-C",
    {
      "value": "D10-C | 219 pieces | Rainbow",
      "family": "Magnetic Tiles"
    }
  ],
  [
    "D01-M",
    {
      "value": "D01-M | 102 pieces | Pastel",
      "family": "Magnetic Tiles"
    }
  ],
  [
    "D15-C",
    {
      "value": "D15-C | 113 pieces | Christmas Tree",
      "family": "Themed Magnetic Tile Sets"
    }
  ],
  [
    "B07-C",
    {
      "value": "B07-C | 101 pieces | Construction Vehicle",
      "family": "Construction Vehicle Sets"
    }
  ],
  [
    "A01-C",
    {
      "value": "A01-C | 119 pieces | Color Tubes",
      "family": "Ball Runs & Motion"
    }
  ],
  [
    "A01-T",
    {
      "value": "A01-T | 119 pieces | Clear Tubes",
      "family": "Ball Runs & Motion"
    }
  ],
  [
    "A03-T",
    {
      "value": "A03-T | 73 pieces | Bell Ball Run",
      "family": "Music Magnetic Systems"
    }
  ],
  [
    "A05-C",
    {
      "value": "A05-C | 10 pieces | Bell Expansion Pack",
      "family": "Music Magnetic Systems"
    }
  ],
  [
    "M01-C",
    {
      "value": "M01-C | 28 pieces | Glitter",
      "family": "Mini Magnetic Tiles"
    }
  ],
  [
    "M02-C",
    {
      "value": "M02-C | 70 pieces | Rainbow",
      "family": "Mini Magnetic Tiles"
    }
  ],
  [
    "M02-M",
    {
      "value": "M02-M | 72 pieces | Pastel",
      "family": "Mini Magnetic Tiles"
    }
  ],
  ["D10-M", {"value": "D10-M | 226 pieces | Pastel", "family": "Magnetic Tiles"}],
  ["C01-C", {"value": "C01-C | 99 pieces | Rainbow Car Track", "family": "Car Track Sets"}],
  ["C02-C", {"value": "C02-C | 188 pieces | Rainbow Car Track", "family": "Car Track Sets"}]
]);
const syncRequestedSku = () => {
  if (!requestedSkuSelect || !requestedSkuField) return;
  const family = productInterestSelect?.value;
  const hasModels = Array.from(knownProductSkus.values()).some((model) => model.family === family);
  requestedSkuField.hidden = !hasModels;
  requestedSkuSelect.disabled = !hasModels;
  for (const option of requestedSkuSelect.options) {
    const matches = !option.value || option.dataset.family === family;
    option.hidden = !matches;
    option.disabled = !matches;
  }
  const selected = Array.from(requestedSkuSelect.options).find((option) => option.value === requestedSkuSelect.value);
  if (!hasModels || !selected || selected.disabled) requestedSkuSelect.value = "";
};
const preselectRequestedSku = () => {
  if (!requestedSkuSelect) return;
  const params = new URLSearchParams(window.location.search);
  const model = knownProductSkus.get(params.get("sku"));
  if (model && params.get("product") === model.family && productInterestSelect?.value === model.family && !requestedSkuSelect.value) {
    requestedSkuSelect.value = model.value;
  }
};

preselectProductInterest();
preselectRequestedSku();
// Restore after URL preselection, before any analytics library can initialize.
restoreInquiryAfterConsentReload();
syncRequestedSku();
productInterestSelect?.addEventListener("change", syncRequestedSku);
form?.addEventListener("reset", () => window.setTimeout(syncRequestedSku, 0));
setupAnalyticsConsent();

document.addEventListener("click", (event) => {
  const contactLink = event.target.closest("a[href]");

  if (!contactLink) {
    return;
  }

  if (contactLink.matches("[data-product-detail-click]")) {
    trackAnalyticsEvent("product_detail_click", {
      product_family: contactLink.dataset.productFamily,
      source_section: contactLink.dataset.sourceSection,
    });
  }

  if (contactLink.matches("[data-product-inquiry-click]")) {
    trackAnalyticsEvent("product_inquiry_click", {
      product_family: contactLink.dataset.productFamily,
    });
  }

  const href = contactLink.getAttribute("href") || "";
  if (href.startsWith("https://wa.me/")) {
    trackAnalyticsEvent("whatsapp_click");
  } else if (href.startsWith("mailto:")) {
    trackAnalyticsEvent("email_click");
  }
});

const setupMobileFormCtaYield = () => {
  if (!form || !floatingContact) {
    return;
  }

  const mobileViewport = window.matchMedia("(max-width: 768px)");
  const setFormZoneState = (isInFormZone) => {
    floatingContact.classList.toggle("is-form-zone", mobileViewport.matches && isInFormZone);
  };

  if ("IntersectionObserver" in window) {
    const formZoneObserver = new IntersectionObserver(
      ([entry]) => setFormZoneState(entry.isIntersecting),
      { threshold: 0 }
    );
    formZoneObserver.observe(form);
    mobileViewport.addEventListener("change", () => {
      const formBounds = form.getBoundingClientRect();
      setFormZoneState(formBounds.top < window.innerHeight && formBounds.bottom > 0);
    });
    return;
  }

  const updateFormZoneState = () => {
    const formBounds = form.getBoundingClientRect();
    setFormZoneState(formBounds.top < window.innerHeight && formBounds.bottom > 0);
  };
  window.addEventListener("scroll", updateFormZoneState, { passive: true });
  window.addEventListener("resize", updateFormZoneState);
  updateFormZoneState();
};

setupMobileFormCtaYield();

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

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll("[data-carousel-slide]"));
  const dots = Array.from(heroCarousel.querySelectorAll("[data-carousel-dot]"));
  const prevButton = heroCarousel.querySelector("[data-carousel-prev]");
  const nextButton = heroCarousel.querySelector("[data-carousel-next]");
  const autoRotateMs = 6000;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let rotationTimer;

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const showSlide = (nextIndex) => {
    const slideCount = slides.length;

    if (!slideCount) {
      return;
    }

    activeIndex = (nextIndex + slideCount) % slideCount;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  const stopRotation = () => {
    if (rotationTimer) {
      window.clearInterval(rotationTimer);
    }
  };

  const startRotation = () => {
    stopRotation();
    rotationTimer = window.setInterval(() => showSlide(activeIndex + 1), autoRotateMs);
  };

  showSlide(activeIndex);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startRotation();
    });
  });

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      startRotation();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      startRotation();
    });
  }

  heroCarousel.addEventListener("mouseenter", stopRotation);
  heroCarousel.addEventListener("mouseleave", startRotation);
  heroCarousel.addEventListener("focusin", stopRotation);
  heroCarousel.addEventListener("focusout", startRotation);
  startRotation();
}

// Operational diagnostics stay in this tab. Never include form values or provider payloads.
const inquiryLogKey = "dudubao_inquiry_log_v1";
const recordInquiryOutcome = (entry) => {
  const record = { ...entry, time: new Date().toISOString() };
  console.info("DUDUBAO inquiry outcome", record);
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(inquiryLogKey) || "[]");
    const records = Array.isArray(stored) ? stored : [];
    window.sessionStorage.setItem(inquiryLogKey, JSON.stringify([...records, record].slice(-20)));
  } catch {
    // Restricted or full storage must not interrupt submission or its confirmation.
  }
};

if (form && statusMessage) {
  let inquiryInFlight = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inquiryInFlight) {
      return;
    }

    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const controller = new AbortController();
    const reference = `DDB-${window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;
    const startedAt = Date.now();
    let httpStatus = null;
    let failureReason = "network";
    let serviceAccepted = false;

    formData.set("inquiry-reference", reference);
    formData.set("_subject", `New DUDUBAO inquiry [${reference}]`);
    formData.set("_url", `${window.location.origin}${window.location.pathname}`);

    inquiryInFlight = true;
    const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);
    recordInquiryOutcome({ reference, page: "home", outcome: "attempt" });
    statusMessage.setAttribute("role", "status");
    statusMessage.textContent = "Sending your project details...";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      if (window.location.protocol === "file:") {
        failureReason = "local_file";
        throw new Error("A web server is required.");
      }

      const response = await fetch(formSubmitEndpoint, {
        method: "POST",
        referrerPolicy: "origin",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        signal: controller.signal,
      });

      httpStatus = response.status;
      failureReason = response.ok ? "invalid_response" : "http";
      const result = await response.json();
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("Unexpected provider response.");
      }
      const providerMessage = String(result.message || result.error || "");
      const providerSuccess = result.success === true || result.success === "true";
      const needsActivation = /activat|confirm|verify/i.test(providerMessage);
      const needsWebServer = /web server|html files/i.test(providerMessage);

      if (!response.ok || !providerSuccess || needsActivation || needsWebServer) {
        if (needsActivation) {
          failureReason = "activation";
        } else if (needsWebServer) {
          failureReason = "web_server";
        } else if (response.ok) {
          failureReason = "provider_rejected";
        }
        throw new Error("Provider acceptance was not confirmed.");
      }

      serviceAccepted = true;
      recordInquiryOutcome({
        reference, page: "home", outcome: "provider_accepted",
        httpStatus, durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      recordInquiryOutcome({
        reference, page: "home", outcome: "unconfirmed",
        reason: error.name === "AbortError" ? "timeout" : failureReason,
        httpStatus, durationMs: Date.now() - startedAt,
      });
      // Fixed markup only. The reference is inserted separately as plain text.
      statusMessage.innerHTML = `
        <span style="display:block;padding:18px;border:1px solid #dce5e7;border-radius:10px;background:#f5f9f9;color:#263e43;font-size:15px;line-height:1.55;text-align:left;overflow-wrap:anywhere">
          <strong style="display:block;margin-bottom:8px;font-size:18px;line-height:1.3">We couldn't confirm your submission</strong>
          <span style="display:block;margin-bottom:10px">We couldn't confirm whether your inquiry was sent. Your details are still in the form.</span>
          <span style="display:block">Please include your reference and project details when contacting us directly. You will need to send the message yourself.</span>
          <span style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
            <a href="mailto:ryan@dudubao.net" aria-label="Email DUDUBAO at ryan@dudubao.net" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 16px;border:1px solid #263e43;border-radius:7px;background:#263e43;color:#fff;text-decoration:none;font-weight:700;box-sizing:border-box">ryan@dudubao.net</a>
            <a href="https://wa.me/8619357221813" target="_blank" rel="noopener" aria-label="Contact DUDUBAO on WhatsApp at +86 193 5722 1813" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 16px;border:1px solid #8ca2a6;border-radius:7px;background:#fff;color:#263e43;text-decoration:none;font-weight:700;box-sizing:border-box">WhatsApp +86 193 5722 1813</a>
          </span>
          <span style="display:block;font-size:14px;color:#52686d">Submitting again or using another channel may create a duplicate inquiry.</span>
        </span>
      `;
      const referenceNote = document.createElement("span");
      referenceNote.style.cssText = "display:block;margin-top:10px;overflow-wrap:anywhere";
      referenceNote.textContent = `Reference: ${reference}`;
      statusMessage.appendChild(referenceNote);
    } finally {
      window.clearTimeout(timeoutId);
      inquiryInFlight = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Project Details";
      }
    }

    if (serviceAccepted) {
      // Optional analytics and UI errors must not reclassify a confirmed acceptance.
      try {
        trackAnalyticsEvent("form_submit_success");
      } catch {
        console.warn("DUDUBAO optional analytics unavailable");
      }
      const receipt = document.createElement("p");
      receipt.style.overflowWrap = "anywhere";
      receipt.textContent = `Reference: ${reference}. Please save this reference for follow-up.`;
      if (contactSuccess) {
        contactSuccess.appendChild(receipt);
      }
      form.reset();
      showContactSuccess();
    }
  });
}
