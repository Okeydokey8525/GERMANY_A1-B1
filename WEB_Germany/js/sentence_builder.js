// WEB_Germany German Sentence Builder & Word Order Visualizer (V2 Rule & Clause Engine)

class SentenceBuilderController {
  constructor() {
    this.sentences = [
      {
        id: "sb_01",
        level: "A1",
        topicId: "w_fragen",
        objectiveId: "LO_W_02",
        meaning_vi: "Tôi đi đến trường học vào hôm nay.",
        correctOrder: ["Ich", "gehe", "heute", "zur", "Schule."],
        alternativeOrders: [
          ["Heute", "gehe", "ich", "zur", "Schule."]
        ],
        chips: ["gehe", "Schule.", "Ich", "zur", "heute"],
        slots: [
          { role: "Vị trí 1: Chủ ngữ", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Vị trí 2: Động từ chia (V2)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Vị trí 3: Thời gian (Wann?)", color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { role: "Vị trí 4: Nơi chốn (Wohin?)", color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" }
        ],
        explanation: "Quy tắc V2: Trong câu trần thuật tiếng Đức, động từ chia (gehe) LUÔN đứng ở vị trí số 2!"
      },
      {
        id: "sb_02",
        level: "A1",
        topicId: "modalverben",
        objectiveId: "LO_MOD_02",
        meaning_vi: "Nico có thể nói tiếng Đức rất tốt.",
        correctOrder: ["Nico", "kann", "sehr", "gut", "Deutsch", "sprechen."],
        chips: ["sprechen.", "kann", "Deutsch", "Nico", "sehr", "gut"],
        slots: [
          { role: "Vị trí 1: Chủ ngữ (Nico)", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Vị trí 2: Modalverb (kann)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Vị trí 3: Bổ ngữ (sehr gut Deutsch)", color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { role: "Vị trí cuối: Động từ nguyên thể (sprechen)", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30 font-bold" }
        ],
        explanation: "Cấu trúc Modalverb: Động từ khuyết thiếu 'kann' đứng ở vị trí số 2, động từ chính nguyên thể 'sprechen' bị đẩy về CUỐI CÂU!"
      },
      {
        id: "sb_03",
        level: "A1",
        topicId: "praesens",
        objectiveId: "LO_PRAES_03",
        meaning_vi: "Mỗi ngày tôi thức dậy lúc 7 giờ sáng.",
        correctOrder: ["Ich", "stehe", "jeden", "Tag", "um", "7", "Uhr", "auf."],
        chips: ["auf.", "Ich", "jeden", "stehe", "Uhr", "um", "Tag", "7"],
        slots: [
          { role: "Vị trí 1: Chủ ngữ (Ich)", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Vị trí 2: Động từ gốc chia (stehe)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Vị trí 3: Thời gian (jeden Tag um 7 Uhr)", color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { role: "Vị trí cuối: Tiền tố tách (auf)", color: "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 font-bold" }
        ],
        explanation: "Động từ tách (aufstehen): Gốc động từ 'stehe' chia ở vị trí số 2, tiền tố 'auf' bị tách và đứng ở CUỐI CÂU!"
      },
      {
        id: "sb_04",
        level: "A2",
        topicId: "nebensaetze",
        objectiveId: "LO_NEB_01",
        meaning_vi: "Tôi học tiếng Đức vì tôi muốn du học tại Đức.",
        correctOrder: ["Ich", "lerne", "Deutsch,", "weil", "ich", "in", "Deutschland", "studieren", "möchte."],
        chips: ["möchte.", "lerne", "studieren", "Deutsch,", "Ich", "weil", "Deutschland", "ich", "in"],
        slots: [
          { role: "Mệnh đề chính: V2 (lerne)", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Liên từ phụ thuộc: weil", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
          { role: "Mệnh đề phụ: Động từ chia ở CUỐI CÂU (möchte)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" }
        ],
        explanation: "Mệnh đề phụ với liên từ 'weil': Toàn bộ động từ bị đẩy về cuối câu, trong đó động từ chia (möchte) đứng ở vị trí cuối cùng!"
      },
      {
        id: "sb_05",
        level: "A2",
        topicId: "wechselpraepositionen",
        objectiveId: "LO_WECH_03",
        meaning_vi: "Tôi đặt cuốn sách lên trên mặt bàn.",
        correctOrder: ["Ich", "lege", "das", "Buch", "auf", "den", "Tisch."],
        chips: ["Buch", "auf", "Ich", "den", "lege", "das", "Tisch."],
        slots: [
          { role: "Chủ ngữ (Ich)", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Hành động di chuyển (legen)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Tân ngữ trực tiếp (das Buch)", color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { role: "Hướng di chuyển: Wohin? + Akkusativ (auf den Tisch)", color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-bold" }
        ],
        explanation: "Giới từ 2 chiều (Wechselpräpositionen): Hành động đặt sách (legen) chỉ hướng di chuyển (Wohin?) nên dùng Akkusativ (den Tisch)!"
      },
      {
        id: "sb_06",
        level: "B1",
        topicId: "passiv",
        objectiveId: "LO_PAS_01",
        meaning_vi: "Ở nước Đức, rất nhiều bia được tiêu thụ mỗi năm.",
        correctOrder: ["In", "Deutschland", "wird", "jedes", "Jahr", "viel", "Bier", "getrunken."],
        chips: ["getrunken.", "Deutschland", "jedes", "In", "viel", "wird", "Jahr", "Bier"],
        slots: [
          { role: "Cụm vị trí / thời gian", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Trợ động từ bị động: wird (V2)", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Chủ từ ngữ nghĩa (viel Bier)", color: "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
          { role: "Phân từ II ở cuối câu: getrunken", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30 font-bold" }
        ],
        explanation: "Thể bị động Passiv ở thì Hiện tại: Cấu trúc werden (chia ở V2) + Tân ngữ + Partizip II (ở cuối câu)!"
      },
      {
        id: "sb_07",
        level: "B1",
        topicId: "konjunktiv2",
        objectiveId: "LO_KONJ_02",
        meaning_vi: "Nếu tôi có nhiều thời gian, tôi sẽ đi du lịch đến Berlin.",
        correctOrder: ["Wenn", "ich", "mehr", "Zeit", "hätte,", "würde", "ich", "nach", "Berlin", "reisen."],
        chips: ["hätte,", "würde", "nach", "Wenn", "mehr", "ich", "Berlin", "reisen.", "ich", "Zeit"],
        slots: [
          { role: "Mệnh đề phụ giả định: hätte,", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
          { role: "Vị trí 1 mệnh đề chính: würde", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold" },
          { role: "Chủ ngữ (ich)", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
          { role: "Động từ nguyên thể cuối câu: reisen.", color: "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 font-bold" }
        ],
        explanation: "Thể giả định Konjunktiv II: Mệnh đề điều kiện ước muốn với 'hätte' kết hợp cấu trúc 'würde + Infinitiv'!"
      }
    ];

    this.currentIndex = 0;
    this.selectedChips = [];
    this.availableChips = [];

    this.initElements();
  }

  initElements() {
    const btnCheck = document.getElementById("sb-btn-check");
    const btnSolution = document.getElementById("sb-btn-solution");
    const btnReset = document.getElementById("sb-btn-reset");
    const btnNext = document.getElementById("sb-btn-next");

    if (btnCheck) btnCheck.addEventListener("click", () => this.checkSentence());
    if (btnSolution) btnSolution.addEventListener("click", () => this.showSolution());
    if (btnReset) btnReset.addEventListener("click", () => this.resetSentence());
    if (btnNext) btnNext.addEventListener("click", () => this.nextSentence());

    this.loadSentence(this.currentIndex);
  }

  loadSentence(index) {
    if (index >= this.sentences.length) {
      this.currentIndex = 0;
    }
    const item = this.sentences[this.currentIndex];

    const promptMeaning = document.getElementById("sb-prompt-meaning");
    const promptLevel = document.getElementById("sb-prompt-level");
    const feedbackBox = document.getElementById("sb-feedback-box");
    const nextBtn = document.getElementById("sb-btn-next");

    if (promptMeaning) promptMeaning.textContent = item.meaning_vi;
    if (promptLevel) promptLevel.textContent = item.level;
    if (feedbackBox) feedbackBox.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");

    this.selectedChips = [];
    this.availableChips = [...item.chips].sort(() => 0.5 - Math.random());
    this.renderChips();
    this.renderSlotsGuide(item);
  }

  renderChips() {
    const dropZone = document.getElementById("sb-drop-zone");
    const bankZone = document.getElementById("sb-bank-zone");

    if (dropZone) {
      dropZone.innerHTML = "";
      if (this.selectedChips.length === 0) {
        dropZone.innerHTML = `<span class="text-xs text-gray-400 italic">Nhấp các thẻ từ bên dưới để đưa vào câu theo đúng thứ tự...</span>`;
      } else {
        this.selectedChips.forEach((word, idx) => {
          const chip = document.createElement("button");
          chip.className = "px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer";
          chip.innerHTML = `<span>${word}</span> <span class="text-[10px] opacity-75">✕</span>`;
          chip.addEventListener("click", () => {
            this.selectedChips.splice(idx, 1);
            this.availableChips.push(word);
            this.renderChips();
          });
          dropZone.appendChild(chip);
        });
      }
    }

    if (bankZone) {
      bankZone.innerHTML = "";
      this.availableChips.forEach((word, idx) => {
        const chip = document.createElement("button");
        chip.className = "px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm border border-gray-200 dark:border-gray-600 shadow-2xs active:scale-95 transition-all cursor-pointer";
        chip.textContent = word;
        chip.addEventListener("click", () => {
          this.availableChips.splice(idx, 1);
          this.selectedChips.push(word);
          this.renderChips();
        });
        bankZone.appendChild(chip);
      });
    }
  }

  renderSlotsGuide(item) {
    const container = document.getElementById("sb-slots-guide");
    if (!container || !item.slots) return;

    container.innerHTML = "";
    item.slots.forEach(slot => {
      const pill = document.createElement("div");
      pill.className = `px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${slot.color}`;
      pill.textContent = slot.role;
      container.appendChild(pill);
    });
  }

  checkSentence() {
    const item = this.sentences[this.currentIndex];
    const userStr = this.selectedChips.join(" ").trim();
    const correctStr = item.correctOrder.join(" ").trim();
    
    let isCorrect = (userStr === correctStr);
    if (!isCorrect && item.alternativeOrders) {
      isCorrect = item.alternativeOrders.some(alt => alt.join(" ").trim() === userStr);
    }

    const feedbackBox = document.getElementById("sb-feedback-box");
    const feedbackTitle = document.getElementById("sb-feedback-title");
    const feedbackExpl = document.getElementById("sb-feedback-expl");
    const nextBtn = document.getElementById("sb-btn-next");

    if (!feedbackBox) return;
    feedbackBox.classList.remove("hidden");

    if (isCorrect) {
      feedbackBox.className = "p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-extrabold text-emerald-600 dark:text-emerald-400">✓ Chính xác tuyệt đối! 🎉</span>`;
      if (feedbackExpl) feedbackExpl.innerHTML = `💡 <b>Quy tắc:</b> ${item.explanation}`;
      if (window.speechCtrl) {
        window.speechCtrl.playCorrectSound();
        window.speechCtrl.speak(userStr);
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("grammar", true, item.topicId || "w_fragen", item.objectiveId || "LO_W_02");
      }
      if (nextBtn) nextBtn.classList.remove("hidden");
    } else {
      feedbackBox.className = "p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100";
      if (feedbackTitle) feedbackTitle.innerHTML = `<span class="font-extrabold text-rose-600 dark:text-rose-400">❌ Trật tự từ chưa đúng!</span>`;
      if (feedbackExpl) feedbackExpl.innerHTML = `Đáp án chuẩn: <span class="font-bold underline">${correctStr}</span><br>💡 <b>Lưu ý:</b> ${item.explanation}`;
      if (window.speechCtrl) window.speechCtrl.playWrongSound();
      if (window.mistakesCtrl) {
        window.mistakesCtrl.addMistake({
          id: `sb_${item.id}`,
          type: "grammar",
          level: item.level || "A1",
          question: `Trật tự câu: "${item.meaning_vi}"`,
          userAnswer: userStr || "(Chưa hoàn thành)",
          correctAnswer: correctStr,
          topicId: item.topicId || "w_fragen",
          objectiveId: item.objectiveId || "LO_W_02",
          topic: "Trật tự từ (Word Order)",
          explanation: item.explanation
        });
      }
      if (window.progressCtrl) {
        window.progressCtrl.recordActivity("grammar", false, item.topicId || "w_fragen", item.objectiveId || "LO_W_02");
      }
    }
  }

  showSolution() {
    const item = this.sentences[this.currentIndex];
    this.selectedChips = [...item.correctOrder];
    this.availableChips = [];
    this.renderChips();
    this.checkSentence();
  }

  resetSentence() {
    const item = this.sentences[this.currentIndex];
    this.selectedChips = [];
    this.availableChips = [...item.chips].sort(() => 0.5 - Math.random());
    this.renderChips();

    const feedbackBox = document.getElementById("sb-feedback-box");
    if (feedbackBox) feedbackBox.classList.add("hidden");
  }

  nextSentence() {
    this.currentIndex = (this.currentIndex + 1) % this.sentences.length;
    this.loadSentence(this.currentIndex);
  }
}

window.sentenceBuilderCtrl = new SentenceBuilderController();
