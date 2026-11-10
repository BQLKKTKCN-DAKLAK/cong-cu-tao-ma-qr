# HƯỚNG DẪN CẬP NHẬT V1.2.2 → V1.3.0

Phiên bản mới bổ sung **hai chế độ Nền sáng / Nền tối** mà không thay thế hay xóa bất kỳ chức năng tạo QR nào đã có trong V1.2.2.

## Bước 1. Sao lưu

Tại repository GitHub đang chạy V1.2.2, sao lưu code (ví dụ tạo tag hoặc tải ZIP repository) để có thể quay lại nếu cần.

## Bước 2. Cập nhật GitHub

Tải gói **`cong-cu-tao-ma-qr-v1.3.0-patch.zip`** và giải nén. Tải **nội dung bên trong** bản vá lên gốc repository hiện tại (nơi đã có `index.html` và `package.json`), ghi đè các đường dẫn trùng nhau.

Các tệp chính thay đổi: `index.html`, `src/styles.css`, `src/app.js`, `package.json`. Bản vá còn có README, changelog, hướng dẫn và file kiểm thử mới. **Không xóa** các thư mục `assets`, `vendor`, `src/qr-renderer.js` và các tệp đã có khác.

Commit lên nhánh Cloudflare Pages đang theo dõi, thông thường là `main`.

## Bước 3. Cloudflare Pages

Nếu Cloudflare đang tự triển khai từ GitHub, chờ trạng thái deployment báo **Success**, sau đó mở lại website. Nếu chưa thấy giao diện mới, nhấn `Ctrl + F5` (hoặc thử cửa sổ ẩn danh) để tránh CSS cũ trong bộ nhớ đệm.

Không cần tạo dự án Cloudflare mới, không thêm biến môi trường, không thêm database.

## Bước 4. Kiểm thử nhanh trên website

1. Khi mới mở (chưa có tùy chọn được lưu trước đó) sẽ thấy **Nền sáng** với nền trắng và không họa tiết.
2. Nhấn **Nền tối**: nền xanh navy, viền sáng xanh, tên cơ quan trắng, tên công cụ vàng ánh kim. Nhấn **Nền sáng** để trở lại.
3. Dán URL thử, kiểm tra xem trước QR và xuất PNG. Dù nền ứng dụng tối hay sáng, điểm QR **vẫn đen theo mặc định** và nền tệp xuất **vẫn trong suốt**.
4. Chuyển qua 3 tab Hình dạng/Màu sắc/Logo, tải logo PNG nếu cần và kiểm tra các điều khiển còn hoạt động.
5. Mở trên điện thoại, kiểm tra nút chuyển nền và thao tác xuất file.

**Lưu ý:** Tùy chọn Nền sáng/Nền tối được ghi nhớ trên trình duyệt hiện tại. Nếu cần trở về mặc định, chọn **Nền sáng** một lần. Không có dữ liệu QR, URL hay logo nào được ghi vào bộ nhớ này.
