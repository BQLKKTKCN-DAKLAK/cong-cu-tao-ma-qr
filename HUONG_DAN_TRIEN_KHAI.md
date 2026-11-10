# HƯỚNG DẪN TRIỂN KHAI GITHUB → CLOUDFLARE PAGES

## A. Tạo kho mã nguồn trên GitHub

1. Giải nén `cong-cu-tao-ma-qr-v1.0.zip` trên máy tính.
2. Đăng nhập tài khoản GitHub được cơ quan cho phép sử dụng. Tạo **Repository mới**, ví dụ tên `cong-cu-tao-ma-qr`.
3. Nếu sử dụng giao diện web GitHub: vào kho vừa tạo → **Add file** → **Upload files**. Tải lên **nội dung bên trong thư mục `cong-cu-tao-ma-qr`**, không tải chính tệp ZIP và không tạo thêm một thư mục bao ngoài.
4. Kiểm tra ở cấp gốc GitHub có `index.html`, `package.json`, `src`, `assets`, `scripts`, `_headers`.
5. Bấm **Commit changes** vào nhánh `main`.

**Cách khác (Git đã cài trên máy):**

```bash
cd cong-cu-tao-ma-qr
git init
git add .
git commit -m "Khoi tao cong cu tao ma QR v1.0"
git branch -M main
git remote add origin https://github.com/TAI-KHOAN-CUA-ANH/cong-cu-tao-ma-qr.git
git push -u origin main
```

Thay `TAI-KHOAN-CUA-ANH` bằng tên tài khoản/kho GitHub thực tế; đây chỉ là ví dụ, không phải đường link đã tồn tại.

## B. Tạo dự án Cloudflare Pages

1. Đăng nhập Cloudflare → vào **Workers & Pages**.
2. Chọn **Create application** hoặc **Create** → chọn **Pages** → **Connect to Git** (tên mục có thể thay đổi nhẹ theo giao diện Cloudflare).
3. Kết nối GitHub (nếu chưa kết nối), cấp quyền cho đúng repository `cong-cu-tao-ma-qr`.
4. Chọn repository đó → **Begin setup**.
5. Thiết lập:

| Trường | Giá trị nhập |
|---|---|
| Project name | `cong-cu-tao-ma-qr` hoặc tên khác chưa được sử dụng |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | để mặc định (gốc kho) |

6. Nhấn **Save and Deploy**.
7. Sau khi thành công, Cloudflare cấp địa chỉ dạng `https://TEN-DU-AN.pages.dev`. Không phải mua tên miền để sử dụng.

Tài liệu chính thức: https://developers.cloudflare.com/pages/get-started/git-integration/

## C. Kiểm tra bản website trực tuyến

1. Mở đường link `*.pages.dev` mới được cấp.
2. Dán URL thử `https://example.com` → vùng bên phải phải xuất hiện QR.
3. Kiểm tra lần lượt ba tab: `Hình dạng`, `Màu sắc`, `Logo`; nội dung tab khác phải ẩn.
4. Xuất QR PNG → dùng điện thoại quét; URL nhận được phải đúng URL đã nhập.
5. Tải thử một logo PNG của cơ quan, chỉnh kích thước 15%, xuất PNG và SVG; quét lại QR.
6. Thử trên điện thoại và màn hình máy tính, thử tải xuống bằng Chrome hoặc Edge.
7. Kiểm tra bản PDF/ảnh thực tế của cơ quan: quyền chia sẻ của tài liệu phải cho phép đối tượng người quét truy cập.

## D. Khi cần chỉnh sửa về sau

1. Chỉnh file trong repository trên GitHub (ví dụ `src/styles.css` sửa màu, `src/app.js` sửa logic).
2. Commit thay đổi vào `main`.
3. Cloudflare Pages sẽ tự build và cập nhật site nếu đã bật Git integration và auto deploy.

## E. Các lỗi phổ biến

**Không thấy mã QR, có dòng "Không thể tải bộ tạo QR":** trình duyệt không tải được script từ CDN. Kiểm tra Internet hoặc tự bổ sung `vendor/qrcode.min.js` lấy từ liên kết trong README; sau đó commit và đợi Cloudflare triển khai lại.

**Cloudflare báo lỗi build:** bảo đảm `package.json`, `scripts/build.mjs` nằm đúng ở cấp gốc và lệnh build là `npm run build`, output `dist`.

**Mã QR không mở được PDF/ảnh:** kiểm tra lại quyền chia sẻ Google Drive hoặc địa chỉ website; không phải mọi liên kết nội bộ đều có thể mở với người ngoài cơ quan.

**Ảnh PNG tải xuống không có logo:** dùng tệp PNG hợp lệ dưới 2 MB, tải lại và đợi bản xem trước cập nhật; thử Chrome/Edge mới nhất.

**Không sao chép ảnh vào Word:** tính năng sao chép ảnh cần trình duyệt có Clipboard API và ngữ cảnh an toàn (HTTPS). Thay thế bằng tải PNG và chèn tệp vào Word.

**Mã QR khó quét:** dùng điểm hình vuông, độ đầy Cao, sửa lỗi H khi có logo, màu tối/nền sáng, giảm logo xuống 10–15% và giữ vùng trắng xung quanh QR.

**Lưu ý quyền riêng tư:** ứng dụng không yêu cầu tài khoản và công khai cho người có URL; không tải tài liệu mật vào công cụ. Phần CDN của thư viện QR sẽ phát sinh yêu cầu tải script, nhưng nội dung link/logo được xử lý trên thiết bị.
