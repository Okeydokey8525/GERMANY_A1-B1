// WEB_Germany Quiz & Practice Module with Mistake Notebook integration

class QuizController {
  constructor() {
    this.vocabList = [];
    this.currentMode = "mc"; // 'mc' (4-choice), 'article' (der/die/das), 'spelling'
    this.currentIndex = 0;
    this.score = 0;
    this.combo = 0;
    this.totalAnswered = 0;
    this.quizPool = [];
    this.currentQuestion = null;

    this.initElements();
  }

  initElements() {
    // Mode switcher buttons
    const btnModeMC = document.getElementById("quiz-mode-mc");
    const btnModeArticle = document.getElementById("quiz-mode-article");
    const btnModeSpelling = document.getElementById("quiz-mode-spelling");

    if (btnModeMC) btnModeMC.addEventListener("click", () => this.switchMode("mc"));
    if (btnModeArticle) btnModeArticle.addEventListener("click", () => this.switchMode("article"));
    if (btnModeSpelling) btnModeSpelling.addEventListener("click", () => this.switchMode("spelling"));

    // Virtual keyboard keys
    document.querySelectorAll(".virtual-key").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const char = e.target.getAttribute("data-char");
        const input = document.getElementById("spelling-input");
        if (input && char) {
          const start = input.selectionStart || input.value.length;
          const end = input.selectionEnd || input.value.length;
          input.value = input.value.substring(0, start) + char + input.value.substring(end);
          input.focus();
          input.setSelectionRange(start + char.length, start + char.length);
        }
      });
    });

    // Spelling check button
    const btnCheckSpelling = document.getElementById("btn-check-spelling");
    const spellingInput = document.getElementById("spelling-input");
    if (btnCheckSpelling) btnCheckSpelling.addEventListener("click", () => this.checkSpelling());
    if (spellingInput) {
      spellingInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.checkSpelling();
      });
    }

    // Article Sprint buttons
    const btnDer = document.getElementById("btn-article-der");
    const btnDie = document.getElementById("btn-article-die");
    const btnDas = document.getElementById("btn-article-das");

    if (btnDer) btnDer.addEventListener("click", () => this.checkArticle("der"));
    if (btnDie) btnDie.addEventListener("click", () => this.checkArticle("die"));
    if (btnDas) btnDas.addEventListener("click", () => this.checkArticle("das"));

    // Quiz speaker button
    const btnQuizSpeaker = document.getElementById("quiz-speaker-btn");
    if (btnQuizSpeaker) {
      btnQuizSpeaker.addEventListener("click", () => {
        if (this.currentQuestion && window.speechCtrl) {
          const text = this.currentQuestion.word || this.currentQuestion.prompt;
          window.speechCtrl.speak(text);
        }
      });
    }

    // Next question button
    const btnNextQuiz = document.getElementById("btn-next-quiz");
    if (btnNextQuiz) btnNextQuiz.addEventListener("click", () => this.nextQuestion());
  }

  setData(vocabList) {
    this.vocabList = vocabList;
    this.resetQuiz();
  }

  switchMode(mode) {
    this.currentMode = mode;
    
    ["mc", "article", "spelling"].forEach(m => {
      const btn = document.getElementById(`quiz-mode-${m}`);
      if (btn) {
        if (m === mode) {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        } else {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        }
      }
    });

    const mcView = document.getElementById("quiz-view-mc");
    const articleView = document.getElementById("quiz-view-article");
    const spellingView = document.getElementById("quiz-view-spelling");

    if (mcView) mcView.classList.toggle("hidden", mode !== "mc");
    if (articleView) articleView.classList.toggle("hidden", mode !== "article");
    if (spellingView) spellingView.classList.toggle("hidden", mode !== "spelling");

    this.resetQuiz();
  }

  resetQuiz() {
    this.score = 0;
    this.combo = 0;
    this.totalAnswered = 0;
    this.updateScoreUI();

    if (this.currentMode === "article") {
      this.quizPool = this.vocabList.filter(v => v.article && ["der", "die", "das"].includes(v.article));
    } else {
      this.quizPool = [...this.vocabList];
    }

    for (let i = this.quizPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.quizPool[i], this.quizPool[j]] = [this.quizPool[j], this.quizPool[i]];
    }

    this.currentIndex = 0;
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.quizPool.length === 0) return;
    if (this.currentIndex >= this.quizPool.length) {
      this.currentIndex = 0;
    }

    const item = this.quizPool[this.currentIndex];
    this.currentQuestion = item;

    const feedbackBox = document.getElementById("quiz-feedback-box");
    const btnNext = document.getElementById("btn-next-quiz");
    if (feedbackBox) feedbackBox.classList.add("hidden");
    if (btnNext) btnNext.classList.add("hidden");

    if (this.currentMode === "mc") {
      this.renderMultipleChoice(item);
    } else if (this.currentMode === "article") {
      this.renderArticleSprint(item);
    } else if (this.currentMode === "spelling") {
      this.renderSpelling(item);
    }
  }

  // -------------------------------------------------------------
  // Mode 1: Multiple Choice
  // -------------------------------------------------------------
  renderMultipleChoice(item) {
    const promptEl = document.getElementById("quiz-mc-prompt");
    const subPromptEl = document.getElementById("quiz-mc-subprompt");
    const optionsContainer = document.getElementById("quiz-mc-options");

    const isDeToVi = Math.random() > 0.4;
    
    if (promptEl) {
      promptEl.textContent = isDeToVi ? (item.article ? `${item.article} ${item.word}` : item.word) : item.meaning_vi;
    }
    if (subPromptEl) {
      subPromptEl.textContent = isDeToVi ? "Chọn nghĩa tiếng Việt chính xác:" : "Chọn từ tiếng Đức tương ứng:";
    }

    const otherVocab = this.vocabList.filter(v => v.id !== item.id);
    const shuffledOthers = [...otherVocab].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [item, ...shuffledOthers].sort(() => 0.5 - Math.random());

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "w-full p-4 text-left rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 font-semibold text-gray-800 dark:text-gray-100 transition-all duration-150 flex items-center justify-between group shadow-sm";
        
        const labelText = isDeToVi ? opt.meaning_vi : (opt.article ? `${opt.article} ${opt.word}` : opt.word);
        btn.innerHTML = `
          <span>${labelText}</span>
          <span class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs group-hover:border-blue-500 text-transparent group-hover:text-blue-500">✓</span>
        `;

        btn.addEventListener("click", () => this.handleMCSelection(btn, opt.id === item.id, item, labelText));
        optionsContainer.appendChild(btn);
      });
    }
  }

  handleMCSelection(selectedBtn, isCorrect, item, chosenText) {
    const allBtns = document.querySelectorAll("#quiz-mc-options button");
    allBtns.forEach(b => b.disabled = true);

    this.totalAnswered++;
    if (isCorrect) {
      this.combo++;
      this.score += 10 + (this.combo * 2);
      selectedBtn.className = "w-full p-4 text-left rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold transition-all flex items-center justify-between";
      if (window.speechCtrl) {
        window.speechCtrl.playCorrectSound();
        window.speechCtrl.speak(item.article ? `${item.article} ${item.word}` : item.word);
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("vocab", true, item.topicId || "artikel", item.objectiveId || "LO_ART_01");
      }
    } else {
      this.combo = 0;
      selectedBtn.className = "w-full p-4 text-left rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold transition-all flex items-center justify-between";
      if (window.speechCtrl) window.speechCtrl.playWrongSound();
      
      // Add to Mistake Notebook
      if (window.mistakesCtrl) {
        window.mistakesCtrl.addMistake({
          id: `quiz_${item.id}`,
          type: "quiz",
          question: item.article ? `${item.article} ${item.word}` : item.word,
          userAnswer: chosenText,
          correctAnswer: item.meaning_vi,
          topicId: item.topicId || "artikel",
          objectiveId: item.objectiveId || "LO_ART_01",
          topic: item.topic_vi || item.topic || "Từ vựng",
          explanation: `"${item.word}" có nghĩa là "${item.meaning_vi}". Ví dụ: ${item.example_de || ''}`
        });
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("vocab", false, item.topicId || "artikel", item.objectiveId || "LO_ART_01");
      }
    }

    this.updateScoreUI();
    this.showFeedback(isCorrect, item);
  }

  // -------------------------------------------------------------
  // Mode 2: Der / Die / Das Sprint
  // -------------------------------------------------------------
  renderArticleSprint(item) {
    const wordEl = document.getElementById("quiz-article-word");
    const meaningEl = document.getElementById("quiz-article-meaning");
    const pluralEl = document.getElementById("quiz-article-plural");

    if (wordEl) wordEl.textContent = item.word;
    if (meaningEl) meaningEl.textContent = item.meaning_vi;
    if (pluralEl) pluralEl.textContent = item.plural ? `Plural: ${item.plural}` : "";

    ["der", "die", "das"].forEach(art => {
      const btn = document.getElementById(`btn-article-${art}`);
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("opacity-50", "scale-95");
      }
    });
  }

  checkArticle(chosenArticle) {
    if (!this.currentQuestion) return;
    const isCorrect = this.currentQuestion.article === chosenArticle;
    this.totalAnswered++;

    if (isCorrect) {
      this.combo++;
      this.score += 10 + (this.combo * 3);
      if (window.speechCtrl) {
        window.speechCtrl.playComboSound(this.combo);
        window.speechCtrl.speak(`${this.currentQuestion.article} ${this.currentQuestion.word}`);
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("vocab", true, "artikel", "LO_ART_01");
      }
    } else {
      this.combo = 0;
      if (window.speechCtrl) window.speechCtrl.playWrongSound();

      // Add to Mistake Notebook with Error Pattern
      if (window.mistakesCtrl) {
        window.mistakesCtrl.addMistake({
          id: `art_${this.currentQuestion.id}`,
          type: "article",
          question: `Mạo từ của danh từ "${this.currentQuestion.word}"`,
          userAnswer: chosenArticle,
          correctAnswer: `${this.currentQuestion.article} ${this.currentQuestion.word}`,
          topicId: "artikel",
          objectiveId: "LO_ART_01",
          topic: "Mạo từ Der / Die / Das",
          explanation: `Danh từ "${this.currentQuestion.word}" đi với mạo từ "${this.currentQuestion.article}". Số nhiều: ${this.currentQuestion.plural || 'die ' + this.currentQuestion.word}`
        });
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("vocab", false, "artikel", "LO_ART_01");
      }
    }

    this.updateScoreUI();
    this.showFeedback(isCorrect, this.currentQuestion);
  }

  // -------------------------------------------------------------
  // Mode 3: Spelling / Dictation
  // -------------------------------------------------------------
  renderSpelling(item) {
    const meaningEl = document.getElementById("quiz-spelling-meaning");
    const inputEl = document.getElementById("spelling-input");
    const hintEl = document.getElementById("quiz-spelling-hint");

    if (meaningEl) meaningEl.textContent = item.meaning_vi;
    if (hintEl) {
      const artHint = item.article ? `(Quán từ: ${item.article})` : "";
      hintEl.textContent = `Chủ đề: ${item.topic_vi || item.topic} ${artHint}`;
    }
    if (inputEl) {
      inputEl.value = "";
      inputEl.disabled = false;
      inputEl.focus();
    }

    if (window.speechCtrl) {
      window.speechCtrl.speak(item.word);
    }
  }

  checkSpelling() {
    const inputEl = document.getElementById("spelling-input");
    if (!inputEl || !this.currentQuestion) return;

    const userInput = inputEl.value.trim().toLowerCase();
    const correctWord = this.currentQuestion.word.trim().toLowerCase();
    const isCorrect = (userInput === correctWord);

    this.totalAnswered++;
    inputEl.disabled = true;

    if (isCorrect) {
      this.combo++;
      this.score += 15 + (this.combo * 2);
      if (window.speechCtrl) {
        window.speechCtrl.playCorrectSound();
        window.speechCtrl.speak(this.currentQuestion.article ? `${this.currentQuestion.article} ${this.currentQuestion.word}` : this.currentQuestion.word);
      }
      if (window.progressCtrl) window.progressCtrl.recordActivity("vocab", 1);
    } else {
      this.combo = 0;
      if (window.speechCtrl) window.speechCtrl.playWrongSound();

      // Add to Mistake Notebook
      if (window.mistakesCtrl) {
        window.mistakesCtrl.addMistake({
          id: `spell_${this.currentQuestion.id}`,
          type: "quiz",
          question: `Chính tả: "${this.currentQuestion.meaning_vi}"`,
          userAnswer: userInput || "(Chưa gõ)",
          correctAnswer: this.currentQuestion.word,
          topic: "Chính tả (Rechtschreibung)",
          explanation: `Viết đúng: "${this.currentQuestion.word}". Đọc là: /${this.currentQuestion.pronounce_vi || ''}/`
        });
      }
    }

    this.updateScoreUI();
    this.showFeedback(isCorrect, this.currentQuestion);
  }

  showFeedback(isCorrect, item) {
    const feedbackBox = document.getElementById("quiz-feedback-box");
    const feedbackTitle = document.getElementById("quiz-feedback-title");
    const feedbackDetail = document.getElementById("quiz-feedback-detail");
    const btnNext = document.getElementById("btn-next-quiz");

    if (!feedbackBox) return;

    feedbackBox.classList.remove("hidden");
    if (isCorrect) {
      feedbackBox.className = "p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 flex items-center justify-between animate-gentle-pulse";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-bold text-emerald-600 dark:text-emerald-400">Chính xác! 🎉</span> +${10 + this.combo * 2} điểm`;
    } else {
      feedbackBox.className = "p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 flex items-center justify-between";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-bold text-rose-600 dark:text-rose-400">Chưa chính xác! ❌ Đã ghi vào Sổ tay lỗi sai.</span>`;
    }

    const fullDe = item.article ? `<b>${item.article} ${item.word}</b>` : `<b>${item.word}</b>`;
    if (feedbackDetail) {
      feedbackDetail.innerHTML = `Đáp án: ${fullDe} = <i>${item.meaning_vi}</i>`;
    }

    if (btnNext) {
      btnNext.classList.remove("hidden");
      btnNext.focus();
    }
  }

  nextQuestion() {
    this.currentIndex++;
    this.loadQuestion();
  }

  updateScoreUI() {
    const scoreEl = document.getElementById("quiz-score-display");
    const comboEl = document.getElementById("quiz-combo-display");

    if (scoreEl) scoreEl.textContent = this.score;
    if (comboEl) {
      comboEl.textContent = this.combo > 1 ? `🔥 Combo x${this.combo}` : (this.combo === 1 ? "🔥 x1" : "");
    }
  }
}

window.quizCtrl = new QuizController();
