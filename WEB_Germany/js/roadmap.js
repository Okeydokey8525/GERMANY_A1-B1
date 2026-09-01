// WEB_Germany Dynamic Learning Roadmap & Real Can-Do Skill Verification Engine

class RoadmapController {
  constructor() {
    this.curriculum = null;
    this.selectedLevel = "A1";
    this.currentTestingItem = null;
    this.canDoItems = [
      {
        id: "cd_01",
        level: "A1",
        text: "Tôi có thể tự giới thiệu tên, tuổi, nghề nghiệp và quê quán bằng tiếng Đức.",
        state: "unlearned",
        testQuestions: [
          { q: "Cách nói 'Tôi tên là Nico và tôi đến từ Việt Nam' là gì?", opts: ["Ich heiße Nico und komme aus Vietnam.", "Ich bin Nico und wohne in Vietnam.", "Mein Name ist Nico und ich gehe nach Vietnam."], ans: 0 },
          { q: "'Wie alt bist du?' nghĩa là gì?", opts: ["Bạn bao nhiêu tuổi?", "Bạn sống ở đâu?", "Bạn làm nghề gì?"], ans: 0 },
          { q: "Đại từ nhân xưng ngôi 'Chúng tôi' trong tiếng Đức là:", opts: ["wir", "sie", "ihr"], ans: 0 }
        ]
      },
      {
        id: "cd_02",
        level: "A1",
        text: "Tôi có thể đếm số từ 0 đến 100 và đọc số điện thoại, giá tiền.",
        state: "unlearned",
        testQuestions: [
          { q: "Số 25 trong tiếng Đức đọc là gì?", opts: ["fünfundzwanzig", "zwanzigfünf", "fünfzehn"], ans: 0 },
          { q: "'Wie viel kostet das?' nghĩa là gì?", opts: ["Cái này giá bao nhiêu?", "Bây giờ là mấy giờ?", "Nhà ga ở đâu?"], ans: 0 }
        ]
      },
      {
        id: "cd_03",
        level: "A1",
        text: "Tôi có thể phân biệt mạo từ xác định der / die / das và cách Akkusativ.",
        state: "unlearned",
        testQuestions: [
          { q: "Điền câu: 'Ich habe ______ Tisch (der Tisch) gekauft.'", opts: ["einen", "ein", "eine"], ans: 0 },
          { q: "Mạo từ của danh từ 'Kaffee' là gì?", opts: ["der", "die", "das"], ans: 0 }
        ]
      },
      {
        id: "cd_04",
        level: "A1",
        text: "Tôi có thể sử dụng động từ khuyết thiếu (Modalverben) và động từ tách.",
        state: "unlearned",
        testQuestions: [
          { q: "Điền câu: 'Nico ______ sehr gut Deutsch sprechen.'", opts: ["kann", "können", "kannst"], ans: 0 },
          { q: "Động từ tách 'aufstehen' trong câu: 'Ich stehe um 7 Uhr ______.'", opts: ["auf", "an", "aus"], ans: 0 }
        ]
      },
      {
        id: "cd_05",
        level: "A1",
        text: "Tôi có thể kể lại ngắn gọn một sự việc trong quá khứ với thì Perfekt.",
        state: "unlearned",
        testQuestions: [
          { q: "'Gestern habe ich meine Hausaufgaben ______.'", opts: ["gemacht", "machen", "gemachen"], ans: 0 },
          { q: "'Er ______ nach Berlin gefahren.'", opts: ["ist", "hat", "wird"], ans: 0 }
        ]
      },
      {
        id: "cd_06",
        level: "A2",
        text: "Tôi có thể phân biệt vị trí đứng yên (Wo? + Dativ) và hướng di chuyển (Wohin? + Akkusativ).",
        state: "unlearned",
        testQuestions: [
          { q: "'Das Buch liegt auf ______ Tisch (der Tisch).' (Wo?)", opts: ["dem", "den", "das"], ans: 0 },
          { q: "'Ich lege das Buch auf ______ Tisch.' (Wohin?)", opts: ["den", "dem", "das"], ans: 0 }
        ]
      },
      {
        id: "cd_07",
        level: "B1",
        text: "Tôi có thể sử dụng câu bị động Passiv và thể giả định Konjunktiv II.",
        state: "unlearned",
        testQuestions: [
          { q: "'In Deutschland ______ viel Bier getrunken.'", opts: ["wird", "hat", "ist"], ans: 0 },
          { q: "'Wenn ich Zeit hätte, ______ ich nach Berlin reisen.'", opts: ["würde", "werde", "habe"], ans: 0 }
        ]
      }
    ];

    this.initCurriculum();
    this.initTestModal();
  }

