// WEB_Germany Unified Learning Progress & Statistics Engine

class ProgressController {
  constructor() {
    this.storageKey = "deutschmaster_user_progress_v2";
    this.data = this.getDefaultData();
    this.loadProgress();
    this.checkDayRollOver();
  }

  getDefaultData() {
    const today = this.getLocalDateString();
    return {
      version: 2,
      userName: "Học viên DeutschMaster",
      currentLevel: "A1",
      targetGoal: "allgemein", // 'travel', 'study', 'goethe', 'telc', 'allgemein'
      dailyGoalMinutes: 20,
      streak: {
        current: 0,
        best: 0,
        lastCompletedDate: ""
      },
      today: {
        date: today,
        minutesSpent: 0,
        vocabReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        isGoalMet: false
      },
      history: {}, // { 'YYYY-MM-DD': { minutes, itemsCount, goalMet } }
      skills: {
        vocab: 15,
        grammar: 10,
        listening: 10,
        reading: 10,
        speaking: 5,
        writing: 5
      },
      lastActivity: {
        type: "lesson",
        id: "A1-01",
        title: "01-Hallo! - Chào hỏi & Làm quen",
        tab: "lessons",
        timestamp: Date.now()
      },
      canDoChecklist: {}, // { 'a1_greet': true, 'a1_numbers': false }
      settings: {
        speechRate: 0.9,
        autoPronounce: true,
        soundFx: true,
        showPhonetic: true,
        theme: "light"
      }
    };
  }

  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = Object.assign(this.getDefaultData(), parsed);
      }
    } catch (e) {
      console.warn("Failed to load progress from localStorage:", e);
      this.data = this.getDefaultData();
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this.updateUI();
    } catch (e) {
      console.error("Failed to save progress to localStorage:", e);
    }
  }

  checkDayRollOver() {
    const todayStr = this.getLocalDateString();
    if (this.data.today.date !== todayStr) {
      // Save yesterday to history
      if (this.data.today.date) {
        this.data.history[this.data.today.date] = {
          minutes: this.data.today.minutesSpent,
          itemsCount: this.data.today.vocabReviewed + this.data.today.grammarDone + this.data.today.lessonsDone,
          goalMet: this.data.today.isGoalMet
        };
      }

      // Check streak continuity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.getLocalDateString(yesterday);

      if (this.data.streak.lastCompletedDate !== yesterdayStr && this.data.streak.lastCompletedDate !== todayStr) {
        // Streak broken if yesterday was not completed
        if (this.data.streak.lastCompletedDate !== yesterdayStr) {
          // If missed more than 1 day, reset streak
          const lastDate = new Date(this.data.streak.lastCompletedDate);
          const diffDays = Math.round((new Date() - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            this.data.streak.current = 0;
          }
        }
      }

      // Reset today
      this.data.today = {
        date: todayStr,
        minutesSpent: 0,
        vocabReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        isGoalMet: false
      };
      this.saveProgress();
    }
  }

  recordActivity(type, points = 1) {
    this.checkDayRollOver();
    const today = this.data.today;

    if (type === "vocab") {
      today.vocabReviewed += points;
      this.data.skills.vocab = Math.min(100, this.data.skills.vocab + 0.5);
    } else if (type === "grammar") {
      today.grammarDone += points;
      this.data.skills.grammar = Math.min(100, this.data.skills.grammar + 1);
    } else if (type === "lesson") {
      today.lessonsDone += points;
      this.data.skills.listening = Math.min(100, this.data.skills.listening + 1.5);
      this.data.skills.reading = Math.min(100, this.data.skills.reading + 1);
    } else if (type === "speaking") {
      today.speakingDone += points;
      this.data.skills.speaking = Math.min(100, this.data.skills.speaking + 2);
    }

    // Rough estimation: each activity adds ~0.5 - 1 min
    today.minutesSpent = Math.round((today.vocabReviewed * 0.3) + (today.grammarDone * 1.2) + (today.lessonsDone * 3) + (today.speakingDone * 1));

    // Check if goal met
    const target = this.data.dailyGoalMinutes;
    if (today.minutesSpent >= target && !today.isGoalMet) {
      today.isGoalMet = true;
      const todayStr = this.getLocalDateString();
      if (this.data.streak.lastCompletedDate !== todayStr) {
        this.data.streak.current += 1;
        this.data.streak.lastCompletedDate = todayStr;
        if (this.data.streak.current > this.data.streak.best) {
          this.data.streak.best = this.data.streak.current;
        }
        if (window.appCtrl) {
          window.appCtrl.showToast(`🔥 Tuyệt vời! Bạn đã hoàn thành Mục tiêu Ngày & đạt Streak ${this.data.streak.current} ngày!`);
        }
      }
    }

    this.saveProgress();
  }

  setLastActivity(type, id, title, tab) {
    this.data.lastActivity = {
      type,
      id,
      title,
      tab,
      timestamp: Date.now()
    };
    this.saveProgress();
  }

  toggleCanDo(id) {
    this.data.canDoChecklist[id] = !this.data.canDoChecklist[id];
    this.saveProgress();
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `deutschmaster_tien_do_${this.getLocalDateString()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  }

  importDataJSON(fileContent) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed && typeof parsed === "object") {
        this.data = Object.assign(this.getDefaultData(), parsed);
        this.saveProgress();
        if (window.appCtrl) window.appCtrl.showToast("Đã khôi phục tiến độ học tập thành công! 🎉");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (e) {
      alert("File dữ liệu không hợp lệ! Vui lòng chọn đúng file .json đã xuất từ DeutschMaster.");
    }
  }

  updateUI() {
    // Update Streak Badge
    const streakDisplay = document.getElementById("header-streak-count");
    if (streakDisplay) {
      streakDisplay.textContent = this.data.streak.current || 0;
    }

    // Update Dashboard Elements if active
    const dashStreak = document.getElementById("dash-streak-days");
    if (dashStreak) dashStreak.textContent = `${this.data.streak.current || 0} ngày`;

    const dashTodayMins = document.getElementById("dash-today-mins");
    if (dashTodayMins) dashTodayMins.textContent = `${this.data.today.minutesSpent} / ${this.data.dailyGoalMinutes} phút`;

    const dashTodayBar = document.getElementById("dash-today-bar");
    if (dashTodayBar) {
      const pct = Math.min(100, (this.data.today.minutesSpent / this.data.dailyGoalMinutes) * 100);
      dashTodayBar.style.width = `${pct}%`;
    }

    // Update Skills progress bars
    for (const [skill, val] of Object.entries(this.data.skills)) {
      const bar = document.getElementById(`skill-bar-${skill}`);
      const txt = document.getElementById(`skill-val-${skill}`);
      if (bar) bar.style.width = `${Math.round(val)}%`;
      if (txt) txt.textContent = `${Math.round(val)}%`;
    }

    // Update Resume card
    const resumeTitle = document.getElementById("dash-resume-title");
    const resumeBtn = document.getElementById("dash-resume-btn");
    if (resumeTitle && this.data.lastActivity) {
      resumeTitle.textContent = this.data.lastActivity.title;
    }
    if (resumeBtn && this.data.lastActivity) {
      resumeBtn.onclick = () => {
        if (window.appCtrl) window.appCtrl.switchTab(this.data.lastActivity.tab);
      };
    }
  }
}

window.progressCtrl = new ProgressController();
