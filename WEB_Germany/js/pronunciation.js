// WEB_Germany German Pronunciation & Phonetics Guide Controller

class PronunciationController {
  constructor() {
    this.guides = [];
    this.initGuides();
  }

  async initGuides() {
    try {
      const resp = await fetch("./data/pronunciation.json");
      this.guides = await resp.json();
      this.renderPronunciationGuide();
    } catch (e) {
      console.warn("Failed to load pronunciation.json:", e);
    }
  }

  renderPronunciationGuide() {
    const container = document.getElementById("pronunciation-guide-container");
    if (!container) return;

    if (this.guides.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-xs text-gray-400">Đang tải bảng hướng dẫn phát âm...</div>`;
      return;
    }

    container.innerHTML = "";
    this.guides.forEach(g => {
      const block = document.createElement("div");
      block.className = "p-5 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs space-y-4";

      block.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">${g.category}</span>
            <h3 class="font-extrabold text-base text-gray-900 dark:text-white">${g.title}</h3>
          </div>
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-300">${g.desc}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          ${g.items.map(item => `
            <div class="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-base font-black text-blue-600 dark:text-blue-400 font-mono">${item.symbol}</span>
                <span class="text-xs font-mono font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md">${item.ipa}</span>
              </div>
              <p class="text-[11px] text-gray-700 dark:text-gray-300">👄 <b>Khẩu hình:</b> ${item.mouth}</p>
              
              <div class="space-y-1 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Từ ví dụ phát âm:</span>
                <div class="flex flex-wrap gap-2">
                  ${item.examples.map(ex => `
                    <button class="pronounce-btn px-2.5 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 transition-all shadow-2xs" data-word="${ex.de}">
                      <span>🔊 ${ex.de}</span>
                      <span class="text-[10px] text-gray-400 font-normal">(${ex.phonetic})</span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      block.querySelectorAll(".pronounce-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const word = btn.getAttribute("data-word");
          if (word && window.speechCtrl) {
            window.speechCtrl.speak(word);
          }
        });
      });

      container.appendChild(block);
    });
  }
}

window.pronunciationCtrl = new PronunciationController();
