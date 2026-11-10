# CÔNG CỤ TẠO MÃ QR – PHIÊN BẢN V1.2.2

**Đơn vị:** Văn phòng Ban Quản lý các khu kinh tế và các khu công nghiệp Đắk Lắk  
**Giao diện:** Nền sáng (trắng – xanh nhạt), xanh dương chủ đạo, tiêu đề phần mềm màu đỏ – theo mẫu thiết kế đã được duyệt.  
**Mô hình:** Website tĩnh chạy trực tiếp trong trình duyệt; không yêu cầu tài khoản, không có cơ sở dữ liệu, không gửi nội dung link/logo lên máy chủ của ứng dụng.

## 1. Chức năng

- Nhập hoặc dán đường link **HTTP(S)** đến website, PDF, hình ảnh hoặc Google Drive (người quét QR vẫn cần có quyền truy cập tài liệu đích).
- **Hình dạng:** 6 kiểu điểm QR; tùy chỉnh độ bo; 5 kiểu mắt ngoài, 6 kiểu mắt trong; 4 mức sửa lỗi; 3 mức độ đầy điểm (Thưa/Trung bình/Cao). Mức “mật độ” chỉ ảnh hưởng cách vẽ, không thay đổi dữ liệu QR.
- **Màu sắc:** màu điểm, màu nền, bảng màu, mã HEX; **nền mặc định trong suốt**.
- **Logo:** tải ảnh PNG, kéo thả, xem trước và bỏ ảnh; điều chỉnh tỷ lệ logo, nền, bo góc; 3 mức khoảng trống bảo vệ **Không viền – Vừa – Rộng**. Khi có logo, cho chọn mức sửa lỗi M, Q hoặc H (khuyến nghị Q/H); mức L bị khóa.
- **Xem trước theo thời gian thực:** đặt ở cột phải trên máy tính; nằm dưới phần tùy chỉnh trên điện thoại.
- **Xuất tệp:** PNG/SVG; kích thước 512, 1024 hoặc 2048 px; sao chép PNG vào clipboard nếu trình duyệt hỗ trợ.
- **Tương thích:** desktop, tablet, mobile, giao diện tiếng Việt. Các tab chỉ hiển thị đúng nhóm tùy chỉnh đang chọn.

## 2. Cấu trúc mã nguồn

```text
cong-cu-tao-ma-qr-v1.2/
├── index.html                 # Giao diện và cấu trúc 3 tab
├── src/
│   ├── styles.css             # Toàn bộ giao diện nền sáng, responsive
│   ├── app.js                 # Điều khiển, tab, URL, logo, xuất file
│   └── qr-renderer.js         # Vẽ SVG dựa trên ma trận QR chuẩn
├── assets/
│   ├── icons/                 # 14 ảnh PNG icon nội bộ
│   └── favicon.svg
├── vendor/                    # Tùy chọn thêm qrcode.min.js (MIT)
├── scripts/
│   ├── build.mjs              # Sao chép nguồn vào thư mục dist/
│   └── make_icons.py          # Mã nguồn tái tạo icon PNG (không cần chạy khi deploy)
├── tests/
│   ├── renderer.test.mjs      # 14 bài kiểm thử Node.js
│   └── browser_smoke.py       # Kiểm thử trình duyệt (tùy chọn)
├── docs/                      # Ảnh chụp giao diện thực tế
├── _headers                   # Một số header bảo mật cơ bản
├── package.json
├── HUONG_DAN_TRIEN_KHAI.md
├── HUONG_DAN_CAP_NHAT_V1.2.md
├── CHANGELOG.md
└── LICENSE-THIRD-PARTY.md
```

## 3. Thử nghiệm trên máy tính

Yêu cầu Node.js 18+ nếu muốn kiểm thử hoặc dựng gói triển khai.

```bash
npm run check
npm test
npm run build
```

Có thể mở môi trường phát triển bằng `npm run dev`, sau đó truy cập `http://localhost:8080`. **Không nên mở trực tiếp file `index.html` bằng `file://`**, vì JavaScript module trên nhiều trình duyệt bị giới hạn khi dùng giao thức file.

**Lưu ý thư viện:** Mặc định ứng dụng tải qrcode-generator 1.4.4 từ CDN nếu không tìm thấy `vendor/qrcode.min.js`. Không cần cài thêm package NPM để build. Nếu môi trường bị chặn CDN, đặt bản phân phối hợp lệ của thư viện này vào `vendor/qrcode.min.js` theo hướng dẫn trong `LICENSE-THIRD-PARTY.md`. Điều này là **phụ thuộc runtime**, không phải máy chủ chứa dữ liệu QR.

## 4. Triển khai GitHub / Cloudflare Pages