  async initCurriculum() {
    try {
      const resp = await fetch("./data/curriculum.json");
      this.curriculum = await resp.json();
    } catch (e) {
      console.warn("Failed to load curriculum.json:", e);
    }
    this.renderRoadmap();
    this.renderCanDoChecklist();
  }

  initTestModal() {
    const modal = document.getElementById("cando-test-modal");
    const closeBtn = document.getElementById("btn-close-cando-test");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    }
  }

  switchLevel(level) {
    this.selectedLevel = level;
    document.querySelectorAll(".roadmap-level-btn").forEach(btn => {
      const bLvl = btn.getAttribute("data-level");
      if (bLvl === level) {
        btn.className = "roadmap-level-btn px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs transition-all";
      } else {
        btn.className = "roadmap-level-btn px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
      }
    });
    this.renderRoadmap();
  }

  // Real Dynamic Progress Calculation linked to Stage-Specific Topic Mastery!
  calculateStageProgress(stage) {
    let score = 0;
    const completedLessons = (window.progressCtrl && window.progressCtrl.data.completedLessons) || [];
    
    // 1. Lessons coverage (35% weight)
    if (stage.lessonIds && stage.lessonIds.length > 0) {
      const doneCount = stage.lessonIds.filter(id => completedLessons.includes(id)).length;
      score += (doneCount / stage.lessonIds.length) * 35;
    } else {
      score += 15;
    }

    // 2. Vocabulary mastery in this stage (30% weight)
    if (window.srsCtrl && stage.vocabTopics) {
      let stageVocabTotal = 0;
      let stageVocabMastered = 0;
      Object.values(window.srsCtrl.cards).forEach(c => {
        if (stage.vocabTopics.includes(c.topic)) {
          stageVocabTotal++;
          if (c.state === "mastered" || c.state === "review") stageVocabMastered++;
        }
      });
      if (stageVocabTotal > 0) {
        score += (stageVocabMastered / stageVocabTotal) * 30;
      } else {
        score += 15;
      }
    } else {
      score += 15;
    }

    // 3. Stage-Specific Topic Mastery from progressCtrl (35% weight)
    let topicMasterySum = 0;
    let topicCount = 0;
    if (window.progressCtrl && stage.grammarTopics) {
      stage.grammarTopics.forEach(top => {
        const m = window.progressCtrl.getTopicMastery(top);
        topicMasterySum += m;
        topicCount++;
      });
    }

    if (topicCount > 0) {
      score += (topicMasterySum / (topicCount * 100)) * 35;
    } else {
      score += 15;
    }

    return Math.min(100, Math.max(10, Math.round(score)));
  }

  renderRoadmap() {
    const container = document.getElementById("roadmap-stages-container");
    if (!container) return;

    const levelData = this.curriculum && this.curriculum.levels ? this.curriculum.levels[this.selectedLevel] : null;
    const stages = levelData ? levelData.stages : [];

    container.innerHTML = "";

    if (stages.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-xs text-gray-400">Đang nạp dữ liệu lộ trình...</div>`;
      return;
    }

    stages.forEach((stage, idx) => {
      const dynProgress = this.calculateStageProgress(stage);
      const isCompleted = dynProgress >= 80;

      const card = document.createElement("div");
      card.className = `relative p-5 rounded-3xl border-2 transition-all duration-200 ${
        isCompleted 
          ? "border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10" 
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
      }`;

      const icon = idx === 0 ? "🔤" : (idx === 1 ? "🗣️" : (idx === 2 ? "📦" : (idx === 3 ? "🍽️" : (idx === 4 ? "⚙️" : (idx === 5 ? "🗺️" : "⏳")))));

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-2xs">
              ${icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase">${stage.sublevel}</span>
                <span class="text-xs font-bold text-gray-400">Giai đoạn ${idx + 1}</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">${stage.title}</h3>
            </div>
          </div>
          <button class="stage-action-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs shrink-0">
            Học ngay →
          </button>
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-300 mb-2.5">${stage.desc}</p>
        <div class="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 font-medium mb-3 border border-blue-100 dark:border-blue-900/40">
          🎯 <b>Chuẩn đầu ra:</b> ${stage.competency}
        </div>

        <div class="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span>Tiến độ thực tế (Topic Mastery Engine)</span>
            <span class="font-mono font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}">${dynProgress}%</span>
          </div>
          <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'} rounded-full transition-all duration-500" style="width: ${dynProgress}%;"></div>
          </div>
        </div>
      `;

      card.querySelector(".stage-action-btn").addEventListener("click", () => {
        if (window.appCtrl) {
          window.appCtrl.switchTab("lessons");
          window.appCtrl.showToast(`Bắt đầu ${stage.title}! 🚀`);
        }
      });

      container.appendChild(card);
    });
  }

  renderCanDoChecklist() {
    const container = document.getElementById("cando-checklist-container");
    if (!container) return;

    const userState = (window.progressCtrl && window.progressCtrl.data.canDoChecklist) || {};

    container.innerHTML = "";
    this.canDoItems.forEach(item => {
      const curState = userState[item.id] || item.state || "unlearned";
      
      const row = document.createElement("div");
      row.className = `p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        curState === "tested" 
          ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
          : (curState === "learning" ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800")
      }`;

      const stateBadgeHtml = curState === "tested"
        ? `<span class="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">🟢 Đã kiểm tra đạt</span>`
        : (curState === "learning"
          ? `<span class="px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">🟡 Đang học (🧪 Kiểm tra ngay)</span>`
          : `<span class="px-3 py-1 rounded-xl text-[11px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">○ Chưa kiểm tra (🧪 Bắt đầu)</span>`);

      row.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <span class="text-xs sm:text-sm font-semibold ${curState === 'tested' ? 'text-emerald-950 dark:text-emerald-100' : 'text-gray-800 dark:text-gray-200'}">
            ${item.text}
          </span>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${item.level}</span>
          <button class="cando-test-btn cursor-pointer hover:scale-105 active:scale-95 transition-all">${stateBadgeHtml}</button>
        </div>
      `;

      row.querySelector(".cando-test-btn").addEventListener("click", () => {
        this.openSkillTest(item);
      });

      container.appendChild(row);
    });
  }

  // Opens Real Mini Skill Test Modal (No more self-declaration!)
  openSkillTest(item) {
    this.currentTestingItem = item;
    const modal = document.getElementById("cando-test-modal");
    const testTitle = document.getElementById("cando-test-title");
    const testContainer = document.getElementById("cando-test-questions");

    if (testTitle) testTitle.textContent = `Kiểm Tra Năng Lực: ${item.text}`;
    if (!testContainer || !modal) return;

    testContainer.innerHTML = "";
    const questions = item.testQuestions || [];
    let userAnswers = {};

    questions.forEach((q, qIdx) => {
      const qBlock = document.createElement("div");
      qBlock.className = "p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2.5";
      qBlock.innerHTML = `
        <span class="text-xs font-bold text-gray-500 font-mono">Câu hỏi ${qIdx + 1} / ${questions.length}</span>
        <h4 class="text-sm font-bold text-gray-900 dark:text-white">${q.q}</h4>
        <div class="space-y-1.5">
          ${q.opts.map((opt, optIdx) => `
            <label class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="radio" name="test_q_${qIdx}" value="${optIdx}">
              <span>${opt}</span>
            </label>
          `).join("")}
        </div>
      `;
      testContainer.appendChild(qBlock);
    });

    const submitBtn = document.createElement("button");
    submitBtn.className = "w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all";
    submitBtn.textContent = "Nộp Bài Kiểm Tra Kỹ Năng (Prüfen)";
    submitBtn.addEventListener("click", () => {
      let correct = 0;
      questions.forEach((q, qIdx) => {
        const sel = document.querySelector(`input[name='test_q_${qIdx}']:checked`);
        if (sel && parseInt(sel.value) === q.ans) correct++;
      });

      const scorePct = Math.round((correct / questions.length) * 100);
      if (scorePct >= 80) {
        if (window.progressCtrl) {
          window.progressCtrl.data.canDoChecklist[item.id] = "tested";
          window.progressCtrl.saveProgress();
        }
        if (window.appCtrl) {
          window.appCtrl.showToast(`🎉 Xuất sắc! Bạn đạt ${scorePct}% và đã chính thức làm chủ năng lực này!`);
        }
        modal.classList.add("hidden");
        this.renderCanDoChecklist();
      } else {
        if (window.progressCtrl) {
          window.progressCtrl.data.canDoChecklist[item.id] = "learning";
          window.progressCtrl.saveProgress();
        }
        alert(`Bạn đạt ${scorePct}% (Cần ≥ 80% để đạt). Hãy tiếp tục rèn luyện và thử lại nhé!`);
        modal.classList.add("hidden");
        this.renderCanDoChecklist();
      }
    });

    testContainer.appendChild(submitBtn);
    modal.classList.remove("hidden");
  }
}

window.roadmapCtrl = new RoadmapController();
