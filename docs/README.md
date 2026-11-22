# Emotion Care Platform - Documentation

> **Tài liệu chuẩn hóa duy nhất (Single Source of Truth):** Toàn bộ tầm nhìn sản phẩm, nghiệp vụ 2 chế độ (Dual-Mode: Emotion & Social Caption), kiến trúc hệ thống phân tán Polyglot, thuật toán phân phối/xếp hạng, và từ điển cơ sở dữ liệu đã được hợp nhất hoàn chỉnh tại:

## 👉 **[MASTER-SPECIFICATION.md](file:///c:/source/emotion-care/docs/MASTER-SPECIFICATION.md)**

---

### Cấu Trúc Nội Dung Bản Master Specification:

1. **Tổng Quan Sản Phẩm & Chiến Lược 2 Chế Độ (Dual-Mode)**: Emotion Safe Space (chữa lành ẩn danh) & Social Caption Content (sáng tạo, ranking, viral).
2. **Các Miền Nghiệp Vụ Cốt Lõi (Core Domains)**: Device & Privacy Settings, Emotion Taxonomy 2 tầng, Empathy Reactions, Safety & Crisis Moderation.
3. **Bảng Mã Màu & Icon Cảm Xúc (Visual Mood Taxonomy)**: Bộ màu nền, màu chữ hex và icon key cho 6 nhóm cảm xúc.
4. **Kiến Trúc Hệ Thống Phân Tán (System Architecture)**: Core API Spring Boot 3, Go Workers, PostGIS, Kafka KRaft, Redis.
5. **Mẫu Thiết Kế Transactional Outbox & Event Streaming**: Cơ chế khóa `FOR UPDATE SKIP LOCKED`, event envelopes, Kafka topics.
6. **Thuật Toán Feed & Bảng Xếp Hạng Viral**: PostGIS spatial queries, công thức tính điểm Viral Score (Hacker News gravity decay).
7. **Kiến Trúc AI Caption & RAG Vector Search**: Semantic search trên Elasticsearch Vector DB, mô hình sinh caption đa phong cách.
8. **Từ Điển Cơ Sở Dữ Liệu Toàn Tập**: Toàn bộ 18 bảng, kiểu dữ liệu, ràng buộc, indexes.
9. **Hướng Dẫn Triển Khai & Vận Hành**: Docker compose local, Docker AI stack, cổng port kết nối.

---

### Lưu Trữ Tài Liệu Cũ (Archive)
Các tài liệu tiền nhiệm riêng lẻ trước khi hợp nhất được lưu trữ tại thư mục: **[docs/archive/](file:///c:/source/emotion-care/docs/archive/)** để phục vụ việc đối chiếu lịch sử khi cần thiết.
