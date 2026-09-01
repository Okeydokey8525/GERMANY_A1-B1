// WEB_Germany Interactive Grammar Exercise Controller with Warum? Explanations & Mistake Tracking

class GrammarExerciseController {
  constructor() {
    this.units = [];
    this.currentUnitIndex = 0;
    this.userAnswers = {}; // { 'u0_b0': 'muss', 'u0_b1': 'darf' }
    this.score = 0;
    
    this.initElements();
  }

  initElements() {
    const unitSelector = document.getElementById("grammar-unit-select");
    if (unitSelector) {
      unitSelector.addEventListener("change", (e) => {
        this.currentUnitIndex = parseInt(e.target.value) || 0;
        this.userAnswers = {};
        this.renderCurrentUnit();
      });
    }

    const btnCheckAll = document.getElementById("btn-check-grammar");
    const btnShowAnswers = document.getElementById("btn-show-grammar-answers");
    const btnResetAll = document.getElementById("btn-reset-grammar");
    const btnPlayAudio = document.getElementById("btn-play-grammar-audio");

    const btnPractice = document.getElementById("btn-grammar-sub-practice");
    const btnTheory = document.getElementById("btn-grammar-sub-theory");
    const viewPractice = document.getElementById("grammar-view-practice");
    const viewTheory = document.getElementById("grammar-view-theory");

    if (btnPractice && btnTheory && viewPractice && viewTheory) {
      btnPractice.addEventListener("click", () => {
        btnPractice.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md transition-all";
        btnTheory.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        viewPractice.classList.remove("hidden");
        viewTheory.classList.add("hidden");
      });

      btnTheory.addEventListener("click", () => {
        btnTheory.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md transition-all";
        btnPractice.className = "px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        viewTheory.classList.remove("hidden");
        viewPractice.classList.add("hidden");
        if (window.glossaryCtrl) window.glossaryCtrl.renderGlossary();
      });
    }

    if (btnCheckAll) btnCheckAll.addEventListener("click", () => this.checkAllAnswers());
    if (btnShowAnswers) btnShowAnswers.addEventListener("click", () => this.showAllAnswers());
    if (btnResetAll) btnResetAll.addEventListener("click", () => this.resetAllAnswers());
    if (btnPlayAudio) btnPlayAudio.addEventListener("click", () => this.playFullDialogueAudio());
  }

  setData(unitsData) {
    this.units = unitsData;
    this.populateUnitSelect();
    this.renderCurrentUnit();
  }

