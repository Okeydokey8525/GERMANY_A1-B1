// WEB_Germany Dynamic Learning Roadmap, Grammar Dependency & Stage Mastery Test Engine

class RoadmapController {
  constructor() {
    this.curriculum = null;
    this.selectedLevel = "A1";
    this.currentTestingStage = null;
    this.currentTestingCanDo = null;

    this.initCurriculum();
    this.initModals();
  }

  async initCurriculum() {
    try {
      const resp = await fetch("./data/curriculum.json");
      this.curriculum = await resp.json();
    } catch (e) {
      console.warn("Failed to load curriculum.json:", e);
    }
    this.renderRoadmap();
    this.renderDependencyGraph();
    this.renderCanDoChecklist();
  }

  initModals() {
    const candoModal = document.getElementById("cando-test-modal");
    const closeCando = document.getElementById("btn-close-cando-test");
    if (closeCando && candoModal) {
      closeCando.addEventListener("click", () => candoModal.classList.add("hidden"));
    }

    const stageModal = document.getElementById("stage-test-modal");
    const closeStage = document.getElementById("btn-close-stage-test");
    if (closeStage && stageModal) {
      closeStage.addEventListener("click", () => stageModal.classList.add("hidden"));
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
    this.renderDependencyGraph();
  }

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

    // Bonus for passed stage mastery test
    const stagePassed = window.progressCtrl && window.progressCtrl.data.stageTestsPassed && window.progressCtrl.data.stageTestsPassed[stage.id];
    if (stagePassed) score = Math.max(score, 85);

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
      const isTestPassed = window.progressCtrl && window.progressCtrl.data.stageTestsPassed && window.progressCtrl.data.stageTestsPassed[stage.id];

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
                ${isTestPassed ? `<span class="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">✓ Đã tốt nghiệp</span>` : ''}
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">${stage.title}</h3>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="stage-test-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-2xs shrink-0" title="Làm bài kiểm tra tốt nghiệp chặng">
              🎯 Thi tốt nghiệp
            </button>
            <button class="stage-action-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs shrink-0">
              Học ngay →
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">${stage.desc}</p>
        
        <!-- Learning Objectives Accordion List -->
        ${stage.learningObjectives ? `
          <div class="space-y-1 py-2">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mục tiêu học tập (Learning Objectives):</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              ${stage.learningObjectives.map(lo => `
                <div class="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <span class="text-blue-500 font-mono font-bold">•</span>
                  <span>${lo.title}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

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

      card.querySelector(".stage-test-btn").addEventListener("click", () => {
        this.openStageMasteryTest(stage);
      });

      container.appendChild(card);
    });
  }

  // Grammar Dependency Graph Visualizer
  renderDependencyGraph() {
    const container = document.getElementById("grammar-dependency-container");
    if (!container) return;

    const levelData = this.curriculum && this.curriculum.levels ? this.curriculum.levels[this.selectedLevel] : null;
    const stages = levelData ? levelData.stages : [];

    container.innerHTML = stages.map((s, idx) => {
      const prog = this.calculateStageProgress(s);
      const isPassed = prog >= 80;
      const statusIcon = isPassed ? "🟢" : (prog >= 40 ? "🟡" : "⚪");

      return `
        <div class="p-3 rounded-2xl border ${isPassed ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} text-xs space-y-1 shrink-0 min-w-[170px]">
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-800 dark:text-gray-200">${s.sublevel} - Chặng ${idx + 1}</span>
            <span>${statusIcon}</span>
          </div>
          <p class="font-semibold text-gray-900 dark:text-white truncate">${s.title}</p>
          <div class="text-[10px] text-gray-500 font-mono">Mastery: ${prog}%</div>
        </div>
      `;
    }).join(`
      <div class="text-gray-400 font-bold self-center">➔</div>
    `);
  }

  // Stage Mastery Test Modal
  openStageMasteryTest(stage) {
    this.currentTestingStage = stage;
    const modal = document.getElementById("stage-test-modal");
    const testTitle = document.getElementById("stage-test-title");
    const testContainer = document.getElementById("stage-test-questions");

    if (testTitle) testTitle.textContent = `Kiểm Tra Tốt Nghiệp: ${stage.title}`;
    if (!testContainer || !modal) return;

    testContainer.innerHTML = "";
    const questions = stage.masteryTest || [];

    if (questions.length === 0) {
      testContainer.innerHTML = `<div class="p-4 text-xs text-gray-500 text-center">Đang cập nhật ngân hàng đề thi cho chặng này...</div>`;
      modal.classList.remove("hidden");
      return;
    }

    questions.forEach((q, qIdx) => {
      const qBlock = document.createElement("div");
      qBlock.className = "p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-2.5";
      qBlock.innerHTML = `
        <span class="text-xs font-bold text-gray-500 font-mono">Câu ${qIdx + 1} / ${questions.length}</span>
        <h4 class="text-sm font-bold text-gray-900 dark:text-white">${q.q}</h4>
        <div class="space-y-1.5">
          ${q.opts.map((opt, optIdx) => `
            <label class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 bg-white dark:bg-gray-800 flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="radio" name="stage_q_${qIdx}" value="${optIdx}">
              <span>${opt}</span>
            </label>
          `).join("")}
        </div>
      `;
      testContainer.appendChild(qBlock);
    });

    const submitBtn = document.createElement("button");
    submitBtn.className = "w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all";
    submitBtn.textContent = "Nộp Bài Tốt Nghiệp Chặng (Prüfen)";
    submitBtn.addEventListener("click", () => {
      let correct = 0;
      questions.forEach((q, qIdx) => {
        const sel = document.querySelector(`input[name='stage_q_${qIdx}']:checked`);
        if (sel && parseInt(sel.value) === q.ans) correct++;
      });

      const scorePct = Math.round((correct / questions.length) * 100);
      if (scorePct >= 80) {
        if (window.progressCtrl) {
          if (!window.progressCtrl.data.stageTestsPassed) window.progressCtrl.data.stageTestsPassed = {};
          window.progressCtrl.data.stageTestsPassed[stage.id] = { score: scorePct, date: Date.now() };
          window.progressCtrl.saveProgress();
        }
        if (window.appCtrl) {
          window.appCtrl.showToast(`🎉 Xuất sắc! Bạn đạt ${scorePct}% và đã chính thức tốt nghiệp ${stage.title}!`);
        }
        modal.classList.add("hidden");
        this.renderRoadmap();
        this.renderDependencyGraph();
      } else {
        alert(`Bạn đạt ${scorePct}% (Cần ≥ 80% để tốt nghiệp). Hãy ôn lại các điểm yếu và thử lại nhé!`);
        modal.classList.add("hidden");
      }
    });

    testContainer.appendChild(submitBtn);
    modal.classList.remove("hidden");
  }

  renderCanDoChecklist() {
    const container = document.getElementById("cando-checklist-container");
    if (!container) return;

    const userState = (window.progressCtrl && window.progressCtrl.data.canDoChecklist) || {};

    const levelData = this.curriculum && this.curriculum.levels ? this.curriculum.levels[this.selectedLevel] : null;
    const stages = levelData ? levelData.stages : [];

    container.innerHTML = "";
    stages.forEach((stage, sIdx) => {
      const stagePassed = window.progressCtrl && window.progressCtrl.data.stageTestsPassed && window.progressCtrl.data.stageTestsPassed[stage.id];
      const curState = stagePassed ? "tested" : (userState[stage.id] || "unlearned");

      const row = document.createElement("div");
      row.className = `p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        curState === "tested" 
          ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
          : (curState === "learning" ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800")
      }`;

      const stateBadgeHtml = curState === "tested"
        ? `<span class="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">🟢 Đã kiểm tra đạt</span>`
        : `<span class="px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">🟡 Thi tốt nghiệp chặng để đạt</span>`;

      row.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <span class="text-xs sm:text-sm font-semibold ${curState === 'tested' ? 'text-emerald-950 dark:text-emerald-100' : 'text-gray-800 dark:text-gray-200'}">
            ${stage.competency}
          </span>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${stage.sublevel}</span>
          <button class="cando-test-btn cursor-pointer hover:scale-105 active:scale-95 transition-all">${stateBadgeHtml}</button>
        </div>
      `;

      row.querySelector(".cando-test-btn").addEventListener("click", () => {
        this.openStageMasteryTest(stage);
      });

      container.appendChild(row);
    });
  }
}

window.roadmapCtrl = new RoadmapController();
