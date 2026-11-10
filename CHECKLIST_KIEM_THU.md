# CHECKLIST KIỂM THỬ V1.2

## A. Kiểm thử tự động đã thực hiện

- [x] `npm run check`: cú pháp JavaScript hợp lệ.
- [x] `npm test`: 14/14 bài kiểm thử mã nguồn đạt.
- [x] `npm run build`: tạo được `dist/` cho Cloudflare Pages.
- [x] Ảnh icon local tải thành công trong trang thử nghiệm.
- [x] Ba tab chuyển nội dung độc lập.
- [x] Render SVG từ ma trận QR chuẩn được sinh riêng trong bộ kiểm thử.
- [x] Xuất PNG mặc định có nền alpha trong suốt, kích thước 1024 px và OpenCV giải mã đúng URL.
- [x] Đọc logo PNG, hiển thị trong QR, OpenCV giải mã đúng URL.
- [x] Ba mức vùng trống quanh logo là khác nhau, QR với URL thử nghiệm vẫn giải mã đúng ở cả ba mức.
- [x] Xuất SVG có logo PNG nhúng theo data URI và kích thước 512 px khi chọn tương ứng.
- [x] Không tràn ngang ở 320, 390, 640, 800 và 1024 px.
- [x] Không phát sinh lỗi JavaScript trong phiên kiểm thử Chromium.

**Giới hạn:** Môi trường kiểm thử không có kết nối CDN, nên trình duyệt được cung cấp ma trận QR chuẩn thay cho bước tải qrcode-generator từ CDN. V1.2 chưa được kiểm thử trên domain Cloudflare Pages thực tế của đơn vị.

## B. Kiểm tra thủ công sau khi triển khai trên Cloudflare

- [ ] Tên cơ quan đúng dấu; tiêu đề đỏ, nền sáng; footer chính xác.
- [ ] Dán URL có thể quét và mở đúng website/tệp có quyền truy cập.
- [ ] Bấm 3 tab; chỉ tab được chọn hiện điều khiển.
- [ ] Đổi 6 kiểu điểm, các kiểu mắt, màu sắc, mật độ, sửa lỗi.
- [ ] Màu nền QR mặc định trong suốt.
- [ ] Tải thử logo PNG cơ quan, điều chỉnh kích thước/viền/nền.
- [ ] Xuất 512/1024/2048px; PNG và SVG; sao chép trong trình duyệt HTTPS.
- [ ] Quét mã QR với logo trên điện thoại Android/iOS; quét thử khi in thực tế.
- [ ] Kiểm tra giao diện điện thoại không bị tràn ngang; cập nhật cache Ctrl+F5.
