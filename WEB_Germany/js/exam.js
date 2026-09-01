// WEB_Germany Exam & Mock Test Room Module

class ExamController {
  constructor() {
    this.examsData = null;
    this.currentLevel = "A1";
    this.currentExam = null;
    this.userAnswers = {}; // { question_id: 'A' }
    this.timerInterval = null;
    this.secondsRemaining = 0;
    this.isExamActive = false;

    this.initElements();
  }

  initElements() {
    // Exam Level buttons
    ["A1", "A2", "B1"].forEach(lvl => {
      const btn = document.getElementById(`btn-exam-lvl-${lvl}`);
      if (btn) {
        btn.addEventListener("click", () => this.selectExamLevel(lvl));
      }
    });

    // Start Exam button
    const btnStart = document.getElementById("btn-start-exam");
    if (btnStart) btnStart.addEventListener("click", () => this.startExam());

    // Submit Exam button
    const btnSubmit = document.getElementById("btn-submit-exam");
    if (btnSubmit) btnSubmit.addEventListener("click", () => this.submitExam());

    // Close result modal
    const btnCloseResult = document.getElementById("btn-close-exam-result");
    if (btnCloseResult) btnCloseResult.addEventListener("click", () => this.closeResultModal());
  }

  setData(data) {
    this.examsData = data;
    this.selectExamLevel("A1");
  }

  selectExamLevel(lvl) {
    if (this.isExamActive) {
      if (!confirm("Bài thi đang diễn ra! Bạn có chắc muốn đổi cấp độ và hủy kết quả hiện tại?")) return;
      this.stopTimer();
      this.isExamActive = false;
    }

    this.currentLevel = lvl;
    this.currentExam = this.examsData ? this.examsData[lvl] : null;

    ["A1", "A2", "B1"].forEach(l => {
      const btn = document.getElementById(`btn-exam-lvl-${l}`);
      if (btn) {
        if (l === lvl) {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        } else {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        }
      }
    });

    this.renderExamLobby();
  }

  renderExamLobby() {
    const lobbyView = document.getElementById("exam-lobby-view");
    const activeView = document.getElementById("exam-active-view");
    const titleEl = document.getElementById("exam-lobby-title");
    const durEl = document.getElementById("exam-lobby-duration");
    const passEl = document.getElementById("exam-lobby-pass");

    if (lobbyView) lobbyView.classList.remove("hidden");
    if (activeView) activeView.classList.add("hidden");

    if (this.currentExam) {
      if (titleEl) titleEl.textContent = this.currentExam.title;
      if (durEl) durEl.textContent = `${this.currentExam.duration_minutes} phút`;
      if (passEl) passEl.textContent = `${this.currentExam.pass_score} / 100 điểm`;
    }
  }

