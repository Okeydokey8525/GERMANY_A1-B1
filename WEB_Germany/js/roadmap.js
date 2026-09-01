// WEB_Germany Dynamic Learning Roadmap & CEFR Can-Do Checklist Module

class RoadmapController {
  constructor() {
    this.curriculum = null;
    this.selectedLevel = "A1";
    this.canDoItems = [
      { id: "cd_01", level: "A1", text: "Tôi có thể tự giới thiệu tên, tuổi, nghề nghiệp và quê quán bằng tiếng Đức.", state: "tested" },
      { id: "cd_02", level: "A1", text: "Tôi có thể đếm số từ 0 đến 100 và đọc số điện thoại, giá tiền.", state: "tested" },
      { id: "cd_03", level: "A1", text: "Tôi có thể hỏi đường và xem giờ giấc xe buýt, tàu hỏa.", state: "learning" },
      { id: "cd_04", level: "A1", text: "Tôi có thể gọi món ăn, đồ uống và yêu cầu thanh toán tại nhà hàng.", state: "learning" },
      { id: "cd_05", level: "A1", text: "Tôi có thể phân biệt và chia đúng động từ khuyết thiếu (können, müssen, möchten).", state: "learning" },
      { id: "cd_06", level: "A1", text: "Tôi có thể kể lại ngắn gọn một sự việc đã diễn ra trong quá khứ (Perfekt).", state: "unlearned" },
      { id: "cd_07", level: "A2", text: "Tôi có thể viết email/tin nhắn hẹn lịch hoặc xin phép nghỉ phép đơn giản.", state: "unlearned" },
      { id: "cd_08", level: "A2", text: "Tôi có thể phân biệt vị trí đứng yên (Wo? + Dativ) và hướng di chuyển (Wohin? + Akkusativ).", state: "unlearned" },
      { id: "cd_09", level: "B1", text: "Tôi có thể trình bày quan điểm cá nhân và giải thích lý do bằng liên từ weil/dass/obwohl.", state: "unlearned" },
      { id: "cd_10", level: "B1", text: "Tôi có thể sử dụng câu bị động Passiv và thể giả định Konjunktiv II trong công việc.", state: "unlearned" }
    ];

    this.initCurriculum();
  }

  async initCurriculum() {
    try {
      const resp = await fetch("./data/curriculum.json");
      this.curriculum = await resp.json();
    } catch (e) {
      console.warn("Failed to load curriculum.json, using fallback:", e);
    }
    this.renderRoadmap();
    this.renderCanDoChecklist();
  }

  switchLevel(level) {
    this.selectedLevel = level;
    document.querySelectorAll(".roadmap-level-btn").forEach(btn => {
      const bLvl = btn.getAttribute("data-level");
      if (bLvl === level) {
        btn.className = "roadmap-level-btn px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs transition-all";
      } else {
        btn.className = "roadmap-level-btn px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all";
      }
    });
    this.renderRoadmap();
  }

  // Dynamic Progress Calculation for each stage!
  calculateStageProgress(stage) {
    let score = 0;
    const completedLessons = (window.progressCtrl && window.progressCtrl.data.completedLessons) || [];
    
    // 1. Lessons coverage (40% weight)
    if (stage.lessonIds && stage.lessonIds.length > 0) {
      const doneCount = stage.lessonIds.filter(id => completedLessons.includes(id)).length;
      score += (doneCount / stage.lessonIds.length) * 40;
    } else {
      score += 20;
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

    // 3. Overall Skill Level baseline (30% weight)
    const skills = (window.progressCtrl && window.progressCtrl.data.skills) || {};
    const grammarScore = skills.grammar?.score || 10;
    score += (grammarScore / 100) * 30;

    return Math.min(100, Math.max(0, Math.round(score)));
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
          <button class="stage-action-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs shrink-0">
            Học ngay →
          </button>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">${stage.desc}</p>
        <div class="p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-medium mb-3 border border-blue-50 dark:border-blue-950/30">
          🎯 <b>Chuẩn đầu ra:</b> ${stage.competency}
        </div>

        <div class="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/60">
          <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span>Tiến độ thực tế (Dynamic Mastery)</span>
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

  // 3-State Can-Do Checklist (Unlearned -> Learning -> Tested)
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
        ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">🟢 Đã kiểm tra đạt</span>`
        : (curState === "learning"
          ? `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">🟡 Đang rèn luyện</span>`
          : `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">○ Chưa học</span>`);

      row.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <span class="text-xs sm:text-sm font-semibold ${curState === 'tested' ? 'text-emerald-950 dark:text-emerald-100' : 'text-gray-800 dark:text-gray-200'}">
            ${item.text}
          </span>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${item.level}</span>
          <button class="cando-toggle-btn">${stateBadgeHtml}</button>
        </div>
      `;

      row.querySelector(".cando-toggle-btn").addEventListener("click", () => {
        const nextState = curState === "unlearned" ? "learning" : (curState === "learning" ? "tested" : "unlearned");
        if (window.progressCtrl) {
          window.progressCtrl.data.canDoChecklist[item.id] = nextState;
          window.progressCtrl.saveProgress();
          this.renderCanDoChecklist();
        }
      });

      container.appendChild(row);
    });
  }
}

window.roadmapCtrl = new RoadmapController();
