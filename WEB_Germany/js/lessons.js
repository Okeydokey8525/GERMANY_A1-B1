// WEB_Germany Nicos Weg 228 Lessons Module

class LessonsController {
  constructor() {
    this.lessonsData = null;
    this.currentLevel = "A1";
    this.searchQuery = "";
    this.completedLessons = new Set();

    this.initElements();
    this.loadCompletedState();
  }

  initElements() {
    // Level Switcher Tabs
    ["A1", "A2", "B1"].forEach(lvl => {
      const btn = document.getElementById(`btn-lessons-lvl-${lvl}`);
      if (btn) {
        btn.addEventListener("click", () => this.switchLevel(lvl));
      }
    });

    // Lesson Search input
    const searchInput = document.getElementById("lesson-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderLessonsList();
      });
    }

    // Close reader modal
    const btnCloseModal = document.getElementById("btn-close-lesson-modal");
    const modalBackdrop = document.getElementById("lesson-modal-backdrop");
    if (btnCloseModal) btnCloseModal.addEventListener("click", () => this.closeLessonModal());
    if (modalBackdrop) modalBackdrop.addEventListener("click", () => this.closeLessonModal());
  }

  loadCompletedState() {
    try {
      const saved = localStorage.getItem("web_germany_completed_lessons");
      if (saved) {
        this.completedLessons = new Set(JSON.parse(saved));
      }
    } catch (e) {
      this.completedLessons = new Set();
    }
  }

  saveCompletedState() {
    try {
      localStorage.setItem("web_germany_completed_lessons", JSON.stringify(Array.from(this.completedLessons)));
      if (window.appCtrl) window.appCtrl.updateStats();
    } catch (e) {}
  }

  setData(data) {
    this.lessonsData = data;
    this.renderLessonsList();
  }

  switchLevel(lvl) {
    this.currentLevel = lvl;

    ["A1", "A2", "B1"].forEach(l => {
      const btn = document.getElementById(`btn-lessons-lvl-${l}`);
      if (btn) {
        if (l === lvl) {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all";
        } else {
          btn.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
        }
      }
    });

    this.renderLessonsList();
  }

  renderLessonsList() {
    if (!this.lessonsData) return;
    const container = document.getElementById("lessons-list-container");
    const countEl = document.getElementById("lessons-count-badge");
    if (!container) return;

    const list = this.lessonsData[this.currentLevel] || [];
    const filtered = list.filter(item => {
      if (!this.searchQuery) return true;
      const matchTitle = item.title.toLowerCase().includes(this.searchQuery);
      const matchNum = `${item.number}`.includes(this.searchQuery);
      const matchDialogue = (item.dialogue || "").toLowerCase().includes(this.searchQuery);
      return matchTitle || matchNum || matchDialogue;
    });

    if (countEl) countEl.textContent = `${filtered.length} bài học`;

    container.innerHTML = "";
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400">
          <p>Không tìm thấy bài học nào cho "${this.searchQuery}".</p>
        </div>
      `;
      return;
    }

    filtered.forEach(lesson => {
      const isDone = this.completedLessons.has(lesson.id);
      const card = document.createElement("div");
      card.className = `p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
        isDone
          ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm"
      } flex flex-col justify-between`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              ${this.currentLevel} - Bài ${lesson.number}
            </span>
            <button class="lesson-check-btn p-1 rounded-lg ${isDone ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400 hover:text-gray-600'}" title="Đánh dấu hoàn thành">
              ${isDone ? '✓ Đã học' : '○ Chưa học'}
            </button>
          </div>
          <h3 class="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-1.5">${lesson.title}</h3>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">${lesson.summary}</p>
        </div>

        <button class="btn-open-lesson w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200 transition-all flex items-center justify-center gap-2">
          <span>Xem kịch bản & Luyện nghe</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `;

      // Checkbox toggle
      const checkBtn = card.querySelector(".lesson-check-btn");
      if (checkBtn) {
        checkBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (this.completedLessons.has(lesson.id)) {
            this.completedLessons.delete(lesson.id);
          } else {
            this.completedLessons.add(lesson.id);
            if (window.speechCtrl) window.speechCtrl.playCorrectSound();
          }
          this.saveCompletedState();
          this.renderLessonsList();
        });
      }

      // Open modal button
      const openBtn = card.querySelector(".btn-open-lesson");
      if (openBtn) {
        openBtn.addEventListener("click", () => this.openLessonModal(lesson));
      }

      container.appendChild(card);
    });
  }

  openLessonModal(lesson) {
    const modal = document.getElementById("lesson-reader-modal");
    const titleEl = document.getElementById("lesson-modal-title");
    const subTitleEl = document.getElementById("lesson-modal-subtitle");
    const bodyEl = document.getElementById("lesson-modal-dialogue");
    const btnPlayAll = document.getElementById("btn-play-all-dialogue");

    if (!modal) return;

    if (titleEl) titleEl.textContent = `${this.currentLevel} - Bài ${lesson.number}: ${lesson.title}`;
    if (subTitleEl) subTitleEl.textContent = lesson.summary;

    if (bodyEl) {
      bodyEl.innerHTML = "";
      const lines = (lesson.dialogue || "").splitlines ? lesson.dialogue.splitlines() : (lesson.dialogue || "").split("\n");
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const row = document.createElement("div");
        row.className = "p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs sm:text-sm text-gray-800 dark:text-gray-200 cursor-pointer transition-colors flex items-start justify-between gap-3 group";
        
        row.innerHTML = `
          <div class="flex-1 leading-relaxed">${trimmed}</div>
          <button class="opacity-0 group-hover:opacity-100 p-1 text-blue-600 dark:text-blue-400 hover:scale-110 transition-all" title="Nghe câu này">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          </button>
        `;

        row.addEventListener("click", () => {
          if (window.speechCtrl) {
            // Remove speaker prefix (e.g. "Nico: ") before speaking
            const cleanText = trimmed.replace(/^[^:]+:\s*/, '');
            window.speechCtrl.speak(cleanText);
          }
        });

        bodyEl.appendChild(row);
      });
    }

    if (btnPlayAll) {
      btnPlayAll.onclick = () => {
        if (window.speechCtrl && lesson.dialogue) {
          window.speechCtrl.speak(lesson.dialogue, 0.85);
        }
      };
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  closeLessonModal() {
    const modal = document.getElementById("lesson-reader-modal");
    if (modal) modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

window.lessonsCtrl = new LessonsController();
