# 👨‍🍳 Chi tiết Logic Hệ thống CalorieGuess AI

Tài liệu này giải thích các lớp bảo mật, giới hạn và cơ chế tự động xoay vòng (rotation) để đảm bảo hệ thống luôn hoạt động ổn định và chuyên nghiệp.

---

## 1. 🛡️ Lớp 1: Giới hạn lượt dùng (Rate Limiting)
Sử dụng **Redis** để theo dõi và giới hạn dựa trên địa chỉ IP của người dùng.
- **Giới hạn 5 phút:** Tối đa **2 yêu cầu / 5 phút**. (Ngăn chặn spam liên tục).
- **Giới hạn ngày:** Tối đa **15 yêu cầu / 24 giờ**. (Quản lý chi phí/quota miễn phí).
- **Phạm vi:** Áp dụng cho từng địa chỉ IP riêng biệt qua headers `x-forwarded-for`.

---

## 2. 🔑 Lớp 2: Xoay vòng API Key (Multi-Key Rotation)
Hệ thống sử dụng đồng thời **2 API Key Gemini** từ hai tài khoản độc lập để tăng gấp đôi dung lượng (quota).
- **Logic:** Mỗi model trong danh sách sẽ được thử lần lượt với **Key 1**, nếu thất bại (lỗi 429 hoặc 503) sẽ lập tức thử lại với **Key 2**.
- Điều này giúp hệ thống "lách" qua các giới hạn lượt dùng của từng tài khoản Google cá nhân.

---

## 3. 🚀 Lớp 3: Xoay vòng Model AI (Model Rotation)
Nếu cả 2 Key đều báo lỗi cho một model nhất định (thường do Google bảo trì hoặc quá tải server), hệ thống sẽ chuyển sang model tiếp theo trong danh sách dự phòng:

| Thứ tự | Model ID | Đặc điểm |
| :--- | :--- | :--- |
| **1 (Chính)** | `gemini-3.1-pro-preview` | Thông minh nhất (Cập nhật Tháng 1/2026) |
| **2** | `gemini-3.1-flash-lite-preview` | Nhanh & mới nhất (Tháng 3/2026) |
| **3** | `gemini-3-flash-preview` | Tốc độ cực cao (Tháng 12/2025) |
| **4** | `gemini-3-pro-preview` | Dự phòng chất lượng Pro (Tháng 11/2025) |
| **5 (Cuối)** | `gemini-2.5-flash` | Bản ổn định nhất (Tháng 6/2025) |

---

## 4. 👨‍🍳 Lớp 4: Xử lý lỗi 503 (Friendly Error Experience)
Khi gặp lỗi **503 Service Unavailable** (Google quá tải cục bộ mọi model), hệ thống không hiện log lỗi kỹ thuật mà hiện giao diện "Đầu bếp bận rộn":
- **Đa ngôn ngữ:** Tự động dịch thông báo sang **Việt, Anh, Nhật, Hàn**.
- **Nút "Thử lại ngay":** Cho phép người dùng Refresh yêu cầu dễ dàng.
- **Hoạt họa (Animation):** Icon thìa dĩa chuyển động sinh động để giảm cảm giác khó chịu cho người dùng.

---

## 5. 🤖 Cấu trúc Prompt "Chuyên gia Dinh dưỡng"
Prompt được tối ưu hóa để ép AI trả về **JSON thuần túy**, bao gồm:
- **Tên món:** Độ chính xác cao theo món ăn Việt/Quốc tế.
- **Calo & Macros:** Ước lượng dựa trên khẩu phần thực tế nhìn thấy (không phóng đại).
- **Đánh giá sức khỏe:** Ưu/Nhược điểm và lời khuyên thực tế từ chuyên gia.

---
*Tài liệu được cập nhật tự động bởi Antigravity AI.*
