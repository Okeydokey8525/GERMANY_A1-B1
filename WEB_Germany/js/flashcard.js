// WEB_Germany Flashcard 3D Interactive Module with Spaced Repetition System (SRS)

class FlashcardController {
  constructor() {
    this.rawVocab = [];
    this.filteredVocab = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.selectedTopic = "ALL";
    this.selectedLevel = "ALL";
    this.onlyDueFilter = false;
    this.searchQuery = "";
    
    this.initElements();
  }

  initElements() {
    this.cardInner = document.getElementById("flashcard-inner");
    this.cardContainer = document.getElementById("flashcard-container");
    this.progressBar = document.getElementById("flashcard-progress-bar");
    this.progressText = document.getElementById("flashcard-progress-text");
    this.topicPills = document.getElementById("topic-pills");
    
    // Bind flip actions
    const btnFlip = document.getElementById("btn-flip-card");
    if (btnFlip) btnFlip.addEventListener("click", () => this.flipCard());
    if (this.cardInner) this.cardInner.addEventListener("click", (e) => {
      if (e.target.closest(".speaker-btn") || e.target.closest(".srs-rate-btn")) return;
      this.flipCard();
    });

    const btnPrev = document.getElementById("btn-prev-card");
    const btnNext = document.getElementById("btn-next-card");
    const btnShuffle = document.getElementById("btn-shuffle-cards");
    const btnDueFilter = document.getElementById("btn-filter-srs-due");
    const searchInput = document.getElementById("flashcard-search");

    if (btnPrev) btnPrev.addEventListener("click", () => this.prevCard());
    if (btnNext) btnNext.addEventListener("click", () => this.nextCard());
    if (btnShuffle) btnShuffle.addEventListener("click", () => this.shuffleCards());

    if (btnDueFilter) {
      btnDueFilter.addEventListener("click", () => {
        this.onlyDueFilter = !this.onlyDueFilter;
        btnDueFilter.classList.toggle("bg-amber-500", this.onlyDueFilter);
        btnDueFilter.classList.toggle("text-white", this.onlyDueFilter);
        this.applyFilters();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.applyFilters();
      });
    }

    // 4 SRS Rating Buttons on Card Back
    document.querySelectorAll(".srs-rate-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rating = btn.getAttribute("data-rating");
        this.rateCurrentCard(rating);
      });
    });

    // Keyboard navigation (Arrow Left, Arrow Right, Space for flip, 1-4 for SRS)
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
      } else if (this.isFlipped) {
        if (e.key === "1") this.rateCurrentCard("again");
        else if (e.key === "2") this.rateCurrentCard("hard");
        else if (e.key === "3") this.rateCurrentCard("good");
        else if (e.key === "4") this.rateCurrentCard("easy");
      }
    });
  }

  setData(vocabList) {
    this.rawVocab = vocabList;
    if (window.srsCtrl) {
      window.srsCtrl.initCards(vocabList);
    }
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
    const today = window.srsCtrl ? window.srsCtrl.getLocalDateString() : "";

    this.filteredVocab = this.rawVocab.filter(v => {
      // Level filter
      if (this.selectedLevel !== "ALL" && v.level !== this.selectedLevel) return false;
      // Topic filter
      if (this.selectedTopic !== "ALL" && v.topic !== this.selectedTopic) return false;
      // Due filter
      if (this.onlyDueFilter && window.srsCtrl) {
        const srsCard = window.srsCtrl.cards[v.id];
        if (!srsCard || srsCard.dueDate > today) return false;
      }
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

  rateCurrentCard(rating) {
    if (this.filteredVocab.length === 0) return;
    const current = this.filteredVocab[this.currentIndex];

    if (window.srsCtrl) {
      window.srsCtrl.rateCard(current.id, rating);
    }

    if (rating === "again") {
      if (window.speechCtrl) window.speechCtrl.playWrongSound();
      if (window.appCtrl) window.appCtrl.showToast(`Đã thêm "${current.word}" vào hàng đợi ôn lại ngay!`);
    } else if (rating === "good" || rating === "easy") {
      if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      if (window.appCtrl) window.appCtrl.showToast(`Tuyệt vời! Đã cập nhật lịch ôn từ "${current.word}". 🎉`);
    }

    setTimeout(() => this.nextCard(), 250);
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
    const backSrsInterval = document.getElementById("fc-back-srs-interval");

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
    const srsCard = window.srsCtrl ? window.srsCtrl.cards[item.id] : null;
    const isMastered = srsCard && srsCard.state === "mastered";

    // Color theme based on article
    let cardColorClass = "card-other";
    let articleDisplay = item.article || "";
    
    if (item.article === "der") cardColorClass = "card-der";
    else if (item.article === "die") cardColorClass = "card-die";
    else if (item.article === "das") cardColorClass = "card-das";

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
      frontArticle.className = `text-xl sm:text-2xl font-black uppercase tracking-wider ${
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
      if (isMastered) frontBadge.classList.remove("hidden");
      else frontBadge.classList.add("hidden");
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

    if (backSrsInterval && srsCard) {
      const stateName = srsCard.state === "mastered" ? "Đã thuộc sâu" : (srsCard.state === "review" ? "Đang ghi nhớ" : "Mới học");
      backSrsInterval.textContent = `Trạng thái: ${stateName} • Chu kỳ: ${srsCard.interval || 0} ngày`;
    }

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
