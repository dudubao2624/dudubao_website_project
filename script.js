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
const analyticsEventNames = new Set(["form_submit_success", "whatsapp_click", "email_click"]);
const analyticsState = {
  googleInitialized: false,
  clarityInitialized: false,
};

const readAnalyticsConsent = () => {
  try {
    const value = window.localStorage.getItem(analyticsConsentStorageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch (error) {
    console.warn("DUDUBAO analytics preference could not be read", error);
    return null;
  }
};

const writeAnalyticsConsent = (value) => {
  try {
    window.localStorage.setItem(analyticsConsentStorageKey, value);
  } catch (error) {
    console.warn("DUDUBAO analytics preference could not be saved", error);
  }
};

const initializeGoogleAnalytics = () => {
  if (analyticsState.googleInitialized || window.dudubaoGoogleAnalyticsInitialized) {
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
  if (analyticsState.clarityInitialized || window.dudubaoClarityInitialized) {
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
  if (readAnalyticsConsent() !== "granted") {
    return;
  }

  initializeGoogleAnalytics();
  initializeClarity();
};

const clearGoogleAnalyticsCookies = () => {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name));
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

const revokeAnalytics = () => {
  const trackersWereInitialized =
    analyticsState.googleInitialized || analyticsState.clarityInitialized;

  if (analyticsState.googleInitialized && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    window[`ga-disable-${googleAnalyticsId}`] = true;
    clearGoogleAnalyticsCookies();
  }

  if (analyticsState.clarityInitialized && typeof window.clarity === "function") {
    window.clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    window.clarity("consent", false);
  }

  if (trackersWereInitialized) {
    window.setTimeout(() => window.location.reload(), 0);
  }
};

const trackAnalyticsEvent = (eventName) => {
  if (readAnalyticsConsent() !== "granted" || !analyticsEventNames.has(eventName)) {
    return;
  }

  if (analyticsState.googleInitialized && typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      send_to: googleAnalyticsId,
      transport_type: "beacon",
    });
  }

  if (analyticsState.clarityInitialized && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
};

const setupAnalyticsConsent = () => {
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
    closeConsentBanner();
    initializeAnalytics();
  });

  rejectButton.addEventListener("click", () => {
    writeAnalyticsConsent("denied");
    closeConsentBanner();
    revokeAnalytics();
  });

  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", () => openConsentBanner(true));
  });

  const storedConsent = readAnalyticsConsent();
  if (storedConsent === "granted") {
    initializeAnalytics();
  } else if (storedConsent === null) {
    openConsentBanner();
  }
};

setupAnalyticsConsent();

document.addEventListener("click", (event) => {
  const contactLink = event.target.closest("a[href]");

  if (!contactLink) {
    return;
  }

  const href = contactLink.getAttribute("href") || "";
  if (href.startsWith("https://wa.me/")) {
    trackAnalyticsEvent("whatsapp_click");
  } else if (href.startsWith("mailto:")) {
    trackAnalyticsEvent("email_click");
  }
});

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
      trackAnalyticsEvent("form_submit_success");
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
