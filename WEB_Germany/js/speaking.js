// WEB_Germany Speaking Studio (7-Step Pedagogical Speaking & Self-Evaluation Lab)

class SpeakingController {
  constructor() {
    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlobUrl = null;
    this.isRecording = false;

    this.topics = [
      {
        id: "sp_topic_01",
        level: "A1",
        title: "Sich vorstellen (Tự giới thiệu bản thân)",
        meaning_vi: "Nói về bản thân: Tên, tuổi, nơi ở, quê quán, nghề nghiệp và sở thích.",
        modelText: "Hallo! Ich heiße Nam. Ich bin 22 Jahre alt und komme aus Vietnam. Jetzt wohne ich in Berlin. Ich bin Student und lerne Deutsch. In meiner Freizeit spiele ich gern Fußball và nghe nhạc.",
        phonetic_hint: "ha-lô, ích hai-sờ Nam. ích bin 22 ya-rờ alt un kôm-mờ ao-s Việt Nam...",
        outline: [
          "1. Tên (Name): Ich heiße... / Mein Name ist...",
          "2. Tuổi (Alter): Ich bin ... Jahre alt.",
          "3. Quê quán (Herkunft): Ich komme aus Vietnam.",
          "4. Nơi ở hiện tại (Wohnort): Ich wohne in...",
          "5. Nghề nghiệp / Học tập (Beruf/Studium): Ich bin Student / Ich arbeite als...",
          "6. Sở thích (Hobby): In meiner Freizeit spiele ich gern..."
        ],
        phrases: [
          "• Ich heiße [Tên] und ich komme aus Vietnam.",
          "• Ich wohne jetzt in [Thành phố].",
          "• Ich bin [Tuổi] Jahre alt.",
          "• Mein Hobby ist [Sở thích] / Ich lese gern Bücher."
        ]
      },
      {
        id: "sp_topic_02",
        level: "A1",
        title: "Meine Familie (Giới thiệu gia đình)",
        meaning_vi: "Nói về các thành viên trong gia đình: Bố mẹ, anh chị em và nghề nghiệp.",
        modelText: "Meine Familie ist nicht groß. Das sind meine Eltern und mein Bruder. Mein Vater ist Ingenieur und meine Mutter ist Lehrerin. Wir wohnen zusammen in Hanoi.",
        phonetic_hint: "mai-nờ pha-mi-li-ờ ist ních groos...",
        outline: [
          "1. Quy mô gia đình: Meine Familie ist groß / klein.",
          "2. Thành viên: Ich habe einen Bruder / eine Schwester.",
          "3. Nghề nghiệp của bố mẹ: Mein Vater ist... / Meine Mutter ist...",
          "4. Nơi sinh sống của gia đình: Wir wohnen in..."
        ],
        phrases: [
          "• Meine Familie hat vier Personen.",
          "• Mein Vater arbeitet als [Nghề nghiệp].",
          "• Meine Schwester ist noch Schülerin.",
          "• Wir verstehen uns sehr gut."
        ]
      },
      {
        id: "sp_topic_03",
        level: "A1",
        title: "Mein Tagesablauf (Một ngày của tôi)",
        meaning_vi: "Kể về các hoạt động hàng ngày từ sáng thức dậy đến tối đi ngủ.",
        modelText: "Jeden Tag stehe ich um 6 Uhr auf. Zuerst frühstücke ich und trinke Kaffee. Um 8 Uhr gehe ich zur Sprachschule. Am Abend koche ich das Abendessen und gehe um 23 Uhr schlafen.",
        phonetic_hint: "yê-dừn tác ste-hờ ích um zếch u-a ao-ph...",
        outline: [
          "1. Giờ thức dậy: Jeden Morgen stehe ich um ... Uhr auf.",
          "2. Bữa sáng & Đi học/làm: Ich frühstücke und fahre zur Arbeit/Schule.",
          "3. Buổi chiều & Tối: Am Nachmittag lerne ich Deutsch, am Abend koche ich.",
          "4. Giờ đi ngủ: Ich gehe um ... Uhr schlafen."
        ],
        phrases: [
          "• Um [Giờ] Uhr stehe ich auf.",
          "• Von [Giờ] bis [Giờ] bin ich in der Schule.",
          "• Am Nachmittag treffe ich meine Freunde.",
          "• Um [Giờ] Uhr gehe ich ins Bett."
        ]
      },
      {
        id: "sp_topic_04",
        level: "A1",
        title: "Im Supermarkt einkaufen (Mua sắm ở siêu thị)",
        meaning_vi: "Hỏi giá, số lượng và thanh toán tiền tại quầy thu ngân.",
        modelText: "Guten Tag! Ich möchte ein Kilo Äpfel und zwei Flaschen Milch kaufen. Wie viel kostet das zusammen? Kann ich bitte mit Karte bezahlen?",
        phonetic_hint: "gu-từn tác! ích mớch-tờ ain ki-lô ép-phừn...",
        outline: [
          "1. Chào hỏi & Nêu món cần mua: Guten Tag! Ich brauche / Ich möchte...",
          "2. Hỏi giá: Wie viel kostet das? / Was kostet ein Kilo Äpfel?",
          "3. Hình thức thanh toán: Kann ich mit Karte / bar bezahlen?"
        ],
        phrases: [
          "• Ich möchte bitte [Món hàng] kaufen.",
          "• Haben Sie frisches Brot?",
          "• Wie viel macht das zusammen?",
          "• Hier sind zwanzig Euro. Stimmt so!"
        ]
      },
      {
        id: "sp_topic_05",
        level: "A1",
        title: "Im Restaurant bestellen (Gọi món ở nhà hàng)",
        meaning_vi: "Chào bồi bàn, xem thực đơn, gọi đồ ăn uống và xin thanh toán.",
        modelText: "Guten Abend! Bringen Sie mir bitte die Speisekarte. Ich nehme ein Schnitzel mit Pommes und ein Mineralwasser ohne Kohlensäure. Die Rechnung bitte!",
        phonetic_hint: "gu-từn a-bừn! bring-ừn di mi-a bít-tờ đi spai-sờ-khác-tờ...",
        outline: [
          "1. Yêu cầu thực đơn: Die Speisekarte bitte!",
          "2. Gọi đồ ăn & thức uống: Ich nehme / Ich hätte gern...",
          "3. Khen ngợi món ăn: Das Essen schmeckt sehr lecker.",
          "4. Xin tính tiền: Wir möchten bitte zahlen / Die Rechnung bitte."
        ],
        phrases: [
          "• Für mich bitte ein Glas Orangensaft.",
          "• Ich hätte gern das Tagesgericht.",
          "• Entschuldigung, wir möchten bitte bezahlen.",
          "• Zusammen oder getrennt?"
        ]
      },
      {
        id: "sp_topic_06",
        level: "A1",
        title: "Nach dem Weg fragen (Hỏi đường ở thành phố)",
        meaning_vi: "Hỏi đường đến nhà ga, bến xe hoặc điểm du lịch và chỉ phương hướng.",
        modelText: "Entschuldigung! Können Sie mir helfen? Wo ist der Hauptbahnhof? - Gehen Sie geradeaus und dann die erste Straße links. Der Bahnhof liegt auf der rechten Seite.",
        phonetic_hint: "en-th-shun-đi-gung! khoen-nừn di mi-a hép-phừn?...",
        outline: [
          "1. Xin lỗi làm phiền: Entschuldigung, wo ist... / Wie komme ich zu...?",
          "2. Chỉ hướng: Gehen Sie geradeaus / Biegen Sie links/rechts ab.",
          "3. Vị trí đích đến: Das Museum liegt auf der rechten/linken Seite."
        ],
        phrases: [
          "• Ist es weit von hier? - Nein, nur 5 Minuten zu Fuß.",
          "• Nehmen Sie die U-Bahn Linie 2.",
          "• Vielen Dank für Ihre Hilfe!"
        ]
      },
      {
        id: "sp_topic_07",
        level: "A1",
        title: "Einen Termin vereinbaren (Hẹn lịch tại phòng khám)",
        meaning_vi: "Gọi điện đặt lịch hẹn với bác sĩ hoặc cơ quan hành chính.",
        modelText: "Guten Tag! Mein Name ist Nguyen. Ich brauche einen Termin beim Arzt. Passt es Ihnen am nächsten Montag um 10 Uhr? Vielen Dank!",
        phonetic_hint: "gu-từn tác! main na-mờ ist Ngu-yên...",
        outline: [
          "1. Giới thiệu tên & Mục đích: Mein Name ist... Ich möchte einen Termin vereinbaren.",
          "2. Đề xuất ngày giờ: Haben Sie am Dienstag Zeit? / Geht es am Montag um 10 Uhr?",
          "3. Xác nhận lịch: Ja, das passt mir gut. Vielen Dank!"
        ],
        phrases: [
          "• Ich brauche dringend einen Termin.",
          "• Geht es vielleicht am Nachmittag?",
          "• Ich notiere mir den Termin. Auf Wiederhören!"
        ]
      }
    ];

    this.currentIndex = 0;
    this.initSpeechRecognition();
    this.initElements();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "de-DE";
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.updateMicUI(true);
      };

