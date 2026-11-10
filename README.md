# CÔNG CỤ TẠO MÃ QR — V1.3.0

**Đơn vị:** Văn phòng Ban Quản lý các khu kinh tế và các khu công nghiệp Đắk Lắk.

Ứng dụng web tĩnh (HTML/CSS/JavaScript) dành cho nội bộ cơ quan, không yêu cầu đăng nhập, cơ sở dữ liệu hay dịch vụ xử lý QR ở phía máy chủ. QR chứa **đường link HTTP(S)**, không chứa trực tiếp nội dung tệp PDF/ảnh. Tệp gốc phải được lưu trữ tại địa chỉ có thể truy cập theo quyền được cấp.

## Thay đổi V1.3.0: chế độ Nền sáng / Nền tối

- **Nền sáng:** trang nền trắng tinh `#FFFFFF`, không còn hoa văn, sóng hoặc chi tiết trang trí ở phần nền; giữ bố cục, các thẻ điều khiển xanh nhạt dễ đọc, tên cơ quan xanh, tên phần mềm đỏ.
- **Nền tối:** nền xanh navy công nghệ với các đường lưới mờ và dải sáng xanh, thẻ URL/tab màu xanh đậm, viền xanh điện, tên cơ quan **trắng**, tên phần mềm **vàng gold ánh kim** với CSS gradient. Bảng tùy chỉnh và khu vực xem trước vẫn có nền sáng để các công cụ dễ đọc, QR dễ kiểm tra.
- Thanh chọn hiển thị **Nền sáng / Nền tối** đặt phía trên tiêu đề, dùng được trên máy tính và điện thoại.
- Ghi nhớ riêng **chế độ đã chọn** trong `localStorage` của trình duyệt nếu trình duyệt cho phép. Không lưu đường link, logo hoặc lịch sử tạo QR.
- **Việc đổi giao diện không đổi màu điểm QR, màu nền PNG/SVG hoặc dữ liệu mã QR.** QR tiếp tục có màu điểm mặc định **đen** và nền xuất **trong suốt** bất kể nền ứng dụng.
- Toàn bộ các chức năng của V1.2.2 được giữ nguyên.

## Các chức năng hiện có

- Dán URL của website, PDF, hình ảnh, Google Drive; kiểm tra URL đầu vào.
- **Hình dạng**: kiểu điểm, mắt ngoài/mắt trong, góc bo, mức sửa lỗi L/M/Q/H; khi có logo cho chọn M/Q/H, giới hạn kích thước logo tương ứng; 3 kiểu mật độ hiển thị Thưa/Trung bình/Cao.
- **Màu sắc**: màu điểm, màu nền, nhập mã HEX, nền xuất mặc định trong suốt.
- **Logo**: tải/kéo thả PNG nền trong suốt, điều chỉnh tỷ lệ, nền logo, góc bo, 3 mức vùng trống bảo vệ logo (Không viền/Vừa/Rộng).
- Xem trước tức thời, chọn lề xuất 2 hoặc 4 mô-đun, chọn 512/1024/2048 px, xuất PNG/SVG, sao chép PNG (khi trình duyệt cho phép).
- Chạy responsive trên máy tính và điện thoại, không có chức năng đăng nhập, không gửi logo lên dịch vụ ngoài.

## Thư mục chính

```text
index.html                      Cấu trúc giao diện + hai nút chuyển nền
src/styles.css                  CSS nền sáng/tối, bố cục responsive
src/app.js                      Tương tác giao diện, QR, ghi nhớ chế độ nền
src/qr-renderer.js              Xuất SVG từ ma trận QR chuẩn
assets/icons/                   Ảnh icon PNG trong mã nguồn
vendor/                         Vị trí đặt qrcode.min.js nếu muốn chạy ngoại tuyến
scripts/build.mjs               Build website tĩnh ra dist/
tests/                          Test QR và chế độ nền
HUONG_DAN_CAP_NHAT_V1.3.md     Cách cập nhật repository V1.2.2
HUONG_DAN_TRIEN_KHAI.md        Cách triển khai chung
```

## Kiểm tra và build

Yêu cầu Node.js 18+ khi build. Không cần `npm install` vì dự án không có phụ thuộc NPM.

```bash
npm run check
npm test
npm run build
```

Mã nguồn sau build được sao chép tới `dist/`. Chạy thử với `npm run dev` rồi mở `http://localhost:8080` (không mở trực tiếp bằng `file://` vì hạn chế module JavaScript).

Thư viện `qrcode-generator` 1.4.4 mặc định được tìm ở `vendor/qrcode.min.js` và tải dự phòng qua CDN nếu file nội bộ chưa có. CDN cần kết nối Internet; nếu cần hoạt động ngoại tuyến, đặt bản phân phối hợp lệ của thư viện đó tại đường dẫn `vendor/qrcode.min.js`. Xem `LICENSE-THIRD-PARTY.md`.

## Cloudflare Pages

Dùng cùng repository hiện tại, không cần tạo Cloudflare mới. Cấu hình:

- Framework: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: mặc định (nếu `package.json` ở gốc repo)

**Xem:** `HUONG_DAN_CAP_NHAT_V1.3.md`. Không cần tài khoản/máy chủ/cơ sở dữ liệu bổ sung. Nếu địa chỉ web công khai, người khác có URL vẫn mở được công cụ; tài liệu đích vẫn chịu quyền truy cập của nơi lưu trữ.

## Kiểm thử

- `npm test` — bộ test Node.js; `python tests/browser_theme.py` — thử 2 giao diện Chromium (có Playwright, qrcode, Pillow).
- Kiểm thử giao diện trên Chromium bằng ma trận QR thử nghiệm cung cấp sẵn từ Python để tách phần phụ thuộc CDN. Cần tiếp tục thử quét thực tế sau khi deploy Cloudflare.
- Mã QR in ấn nên sử dụng lề chuẩn 4 ô, nền sáng tương phản và quét thử bằng nhiều thiết bị, đặc biệt nếu chèn logo.

**Chân trang:** Công cụ tạo mã QR • Bản quyền thuộc Văn phòng Ban Quản lý các khu kinh tế và các khu công nghiệp Đắk Lắk.
