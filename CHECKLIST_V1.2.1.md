# Checklist kiểm thử V1.2.1 (ngày 10/11/2026)

- [x] Kiểm tra cú pháp `npm run check`
- [x] 16/16 bài kiểm thử mã nguồn `npm test`
- [x] Tạo PNG lề gọn 2 mô-đun và lề chuẩn 4 mô-đun; OpenCV giải mã đúng URL thử nghiệm
- [x] PNG nền trong suốt, kích thước 1024×1024
- [x] Khi chưa có logo: đủ L/M/Q/H
- [x] Khi có logo: L bị vô hiệu hóa, M/Q/H chọn được và ma trận tạo theo đúng mức
- [x] Khi tải logo ở mức L: tự chuyển sang M
- [x] Giới hạn logo M ≤ 15%, Q ≤ 18%, H ≤ 22%
- [x] QR có logo M, Q, H ở lề gọn: OpenCV giải mã đúng URL thử nghiệm
- [x] PNG icon `url.png` và `customize.png`: có alpha trong suốt và được tải từ mã nguồn
- [x] SVG xuất đúng lề và chứa logo
- [x] Build `dist` thành công để Cloudflare Pages triển khai

**Giới hạn kiểm thử:** Phần kiểm thử Chromium dùng các ma trận QR hợp lệ sinh bởi Python, không xác minh quá trình tải thư viện QR từ CDN ở website thật. Mức lề gọn 2 mô-đun giảm khoảng trắng nhưng ít hơn khuyến nghị tiêu chuẩn 4 mô-đun; nên chọn lề chuẩn nếu in trên nền nhiều chi tiết hoặc quét không ổn định. Cần tự thử mã với logo, URL dài và thiết bị của cơ quan.
