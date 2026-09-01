// WEB_Germany Guided Writing Studio Controller (Schreiben A1-B1 with Criteria Self-Evaluation)

class WritingController {
  constructor() {
    this.tasks = [];
    this.currentIndex = 0;
    this.userText = "";

    this.initElements();
  }

  initElements() {
    const sel = document.getElementById("writing-task-select");
    if (sel) {
      sel.addEventListener("change", (e) => {
        this.currentIndex = parseInt(e.target.value) || 0;
        this.userText = "";
        this.renderTask();
      });
    }

    const textarea = document.getElementById("writing-user-input");
    if (textarea) {
      textarea.addEventListener("input", (e) => {
        this.userText = e.target.value;
        this.updateWordCount();
      });
    }

    const btnShowModel = document.getElementById("btn-writing-show-model");
    if (btnShowModel) {
      btnShowModel.addEventListener("click", () => {
        const box = document.getElementById("writing-model-answer-box");
        if (box) box.classList.toggle("hidden");
      });
    }

    const btnSubmitReview = document.getElementById("btn-writing-submit");
    if (btnSubmitReview) {
      btnSubmitReview.addEventListener("click", () => this.submitTask());
    }
  }

  async loadData() {
    if (this.tasks.length > 0) return;
    try {
      const res = await fetch("./data/writing_data.json");
      this.tasks = await res.json();
      this.populateSelect();
      this.renderTask();
    } catch (e) {
      console.warn("Could not load writing data:", e);
    }
  }