Xem [HUONG_DAN_TRIEN_KHAI.md](HUONG_DAN_TRIEN_KHAI.md). Nếu nâng cấp từ V1.1, xem [HUONG_DAN_CAP_NHAT_V1.2.md](HUONG_DAN_CAP_NHAT_V1.2.md).

- Framework preset: **None**
- Build command: **`npm run build`**
- Build output directory: **`dist`**
- Root directory: **thư mục chứa `package.json` và `index.html`** (nếu repository đặt mã nguồn ở gốc thì để trống / mặc định)
- Nhánh triển khai: theo cấu hình repo hiện hữu (thường là `main`)

> Website không có cơ chế đăng nhập, vì vậy nếu triển khai trên `*.pages.dev` mà không thiết lập thêm giới hạn truy cập thì **địa chỉ website có thể được người ngoài truy cập**. “Sử dụng cho cơ quan” không có nghĩa là tự động được bảo vệ riêng tư. Mã QR không cấp quyền đọc tài liệu mà người quét chưa có.

## 5. Các lưu ý quan trọng

1. Mã QR chỉ chứa đường link, **không chứa nguyên file PDF hoặc hình ảnh**.
2. Khả năng quét phụ thuộc vào độ tương phản, kích thước in, màu nền, mật độ điểm, tỷ lệ logo và độ dài URL. Trước khi phát hành chính thức nên quét thử từ nhiều điện thoại, trên nền trắng và nền thực tế.
3. Nền QR trong suốt chỉ phù hợp khi đặt trên nền đủ sáng và có độ tương phản với điểm QR. QR chứa logo lớn / khoảng bảo vệ rộng có thể khó quét ở một số trường hợp.
4. QR tĩnh sẽ tiếp tục dẫn đến **đúng URL đã mã hóa**; nếu URL bị thay đổi, bị khóa quyền hoặc tệp bị xóa thì quét QR không còn truy cập được.
5. Không có cơ sở dữ liệu, không ghi lịch sử người dùng. Logo chỉ đọc trong bộ nhớ trình duyệt hiện tại, không tải lên máy chủ ứng dụng.

## 6. Kiểm thử đã thực hiện cho bản V1.2

- 14/14 bài kiểm thử JavaScript (Node.js).
- Kiểm tra trong Chromium với ma trận QR chuẩn được **cung cấp sẵn từ bộ kiểm thử** (không phải kiểm thử kết nối CDN): nhập link, chuyển tab, render SVG, xuất PNG và SVG, logo PNG, ba mức khoảng trống bảo vệ, nền PNG trong suốt.
- Giải mã thử PNG xuất ra bằng OpenCV với URL mẫu `https://example.com/tai-lieu.pdf`: **đạt**, bao gồm cả ba mức khoảng trống quanh logo.
- Kiểm tra tràn chiều ngang tại các kích thước viewport 320, 390, 640, 800, 1024 px: **đạt**.
- Chưa kiểm thử trực tiếp quá trình triển khai trên tài khoản Cloudflare và khả năng tải CDN thực tế từ website của cơ quan.

## 7. Bản quyền trong ứng dụng

> Công cụ tạo mã QR • Bản quyền thuộc Văn phòng Ban Quản lý các khu kinh tế và các khu công nghiệp Đắk Lắk

Thành phần nguồn mở của bên thứ ba: xem [`LICENSE-THIRD-PARTY.md`](LICENSE-THIRD-PARTY.md).


### Thay đổi V1.2.1
- Lề ảnh QR gọn 2 mô-đun theo mặc định khi xuất Word, hoặc chọn lề chuẩn 4 mô-đun theo khuyến nghị QR cho môi trường quét khó. Cả PNG và SVG đều áp dụng.
- Khi có logo, mức sửa lỗi L bị khóa; có thể chọn M/Q/H; mặc định H. Nếu đang chọn L rồi tải logo, tự chuyển M. Giới hạn kích thước logo: M tối đa 15%, Q tối đa 18%, H tối đa 22%.
- Hai icon nhập URL và tùy chỉnh được vẽ lại thành nét xanh PNG trong suốt, không nền.
- Chức năng và giao diện còn lại của V1.2 được giữ nguyên.

### Thay đổi V1.2.2
- Màu điểm QR mặc định: **đen `#000000`**; nền vẫn mặc định trong suốt. Người dùng có thể chọn các màu khác như cũ.
- Bốn mức sửa lỗi L / M / Q / H trên **cùng một hàng** ở màn hình rộng; màn hình điện thoại cuộn ngang riêng hàng nút để không bị vỡ dòng.
- Giữ nguyên giới hạn mức sửa lỗi từ M trở lên khi có logo và tất cả chức năng V1.2.1.
