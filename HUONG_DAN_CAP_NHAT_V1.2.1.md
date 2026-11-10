# Hướng dẫn cập nhật V1.2 → V1.2.1

1. Sao lưu V1.2 đang hoạt động trên GitHub, hoặc tạo nhánh `backup-v1.2`.
2. Giải nén `cong-cu-tao-ma-qr-v1.2.1-patch.zip`, sao chép **nội dung thư mục** vào gốc repository GitHub hiện tại và cho phép ghi đè. Giữ nguyên đường dẫn `src/`, `assets/icons/`, `index.html`.
3. Kiểm tra trên GitHub đã có `src/app.js`, `src/qr-renderer.js`, `src/styles.css`, `assets/icons/url.png`, `assets/icons/customize.png`.
4. Commit lên nhánh đang kết nối Cloudflare Pages (thường là `main`). Đợi trang trạng thái Cloudflare báo **Success**; sau đó tải lại bằng Ctrl+F5.
5. Thử với URL website và URL PDF, xuất PNG, chèn vào Word. Chọn `Lề ảnh mã QR → Gọn – 2 ô` để có viền mỏng. Nếu quét trên nền phức tạp hoặc in ấn, chọn `Chuẩn – 4 ô`.
6. Tải logo PNG, vào tab **Hình dạng**, chọn sửa lỗi **M/Q/H** và thử quét lại trên điện thoại. Với URL dài và logo lớn, ưu tiên Q hoặc H.

Không cần tạo lại Cloudflare Pages hay thay cấu hình build: `npm run build`, Output `dist`.

Nếu các icon vẫn cũ, thử Ctrl+F5, hoặc mở chế độ ẩn danh để tránh cache.
