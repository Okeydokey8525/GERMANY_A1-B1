// WEB_Germany Grammar & Verb Lookup Module

class GrammarController {
  constructor() {
    this.grammarData = null;
    this.currentCase = "nominativ";
    this.verbSearchQuery = "";
    this.verbLevelFilter = "ALL";

    this.initElements();
  }

  initElements() {
    // Case Switcher tabs
    ["nominativ", "akkusativ", "dativ", "genitiv"].forEach(c => {
      const btn = document.getElementById(`btn-case-${c}`);
      if (btn) {
        btn.addEventListener("click", () => this.switchCase(c));
      }
    });

    // Verb search input
    const verbSearch = document.getElementById("verb-search-input");
    if (verbSearch) {
      verbSearch.addEventListener("input", (e) => {
        this.verbSearchQuery = e.target.value.toLowerCase().trim();
        this.renderVerbTable();
      });
    }

    // Verb level filter buttons
    document.querySelectorAll(".verb-lvl-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const lvl = e.target.getAttribute("data-level");
        this.verbLevelFilter = lvl;
        
        document.querySelectorAll(".verb-lvl-btn").forEach(b => {
          b.className = (b.getAttribute("data-level") === lvl)
            ? "verb-lvl-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm"
            : "verb-lvl-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
        });

        this.renderVerbTable();
      });
    });
  }

  setData(data) {
    this.grammarData = data;
    this.renderCaseTable();
    this.renderPrepositions();
    this.renderVerbTable();
  }

  switchCase(caseKey) {
    this.currentCase = caseKey;
    
    // Update active tab buttons
    ["nominativ", "akkusativ", "dativ", "genitiv"].forEach(c => {
      const btn = document.getElementById(`btn-case-${c}`);
      if (btn) {
        if (c === caseKey) {
          btn.className = "px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        } else {
          btn.className = "px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        }
      }
    });

    this.renderCaseTable();
  }

  renderCaseTable() {
    if (!this.grammarData || !this.grammarData.articles_by_case) return;
    const caseData = this.grammarData.articles_by_case[this.currentCase];
    if (!caseData) return;

    // Header info
    const titleEl = document.getElementById("case-title-display");
    const questionEl = document.getElementById("case-question-display");
    if (titleEl) titleEl.textContent = caseData.name;
    if (questionEl) questionEl.textContent = `Câu hỏi nhận biết: ${caseData.question}`;

    // Table cells
    const setCell = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "-";
    };

    // Bestimmter
    setCell("cell-bestimmt-m", caseData.bestimmt.maskulin);
    setCell("cell-bestimmt-f", caseData.bestimmt.feminin);
    setCell("cell-bestimmt-n", caseData.bestimmt.neutral);
    setCell("cell-bestimmt-p", caseData.bestimmt.plural);

    // Unbestimmter
    setCell("cell-unbestimmt-m", caseData.unbestimmt.maskulin);
    setCell("cell-unbestimmt-f", caseData.unbestimmt.feminin);
    setCell("cell-unbestimmt-n", caseData.unbestimmt.neutral);
    setCell("cell-unbestimmt-p", caseData.unbestimmt.plural);

    // Negativ
    setCell("cell-negativ-m", caseData.negativ.maskulin);
    setCell("cell-negativ-f", caseData.negativ.feminin);
    setCell("cell-negativ-n", caseData.negativ.neutral);
    setCell("cell-negativ-p", caseData.negativ.plural);

    // Possessiv
    setCell("cell-possessiv-m", caseData.possessiv.maskulin);
    setCell("cell-possessiv-f", caseData.possessiv.feminin);
    setCell("cell-possessiv-n", caseData.possessiv.neutral);
    setCell("cell-possessiv-p", caseData.possessiv.plural);

    // Adjektivendungen
    setCell("cell-adj-bestimmt-m", caseData.adj_bestimmt.maskulin);
    setCell("cell-adj-bestimmt-f", caseData.adj_bestimmt.feminin);
    setCell("cell-adj-bestimmt-n", caseData.adj_bestimmt.neutral);
    setCell("cell-adj-bestimmt-p", caseData.adj_bestimmt.plural);

    setCell("cell-adj-unbestimmt-m", caseData.adj_unbestimmt.maskulin);
    setCell("cell-adj-unbestimmt-f", caseData.adj_unbestimmt.feminin);
    setCell("cell-adj-unbestimmt-n", caseData.adj_unbestimmt.neutral);
    setCell("cell-adj-unbestimmt-p", caseData.adj_unbestimmt.plural);
  }

  renderPrepositions() {
    if (!this.grammarData || !this.grammarData.prepositions) return;
    const prepContainer = document.getElementById("prepositions-container");
    if (!prepContainer) return;

    prepContainer.innerHTML = "";
    const pData = this.grammarData.prepositions;

    const cards = [
      { key: "akkusativ", color: "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20", title: "Akkusativ Prepositions", tag: "DOGFU / FUDGE" },
      { key: "dativ", color: "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20", title: "Dativ Prepositions", tag: "Blue Monday" },
      { key: "wechsel", color: "border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20", title: "Wechselpräpositionen", tag: "Akk: Wohin / Dat: Wo" },
      { key: "genitiv", color: "border-purple-500 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/20", title: "Genitiv Prepositions", tag: "B1 Level" }
    ];

    cards.forEach(c => {
      const item = pData[c.key];
      if (!item) return;

      const cardEl = document.createElement("div");
      cardEl.className = `p-4 sm:p-5 rounded-2xl border-2 ${c.color} shadow-sm`;
      
      const listHtml = item.list.map(prep => `
        <li class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          <span>${prep}</span>
        </li>
      `).join("");

      cardEl.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white">${item.name}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-xs">${c.tag}</span>
        </div>
        <ul class="space-y-1.5">
          ${listHtml}
        </ul>
      `;
      prepContainer.appendChild(cardEl);
    });
  }

  renderVerbTable() {
    if (!this.grammarData || !this.grammarData.irregular_verbs) return;
    const tbody = document.getElementById("verb-table-body");
    const countEl = document.getElementById("verb-count-display");
    if (!tbody) return;

    const filtered = this.grammarData.irregular_verbs.filter(v => {
      if (this.verbLevelFilter !== "ALL" && v.level !== this.verbLevelFilter) return false;
      if (this.verbSearchQuery) {
        const matchInf = v.infinitiv.toLowerCase().includes(this.verbSearchQuery);
        const matchPra = v.prasens.toLowerCase().includes(this.verbSearchQuery);
        const matchPrt = v.prateritum.toLowerCase().includes(this.verbSearchQuery);
        const matchPer = v.perfekt.toLowerCase().includes(this.verbSearchQuery);
        const matchVi = v.meaning_vi.toLowerCase().includes(this.verbSearchQuery);
        if (!matchInf && !matchPra && !matchPrt && !matchPer && !matchVi) return false;
      }
      return true;
    });

    if (countEl) countEl.textContent = `${filtered.length} động từ`;

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">Không tìm thấy động từ phù hợp</td></tr>`;
      return;
    }

    filtered.forEach(v => {
      const tr = document.createElement("tr");
      tr.className = "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors text-xs sm:text-sm";
      tr.innerHTML = `
        <td class="py-3 px-3 sm:px-4 font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <span>${v.infinitiv}</span>
          <button class="speaker-btn p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500" title="Nghe phát âm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          </button>
        </td>
        <td class="py-3 px-3 sm:px-4 font-medium text-gray-700 dark:text-gray-300">${v.prasens}</td>
        <td class="py-3 px-3 sm:px-4 font-medium text-gray-700 dark:text-gray-300">${v.prateritum}</td>
        <td class="py-3 px-3 sm:px-4 font-medium text-gray-700 dark:text-gray-300">${v.perfekt}</td>
        <td class="py-3 px-3 sm:px-4 text-gray-600 dark:text-gray-400">${v.meaning_vi}</td>
        <td class="py-3 px-3 sm:px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
            v.level === 'A1' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
            v.level === 'A2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
            'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
          }">${v.level}</span>
        </td>
      `;

      const btnSpeak = tr.querySelector(".speaker-btn");
      if (btnSpeak) {
        btnSpeak.addEventListener("click", () => {
          if (window.speechCtrl) {
            window.speechCtrl.speak(`${v.infinitiv}, ${v.prasens}, ${v.prateritum}, ${v.perfekt}`);
          }
        });
      }

      tbody.appendChild(tr);
    });
  }
}

window.grammarCtrl = new GrammarController();
