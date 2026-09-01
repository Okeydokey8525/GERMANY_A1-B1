// WEB_Germany Main Application Core Controller & Navigation Hub

class AppController {
  constructor() {
    this.currentTab = "dashboard";
    this.currentLevel = "A1";
    this.isLoading = true;
    
    this.initApp();
  }

  async initApp() {
    this.initTheme();
    this.initNavigation();
    this.initSettingsModal();
    this.initDailySummaryModal();
    this.initOnboarding();
    await this.loadAllDatasets();
    this.initResumeBtn();
    this.updateStats();
    
    // Check if first-time user
    const hasSeenOnboarding = localStorage.getItem("deutschmaster_onboarding_seen");
    if (!hasSeenOnboarding) {
      this.openOnboarding();
    }
  }

  initResumeBtn() {
    const resumeBtn = document.getElementById("dash-resume-btn");
    if (resumeBtn) {
      resumeBtn.addEventListener("click", () => {
        if (window.progressCtrl && window.progressCtrl.data.lastActivity) {
          const act = window.progressCtrl.data.lastActivity;
          this.switchTab(act.tab || "lessons");
          this.showToast(`Tiếp tục bài học: ${act.title || 'Nicos Weg'} 🚀`);
        } else {
          this.switchTab("lessons");
        }
      });
    }
  }

