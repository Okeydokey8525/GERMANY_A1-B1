// WEB_Germany Spaced Repetition System (SRS) Engine based on Modified SM-2

class SRSController {
  constructor() {
    this.storageKey = "deutschmaster_srs_deck_v2";
    this.cards = {}; // { id: { id, word, article, meaning_vi, state, interval, ease, repetitions, dueDate, wrongCount } }
    this.loadDeck();
  }

  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadDeck() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        this.cards = JSON.parse(raw);
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
    const today = this.getLocalDateString();
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
          dueDate: today,
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
    const today = this.getLocalDateString();
    return Object.values(this.cards).filter(c => {
      if (filterLevel !== "ALL" && c.level !== filterLevel) return false;
      return c.dueDate <= today;
    });
  }

  getCounts(filterLevel = "ALL") {
    const today = this.getLocalDateString();
    let due = 0;
    let learning = 0;
    let mastered = 0;
    let total = 0;

    Object.values(this.cards).forEach(c => {
      if (filterLevel !== "ALL" && c.level !== filterLevel) return;
      total++;
      if (c.state === "mastered") {
        mastered++;
      } else if (c.state === "learning") {
        learning++;
      }
      if (c.dueDate <= today) {
        due++;
      }
    });

    return { due, learning, mastered, total };
  }

  rateCard(cardId, rating) {
    const card = this.cards[cardId];
    if (!card) return;

    const today = new Date();
    card.reviewCount = (card.reviewCount || 0) + 1;

    switch (rating) {
      case "again": // Wiederholen (0 days / today)
        card.state = "learning";
        card.interval = 0;
        card.repetitions = 0;
        card.ease = Math.max(1.3, card.ease - 0.2);
        card.wrongCount = (card.wrongCount || 0) + 1;
        card.dueDate = this.getLocalDateString(today);
        // Also register in Mistake notebook
        if (window.mistakesCtrl) {
          window.mistakesCtrl.addMistake({
            id: `vocab_${card.id}`,
            type: "vocab",
            question: card.article ? `${card.article} ${card.word}` : card.word,
            correctAnswer: card.meaning_vi,
            userAnswer: "Chưa nhớ / Đánh giá: Lặp lại",
            topic: card.topic || "Từ vựng",
            explanation: `Từ vựng "${card.word}" nghĩa là "${card.meaning_vi}". Đã tự động thêm vào danh sách cần ôn!`
          });
        }
        break;

      case "hard": // Schwer (1 day)
        card.state = "learning";
        card.interval = 1;
        card.repetitions = Math.max(1, card.repetitions);
        card.ease = Math.max(1.3, card.ease - 0.15);
        today.setDate(today.getDate() + 1);
        card.dueDate = this.getLocalDateString(today);
        break;

      case "good": // Gut (3+ days based on interval * ease)
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
        today.setDate(today.getDate() + card.interval);
        card.dueDate = this.getLocalDateString(today);
        break;

      case "easy": // Leicht (Bonus interval + ease increase)
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
        today.setDate(today.getDate() + card.interval);
        card.dueDate = this.getLocalDateString(today);
        break;
    }

    this.saveDeck();
    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("vocab", 1);
    }
  }

  updateUI() {
    const counts = this.getCounts();
    
    // Dashboard Due Count
    const dashDue = document.getElementById("dash-srs-due-count");
    if (dashDue) dashDue.textContent = counts.due;

    const dashMastered = document.getElementById("dash-vocab-mastered");
    if (dashMastered) dashMastered.textContent = `${counts.mastered} / ${counts.total} từ`;

    // Flashcard Tab Due Badge
    const fcDueBadge = document.getElementById("fc-due-badge");
    if (fcDueBadge) {
      if (counts.due > 0) {
        fcDueBadge.textContent = `${counts.due} từ đến hạn`;
        fcDueBadge.classList.remove("hidden");
      } else {
        fcDueBadge.classList.add("hidden");
      }
    }
  }
}

window.srsCtrl = new SRSController();
