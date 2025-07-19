document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll(
    ".nav-link, .mobile-nav .nav-item, .view-all, .footer-links a, .explore-more-btn"
  );
  const pages = document.querySelectorAll(".page");

  // Toggle mobile navigation
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("active");
    });
  }

  // Switch pages function
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

    mainNav.classList.remove("active");
    window.scrollTo(0, 0);
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
