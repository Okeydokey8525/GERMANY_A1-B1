// WEB_Germany Main Application Core & State Management

class AppController {
  constructor() {
    this.currentTab = "flashcards";
    this.currentGlobalLevel = "A1";
    this.streak = 1;
    this.isDarkMode = false;
    
    this.initApp();
  }

  async initApp() {
    this.initTheme();
    this.initStreak();
    this.initNavigation();
    this.initGlobalLevelSelector();
    await this.loadAllData();
    this.updateStats();
    
    // Initialize Lucide icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // -------------------------------------------------------------
  // Theme Management (Dark / Light)
  // -------------------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem("web_germany_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    this.isDarkMode = savedTheme ? (savedTheme === "dark") : systemPrefersDark;
    this.applyTheme();

    const themeToggleBtn = document.getElementById("btn-toggle-theme");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem("web_germany_theme", this.isDarkMode ? "dark" : "light");
        this.applyTheme();
      });
    }
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const iconSun = document.getElementById("theme-icon-sun");
    const iconMoon = document.getElementById("theme-icon-moon");
    if (iconSun && iconMoon) {
      iconSun.classList.toggle("hidden", !this.isDarkMode);
      iconMoon.classList.toggle("hidden", this.isDarkMode);
    }
  }

  // -------------------------------------------------------------
  // Daily Streak Calculator
  // -------------------------------------------------------------
  initStreak() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const lastVisit = localStorage.getItem("web_germany_last_visit");
      let currentStreak = parseInt(localStorage.getItem("web_germany_streak") || "1", 10);

      if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }

      localStorage.setItem("web_germany_last_visit", today);
      localStorage.setItem("web_germany_streak", currentStreak.toString());
      this.streak = currentStreak;

      const streakEl = document.getElementById("header-streak-count");
      if (streakEl) streakEl.textContent = this.streak;
    } catch (e) {
      this.streak = 1;
    }
  }

  // -------------------------------------------------------------
  // Global Level Selector
  // -------------------------------------------------------------
  initGlobalLevelSelector() {
    const selector = document.getElementById("global-level-select");
    if (selector) {
      selector.addEventListener("change", (e) => {
        this.currentGlobalLevel = e.target.value;
        this.syncGlobalLevel();
      });
    }
  }

  syncGlobalLevel() {
    if (window.flashcardCtrl) window.flashcardCtrl.setLevelFilter(this.currentGlobalLevel);
    if (window.lessonsCtrl && this.currentGlobalLevel !== "ALL") window.lessonsCtrl.switchLevel(this.currentGlobalLevel);
    if (window.examCtrl && this.currentGlobalLevel !== "ALL") window.examCtrl.selectExamLevel(this.currentGlobalLevel);
    this.showToast(`Đã chuyển sang cấp độ: ${this.currentGlobalLevel}`);
  }

  // -------------------------------------------------------------
  // Navigation & Tab Switching
  // -------------------------------------------------------------
  initNavigation() {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tabId = btn.getAttribute("data-tab");
        if (tabId) this.switchTab(tabId);
      });
    });
  }

  switchTab(tabKey) {
    this.currentTab = tabKey;

    // Hide all tab contents and show selected
    document.querySelectorAll(".tab-content").forEach(el => {
      el.classList.remove("active");
    });
    const targetContent = document.getElementById(`tab-${tabKey}`);
    if (targetContent) targetContent.classList.add("active");

    // Update Bottom & Top Nav styling
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const isCurrent = (btn.getAttribute("data-tab") === tabKey);
      if (isCurrent) {
        btn.classList.add("text-blue-600", "dark:text-blue-400", "font-bold");
        btn.classList.remove("text-gray-500", "dark:text-gray-400");
      } else {
        btn.classList.remove("text-blue-600", "dark:text-blue-400", "font-bold");
        btn.classList.add("text-gray-500", "dark:text-gray-400");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // -------------------------------------------------------------
  // Data Loader
  // -------------------------------------------------------------
  async loadAllData() {
    try {
      const [vTopics, vA1B1, gData, gExercises, lData, eData] = await Promise.all([
        fetch("./data/vocab_topics.json").then(r => r.json()),
        fetch("./data/vocab_a1_b1.json").then(r => r.json()),
        fetch("./data/grammar_data.json").then(r => r.json()),
        fetch("./data/grammar_exercises.json").then(r => r.json()),
        fetch("./data/lessons_data.json").then(r => r.json()),
        fetch("./data/mock_exams.json").then(r => r.json()),
      ]);

      if (window.flashcardCtrl) window.flashcardCtrl.setData(vA1B1);
      if (window.quizCtrl) window.quizCtrl.setData(vA1B1);
      if (window.grammarCtrl) window.grammarCtrl.setData(gData);
      if (window.grammarExCtrl) window.grammarExCtrl.setData(gExercises);
      if (window.lessonsCtrl) window.lessonsCtrl.setData(lData);
      if (window.examCtrl) window.examCtrl.setData(eData);

      console.log("All German learning datasets loaded successfully.");
    } catch (e) {
      console.error("Error loading application data:", e);
      this.showToast("Không thể nạp dữ liệu offline. Đang dùng bộ nhớ cache.");
    }
  }

  updateStats() {
    try {
      const mastered = JSON.parse(localStorage.getItem("web_germany_mastered_words") || "[]");
      const completed = JSON.parse(localStorage.getItem("web_germany_completed_lessons") || "[]");

      const masteredEl = document.getElementById("stat-mastered-words");
      const completedEl = document.getElementById("stat-completed-lessons");
      
      if (masteredEl) masteredEl.textContent = mastered.length;
      if (completedEl) completedEl.textContent = completed.length;
    } catch (e) {}
  }

  showToast(message, duration = 2500) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast px-4 py-2.5 rounded-2xl bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/10 dark:border-gray-900/10";
    toast.innerHTML = `<span>🇩🇪</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.appCtrl = new AppController();
});
