// WEB_Germany Exam & Mock Test Room Module (Supports Exam Simulation & Learning Mode)

class ExamController {
  constructor() {
    this.examsData = null;
    this.currentLevel = "A1";
    this.currentExam = null;
    this.userAnswers = {}; // { question_id: 'A' }
    this.timerInterval = null;
    this.secondsRemaining = 0;
    this.isExamActive = false;
    this.examMode = "exam"; // 'exam' (Bấm giờ nghiêm ngặt) or 'learning' (Luyện tập có giải thích)

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

    // Exam Mode Toggles
    const btnModeExam = document.getElementById("btn-exam-mode-exam");
    const btnModeLearn = document.getElementById("btn-exam-mode-learn");

    if (btnModeExam) btnModeExam.addEventListener("click", () => this.setMode("exam"));
    if (btnModeLearn) btnModeLearn.addEventListener("click", () => this.setMode("learning"));

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

  setMode(mode) {
    this.examMode = mode;
    const btnModeExam = document.getElementById("btn-exam-mode-exam");
    const btnModeLearn = document.getElementById("btn-exam-mode-learn");

    if (btnModeExam && btnModeLearn) {
      if (mode === "exam") {
        btnModeExam.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        btnModeLearn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
      } else {
        btnModeLearn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        btnModeExam.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
      }
    }
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

  switchLevel(lvl) {
    if (["A1", "A2", "B1"].includes(lvl)) {
      this.selectExamLevel(lvl);
    }
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
    if (examHeaderTitle) examHeaderTitle.textContent = `${this.currentExam.title} (${this.examMode === 'exam' ? 'Chế độ Thi Thử' : 'Chế độ Luyện Thi'})`;

    if (this.examMode === "exam") {
      this.startTimer();
    } else {
      const timerEl = document.getElementById("exam-timer-display");
      if (timerEl) timerEl.textContent = "⏱️ Luyện tập (Tự do)";
    }

    this.renderExamQuestions();
  }

  startTimer() {
    this.updateTimerDisplay();
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.secondsRemaining--;
      this.updateTimerDisplay();

      if (this.secondsRemaining <= 0) {
        this.stopTimer();
        alert("Hết giờ làm bài! Hệ thống đang tự động nộp bài thi của bạn.");
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
    const timerEl = document.getElementById("exam-timer-display");
    if (!timerEl) return;

    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  renderExamQuestions() {
    const container = document.getElementById("exam-questions-container");
    if (!container || !this.currentExam) return;

    container.innerHTML = "";

    this.currentExam.sections.forEach((sec, secIdx) => {
      const secEl = document.createElement("div");
      secEl.className = "p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm space-y-4";

      const header = document.createElement("div");
      header.className = "border-b border-gray-100 dark:border-gray-700/60 pb-3 flex items-center justify-between";
      header.innerHTML = `
        <div>
          <span class="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Phần ${secIdx + 1}</span>
          <h3 class="text-base font-extrabold text-gray-900 dark:text-gray-100">${sec.section_title}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">${sec.instruction || ''}</p>
        </div>
        <span class="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs font-mono">${sec.points_each} điểm/câu</span>
      `;
      secEl.appendChild(header);

      if (sec.reading_passage) {
        const passage = document.createElement("div");
        passage.className = "p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic";
        passage.innerHTML = sec.reading_passage.replace(/\n/g, '<br>');
        secEl.appendChild(passage);
      }

      const qList = document.createElement("div");
      qList.className = "space-y-4 pt-1";

      sec.questions.forEach((q) => {
        const qBox = document.createElement("div");
        qBox.className = "p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/80 space-y-2.5";
        qBox.innerHTML = `
          <div class="flex items-start gap-2 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            <span class="text-blue-600 dark:text-blue-400 font-mono">${q.id}.</span>
            <span>${q.question}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${q.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              return `
                <label class="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer flex items-center justify-between transition-all">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="q_${q.id}" value="${letter}" class="text-blue-600 focus:ring-blue-500">
                    <span>${opt}</span>
                  </div>
                  <span class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold flex items-center justify-center">${letter}</span>
                </label>
              `;
            }).join("")}
          </div>

          ${this.examMode === "learning" ? `
            <div class="pt-1">
              <button type="button" onclick="this.nextElementSibling.classList.toggle('hidden')" class="text-[11px] text-blue-600 hover:underline font-bold">
                💡 Xem gợi ý & giải thích
              </button>
              <div class="hidden mt-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200">
                Đáp án: <b>${q.answer}</b>. ${q.explanation || ''}
              </div>
            </div>
          ` : ''}
        `;

        qBox.querySelectorAll(`input[name="q_${q.id}"]`).forEach(radio => {
          radio.addEventListener("change", (e) => {
            this.userAnswers[q.id] = e.target.value;
          });
        });

        qList.appendChild(qBox);
      });

      secEl.appendChild(qList);
      container.appendChild(secEl);
    });
  }

  submitExam() {
    this.stopTimer();
    this.isExamActive = false;

    if (!this.currentExam) return;

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let totalQuestions = 0;

    this.currentExam.sections.forEach(sec => {
      sec.questions.forEach(q => {
        totalQuestions++;
        maxScore += sec.points_each;
        const userAns = this.userAnswers[q.id];
        const isCorrect = userAns === q.answer;

        if (isCorrect) {
          totalScore += sec.points_each;
          correctCount++;
        } else if (window.mistakesCtrl) {
          window.mistakesCtrl.addMistake({
            id: `exam_${q.id}`,
            type: "exam",
            level: this.currentLevel,
            question: q.question,
            userAnswer: userAns || "(Chưa chọn)",
            correctAnswer: q.answer,
            topic: `${this.currentLevel} Thi thử - ${sec.section_title}`,
            explanation: q.explanation || `Đáp án đúng là: ${q.answer}`
          });
        }
      });
    });

    const isPassed = totalScore >= this.currentExam.pass_score;

    // Record Exam completion in progress
    if (window.progressCtrl) {
      window.progressCtrl.recordExamAttempt(this.currentLevel, totalScore, isPassed);
    }

    this.showResultModal(totalScore, maxScore, correctCount, totalQuestions, isPassed);
  }

  showResultModal(score, maxScore, correct, total, isPassed) {
    const modal = document.getElementById("exam-result-modal");
    const titleEl = document.getElementById("exam-res-title");
    const badgeEl = document.getElementById("exam-res-badge");
    const scoreEl = document.getElementById("exam-res-score");
    const countEl = document.getElementById("exam-res-count");

    if (!modal) return;

    if (titleEl) titleEl.textContent = this.currentExam.title;
    if (scoreEl) scoreEl.textContent = `${score} / ${maxScore} điểm`;
    if (countEl) countEl.textContent = `${correct} / ${total} câu đúng`;

    if (badgeEl) {
      if (isPassed) {
        badgeEl.className = "px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-extrabold text-sm border border-emerald-300";
        badgeEl.textContent = "🏆 ĐẠT (BESTANDEN)";
        if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      } else {
        badgeEl.className = "px-4 py-2 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-extrabold text-sm border border-rose-300";
        badgeEl.textContent = "❌ CHƯA ĐẠT (NICHT BESTANDEN)";
        if (window.speechCtrl) window.speechCtrl.playComboSound(1);
      }
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
