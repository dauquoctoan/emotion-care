# Emotion Care Platform

## System Design Document v1.0

---

# 1. Tổng Quan

Emotion Care là nền tảng chia sẻ cảm xúc ẩn danh theo vị trí địa lý.

Người dùng có thể:

* Chia sẻ cảm xúc mà không cần đăng ký tài khoản
* Xem các cảm xúc được chia sẻ gần vị trí hiện tại
* Thả reaction đồng cảm
* Nhận hỗ trợ từ cộng đồng
* Nhận gợi ý AI để diễn đạt cảm xúc
* Nhận thông báo liên quan đến cảm xúc và cộng đồng

---

# 2. Mục Tiêu Phi Chức Năng

## Scale

| Metric            | Target |
| ----------------- | ------ |
| Total Users       | 10M+   |
| DAU               | 1M+    |
| Posts/Day         | 5M+    |
| Reactions/Day     | 50M+   |
| Notifications/Day | 20M+   |

---

## SLA

| Component         | SLA      |
| ----------------- | -------- |
| Feed              | < 200 ms |
| Create Post       | < 500 ms |
| React Post        | < 100 ms |
| Push Notification | < 10 sec |

---

# 3. Kiến Trúc Tổng Thể

```text
+----------------------+
|     Mobile App       |
+----------+-----------+
           |
           v
+----------------------+
|     API Gateway      |
+----------+-----------+
           |
--------------------------------------------------
|                    Services                    |
--------------------------------------------------

+----------------------+
| Emotion Service      |
+----------------------+

+----------------------+
| AI Service           |
+----------------------+

+----------------------+
| Notification Service |
+----------------------+

           |
           v

+----------------------+
|        Kafka         |
+----------------------+

           |
--------------------------------------------------
|                    Workers                     |
--------------------------------------------------

Feed Worker

Notification Worker

AI Worker

Moderation Worker

           |
--------------------------------------------------
|                   Storage                      |
--------------------------------------------------

PostgreSQL
Redis
Object Storage
```

---

# 4. Trách Nhiệm Thành Phần

## PostgreSQL

Lưu dữ liệu nghiệp vụ.

```text
Devices
Posts
Tags
Reactions
AI Suggestions
Moderation
Settings
Outbox
```

---

## Redis

Lưu dữ liệu nóng.

```text
Feed Cache

Notification Counter

Trending Feed

Rate Limit

Online Devices
```

---

## Kafka

Event Streaming.

```text
emotion.post.created

emotion.post.reacted

emotion.post.deleted

notification.send

ai.generate

moderation.check
```

---

# 5. Database Design

---

# devices

```sql
CREATE TABLE devices
(
    id BIGSERIAL PRIMARY KEY,

    device_token VARCHAR(200) NOT NULL UNIQUE,

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

    name VARCHAR(50)
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

Indexes

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

    file_url TEXT,

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

# device_push_tokens

```sql
CREATE TABLE device_push_tokens
(
    id BIGSERIAL PRIMARY KEY,

    device_id BIGINT NOT NULL,

    platform VARCHAR(20),

    push_token TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

# moderation_cases

```sql
CREATE TABLE moderation_cases
(
    id BIGSERIAL PRIMARY KEY,

    post_id BIGINT,

    risk_type VARCHAR(50),

    risk_score NUMERIC(5,2),

    status VARCHAR(50),

    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

# posting_rate_limits

```sql
CREATE TABLE posting_rate_limits
(
    device_id BIGINT,

    post_date DATE,

    post_count INT,

    PRIMARY KEY(device_id, post_date)
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

# 6. Kafka Topics

```text
emotion.post.created

emotion.post.reacted

emotion.post.deleted

notification.send

notification.reaction

ai.generate

moderation.check
```

---

# 7. Redis Structure

Feed

```text
feed:{geohash}
```

Example

```text
feed:w21z
```

Value

```json
[
  10001,
  10002,
  10003
]
```

---

Notification Counter

```text
notification:{deviceId}
```

---

Trending Feed

```text
trending:{geohash}
```

---

Rate Limit

```text
rate_limit:{deviceId}
```

---

# 8. Core Queries

---

## Create Post

```sql
INSERT INTO emotion_posts
(
    device_id,
    emotion_category_id,
    content,
    geohash,
    location,
    created_at,
    expired_at
)
VALUES
(
    :deviceId,
    :emotionId,
    :content,
    :geohash,
    :location,
    now(),
    now() + interval '7 day'
);
```

---

## Create Outbox Event

```sql
INSERT INTO outbox_events
(
    aggregate_type,
    aggregate_id,
    event_type,
    payload
)
VALUES
(
    'POST',
    :postId,
    'POST_CREATED',
    :payload
);
```

---

## Feed Query

```sql
SELECT *
FROM emotion_posts
WHERE geohash IN (:cells)
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;
```

---

## Nearby Posts

```sql
SELECT
    id,
    content,
    ST_Distance(
        location,
        ST_MakePoint(
            :longitude,
            :latitude
        )::geography
    ) distance_m
FROM emotion_posts
WHERE ST_DWithin(
    location,
    ST_MakePoint(
        :longitude,
        :latitude
    )::geography,
    5000
)
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
```

---

## React Post

```sql
INSERT INTO post_reactions
(
    post_id,
    device_id,
    reaction_type_id
)
VALUES
(
    :postId,
    :deviceId,
    :reactionType
);
```

---

## Update Counter

```sql
UPDATE emotion_posts
SET
    reaction_count = reaction_count + 1,
    empathy_count = empathy_count + 1
WHERE id = :postId;
```

---

## Update Device Location

```sql
INSERT INTO device_locations
(
    device_id,
    geohash,
    location,
    updated_at
)
VALUES
(
    :deviceId,
    :geohash,
    :location,
    now()
)
ON CONFLICT(device_id)
DO UPDATE SET
    geohash = excluded.geohash,
    location = excluded.location,
    updated_at = now();
```

---

# 9. Luồng Nghiệp Vụ

## Chia Sẻ Cảm Xúc

```text
Mobile App

    ↓

Emotion Service

    ↓

PostgreSQL
(emotion_posts)

    ↓

PostgreSQL
(outbox_events)

    ↓

Outbox Publisher

    ↓

Kafka

emotion.post.created
```

---

## Build Feed

```text
emotion.post.created

    ↓

Feed Worker

    ↓

Redis

feed:{geohash}
```

---

## Notification Nearby

```text
emotion.post.created

    ↓

Notification Worker

    ↓

Tìm thiết bị gần đó

    ↓

Push Notification

FCM/APNS
```

---

## AI Suggestion

```text
emotion.post.created

    ↓

Kafka

ai.generate

    ↓

AI Worker

    ↓

OpenAI

    ↓

ai_suggestions
```

---

## Moderation

```text
emotion.post.created

    ↓

Kafka

moderation.check

    ↓

Moderation Worker

    ↓

moderation_cases
```

---

# 10. Data Retention

| Data                 | Retention |
| -------------------- | --------- |
| Emotion Post         | 7 ngày    |
| Notification Counter | Redis TTL |
| Feed Cache           | 24 giờ    |
| AI Suggestions       | 90 ngày   |
| Moderation Cases     | 180 ngày  |
| Outbox Events        | 30 ngày   |

---

# 11. Final ERD

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
│     └── ai_suggestions
│
├── moderation_cases
│
├── posting_rate_limits
│
└── outbox_events
```
