// WEB_Germany Survival German (Interactive Scenario-Based Learning A1-B1)

class SurvivalController {
  constructor() {
    this.scenarios = [];
    this.initSurvival();
  }

  async initSurvival() {
    try {
      const resp = await fetch("./data/survival_german.json");
      this.scenarios = await resp.json();
      this.renderSurvivalCards();
    } catch (e) {
      console.warn("Failed to load survival_german.json:", e);
    }
  }

  renderSurvivalCards() {
    const container = document.getElementById("survival-cards-container");
    if (!container || this.scenarios.length === 0) return;

    container.innerHTML = "";
    this.scenarios.forEach((sc, scIdx) => {
      const card = document.createElement("div");
      card.className = "p-5 rounded-3xl border-2 border-indigo-100 dark:border-indigo-950/40 bg-white dark:bg-gray-800 shadow-sm space-y-4";
      
      const vocabHtml = (sc.vocab || []).map(v => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
          <b>${v.de}</b>: <span class="text-gray-500 dark:text-gray-400 text-[11px]">${v.vi}</span>
        </span>
      `).join(" ");

      const phrasesHtml = (sc.phrases || []).map(p => `
        <div class="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div class="space-y-0.5">
            <div class="text-xs font-bold text-gray-900 dark:text-white">“${p.de}”</div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400 italic">${p.vi}</div>
          </div>
          <button class="phrase-audio-btn p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all text-xs shrink-0" data-audio-text="${p.de}" title="Nghe phát âm">
            🔊
          </button>
        </div>
      `).join("");

      const dialogueHtml = (sc.dialogue || []).map(d => `
        <div class="flex items-start gap-2.5 text-xs text-gray-800 dark:text-gray-200">
          <span class="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-extrabold text-[10px] shrink-0 mt-0.5">${d.speaker}</span>
          <div>
            <div class="font-bold text-gray-900 dark:text-gray-100">${d.de}</div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400 italic">${d.vi}</div>
          </div>
        </div>
      `).join("");

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${sc.icon}</span>
            <div>
              <h3 class="font-extrabold text-base text-gray-900 dark:text-white">${sc.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">${sc.desc}</p>
            </div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">${sc.level}</span>
        </div>

        ${vocabHtml ? `
          <div class="space-y-1.5">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">1. Từ vựng trọng tâm:</span>
            <div class="flex flex-wrap gap-1.5">${vocabHtml}</div>
          </div>
        ` : ''}

        <div class="space-y-2">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-wider">2. Mẫu câu giao tiếp thiết yếu:</span>
          <div class="space-y-1.5">${phrasesHtml}</div>
        </div>

        ${dialogueHtml ? `
          <div class="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">3. Hội thoại mẫu:</span>
              <button class="dialogue-full-audio-btn text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1">
                <span>🔊 Nghe cả bài</span>
              </button>
            </div>
            <div class="space-y-2">${dialogueHtml}</div>
          </div>
        ` : ''}

        ${sc.testQuestion ? `
          <div class="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
            <span class="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">4. Mini Quiz phản xạ tình huống:</span>
            <div class="text-xs font-bold text-gray-800 dark:text-gray-200">${sc.testQuestion.question}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5" id="surv_opts_${scIdx}">
              ${sc.testQuestion.options.map((opt, oIdx) => `
                <button class="text-left p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all font-semibold flex items-center justify-between" onclick="window.survivalCtrl.checkScenarioAnswer(${scIdx}, ${oIdx})">
                  <span>${opt}</span>
                  <span class="text-[10px] text-gray-400">${String.fromCharCode(65 + oIdx)}</span>
                </button>
              `).join("")}
            </div>
            <div id="surv_fb_${scIdx}" class="hidden p-2 rounded-xl text-xs"></div>
          </div>
        ` : ''}
      `;

      card.querySelectorAll(".phrase-audio-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const text = btn.getAttribute("data-audio-text");
          if (text && window.speechCtrl) window.speechCtrl.speak(text);
        });
      });

      const fullAudioBtn = card.querySelector(".dialogue-full-audio-btn");
      if (fullAudioBtn && sc.dialogue) {
        fullAudioBtn.addEventListener("click", () => {
          const fullText = sc.dialogue.map(d => `${d.speaker}: ${d.de}`).join(". ");
          if (window.speechCtrl) window.speechCtrl.speak(fullText);
        });
      }

      container.appendChild(card);
    });
  }

  checkScenarioAnswer(scIdx, oIdx) {
    const sc = this.scenarios[scIdx];
    if (!sc || !sc.testQuestion) return;

    const chosenOpt = sc.testQuestion.options[oIdx];
    const isCorrect = chosenOpt === sc.testQuestion.answer;
    const fb = document.getElementById(`surv_fb_${scIdx}`);
    const optsBox = document.getElementById(`surv_opts_${scIdx}`);

    if (optsBox) {
      const btns = optsBox.querySelectorAll("button");
      btns.forEach((btn, idx) => {
        if (sc.testQuestion.options[idx] === sc.testQuestion.answer) {
          btn.className = "text-left p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-between";
        } else if (idx === oIdx && !isCorrect) {
          btn.className = "text-left p-2.5 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-900 dark:text-rose-200 font-bold flex items-center justify-between";
        } else {
          btn.className = "text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 opacity-50 text-xs text-gray-500";
        }
        btn.disabled = true;
      });
    }

    if (fb) {
      fb.classList.remove("hidden");
      if (isCorrect) {
        fb.className = "p-2 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200";
        fb.innerHTML = `✓ <b>Chính xác!</b> ${sc.testQuestion.explanation || ''}`;
        if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      } else {
        fb.className = "p-2 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200";
        fb.innerHTML = `❌ <b>Chưa đúng.</b> ${sc.testQuestion.explanation || ''}`;
      }
    }

    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("speaking", isCorrect, `surv_${sc.level.toLowerCase()}`);
    }
  }
}

window.survivalCtrl = new SurvivalController();
