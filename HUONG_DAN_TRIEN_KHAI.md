# HƯỚNG DẪN TRIỂN KHAI CÔNG CỤ TẠO MÃ QR – V1.2

## A. Đưa toàn bộ mã nguồn lên GitHub

1. Tải `cong-cu-tao-ma-qr-v1.2-full.zip`, giải nén trên máy tính.
2. Vào repository GitHub của dự án. Nếu đã có V1.1, **không cần tạo repository mới**; đọc hướng dẫn nâng cấp ở `HUONG_DAN_CAP_NHAT_V1.2.md`.
3. Nếu tạo repository mới, chọn **Add file → Upload files**, tải **toàn bộ các file và thư mục bên trong** thư mục dự án vừa giải nén. Đảm bảo `index.html`, `package.json`, `src` và `assets` nằm tại cùng một cấp gốc.
4. Commit lên nhánh triển khai (ví dụ `main`). Không tải duy nhất tệp ZIP vào repository; phải giải nén và tải **nội dung**.
5. Có thể dùng Git nếu quen thao tác: `git add .`, `git commit -m "Release QR V1.2 light UI"`, `git push`.

## B. Kết nối Cloudflare Pages

1. Đăng nhập Cloudflare, vào **Workers & Pages**, tạo hoặc mở dự án Pages.
2. Nếu dự án đã kết nối repository GitHub của V1.1, chỉ cần cập nhật mã trên GitHub. Cloudflare sẽ tự kích hoạt lượt triển khai mới theo cấu hình hiện tại.
3. Nếu thiết lập mới, kết nối repository và cấu hình như sau:

| Mục | Giá trị |
| --- | --- |
| Framework preset | **None** |
| Build command | **`npm run build`** |
| Build output directory | **`dist`** |
| Root directory | **để mặc định khi repo đặt nguồn ở gốc** |
| Production branch | **`main`** hoặc nhánh production hiện có |

4. Chọn lưu và triển khai. Không yêu cầu cấu hình cơ sở dữ liệu, biến môi trường hay dịch vụ backend.
5. Mở URL được Cloudflare cấp; nhấn **Ctrl + F5** trên máy tính hoặc làm mới mạnh trình duyệt để nhận CSS/JS mới nếu còn cache.

## C. Kiểm tra sau khi triển khai

- Tên cơ quan **đủ dấu tiếng Việt**; đường kẻ bên dưới **không có hình trang trí**.
- Tên công cụ màu đỏ, nền sáng, icon màu xanh, cuối trang có nền xanh cùng dòng bản quyền chính xác.
- Ba tab **Hình dạng / Màu sắc / Logo** chỉ hiển thị nội dung của tab được chọn.
- Dán `https://example.com` để kiểm tra QR hiển thị; thử quét với điện thoại.
- Trong tab Màu sắc, ô **Nền trong suốt** được chọn mặc định.
- Trong tab Logo, thử tải một file PNG, kéo tỷ lệ; so sánh các mức Viền logo: Không viền/Vừa/Rộng.
- Tải PNG 512, 1024, 2048 px; thử mở và quét. Xuất SVG và sao chép PNG (tùy quyền clipboard của trình duyệt).
- Kiểm tra lại trên điện thoại.

## D. Nếu màn hình trắng hoặc QR không xuất hiện

1. Mở trình duyệt F12 → **Console**, kiểm tra lỗi `Failed to load module`, `qrcode` hoặc yêu cầu tải script.
2. Đảm bảo cấu trúc chính xác: `index.html`, `src/app.js`, `src/styles.css`, `src/qr-renderer.js`, `assets/icons/`.
3. Kiểm tra URL máy chủ đến CDN. Công cụ sẽ thử thư viện tại `vendor/qrcode.min.js`, sau đó cdnjs và jsDelivr; nếu cả ba đều lỗi, QR không thể tạo. Có thể tự đặt bản thư viện hợp lệ được cấp phép MIT vào `vendor/qrcode.min.js` để phục vụ trực tiếp từ Pages.
4. Kiểm tra `Build output directory` là `dist`, không phải `src`.
5. Nếu giao diện vẫn là V1.1, kiểm tra Cloudflare đã nhận commit mới và làm mới cache trình duyệt.

## E. An toàn và quyền truy cập

- Không sử dụng đăng nhập; website sẽ có thể truy cập công khai theo URL nếu không áp dụng biện pháp hạn chế truy cập khác.
- Không nhập thông tin mật trực tiếp vào URL hoặc dùng link chia sẻ công khai cho tài liệu mật.
- QR dẫn tới tài liệu trên hệ thống gốc; **không thay đổi quyền chia sẻ** của tệp PDF/ảnh.
- Mã QR tạo trong trình duyệt, không lưu lịch sử trên ứng dụng. Việc tải thư viện QR qua CDN tạo kết nối HTTP bình thường tới nhà cung cấp CDN.
