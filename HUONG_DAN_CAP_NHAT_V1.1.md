# HƯỚNG DẪN CẬP NHẬT V1.0 → V1.1 (GITHUB + CLOUDFLARE PAGES)

Bản V1.1 sửa giao diện, các icon và xử lý viền logo; **không cần tạo lại GitHub repository hoặc Cloudflare Pages**. Giữ nguyên cấu hình Cloudflare đang chạy V1.0.

## 1. Các tệp cần cập nhật

Chỉnh sửa hoặc thay thế các tệp cũ sau bằng bản mới:

- `index.html` — font/đường kẻ/icon, nền trong suốt, tên bản quyền.
- `src/app.js` — trạng thái nền QR mặc định, tên ba mức viền.
- `src/qr-renderer.js` — xử lý khoảng trống viền logo thực tế.
- `tests/renderer.test.mjs` — kiểm thử logic.
- `tests/browser_smoke.py` — kiểm thử trình duyệt.
- `package.json` — tăng phiên bản.
- `README.md` và các tài liệu hướng dẫn/checklist — ghi nhận thay đổi.

**Bổ sung tệp mới:**

- `src/updates-v1.1.css` — CSS mới để cải thiện hiển thị chữ và icon.
- `assets/icons/url.png`
- `assets/icons/customize.png`
- `assets/icons/shape.png`
- `assets/icons/color.png`
- `assets/icons/logo.png`

Các tệp còn lại của V1.0 có thể giữ nguyên.

## 2. Cập nhật trên GitHub

**Cách khuyến nghị:** giải nén gói đầy đủ V1.1, thay thế nội dung trong thư mục repository trên máy tính, rồi commit bằng GitHub Desktop hoặc Git. Cần giữ nguyên cấu trúc đường dẫn trên.

Nếu dùng GitHub Desktop:

1. Mở repository ứng dụng hiện tại tại máy tính.
2. Sao chép các file trong bản V1.1 vào thư mục repository, chọn ghi đè file tương ứng.
3. Kiểm tra mục **Changes** có `index.html`, `src/updates-v1.1.css` và đủ 5 ảnh PNG.
4. Commit với mô tả `Cap nhat giao dien QR v1.1`.
5. Chọn **Push origin** để đẩy lên nhánh triển khai (`main` nếu đang dùng `main`).

Nếu dùng lệnh Git tại thư mục repository (sau khi đã thay file):

```bash
git add .
git commit -m "Cap nhat giao dien cong cu tao ma QR v1.1"
git push origin main
```

Chỉ dùng lệnh `main` nếu đó là nhánh Cloudflare của anh đang theo dõi. **Không đưa nguyên tệp ZIP lên GitHub thay cho nội dung đã giải nén.**

## 3. Cloudflare Pages

Khi GitHub đã cập nhật, Cloudflare Pages kết nối Git sẽ tự triển khai lại nếu chế độ tự triển khai đang bật. Giữ cấu hình cũ:

- Framework: `None`
- Build command: `npm run build`
- Output directory: `dist`

Kiểm tra trạng thái **Deployments** cho lần commit mới. Nếu chưa thấy bản mới, xem nhánh được theo dõi và trạng thái build. Sau khi thành công, mở website và dùng **Ctrl + F5** để làm mới bộ nhớ đệm nếu vẫn thấy giao diện cũ.

## 4. Kiểm tra sau khi cập nhật

1. Tên cơ quan hiển thị đúng dấu, bên dưới chỉ có đường kẻ.
2. Năm icon PNG hiển thị rõ, không bị biểu tượng ảnh lỗi.
3. Tab Hình dạng/Màu sắc/Logo độc lập, cỡ chữ dễ đọc.
4. Tab Màu sắc: Nền trong suốt đã được tích sẵn.
5. Đưa logo PNG vào, chọn ba mức viền; QR phải thay đổi vùng trống bảo vệ; xuất PNG và quét từng mức.
6. Kiểm tra dòng bản quyền cuối trang.
7. Nền trong suốt là **ảnh không có màu nền**, khi sử dụng cần đặt trên nền sáng để quét tốt.

## 5. Khi cập nhật không thành công

- **Icon không hiện:** kiểm tra chính xác đường dẫn `assets/icons/*.png` trên GitHub và trong bản build `dist/assets/icons/`.
- **Chữ vẫn lỗi:** làm mới Ctrl + F5; kiểm tra `src/updates-v1.1.css` đã được tải và file `index.html` có `<link rel="stylesheet" href="./src/updates-v1.1.css" />`.
- **Mức viền không đổi:** xác nhận `src/qr-renderer.js` là bản V1.1, không chỉ thay CSS hoặc HTML.
- **Ảnh PNG transparent khó quét trên nền tối:** chèn QR lên nền trắng/sáng hoặc chọn nền QR trắng trong tab Màu sắc.

**Lưu ý:** Gói này chỉ là mã nguồn cập nhật, không tự ý đăng nhập hay sửa trực tiếp repository đang vận hành của anh.
