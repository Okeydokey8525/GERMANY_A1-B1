// WEB_Germany Listening Dictation & Phonetics Diagnostic Module (A1-B1)

class DictationController {
  constructor() {
    this.speed = 0.9;
    this.currentLevel = "A1";
    this.sentences = [
      {
        id: "dic_01",
        level: "A1",
        fullText: "Ich heiße Nico und ich komme aus Spanien.",
        meaning_vi: "Tôi tên là Nico và tôi đến từ Tây Ban Nha.",
        topic: "Chào hỏi & Nguồn gốc"
      },
      {
        id: "dic_02",
        level: "A1",
        fullText: "Guten Morgen! Haben Sie heute einen Tisch frei?",
        meaning_vi: "Chào buổi sáng! Hôm nay quán còn bàn trống không?",
        topic: "Tại nhà hàng"
      },
      {
        id: "dic_03",
        level: "A1",
        fullText: "Entschuldigung, wo kann ich eine Fahrkarte kaufen?",
        meaning_vi: "Xin lỗi cho hỏi, tôi có thể mua vé tàu ở đâu?",
        topic: "Đi lại & Mua vé"
      },
      {
        id: "dic_04",
        level: "A2",
        fullText: "Gestern habe ich meine Hausaufgaben gemacht und Deutsch gelernt.",
        meaning_vi: "Hôm qua tôi đã làm bài tập về nhà và học tiếng Đức.",
        topic: "Thì quá khứ Perfekt"
      },
      {
        id: "dic_05",
        level: "A2",
        fullText: "Ich freue mich sehr auf das Wochenende mit meinen Freunden.",
        meaning_vi: "Tôi rất háo hức mong chờ đến cuối tuần cùng bạn bè.",
        topic: "Động từ phản thân"
      },
      {
        id: "dic_06",
        level: "B1",
        fullText: "Obwohl das Wetter schlecht war, haben wir einen schönen Ausflug gemacht.",
        meaning_vi: "Mặc dù thời tiết xấu, chúng tôi vẫn có một chuyến dã ngoại tuyệt vời.",
        topic: "Mệnh đề phụ với obwohl"
      },
      {
        id: "dic_07",
        level: "B1",
        fullText: "Könnten Sie mir bitte sagen, wo ich das Anmeldeformular abgeben kann?",
        meaning_vi: "Quý vị có thể vui lòng chỉ giúp tôi nơi nộp đơn đăng ký ở đâu không?",
        topic: "Lịch sự Konjunktiv II"
      }
    ];

    this.currentIndex = 0;
    this.initElements();
  }

