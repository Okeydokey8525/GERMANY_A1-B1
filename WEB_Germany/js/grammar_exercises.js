// WEB_Germany Interactive Grammar Exercises Module (Cornelsen Grammatik aktiv Style)

class GrammarExercisesController {
  constructor() {
    this.exercises = [];
    this.currentExerciseIndex = 0;
    this.userScore = null;

    this.initElements();
  }

  initElements() {
    // Buttons inside grammar exercise view
    const btnCheck = document.getElementById("btn-grammar-check");
    const btnShowAnswers = document.getElementById("btn-grammar-solution");
    const btnReset = document.getElementById("btn-grammar-reset");
    const btnListen = document.getElementById("btn-grammar-listen");

    if (btnCheck) btnCheck.addEventListener("click", () => this.checkAnswers());
    if (btnShowAnswers) btnShowAnswers.addEventListener("click", () => this.showSolutions());
    if (btnReset) btnReset.addEventListener("click", () => this.resetExercise());
    if (btnListen) btnListen.addEventListener("click", () => this.listenAudio());
  }

  setData(exercises) {
    this.exercises = exercises;
    this.buildUnitPills();
    this.renderCurrentExercise();
  }

  buildUnitPills() {
    const container = document.getElementById("grammar-exercise-units");
    if (!container || !this.exercises || this.exercises.length === 0) return;

    container.innerHTML = "";
    this.exercises.forEach((ex, idx) => {
      const btn = document.createElement("button");
      btn.className = `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
        idx === this.currentExerciseIndex
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`;
      btn.textContent = ex.unit || `Chương ${idx + 1}`;
      btn.addEventListener("click", () => {
        this.currentExerciseIndex = idx;
        this.buildUnitPills();
        this.renderCurrentExercise();
      });
      container.appendChild(btn);
    });
  }

