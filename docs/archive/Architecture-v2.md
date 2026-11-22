# Emotion Care Platform
# System Architecture & Database Design
## Version 2.0
## Production Ready - 10M+ Users

---

# 1. PRODUCT OVERVIEW

Emotion Care là nền tảng chia sẻ cảm xúc ẩn danh theo vị trí địa lý kết hợp AI nhằm:

- Chia sẻ cảm xúc
- Tìm kiếm sự đồng cảm
- Kết nối cộng đồng có cảm xúc tương tự
- Phân tích cảm xúc bằng AI
- Tạo Heatmap cảm xúc cộng đồng
- Phát hiện sớm các nguy cơ tâm lý
- Xây dựng Knowledge Graph về cảm xúc

---

# 2. BUSINESS GOALS

## Người dùng

- Chia sẻ cảm xúc ẩn danh
- Xem cảm xúc gần khu vực
- Tìm người đồng cảm
- Nhận hỗ trợ AI
- Theo dõi trạng thái tinh thần

## Hệ thống

- 10M+ Users
- 1M+ DAU
- 5M+ Posts / Day
- 50M+ Reactions / Day
- 20M+ Notifications / Day

---

# 3. HIGH LEVEL ARCHITECTURE

```text
                        Mobile App
                             │
                             ▼

                    ┌─────────────────┐
                    │   API Gateway   │
                    └─────────────────┘
                             │

────────────────────────────────────────────────────────

          Emotion Service

          Feed Service

          AI Service

          Notification Service

          Analytics Service

          Recommendation Service

────────────────────────────────────────────────────────
                             │
                             ▼

                    ┌─────────────────┐
                    │      Kafka      │
                    └─────────────────┘

────────────────────────────────────────────────────────

Feed Worker

AI Worker

Notification Worker

Moderation Worker

Analytics Worker

Recommendation Worker

────────────────────────────────────────────────────────
         │                 │                  │
         ▼                 ▼                  ▼

    PostgreSQL          Redis          Elasticsearch

                                             │
                                             ▼

                                     OpenAI/Gemini
```

---

# 4. SYSTEM COMPONENTS

## PostgreSQL

Source Of Truth

Lưu:

- Users Device
- Emotion Posts
- Reactions
- Settings
- AI Analysis Metadata
- Analytics Aggregation
- Moderation
- Outbox Events

---

## Redis

Cache Layer

Lưu:

- Feed Cache
- Notification Counter
- Trending Feed
- Rate Limit
- Online Users

---

## Kafka

Event Streaming

Lưu:

- Post Created
- Post Deleted
- Reaction Created
- AI Analysis Requested
- Notification Requested

---

## Elasticsearch

Vector Search

Lưu:

- Emotion Embedding
- Semantic Search
- Similar Emotion Search
- Recommendation Engine

---

# 5. DOMAIN DESIGN

```text
Emotion Domain

AI Domain

Recommendation Domain

Analytics Domain

Safety Domain

Notification Domain

Location Domain
```

---

# 6. DATABASE DESIGN

---

# devices

```sql
CREATE TABLE devices
(
    id BIGSERIAL PRIMARY KEY,

    device_token VARCHAR(255) NOT NULL UNIQUE,

    platform VARCHAR(20),

    app_version VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT now(),

    last_active_at TIMESTAMPTZ
);
```

---

# device_settings

