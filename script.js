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

  // Prayer Time Highlighting
  function updateActivePrayer() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const prayerTimes = [
      { id: "fajr", time: 3 * 60 + 45 },
      { id: "sunrise", time: 5 * 60 + 20 },
      { id: "dhuhr", time: 12 * 60 + 45 },
      { id: "asr", time: 16 * 60 + 30 },
      { id: "maghrib", time: 19 * 60 + 50 },
      { id: "isha", time: 21 * 60 + 15 },
    ];

    document.querySelectorAll(".prayer-time").forEach((time) => {
      time.classList.remove("active");
    });

    let nextPrayer = null;
    for (const prayer of prayerTimes) {
      if (currentTime < prayer.time) {
        nextPrayer = prayer;
        break;
      }
    }

    if (!nextPrayer) {
      nextPrayer = prayerTimes[0]; // If after Isha, show Fajr
    }

    document
      .querySelector(
        `.prayer-time:nth-child(${prayerTimes.indexOf(nextPrayer) + 1})`
      )
      ?.classList.add("active");
  }

  updateActivePrayer();
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

// Prayer Time Fetching (Optional)
async function fetchPrayerTimes() {
  try {
    const response = await fetch("https://api.vaktija.ba/vaktija/v1/77");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Prayer Times:", data);
    return data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}

// Call if needed
// fetchPrayerTimes();
