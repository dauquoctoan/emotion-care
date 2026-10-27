# Emotion Care Platform - Architectural Blueprint & Modernization Plan

> **Chiến lược:** Tái cấu trúc nền tảng **Emotion Care (Personal Status)** từ nguyên mẫu NestJS sang mô hình **Polyglot Microservices hiện đại**:
> * **Core Business APIs:** Java 17 + Spring Boot 3.3.x (kế thừa kiến trúc Base/Core & Response wrapper từ MyDio).
> * **Background Workers:** Go (Golang) cho Transactional Outbox Relay & Push Notification Consumer (siêu nhẹ ~15-20MB RAM, concurrency Goroutine cực mạnh).
> * **Mobile Client:** React Native Expo (giữ nguyên, chỉ cần khớp API contract JSON).
> * **Hạ tầng Cloud-Native:** Kubernetes manifests (loại bỏ Eureka, dùng native K8s CoreDNS, HPA, RollingUpdate).

---

## 1. Cấu Trúc Thư Mục Tổng Thể (Root Monorepo)

Thư mục gốc: `c:\source\midob\be\emotion-care\`

```text
emotion-care/
├── PLAN.md                                    # Tài liệu kiến trúc & kế hoạch hành động chi tiết này
├── README.md                                  # Hướng dẫn onboarding, Quick Start (One-Command Dev)
├── docker-compose.local.yml                   # Mock Infra Local: PostgreSQL 16, Redis 7, Kafka KRaft, ES 8
│
├── docs/                                      # [TÀI LIỆU TOÀN DIỆN TỪ PROJECT GỐC]
│   ├── README.md                              # Mục lục tài liệu
│   ├── Product-Vision.md                      # Tầm nhìn sản phẩm, User Journey, AI RAG Caption
│   ├── HLD.md                                 # High Level Architecture Design
│   ├── Architecture-v2.md                     # Kiến trúc chi tiết v2.0
│   ├── Achirtecture.md                        # Thiết kế kiến trúc ban đầu
│   ├── Feed.md                                # Thuật toán phân phối Feed cảm xúc & Cursor pagination
│   ├── Outbox-Relay-Worker.md                 # Đặc tả kỹ thuật Outbox Relay Worker
│   ├── Notification-Consumer-Worker.md        # Đặc tả kỹ thuật Notification Worker
│   └── Mobile-App.md                          # Hướng dẫn phát triển ứng dụng di động React Native
│
├── database/                                  # [DATABASE MIGRATION & SEED DATA DÙNG CHUNG]
│   └── migrations/
│       ├── 01-init-schema.sql                 # DDL tạo trọn vẹn 18 bảng, khóa chính UUID, indexes
│       └── 02-seed-data.sql                   # DML nạp đầy đủ danh mục cảm xúc, tags, icon, màu sắc
│
├── backend-java/                              # [CORE BUSINESS API - JAVA SPRING BOOT 3]
│   ├── pom.xml                                # Root Aggregator POM cho toàn bộ Java modules
│   ├── mvnw / mvnw.cmd                        # Maven Wrapper độc lập
│   │
│   ├── emotion-base/                          # [LÕI 1] Master Parent POM
│   │   └── pom.xml                            # Quản lý tập trung dependencies: Spring Boot 3.3, Cloud 2023, JJWT, Postgres...
│   │
│   ├── emotion-core/                          # [LÕI 2] Shared Library (Kế thừa & tinh chỉnh từ MyDio)
│   │   ├── pom.xml
│   │   └── src/main/java/com/emotioncare/core/
│   │       ├── restful/response/wrapper/      # BaseResponse<T>, PageData, Result, Metadata
│   │       ├── exception/                     # GlobalExceptionHandler, Domain Exceptions, FieldViolations
│   │       ├── filter/                        # JwtAuthenticationFilter, TraceFilter (OpenTelemetry)
│   │       ├── audit/                         # AuditTrail (@CreatedDate, @LastModifiedDate)
│   │       └── util/                          # DateTimeUtils, StringUtils, CryptoUtils
│   │
│   └── emotion-api-svc/                       # [API SERVICE CHÍNH] Port từ personal-status-be sang Java
│       ├── pom.xml
│       └── src/main/java/com/emotioncare/api/
│           ├── domain/device/                 # Device registration, settings, push tokens
│           ├── domain/emotion/                # Posts, Categories, Tags, Feeds
│           ├── domain/reaction/               # Empathy Reactions (Support, Hug, Listen...)
│           ├── domain/moderation/             # Safety Engine: Crisis / Self-harm detection rate limit
│           ├── domain/outbox/                 # Transactional Outbox repository & entity (outbox_events)
│           ├── domain/analytics/              # Emotion Heatmap & Community Statistics
│           └── infrastructure/                # Config: Security, PostgreSQL Hikari, Kafka Producer, Redis
│
├── workers-go/                                # [HIGH-PERFORMANCE WORKERS - GOLANG]
│   ├── emotion-outbox-relay/                  # [WORKER 1] Quét outbox_events Postgres -> Publish Kafka
│   │   ├── cmd/
│   │   │   └── relay/main.go
│   │   ├── internal/                          # Poller (SKIP LOCKED), Kafka Producer, Metrics
│   │   ├── go.mod
│   │   └── Dockerfile                         # Multi-stage build scratch (~15MB container)
│   │
│   └── emotion-notification-worker/           # [WORKER 2] Consume Kafka -> Batch Push Firebase FCM
│       ├── cmd/
│       │   └── worker/main.go
│       ├── internal/                          # Kafka Consumer, FCM Client, Worker Pool
│       ├── go.mod
│       └── Dockerfile
│
├── mobile/                                    # [CLIENT] React Native Expo (giữ nguyên từ personal-status)
│
└── k8s/                                       # [HẠ TẦNG K8S CLOUD-NATIVE] (Kế thừa từ bộ K8s của bác)
    ├── base/
    │   ├── ingress.yaml                       # NGINX Ingress điều hướng domain / api
    │   ├── emotion-api-svc.yaml               # Java Deployment + HPA + startupProbe + G1GC
    │   ├── emotion-outbox-relay.yaml          # Go Relay Deployment (siêu nhẹ)
    │   ├── emotion-notification-worker.yaml   # Go Worker Deployment + HPA
    │   ├── postgres-secret.yaml
    │   └── kafka-configmap.yaml
    └── overlays/
        ├── local/
        └── prod/
