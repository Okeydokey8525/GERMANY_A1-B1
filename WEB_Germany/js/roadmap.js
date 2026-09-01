// WEB_Germany Learning Roadmap & CEFR Can-Do Checklist Module

class RoadmapController {
  constructor() {
    this.roadmapStages = [
      {
        id: "stage_01",
        level: "A1.1",
        title: "Giai đoạn 1: Khởi động từ số 0 & Quy tắc phát âm",
        desc: "Bảng chữ cái Đức, các nguyên âm biến âm (ä, ö, ü), phụ âm đặc biệt (ch, sch, sp, st, ß), và đại từ nhân xưng (ich, du, er, sie, es, wir, ihr, Sie).",
        status: "current",
        progress: 85,
        targetTab: "flashcards",
        icon: "🔤",
        modules: [
          { name: "Phát âm chuẩn tiếng Đức (A-Z & Umlaut)", done: true },
          { name: "Đại từ nhân xưng & Đại từ sở hữu", done: true },
          { name: "Chào hỏi & Tạm biệt cơ bản", done: true }
        ]
      },
      {
        id: "stage_02",
        level: "A1.1",
        title: "Giai đoạn 2: Động từ cốt lõi & Câu hỏi W-Fragen",
        desc: "Cách chia động từ ở hiện tại Präsens (sein, haben, kommen, heißen, wohnen), câu hỏi có từ để hỏi (wer, was, wo, woher, wie) và số đếm 0-100.",
        status: "open",
        progress: 60,
        targetTab: "lessons",
        icon: "🗣️",
        modules: [
          { name: "Nicos Weg Bài 1-10: Chào hỏi & Làm quen", done: true },
          { name: "Động từ sein & haben ở thì hiện tại", done: true },
          { name: "Số đếm (0-100) & Thời gian (Ngày, Giờ)", done: false }
        ]
      },
      {
        id: "stage_03",
        level: "A1.2",
        title: "Giai đoạn 3: Mạo từ Der / Die / Das & Danh từ số nhiều",
        desc: "Quy tắc nhận diện giống của danh từ, mạo từ xác định và không xác định, dạng số nhiều (die Pluralformen) và phủ định kein/nicht.",
        status: "open",
        progress: 40,
        targetTab: "grammar",
        icon: "📦",
        modules: [
          { name: "Mẹo nhớ mạo từ Der, Die, Das qua hậu tố", done: true },
          { name: "Dạng số nhiều của danh từ thông dụng", done: false },
          { name: "Phủ định với 'nicht' và 'kein'", done: false }
        ]
      },
      {
        id: "stage_04",
        level: "A1.2",
        title: "Giai đoạn 4: Cách Akkusativ & Mua sắm, Ẩm thực",
        desc: "Tân ngữ trực tiếp ở Akkusativ (den Mann, einen Apfel), gọi món ăn tại nhà hàng, hỏi giá tiền và mua sắm.",
        status: "open",
        progress: 25,
        targetTab: "grammar",
        icon: "🍽️",
        modules: [
          { name: "Quy tắc biến cách Akkusativ (den / einen)", done: false },
          { name: "Từ vựng Nấu ăn, Nhà hàng & Thủy hải sản", done: true },
          { name: "Nicos Weg Bài 11-25: Mua sắm & Ăn uống", done: false }
        ]
      },
      {
        id: "stage_05",
        level: "A1.2",
        title: "Giai đoạn 5: Động từ khuyết thiếu (Modalverben) & Động từ tách",
        desc: "Cách dùng müssen, können, wollen, dürfen, sollen, möchten và cấu trúc đưa động từ nguyên thể về cuối câu.",
        status: "open",
        progress: 15,
        targetTab: "grammar",
        icon: "⚙️",
        modules: [
          { name: "Bài tập Modalverben (Cornelsen Grammatik aktiv)", done: true },
          { name: "Động từ tách (Trennbare Verben: aufstehen, einkaufen)", done: false },
          { name: "Luyện trật tự từ V2 trong câu tiếng Đức", done: false }
        ]
      },
      {
        id: "stage_06",
        level: "A1.2",
        title: "Giai đoạn 6: Cách Dativ & Giới từ chỉ vị trí / phương hướng",
        desc: "Tân ngữ gián tiếp ở Dativ (dem, der, dem, den), giới từ 2 chiều Wechselpräpositionen (in, an, auf) và hỏi đường.",
        status: "open",
        progress: 10,
        targetTab: "grammar",
        icon: "🗺️",
        modules: [
          { name: "Bảng biến cách Dativ & Đại từ nhân xưng Dativ", done: false },
          { name: "Giới từ chỉ nơi chốn (Wo? + Dativ)", done: false },
          { name: "Nicos Weg Bài 26-50: Đi lại & Chỉ đường", done: false }
        ]
      },
      {
        id: "stage_07",
        level: "A1.2",
        title: "Giai đoạn 7: Thì quá khứ hoàn thành (Das Perfekt)",
        desc: "Kể lại các sự việc đã xảy ra trong quá khứ bằng thì Perfekt với trợ động từ haben/sein và phân từ Partizip II.",
        status: "open",
        progress: 5,
        targetTab: "grammar",
        icon: "⏳",
        modules: [
          { name: "Quy tắc tạo Partizip II (ge-...-t / ge-...-en)", done: false },
          { name: "Khi nào dùng 'haben' và khi nào dùng 'sein'?", done: false },
          { name: "Luyện nói & viết về ngày hôm qua", done: false }
        ]
      },
      {
        id: "stage_08",
        level: "A1.Zertifikat",
        title: "Giai đoạn 8: Luyện đề & Thi thử Goethe / Telc A1",
        desc: "Rèn luyện trọn bộ 4 kỹ năng Nghe (Hören), Đọc (Lesen), Viết (Schreiben), Nói (Sprechen) theo format đề thi chính thức.",
        status: "open",
        progress: 0,
        targetTab: "exam",
        icon: "🏆",
        modules: [
          { name: "Đề thi mẫu Goethe Zertifikat A1 Modellsatz 01", done: false },
          { name: "Đề thi mẫu Telc Deutsch A1 Modellsatz", done: false },
          { name: "Ôn tập tổng lực sổ tay lỗi sai trước khi thi", done: false }
        ]
      }
    ];

    this.canDoItems = [
      { id: "cd_01", level: "A1", text: "Tôi có thể tự giới thiệu tên, tuổi, nghề nghiệp và quê quán bằng tiếng Đức." },
      { id: "cd_02", level: "A1", text: "Tôi có thể đếm số từ 0 đến 100 và đọc số điện thoại, giá tiền." },
      { id: "cd_03", level: "A1", text: "Tôi có thể hỏi đường và xem giờ giấc xe buýt, tàu hỏa." },
      { id: "cd_04", level: "A1", text: "Tôi có thể gọi món ăn, đồ uống và yêu cầu thanh toán tại nhà hàng." },
      { id: "cd_05", level: "A1", text: "Tôi có thể phân biệt và chia đúng động từ khuyết thiếu (können, müssen, möchten)." },
      { id: "cd_06", level: "A1", text: "Tôi có thể kể lại ngắn gọn một sự việc đã diễn ra trong quá khứ (Perfekt)." },
      { id: "cd_07", level: "A2", text: "Tôi có thể viết email/tin nhắn hẹn lịch hoặc xin phép nghỉ phép đơn giản." },
      { id: "cd_08", level: "B1", text: "Tôi có thể trình bày quan điểm cá nhân và giải thích lý do bằng liên từ weil/dass." }
    ];

    this.initElements();
  }