  populateUnitSelect() {
    const selector = document.getElementById("grammar-unit-select");
    if (!selector) return;

    selector.innerHTML = "";
    this.units.forEach((unit, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${unit.level} • ${unit.unit_title}`;
      selector.appendChild(opt);
    });
  }

  renderCurrentUnit() {
    if (this.units.length === 0) return;
    const unit = this.units[this.currentUnitIndex];
    if (!unit) return;

    const titleEl = document.getElementById("grammar-ex-title");
    const subTitleEl = document.getElementById("grammar-ex-subtitle");
    const ruleBox = document.getElementById("grammar-rule-content");
    const dialogueContainer = document.getElementById("grammar-dialogue-container");
    const scoreBox = document.getElementById("grammar-score-summary");

    if (titleEl) titleEl.textContent = `${unit.unit_title}`;
    if (subTitleEl) subTitleEl.textContent = `${unit.topic} • ${unit.instruction}`;
    if (scoreBox) scoreBox.classList.add("hidden");

    if (ruleBox && unit.rule_summary) {
      ruleBox.innerHTML = `
        <div class="space-y-2">
          <p class="font-bold text-blue-900 dark:text-blue-200">${unit.rule_summary.title || 'Quy tắc ngữ pháp'}</p>
          <div class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-900/40 text-gray-700 dark:text-gray-300 space-y-1">
            ${(unit.rule_summary.points || []).map(p => `<div>• ${p}</div>`).join('')}
          </div>
          ${unit.rule_summary.formula ? `<div class="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">💡 ${unit.rule_summary.formula}</div>` : ''}
        </div>
      `;
    }

    if (!dialogueContainer) return;
    dialogueContainer.innerHTML = "";

    unit.sections.forEach((sec, secIdx) => {
      const secEl = document.createElement("div");
      secEl.className = "p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm space-y-4";
      
      const secHeader = document.createElement("div");
      secHeader.className = "flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3";
      secHeader.innerHTML = `
        <div>
          <h3 class="font-extrabold text-gray-900 dark:text-white text-base">${sec.section_title}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">${sec.context_vi || ''}</p>
        </div>
        <button class="section-audio-btn p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span>🔊</span> <span>Nghe đoạn này</span>
        </button>
      `;

      secHeader.querySelector(".section-audio-btn").addEventListener("click", () => {
        this.playSectionAudio(sec);
      });
      secEl.appendChild(secHeader);

      const dialogueList = document.createElement("div");
      dialogueList.className = "space-y-3.5";

      sec.dialogue.forEach((line) => {
        const lineEl = document.createElement("div");
        lineEl.className = "flex items-start gap-3 text-sm text-gray-800 dark:text-gray-200";

        let renderedText = line.text;
        line.blanks.forEach(b => {
          const blankId = b.id;
          const userVal = this.userAnswers[blankId] || "";
          const inputHtml = `
            <span class="inline-flex flex-col mx-1 align-baseline relative">
              <input type="text" 
                id="input_${blankId}" 
                data-blank-id="${blankId}"
                value="${userVal}" 
                placeholder="${b.hint || '...'}"
                class="grammar-input font-bold text-center px-2 py-0.5 rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 focus:border-blue-600 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm inline-block shadow-2xs" 
                style="width: ${Math.max(80, ((b.answer || '').length + 3) * 12)}px;"
                autocomplete="off"
                spellcheck="false"
              />
              <span id="badge_${blankId}" class="hidden text-[10px] font-bold mt-0.5 text-center"></span>
            </span>
          `;
          renderedText = renderedText.replace(b.placeholder, inputHtml);
        });

        lineEl.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm shrink-0 font-bold text-gray-600 dark:text-gray-300">
            ${line.avatar || '👤'}
          </div>
          <div class="space-y-1 flex-1 leading-relaxed">
            <div class="font-bold text-xs text-gray-500 dark:text-gray-400">${line.speaker}:</div>
            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${renderedText}</div>
            ${line.translation_vi ? `<div class="text-xs text-gray-400 dark:text-gray-500 italic">${line.translation_vi}</div>` : ''}
            <div id="warum_${line.id || secIdx}" class="hidden mt-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"></div>
          </div>
        `;

        dialogueList.appendChild(lineEl);
      });

      secEl.appendChild(dialogueList);
      dialogueContainer.appendChild(secEl);
    });

    document.querySelectorAll(".grammar-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const bId = e.target.getAttribute("data-blank-id");
        this.userAnswers[bId] = e.target.value.trim();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.checkAllAnswers();
      });
    });
  }

  checkAllAnswers() {
    if (this.units.length === 0) return;
    const unit = this.units[this.currentUnitIndex];
    let totalBlanks = 0;
    let correctCount = 0;

    const sections = unit.sections || unit.dialogues || [];
    sections.forEach(sec => {
      const lines = sec.lines || sec.dialogue || [];
      lines.forEach(line => {
        const blanks = line.blanks || [];
        blanks.forEach(b => {
          totalBlanks++;
          const inputEl = document.getElementById(`input_${b.id}`);
          const badgeEl = document.getElementById(`badge_${b.id}`);
          if (!inputEl) return;

          const userVal = (inputEl.value || "").trim().toLowerCase();
          const correctAnswers = Array.isArray(b.correct) ? b.correct : [b.answer || ""];
          const isCorrect = correctAnswers.some(ans => (ans || "").toLowerCase() === userVal);
          const targetTopicId = b.topicId || sec.topicId || unit.topicId || "grammar";
          const targetObjectiveId = b.objectiveId || sec.objectiveId || unit.objectiveId || null;

          if (isCorrect) {
            correctCount++;
            inputEl.className = "grammar-input font-bold text-center px-2 py-0.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-sm shadow-2xs";
            if (badgeEl) {
              badgeEl.className = "text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 text-center";
              badgeEl.textContent = "✓ Đúng";
              badgeEl.classList.remove("hidden");
            }
          } else {
            inputEl.className = "grammar-input font-bold text-center px-2 py-0.5 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-sm shadow-2xs";
            if (badgeEl) {
              badgeEl.className = "text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 text-center";
              badgeEl.textContent = `Đáp án: ${correctAnswers[0]}`;
              badgeEl.classList.remove("hidden");
            }

            // Register in Mistake Notebook with Warum explanation & Error Pattern
            if (window.mistakesCtrl) {
              const warumText = b.hint || b.explanation || unit.grammar_rule || `Đáp án đúng là: ${correctAnswers[0]}`;
              window.mistakesCtrl.addMistake({
                id: `gram_${b.id}`,
                type: "grammar",
                level: unit.level || "A1",
                question: `Điền câu: "${line.text_template || line.text || ''}"`,
                userAnswer: userVal || "(Để trống)",
                correctAnswer: correctAnswers[0],
                topicId: targetTopicId,
                objectiveId: targetObjectiveId,
                topic: unit.title || unit.unit || "Ngữ pháp",
                explanation: warumText
              });
            }
          }

          // Directly record to Progress Engine with Objective Tracking!
          if (window.progressCtrl) {
            window.progressCtrl.recordActivity("grammar", isCorrect, targetTopicId, targetObjectiveId);
          }
        });
      });
    });

    const scoreBox = document.getElementById("grammar-score-summary");
    const scoreVal = document.getElementById("grammar-score-val");
    const scoreMsg = document.getElementById("grammar-score-msg");

    if (scoreBox) scoreBox.classList.remove("hidden");
    if (scoreVal) scoreVal.textContent = `${correctCount} / ${totalBlanks}`;

    if (correctCount === totalBlanks && totalBlanks > 0) {
      if (scoreMsg) scoreMsg.innerHTML = "🎉 <b>Hoàn hảo!</b> Bạn đã chia đúng 100% tất cả các từ trong bài học!";
      if (window.speechCtrl) window.speechCtrl.playCorrectSound();
    } else {
      if (scoreMsg) scoreMsg.innerHTML = `Đúng ${correctCount}/${totalBlanks} vị trí. Các câu sai đã được lưu vào <b class="text-rose-600 dark:text-rose-400">Sổ tay lỗi sai</b> để bạn ôn lại!`;
      if (window.speechCtrl) window.speechCtrl.playComboSound(1);
    }
  }

  showAllAnswers() {
    if (this.units.length === 0) return;
    const unit = this.units[this.currentUnitIndex];
    unit.sections.forEach(sec => {
      sec.dialogue.forEach(line => {
        line.blanks.forEach(b => {
          const inputEl = document.getElementById(`input_${b.id}`);
          if (inputEl) {
            inputEl.value = b.answer;
            this.userAnswers[b.id] = b.answer;
          }
        });
      });
    });
    this.checkAllAnswers();
  }

  resetAllAnswers() {
    this.userAnswers = {};
    this.renderCurrentUnit();
    if (window.appCtrl) window.appCtrl.showToast("Đã làm mới bài tập!");
  }

  playSectionAudio(sec) {
    if (!window.speechCtrl) return;
    const fullText = sec.dialogue.map(d => {
      let cleanText = d.text;
      d.blanks.forEach(b => {
        cleanText = cleanText.replace(b.placeholder, b.answer);
      });
      return cleanText;
    }).join(". ");

    window.speechCtrl.speak(fullText);
  }

  playFullDialogueAudio() {
    if (this.units.length === 0 || !window.speechCtrl) return;
    const unit = this.units[this.currentUnitIndex];
    const fullText = unit.sections.map(sec => {
      return sec.dialogue.map(d => {
        let cleanText = d.text;
        d.blanks.forEach(b => {
          cleanText = cleanText.replace(b.placeholder, b.answer);
        });
        return cleanText;
      }).join(". ");
    }).join(". ");

    window.speechCtrl.speak(fullText);
  }
}

window.grammarExCtrl = new GrammarExerciseController();