      this.recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        const liveTranscriptEl = document.getElementById("speaking-live-transcript");
        if (liveTranscriptEl) liveTranscriptEl.textContent = `"${result}"`;
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        this.isRecording = false;
        this.updateMicUI(false);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicUI(false);
      };
    }
  }

  initElements() {
    const selector = document.getElementById("speaking-topic-select");
    const micBtn = document.getElementById("btn-mic-record");
    const sampleSpeaker = document.getElementById("btn-speaking-sample");
    const nextBtn = document.getElementById("btn-speaking-next");
    const completeBtn = document.getElementById("btn-speaking-complete");

    if (selector) {
      selector.innerHTML = "";
      this.topics.forEach((top, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `${top.level} • ${top.title}`;
        selector.appendChild(opt);
      });

      selector.addEventListener("change", (e) => {
        this.currentIndex = parseInt(e.target.value) || 0;
        this.loadTopic(this.currentIndex);
      });
    }

    if (micBtn) {
      micBtn.addEventListener("click", () => this.toggleRecording());
    }

    if (sampleSpeaker) {
      sampleSpeaker.addEventListener("click", () => {
        const cur = this.topics[this.currentIndex];
        if (cur && window.speechCtrl) {
          window.speechCtrl.speak(cur.modelText, 0.85);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextTopic());
    }

    if (completeBtn) {
      completeBtn.addEventListener("click", () => this.handleCompleteSpeaking());
    }

    this.loadTopic(0);
  }

  loadTopic(index) {
    if (index >= this.topics.length) this.currentIndex = 0;
    else this.currentIndex = index;

    const cur = this.topics[this.currentIndex];
    if (!cur) return;

    const titleEl = document.getElementById("speaking-topic-title");
    const meaningEl = document.getElementById("speaking-meaning");
    const levelBadge = document.getElementById("speaking-level-badge");
    const outlineContainer = document.getElementById("speaking-outline-items");
    const phrasesContainer = document.getElementById("speaking-useful-phrases");
    const transcriptEl = document.getElementById("speaking-live-transcript");
    const playbackContainer = document.getElementById("speaking-playback-container");
    const selector = document.getElementById("speaking-topic-select");

    if (selector) selector.value = this.currentIndex;
    if (titleEl) titleEl.textContent = cur.title;
    if (meaningEl) meaningEl.textContent = cur.meaning_vi;
    if (levelBadge) levelBadge.textContent = `${cur.level} Thực tế`;
    if (transcriptEl) transcriptEl.textContent = "Nhấn nút micro bên trên và bắt đầu nói...";
    if (playbackContainer) playbackContainer.classList.add("hidden");

    // Uncheck self-check checkboxes
    ["check_sp_01", "check_sp_02", "check_sp_03", "check_sp_04"].forEach(id => {
      const cb = document.getElementById(id);
      if (cb) cb.checked = false;
    });

    if (outlineContainer) {
      outlineContainer.innerHTML = cur.outline.map(item => `<div>• ${item}</div>`).join("");
    }

    if (phrasesContainer) {
      phrasesContainer.innerHTML = cur.phrases.map(p => `<div>${p}</div>`).join("");
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    this.audioChunks = [];
    const transcriptEl = document.getElementById("speaking-live-transcript");
    const playbackContainer = document.getElementById("speaking-playback-container");
    if (playbackContainer) playbackContainer.classList.add("hidden");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        if (this.audioBlobUrl) URL.revokeObjectURL(this.audioBlobUrl);
        this.audioBlobUrl = URL.createObjectURL(audioBlob);

        const audioElement = document.getElementById("speaking-playback-audio");
        if (audioElement) {
          audioElement.src = this.audioBlobUrl;
          if (playbackContainer) playbackContainer.classList.remove("hidden");
        }
        stream.getTracks().forEach(t => t.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.updateMicUI(true);

      if (this.recognition) {
        try { this.recognition.start(); } catch (e) {}
      }

      if (transcriptEl) transcriptEl.textContent = "🔴 Đang lắng nghe giọng bạn... Hãy nói to và rõ ràng!";
    } catch (err) {
      console.warn("MediaRecorder mic access error:", err);
      // Fallback: Web Speech only
      if (this.recognition) {
        try {
          this.recognition.start();
          this.isRecording = true;
          this.updateMicUI(true);
        } catch (e) {}
      } else {
        alert("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập Micro trên trình duyệt!");
      }
    }
  }

  stopRecording() {
    this.isRecording = false;
    this.updateMicUI(false);

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }

    if (window.appCtrl) {
      window.appCtrl.showToast("Đã thu âm xong! Hãy nghe lại giọng mình và tự đánh giá qua checklist.");
    }
  }

  updateMicUI(isRec) {
    const micBtn = document.getElementById("btn-mic-record");
    const micStatus = document.getElementById("mic-status-text");

    if (micBtn) {
      if (isRec) {
        micBtn.className = "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-600 text-white flex items-center justify-center text-3xl shadow-xl animate-pulse cursor-pointer";
        if (micStatus) micStatus.textContent = "🔴 Đang thu âm... Nhấn lại để Dừng!";
      } else {
        micBtn.className = "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer";
        if (micStatus) micStatus.textContent = "Nhấn micro để bắt đầu thu âm";
      }
    }
  }

  handleCompleteSpeaking() {
    const cur = this.topics[this.currentIndex];
    const checks = ["check_sp_01", "check_sp_02", "check_sp_03", "check_sp_04"].map(id => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    });

    const checkedCount = checks.filter(Boolean).length;
    if (checkedCount < 2) {
      alert("Hãy kiểm tra lại bài nói và tích chọn ít nhất 2 tiêu chí tự đánh giá hoàn thành!");
      return;
    }

    if (window.progressCtrl) {
      window.progressCtrl.recordActivity("speaking", true, "speaking", "LO_PRAE_01");
      window.progressCtrl.updateSkillProgress("speaking", true);
    }

    if (window.speechCtrl) window.speechCtrl.playCorrectSound();
    if (window.appCtrl) {
      window.appCtrl.showToast(`🎉 Tuyệt vời! Đã hoàn thành bài luyện nói "${cur.title}" (${checkedCount}/4 tiêu chí đạt chuẩn)`);
    }
  }

  nextTopic() {
    this.currentIndex = (this.currentIndex + 1) % this.topics.length;
    this.loadTopic(this.currentIndex);
  }
}

window.speakingCtrl = new SpeakingController();
