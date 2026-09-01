# 🇩🇪 GERMANY_A1-B1: Tài Liệu & Ứng Dụng Học Tiếng Đức A1 - B1

Dự án tổng hợp trọn bộ tài liệu học tiếng Đức từ trình độ A1 đến B1 theo tiêu chuẩn Goethe-Institut / Telc và ứng dụng web học tiếng Đức tương tác **DeutschMaster (`WEB_Germany`)**.

---

## 📁 1. Cấu Trúc Thư Mục Tài Liệu (`TIENG_DUC_A1_B1/`)

Hệ thống tài liệu gốc chất lượng cao được phân loại khoa học:

```text
TIENG_DUC_A1_B1/
├── 01_Tu_Vung/
│   ├── A1_Wortliste_Goethe.pdf
│   ├── A2_Wortliste_Goethe.pdf
│   └── B1_Wortliste_Goethe_OSD.pdf
├── 02_Ngu_Phap/
│   ├── A1_B1_Grammatik_Aktiv_Cornelsen.pdf
│   ├── A1_Schubert_Grammatik_Uebungen.pdf
│   ├── A2_Schubert_Grammatik_Uebungen.pdf
│   └── B1_Schubert_Grammatik_Uebungen.pdf
├── 03_Luyen_Nghe_Transcript/
│   ├── A1_Nicos_Weg_Manuskript.txt
│   ├── A2_Nicos_Weg_Manuskript.txt
│   ├── B1_Nicos_Weg_Manuskript.txt
│   └── Nicos_Weg_Full_Transcript_A1_B1.txt
├── 04_De_Thi_Mau/
│   ├── A1_Goethe_Modellsatz.pdf
│   ├── A2_Goethe_Modellsatz.pdf
│   ├── B1_Goethe_Modellsatz.pdf
│   ├── A1_Telc_Uebungstest.pdf & Audio.mp3
│   ├── A2_Telc_Uebungstest.pdf & Audio.mp3
│   └── B1_Telc_Uebungstest.pdf & Audio.mp3
├── 05_Giao_Trinh_Tham_Khao/
│   ├── A1_Netzwerk_Neu_Kursbuch.pdf
│   ├── A2_Netzwerk_Neu_Kursbuch.pdf
│   ├── B1_Netzwerk_Kursbuch.pdf
│   ├── A1_Menschen_Kursbuch.pdf
│   ├── A2_Menschen_Kursbuch.pdf
│   └── B1_Menschen_Kursbuch.pdf
└── download_manifest.json
```

---

## 🌐 2. Ứng Dụng Web Học Tiếng Đức (`WEB_Germany/`)

Ứng dụng web Single Page Application (SPA) hiện đại, tối ưu di động (Mobile-First), chạy hoàn toàn offline trên trình duyệt:

### ✨ Tính Năng Chính:
- **🗂️ Thẻ nhớ Flashcard 3D:** Hiệu ứng lật 3D, mã màu theo quán từ (`der` xanh, `die` đỏ hồng, `das` xanh lá), phát âm chuẩn `de-DE` với Web Speech API.
- **✍️ Luyện tập Đa Chế Độ (Quiz):**
  - Trắc nghiệm 4 đáp án (Đức - Việt).
  - Der / Die / Das Sprint (phản xạ quán từ nhanh với hiệu ứng âm thanh).
  - Chính tả (Spelling) có bàn phím ảo hỗ trợ ký tự đặc biệt `ä`, `ö`, `ü`, `ß`.
- **📖 Nicos Weg (228 Bài):** Trọn bộ kịch bản Deutsche Welle A1, A2, B1 với tính năng phát âm từng câu thoại.
- **📊 Ngữ Pháp & Động Từ Bất Quy Tắc:** Bảng ma trận 4 Kasus (Nom/Akk/Dat/Gen), giới từ và tra cứu động từ 3 thì.
- **⏱️ Phòng Thi Thử (Mock Exam):** Đề thi mẫu Goethe/Telc có đồng hồ đếm ngược, tự động chấm điểm và chữa bài.
- **🔥 Tiện ích:** Theo dõi Streak học tập, Dark / Light Mode, lưu trữ LocalStorage.

---

## 🚀 Hướng Dẫn Chạy Web Trực Tiếp

1. Mở trực tiếp file `WEB_Germany/index.html` trên trình duyệt.
2. Hoặc sử dụng Live Server / GitHub Pages / Vercel để triển khai online.
