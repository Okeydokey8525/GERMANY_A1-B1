// WEB_Germany Flashcard 3D Interactive Module (with IPA & Vietnamese Phonetics)

class FlashcardController {
  constructor() {
    this.rawVocab = [];
    this.filteredVocab = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.selectedTopic = "ALL";
    this.selectedLevel = "ALL";
    this.searchQuery = "";
    this.masteredSet = new Set();
    
    this.initElements();
    this.loadMasteredState();
  }

  initElements() {
    this.cardInner = document.getElementById("flashcard-inner");
    this.cardContainer = document.getElementById("flashcard-container");
    this.progressBar = document.getElementById("flashcard-progress-bar");
    this.progressText = document.getElementById("flashcard-progress-text");
    this.topicPills = document.getElementById("topic-pills");
    
    // Bind buttons
    const btnFlip = document.getElementById("btn-flip-card");
    if (btnFlip) btnFlip.addEventListener("click", () => this.flipCard());
    if (this.cardInner) this.cardInner.addEventListener("click", (e) => {
      // Don't flip if clicking the speaker button
      if (e.target.closest(".speaker-btn")) return;
      this.flipCard();
    });

    const btnPrev = document.getElementById("btn-prev-card");
    const btnNext = document.getElementById("btn-next-card");
    const btnShuffle = document.getElementById("btn-shuffle-cards");
    const btnMastered = document.getElementById("btn-mark-mastered");
    const btnUnmastered = document.getElementById("btn-mark-unmastered");
    const searchInput = document.getElementById("flashcard-search");

    if (btnPrev) btnPrev.addEventListener("click", () => this.prevCard());
    if (btnNext) btnNext.addEventListener("click", () => this.nextCard());
    if (btnShuffle) btnShuffle.addEventListener("click", () => this.shuffleCards());
    if (btnMastered) btnMastered.addEventListener("click", () => this.markCurrentMastered(true));
    if (btnUnmastered) btnUnmastered.addEventListener("click", () => this.markCurrentMastered(false));
    
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.applyFilters();
      });
    }

    // Keyboard navigation (Arrow Left, Arrow Right, Space for flip)
    document.addEventListener("keydown", (e) => {
      const activeTab = document.querySelector(".tab-content.active");
      if (!activeTab || activeTab.id !== "tab-flashcards") return;
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        this.flipCard();
      } else if (e.code === "ArrowRight") {
        this.nextCard();
      } else if (e.code === "ArrowLeft") {
        this.prevCard();
      }
    });
  }

  loadMasteredState() {
    try {
      const saved = localStorage.getItem("web_germany_mastered_words");
      if (saved) {
        this.masteredSet = new Set(JSON.parse(saved));
      }
    } catch (e) {
      this.masteredSet = new Set();
    }
  }

  saveMasteredState() {
    try {
      localStorage.setItem("web_germany_mastered_words", JSON.stringify(Array.from(this.masteredSet)));
      if (window.appCtrl) window.appCtrl.updateStats();
    } catch (e) {}
  }

  setData(vocabList) {
    this.rawVocab = vocabList;
    this.buildTopicPills();
    this.applyFilters();
  }

  buildTopicPills() {
    if (!this.topicPills) return;
    
    const topicMap = new Map();
    topicMap.set("ALL", "✨ Tất cả");
    
    this.rawVocab.forEach(v => {
      if (v.topic) {
        const viTitle = v.topic_vi || v.topic;
        topicMap.set(v.topic, viTitle);
      }
    });

    this.topicPills.innerHTML = "";
    topicMap.forEach((title, key) => {
      const btn = document.createElement("button");
      btn.className = `px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
        this.selectedTopic === key
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`;
      btn.textContent = title;
      btn.addEventListener("click", () => {
        this.selectedTopic = key;
        this.buildTopicPills();
        this.applyFilters();
      });
      this.topicPills.appendChild(btn);
    });
  }

  setLevelFilter(level) {
    this.selectedLevel = level;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredVocab = this.rawVocab.filter(v => {
      // Level filter
      if (this.selectedLevel !== "ALL" && v.level !== this.selectedLevel) return false;
      // Topic filter
      if (this.selectedTopic !== "ALL" && v.topic !== this.selectedTopic) return false;
      // Search query
      if (this.searchQuery) {
        const matchWord = v.word.toLowerCase().includes(this.searchQuery);
        const matchVi = v.meaning_vi.toLowerCase().includes(this.searchQuery);
        const matchPronounce = (v.pronounce_vi || "").toLowerCase().includes(this.searchQuery);
        const matchTopic = (v.sub_category || "").toLowerCase().includes(this.searchQuery);
        if (!matchWord && !matchVi && !matchTopic && !matchPronounce) return false;
      }
      return true;
    });

    this.currentIndex = 0;
    this.isFlipped = false;
    if (this.cardInner) this.cardInner.classList.remove("flipped");
    this.renderCard();
  }

  flipCard() {
    if (!this.cardInner) return;
    this.isFlipped = !this.isFlipped;
    this.cardInner.classList.toggle("flipped", this.isFlipped);
    if (window.speechCtrl) window.speechCtrl.playFlipSound();
  }

  nextCard() {
    if (this.filteredVocab.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.filteredVocab.length;
    this.isFlipped = false;
    if (this.cardInner) this.cardInner.classList.remove("flipped");
    this.renderCard();
  }

  prevCard() {
    if (this.filteredVocab.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.filteredVocab.length) % this.filteredVocab.length;
    this.isFlipped = false;
    if (this.cardInner) this.cardInner.classList.remove("flipped");
    this.renderCard();
  }

  shuffleCards() {
    for (let i = this.filteredVocab.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.filteredVocab[i], this.filteredVocab[j]] = [this.filteredVocab[j], this.filteredVocab[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    if (this.cardInner) this.cardInner.classList.remove("flipped");
    this.renderCard();
    if (window.appCtrl) window.appCtrl.showToast("Đã xáo trộn danh sách thẻ!");
  }

  markCurrentMastered(isMastered) {
    if (this.filteredVocab.length === 0) return;
    const current = this.filteredVocab[this.currentIndex];
    if (isMastered) {
      this.masteredSet.add(current.id);
      if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      if (window.appCtrl) window.appCtrl.showToast(`Đã thuộc: ${current.word}! 🎉`);
    } else {
      this.masteredSet.delete(current.id);
      if (window.appCtrl) window.appCtrl.showToast(`Đã chuyển vào hàng đợi ôn tập.`);
    }
    this.saveMasteredState();
    this.renderCard();
    setTimeout(() => this.nextCard(), 300);
  }

  renderCard() {
    const frontWord = document.getElementById("fc-front-word");
    const frontArticle = document.getElementById("fc-front-article");
    const frontPlural = document.getElementById("fc-front-plural");
    const frontPronounce = document.getElementById("fc-front-pronounce");
    const frontTopic = document.getElementById("fc-front-topic");
    const frontLevel = document.getElementById("fc-front-level");
    const frontBadge = document.getElementById("fc-mastered-badge");
    const frontSpeaker = document.getElementById("fc-front-speaker");

    const backMeaning = document.getElementById("fc-back-meaning");
    const backExDe = document.getElementById("fc-back-ex-de");
    const backExVi = document.getElementById("fc-back-ex-vi");
    const backCategory = document.getElementById("fc-back-category");
    const backSpeaker = document.getElementById("fc-back-speaker");

    const cardFrontEl = document.querySelector(".flip-card-front");
    const cardBackEl = document.querySelector(".flip-card-back");

    if (this.filteredVocab.length === 0) {
      if (frontWord) frontWord.textContent = "Không tìm thấy từ vựng";
      if (frontArticle) frontArticle.textContent = "";
      if (frontPlural) frontPlural.textContent = "Thử chọn chủ đề hoặc cấp độ khác.";
      if (frontPronounce) frontPronounce.textContent = "";
      if (frontTopic) frontTopic.textContent = "Trống";
      if (this.progressText) this.progressText.textContent = "0 / 0";
      if (this.progressBar) this.progressBar.style.width = "0%";
      return;
    }

    const item = this.filteredVocab[this.currentIndex];
    const isMastered = this.masteredSet.has(item.id);

    // Color theme based on article
    let cardColorClass = "card-other";
    let badgeColorClass = "badge-other";
    let articleDisplay = item.article || "";
    
    if (item.article === "der") {
      cardColorClass = "card-der";
      badgeColorClass = "badge-der";
    } else if (item.article === "die") {
      cardColorClass = "card-die";
      badgeColorClass = "badge-die";
    } else if (item.article === "das") {
      cardColorClass = "card-das";
      badgeColorClass = "badge-das";
    }

    // Apply card border classes
    if (cardFrontEl) {
      cardFrontEl.className = `flip-card-front border-2 ${cardColorClass} bg-white dark:bg-gray-800 p-6 flex flex-col justify-between shadow-xl transition-all duration-300`;
    }
    if (cardBackEl) {
      cardBackEl.className = `flip-card-back border-2 ${cardColorClass} bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 flex flex-col justify-between shadow-xl transition-all duration-300`;
    }

    // Populate Front
    if (frontArticle) {
      frontArticle.textContent = articleDisplay;
      frontArticle.className = `text-lg sm:text-xl font-bold uppercase tracking-wider ${
        item.article === 'der' ? 'text-blue-600 dark:text-blue-400' :
        item.article === 'die' ? 'text-rose-600 dark:text-rose-400' :
        item.article === 'das' ? 'text-emerald-600 dark:text-emerald-400' :
        'text-amber-600 dark:text-amber-400'
      }`;
    }
    if (frontWord) frontWord.textContent = item.word;
    
    // Pronunciation Guide
    if (frontPronounce) {
      if (item.pronounce_vi || item.ipa) {
        const ipaText = item.ipa ? `${item.ipa}` : '';
        const viReadText = item.pronounce_vi ? `đọc là: /${item.pronounce_vi}/` : '';
        frontPronounce.innerHTML = `<span class="opacity-80">${ipaText}</span> <span class="mx-1">•</span> <span class="text-blue-600 dark:text-blue-400 font-bold">${viReadText}</span>`;
      } else {
        frontPronounce.innerHTML = "";
      }
    }

    if (frontPlural) {
      frontPlural.textContent = item.plural ? `Pl: ${item.plural}` : (item.sub_category || "Cơ bản");
    }

    if (frontTopic) frontTopic.textContent = item.topic_vi || item.topic;
    if (frontLevel) {
      frontLevel.textContent = item.level;
      frontLevel.className = `px-2.5 py-0.5 rounded-full text-xs font-bold ${
        item.level === 'A1' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
        item.level === 'A2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
      }`;
    }

    if (frontBadge) {
      if (isMastered) {
        frontBadge.classList.remove("hidden");
      } else {
        frontBadge.classList.add("hidden");
      }
    }

    if (frontSpeaker) {
      frontSpeaker.onclick = (e) => {
        e.stopPropagation();
        const textToSpeak = item.article ? `${item.article} ${item.word}` : item.word;
        if (window.speechCtrl) window.speechCtrl.speak(textToSpeak);
      };
    }

    // Populate Back
    if (backMeaning) backMeaning.textContent = item.meaning_vi;
    if (backExDe) backExDe.textContent = item.example_de || `Hier ist ein Beispielsatz mit ${item.word}.`;
    if (backExVi) backExVi.textContent = item.example_vi || `Ví dụ minh họa cho từ ${item.meaning_vi}.`;
    if (backCategory) backCategory.textContent = `${item.topic_vi || item.topic} • ${item.sub_category || ''}`;

    if (backSpeaker) {
      backSpeaker.onclick = (e) => {
        e.stopPropagation();
        if (window.speechCtrl && item.example_de) {
          window.speechCtrl.speak(item.example_de);
        }
      };
    }

    // Update Counter & Progress
    const total = this.filteredVocab.length;
    const currentNum = this.currentIndex + 1;
    if (this.progressText) {
      this.progressText.textContent = `${currentNum} / ${total}`;
    }
    if (this.progressBar) {
      const pct = (currentNum / total) * 100;
      this.progressBar.style.width = `${pct}%`;
    }
  }
}

window.flashcardCtrl = new FlashcardController();
