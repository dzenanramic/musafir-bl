document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(
    ".nav-link, .mobile-nav .nav-item, .view-all, .footer-links a, .explore-more-btn"
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

  // Load translations
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

  // Apply translations to the page
  async function applyTranslations(lang) {
    const translations = await loadTranslations(lang);

    // Update text elements
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (translations[key]) el.textContent = translations[key];
    });

    // Update nested objects (like prayer_names)
    document.querySelectorAll("[data-i18n-nested]").forEach((el) => {
      const [parent, child] = el.dataset.i18nNested.split(".");
      if (translations[parent] && translations[parent][child]) {
        el.textContent = translations[parent][child];
      }
    });

    // Update active language indicator
    document.querySelectorAll(".lang-option").forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.lang === lang) {
        option.classList.add("active");
      }
    });

    // Save language preference
    localStorage.setItem("language", lang);
    currentLanguage = lang;
  }

  // Switch pages function with History API
  function switchPage(pageId) {
    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    // Update active nav links
    document
      .querySelectorAll(".nav-link, .mobile-nav .nav-item")
      .forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId) {
          link.classList.add("active");
        }
      });

    // Update browser history and URL
    const pageTitle = `Halal Banja Luka - ${
      pageId.charAt(0).toUpperCase() + pageId.slice(1)
    }`;
    const newUrl = `${window.location.pathname}?page=${pageId}`;

    history.pushState({ page: pageId }, pageTitle, newUrl);
    document.title = pageTitle;

    mainNav.classList.remove("active");
    window.scrollTo(0, 0);
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

  // Toggle mobile navigation
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("active");
    });
  }

  // Add click listeners to nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.getAttribute("data-page");
      if (pageId) {
        switchPage(pageId);
      }
    });
  });

  // Prayer Time Highlighting (uses live times from DOM)
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
      // Remove previous highlight
      container
        .querySelectorAll(".prayer-time")
        .forEach((el) => el.classList.remove("active"));
      // Find next prayer
      let idx = times.findIndex((t) => t !== null && currentTime < t);
      if (idx === -1) idx = 0; // After last prayer, highlight Fajr
      const prayerEls = container.querySelectorAll(".prayer-time");
      if (prayerEls[idx]) prayerEls[idx].classList.add("active");
    });
  }

  // Wait for prayer times to be loaded, then start highlighting
  setTimeout(updateActivePrayer, 500); // Initial highlight after fetch
  setInterval(updateActivePrayer, 60000); // Update every minute

  // Tab Switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
      });
      this.classList.add("active");
    });
  });

  // Language Selector
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

// Fetch and display live prayer times for Banja Luka
async function fetchAndDisplayPrayerTimes() {
  try {
    const response = await fetch("https://api.vaktija.ba/vaktija/v1/1");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    // data.vakat: [fajr, sunrise, dhuhr, asr, maghrib, isha]
    // Update all .prayer-times blocks on the page
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
    // Optionally update Hijri date if present
    document.querySelectorAll(".hijri-date").forEach((el) => {
      if (data.datum && data.datum[0]) {
        el.textContent = data.datum[0];
      }
    });
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}

// Fetch prayer times on page load
document.addEventListener("DOMContentLoaded", fetchAndDisplayPrayerTimes);