  initTheme() {
    const isDark = localStorage.getItem("web_germany_theme") === "dark" ||
      (!("web_germany_theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const currentlyDark = document.documentElement.classList.contains("dark");
        if (currentlyDark) {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("web_germany_theme", "light");
        } else {
          document.documentElement.classList.add("dark");
          localStorage.setItem("web_germany_theme", "dark");
        }
      });
    }
  }

  initNavigation() {
    // Top & Bottom Navigation buttons
    const navButtons = document.querySelectorAll(".nav-tab-btn, .bottom-nav-btn");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        if (tab) this.switchTab(tab);
      });
    });

    // Level selector dropdown/pills
    const levelSelector = document.getElementById("global-level-select");
    if (levelSelector) {
      levelSelector.addEventListener("change", (e) => {
        this.currentLevel = e.target.value;
        this.syncGlobalLevel(this.currentLevel);
      });
    }

    // Settings open button
    const btnSettings = document.getElementById("btn-open-settings");
    if (btnSettings) {
      btnSettings.addEventListener("click", () => this.openSettingsModal());
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Tab Contents
    document.querySelectorAll(".tab-content").forEach(el => {
      el.classList.remove("active");
    });
    const targetContent = document.getElementById(`tab-${tabId}`);
    if (targetContent) {
      targetContent.classList.add("active");
    }

    // Update Nav buttons styling
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const bTab = btn.getAttribute("data-tab");
      if (bTab === tabId) {
        btn.className = "nav-tab-btn px-4 py-2 rounded-2xl text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5";
      } else {
        btn.className = "nav-tab-btn px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5";
      }
    });

    // Update Bottom Nav buttons
    document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
      const bTab = btn.getAttribute("data-tab");
      if (bTab === tabId) {
        btn.className = "bottom-nav-btn flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[10px] transition-all";
      } else {
        btn.className = "bottom-nav-btn flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 font-medium text-[10px] hover:text-gray-700 dark:hover:text-gray-300 transition-all";
      }
    });

    // Sub-renders if needed
    if (tabId === "mistakes" && window.mistakesCtrl) {
      window.mistakesCtrl.renderMistakesList();
    } else if (tabId === "roadmap" && window.roadmapCtrl) {
      window.roadmapCtrl.renderRoadmap();
      window.roadmapCtrl.renderCanDoChecklist();
    } else if (tabId === "dashboard" && window.progressCtrl) {
      window.progressCtrl.updateUI();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  syncGlobalLevel(level) {
    if (window.flashcardCtrl) window.flashcardCtrl.setLevelFilter(level);
    if (window.lessonsCtrl) window.lessonsCtrl.switchLevel(level);
    if (window.examCtrl) window.examCtrl.switchLevel(level);
    if (window.progressCtrl) {
      window.progressCtrl.data.currentLevel = level;
      window.progressCtrl.saveProgress();
    }
  }

  async loadAllDatasets() {
    // Failsafe timeout to prevent infinite spinner on any network issue
    const failsafeTimer = setTimeout(() => {
      const loader = document.getElementById("app-global-loader");
      if (loader) loader.classList.add("hidden");
      this.isLoading = false;
    }, 2000);

    try {
      const [vocabTopics, vocab, grammar, grammarExercises, lessons, mockExams] = await Promise.all([
        fetch("./data/vocab_topics.json").then(r => r.json()).catch(() => []),
        fetch("./data/vocab_a1_b1.json").then(r => r.json()).catch(() => []),
        fetch("./data/grammar_data.json").then(r => r.json()).catch(() => ({})),
        fetch("./data/grammar_exercises.json").then(r => r.json()).catch(() => []),
        fetch("./data/lessons_data.json").then(r => r.json()).catch(() => ({ A1: [], A2: [], B1: [] })),
        fetch("./data/mock_exams.json").then(r => r.json()).catch(() => ({ A1: [], A2: [], B1: [] }))
      ]);

      // Distribute to controllers with try/catch isolation
      try { if (window.flashcardCtrl) window.flashcardCtrl.setData(vocab); } catch (e) { console.warn(e); }
      try { if (window.quizCtrl) window.quizCtrl.setData(vocab); } catch (e) { console.warn(e); }
      try { if (window.grammarCtrl) window.grammarCtrl.setData(grammar); } catch (e) { console.warn(e); }
      try { if (window.grammarExCtrl) window.grammarExCtrl.setData(grammarExercises); } catch (e) { console.warn(e); }
      try { if (window.lessonsCtrl) window.lessonsCtrl.setData(lessons); } catch (e) { console.warn(e); }
      try { if (window.examCtrl) window.examCtrl.setData(mockExams); } catch (e) { console.warn(e); }

    } catch (e) {
      console.error("Critical error loading datasets:", e);
      this.showToast("Đã tải dữ liệu dự phòng!");
    } finally {
      clearTimeout(failsafeTimer);
      this.isLoading = false;
      const loader = document.getElementById("app-global-loader");
      if (loader) loader.classList.add("hidden");
    }
  }

  updateStats() {
    if (window.progressCtrl) window.progressCtrl.updateUI();
    if (window.srsCtrl) window.srsCtrl.updateUI();
    if (window.mistakesCtrl) window.mistakesCtrl.updateBadge();
  }

  initSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const closeBtn = document.getElementById("btn-close-settings");
    const exportBtn = document.getElementById("btn-export-progress");
    const importInput = document.getElementById("import-progress-file");
    const speedSlider = document.getElementById("settings-speech-speed");
    const speedVal = document.getElementById("settings-speed-val");
    const dailyGoalSelect = document.getElementById("settings-daily-goal");
    const resetBtn = document.getElementById("btn-reset-all-data");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }

    if (exportBtn && window.progressCtrl) {
      exportBtn.addEventListener("click", () => window.progressCtrl.exportDataJSON());
    }

    if (importInput && window.progressCtrl) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            window.progressCtrl.importDataJSON(event.target.result);
          };
          reader.readAsText(file);
        }
      });
    }

    if (speedSlider && window.speechCtrl) {
      speedSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value) || 0.9;
        if (speedVal) speedVal.textContent = `${val.toFixed(1)}x`;
        window.speechCtrl.setSpeed(val);
      });
    }

    if (dailyGoalSelect && window.progressCtrl) {
      dailyGoalSelect.addEventListener("change", (e) => {
        const mins = parseInt(e.target.value) || 20;
        window.progressCtrl.data.dailyGoalMinutes = mins;
        window.progressCtrl.saveProgress();
      });
    }

    // Safe Namespace-based Reset (Never clears other origins' localStorage!)
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn đặt lại dữ liệu học tập của DeutschMaster?")) {
          const dmKeys = [
            "deutschmaster_user_progress_v4",
            "deutschmaster_user_progress_v3",
            "deutschmaster_srs_deck_v4",
            "deutschmaster_srs_deck_v3",
            "deutschmaster_mistakes_v3",
            "deutschmaster_onboarding_seen",
            "web_germany_theme"
          ];
          dmKeys.forEach(k => localStorage.removeItem(k));
          window.location.reload();
        }
      });
    }
  }

  initDailySummaryModal() {
    const modal = document.getElementById("daily-summary-modal");
    const closeBtn = document.getElementById("btn-close-summary");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
  }

  openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (!modal) return;

    if (window.progressCtrl) {
      const pData = window.progressCtrl.data;
      const speedSlider = document.getElementById("settings-speech-speed");
      const speedVal = document.getElementById("settings-speed-val");
      const dailyGoalSelect = document.getElementById("settings-daily-goal");

      if (speedSlider) speedSlider.value = pData.settings.speechRate || 0.9;
      if (speedVal) speedVal.textContent = `${(pData.settings.speechRate || 0.9).toFixed(1)}x`;
      if (dailyGoalSelect) dailyGoalSelect.value = pData.dailyGoalMinutes || 20;
    }

    modal.classList.remove("hidden");
  }

  initOnboarding() {
    const modal = document.getElementById("onboarding-modal");
    const startBtn = document.getElementById("btn-start-onboarding");
    if (startBtn && modal) {
      startBtn.addEventListener("click", () => {
        const levelRadio = document.querySelector("input[name='onboard_level']:checked");
        const goalRadio = document.querySelector("input[name='onboard_goal']:checked");
        const timeRadio = document.querySelector("input[name='onboard_time']:checked");

        if (window.progressCtrl) {
          if (levelRadio) window.progressCtrl.data.currentLevel = levelRadio.value;
          if (goalRadio) window.progressCtrl.data.targetGoal = goalRadio.value;
          if (timeRadio) window.progressCtrl.data.dailyGoalMinutes = parseInt(timeRadio.value) || 20;
          window.progressCtrl.saveProgress();
        }

        localStorage.setItem("deutschmaster_onboarding_seen", "true");
        modal.classList.add("hidden");
        this.showToast("Chào mừng bạn đến với DeutschMaster! Chúc bạn học thật tốt 🇩🇪");
      });
    }
  }

  openOnboarding() {
    const modal = document.getElementById("onboarding-modal");
    if (modal) modal.classList.remove("hidden");
  }

  showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast max-w-sm px-4 py-3 bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 text-xs sm:text-sm font-semibold rounded-2xl shadow-xl flex items-center gap-2 pointer-events-auto backdrop-blur-md";
    toast.innerHTML = `<span>🇩🇪</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px) scale(0.9)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.appCtrl = new AppController();
});
