# HƯỚNG DẪN CẬP NHẬT V1.2.1 → V1.2.2

Bản vá chỉ thay đổi màu điểm QR mặc định và cách xếp các nút sửa lỗi. Không cần tạo lại repository GitHub hoặc dự án Cloudflare Pages.

1. Sao lưu repository GitHub đang chạy V1.2.1 (hoặc đánh dấu phiên bản cũ bằng commit/tag).
2. Giải nén **`cong-cu-tao-ma-qr-v1.2.2-patch.zip`**.
3. Chép các tệp `index.html`, `src/app.js`, `src/styles.css`, `package.json` vào đúng đường dẫn trong repository; ghi đè các tệp tương ứng. Có thể tải thêm `CHANGELOG.md` và tài liệu này.
4. Commit vào nhánh đang kết nối với Cloudflare Pages (thường là `main`); Cloudflare sẽ triển khai tự động.
5. Sau khi triển khai, mở website và nhấn **Ctrl + F5**. Vào tab **Màu sắc** để kiểm tra mặc định `#000000`; vào tab **Hình dạng** để kiểm tra bốn nút mức sửa lỗi nằm trên một hàng.

**Lưu ý:** Những lần mở trang mới có màu QR mặc định là đen. Nếu đang mở website trước cập nhật, hãy tải lại trang để nhận trạng thái mới. Màu nền QR vẫn mặc định trong suốt.
