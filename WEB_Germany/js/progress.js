// WEB_Germany Unified Learning Progress & Live Study Engine

class ProgressController {
  constructor() {
    this.storageKey = "deutschmaster_user_progress_v3";
    this.data = this.getDefaultData();
    this.timerInterval = null;
    this.isTimerActive = false;
    
    this.loadProgress();
    this.checkDayRollOver();
    this.initStudyTimer();
  }

  getDefaultData() {
    const today = this.getLocalDateString();
    return {
      version: 3,
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
        actualSeconds: 0,
        vocabReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        quizDone: 0,
        isGoalMet: false
      },
      history: {}, // { 'YYYY-MM-DD': { minutes, itemsCount, goalMet } }
      skills: {
        vocab: { score: 20, correct: 0, total: 0 },
        grammar: { score: 15, correct: 0, total: 0 },
        listening: { score: 15, correct: 0, total: 0 },
        reading: { score: 15, correct: 0, total: 0 },
        speaking: { score: 10, correct: 0, total: 0 },
        writing: { score: 10, correct: 0, total: 0 }
      },
      completedLessons: [], // ['A1-01', 'A1-02']
      lastActivity: {
        type: "lesson",
        id: "A1-01",
        title: "01-Hallo! - Chào hỏi & Làm quen",
        tab: "lessons",
        timestamp: Date.now()
      },
      canDoChecklist: {}, // { 'cd_01': 'tested' | 'learning' | 'unlearned' }
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
      if (this.data.today.date) {
        this.data.history[this.data.today.date] = {
          minutes: Math.round((this.data.today.actualSeconds || 0) / 60),
          itemsCount: (this.data.today.vocabReviewed || 0) + (this.data.today.grammarDone || 0) + (this.data.today.lessonsDone || 0),
          goalMet: this.data.today.isGoalMet
        };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.getLocalDateString(yesterday);

      if (this.data.streak.lastCompletedDate !== yesterdayStr && this.data.streak.lastCompletedDate !== todayStr) {
        const lastDate = new Date(this.data.streak.lastCompletedDate);
        const diffDays = Math.round((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          this.data.streak.current = 0;
        }
      }

      this.data.today = {
        date: todayStr,
        actualSeconds: 0,
        vocabReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        quizDone: 0,
        isGoalMet: false
      };
      this.saveProgress();
    }
  }

  // Live Study Session Timer
  initStudyTimer() {
    // Increment active study timer every second if user is active
    let lastActivityTime = Date.now();
    
    const recordUserActivity = () => {
      lastActivityTime = Date.now();
    };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, recordUserActivity, { passive: true });
    });

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      // If active in last 60 seconds
      if (Date.now() - lastActivityTime < 60000) {
        this.data.today.actualSeconds = (this.data.today.actualSeconds || 0) + 1;
        
        // Save periodically every 30 seconds
        if (this.data.today.actualSeconds % 30 === 0) {
          this.checkDailyGoalCompletion();
          this.saveProgress();
        }
      }
    }, 1000);
  }

  checkDailyGoalCompletion() {
    const minutes = Math.round((this.data.today.actualSeconds || 0) / 60);
    const target = this.data.dailyGoalMinutes || 20;

    if (minutes >= target && !this.data.today.isGoalMet) {
      this.data.today.isGoalMet = true;
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
  }

  recordActivity(type, isCorrect = true) {
    this.checkDayRollOver();
    const today = this.data.today;

    if (type === "vocab") {
      today.vocabReviewed += 1;
      this.updateSkillScore("vocab", isCorrect);
    } else if (type === "grammar") {
      today.grammarDone += 1;
      this.updateSkillScore("grammar", isCorrect);
    } else if (type === "lesson") {
      today.lessonsDone += 1;
      this.updateSkillScore("listening", isCorrect);
      this.updateSkillScore("reading", isCorrect);
    } else if (type === "speaking") {
      today.speakingDone += 1;
      this.updateSkillScore("speaking", isCorrect);
    } else if (type === "quiz") {
      today.quizDone += 1;
      this.updateSkillScore("writing", isCorrect);
    }

    this.checkDailyGoalCompletion();
    this.saveProgress();
  }

  updateSkillScore(skill, isCorrect) {
    if (!this.data.skills[skill]) {
      this.data.skills[skill] = { score: 10, correct: 0, total: 0 };
    }
    const sk = this.data.skills[skill];
    sk.total += 1;
    if (isCorrect) sk.correct += 1;

    const accuracy = sk.total > 0 ? (sk.correct / sk.total) : 0.5;
    const baseProgress = Math.min(100, Math.round((sk.total * 2) * accuracy));
    sk.score = Math.max(10, Math.min(100, baseProgress));
  }

  markLessonComplete(lessonId) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
      this.recordActivity("lesson", true);
      this.saveProgress();
      if (window.appCtrl) {
        window.appCtrl.showToast(`Đã hoàn thành bài học ${lessonId}! 🎉`);
      }
    }
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

  // Identify Weak Areas based on mistakes
  getWeakAreas() {
    if (!window.mistakesCtrl) return [];
    const mistakes = window.mistakesCtrl.mistakes || [];
    const topicCount = {};

    mistakes.forEach(m => {
      const top = m.topic || "Ngữ pháp";
      topicCount[top] = (topicCount[top] || 0) + 1;
    });

    const sorted = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sorted.map(([topic, count]) => ({
      topic,
      count,
      advice: `Bạn đã làm sai ${count} lần ở chủ điểm này. Hãy luyện tập lại ngay!`
    }));
  }

  // Generate Personalized Today Learning Queue
  getTodayQueue() {
    const queue = [];
    const srsDue = window.srsCtrl ? window.srsCtrl.getCounts().due : 0;
    const weak = this.getWeakAreas();

    // Step 1: SRS Flashcard Review
    queue.push({
      id: "q_srs",
      icon: "🧠",
      title: "Ôn tập Thẻ nhớ SRS",
      desc: srsDue > 0 ? `${srsDue} từ vựng đến hạn cần ôn` : "Ôn tập 10 từ vựng cốt lõi",
      tab: "flashcards",
      badge: srsDue > 0 ? `${srsDue} từ` : "10 từ"
    });

    // Step 2: Next Lesson in Nicos Weg
    const nextLessonNum = (this.data.completedLessons.length + 1);
    queue.push({
      id: "q_lesson",
      icon: "📖",
      title: "Bài học Nicos Weg",
      desc: `Bài A1-${String(nextLessonNum).padStart(2, '0')} theo kịch bản Deutsche Welle`,
      tab: "lessons",
      badge: "Kịch bản"
    });

    // Step 3: Weak area drill or Grammar
    if (weak.length > 0) {
      queue.push({
        id: "q_weak",
        icon: "⚡",
        title: `Ôn điểm yếu: ${weak[0].topic}`,
        desc: weak[0].advice,
        tab: "mistakes",
        badge: "Khắc phục"
      });
    } else {
      queue.push({
        id: "q_grammar",
        icon: "📊",
        title: "Luyện ngữ pháp Cornelsen",
        desc: "Bài tập điền từ Modalverben & Kasus",
        tab: "grammar",
        badge: "Ngữ pháp"
      });
    }

    // Step 4: Speaking Drill
    queue.push({
      id: "q_speak",
      icon: "🗣️",
      title: "Luyện phát âm & Nói",
      desc: "Nhận diện giọng nói chuẩn tiếng Đức qua micro",
      tab: "speaking",
      badge: "Giao tiếp"
    });

    return queue;
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
    // Update Header Streak
    const streakDisplay = document.getElementById("header-streak-count");
    if (streakDisplay) {
      streakDisplay.textContent = this.data.streak.current || 0;
    }

    // Update Dashboard Metrics
    const minutes = Math.round((this.data.today.actualSeconds || 0) / 60);
    const target = this.data.dailyGoalMinutes || 20;

    const dashTodayMins = document.getElementById("dash-today-mins");
    if (dashTodayMins) dashTodayMins.textContent = `${minutes} / ${target} phút`;

    const dashTodayBar = document.getElementById("dash-today-bar");
    if (dashTodayBar) {
      const pct = Math.min(100, (minutes / target) * 100);
      dashTodayBar.style.width = `${pct}%`;
    }

    // Render Skills Matrix
    for (const [skill, val] of Object.entries(this.data.skills)) {
      const score = val.score !== undefined ? val.score : val;
      const bar = document.getElementById(`skill-bar-${skill}`);
      const txt = document.getElementById(`skill-val-${skill}`);
      if (bar) bar.style.width = `${Math.round(score)}%`;
      if (txt) txt.textContent = `${Math.round(score)}%`;
    }

    // Render Weak Areas on Dashboard
    this.renderWeakAreasUI();

    // Render Today Queue on Dashboard
    this.renderTodayQueueUI();
  }

  renderWeakAreasUI() {
    const container = document.getElementById("dash-weak-areas-container");
    if (!container) return;

    const weak = this.getWeakAreas();
    if (weak.length === 0) {
      container.innerHTML = `
        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <span>✓ Năng lực rất đồng đều! Bạn chưa có điểm yếu nào cần cảnh báo.</span>
          <span class="font-bold">100% Tốt</span>
        </div>
      `;
      return;
    }

    container.innerHTML = weak.map(w => `
      <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs flex items-center justify-between gap-3">
        <div>
          <span class="font-bold text-amber-900 dark:text-amber-200">⚠️ ${w.topic}</span>
          <span class="text-amber-700 dark:text-amber-300 ml-1.5 font-semibold">(${w.count} lỗi)</span>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">${w.advice}</p>
        </div>
        <button onclick="window.appCtrl && window.appCtrl.switchTab('mistakes')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 shadow-xs">
          Luyện ngay →
        </button>
      </div>
    `).join("");
  }

  renderTodayQueueUI() {
    const container = document.getElementById("dash-today-queue-container");
    if (!container) return;

    const queue = this.getTodayQueue();
    container.innerHTML = queue.map((item, idx) => `
      <div class="p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer" onclick="window.appCtrl && window.appCtrl.switchTab('${item.tab}')">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-black shadow-2xs shrink-0">
            ${item.icon}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-gray-400 font-mono">#${idx + 1}</span>
              <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100">${item.title}</h4>
              <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">${item.badge}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.desc}</p>
          </div>
        </div>
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:translate-x-0.5 transition-all">Bắt đầu →</span>
      </div>
    `).join("");
  }
}

window.progressCtrl = new ProgressController();
