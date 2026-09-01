// WEB_Germany Mistake Notebook (Sổ tay lỗi sai - Fehlerbuch) with Error-to-Practice Pipeline

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

  addMistake(item) {
    const idx = this.mistakes.findIndex(m => m.id === item.id || (m.question === item.question && m.type === item.type));
    const newEntry = {
      id: item.id || `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: item.type || "vocab", // 'vocab', 'grammar', 'article', 'word-order', 'listening', 'quiz', 'exam'
      level: item.level || (window.progressCtrl ? window.progressCtrl.data.currentLevel : "A1"),
      question: item.question,
      userAnswer: item.userAnswer || "Chưa chính xác",
      correctAnswer: item.correctAnswer,
      explanation: item.explanation || "",
      topic: item.topic || "Chung",
      timestamp: Date.now(),
      mistakeCount: 1
    };

    if (idx !== -1) {
      this.mistakes[idx].mistakeCount = (this.mistakes[idx].mistakeCount || 1) + 1;
      this.mistakes[idx].userAnswer = item.userAnswer;
      this.mistakes[idx].timestamp = Date.now();
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

  // Error-to-Practice Pipeline: Dispatches to the exact right learning tool!
  startPracticeMistakes() {
    const targetMistakes = this.currentFilter === "ALL" 
      ? this.mistakes 
      : this.mistakes.filter(m => m.type === this.currentFilter);

    if (targetMistakes.length === 0) {
      if (window.appCtrl) window.appCtrl.showToast("Không có lỗi sai nào trong bộ lọc này!");
      return;
    }

    // If practicing Article mistakes -> Route to Article Sprint
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
          topic: "Ôn lỗi sai Mạo từ"
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

    // Default: Route to Quiz practice with bugfix regex
    const customPool = targetMistakes.map(m => {
      // Fix regex bug: properly match leading der/die/das
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

    filtered.forEach(m => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-white dark:bg-gray-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3";
      
      const typeBadgeClass = m.type === "grammar" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" :
        (m.type === "article" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300");

      card.innerHTML = `
        <div class="space-y-1.5 flex-1 text-left">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${typeBadgeClass}">${m.topic || m.type}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${m.level || 'A1'}</span>
            <span class="text-xs text-rose-500 font-bold">⚠️ Sai ${m.mistakeCount || 1} lần</span>
          </div>
          <div class="text-base font-bold text-gray-900 dark:text-gray-100">${m.question}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <span class="text-rose-600 dark:text-rose-400 line-through mr-2">Bạn chọn: ${m.userAnswer}</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Đáp án đúng: ${m.correctAnswer}</span>
          </div>
          ${m.explanation ? `<div class="text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-100 dark:border-blue-900/40">💡 <b>Tại sao?</b> ${m.explanation}</div>` : ''}
        </div>
        <button class="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all self-end sm:self-center" title="Đã hiểu & Xóa khỏi sổ tay">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        this.removeMistake(m.id);
        if (window.appCtrl) window.appCtrl.showToast("Đã gỡ câu hỏi khỏi sổ tay lỗi sai!");
      });

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