  initElements() {
    const btnPlay = document.getElementById("btn-dictation-play");
    const btnCheck = document.getElementById("btn-dictation-check");
    const btnSolution = document.getElementById("btn-dictation-solution");
    const btnNext = document.getElementById("btn-dictation-next");
    const speedSelect = document.getElementById("dictation-speed-select");

    if (btnPlay) btnPlay.addEventListener("click", () => this.playAudio());
    if (btnCheck) btnCheck.addEventListener("click", () => this.checkAnswer());
    if (btnSolution) btnSolution.addEventListener("click", () => this.showSolution());
    if (btnNext) btnNext.addEventListener("click", () => this.nextSentence());

    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        this.speed = parseFloat(e.target.value) || 0.9;
      });
    }

    this.loadSentence(this.currentIndex);
  }

  loadSentence(index) {
    if (index >= this.sentences.length) {
      this.currentIndex = 0;
    }
    const item = this.sentences[this.currentIndex];

    const promptMeaning = document.getElementById("dictation-meaning");
    const promptLevel = document.getElementById("dictation-level");
    const promptTopic = document.getElementById("dictation-topic");
    const inputEl = document.getElementById("dictation-input");
    const feedbackBox = document.getElementById("dictation-feedback-box");
    const nextBtn = document.getElementById("btn-dictation-next");

    if (promptMeaning) promptMeaning.textContent = item.meaning_vi;
    if (promptLevel) promptLevel.textContent = item.level;
    if (promptTopic) promptTopic.textContent = item.topic;
    if (inputEl) {
      inputEl.value = "";
      inputEl.disabled = false;
    }
    if (feedbackBox) feedbackBox.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
  }

  playAudio() {
    const item = this.sentences[this.currentIndex];
    if (item && window.speechCtrl) {
      window.speechCtrl.speak(item.fullText, this.speed);
    }
  }

  analyzeGermanSpellingMistakes(userText, targetText) {
    const hints = [];
    const lowerUser = userText.toLowerCase();
    const lowerTarget = targetText.toLowerCase();

    // Check Umlaut misses
    if ((lowerTarget.includes("ä") && !lowerUser.includes("ä")) ||
        (lowerTarget.includes("ö") && !lowerUser.includes("ö")) ||
        (lowerTarget.includes("ü") && !lowerUser.includes("ü"))) {
      hints.push("⚠️ <b>Lỗi thiếu biến âm (Umlaut):</b> Tiếng Đức phân biệt rõ giữa <code>a/ä</code>, <code>o/ö</code>, <code>u/ü</code>. Hãy dùng bàn phím ảo hoặc gõ đúng ký tự biến âm.");
    }

    // Check Eszett ß miss
    if (lowerTarget.includes("ß") && !lowerUser.includes("ß")) {
      hints.push("⚠️ <b>Lỗi thiếu ký tự ß (Eszett):</b> Từ tiếng Đức có âm 'ß' (như <code>heißen</code>) không thể viết tùy tiện thành 's'.");
    }

    // Check Noun Capitalization
    const targetWords = targetText.split(/\s+/);
    const userWords = userText.split(/\s+/);
    let nounCapMiss = false;
    targetWords.forEach(w => {
      const cleanW = w.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
      if (cleanW && cleanW[0] === cleanW[0].toUpperCase() && cleanW.length > 1) {
        const found = userWords.find(uw => uw.toLowerCase() === cleanW.toLowerCase());
        if (found && found[0] !== found[0].toUpperCase()) {
          nounCapMiss = true;
        }
      }
    });

    if (nounCapMiss) {
      hints.push("💡 <b>Mẹo chính tả:</b> Trong tiếng Đức, TẤT CẢ các Danh từ đều phải viết hoa chữ cái đầu tiên (ví dụ: <code>Hausaufgaben</code>, <code>Freunden</code>)!");
    }

    return hints;
  }

  checkAnswer() {
    const item = this.sentences[this.currentIndex];
    const inputEl = document.getElementById("dictation-input");
    if (!inputEl) return;

    const userText = inputEl.value.trim();
    const cleanUser = userText.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
    const cleanCorrect = item.fullText.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');

    const isCorrect = (cleanUser === cleanCorrect);
    const feedbackBox = document.getElementById("dictation-feedback-box");
    const feedbackTitle = document.getElementById("dictation-feedback-title");
    const feedbackDetail = document.getElementById("dictation-feedback-detail");
    const nextBtn = document.getElementById("btn-dictation-next");

    if (!feedbackBox) return;
    feedbackBox.classList.remove("hidden");

    if (isCorrect) {
      feedbackBox.className = "p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 space-y-2";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-extrabold text-emerald-600 dark:text-emerald-400">Chính xác 100%! 🎉 Đôi tai của bạn rất tuyệt vời.</span>`;
      if (feedbackDetail) feedbackDetail.innerHTML = `Câu chuẩn: <b>${item.fullText}</b>`;
      if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      if (window.progressCtrl) window.progressCtrl.recordActivity("lesson", true, item.topic || "Nghe chép");
      if (nextBtn) nextBtn.classList.remove("hidden");
    } else {
      const diagHints = this.analyzeGermanSpellingMistakes(userText, item.fullText);

      feedbackBox.className = "p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 space-y-2";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-extrabold text-rose-600 dark:text-rose-400">Chưa hoàn toàn chính xác! ❌</span>`;
      
      let detailHtml = `<p>Đáp án đúng: <b class="text-blue-600 dark:text-blue-400">${item.fullText}</b></p>`;
      if (diagHints.length > 0) {
        detailHtml += `<div class="p-2.5 mt-2 bg-rose-100/60 dark:bg-rose-900/30 rounded-xl text-xs space-y-1">${diagHints.join("<br>")}</div>`;
      }

      if (feedbackDetail) feedbackDetail.innerHTML = detailHtml;
      if (window.speechCtrl) window.speechCtrl.playWrongSound();
      if (window.mistakesCtrl) {
        window.mistakesCtrl.addMistake({
          id: `dic_${item.id}`,
          type: "listening",
          level: item.level || "A1",
          question: `Nghe chép chính tả: "${item.meaning_vi}"`,
          userAnswer: userText || "(Chưa gõ)",
          correctAnswer: item.fullText,
          topic: item.topic || "Nghe chính tả",
          explanation: `Câu đúng là "${item.fullText}".`
        });
      }
    }
  }

  showSolution() {
    const item = this.sentences[this.currentIndex];
    const inputEl = document.getElementById("dictation-input");
    if (inputEl) inputEl.value = item.fullText;
    this.checkAnswer();
  }

  nextSentence() {
    this.currentIndex = (this.currentIndex + 1) % this.sentences.length;
    this.loadSentence(this.currentIndex);
  }
}

window.dictationCtrl = new DictationController();
