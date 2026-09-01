// WEB_Germany Mistake Notebook (Sổ tay lỗi sai - Fehlerbuch) with Error Pattern Detection & Direct Objective Routing

class MistakesController {
  constructor() {
    this.storageKey = "deutschmaster_mistakes_v3";
    this.mistakes = [];
    this.currentFilter = "ALL";
    this.loadMistakes();
    this.initElements();
  }

  loadMistakes() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.mistakes = JSON.parse(raw);
      }
    } catch (e) {
      this.mistakes = [];
    }
  }

  saveMistakes() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mistakes));
      this.renderMistakesList();
      this.updateBadge();
    } catch (e) {
      console.error("Failed to save mistakes:", e);
    }
  }

  initElements() {
    const btnClear = document.getElementById("btn-clear-mistakes");
    const btnPractice = document.getElementById("btn-practice-mistakes");

    if (btnClear) btnClear.addEventListener("click", () => this.clearAllMistakes());
    if (btnPractice) btnPractice.addEventListener("click", () => this.startPracticeMistakes());

    // Filter Buttons
    document.querySelectorAll(".mistake-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const filter = btn.getAttribute("data-filter");
        this.setFilter(filter);
      });
    });
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll(".mistake-filter-btn").forEach(b => {
      const isSelected = b.getAttribute("data-filter") === filter;
      if (isSelected) {
        b.className = "mistake-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs transition-all";
      } else {
        b.className = "mistake-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
      }
    });
    this.renderMistakesList();
  }

  detectErrorPattern(item) {
    const q = (item.question || "").toLowerCase();
    const user = (item.userAnswer || "").toLowerCase();
    const corr = (item.correctAnswer || "").toLowerCase();

    if (corr.includes("den") && (user.includes("der") || user.includes("dem"))) {
      return { id: "AKKUSATIV_ARTIKEL", name: "Nhầm lẫn mạo từ Akkusativ (der ➔ den)", objectiveId: "LO_AKK_02", topicId: "akkusativ" };
    }
    if (corr.includes("dem") && (user.includes("den") || user.includes("der"))) {
      return { id: "DATIV_ARTIKEL", name: "Nhầm lẫn mạo từ Dativ (der/das ➔ dem)", objectiveId: "LO_DAT_02", topicId: "dativ" };
    }
    if (corr.includes("einen") && user.includes("ein")) {
      return { id: "AKKUSATIV_INDEF", name: "Quán từ không xác định Akkusativ (ein ➔ einen)", objectiveId: "LO_AKK_03", topicId: "akkusativ" };
    }
    if (q.includes("trật tự") || q.includes("v2")) {
      return { id: "V2_WORD_ORDER", name: "Quy tắc vị trí động từ V2 / Satzklammer", objectiveId: "LO_W_02", topicId: "w_fragen" };
    }
    if (item.type === "article") {
      return { id: "GENUS_CONFUSION", name: "Nhầm giống danh từ (der/die/das)", objectiveId: "LO_ART_01", topicId: "artikel" };
    }
    return { id: "GENERAL_GRAMMAR", name: "Ngữ pháp tổng quát", objectiveId: item.objectiveId || "LO_PRAES_01", topicId: item.topicId || "praesens" };
  }

  addMistake(item) {
    const idx = this.mistakes.findIndex(m => m.id === item.id || (m.question === item.question && m.type === item.type));
    const pattern = this.detectErrorPattern(item);

    const newEntry = {
      id: item.id || `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: item.type || "vocab",
      level: item.level || (window.progressCtrl ? window.progressCtrl.data.currentLevel : "A1"),
      question: item.question,
      userAnswer: item.userAnswer || "Chưa chính xác",
      correctAnswer: item.correctAnswer,
      explanation: item.explanation || "",
      topic: item.topic || "Chung",
      topicId: item.topicId || pattern.topicId,
      objectiveId: item.objectiveId || pattern.objectiveId,
      errorPattern: pattern,
      timestamp: Date.now(),
      mistakeCount: 1
    };

    if (idx !== -1) {
      this.mistakes[idx].mistakeCount = (this.mistakes[idx].mistakeCount || 1) + 1;
      this.mistakes[idx].userAnswer = item.userAnswer;
      this.mistakes[idx].timestamp = Date.now();
      if (!this.mistakes[idx].objectiveId && newEntry.objectiveId) {
        this.mistakes[idx].objectiveId = newEntry.objectiveId;
        this.mistakes[idx].topicId = newEntry.topicId;
      }
    } else {
      this.mistakes.unshift(newEntry);
    }

    if (this.mistakes.length > 150) {
      this.mistakes = this.mistakes.slice(0, 150);
    }

    this.saveMistakes();
  }

  removeMistake(id) {
    this.mistakes = this.mistakes.filter(m => m.id !== id);
    this.saveMistakes();
  }

  clearAllMistakes() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách lỗi sai đã lưu?")) {
      this.mistakes = [];
      this.saveMistakes();
      if (window.appCtrl) window.appCtrl.showToast("Đã dọn sạch sổ tay lỗi sai!");
    }
  }

  startPracticeMistakes() {
    const targetMistakes = this.currentFilter === "ALL" 
      ? this.mistakes 
      : this.mistakes.filter(m => m.type === this.currentFilter);

    if (targetMistakes.length === 0) {
      if (window.appCtrl) window.appCtrl.showToast("Không có lỗi sai nào trong bộ lọc này!");
      return;
    }

    // Route to Article Sprint
    if (this.currentFilter === "article" || (this.currentFilter === "ALL" && targetMistakes.every(m => m.type === "article"))) {
      const articlePool = targetMistakes.map(m => {
        const nounClean = m.question.replace(/^Mạo từ của danh từ\s+"/i, '').replace(/"$/, '').trim();
        const artMatch = m.correctAnswer.match(/^(der|die|das)/i);
        const art = artMatch ? artMatch[0].toLowerCase() : "der";
        return {
          id: m.id,
          word: nounClean,
          article: art,
          meaning_vi: `Mạo từ: ${art}`,
          topic: "Ôn lỗi sai Mạo từ",
          topicId: "artikel",
          objectiveId: "LO_ART_01"
        };
      });

      if (window.quizCtrl) {
        window.quizCtrl.setData(articlePool);
        window.quizCtrl.switchMode("article");
        if (window.appCtrl) {
          window.appCtrl.switchTab("quiz");
          window.appCtrl.showToast(`Bắt đầu Der/Die/Das Sprint cho ${articlePool.length} danh từ bạn hay nhầm! ⚡`);
        }
      }
      return;
    }

    // Default: Route to Quiz practice
    const customPool = targetMistakes.map(m => {
      const cleanWord = m.question.replace(/^(der|die|das)\s+/i, '').trim();
      const artMatch = m.question.match(/^(der|die|das)\s+/i);
      const article = artMatch ? artMatch[1].toLowerCase() : "";

      return {
        id: m.id,
        word: cleanWord,
        article: article,
        meaning_vi: m.correctAnswer,
        topic: m.topic,
        topic_vi: `Lỗi sai: ${m.topic}`,
        topicId: m.topicId || "artikel",
        objectiveId: m.objectiveId || "LO_ART_01",
        level: m.level || "A1"
      };
    });

    if (window.quizCtrl) {
      window.quizCtrl.setData(customPool);
      window.quizCtrl.switchMode("mc");
      if (window.appCtrl) {
        window.appCtrl.switchTab("quiz");
        window.appCtrl.showToast(`Bắt đầu luyện tập ${customPool.length} câu lỗi sai! 🔥`);
      }
    }
  }

  // Direct practice routing for a specific Learning Objective from a mistake card
  practiceObjective(objId, topicId) {
    if (window.appCtrl) {
      if (topicId === "artikel" && objId === "LO_ART_01") {
        window.appCtrl.switchTab("quiz");
        if (window.quizCtrl) window.quizCtrl.switchMode("article");
      } else if (topicId === "w_fragen" || topicId === "nebensaetze" || topicId === "passiv") {
        window.appCtrl.switchTab("sentence");
      } else {
        window.appCtrl.switchTab("grammar");
      }
      window.appCtrl.showToast(`Mở bài luyện tập trọng tâm cho mục tiêu: ${objId}! 🎯`);
    }
  }

  renderMistakesList() {
    const container = document.getElementById("mistakes-list-container");
    const countBadge = document.getElementById("mistakes-count-badge");
    const emptyState = document.getElementById("mistakes-empty-state");

    const filtered = this.currentFilter === "ALL" 
      ? this.mistakes 
      : this.mistakes.filter(m => m.type === this.currentFilter);

    if (countBadge) countBadge.textContent = `${filtered.length} lỗi`;
    if (!container) return;

    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
      container.innerHTML = "";
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = "";

    // Check for detected recurring error patterns
    const patternCounts = {};
    filtered.forEach(m => {
      if (m.errorPattern && m.errorPattern.id) {
        patternCounts[m.errorPattern.id] = (patternCounts[m.errorPattern.id] || 0) + 1;
      }
    });

    // Render Pattern Alert if frequent
    Object.keys(patternCounts).forEach(patKey => {
      if (patternCounts[patKey] >= 2) {
        const sampleMistake = filtered.find(m => m.errorPattern && m.errorPattern.id === patKey);
        if (sampleMistake) {
          const alertBox = document.createElement("div");
          alertBox.className = "p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs flex items-center justify-between gap-3 mb-2 shadow-2xs";
          alertBox.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="text-lg">⚠️</span>
              <div>
                <b class="text-amber-900 dark:text-amber-200">Phát hiện mẫu lỗi (${patternCounts[patKey]} lần):</b>
                <span class="text-amber-800 dark:text-amber-300 ml-1">${sampleMistake.errorPattern.name}</span>
              </div>
            </div>
            <button class="pat-practice-btn px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shrink-0 transition-all">
              Luyện ngay (${sampleMistake.objectiveId}) →
            </button>
          `;
          alertBox.querySelector(".pat-practice-btn").addEventListener("click", () => {
            this.practiceObjective(sampleMistake.objectiveId, sampleMistake.topicId);
          });
          container.appendChild(alertBox);
        }
      }
    });

    filtered.forEach(m => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-white dark:bg-gray-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3";
      
      const typeBadgeClass = m.type === "grammar" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" :
        (m.type === "article" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300");

      card.innerHTML = `
        <div class="space-y-1.5 flex-1 text-left">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${typeBadgeClass}">${m.topic || m.type}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${m.level || 'A1'}</span>
            ${m.objectiveId ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">${m.objectiveId}</span>` : ''}
            <span class="text-xs text-rose-500 font-bold">⚠️ Sai ${m.mistakeCount || 1} lần</span>
          </div>
          <div class="text-base font-bold text-gray-900 dark:text-gray-100">${m.question}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <span class="text-rose-600 dark:text-rose-400 line-through mr-2">Bạn chọn: ${m.userAnswer}</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Đáp án đúng: ${m.correctAnswer}</span>
          </div>
          ${m.explanation ? `
            <div class="text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
              <div>💡 <b>Tại sao sai (Warum?):</b> ${m.explanation}</div>
              ${m.objectiveId ? `
                <div class="pt-1 flex items-center justify-between not-italic">
                  <span class="text-[11px] text-gray-500">Mục tiêu học tập liên kết: <b>${m.objectiveId}</b></span>
                  <button class="btn-direct-practice text-blue-600 dark:text-blue-400 font-bold underline text-[11px] hover:text-blue-800">
                    Luyện quy tắc này →
                  </button>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
        <div class="flex items-center gap-2 self-end sm:self-center">
          <button class="btn-delete-mistake p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all" title="Đã hiểu & Xóa khỏi sổ tay">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;

      card.querySelector(".btn-delete-mistake").addEventListener("click", () => {
        this.removeMistake(m.id);
        if (window.appCtrl) window.appCtrl.showToast("Đã gỡ câu hỏi khỏi sổ tay lỗi sai!");
      });

      const directPracticeBtn = card.querySelector(".btn-direct-practice");
      if (directPracticeBtn && m.objectiveId) {
        directPracticeBtn.addEventListener("click", () => {
          this.practiceObjective(m.objectiveId, m.topicId);
        });
      }

      container.appendChild(card);
    });
  }

  updateBadge() {
    const badge = document.getElementById("header-mistakes-badge");
    const dashMistakesCount = document.getElementById("dash-mistakes-count");
    if (badge) {
      badge.textContent = this.mistakes.length;
      badge.classList.toggle("hidden", this.mistakes.length === 0);
    }
    if (dashMistakesCount) {
      dashMistakesCount.textContent = `${this.mistakes.length} lỗi`;
    }
  }
}

window.mistakesCtrl = new MistakesController();
