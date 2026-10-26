# Emotion Care Platform - Documentation Index

Thư mục này lưu trữ toàn bộ tài liệu thiết kế nghiệp vụ, kiến trúc, và đặc tả kỹ thuật được bảo toàn từ hệ thống nguyên mẫu:

---

## Danh Mục Tài Liệu

| Tài liệu | Nội dung chính |
| :--- | :--- |
| **[Product-Vision.md](file:///c:/source/midob/be/emotion-care/docs/Product-Vision.md)** | Tầm nhìn sản phẩm, Core User Journey, Emotion Domain Model, RAG Caption, Empathy Matching, Emotion Heatmap. |
| **[HLD.md](file:///c:/source/midob/be/emotion-care/docs/HLD.md)** | Thiết kế kiến trúc tổng thể cấp cao (High Level Design): Event-Driven Architecture, Domain Breakdown, Risk Detection. |
| **[Architecture-v2.md](file:///c:/source/midob/be/emotion-care/docs/Architecture-v2.md)** | Kiến trúc chi tiết phiên bản 2.0: Luồng dữ liệu, Topic Kafka, Vector Storage, Scale strategy. |
| **[Achirtecture.md](file:///c:/source/midob/be/emotion-care/docs/Achirtecture.md)** | Bản thiết kế kiến trúc hệ thống ban đầu. |
| **[Feed.md](file:///c:/source/midob/be/emotion-care/docs/Feed.md)** | Thiết kế thuật toán phân phối Feed cảm xúc, Nearby Radius, Cursor Pagination, Caching. |
| **[Outbox-Relay-Worker.md](file:///c:/source/midob/be/emotion-care/docs/Outbox-Relay-Worker.md)** | Đặc tả kỹ thuật cho Transactional Outbox Relay: Cơ chế poll `SKIP LOCKED`, Event Envelope, Idempotency Key. |
| **[Notification-Consumer-Worker.md](file:///c:/source/midob/be/emotion-care/docs/Notification-Consumer-Worker.md)** | Đặc tả kỹ thuật cho Notification Worker: Tiêu thụ Kafka topic, gửi Push FCM/APNs. |
| **[Mobile-App.md](file:///c:/source/midob/be/emotion-care/docs/Mobile-App.md)** | Hướng dẫn phát triển ứng dụng di động React Native Expo. |
