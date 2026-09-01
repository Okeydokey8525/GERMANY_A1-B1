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
    
    const skillMap = {
      grammar: { correct: 0, total: 0 },
      vocab: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 }
    };

    this.questions.forEach((q, idx) => {
      const isCorrect = this.userAnswers[idx] === q.answer;
      const sk = q.skill || "grammar";
      if (!skillMap[sk]) skillMap[sk] = { correct: 0, total: 0 };
      skillMap[sk].total++;

      if (isCorrect) {
        correctCount++;
        skillMap[sk].correct++;
      }
    });

    const calcSkillLevel = (sk) => {
      const s = skillMap[sk];
      if (!s || s.total === 0) return "A1.1";
      const rate = s.correct / s.total;
      if (rate >= 0.85) return "B1.1";
      if (rate >= 0.65) return "A2.2";
      if (rate >= 0.45) return "A2.1";
      if (rate >= 0.25) return "A1.2";
      return "A1.1";
    };

    let estLevel = "A1";
    let subLevel = "A1.1";
    let confidence = "Trung bình";
    let desc = "Bạn phù hợp bắt đầu từ chặng số 0: Phát âm, Chào hỏi, Số đếm và Động từ cơ bản.";
    let recommendation = "Khuyến nghị: Bắt đầu từ Chặng A1-01 và luyện phát âm hàng ngày.";

    if (correctCount >= 14) {
      estLevel = "B1";
      subLevel = "B1.1";
      confidence = "Cao";
      desc = "Nền tảng ngữ pháp và từ vựng A1–A2 của bạn rất vững chắc!";
      recommendation = "Khuyến nghị: Chuyển thẳng sang lộ trình B1 (Bị động, Giả định Konjunktiv II & Viết luận).";
    } else if (correctCount >= 12) {
      estLevel = "A2";
      subLevel = "A2.2 / B1.1 (Biên độ chuyển tiếp)";
      confidence = "Khá";
      desc = "Bạn đã nắm chắc hầu hết ngữ pháp A2 và một phần cấu trúc B1.";
      recommendation = "Khuyến nghị: Ôn tập củng cố Mệnh đề phụ (Nebensätze) trước khi bước sang B1.";
    } else if (correctCount >= 9) {
      estLevel = "A2";
      subLevel = "A2.1";
      confidence = "Khá";
      desc = "Bạn đã hoàn thành tốt trình độ A1 và sẵn sàng học các chủ điểm A2.";
      recommendation = "Khuyến nghị: Tập trung vào Dativ, Giới từ 2 chiều (Wechselpräpositionen) và Quá khứ Perfekt.";
    } else if (correctCount >= 6) {
      estLevel = "A1";
      subLevel = "A1.2 / A2.1 (Biên độ chuyển tiếp)";
      confidence = "Trung bình";
      desc = "Bạn đã có vốn từ cơ bản, nhưng cần củng cố lại mạo từ và cách Akkusativ/Dativ.";
      recommendation = "Khuyến nghị: Hoàn thành bài tập Akkusativ và Trật tự từ V2 trước khi chuyển sang A2.";
    } else {
      estLevel = "A1";
      subLevel = "A1.1";
      confidence = "Cao";
      desc = "Bạn mới bắt đầu học tiếng Đức hoặc cần xây dựng lại nền tảng từ đầu.";
      recommendation = "Khuyến nghị: Làm quen với Bảng chữ cái, 6 Bước cho người mới và bài học Nicos Weg A1.";
    }

    const testView = document.getElementById("placement-test-view");
    const resultView = document.getElementById("placement-result-view");
    const levelTitle = document.getElementById("placement-result-level");
    const scoreText = document.getElementById("placement-result-score");
    const descText = document.getElementById("placement-result-desc");
    const btnApply = document.getElementById("placement-btn-apply");

    if (testView) testView.classList.add("hidden");
    if (resultView) {
      resultView.classList.remove("hidden");
      resultView.innerHTML = `
        <div class="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl shadow-md">
          🏆
        </div>
        <div class="space-y-2 text-center">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ước tính trình độ tham khảo:</span>
          <h4 class="text-2xl font-black text-blue-600 dark:text-blue-400">${subLevel}</h4>
          <p class="text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">${correctCount} / ${this.questions.length} câu đúng • Độ tin cậy: <b class="text-emerald-600">${confidence}</b></p>
          <p class="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto pt-1 leading-relaxed">${desc}</p>
        </div>

        <!-- Detailed Skill Breakdown Grid -->
        <div class="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-left text-xs">
          <div>
            <span class="text-gray-400 font-medium">📊 Ngữ pháp (Grammar):</span>
            <div class="font-bold text-gray-900 dark:text-white font-mono text-sm">${calcSkillLevel("grammar")} (${skillMap.grammar.correct}/${skillMap.grammar.total})</div>
          </div>
          <div>
            <span class="text-gray-400 font-medium">📚 Từ vựng (Vocabulary):</span>
            <div class="font-bold text-gray-900 dark:text-white font-mono text-sm">${calcSkillLevel("vocab")} (${skillMap.vocab.correct}/${skillMap.vocab.total})</div>
          </div>
          <div>
            <span class="text-gray-400 font-medium">📖 Đọc hiểu (Reading):</span>
            <div class="font-bold text-gray-900 dark:text-white font-mono text-sm">${calcSkillLevel("reading")} (${skillMap.reading.correct}/${skillMap.reading.total})</div>
          </div>
          <div>
            <span class="text-gray-400 font-medium">🎧 Nghe hiểu (Listening):</span>
            <div class="font-bold text-gray-900 dark:text-white font-mono text-sm">${calcSkillLevel("listening")} (${skillMap.listening.correct}/${skillMap.listening.total})</div>
          </div>
        </div>

        <div class="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 text-left">
          💡 <b>${recommendation}</b>
        </div>

        <p class="text-[10px] text-gray-400 italic text-center max-w-xs mx-auto">
          ⚠️ Kết quả trên mang tính chất chẩn đoán tham khảo theo hệ thống bài học của DeutschMaster, không thay thế cho chứng chỉ khảo thí chính thức của Viện Goethe / telc.
        </p>

        <button id="placement-btn-apply" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all">
          Áp Dụng Cấp Độ (${estLevel}) & Bắt Đầu Học 🚀
        </button>
      `;

      const newBtnApply = document.getElementById("placement-btn-apply");
      if (newBtnApply) {
        newBtnApply.addEventListener("click", () => {
          if (window.appCtrl) {
            window.appCtrl.syncGlobalLevel(estLevel);
            window.appCtrl.switchTab("roadmap");
            window.appCtrl.showToast(`Đã thiết lập lộ trình học theo trình độ ${estLevel}! 🚀`);
          }
          const modal = document.getElementById("placement-modal");
          if (modal) modal.classList.add("hidden");
        });
      }
    }
  }
}

window.placementCtrl = new PlacementController();