```

---

## 2. So Sánh & Chắt Lọc Tinh Túy: Giữ Gì Từ MyDio, Lấy Gì Từ Personal-Status?

| Khía cạnh | Dự án MyDio cũ | Personal-Status (Hiện tại) | Lựa chọn tối ưu cho hệ thống mới |
| :--- | :--- | :--- | :--- |
| **API Response Contract** | `BaseResponse<T>` chuẩn REST (Data + Metadata phân trang). | Interceptor custom của NestJS. | **Lấy từ MyDio:** `BaseResponse` rất chuẩn, clean và dễ parse ở app React Native. |
| **Data Consistency** | Đẩy Kafka trực tiếp (dễ rớt event nếu Kafka chập chờn). | **Transactional Outbox Pattern** (`outbox_events` table). | **Lấy từ Personal-Status:** Cực kỳ an toàn, đảm bảo 100% không mất dữ liệu. |
| **Xử lý nền (Workers)** | Chạy bằng Java Spring Boot (ngốn 1GB RAM/worker, cold-start 30s). | Viết bằng NestJS (Node.js single-thread). | **Nâng cấp lên Golang:** Siêu nhẹ (15MB RAM), chịu tải concurrency vô địch nhờ Goroutines. |
| **Database Access** | Spring Data JPA / Hibernate + Liquibase. | TypeORM (NestJS). | **Lấy từ MyDio:** Dùng Spring Data JPA (chuẩn mực doanh nghiệp, type-safe, phân trang mượt). |
| **Vector & Semantic Search** | ES Keyword & Match Query. | **Dense Vector Search (`emotion_vector_index`) + RAG Caption**. | **Lấy từ Personal-Status:** Ý tưởng tìm kiếm ngữ nghĩa cảm xúc cực hay và khác biệt. |
| **Hạ tầng K8s** | Bác vừa viết bộ K8s loại bỏ Eureka, dùng CoreDNS, HPA. | Chưa có K8s hoàn chỉnh. | **Lấy từ bộ K8s của bác:** Áp dụng ngay cho cụm Java + Go polyglot. |

---

## 2.1. Chiến Lược Clone & Chuẩn Hóa Database Migration (Từ NestJS sang Liquibase)

Toàn bộ công sức thiết kế DB từ **18 Entities** và **Seed Data** bên NestJS được clone và nâng cấp 100%:

### A. Danh sách 18 bảng nghiệp vụ clone từ TypeORM:
1. **Nhóm Thiết Bị & Định Danh Ẩn Danh:**
   * `devices`: Quản lý device hash, fingerprint, platform (iOS/Android).
   * `device_settings`: Cài đặt thông báo, ngôn ngữ, quyền riêng tư.
   * `device_locations`: Vị trí địa lý (tỉnh/thành) phục vụ Emotion Heatmap.
   * `device_push_tokens`: Quản lý FCM/APNs token để Go Worker gửi push notification.
2. **Nhóm Cảm Xúc & Bài Đăng (Core Domain):**
   * `emotion_categories`: Danh mục cảm xúc chính (Vui vẻ, Buồn, Mệt mỏi, Căng thẳng, Cô đơn, Phấn khích...).
   * `emotion_tags`: Thẻ cảm xúc chi tiết (Hy vọng, Biết ơn, Lo lắng, Áp lực, Chia tay...).
   * `emotion_posts`: Bài viết cảm xúc, ẩn danh, mức độ tâm trạng, nội dung, RAG caption.
   * `emotion_post_tags`: Bảng liên kết N-N giữa Post và Tags.
3. **Nhóm Tương Tác & Đồng Cảm (Empathy):**
   * `reaction_types`: Các loại thả cảm xúc (Đồng cảm, Ôm một cái, Lắng nghe, Cố lên...).
   * `post_reactions`: Lịch sử thả reaction của thiết bị với bài viết.
4. **Nhóm AI & An Toàn (Moderation / Safety):**
   * `ai_suggestions`: Lưu lịch sử gợi ý caption từ RAG/LLM.
   * `posting_rate_limits`: Chống spam đăng bài liên tục.
   * `moderation_queue`: Hàng đợi kiểm duyệt bài viết có rủi ro tự hại (Self-harm / Crisis).
5. **Nhóm Thông Báo (Notifications):**
   * `notifications`: Lịch sử thông báo gửi tới người dùng.
   * `notification_templates`: Mẫu thông báo theo từng loại sự kiện.
   * `notification_settings`: Cài đặt nhận thông báo.
   * `notification_queue`: Hàng đợi xử lý thông báo.
6. **Nhóm Event-Driven (Transactional Outbox):**
   * `outbox_events`: Lưu sự kiện nghiệp vụ trong cùng DB transaction (`event_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `status: PENDING/PUBLISHED`, `created_at`).
   * *Đánh Index tối ưu:* `CREATE INDEX idx_outbox_events_status_created ON outbox_events(status, created_at) WHERE status = 'PENDING';` (Giúp Go Worker quét siêu tốc).

