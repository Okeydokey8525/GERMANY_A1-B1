// WEB_Germany Spaced Repetition System (SRS) Engine with SM-2, Timestamp Scheduling & Daily New Card Cap

class SRSController {
  constructor() {
    this.storageKey = "deutschmaster_srs_deck_v4";
    this.cards = {}; // { id: { id, word, article, meaning_vi, level, state, interval, ease, repetitions, dueAt, wrongCount, reviewCount } }
    this.newCardsPerDayLimit = 10;
    this.loadDeck();
  }

  loadDeck() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.cards = JSON.parse(raw);
      } else {
        const v3 = localStorage.getItem("deutschmaster_srs_deck_v3");
        if (v3) {
          this.cards = JSON.parse(v3);
          this.saveDeck();
        }
      }
    } catch (e) {
      this.cards = {};
    }
  }

  saveDeck() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cards));
      this.updateUI();
    } catch (e) {
      console.error("Failed to save SRS deck:", e);
    }
  }

  initCards(vocabList) {
    const now = Date.now();
    let modified = false;

    vocabList.forEach(item => {
      if (!this.cards[item.id]) {
        this.cards[item.id] = {
          id: item.id,
          word: item.word,
          article: item.article || "",
          meaning_vi: item.meaning_vi,
          level: item.level || "A1",
          topic: item.topic || "Allgemein",
          state: "new", // 'new', 'learning', 'review', 'mastered'
          interval: 0,
          ease: 2.5,
          repetitions: 0,
          dueAt: now,
          wrongCount: 0,
          reviewCount: 0
        };
        modified = true;
      }
    });

    if (modified) {
      this.saveDeck();
    }
  }

  getDueCards(filterLevel = "ALL") {
    const now = Date.now();
    const todayNewDone = (window.progressCtrl && window.progressCtrl.data.today.newCardsReviewed) || 0;
    const remainingNewAllowed = Math.max(0, this.newCardsPerDayLimit - todayNewDone);
    
    let newCardsCount = 0;
    return Object.values(this.cards).filter(c => {
      if (filterLevel !== "ALL" && c.level !== filterLevel) return false;
      
      // If card is 'new', check daily cap
      if (c.state === "new") {
        if (newCardsCount < remainingNewAllowed) {
          newCardsCount++;
          return true;
        }
        return false;
      }

      // Review and learning cards due at or before now
      return (c.dueAt || 0) <= now;
    });
  }

  getCounts(filterLevel = "ALL") {
    const now = Date.now();
    let reviewDue = 0;
    let learningDue = 0;
    let newTotal = 0;
    let learning = 0;
    let review = 0;
    let mastered = 0;
    let total = 0;

    Object.values(this.cards).forEach(c => {
      if (filterLevel !== "ALL" && c.level !== filterLevel) return;
      total++;
      if (c.state === "mastered") {
        mastered++;
      } else if (c.state === "learning") {
        learning++;
        if ((c.dueAt || 0) <= now) learningDue++;
      } else if (c.state === "new") {
        newTotal++;
      } else { // review
        review++;
        if ((c.dueAt || 0) <= now) reviewDue++;
      }
    });

    const todayNewDone = (window.progressCtrl && window.progressCtrl.data.today.newCardsReviewed) || 0;
    const availableNewToday = Math.min(newTotal, Math.max(0, this.newCardsPerDayLimit - todayNewDone));
    const totalActionableToday = reviewDue + learningDue + availableNewToday;

    return { 
      due: totalActionableToday, 
      reviewDue, 
      learningDue, 
      availableNewToday, 
      newTotal, 
      learning, 
      review, 
      mastered, 
      total 
    };
  }

  rateCard(cardId, rating) {
    const card = this.cards[cardId];
    if (!card) return;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const tenMinMs = 10 * 60 * 1000;

    const isFirstTimeStudied = (card.state === "new");
    if (isFirstTimeStudied && window.progressCtrl) {
      window.progressCtrl.data.today.newCardsReviewed = (window.progressCtrl.data.today.newCardsReviewed || 0) + 1;
    }

    card.reviewCount = (card.reviewCount || 0) + 1;

    switch (rating) {
      case "again": // Wiederholen: due in 10 minutes
        card.state = "learning";
        card.interval = 0;
        card.repetitions = 0;
        card.ease = Math.max(1.3, card.ease - 0.2);
        card.wrongCount = (card.wrongCount || 0) + 1;
        card.dueAt = now + tenMinMs;
        
        // Register in Mistake Notebook
        if (window.mistakesCtrl) {
          window.mistakesCtrl.addMistake({
            id: `vocab_${card.id}`,
            type: "vocab",
            level: card.level || "A1",
            question: card.article ? `${card.article} ${card.word}` : card.word,
            correctAnswer: card.meaning_vi,
            userAnswer: "Chưa nhớ (Cần lặp lại)",
            topic: card.topic || "Từ vựng",
            explanation: `Từ vựng "${card.word}" nghĩa là "${card.meaning_vi}". Đã lên lịch ôn lại sau 10 phút!`
          });
        }
        break;

      case "hard": // Schwer: due in 1 day, counted as remembered with effort
        card.state = "learning";
        card.interval = 1;
        card.repetitions = Math.max(1, card.repetitions);
        card.ease = Math.max(1.3, card.ease - 0.15);
        card.dueAt = now + oneDayMs;
        break;

      case "good": // Gut: standard progression (1 -> 3 -> interval * ease)
        card.repetitions += 1;
        if (card.repetitions === 1) {
          card.interval = 1;
          card.state = "learning";
        } else if (card.repetitions === 2) {
          card.interval = 3;
          card.state = "review";
        } else {
          card.interval = Math.round(card.interval * card.ease);
          if (card.interval >= 21) card.state = "mastered";
          else card.state = "review";
        }
        card.dueAt = now + (card.interval * oneDayMs);
        break;

      case "easy": // Leicht: fast-track progression (4 -> interval * ease * 1.3)
        card.repetitions += 1;
        card.ease = Math.min(3.0, card.ease + 0.15);
        if (card.repetitions === 1) {
          card.interval = 4;
          card.state = "review";
        } else {
          card.interval = Math.round(card.interval * card.ease * 1.3);
          if (card.interval >= 21) card.state = "mastered";
          else card.state = "review";
        }
        card.dueAt = now + (card.interval * oneDayMs);
        break;
    }

    this.saveDeck();
    if (window.progressCtrl) {
      // 'again' is incorrect; 'hard', 'good', 'easy' are all recognized as remembered
      const isRemembered = (rating !== "again");
      window.progressCtrl.recordActivity("vocab", isRemembered, card.topic || "Từ vựng");
    }
  }

  updateUI() {
    const counts = this.getCounts();
    
    // Dashboard Due Count
    const dashDue = document.getElementById("dash-srs-due-count");
    if (dashDue) dashDue.textContent = `${counts.due} từ`;

    // Flashcard Due Badge
    const fcDueBadge = document.getElementById("fc-due-badge");
    if (fcDueBadge) {
      if (counts.due > 0) {
        fcDueBadge.textContent = `${counts.due} từ`;
        fcDueBadge.classList.remove("hidden");
      } else {
        fcDueBadge.classList.add("hidden");
      }
    }

    // Breakdown Stats pill on Flashcard tab
    const fcBreakdown = document.getElementById("fc-breakdown-stats");
    if (fcBreakdown) {
      fcBreakdown.innerHTML = `
        <span class="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-bold text-[10px]">🆕 ${counts.availableNewToday} từ mới hôm nay</span>
        <span class="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-bold text-[10px]">🟡 ${counts.learningDue} đang ôn</span>
        <span class="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 font-bold text-[10px]">🔄 ${counts.reviewDue} đến hạn ôn</span>
        <span class="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">🏆 ${counts.mastered} đã thuộc sâu</span>
      `;
    }
  }
}

window.srsCtrl = new SRSController();
