# HƯỚNG DẪN NÂNG CẤP V1.1 → V1.2 TRÊN GITHUB/CLOUDFLARE PAGES

## 1. Những gì giữ nguyên

- Không phải tạo repository mới, không thay tài khoản GitHub, không tạo dự án Cloudflare Pages khác.
- Không cần cơ sở dữ liệu, đăng nhập, máy chủ hay API để xử lý PDF/hình ảnh.
- Cơ chế nhập URL, quét QR, logo PNG, hình dạng, màu sắc, SVG/PNG vẫn giữ theo kiến trúc đã sử dụng ở V1.1.

## 2. Cách cập nhật đơn giản

1. Sao lưu nguồn V1.1 hiện tại hoặc tạo nhánh dự phòng trên GitHub.
2. Tải bản **V1.2 PATCH** và giải nén. Bản PATCH chứa các tệp mới/thay đổi. Không tải trực tiếp ZIP lên repository.
3. Trong GitHub (hoặc Git trên máy tính), **ghi đè đúng đường dẫn** các tệp của patch vào repository hiện tại, đặc biệt:
   - `index.html`
   - `src/styles.css`
   - `src/app.js`
   - `src/qr-renderer.js`
   - `assets/icons/*.png`
   - `package.json`
   - `README.md`, tài liệu và ảnh hướng dẫn (nếu muốn cập nhật cùng)
4. **Xóa tệp `src/updates-v1.1.css` khỏi repository** (V1.2 dùng một stylesheet `src/styles.css`; index mới không còn tham chiếu stylesheet V1.1). Có thể giữ tệp này không gây hỏng nhưng nên dọn sạch.
5. Commit lên nhánh Cloudflare đang triển khai (thường là `main`).
6. Cloudflare Pages build bằng `npm run build` và lấy thư mục `dist`. Chờ trạng thái triển khai thành công, truy cập URL hiện hữu, nhấn **Ctrl + F5**.
7. Kiểm tra giao diện, hình QR, logo và xuất PNG/SVG bằng điện thoại.

## 3. Thay đổi giao diện V1.2

- Nền sáng xanh nhạt thay cho nền xanh navy tối.
- Tên cơ quan xanh dương rõ dấu; đường kẻ ngang phía dưới.
- Tiêu đề lớn màu đỏ; icon QR màu xanh.
- Khối nhập URL và khối tùy chỉnh dạng thẻ viền xanh nhạt.
- Tab màu xanh nhạt, tab đang chọn xanh dương tươi.
- Tab Logo chia hai cột: trái tải logo; phải kích thước, khoảng trống viền, nền và bo góc.
- Cột xem trước màu trắng; đầu ra sử dụng danh sách chọn kích thước 512/1024/2048 px và nút chọn PNG/SVG.
- Các icon PNG đồng bộ lưu ngay trong `assets/icons`.
- Chân trang nền xanh, thông tin bản quyền đúng theo yêu cầu.

## 4. Lưu ý về file `dist`

`dist` là **kết quả của build**, không phải mã nguồn để sửa trực tiếp. Nếu repository đã có thư mục `dist` cũ thì Cloudflare vẫn tạo lại bằng `npm run build` từ `index.html`, `src`, `assets`. Không sửa `dist` bằng tay để cập nhật V1.2.

Nếu repository của anh đang dùng Cloudflare Pages **Direct Upload** chứ không kết nối GitHub, có thể dùng bản `dist` trong bộ mã nguồn đầy đủ để tải trực tiếp lên Pages theo giao diện Cloudflare hiện tại.
