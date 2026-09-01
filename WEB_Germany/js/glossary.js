// WEB_Germany German Grammar Dictionary & Glossary Controller

class GlossaryController {
  constructor() {
    this.terms = [];
    this.filteredTerms = [];
    this.initGlossary();
    this.initElements();
  }

  async initGlossary() {
    try {
      const resp = await fetch("./data/glossary.json");
      this.terms = await resp.json();
      this.filteredTerms = [...this.terms];
      this.renderGlossary();
    } catch (e) {
      console.warn("Failed to load glossary.json:", e);
    }
  }

  initElements() {
    const searchInput = document.getElementById("glossary-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          this.filteredTerms = [...this.terms];
        } else {
          this.filteredTerms = this.terms.filter(t => 
            t.term.toLowerCase().includes(query) || 
            t.definition.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query)
          );
        }
        this.renderGlossary();
      });
    }
  }

  renderGlossary() {
    const container = document.getElementById("glossary-terms-container");
    if (!container) return;

    if (this.filteredTerms.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-xs text-gray-400">Không tìm thấy thuật ngữ ngữ pháp phù hợp.</div>`;
      return;
    }

    container.innerHTML = "";
    this.filteredTerms.forEach(t => {
      const card = document.createElement("div");
      card.className = "p-5 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs space-y-3";

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">${t.category}</span>
            <h3 class="font-extrabold text-base text-gray-900 dark:text-white">${t.term}</h3>
          </div>
          <span class="text-xs text-gray-400 font-mono italic">${t.question || ''}</span>
        </div>

        <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">${t.definition}</p>

        ${t.examples ? `
          <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-1.5">
            <span class="text-[10px] font-bold text-gray-400 uppercase">Ví dụ thực tế:</span>
            ${t.examples.map(ex => `
              <div class="text-xs">
                <span class="font-bold text-blue-600 dark:text-blue-400">${ex.de}</span>
                <span class="text-gray-500 dark:text-gray-400 italic ml-1">(${ex.vi})</span>
              </div>
            `).join("")}
          </div>
        ` : ''}

        ${t.tips ? `
          <div class="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
            💡 <b>Mẹo ghi nhớ:</b> ${t.tips}
          </div>
        ` : ''}
      `;

      container.appendChild(card);
    });
  }
}

window.glossaryCtrl = new GlossaryController();
