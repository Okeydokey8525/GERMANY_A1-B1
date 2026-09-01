// WEB_Germany Unified Learning Progress, Topic Mastery, Learning Objectives & Evidence Engine (v4.4)

class ProgressController {
  constructor() {
    this.storageKey = "deutschmaster_user_progress_v4";
    this.data = this.getDefaultData();
    this.timerInterval = null;
    this.learningObjectivesData = [];

    this.loadProgress();
    this.checkDayRollOver();
    this.initStudyTimer();
    this.loadLearningObjectives();
  }

  async loadLearningObjectives() {
    try {
      const resp = await fetch("./data/learning_objectives.json");
      this.learningObjectivesData = await resp.json();
    } catch (e) {
      console.warn("Failed to load learning_objectives.json:", e);
    }
  }

  getDefaultData() {
    const today = this.getLocalDateString();
    return {
      version: 4.4,
      userName: "Học viên DeutschMaster",
      currentLevel: "A1",
      targetGoal: "allgemein", // 'travel', 'study', 'goethe', 'telc', 'allgemein'
      dailyGoalMinutes: 20,
      streak: {
        current: 0,
        best: 0,
        lastCompletedDate: ""
      },
      today: {
        date: today,
        actualSeconds: 0,
        vocabReviewed: 0,
        newCardsReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        quizDone: 0,
        correctCount: 0,
        totalAttempted: 0,
        isGoalMet: false
      },
      history: {}, // { 'YYYY-MM-DD': { minutes, itemsCount, goalMet, accuracy } }
      skills: {
        vocab: { skillProgress: 25, correct: 0, total: 0 },
        grammar: { skillProgress: 20, correct: 0, total: 0 },
        listening: { skillProgress: 20, correct: 0, total: 0 },
        reading: { skillProgress: 20, correct: 0, total: 0 },
        speaking: { skillProgress: 15, correct: 0, total: 0 },
        writing: { skillProgress: 15, correct: 0, total: 0 }
      },
      // Normalized topicId-based Mastery Records
      topics: {
        "artikel": { name: "Artikel & Nomen", mastery: 30, confidence: 20, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "akkusativ": { name: "Akkusativ", mastery: 25, confidence: 20, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "dativ": { name: "Dativ", mastery: 20, confidence: 20, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "modalverben": { name: "Modalverben & Satzklammer", mastery: 25, confidence: 20, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "perfekt": { name: "Das Perfekt", mastery: 20, confidence: 20, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "praesens": { name: "Präsens & Verben", mastery: 35, confidence: 25, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "w_fragen": { name: "W-Fragen & Satzbau V2", mastery: 40, confidence: 25, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "wechselpraepositionen": { name: "Wechselpräpositionen", mastery: 15, confidence: 15, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "adjektivdeklination": { name: "Adjektivdeklination", mastery: 15, confidence: 15, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "nebensaetze": { name: "Nebensätze", mastery: 15, confidence: 15, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "passiv": { name: "Das Passiv", mastery: 10, confidence: 10, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} },
        "konjunktiv2": { name: "Konjunktiv II", mastery: 10, confidence: 10, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} }
      },
      // Granular Learning Objective Mastery records
      objectives: {}, // { 'LO_AKK_01': { correct: 5, total: 6, mastery: 83 } }
      stageTestsPassed: {}, // { 'a1_stage_01': { score: 100, date: '...' } }
      completedLessons: [], // ['A1-01', 'A1-02']
      lastActivity: {
        type: "lesson",
        id: "A1-01",
        title: "01-Hallo! - Chào hỏi & Làm quen",
        tab: "lessons",
        timestamp: Date.now()
      },
      canDoChecklist: {}, // { 'cd_01': 'tested' | 'learning' | 'unlearned' }
      settings: {
        speechRate: 0.9,
        autoPronounce: true,
        soundFx: true,
        showPhonetic: true,
        theme: "light"
      }
    };
  }

  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  normalizeTopicId(rawName) {
    if (!rawName) return "artikel";
    const clean = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    // Exact mapping or alias lookup
    if (clean.includes("akkusativ")) return "akkusativ";
    if (clean.includes("dativ")) return "dativ";
    if (clean.includes("modalverb")) return "modalverben";
    if (clean.includes("perfekt")) return "perfekt";
    if (clean.includes("praesen") || clean.includes("prasens")) return "praesens";
    if (clean.includes("w_frage") || clean.includes("satzbau")) return "w_fragen";
    if (clean.includes("wechsel")) return "wechselpraepositionen";
    if (clean.includes("adjektiv")) return "adjektivdeklination";
    if (clean.includes("neben")) return "nebensaetze";
    if (clean.includes("passiv")) return "passiv";
    if (clean.includes("konjunktiv")) return "konjunktiv2";
    if (clean.includes("artikel") || clean.includes("nomen")) return "artikel";

    return Object.keys(this.data.topics).includes(clean) ? clean : "artikel";
  }

  migrateData(rawParsed) {
    if (!rawParsed || typeof rawParsed !== "object") return this.getDefaultData();
    let data = Object.assign(this.getDefaultData(), rawParsed);
    
    if (!data.topics || Object.keys(data.topics).some(k => k.includes(" "))) {
      const defaultTopics = this.getDefaultData().topics;
      // migrate any old non-normalized keys
      for (const [oldKey, oldVal] of Object.entries(data.topics || {})) {
        const normKey = this.normalizeTopicId(oldKey);
        if (defaultTopics[normKey]) {
          defaultTopics[normKey] = Object.assign(defaultTopics[normKey], oldVal);
        }
      }
      data.topics = defaultTopics;
    }

    if (!data.objectives) data.objectives = {};
    if (!data.stageTestsPassed) data.stageTestsPassed = {};
    if (data.today.newCardsReviewed === undefined) data.today.newCardsReviewed = 0;
    
    for (const sk of Object.keys(data.skills)) {
      if (data.skills[sk].score !== undefined && data.skills[sk].skillProgress === undefined) {
        data.skills[sk].skillProgress = data.skills[sk].score;
      }
    }

    data.version = 4.4;
    return data;
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = this.migrateData(parsed);
      }
    } catch (e) {
      console.warn("Failed to load progress, using defaults:", e);
      this.data = this.getDefaultData();
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this.updateUI();
    } catch (e) {
      console.error("Failed to save progress to localStorage:", e);
    }
  }

  checkDayRollOver() {
    const todayStr = this.getLocalDateString();
    if (this.data.today.date !== todayStr) {
      if (this.data.today.date) {
        const acc = this.data.today.totalAttempted > 0 
          ? Math.round((this.data.today.correctCount / this.data.today.totalAttempted) * 100) 
          : 80;
        this.data.history[this.data.today.date] = {
          minutes: Math.round((this.data.today.actualSeconds || 0) / 60),
          itemsCount: (this.data.today.vocabReviewed || 0) + (this.data.today.grammarDone || 0) + (this.data.today.lessonsDone || 0),
          goalMet: this.data.today.isGoalMet,
          accuracy: acc
        };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.getLocalDateString(yesterday);

      if (this.data.streak.lastCompletedDate !== yesterdayStr && this.data.streak.lastCompletedDate !== todayStr) {
        const lastDate = new Date(this.data.streak.lastCompletedDate);
        const diffDays = Math.round((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          this.data.streak.current = 0;
        }
      }

      this.data.today = {
        date: todayStr,
        actualSeconds: 0,
        vocabReviewed: 0,
        newCardsReviewed: 0,
        grammarDone: 0,
        lessonsDone: 0,
        speakingDone: 0,
        quizDone: 0,
        correctCount: 0,
        totalAttempted: 0,
        isGoalMet: false
      };
      this.saveProgress();
    }
  }

  initStudyTimer() {
    let lastActivityTime = Date.now();
    const recordUserActivity = () => { lastActivityTime = Date.now(); };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, recordUserActivity, { passive: true });
    });

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (Date.now() - lastActivityTime < 60000) {
        this.data.today.actualSeconds = (this.data.today.actualSeconds || 0) + 1;
        if (this.data.today.actualSeconds % 30 === 0) {
          this.checkDailyGoalCompletion();
          this.saveProgress();
        }
      }
    }, 1000);
  }

  checkDailyGoalCompletion() {
    const minutes = Math.round((this.data.today.actualSeconds || 0) / 60);
    const target = this.data.dailyGoalMinutes || 20;

    if (minutes >= target && !this.data.today.isGoalMet) {
      this.data.today.isGoalMet = true;
      const todayStr = this.getLocalDateString();
      if (this.data.streak.lastCompletedDate !== todayStr) {
        this.data.streak.current += 1;
        this.data.streak.lastCompletedDate = todayStr;
        if (this.data.streak.current > this.data.streak.best) {
          this.data.streak.best = this.data.streak.current;
        }
        if (window.appCtrl) {
          window.appCtrl.showToast(`🔥 Tuyệt vời! Bạn đã hoàn thành Mục tiêu Ngày & đạt Streak ${this.data.streak.current} ngày!`);
          this.showDailySummaryModal();
        }
      }
    }
  }

  recordActivity(type, isCorrect = true, rawTopic = "Allgemein", objectiveId = null) {
    this.checkDayRollOver();
    const today = this.data.today;
    today.totalAttempted = (today.totalAttempted || 0) + 1;
    if (isCorrect) today.correctCount = (today.correctCount || 0) + 1;

    if (type === "vocab") {
      today.vocabReviewed += 1;
      this.updateSkillProgress("vocab", isCorrect);
    } else if (type === "grammar") {
      today.grammarDone += 1;
      this.updateSkillProgress("grammar", isCorrect);
    } else if (type === "lesson") {
      today.lessonsDone += 1;
      this.updateSkillProgress("listening", isCorrect);
      this.updateSkillProgress("reading", isCorrect);
    } else if (type === "speaking") {
      today.speakingDone += 1;
      this.updateSkillProgress("speaking", isCorrect);
    } else if (type === "quiz") {
      today.quizDone += 1;
      this.updateSkillProgress("writing", isCorrect);
    }

    const topicId = this.normalizeTopicId(rawTopic);
    this.recordTopicAttempt(topicId, isCorrect, objectiveId);
    this.checkDailyGoalCompletion();
    this.saveProgress();
  }

  recordTopicAttempt(topicId, isCorrect, objectiveId = null) {
    const key = this.normalizeTopicId(topicId);
    if (!this.data.topics[key]) {
      this.data.topics[key] = { name: topicId, mastery: 20, confidence: 15, correct: 0, total: 0, recent: [], lastPracticed: 0, evidence: {} };
    }

    const t = this.data.topics[key];
    t.total += 1;
    if (isCorrect) t.correct += 1;
    t.recent.push(isCorrect ? 1 : 0);
    if (t.recent.length > 15) t.recent.shift();
    t.lastPracticed = Date.now();

    // Record Granular Learning Objective if provided
    if (objectiveId) {
      if (!this.data.objectives[objectiveId]) {
        this.data.objectives[objectiveId] = { correct: 0, total: 0, recent: [], mastery: 20, confidence: 15, status: "unseen" };
      }
      const obj = this.data.objectives[objectiveId];
      obj.total = (obj.total || 0) + 1;
      if (isCorrect) obj.correct = (obj.correct || 0) + 1;
      if (!obj.recent) obj.recent = [];
      obj.recent.push(isCorrect ? 1 : 0);
      if (obj.recent.length > 10) obj.recent.shift();

      // Objective Mastery: 60% Recent + 40% Overall
      const recentRate = obj.recent.reduce((a, b) => a + b, 0) / obj.recent.length;
      const allRate = obj.correct / obj.total;
      obj.mastery = Math.round((recentRate * 0.6 + allRate * 0.4) * 100);

      // Objective Confidence: Sample Size (70%) + Consistency (30%)
      const sampleConfidence = Math.min(1.0, obj.total / 10);
      const consistency = 1 - Math.abs(recentRate - allRate);
      obj.confidence = Math.round((sampleConfidence * 0.7 + consistency * 0.3) * 100);

      // Objective Status
      if (obj.total === 0) {
        obj.status = "unseen";
      } else if (obj.total < 4 || obj.mastery < 50) {
        obj.status = "learning";
      } else if (obj.mastery < 80 || obj.confidence < 60) {
        obj.status = "developing";
      } else {
        obj.status = "competent";
      }
    }

    // SRS Retention calculation for this topic
    let srsRetention = 0.5;
    let relatedCardsCount = 0;
    if (window.srsCtrl) {
      const relatedCards = Object.values(window.srsCtrl.cards).filter(c => {
        const cTopic = (c.topic || "").toLowerCase();
        return cTopic.includes(key) || cTopic.includes(t.name.toLowerCase());
      });
      relatedCardsCount = relatedCards.length;
      if (relatedCardsCount > 0) {
        const masteredOrGood = relatedCards.filter(c => c.state === "mastered" || c.interval >= 3).length;
        srsRetention = masteredOrGood / relatedCardsCount;
      }
    }

    // Check if this topic has defined Learning Objectives
    const topicDef = (this.learningObjectivesData || []).find(top => top.topicId === key);
    let computedMastery = 0;
    
    if (topicDef && topicDef.objectives && topicDef.objectives.length > 0) {
      let weightedSum = 0;
      let totalWeight = 0;
      topicDef.objectives.forEach(lo => {
        const objData = this.getObjectiveData(lo.id);
        const objM = objData.total > 0 ? objData.mastery : (t.recent.length > 0 ? Math.round(recentAcc * 100) : 25);
        weightedSum += (objM * (lo.weight || 20));
        totalWeight += (lo.weight || 20);
      });
      const objWeightedScore = totalWeight > 0 ? (weightedSum / totalWeight) : 30;
      computedMastery = Math.round((objWeightedScore * 0.7) + (srsRetention * 100 * 0.3));
    } else {
      computedMastery = Math.round(
        (recentAcc * 30) +
        (overallAcc * 20) +
        (srsRetention * 30) +
        (coverageFactor * 20)
      );
    }

    // Multi-factor Confidence calculation: Sample Size (60%) + SRS Evidence (20%) + Consistency (20%)
    const sampleFactor = Math.min(1.0, t.total / 18);
    const srsFactor = Math.min(1.0, relatedCardsCount / 10);
    const consistencyFactor = t.recent.length >= 5 ? 0.9 : 0.6;
    t.confidence = Math.round((sampleFactor * 60) + (srsFactor * 20) + (consistencyFactor * 20));

    t.mastery = Math.min(100, Math.max(10, computedMastery));

    // Store Evidence Breakdown
    t.evidence = {
      topicId: key,
      topicName: t.name,
      totalAttempts: t.total,
      recentAttempts: t.recent.length,
      recentAccuracy: Math.round(recentAcc * 100),
      overallAccuracy: Math.round(overallAcc * 100),
      srsRetentionPct: Math.round(srsRetention * 100),
      srsCardCount: relatedCardsCount,
      coveragePct: Math.round(coverageFactor * 100),
      calculatedMastery: t.mastery,
      confidence: t.confidence
    };
  }

  getTopicMastery(topicId) {
    const key = this.normalizeTopicId(topicId);
    return this.data.topics[key] ? (this.data.topics[key].mastery || 20) : 20;
  }

  getObjectiveData(objId) {
    if (!this.data.objectives || !this.data.objectives[objId]) {
      return { correct: 0, total: 0, mastery: 0, confidence: 0, status: "unseen" };
    }
    const o = this.data.objectives[objId];
    return {
      ...o,
      status: o.status || (o.total === 0 ? "unseen" : (o.mastery >= 80 && o.confidence >= 60 ? "competent" : (o.mastery >= 50 ? "developing" : "learning")))
    };
  }

  updateSkillProgress(skill, isCorrect) {
    if (!this.data.skills[skill]) {
      this.data.skills[skill] = { skillProgress: 15, correct: 0, total: 0 };
    }
    const sk = this.data.skills[skill];
    sk.total += 1;
    if (isCorrect) sk.correct += 1;

    const accuracy = sk.total > 0 ? (sk.correct / sk.total) : 0.5;
    const volume = Math.min(1.0, sk.total / 25);
    sk.skillProgress = Math.min(100, Math.max(10, Math.round((accuracy * 60) + (volume * 40))));
    sk.score = sk.skillProgress; // compatibility
  }

  markLessonComplete(lessonId) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
      this.recordActivity("lesson", true, "Nicos Weg");
      this.saveProgress();
      if (window.appCtrl) {
        window.appCtrl.showToast(`Đã hoàn thành bài học ${lessonId}! 🎉`);
      }
    }
  }

  setLastActivity(type, id, title, tab) {
    this.data.lastActivity = { type, id, title, tab, timestamp: Date.now() };
    this.saveProgress();
  }

  // Weak Areas using Decay-Weighted Recency Formula
  getWeakAreas() {
    const list = [];
    const mistakes = (window.mistakesCtrl && window.mistakesCtrl.mistakes) || [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const [topicKey, stat] of Object.entries(this.data.topics)) {
      const topicMistakes = mistakes.filter(m => {
        const mTopic = (m.topic || "").toLowerCase();
        return mTopic.includes(topicKey) || mTopic.includes((stat.name || "").toLowerCase());
      });
      
      // Decay factor: e^(-days / 14)
      let weightedMistakes = 0;
      topicMistakes.forEach(m => {
        const daysAgo = Math.max(0, (now - (m.timestamp || now)) / oneDayMs);
        const decay = Math.exp(-daysAgo / 14); // 14-day half-life
        weightedMistakes += (m.mistakeCount || 1) * decay;
      });

      const errorRate = stat.total > 0 ? ((stat.total - stat.correct) / stat.total) : (topicMistakes.length > 0 ? 0.6 : 0.2);
      const weaknessScore = Math.round((errorRate * 50) + (Math.min(10, weightedMistakes) * 4) + (stat.mastery < 50 ? 15 : 0));

      if (weaknessScore > 25 || topicMistakes.length > 0) {
        list.push({
          topicId: topicKey,
          topic: stat.name || topicKey,
          errorRate: Math.round(errorRate * 100),
          mistakeCount: topicMistakes.length,
          mastery: stat.mastery,
          confidence: stat.confidence || 30,
          weaknessScore,
          evidence: stat.evidence || {},
          advice: `Tỷ lệ sai ${Math.round(errorRate * 100)}% (Độ tin cậy: ${stat.confidence || 30}% - dựa trên ${stat.total} câu).`
        });
      }
    }

    list.sort((a, b) => b.weaknessScore - a.weaknessScore);
    return list.slice(0, 3);
  }

  // Identifies the single most urgent Learning Objective to reinforce
  getWeakestObjective() {
    if (!this.learningObjectivesData || this.learningObjectivesData.length === 0) return null;
    let weakest = null;
    let lowestScore = 999;

    for (const topic of this.learningObjectivesData) {
      // Check if prerequisites are met (>= 60%)
      const prereqsMet = (topic.prerequisites || []).every(pr => this.getTopicMastery(pr) >= 60);
      if (!prereqsMet && topic.prerequisites && topic.prerequisites.length > 0) continue;

      for (const obj of (topic.objectives || [])) {
        const objData = this.getObjectiveData(obj.id);
        const m = objData.total > 0 ? objData.mastery : 35;
        if (m < lowestScore && objData.status !== "mastered") {
          lowestScore = m;
          weakest = {
            id: obj.id,
            title: obj.title,
            topicId: topic.topicId,
            topicTitle: topic.topicName,
            mastery: m,
            status: objData.status || (objData.total === 0 ? "unseen" : "learning"),
            confidence: objData.confidence || 20
          };
        }
      }
    }
    return weakest;
  }

  getAdaptiveQueue() {
    const queue = [];
    const counts = (window.srsCtrl && window.srsCtrl.getCounts) ? window.srsCtrl.getCounts() : { due: 0 };
    const mistakesCount = (window.mistakesCtrl && window.mistakesCtrl.mistakes) ? window.mistakesCtrl.mistakes.length : 0;
    const skills = this.data.skills;

    // Highest Priority: Target Weakest Learning Objective
    const weakestObj = this.getWeakestObjective();
    if (weakestObj) {
      queue.push({
        id: "q_weakest_lo",
        priority: "highest",
        icon: "🎯",
        title: `Mục tiêu cần củng cố: ${weakestObj.title}`,
        desc: `${weakestObj.topicTitle} • Mastery: ${weakestObj.mastery}% (${weakestObj.status})`,
        timeEst: "~3 phút",
        tab: "grammar",
        topicId: weakestObj.topicId,
        objectiveId: weakestObj.id,
        why: `Hệ thống phân tích bạn đang yếu ở mục tiêu "${weakestObj.title}" (${weakestObj.mastery}%). Hãy luyện tập củng cố ngay để mở khóa các chủ điểm tiếp theo!`,
        badge: "Cấp thiết"
      });
    }

    if (mistakesCount > 0) {
      queue.push({
        id: "q_mistakes",
        priority: "high",
        icon: "📕",
        title: "Khắc phục Lỗi sai trong Sổ tay",
        desc: `Bạn có ${mistakesCount} câu hỏi cần củng cố lại kiến thức`,
        timeEst: "~3 phút",
        tab: "quiz",
        why: "Sửa lỗi sai ngay lập tức ngăn chặn việc hình thành 'trí nhớ sai lệch' trong tiếng Đức.",
        badge: `${mistakesCount} lỗi cần sửa`
      });
    }

    if (counts.due > 0) {
      queue.push({
        id: "q_srs",
        priority: "high",
        icon: "🧠",
        title: "Ôn tập Thẻ nhớ SRS",
        desc: `${counts.reviewDue || 0} từ đến hạn ôn + ${counts.availableNewToday || 0} từ mới hôm nay`,
        timeEst: `~${Math.ceil(counts.due * 0.5)} phút`,
        tab: "flashcards",
        why: "Từ vựng đến chu kỳ ngắt quãng SM-2 cần được củng cố để lưu vào trí nhớ dài hạn.",
        badge: `${counts.due} thẻ hôm nay`
      });
    } else {
      queue.push({
        id: "q_srs_new",
        priority: "normal",
        icon: "🆕",
        title: "Học từ vựng mới",
        desc: "Học 10 từ vựng cốt lõi mới trong ngày",
        timeEst: "~5 phút",
        tab: "flashcards",
        why: "Mỗi ngày tiếp thu 10 từ mới để mở rộng vốn từ A1-B1 bền vững.",
        badge: "10 từ mới"
      });
    }

    const nextLessonNum = (this.data.completedLessons.length + 1);
    queue.push({
      id: "q_lesson",
      priority: "normal",
      icon: "📖",
      title: "Bài học Nicos Weg",
      desc: `Lektion A1-${String(nextLessonNum).padStart(2, '0')} theo kịch bản Deutsche Welle`,
      timeEst: "~6 phút",
      tab: "lessons",
      why: "Tiếp nối mạch câu chuyện giúp rèn luyện khả năng nghe - hiểu ngữ cảnh thực tế.",
      badge: "Kịch bản"
    });

    const lowestSkill = Object.entries(skills).sort((a, b) => (a[1].skillProgress || 0) - (b[1].skillProgress || 0))[0];
    if (lowestSkill && lowestSkill[0] === "speaking") {
      queue.push({
        id: "q_speak",
        priority: "normal",
        icon: "🗣️",
        title: "Luyện phát âm & Nói (Sprechen)",
        desc: "Luyện phát âm chuẩn âm 'ch', biến âm ä/ö/ü và khẩu hình",
        timeEst: "~4 phút",
        tab: "speaking",
        why: `Kỹ năng Nói của bạn hiện đang ở mức ${Math.round(lowestSkill[1].skillProgress || 15)}%, cần luyện khẩu hình thêm.`,
        badge: "Luyện giọng"
      });
    } else {
      queue.push({
        id: "q_sb",
        priority: "normal",
        icon: "🧩",
        title: "Luyện trật tự câu (V2 Rule)",
        desc: "Ghép câu trần thuật và mệnh đề phụ chuẩn ngữ pháp",
        timeEst: "~4 phút",
        tab: "quiz",
        why: "Quy tắc động từ chia đứng vị trí 2 là nền tảng cốt lõi nhất của tiếng Đức.",
        badge: "Ghép câu"
      });
    }

    return queue;
  }

  showEvidenceModal(topicKey) {
    const key = this.normalizeTopicId(topicKey);
    const stat = this.data.topics[key];
    if (!stat) return;

    const modal = document.getElementById("mastery-evidence-modal");
    const titleEl = document.getElementById("evidence-modal-title");
    const contentEl = document.getElementById("evidence-modal-content");

    if (titleEl) titleEl.textContent = `Bằng Chứng Năng Lực (Mastery Evidence): ${stat.name || key}`;
    if (!modal || !contentEl) return;

    const ev = stat.evidence || {};
    contentEl.innerHTML = `
      <div class="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Độ làm chủ (Topic Mastery)</span>
          <span class="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">${stat.mastery}%</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Độ tin cậy dữ liệu (Confidence)</span>
          <span class="font-bold text-gray-800 dark:text-gray-200 font-mono">${stat.confidence}%</span>
        </div>
      </div>

      <div class="space-y-2 pt-2">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiết 4 thành phần cấu thành Mastery:</h4>
        
        <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">1. Độ chính xác 15 câu gần đây (30% trọng số):</span>
            <span class="font-bold text-gray-900 dark:text-white font-mono">${ev.recentAccuracy || stat.mastery}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">2. Độ chính xác lịch sử (20% trọng số):</span>
            <span class="font-bold text-gray-900 dark:text-white font-mono">${ev.overallAccuracy || stat.mastery}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">3. Tỷ lệ nhớ thẻ SRS (30% trọng số):</span>
            <span class="font-bold text-gray-900 dark:text-white font-mono">${ev.srsRetentionPct || 50}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">4. Độ phủ bài tập (20% trọng số):</span>
            <span class="font-bold text-gray-900 dark:text-white font-mono">${ev.coveragePct || 40}%</span>
          </div>
        </div>

        <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1 text-xs">
          <span class="font-bold text-gray-700 dark:text-gray-300">📊 Bằng chứng mẫu dữ liệu thực tế:</span>
          <p class="text-gray-500">• <b>${stat.total}</b> câu đã thực hiện (${stat.correct} đúng, ${stat.total - stat.correct} sai)</p>
          <p class="text-gray-500">• <b>${ev.srsCardCount || 0}</b> thẻ nhớ từ vựng liên quan trong bộ thẻ SRS</p>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  showDailySummaryModal() {
    const modal = document.getElementById("daily-summary-modal");
    if (!modal) return;

    const mins = Math.round((this.data.today.actualSeconds || 0) / 60);
    const words = this.data.today.vocabReviewed || 0;
    const lessons = this.data.today.lessonsDone || 0;
    const streak = this.data.streak.current || 1;
    const acc = this.data.today.totalAttempted > 0 
      ? Math.round((this.data.today.correctCount / this.data.today.totalAttempted) * 100) 
      : 85;

    const elTime = document.getElementById("summary-time");
    const elWords = document.getElementById("summary-words");
    const elLessons = document.getElementById("summary-lessons");
    const elStreak = document.getElementById("summary-streak");
    const elAcc = document.getElementById("summary-accuracy");

    if (elTime) elTime.textContent = `${mins} phút`;
    if (elWords) elWords.textContent = `${words} từ`;
    if (elLessons) elLessons.textContent = `${lessons} bài`;
    if (elStreak) elStreak.textContent = `${streak} ngày 🔥`;
    if (elAcc) elAcc.textContent = `${acc}%`;

    modal.classList.remove("hidden");
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `deutschmaster_tien_do_${this.getLocalDateString()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  }

  importDataJSON(fileContent) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed && typeof parsed === "object") {
        this.data = this.migrateData(parsed);
        this.saveProgress();
        if (window.appCtrl) window.appCtrl.showToast("Đã khôi phục tiến độ học tập thành công! 🎉");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (e) {
      alert("File dữ liệu không hợp lệ! Vui lòng chọn đúng file .json đã xuất từ DeutschMaster.");
    }
  }

  updateUI() {
    const streakDisplay = document.getElementById("header-streak-count");
    if (streakDisplay) streakDisplay.textContent = this.data.streak.current || 0;

    const minutes = Math.round((this.data.today.actualSeconds || 0) / 60);
    const target = this.data.dailyGoalMinutes || 20;

    const dashTodayMins = document.getElementById("dash-today-mins");
    if (dashTodayMins) dashTodayMins.textContent = `${minutes} / ${target} phút`;

    const dashTodayBar = document.getElementById("dash-today-bar");
    if (dashTodayBar) {
      const pct = Math.min(100, (minutes / target) * 100);
      dashTodayBar.style.width = `${pct}%`;
    }

    for (const [skill, val] of Object.entries(this.data.skills)) {
      const score = val.skillProgress !== undefined ? val.skillProgress : (val.score || 15);
      const bar = document.getElementById(`skill-bar-${skill}`);
      const txt = document.getElementById(`skill-val-${skill}`);
      if (bar) bar.style.width = `${Math.round(score)}%`;
      if (txt) txt.textContent = `${Math.round(score)}%`;
    }

    this.renderWeakAreasUI();
    this.renderAdaptiveQueueUI();
  }

  renderWeakAreasUI() {
    const container = document.getElementById("dash-weak-areas-container");
    if (!container) return;

    const weak = this.getWeakAreas();
    if (weak.length === 0) {
      container.innerHTML = `
        <div class="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <span>✓ Năng lực rất đồng đều! Bạn chưa có điểm yếu nào cần cảnh báo.</span>
          <span class="font-bold">100% Tốt</span>
        </div>
      `;
      return;
    }

    container.innerHTML = weak.map(w => `
      <div class="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all" onclick="window.progressCtrl && window.progressCtrl.showEvidenceModal('${w.topicId}')">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-black text-amber-900 dark:text-amber-200">⚠️ ${w.topic}</span>
            <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">Sai ${w.errorRate}%</span>
            <span class="text-[10px] text-gray-500 font-mono">Mastery: ${w.mastery}% (Độ tin cậy: ${w.confidence}%)</span>
            <span class="text-[10px] text-blue-600 hover:underline">👁️ Xem bằng chứng</span>
          </div>
          <p class="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">${w.advice}</p>
        </div>
        <button onclick="event.stopPropagation(); window.appCtrl && window.appCtrl.switchTab('mistakes')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 shadow-xs self-end sm:self-center">
          Luyện ngay →
        </button>
      </div>
    `).join("");
  }

  renderAdaptiveQueueUI() {
    const container = document.getElementById("dash-today-queue-container");
    if (!container) return;

    const queue = this.getAdaptiveQueue();
    container.innerHTML = queue.map((item, idx) => {
      const isHighest = item.priority === "highest";
      const isHigh = item.priority === "high";
      const borderClass = isHighest 
        ? "border-rose-400 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20" 
        : (isHigh ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20" : "border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800");

      const iconBg = isHighest 
        ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" 
        : (isHigh ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400");

      const badgeBg = isHighest
        ? "bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
        : (isHigh ? "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100" : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300");

      const clickAction = item.objectiveId && item.topicId
        ? `window.mistakesCtrl && window.mistakesCtrl.practiceObjective('${item.objectiveId}', '${item.topicId}')`
        : `window.appCtrl && window.appCtrl.switchTab('${item.tab}')`;

      return `
        <div class="p-4 rounded-2xl border-2 ${borderClass} shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer" onclick="${clickAction}">
          <div class="flex items-start gap-3 flex-1">
            <div class="w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center text-lg font-black shadow-2xs shrink-0 mt-0.5">
              ${item.icon}
            </div>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-black text-gray-400 font-mono">#${idx + 1}</span>
                <h4 class="text-sm font-bold text-gray-900 dark:text-gray-100">${item.title}</h4>
                <span class="px-2 py-0.2 rounded-full text-[10px] font-bold ${badgeBg}">${item.badge}</span>
                <span class="text-[10px] text-gray-400 font-mono">${item.timeEst}</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300">${item.desc}</p>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 italic">💡 <b>Vì sao gợi ý:</b> ${item.why}</div>
            </div>
          </div>
          <span class="text-xs font-bold ${isHighest ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'} self-end sm:self-center hover:translate-x-0.5 transition-all">Luyện ngay →</span>
        </div>
      `;
    }).join("");
  }
}

window.progressCtrl = new ProgressController();
