// WEB_Germany Guided Writing Studio Controller (Schreiben A1-B1)

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

  submitTask() {
    const task = this.tasks[this.currentIndex];
    if (!task) return;

    const words = (this.userText || "").trim().split(/\s+/).filter(Boolean).length;
    if (words < 10) {
      if (window.appCtrl) window.appCtrl.showToast("Bài viết còn quá ngắn! Hãy viết thêm theo gợi ý nhé.");
      return;
    }

    // Auto calculate checklist score
    const chks = document.querySelectorAll("#writing-checklist-container input[type='checkbox']");
    let checkedCount = 0;
    chks.forEach(c => { if (c.checked) checkedCount++; });

    const isPassed = checkedCount >= 2 && words >= 20;

    // Record into Progress Learning Engine!
    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("writing", isPassed, `write_${task.level.toLowerCase()}`);
    }

    // Auto open Model Answer for self comparison
    const box = document.getElementById("writing-model-answer-box");
    if (box) box.classList.remove("hidden");

    if (window.appCtrl) {
      window.appCtrl.showToast("🎉 Đã hoàn thành bài viết! Hãy đối chiếu với Bài mẫu bên dưới nhé.");
    }
  }
}

window.writingCtrl = new WritingController();