  initElements() {
    this.renderRoadmap();
    this.renderCanDoChecklist();
  }

  renderRoadmap() {
    const container = document.getElementById("roadmap-stages-container");
    if (!container) return;

    container.innerHTML = "";
    this.roadmapStages.forEach((stage, idx) => {
      const card = document.createElement("div");
      card.className = "relative p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200";

      const modulesHtml = stage.modules.map(m => `
        <li class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span class="${m.done ? 'text-emerald-500 font-bold' : 'text-gray-400'}">${m.done ? '✓' : '○'}</span>
          <span class="${m.done ? 'line-through opacity-70' : ''}">${m.name}</span>
        </li>
      `).join("");

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-xs">
              ${stage.icon}
            </div>
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase tracking-wider">${stage.level}</span>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">${stage.title}</h3>
            </div>
          </div>
          <button class="stage-action-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs shrink-0" data-tab="${stage.targetTab}">
            Học ngay →
          </button>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">${stage.desc}</p>

        <div class="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            <span>Tiến độ hoàn thành</span>
            <span>${stage.progress}%</span>
          </div>
          <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" style="width: ${stage.progress}%;"></div>
          </div>
          <ul class="space-y-1 mt-2">
            ${modulesHtml}
          </ul>
        </div>
      `;

      card.querySelector(".stage-action-btn").addEventListener("click", () => {
        if (window.appCtrl) {
          window.appCtrl.switchTab(stage.targetTab);
          window.appCtrl.showToast(`Bắt đầu ${stage.title}! 🚀`);
        }
      });

      container.appendChild(card);
    });
  }

  renderCanDoChecklist() {
    const container = document.getElementById("cando-checklist-container");
    if (!container) return;

    const checkedState = (window.progressCtrl && window.progressCtrl.data.canDoChecklist) || {};

    container.innerHTML = "";
    this.canDoItems.forEach(item => {
      const isChecked = !!checkedState[item.id];
      const row = document.createElement("div");
      row.className = `p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
        isChecked 
          ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20" 
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-3">
          <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none">
          <span class="text-xs sm:text-sm font-medium ${isChecked ? 'text-emerald-900 dark:text-emerald-100 line-through opacity-80' : 'text-gray-800 dark:text-gray-200'}">
            ${item.text}
          </span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
          item.level === 'A1' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
          item.level === 'A2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
        }">${item.level}</span>
      `;

      row.addEventListener("click", () => {
        if (window.progressCtrl) {
          window.progressCtrl.toggleCanDo(item.id);
          this.renderCanDoChecklist();
        }
      });

      container.appendChild(row);
    });
  }
}

window.roadmapCtrl = new RoadmapController();
