# Thông tin thành phần mã nguồn mở

Ứng dụng sử dụng bộ tạo ma trận QR **qrcode-generator** phiên bản **1.4.4** của Kazuhiko Arase, theo giấy phép MIT.

- Mã nguồn: https://github.com/kazuhikoarase/qrcode-generator
- Bản phân phối: https://cdnjs.com/libraries/qrcode-generator/1.4.4
- Giấy phép: https://github.com/kazuhikoarase/qrcode-generator/blob/master/LICENSE

Dự án mặc định ưu tiên tải bản thư viện từ `vendor/qrcode.min.js` (nếu quản trị viên tự đặt tại thư mục này); nếu không có, hệ thống sử dụng CDN phiên bản cố định (Cloudflare cdnjs, dự phòng jsDelivr). Tệp mã nguồn của thư viện không được đính kèm trong kho này.

Thư viện chỉ được tải về trình duyệt để xử lý ma trận QR. Ứng dụng không gửi đường link hoặc logo người dùng đến CDN; đây là các bước xử lý trên thiết bị. Việc tải script thư viện vẫn tạo kết nối với nhà cung cấp CDN (ví dụ địa chỉ IP, thông tin HTTP thông thường).