  renderCurrentExercise() {
    if (!this.exercises || this.exercises.length === 0) return;
    const ex = this.exercises[this.currentExerciseIndex];
    if (!ex) return;

    // Header elements
    const titleEl = document.getElementById("exercise-title");
    const levelEl = document.getElementById("exercise-level");
    const sourceEl = document.getElementById("exercise-source");
    const descEl = document.getElementById("exercise-desc");
    const ruleBox = document.getElementById("exercise-rule-content");
    const dialoguesContainer = document.getElementById("exercise-dialogues-container");
    const feedbackBox = document.getElementById("exercise-score-feedback");

    if (titleEl) titleEl.textContent = ex.title;
    if (levelEl) levelEl.textContent = ex.level || "A1-B1";
    if (sourceEl) sourceEl.textContent = ex.source || "Cornelsen Grammatik aktiv";
    if (descEl) descEl.textContent = ex.description;
    if (ruleBox) ruleBox.innerHTML = ex.grammar_rule;
    if (feedbackBox) feedbackBox.classList.add("hidden");

    if (!dialoguesContainer) return;
    dialoguesContainer.innerHTML = "";

    ex.dialogues.forEach(d => {
      const sectionCard = document.createElement("div");
      sectionCard.className = "p-5 sm:p-6 rounded-3xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-sm space-y-4";

      let linesHtml = "";
      d.lines.forEach((line) => {
        let textWithInputs = line.text_template;

        // Replace each {blank_X} with an interactive input field
        (line.blanks || []).forEach(blank => {
          const correctVals = blank.correct.join("|");
          const inputHtml = `
            <span class="inline-flex flex-col items-center mx-1 my-0.5 align-middle">
              <input type="text"
                     class="grammar-input px-3 py-1 text-center font-bold text-xs sm:text-sm bg-blue-50/60 dark:bg-blue-950/40 border-b-2 border-blue-400 dark:border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-gray-900 transition-all duration-150 shadow-xs"
                     style="width: ${Math.max(blank.correct[0].length * 14 + 28, 85)}px"
                     data-blank-id="${blank.id}"
                     data-correct="${correctVals}"
                     data-hint="${blank.hint || ''}"
                     placeholder="_____"
                     autocomplete="off"
                     autocapitalize="off"
                     spellcheck="false">
              <span class="correct-badge hidden text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5"></span>
            </span>
          `;
          textWithInputs = textWithInputs.replace(`{${blank.id}}`, inputHtml);
        });

        linesHtml += `
          <div class="p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
            <span class="font-bold text-blue-700 dark:text-blue-400 min-w-[70px] sm:min-w-[90px] shrink-0 pt-1">${line.speaker}:</span>
            <div class="flex-1 text-gray-800 dark:text-gray-200 pt-0.5">${textWithInputs}</div>
          </div>
        `;
      });

      sectionCard.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
          <h4 class="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">${d.section_num || '✍️'}</span>
            <span>${d.title}</span>
          </h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${d.verb_target || ''}</span>
        </div>
        <div class="space-y-2.5">${linesHtml}</div>
      `;

      dialoguesContainer.appendChild(sectionCard);
    });

    // Auto check on Enter key in inputs
    document.querySelectorAll(".grammar-input").forEach(input => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.checkAnswers();
        }
      });
    });
  }

  checkAnswers() {
    const inputs = document.querySelectorAll(".grammar-input");
    if (inputs.length === 0) return;

    let total = inputs.length;
    let correctCount = 0;

    inputs.forEach(input => {
      const userVal = input.value.trim().toLowerCase();
      const correctStr = input.getAttribute("data-correct") || "";
      const validOptions = correctStr.split("|").map(v => v.trim().toLowerCase());
      const hintBadge = input.parentElement.querySelector(".correct-badge");

      const isCorrect = validOptions.includes(userVal);

      if (isCorrect) {
        correctCount++;
        input.className = "grammar-input px-3 py-1 text-center font-bold text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 rounded-lg shadow-xs";
        if (hintBadge) {
          hintBadge.classList.remove("hidden");
          hintBadge.textContent = "✓ Đúng";
          hintBadge.className = "correct-badge text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5";
        }
      } else {
        input.className = "grammar-input px-3 py-1 text-center font-bold text-xs sm:text-sm bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-800 dark:text-rose-200 rounded-lg shadow-xs";
        if (hintBadge) {
          hintBadge.classList.remove("hidden");
          hintBadge.textContent = `Đáp án: ${validOptions[0]}`;
          hintBadge.className = "correct-badge text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5";
        }
      }
    });

    const percent = Math.round((correctCount / total) * 100);
    const feedbackBox = document.getElementById("exercise-score-feedback");
    const scoreText = document.getElementById("exercise-score-text");

    if (feedbackBox && scoreText) {
      feedbackBox.classList.remove("hidden");
      scoreText.innerHTML = `Kết quả: <b>${correctCount}/${total}</b> câu chính xác (<b>${percent}%</b>)`;
      feedbackBox.className = percent >= 70
        ? "p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-100 flex items-center justify-between shadow-sm animate-gentle-pulse"
        : "p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-100 flex items-center justify-between shadow-sm";
    }

    if (window.speechCtrl) {
      if (percent >= 70) window.speechCtrl.playCorrectSound();
      else window.speechCtrl.playWrongSound();
    }
  }

  showSolutions() {
    const inputs = document.querySelectorAll(".grammar-input");
    inputs.forEach(input => {
      const correctStr = input.getAttribute("data-correct") || "";
      const validOptions = correctStr.split("|");
      input.value = validOptions[0];
      input.className = "grammar-input px-3 py-1 text-center font-bold text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 rounded-lg shadow-xs";
      
      const hintBadge = input.parentElement.querySelector(".correct-badge");
      if (hintBadge) {
        hintBadge.classList.remove("hidden");
        hintBadge.textContent = "✓ Gợi ý chuẩn";
        hintBadge.className = "correct-badge text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5";
      }
    });

    if (window.appCtrl) window.appCtrl.showToast("Đã hiển thị toàn bộ đáp án mẫu!");
  }

  resetExercise() {
    const inputs = document.querySelectorAll(".grammar-input");
    inputs.forEach(input => {
      input.value = "";
      input.className = "grammar-input px-3 py-1 text-center font-bold text-xs sm:text-sm bg-blue-50/60 dark:bg-blue-950/40 border-b-2 border-blue-400 dark:border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-gray-900 transition-all duration-150 shadow-xs";
      const hintBadge = input.parentElement.querySelector(".correct-badge");
      if (hintBadge) hintBadge.classList.add("hidden");
    });

    const feedbackBox = document.getElementById("exercise-score-feedback");
    if (feedbackBox) feedbackBox.classList.add("hidden");
    if (window.appCtrl) window.appCtrl.showToast("Đã làm mới bài tập!");
  }

  listenAudio() {
    const ex = this.exercises[this.currentExerciseIndex];
    if (!ex || !window.speechCtrl) return;

    let fullText = "";
    ex.dialogues.forEach(d => {
      d.lines.forEach(l => {
        // Construct clean sentence with first correct answer
        let lineText = l.text_template;
        (l.blanks || []).forEach(b => {
          lineText = lineText.replace(`{${b.id}}`, b.correct[0]);
        });
        fullText += `${l.speaker}: ${lineText}. `;
      });
    });

    window.speechCtrl.speak(fullText, 0.85);
    if (window.appCtrl) window.appCtrl.showToast("Đang phát âm bài hội thoại...");
  }
}

window.grammarExCtrl = new GrammarExercisesController();
