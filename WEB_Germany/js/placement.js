// WEB_Germany Quick CEFR Placement Test Controller (15 Questions Diagnostic)

class PlacementController {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = [];
    this.isTestRunning = false;

    this.initElements();
  }

  initElements() {
    const btnStart = document.getElementById("btn-start-placement");
    const btnClose = document.getElementById("btn-close-placement");
    const modal = document.getElementById("placement-modal");

    if (btnStart) btnStart.addEventListener("click", () => this.startTest());
    if (btnClose && modal) btnClose.addEventListener("click", () => modal.classList.add("hidden"));
  }

  async loadQuestions() {
    if (this.questions.length > 0) return;
    try {
      const res = await fetch("./data/placement_questions.json");
      this.questions = await res.json();
    } catch (e) {
      console.warn("Could not load placement questions:", e);
    }
  }

  async startTest() {
    await this.loadQuestions();
    if (!this.questions || this.questions.length === 0) return;

    this.currentIndex = 0;
    this.userAnswers = new Array(this.questions.length).fill(null);
    this.isTestRunning = true;

    const modal = document.getElementById("placement-modal");
    const introView = document.getElementById("placement-intro-view");
    const testView = document.getElementById("placement-test-view");
    const resultView = document.getElementById("placement-result-view");

    if (modal) modal.classList.remove("hidden");
    if (introView) introView.classList.add("hidden");
    if (testView) testView.classList.remove("hidden");
    if (resultView) resultView.classList.add("hidden");

    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.questions[this.currentIndex];
    if (!q) return;

    const progBar = document.getElementById("placement-progress-bar");
    const countEl = document.getElementById("placement-q-count");
    const levelBadge = document.getElementById("placement-q-level");
    const textEl = document.getElementById("placement-q-text");
    const optionsContainer = document.getElementById("placement-options-container");

    const total = this.questions.length;
    if (progBar) progBar.style.width = `${((this.currentIndex + 1) / total) * 100}%`;
    if (countEl) countEl.textContent = `Câu ${this.currentIndex + 1} / ${total}`;
    if (levelBadge) {
      levelBadge.textContent = q.level;
      levelBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${
        q.level === 'A1' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
        q.level === 'A2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
        'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      }`;
    }

    if (textEl) textEl.textContent = q.question;

    if (optionsContainer) {
      optionsContainer.innerHTML = q.options.map((opt, idx) => `
        <button class="w-full text-left p-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all flex items-center justify-between group shadow-2xs" onclick="window.placementCtrl.handleSelectOption(${idx})">
          <span>${opt}</span>
          <span class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-blue-600 shrink-0">
            ${String.fromCharCode(65 + idx)}
          </span>
        </button>
      `).join("");
    }
  }

  handleSelectOption(optIdx) {
    this.userAnswers[this.currentIndex] = optIdx;

    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.finishTest();
    }
  }

  finishTest() {
    this.isTestRunning = false;
    let correctCount = 0;
    let a1Correct = 0, a2Correct = 0, b1Correct = 0;

    this.questions.forEach((q, idx) => {
      const isCorrect = this.userAnswers[idx] === q.answer;
      if (isCorrect) {
        correctCount++;
        if (q.level === "A1") a1Correct++;
        else if (q.level === "A2") a2Correct++;
        else if (q.level === "B1") b1Correct++;
      }
    });

    let estLevel = "A1";
    let subLevel = "A1.1";
    let desc = "Bạn phù hợp bắt đầu từ giai đoạn nền tảng: Phát âm, Chào hỏi và Động từ cơ bản.";

    if (correctCount >= 14) {
      estLevel = "B1";
      subLevel = "B1.1";
      desc = "Kiến thức nền tảng của bạn rất vững chắc! Bạn có thể học ngay các chủ điểm B1 nâng cao.";
    } else if (correctCount >= 11) {
      estLevel = "A2";
      subLevel = "A2.2";
      desc = "Bạn đã nắm chắc ngữ pháp A1 và phần lớn A2, sẵn sàng chuyển tiếp lên B1.";
    } else if (correctCount >= 8) {
      estLevel = "A2";
      subLevel = "A2.1";
      desc = "Bạn đã hiểu cơ bản A1, nên bắt đầu ôn tập và thực hành các chủ điểm Akkusativ/Dativ A2.";
    } else if (correctCount >= 5) {
      estLevel = "A1";
      subLevel = "A1.2";
      desc = "Bạn đã biết một số từ vựng cơ bản, nên tập trung hoàn thiện mạo từ và cách Akkusativ A1.";
    }

    const testView = document.getElementById("placement-test-view");
    const resultView = document.getElementById("placement-result-view");
    const levelTitle = document.getElementById("placement-result-level");
    const scoreText = document.getElementById("placement-result-score");
    const descText = document.getElementById("placement-result-desc");
    const btnApply = document.getElementById("placement-btn-apply");

    if (testView) testView.classList.add("hidden");
    if (resultView) resultView.classList.remove("hidden");

    if (levelTitle) levelTitle.textContent = `${subLevel} (${estLevel})`;
    if (scoreText) scoreText.textContent = `${correctCount} / ${this.questions.length} câu đúng`;
    if (descText) descText.textContent = desc;

    if (btnApply) {
      btnApply.onclick = () => {
        if (window.appCtrl) {
          window.appCtrl.syncGlobalLevel(estLevel);
          const lvlSelect = document.getElementById("global-level-select");
          if (lvlSelect) lvlSelect.value = estLevel;
          window.appCtrl.switchTab("roadmap");
          window.appCtrl.showToast(`Đã thiết lập cấp độ: ${subLevel}! Chúc bạn học tốt 🎉`);
        }
        const modal = document.getElementById("placement-modal");
        if (modal) modal.classList.add("hidden");
      };
    }
  }
}

window.placementCtrl = new PlacementController();