### B. Cấu trúc Migration trong Java Service (`src/main/resources/db/`):
* `db/changelog/db.changelog-master.xml`: Master changelog quản lý tuần tự.
* `db/changelog/v1.0.0/01-create-all-18-tables.sql`: Script DDL tạo toàn bộ bảng, khóa chính (UUID), khóa ngoại, indexes.
* `db/changelog/v1.0.0/02-seed-initial-emotion-categories-and-tags.sql`: Script DML clone toàn bộ seed data từ `seeder.ts` (icon, mã màu, tên danh mục tiếng Việt).

---

## 3. Lộ Trình Triển Khai (Milestones)

### Giai đoạn 1: Nền móng & Database Migration (Foundation & DB Clone)
* [x] Tạo cấu trúc thư mục Monorepo `emotion-care`.
* [x] Dựng `docker-compose.local.yml` chuẩn cho local (PostgreSQL 16, Kafka KRaft, Redis 7, Elasticsearch 8).
* [x] Xây dựng bộ **Database Migration Scripts (Liquibase)** clone nguyên vẹn 18 bảng từ TypeORM + nạp seed data từ `seeder.ts`.
* [x] Tạo `backend-java/pom.xml` (Root Aggregator).
* [x] Xây dựng module `emotion-base` (Parent POM quản lý version dependencies: Spring Boot 3.3.x, Cloud 2023, Postgres, JJWT, Mapstruct, OpenTelemetry).
* [x] Xây dựng module `emotion-core` (BaseResponse, PageData, GlobalExceptionHandler, JwtAuthenticationFilter, AuditTrail).

