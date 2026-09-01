// WEB_Germany Reading Lab Controller (Leseverstehen A1-B1)

class ReadingController {
  constructor() {
    this.articles = [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.showVocab = false;

    this.initElements();
  }

  initElements() {
    const sel = document.getElementById("reading-article-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        this.currentIndex = parseInt(e.target.value) || 0;
        this.userAnswers = {};
        this.renderArticle();
      });
    }

    const btnToggleVocab = document.getElementById("btn-reading-toggle-vocab");
    if (btnToggleVocab) {
      btnToggleVocab.addEventListener("click", () => {
        this.showVocab = !this.showVocab;
        const box = document.getElementById("reading-vocab-box");
        if (box) box.classList.toggle("hidden", !this.showVocab);
        btnToggleVocab.textContent = this.showVocab ? "Ẩn từ vựng bài đọc 📖" : "Xem từ vựng quan trọng 💡";
      });
    }

    const btnAudio = document.getElementById("btn-reading-audio");
    if (btnAudio) {
      btnAudio.addEventListener("click", () => {
        if (!this.articles || !this.articles[this.currentIndex]) return;
        if (window.speechCtrl) {
          window.speechCtrl.speak(this.articles[this.currentIndex].text);
        }
      });
    }
  }

  async loadData() {
    if (this.articles.length > 0) return;
    try {
      const res = await fetch("./data/reading_data.json");
      this.articles = await res.json();
      this.populateSelect();
      this.renderArticle();
    } catch (e) {
      console.warn("Could not load reading data:", e);
    }
  }

  populateSelect() {
    const sel = document.getElementById("reading-article-select");
    if (!sel || !this.articles) return;

    sel.innerHTML = "";
    this.articles.forEach((art, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${art.level} • ${art.title}`;
      sel.appendChild(opt);
    });
  }

  renderArticle() {
    if (!this.articles || this.articles.length === 0) return;
    const art = this.articles[this.currentIndex];
    if (!art) return;

    const titleEl = document.getElementById("reading-title");
    const contextEl = document.getElementById("reading-context");
    const textEl = document.getElementById("reading-text-body");
    const vocabList = document.getElementById("reading-vocab-list");
    const questionsContainer = document.getElementById("reading-questions-container");
    const scoreBox = document.getElementById("reading-score-box");

    if (titleEl) titleEl.textContent = art.title;
    if (contextEl) contextEl.textContent = art.context;
    if (scoreBox) scoreBox.classList.add("hidden");

    if (textEl) {
      textEl.innerHTML = art.text.split("\n\n").map(p => `
        <p class="leading-relaxed text-gray-800 dark:text-gray-200 text-sm sm:text-base">${p.replace(/\n/g, '<br>')}</p>
      `).join("");
    }

    if (vocabList && art.vocab) {
      vocabList.innerHTML = art.vocab.map(v => `
        <div class="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs flex items-center justify-between">
          <span class="font-bold text-blue-900 dark:text-blue-200">${v.de}</span>
          <span class="text-gray-600 dark:text-gray-400">${v.vi}</span>
        </div>
      `).join("");
    }

    if (questionsContainer && art.questions) {
      questionsContainer.innerHTML = art.questions.map((q, qIdx) => `
        <div class="p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3 shadow-2xs">
          <div class="flex items-start gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">${qIdx + 1}</span>
            <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100">${q.q}</h4>
          </div>

          <div class="space-y-2 pt-1" id="q_opts_${qIdx}">
            ${q.options.map((opt, oIdx) => `
              <button class="w-full text-left p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-blue-500 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all flex items-center justify-between shadow-2xs" onclick="window.readingCtrl.selectAnswer(${qIdx}, ${oIdx})">
                <span>${opt}</span>
                <span class="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] text-gray-400 font-bold">${String.fromCharCode(65 + oIdx)}</span>
              </button>
            `).join("")}
          </div>

          <div id="q_fb_${qIdx}" class="hidden p-3 rounded-2xl text-xs space-y-1"></div>
        </div>
      `).join("");
    }
  }

  selectAnswer(qIdx, oIdx) {
    this.userAnswers[qIdx] = oIdx;
    const art = this.articles[this.currentIndex];
    const q = art.questions[qIdx];
    if (!q) return;

    const isCorrect = oIdx === q.answer;
    const fbBox = document.getElementById(`q_fb_${qIdx}`);
    const optsBox = document.getElementById(`q_opts_${qIdx}`);

    if (optsBox) {
      const btns = optsBox.querySelectorAll("button");
      btns.forEach((btn, idx) => {
        if (idx === q.answer) {
          btn.className = "w-full text-left p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold text-emerald-900 dark:text-emerald-200 transition-all flex items-center justify-between";
        } else if (idx === oIdx && !isCorrect) {
          btn.className = "w-full text-left p-3 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-900 dark:text-rose-200 transition-all flex items-center justify-between";
        } else {
          btn.className = "w-full text-left p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/20 opacity-50 text-xs text-gray-500";
        }
        btn.disabled = true;
      });
    }

    if (fbBox) {
      fbBox.classList.remove("hidden");
      if (isCorrect) {
        fbBox.className = "p-3 rounded-2xl text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 space-y-1";
        fbBox.innerHTML = `<div>✓ <b>Chính xác!</b></div><div class="text-[11px] opacity-90">${q.explanation}</div>`;
        if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      } else {
        fbBox.className = "p-3 rounded-2xl text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 space-y-1";
        fbBox.innerHTML = `<div>❌ <b>Chưa đúng.</b> Đáp án đúng là: <b>${q.options[q.answer]}</b></div><div class="text-[11px] opacity-90">💡 ${q.explanation}</div>`;
      }
    }

    // Record into Progress Learning Engine!
    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("reading", isCorrect, `read_${art.level.toLowerCase()}`);
    }
  }
}

window.readingCtrl = new ReadingController();