  populateSelect() {
    const sel = document.getElementById("writing-task-select");
    if (!sel || !this.tasks) return;

    sel.innerHTML = "";
    this.tasks.forEach((t, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${t.level} • ${t.title}`;
      sel.appendChild(opt);
    });
  }

  renderTask() {
    if (!this.tasks || this.tasks.length === 0) return;
    const task = this.tasks[this.currentIndex];
    if (!task) return;

    const titleEl = document.getElementById("writing-task-title");
    const contextEl = document.getElementById("writing-task-context");
    const promptEl = document.getElementById("writing-task-prompt");
    const targetWordsEl = document.getElementById("writing-target-words");
    const phrasesContainer = document.getElementById("writing-phrases-container");
    const checklistContainer = document.getElementById("writing-checklist-container");
    const modelTextEl = document.getElementById("writing-model-text");
    const breakdownEl = document.getElementById("writing-model-breakdown");
    const textarea = document.getElementById("writing-user-input");
    const modelBox = document.getElementById("writing-model-answer-box");

    if (titleEl) titleEl.textContent = task.title;
    if (contextEl) contextEl.textContent = task.context;
    if (promptEl) promptEl.textContent = task.prompt;
    if (targetWordsEl) targetWordsEl.textContent = `Mục tiêu: ${task.wordCountTarget}`;
    if (textarea) textarea.value = "";
    if (modelBox) modelBox.classList.add("hidden");

    this.updateWordCount();

    if (phrasesContainer && task.usefulPhrases) {
      phrasesContainer.innerHTML = task.usefulPhrases.map(p => `
        <div class="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all" onclick="window.writingCtrl.insertPhrase('${p.de}')" title="Nhấp để chèn vào bài viết">
          <span class="font-bold text-indigo-900 dark:text-indigo-200">“${p.de}”</span>
          <span class="text-gray-500 dark:text-gray-400 text-[11px]">${p.vi}</span>
        </div>
      `).join("");
    }

    if (checklistContainer && task.checklist) {
      checklistContainer.innerHTML = task.checklist.map((item, idx) => `
        <label class="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <input type="checkbox" id="chk_crit_${idx}" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
          <span>${item}</span>
        </label>
      `).join("");
    }

    if (modelTextEl) modelTextEl.innerHTML = task.modelAnswer.replace(/\n/g, '<br>');
    if (breakdownEl) breakdownEl.innerHTML = task.breakdown.replace(/\n/g, '<br>');
  }

  insertPhrase(phrase) {
    const textarea = document.getElementById("writing-user-input");
    if (!textarea) return;

    const cur = textarea.value;
    textarea.value = cur ? `${cur}\n${phrase}` : phrase;
    this.userText = textarea.value;
    this.updateWordCount();
    textarea.focus();
  }

  updateWordCount() {
    const counterEl = document.getElementById("writing-word-count");
    if (!counterEl) return;

    const words = (this.userText || "").trim().split(/\s+/).filter(Boolean).length;
    counterEl.textContent = `${words} từ`;
  }

  analyzeTextQuality(text) {
    const lower = text.toLowerCase();
    const hasGreeting = /^(hallo|guten tag|sehr geehrte|liebe|lieber)/i.test(text.trim());
    const hasClosing = /(viele grüße|mit freundlichen grüßen|schöne grüße|herzliche grüße|tschüss)/i.test(lower);
    const hasPunctuation = /[.!?]/.test(text);

    return {
      hasGreeting,
      hasClosing,
      hasPunctuation
    };
  }

  submitTask() {
    const task = this.tasks[this.currentIndex];
    if (!task) return;

    const words = (this.userText || "").trim().split(/\s+/).filter(Boolean).length;
    if (words < 10) {
      if (window.appCtrl) window.appCtrl.showToast("Bài viết còn quá ngắn! Hãy viết thêm ít nhất 10 từ theo gợi ý nhé.");
      return;
    }

    // Auto calculate checklist score
    const chks = document.querySelectorAll("#writing-checklist-container input[type='checkbox']");
    let checkedCount = 0;
    chks.forEach(c => { if (c.checked) checkedCount++; });

    const quality = this.analyzeTextQuality(this.userText);
    const isPassed = checkedCount >= 2 && words >= 15;

    // Record into Progress Learning Engine
    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("writing", isPassed, `write_${task.level.toLowerCase()}`);
      window.progressCtrl.updateSkillProgress("writing", isPassed);
    }

    // Auto open Model Answer for self comparison
    const box = document.getElementById("writing-model-answer-box");
    if (box) {
      box.classList.remove("hidden");
      const breakdownEl = document.getElementById("writing-model-breakdown");
      if (breakdownEl) {
        breakdownEl.innerHTML = `
          <div class="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-1.5 text-xs">
            <span class="font-bold text-gray-800 dark:text-gray-200">🔍 Phản hồi nhanh cấu trúc bài viết của bạn:</span>
            <div class="space-y-1 text-gray-600 dark:text-gray-300">
              <div>${quality.hasGreeting ? '✓' : '⚠️'} <b>Lời chào đầu thư (Anrede):</b> ${quality.hasGreeting ? 'Đã có' : 'Nên bổ sung (Liebe/Lieber/Sehr geehrte...)'}</div>
              <div>${quality.hasClosing ? '✓' : '⚠️'} <b>Lời chào kết thư (Grußformel):</b> ${quality.hasClosing ? 'Đã có' : 'Nên bổ sung (Viele Grüße / Mit freundlichen Grüßen)'}</div>
              <div>${words >= 25 ? '✓' : '⚠️'} <b>Độ dài bài viết:</b> ${words} từ (${task.wordCountTarget})</div>
              <div>${checkedCount >= 3 ? '✓' : '⚠️'} <b>Tiêu chí tự kiểm tra:</b> Đạt ${checkedCount}/${chks.length} tiêu chí</div>
            </div>
          </div>
          <div class="pt-2">${task.breakdown.replace(/\n/g, '<br>')}</div>
        `;
      }
    }

    if (window.speechCtrl) {
      if (isPassed) window.speechCtrl.playCorrectSound();
      else window.speechCtrl.playComboSound(1);
    }

    if (window.appCtrl) {
      window.appCtrl.showToast(`Đã nộp bài viết (${words} từ)! Hãy đối chiếu với bài mẫu bên dưới.`);
    }

    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

window.writingCtrl = new WritingController();
