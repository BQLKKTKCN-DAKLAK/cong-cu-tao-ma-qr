# CHECKLIST KIỂM THỬ V1.3.0

- [x] Nút Nền sáng / Nền tối có trạng thái lựa chọn và truy cập bằng bàn phím.
- [x] Nền sáng màu trắng `#FFFFFF`, không có sóng/pseudo nền.
- [x] Nền tối xanh công nghệ; tên cơ quan trắng; tên phần mềm gold gradient.
- [x] Bố cục 2 cột và 3 tab tùy chỉnh không bị xóa.
- [x] Xuất QR cùng URL ở hai chế độ tạo PNG giống hệt nhau (đối chiếu SHA256).
- [x] QR vẫn mặc định đen, nền xuất trong suốt.
- [x] Kiểm tra không tràn ngang ở 320 / 390 / 590 / 800 / 1024 / 1536 px, cả hai chế độ.
- [x] Kiểm tra QR có logo và ba mức vùng trống bảo vệ bằng bài test trình duyệt cũ.
- [x] Build thành công với `npm run build`.
- [ ] Kiểm tra trực tiếp trên Cloudflare Pages tại địa chỉ chính thức sau khi cập nhật.
- [ ] Quét thử QR thực tế trên điện thoại, đặc biệt khi sử dụng logo.

Kiểm thử trình duyệt sử dụng ma trận QR tạo sẵn bằng thư viện Python để tách phụ thuộc CDN. Không khẳng định đã thử kết nối CDN tại Cloudflare của cơ quan.
