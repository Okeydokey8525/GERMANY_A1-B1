// WEB_Germany Survival German (Tình huống giao tiếp thực tế A1) Controller

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
    this.scenarios.forEach(sc => {
      const card = document.createElement("div");
      card.className = "p-5 rounded-3xl border-2 border-indigo-100 dark:border-indigo-950/40 bg-white dark:bg-gray-800 shadow-sm space-y-3";
      
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${sc.icon}</span>
            <div>
              <h3 class="font-extrabold text-base text-gray-900 dark:text-white">${sc.title}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">${sc.desc}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">${sc.level}</span>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          ${sc.phrases.map(p => `
            <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 flex items-center justify-between gap-2">
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-gray-900 dark:text-white">${p.de}</div>
                <div class="text-[11px] text-gray-500 dark:text-gray-400 italic">${p.vi}</div>
              </div>
              <button class="phrase-audio-btn p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all" data-audio-text="${p.de}" title="Nghe phát âm">
                🔊
              </button>
            </div>
          `).join("")}
        </div>
      `;

      card.querySelectorAll(".phrase-audio-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const text = btn.getAttribute("data-audio-text");
          if (text && window.speechCtrl) {
            window.speechCtrl.speak(text);
          }
        });
      });

      container.appendChild(card);
    });
  }
}

window.survivalCtrl = new SurvivalController();
