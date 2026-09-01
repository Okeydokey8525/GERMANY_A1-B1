// WEB_Germany Speaking Practice Module using Web Speech Recognition API

class SpeakingController {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.prompts = [
      {
        id: "sp_01",
        level: "A1",
        targetText: "Hallo, ich heiße Nico.",
        meaning_vi: "Xin chào, tôi tên là Nico.",
        phonetic_hint: "ha-lô, ích hai-sờ Ni-cô",
        focus: "Phát âm âm 'ch' trong 'ich' và nguyên âm mở 'Hallo'"
      },
      {
        id: "sp_02",
        level: "A1",
        targetText: "Wie geht es dir?",
        meaning_vi: "Bạn có khỏe không?",
        phonetic_hint: "vi gết ét-s đi-a",
        focus: "Lên giọng nhẹ ở cuối câu hỏi"
      },
      {
        id: "sp_03",
        level: "A1",
        targetText: "Ich komme aus Vietnam.",
        meaning_vi: "Tôi đến từ Việt Nam.",
        phonetic_hint: "ích kôm-mờ ao-s Việt Nam",
        focus: "Phát âm chuẩn giới từ 'aus' và động từ 'komme'"
      },
      {
        id: "sp_04",
        level: "A1",
        targetText: "Ich möchte bitte einen Kaffee trinken.",
        meaning_vi: "Làm ơn cho tôi uống một ly cà phê.",
        phonetic_hint: "ích mớch-tờ bít-tờ ai-nừn kha-phê th-ring-kừn",
        focus: "Nguyên âm biến âm 'ö' trong 'möchte' và mạo từ Akkusativ 'einen'"
      },
      {
        id: "sp_05",
        level: "A1",
        targetText: "Entschuldigung, wo ist der Bahnhof?",
        meaning_vi: "Xin lỗi cho hỏi, nhà ga xe lửa ở đâu ạ?",
        phonetic_hint: "en-th-shun-đi-gung, vô ist đe-a ban-hôp",
        focus: "Tổ hợp phụ âm 'tsch' và nguyên âm dài 'Bahnhof'"
      },
      {
        id: "sp_06",
        level: "A2",
        targetText: "Könnten Sie mir bitte helfen?",
        meaning_vi: "Ngài có thể làm ơn giúp tôi được không?",
        phonetic_hint: "khoen-từn di mi-a bít-tờ hép-phừn",
        focus: "Thể lịch sự Konjunktiv II với 'Könnten'"
      },
      {
        id: "sp_07",
        level: "B1",
        targetText: "Meiner Meinung nach ist das Lernen einer Fremdsprache sehr nützlich.",
        meaning_vi: "Theo quan điểm của tôi, việc học một ngoại ngữ là rất hữu ích.",
        phonetic_hint: "mai-nơ mai-nung nác ist đas le-rơ-nừn ai-nơ phrém-s-pra-khờ de-a núyt-s-lích",
        focus: "Biểu đạt quan điểm B1 và danh từ hóa động từ 'das Lernen'"
      },
      {
        id: "sp_08",
        level: "B1",
        targetText: "Ich habe vor, mich intensiv auf die Prüfung vorzubereiten.",
        meaning_vi: "Tôi có dự định sẽ chuẩn bị thật kỹ lưỡng cho kỳ thi.",
        phonetic_hint: "ích ha-bờ pho, mích in-ten-síp ao-ph đi phrúy-phung pho-tsu-bờ-rai-từn",
        focus: "Cấu trúc 'vorhaben + Infinitiv mit zu' và động từ tách 'vorzubereiten'"
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

        if (event.results[0].isFinal) {
          this.evaluateSpeech(result);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.isRecording = false;
        this.updateMicUI(false);
        if (window.appCtrl) {
          window.appCtrl.showToast("Không nhận diện được giọng nói. Vui lòng nói to và rõ hơn!");
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.updateMicUI(false);
      };
    }
  }

  initElements() {
    const micBtn = document.getElementById("btn-mic-record");
    const sampleSpeaker = document.getElementById("btn-speaking-sample");
    const nextBtn = document.getElementById("btn-speaking-next");

    if (micBtn) {
      micBtn.addEventListener("click", () => this.toggleRecording());
    }
    if (sampleSpeaker) {
      sampleSpeaker.addEventListener("click", () => {
        const cur = this.prompts[this.currentIndex];
        if (cur && window.speechCtrl) {
          window.speechCtrl.speak(cur.targetText, 0.85);
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextPrompt());
    }

    this.loadPrompt(this.currentIndex);
  }

  loadPrompt(index) {
    if (index >= this.prompts.length) {
      this.currentIndex = 0;
    }
    const item = this.prompts[this.currentIndex];

    const targetTextEl = document.getElementById("speaking-target-text");
    const meaningEl = document.getElementById("speaking-meaning");
    const hintEl = document.getElementById("speaking-phonetic-hint");
    const focusEl = document.getElementById("speaking-focus");
    const resultBox = document.getElementById("speaking-result-box");
    const liveTranscriptEl = document.getElementById("speaking-live-transcript");

    if (targetTextEl) targetTextEl.textContent = item.targetText;
    if (meaningEl) meaningEl.textContent = item.meaning_vi;
    if (hintEl) hintEl.textContent = `Gợi ý đọc: /${item.phonetic_hint}/`;
    if (focusEl) focusEl.textContent = item.focus;
    if (resultBox) resultBox.classList.add("hidden");
    if (liveTranscriptEl) liveTranscriptEl.textContent = "Nhấn micro và đọc câu trên...";
  }

  toggleRecording() {
    if (!this.recognition) {
      alert("Trình duyệt hiện tại chưa hỗ trợ Web Speech Recognition. Khuyên dùng Google Chrome hoặc Microsoft Edge để luyện nói!");
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
    } else {
      const liveTranscriptEl = document.getElementById("speaking-live-transcript");
      if (liveTranscriptEl) liveTranscriptEl.textContent = "Đang lắng nghe... Hãy nói to và rõ!";
      try {
        this.recognition.start();
      } catch (e) {
        console.error(e);
      }
    }
  }

  updateMicUI(isRecording) {
    const micBtn = document.getElementById("btn-mic-record");
    const micStatus = document.getElementById("mic-status-text");

    if (micBtn) {
      if (isRecording) {
        micBtn.className = "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-600 text-white flex items-center justify-center text-3xl shadow-xl animate-ping cursor-pointer";
        if (micStatus) micStatus.textContent = "🔴 Đang thu âm... Nói ngay!";
      } else {
        micBtn.className = "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer";
        if (micStatus) micStatus.textContent = "Nhấn để bắt đầu nói";
      }
    }
  }

  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');

    if (s1 === s2) return 100;
    if (!s1 || !s2) return 0;

    let matches = 0;
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    words1.forEach(w => {
      if (words2.includes(w)) matches++;
    });

    const wordScore = (matches / Math.max(words1.length, words2.length)) * 100;
    return Math.round(wordScore);
  }

  evaluateSpeech(userSpeech) {
    const item = this.prompts[this.currentIndex];
    const score = this.calculateSimilarity(userSpeech, item.targetText);

    const resultBox = document.getElementById("speaking-result-box");
    const scoreVal = document.getElementById("speaking-score-val");
    const scoreFeedback = document.getElementById("speaking-score-feedback");
    const userSpokeText = document.getElementById("speaking-user-spoke");

    if (!resultBox) return;
    resultBox.classList.remove("hidden");

    if (userSpokeText) userSpokeText.textContent = `"${userSpeech}"`;
    if (scoreVal) scoreVal.textContent = `${score}%`;

    if (score >= 80) {
      resultBox.className = "p-5 rounded-3xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-sm space-y-2";
      if (scoreFeedback) scoreFeedback.innerHTML = `<span class="font-extrabold text-emerald-600 dark:text-emerald-400">Xuất sắc! 🎉 Phát âm rất chuẩn xác và tự nhiên.</span>`;
      if (window.speechCtrl) window.speechCtrl.playCorrectSound();
      if (window.progressCtrl) window.progressCtrl.recordActivity("speaking", 1);
    } else if (score >= 50) {
      resultBox.className = "p-5 rounded-3xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-sm space-y-2";
      if (scoreFeedback) scoreFeedback.innerHTML = `<span class="font-extrabold text-amber-600 dark:text-amber-400">Khá tốt! 👍 Cần chú ý thêm ngữ điệu và phát âm rõ từng từ.</span>`;
      if (window.speechCtrl) window.speechCtrl.playComboSound(1);
    } else {
      resultBox.className = "p-5 rounded-3xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 shadow-sm space-y-2";
      if (scoreFeedback) scoreFeedback.innerHTML = `<span class="font-extrabold text-rose-600 dark:text-rose-400">Cố lên! 💪 Hãy nghe lại câu mẫu rồi thử thu âm lại nhé.</span>`;
      if (window.speechCtrl) window.speechCtrl.playWrongSound();
    }
  }

  nextPrompt() {
    this.currentIndex = (this.currentIndex + 1) % this.prompts.length;
    this.loadPrompt(this.currentIndex);
  }
}

window.speakingCtrl = new SpeakingController();
