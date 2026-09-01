// WEB_Germany Nicos Weg 228 Lessons Module (Clean Chat Dialogues & Audio)

class LessonsController {
  constructor() {
    this.lessonsData = null;
    this.currentLevel = "A1";
    this.searchQuery = "";
    this.completedLessons = new Set();
    this.currentPlayingIndex = -1;

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
      const matchTitle = (item.title || "").toLowerCase().includes(this.searchQuery);
      const matchNum = `${item.number}`.includes(this.searchQuery);
      const matchSummary = (item.summary_vi || "").toLowerCase().includes(this.searchQuery);
      return matchTitle || matchNum || matchSummary;
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
      card.className = `p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 ${
        isDone
          ? "border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm"
          : "border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-800/90 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-md"
      } flex flex-col justify-between space-y-3`;

      const vocabTagsHtml = (lesson.key_vocab || []).slice(0, 4).map(v => 
        `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">${v}</span>`
      ).join(" ");

      card.innerHTML = `
        <div class="space-y-2">
          <!-- Top Row: Badge & Checkbox -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                ${this.currentLevel} • Bài ${lesson.number}
              </span>
              <span class="text-xs font-bold text-gray-400">|</span>
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate max-w-[120px]">${lesson.grammar_focus || 'Giao tiếp'}</span>
            </div>
            <button class="lesson-check-btn px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              isDone ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }" title="Đánh dấu hoàn thành">
              ${isDone ? '✓ Đã học' : '○ Chưa học'}
            </button>
          </div>

          <!-- Title -->
          <h3 class="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">
            ${lesson.title}
          </h3>

          <!-- Summary in Vietnamese -->
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
            ${lesson.summary_vi}
          </p>

          <!-- Key Vocab Tags -->
          <div class="flex items-center gap-1 flex-wrap pt-1">
            ${vocabTagsHtml}
          </div>
        </div>

        <!-- Open Lesson Button -->
        <button class="btn-open-lesson w-full py-2.5 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group">
          <span>Xem kịch bản & Luyện nghe</span>
          <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `;

      // Checkbox click
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

      // Open Modal
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
    const grammarBadgeEl = document.getElementById("lesson-modal-grammar");
    const bodyEl = document.getElementById("lesson-modal-dialogue");
    const btnPlayAll = document.getElementById("btn-play-all-dialogue");

    if (!modal) return;

    if (titleEl) titleEl.textContent = `${this.currentLevel} • Bài ${lesson.number}: ${lesson.title}`;
    if (subTitleEl) subTitleEl.textContent = lesson.summary_vi;
    if (grammarBadgeEl) grammarBadgeEl.textContent = `Trọng tâm: ${lesson.grammar_focus || 'Hội thoại & Mẫu câu'}`;

    if (bodyEl) {
      bodyEl.innerHTML = "";
      const turns = lesson.dialogue || [];
      
      if (turns.length === 0) {
        bodyEl.innerHTML = `<div class="text-center py-8 text-gray-400">Đoạn hội thoại đang được cập nhật...</div>`;
      } else {
        turns.forEach((turn, idx) => {
          const row = document.createElement("div");
          row.className = "flex items-start gap-3 p-3 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors group cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50";
          row.setAttribute("data-line-idx", idx);

          row.innerHTML = `
            <!-- Avatar -->
            <div class="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0 shadow-xs border border-gray-200/50 dark:border-gray-700">
              ${turn.avatar || '🗣️'}
            </div>

            <!-- Dialogue Bubble -->
            <div class="flex-1 space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-white">${turn.speaker}</span>
                <button class="line-speak-btn p-1 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 hover:scale-110 transition-all" title="Nghe câu này">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                </button>
              </div>
              <p class="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                ${turn.text_de}
              </p>
              ${turn.text_vi ? `<p class="text-xs text-gray-500 dark:text-gray-400 italic">${turn.text_vi}</p>` : ''}
            </div>
          `;

          // Click anywhere on bubble to pronounce
          row.addEventListener("click", () => {
            if (window.speechCtrl) {
              window.speechCtrl.speak(turn.text_de);
            }
          });

          bodyEl.appendChild(row);
        });
      }
    }

    // Play All functionality
    if (btnPlayAll) {
      btnPlayAll.onclick = () => {
        if (!lesson.dialogue || lesson.dialogue.length === 0) return;
        const allText = lesson.dialogue.map(t => `${t.speaker}: ${t.text_de}`).join(". ");
        if (window.speechCtrl) {
          window.speechCtrl.speak(allText, 0.85);
          if (window.appCtrl) window.appCtrl.showToast("Đang phát toàn bộ bài hội thoại...");
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
    if (window.speechCtrl && window.speechCtrl.synth) {
      window.speechCtrl.synth.cancel();
    }
  }
}

window.lessonsCtrl = new LessonsController();