```sql
CREATE TABLE device_settings
(
    device_id BIGINT PRIMARY KEY
        REFERENCES devices(id),

    share_nearby BOOLEAN DEFAULT TRUE,

    receive_nearby BOOLEAN DEFAULT TRUE,

    use_location BOOLEAN DEFAULT TRUE,

    approximate_location BOOLEAN DEFAULT TRUE,

    ai_suggestion_enabled BOOLEAN DEFAULT TRUE,

    low_pressure_mode BOOLEAN DEFAULT FALSE,

    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

# notification_settings

```sql
CREATE TABLE notification_settings
(
    device_id BIGINT PRIMARY KEY
        REFERENCES devices(id),

    nearby_post_enabled BOOLEAN DEFAULT TRUE,

    reaction_enabled BOOLEAN DEFAULT TRUE,

    ai_reminder_enabled BOOLEAN DEFAULT TRUE,

    daily_checkin_enabled BOOLEAN DEFAULT TRUE,

    safety_alert_enabled BOOLEAN DEFAULT TRUE,

    quiet_hour_from TIME,

    quiet_hour_to TIME,

    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

# device_locations

```sql
CREATE TABLE device_locations
(
    device_id BIGINT PRIMARY KEY
        REFERENCES devices(id),

    geohash VARCHAR(12),

    location GEOGRAPHY(POINT,4326),

    updated_at TIMESTAMPTZ
);
```

Indexes

```sql
CREATE INDEX idx_device_geohash
ON device_locations(geohash);

CREATE INDEX idx_device_location
ON device_locations
USING GIST(location);
```

---

# emotion_categories

```sql
CREATE TABLE emotion_categories
(
    id SMALLSERIAL PRIMARY KEY,

    code VARCHAR(50) UNIQUE,

    name VARCHAR(100),

    icon VARCHAR(100),

    display_order INT
);
```

---

# emotion_tags

```sql
CREATE TABLE emotion_tags
(
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE
);
```

---

# emotion_posts

Partition By Month

```sql
CREATE TABLE emotion_posts
(
    id BIGSERIAL,

    device_id BIGINT NOT NULL,

    emotion_category_id SMALLINT NOT NULL,

    content TEXT NOT NULL,

    geohash VARCHAR(12) NOT NULL,

    location GEOGRAPHY(POINT,4326),

    country_code VARCHAR(10),

    region_code VARCHAR(50),

    visibility_radius_m INT DEFAULT 5000,

    is_ai_assisted BOOLEAN DEFAULT FALSE,

    reaction_count INT DEFAULT 0,

    warm_count INT DEFAULT 0,

    support_count INT DEFAULT 0,

    empathy_count INT DEFAULT 0,

    view_count BIGINT DEFAULT 0,

    share_count BIGINT DEFAULT 0,

    status SMALLINT DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL,

    expired_at TIMESTAMPTZ,

    deleted_at TIMESTAMPTZ,

    PRIMARY KEY(id, created_at)
)
PARTITION BY RANGE(created_at);
```

Indexes

```sql
CREATE INDEX idx_post_geohash
ON emotion_posts(geohash);

CREATE INDEX idx_post_created
ON emotion_posts(created_at DESC);

CREATE INDEX idx_post_location
ON emotion_posts
USING GIST(location);

CREATE INDEX idx_post_emotion
ON emotion_posts(emotion_category_id);
```

---

# emotion_post_tags

```sql
CREATE TABLE emotion_post_tags
(
    post_id BIGINT,

    tag_id INT,

    PRIMARY KEY(post_id, tag_id)
);
```

---

# reaction_types

```sql
CREATE TABLE reaction_types
(
    id SMALLSERIAL PRIMARY KEY,

    code VARCHAR(50),

    name VARCHAR(100)
);
```

---

# post_reactions

```sql
CREATE TABLE post_reactions
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL,

    device_id BIGINT NOT NULL,

    reaction_type_id SMALLINT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);
```

```sql
CREATE UNIQUE INDEX uq_post_device_reaction
ON post_reactions(post_id, device_id);
```

---

# post_attachments

```sql
CREATE TABLE post_attachments
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL,

    file_url TEXT NOT NULL,

    file_type VARCHAR(20),

    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

# ai_suggestions

```sql
CREATE TABLE ai_suggestions
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL,

    suggestion_type VARCHAR(50),

    content TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

# emotion_analysis

AI phân tích cảm xúc

```sql
CREATE TABLE emotion_analysis
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT NOT NULL,

    emotion_code VARCHAR(50),

    sub_emotion_code VARCHAR(50),

    confidence_score NUMERIC(5,4),

    sentiment_score NUMERIC(5,4),

    analyzed_at TIMESTAMPTZ
);
```

---

# emotion_embeddings

Metadata của Vector Search

```sql
CREATE TABLE emotion_embeddings
(
    post_id BIGINT PRIMARY KEY,

    embedding_model VARCHAR(100),

    vector_document_id VARCHAR(255),

    created_at TIMESTAMPTZ
);
```

---

# empathy_clusters

```sql
CREATE TABLE empathy_clusters
(
    id BIGSERIAL PRIMARY KEY,

    emotion_code VARCHAR(50),

    cluster_name VARCHAR(100),

    created_at TIMESTAMPTZ
);
```

---

# empathy_cluster_members

```sql
CREATE TABLE empathy_cluster_members
(
    cluster_id BIGINT,

    post_id BIGINT,

    similarity_score NUMERIC(10,4),

    PRIMARY KEY(cluster_id, post_id)
);
```

---

# recommended_posts

```sql
CREATE TABLE recommended_posts
(
    device_id BIGINT,

    post_id BIGINT,

    score NUMERIC(10,4),

    generated_at TIMESTAMPTZ,

    PRIMARY KEY(device_id, post_id)
);
```

---

# safety_incidents

```sql
CREATE TABLE safety_incidents
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT,

    risk_type VARCHAR(50),

    risk_level VARCHAR(20),

    confidence_score NUMERIC(5,4),

    action_status VARCHAR(50),

    created_at TIMESTAMPTZ
);
```

---

# emotion_statistics_daily

```sql
CREATE TABLE emotion_statistics_daily
(
    statistic_date DATE,

    region_code VARCHAR(50),

    emotion_code VARCHAR(50),

    total_posts BIGINT,

    percentage NUMERIC(5,2),

    PRIMARY KEY
    (
        statistic_date,
        region_code,
        emotion_code
    )
);
```

---

# device_push_tokens

```sql
CREATE TABLE device_push_tokens
(
    id BIGSERIAL PRIMARY KEY,

    device_id BIGINT,

    platform VARCHAR(20),

    push_token TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

# outbox_events

```sql
CREATE TABLE outbox_events
(
    id BIGSERIAL PRIMARY KEY,

    aggregate_type VARCHAR(50),

    aggregate_id BIGINT,

    event_type VARCHAR(100),

    payload JSONB,

    status SMALLINT DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT now(),

    published_at TIMESTAMPTZ
);
```

---

# 7. KAFKA TOPICS

```text
emotion.post.created

emotion.post.deleted

emotion.post.reacted

emotion.post.viewed

emotion.ai.requested

emotion.ai.completed

emotion.recommendation.requested

emotion.recommendation.completed

emotion.safety.detected

notification.send
```

---

# 8. REDIS DESIGN

Feed Cache

```text
feed:{geohash}
```

Ví dụ

```text
feed:w21z
```

---

Trending Feed

```text
trending:{geohash}
```

---

Notification Counter

```text
notification:{deviceId}
```

---

Online Devices

```text
online:{deviceId}
```

---

Rate Limit

```text
rate_limit:{deviceId}
```

---

# 9. ELASTICSEARCH INDEXES

## emotion-posts

```json
{
  "postId":1001,
  "content":"Tôi đang rất mệt mỏi",
  "emotion":"stress",
  "embedding":[...]
}
```

---

## emotion-clusters

```json
{
  "clusterId":1,
  "emotion":"stress",
  "posts":[]
}
```

---

# 10. CORE BUSINESS FLOWS

## Share Emotion

```text
Mobile App

    ↓

Emotion Service

    ↓

emotion_posts

    ↓

outbox_events

    ↓

Kafka

emotion.post.created
```

---

## AI Analysis

```text
emotion.post.created

    ↓

AI Worker

    ↓

OpenAI

    ↓

emotion_analysis

    ↓

emotion_embeddings
```

---

## Feed Generation

```text
emotion.post.created

    ↓

Feed Worker

    ↓

Redis Feed Cache
```

---

## Recommendation

```text
emotion_analysis

    ↓

Embedding

    ↓

Elasticsearch

    ↓

Recommendation Worker

    ↓

recommended_posts
```

---

## Empathy Matching

```text
Embedding

    ↓

Similarity Search

    ↓

Cluster Engine

    ↓

empathy_clusters
```

---

## Safety Detection

```text
emotion.post.created

    ↓

Safety AI

    ↓

safety_incidents

    ↓

Notification Service
```

---

## Nearby Notification

```text
emotion.post.created

    ↓

Notification Worker

    ↓

device_locations

    ↓

Push Notification

FCM/APNS
```

---

# 11. RETENTION POLICY

| Data | Retention |
|--------|--------|
| Emotion Post | 7 Days |
| Feed Cache | 24 Hours |
| Notification Cache | 30 Days |
| AI Suggestions | 90 Days |
| Analytics | Permanent |
| Safety Incidents | 3 Years |
| Outbox Events | 30 Days |

---

# 12. FINAL ERD

```text
devices
│
├── device_settings
├── notification_settings
├── device_locations
├── device_push_tokens
│
├── emotion_posts
│     │
│     ├── emotion_post_tags
│     │      │
│     │      └── emotion_tags
│     │
│     ├── post_reactions
│     │
│     ├── post_attachments
│     │
│     ├── ai_suggestions
│     │
│     ├── emotion_analysis
│     │
│     ├── emotion_embeddings
│     │
│     ├── empathy_cluster_members
│     │
│     └── safety_incidents
│
├── empathy_clusters
│
├── recommended_posts
│
├── emotion_statistics_daily
│
└── outbox_events
```

# 13. SCALE TARGET

```text
Users                 : 10M+

DAU                   : 1M+

Posts/Day             : 5M+

Reactions/Day         : 50M+

Notifications/Day     : 20M+

Kafka Events/Day      : 100M+

Vector Documents      : 1B+

Regions Supported     : Global
```