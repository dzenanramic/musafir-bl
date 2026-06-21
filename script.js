document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const header = document.querySelector("header");
  const navLinks = document.querySelectorAll(
    ".nav-link, .mobile-nav .nav-item, .view-all, .footer-links a, .explore-more-btn",
  );
  const pages = document.querySelectorAll(".page");

  const translationCache = {};
  let currentLanguage = localStorage.getItem("language") || "en";

  // Language map
  const languageMap = {
    EN: "en",
    BS: "bs",
    TR: "tr",
    DE: "de",
  };

  // ========================================
  // HEADER SCROLL EFFECT
  // ========================================
  const headerWrapper = document.querySelector(".header-wrapper");

  function handleScroll() {
    if (window.scrollY > 10) {
      headerWrapper.classList.add("scrolled");
    } else {
      headerWrapper.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ========================================
  // MOBILE NAV TOGGLE
  // ========================================
  // Create overlay element
  const navOverlay = document.createElement("div");
  navOverlay.className = "nav-overlay";
  document.body.appendChild(navOverlay);

  // Convert hamburger icon to three lines
  const toggleIcon = navToggle.querySelector("i");
  if (toggleIcon) {
    // Replace Font Awesome icon with custom hamburger lines
    const lines = document.createElement("div");
    lines.className = "hamburger-lines";
    for (let i = 0; i < 3; i++) {
      const line = document.createElement("span");
      line.className = "hamburger-line";
      lines.appendChild(line);
    }
    toggleIcon.replaceWith(lines);
  }

  // Move #mainNav to body on mobile to fix Chrome bug where
  // position:fixed inside position:sticky breaks z-index stacking.
  // On mobile: nav at body level -> fixed z-index:102 > overlay z-index:101
  // On desktop: nav back in header-wrapper -> flex layout works normally
  function repositionNav() {
    const isMobile = window.innerWidth < 768;
    if (isMobile && mainNav.parentElement !== document.body) {
      document.body.appendChild(mainNav);
    } else if (!isMobile && mainNav.parentElement !== headerWrapper) {
      headerWrapper.appendChild(mainNav);
    }
  }
  repositionNav();
  window.addEventListener("resize", repositionNav);

  function toggleNav(open) {
    const isActive =
      open !== undefined ? open : !mainNav.classList.contains("active");
    mainNav.classList.toggle("active", isActive);
    navOverlay.classList.toggle("active", isActive);
    navToggle.classList.toggle("active", isActive);
    document.body.style.overflow = isActive ? "hidden" : "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      toggleNav();
    });
  }

  navOverlay.addEventListener("click", function () {
    toggleNav(false);
  });

  // Close nav on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav.classList.contains("active")) {
      toggleNav(false);
    }
  });

  // ========================================
  // TRANSLATIONS
  // ========================================
  async function loadTranslations(lang) {
    if (translationCache[lang]) return translationCache[lang];

    try {
      const response = await fetch(`lang/${lang}.json`);
      const translations = await response.json();
      translationCache[lang] = translations;
      return translations;
    } catch (error) {
      console.error("Failed to load translations:", error);
      return loadTranslations("en"); // Fallback to English
    }
  }

  async function applyTranslations(lang) {
    const translations = await loadTranslations(lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[key]) el.textContent = translations[key];
    });

    document.querySelectorAll("[data-i18n-nested]").forEach((el) => {
      const [parent, child] = el.dataset.i18nNested.split(".");
      if (translations[parent] && translations[parent][child]) {
        el.textContent = translations[parent][child];
      }
    });

    document.querySelectorAll(".lang-option").forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.lang === lang) {
        option.classList.add("active");
      }
    });

    localStorage.setItem("language", lang);
    currentLanguage = lang;
  }

  // ========================================
  // PAGE SWITCHING
  // ========================================
  function switchPage(pageId) {
    // Guard: if already on this page, just close nav and return
    const targetPage = document.getElementById(pageId);
    if (targetPage?.classList.contains("active")) {
      toggleNav(false);
      return;
    }

    pages.forEach((page) => {
      page.classList.remove("active");
    });

    if (targetPage) {
      targetPage.classList.add("active");
    }

    document
      .querySelectorAll(".nav-link, .mobile-nav .nav-item")
      .forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId) {
          link.classList.add("active");
        }
      });

    const seoTitles = {
      home: "Musafir Banja Luka - Muslim Travel Guide to Banja Luka, Bosnia",
      eat: "Halal Restaurants in Banja Luka - Muslim Dining Guide",
      see: "Muslim-Friendly Attractions in Banja Luka - See & Do",
      pray: "Mosques & Prayer Times in Banja Luka - Muslim Prayer Guide",
      essentials: "Essential Travel Guide for Muslims in Banja Luka",
    };
    const pageTitle =
      seoTitles[pageId] ||
      `Halal Banja Luka - ${pageId.charAt(0).toUpperCase() + pageId.slice(1)}`;
    const newUrl = `${window.location.pathname}?page=${pageId}`;

    history.pushState({ page: pageId }, pageTitle, newUrl);
    document.title = pageTitle;

    // Close mobile nav on page change
    toggleNav(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Handle back/forward navigation
  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.page) {
      switchPage(event.state.page);
    } else {
      switchPage("home");
    }
  });

  // Initialize page from URL
  function initializePageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get("page");

    if (pageParam && document.getElementById(pageParam)) {
      switchPage(pageParam);
    } else {
      switchPage("home");
    }
  }

  // Initialize translations and page
  applyTranslations(currentLanguage);
  initializePageFromURL();

  // Language selector event
  document.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", function () {
      const lang = this.dataset.lang;
      applyTranslations(lang);
    });
  });

  // Add click + touch listeners to nav links
  // On mobile, touchend fires even after scrolling, causing accidental navigation.
  // Solution: track touch start position and only navigate when it's a tap (minimal movement).
  navLinks.forEach((link) => {
    let touchStartX = 0;
    let touchStartY = 0;

    function handleNavAction(e) {
      const pageId = link.getAttribute("data-page");
      if (pageId) {
        e.preventDefault();
        switchPage(pageId);
      }
    }

    link.addEventListener("click", handleNavAction);

    // Track touch start position to distinguish tap from scroll
    link.addEventListener(
      "touchstart",
      function (e) {
        const touch = e.changedTouches[0];
        touchStartX = touch.screenX;
        touchStartY = touch.screenY;
      },
      { passive: true },
    );

    // Only navigate on touchend if finger didn't move much (i.e. it's a tap, not a scroll)
    link.addEventListener(
      "touchend",
      function (e) {
        const touch = e.changedTouches[0];
        const deltaX = Math.abs(touch.screenX - touchStartX);
        const deltaY = Math.abs(touch.screenY - touchStartY);

        // If finger moved more than 10px, it was a scroll/swipe — do not navigate
        if (deltaX > 10 || deltaY > 10) return;

        handleNavAction(e);
      },
      { passive: false },
    );
  });

  // ========================================
  // PRAYER TIME HIGHLIGHTING
  // ========================================
  function updateActivePrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    document.querySelectorAll(".prayer-times").forEach((container) => {
      const times = [];
      container.querySelectorAll(".prayer-time").forEach((el) => {
        const hourEl = el.querySelector(".prayer-hour");
        if (hourEl) {
          const [h, m] = hourEl.textContent.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            times.push(h * 60 + m);
          } else {
            times.push(null);
          }
        } else {
          times.push(null);
        }
      });

      container
        .querySelectorAll(".prayer-time")
        .forEach((el) => el.classList.remove("active"));

      let idx = times.findIndex((t) => t !== null && currentTime < t);
      if (idx === -1) idx = 0;

      const prayerEls = container.querySelectorAll(".prayer-time");
      if (prayerEls[idx]) prayerEls[idx].classList.add("active");
    });
  }

  setTimeout(updateActivePrayer, 500);
  setInterval(updateActivePrayer, 60000);

  // ========================================
  // TAB SWITCHING
  // ========================================
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
      });
      this.classList.add("active");
    });
  });

  // ========================================
  // LANGUAGE SELECTOR (footer)
  // ========================================
  document.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.querySelectorAll(".lang-option").forEach((opt) => {
        opt.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
});

// ========================================
// FETCH PRAYER TIMES
// ========================================
async function fetchAndDisplayPrayerTimes() {
  try {
    const response = await fetch("https://api.vaktija.ba/vaktija/v1/1");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    document.querySelectorAll(".prayer-times").forEach((container) => {
      const vakat = data.vakat;
      const prayerOrder = [
        "Fajr",
        "Sunrise",
        "Dhuhr",
        "Asr",
        "Maghrib",
        "Isha",
      ];
      container.querySelectorAll(".prayer-time").forEach((el, idx) => {
        const nameEl = el.querySelector(".prayer-name");
        const hourEl = el.querySelector(".prayer-hour");
        if (nameEl && hourEl && vakat[idx]) {
          hourEl.textContent = vakat[idx];
        }
      });
    });

    document.querySelectorAll(".hijri-date").forEach((el) => {
      if (data.datum && data.datum[0]) {
        el.textContent = data.datum[0];
      }
    });
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayPrayerTimes);