### Giai đoạn 2: Chuyển đổi Core API sang Java (`emotion-api-svc`)
* [x] Port 18 Entity TypeORM sang Spring Data JPA Entities (hỗ trợ Postgres JSONB qua `@JdbcTypeCode(SqlTypes.JSON)`).
* [x] Xây dựng các Repositories: `DeviceRepository`, `EmotionPostRepository`, `ReactionRepository`, `OutboxEventRepository`, `EmotionCategoryRepository`, `EmotionTagRepository`, `EmotionPostTagRepository`.
* [x] Xây dựng REST API & Services:
  * Module Device & Auth: Xác thực ẩn danh, cấp phát token JWT (`/api/v1/auth/device`).
  * Module Category & Tag: Duyệt danh mục và các tag cảm xúc lồng nhau (`/api/v1/categories`, `/emotion-category`).
  * Module Emotion Post: Đăng bài + ghi `outbox_events` trong 1 `@Transactional` (`/api/v1/posts`, `/emotion-post`).
  * Module Feed: Lấy danh sách bài viết phân trang (`Pageable`) trả về chuẩn `BaseResponse` với bộ đếm reactions & tags.
  * Module Reaction: Thả cảm xúc đồng cảm, toggle reaction, ghi Transactional Outbox (`/api/v1/posts/{postId}/reactions`, `/reaction-type`).
* [x] Kiểm tra tích hợp build thành công 4/4 module (Maven Multi-Module Build SUCCESS).

### Giai đoạn 3: Xây dựng Workers bằng Golang (`workers-go`)
* [x] **`emotion-outbox-relay`:**
  * Polling Postgres `outbox_events` bằng `SELECT ... FOR UPDATE SKIP LOCKED` (chống tranh chấp giữa các replica).
  * Publish message vào Kafka KRaft theo topic (`emotion.post.created`, `emotion.reaction.events`).
  * Đánh dấu trạng thái `processed` với timestamp, xử lý error/retry an toàn.
  * Tách module độc lập, build hoàn tất, Dockerfile alpine (~15MB RAM).
* [x] **`emotion-notification-worker`:**
  * Kafka Consumer group `emotion-notification-group` đọc đa topic.
  * Worker pool kết nối Firebase Cloud Messaging (FCM) / Push dispatch, tự động tra cứu push tokens và lưu lịch sử `notifications`.
  * Tách module độc lập, build hoàn tất, Dockerfile alpine (~15MB RAM).

### Giai đoạn 4: Hạ tầng Cloud-Native (K8s & CI/CD)
* [x] Hoàn thiện bộ K8s manifests trong `k8s/`: Ingress NGINX, Services, HPA, ConfigMap, Secrets, PodDisruptionBudget.
* [x] Dockerfile tối ưu:
  * Java: Eclipse Temurin 17 JRE, multi-stage, G1GC tuning.
  * Go: Multi-stage alpine/scratch (~15MB image).
* [x] Sẵn sàng vận hành với `docker-compose.local.yml` và K8s Kustomize.