  startExam() {
    if (!this.currentExam) return;

    this.userAnswers = {};
    this.isExamActive = true;
    this.secondsRemaining = this.currentExam.duration_minutes * 60;

    const lobbyView = document.getElementById("exam-lobby-view");
    const activeView = document.getElementById("exam-active-view");
    const examHeaderTitle = document.getElementById("exam-active-title");

    if (lobbyView) lobbyView.classList.add("hidden");
    if (activeView) activeView.classList.remove("hidden");
    if (examHeaderTitle) examHeaderTitle.textContent = this.currentExam.title;

    this.startTimer();
    this.renderExamQuestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startTimer() {
    this.stopTimer();
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.secondsRemaining--;
      this.updateTimerDisplay();
      if (this.secondsRemaining <= 0) {
        this.stopTimer();
        alert("Hết giờ làm bài! Hệ thống sẽ tự động nộp bài và tính điểm.");
        this.submitExam();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById("exam-countdown-timer");
    if (!timerEl) return;

    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timerEl.textContent = formatted;

    if (this.secondsRemaining < 300) {
      timerEl.className = "px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-mono font-bold text-sm animate-pulse";
    } else {
      timerEl.className = "px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold text-sm";
    }
  }

  renderExamQuestions() {
    const container = document.getElementById("exam-questions-container");
    if (!container || !this.currentExam) return;

    container.innerHTML = "";
    let questionIndex = 1;

    this.currentExam.sections.forEach(section => {
      const secCard = document.createElement("div");
      secCard.className = "p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm space-y-5";

      secCard.innerHTML = `
        <div class="border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">${section.name}</h3>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">${section.instruction}</p>
        </div>
        <div class="space-y-6" id="section-q-${section.id}"></div>
      `;

      const qBox = secCard.querySelector(`#section-q-${section.id}`);

      section.questions.forEach(q => {
        const qEl = document.createElement("div");
        qEl.className = "p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-700/60 space-y-3";

        // Optional context / audio player
        let mediaHtml = "";
        if (q.context) {
          mediaHtml = `<div class="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">${q.context}</div>`;
        } else if (q.audio_text) {
          mediaHtml = `
            <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
              <span class="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium">🎧 Nghe đoạn hội thoại bài thi</span>
              <button class="btn-play-exam-audio px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
                <span>Phát âm</span>
              </button>
            </div>
          `;
        }

        // Options
        const optionsHtml = q.options.map(opt => `
          <label class="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition-all">
            <input type="radio" name="q_${q.id}" value="${opt.id}" class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
            <span class="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium"><b>${opt.id}.</b> ${opt.text}</span>
          </label>
        `).join("");

        qEl.innerHTML = `
          <div class="flex items-start gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">${questionIndex++}</span>
            <div class="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">${q.question}</div>
          </div>
          ${mediaHtml}
          <div class="space-y-2 pt-1">${optionsHtml}</div>
        `;

        // Bind radio change
        qEl.querySelectorAll(`input[name="q_${q.id}"]`).forEach(radio => {
          radio.addEventListener("change", (e) => {
            this.userAnswers[q.id] = e.target.value;
          });
        });

        // Bind audio button
        const audioBtn = qEl.querySelector(".btn-play-exam-audio");
        if (audioBtn && q.audio_text) {
          audioBtn.addEventListener("click", () => {
            if (window.speechCtrl) window.speechCtrl.speak(q.audio_text, 0.88);
          });
        }

        qBox.appendChild(qEl);
      });

      container.appendChild(secCard);
    });
  }

  submitExam() {
    this.stopTimer();
    this.isExamActive = false;

    let totalQuestions = 0;
    let correctCount = 0;
    const reviewData = [];

    this.currentExam.sections.forEach(sec => {
      sec.questions.forEach(q => {
        totalQuestions++;
        const userChoice = this.userAnswers[q.id] || "Chưa chọn";
        const isRight = (userChoice === q.correct);
        if (isRight) correctCount++;

        reviewData.push({
          section: sec.name,
          question: q.question,
          userChoice,
          correct: q.correct,
          isRight,
          explanation: q.explanation
        });
      });
    });

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = scorePercent >= (this.currentExam.pass_score || 60);

    if (window.speechCtrl) {
      if (isPassed) window.speechCtrl.playCorrectSound();
      else window.speechCtrl.playWrongSound();
    }

    this.showResultModal(scorePercent, correctCount, totalQuestions, isPassed, reviewData);
  }

  showResultModal(scorePercent, correctCount, totalQuestions, isPassed, reviewData) {
    const modal = document.getElementById("exam-result-modal");
    const badgeEl = document.getElementById("exam-result-badge");
    const scoreEl = document.getElementById("exam-result-score");
    const summaryEl = document.getElementById("exam-result-summary");
    const reviewContainer = document.getElementById("exam-review-container");

    if (!modal) return;

    if (badgeEl) {
      badgeEl.className = isPassed
        ? "inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
        : "inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
      badgeEl.textContent = isPassed ? "ĐẠT (BESTANDEN) 🎉" : "CHƯA ĐẠT (NICHT BESTANDEN) ❌";
    }

    if (scoreEl) scoreEl.textContent = `${scorePercent}%`;
    if (summaryEl) summaryEl.textContent = `Bạn đã trả lời đúng ${correctCount} / ${totalQuestions} câu hỏi.`;

    if (reviewContainer) {
      reviewContainer.innerHTML = reviewData.map((item, idx) => `
        <div class="p-3.5 rounded-xl border ${item.isRight ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'} text-xs sm:text-sm space-y-1.5">
          <div class="font-bold text-gray-900 dark:text-white">Câu ${idx+1}: ${item.question}</div>
          <div class="flex items-center gap-4 text-xs font-semibold">
            <span class="${item.isRight ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">Lựa chọn: ${item.userChoice}</span>
            <span class="text-emerald-600 dark:text-emerald-400">Đáp án chuẩn: ${item.correct}</span>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg">💡 Giải thích: ${item.explanation}</div>
        </div>
      `).join("");
    }

    modal.classList.remove("hidden");
  }

  closeResultModal() {
    const modal = document.getElementById("exam-result-modal");
    if (modal) modal.classList.add("hidden");
    this.renderExamLobby();
  }
}

window.examCtrl = new ExamController();
