# Emotion Care Platform

# High Level Architecture (HLD)

## Version 2.0

---

# 1. Architecture Goals

Emotion Care được thiết kế theo mô hình:

```text
Event Driven Architecture (EDA)

+

Microservices Architecture

+

AI Native Platform
```

Mục tiêu:

* Scale 10M+ users
* High Availability
* Fault Tolerance
* AI-First Design
* Near Realtime Analytics
* Global Deployment Ready

---

# 2. Architecture Principles

## Domain Driven Design

Chia hệ thống thành các domain độc lập:

```text
Emotion Domain

Location Domain

Notification Domain

AI Domain

Recommendation Domain

Analytics Domain

Safety Domain
```

---

## Event Driven

Mọi hành động quan trọng đều phát sinh Event.

Ví dụ:

```text
Post Created

Reaction Created

Location Updated

AI Analysis Completed

Safety Incident Detected
```

---

## CQRS Lite

Tách:

```text
Write Model

và

Read Model
```

Ví dụ:

```text
PostgreSQL
=
Write Database

Redis
=
Read Database
```

---

# 3. System Landscape

```text
┌─────────────────────────────────────────┐
│               Mobile App                │
└─────────────────────────────────────────┘
                    │
                    ▼

┌─────────────────────────────────────────┐
│              API Gateway                │
└─────────────────────────────────────────┘
                    │
 ┌──────────────────┼──────────────────┐
 │                  │                  │
 ▼                  ▼                  ▼

Emotion Service   AI Service   Notification Service

Recommendation Service

Analytics Service

Safety Service

                    │
                    ▼

┌─────────────────────────────────────────┐
│                 Kafka                   │
└─────────────────────────────────────────┘

                    │

 ┌─────────────┬─────────────┬─────────────┐
 │             │             │             │

Feed Worker  AI Worker  Analytics Worker  Notification Worker

Recommendation Worker

Moderation Worker

                    │

 ┌─────────────┬─────────────┬─────────────┐
 │             │             │             │

PostgreSQL    Redis     Elasticsearch   Object Storage
```

---

# 4. API Gateway

## Responsibilities

Gateway là entry point duy nhất.

Chức năng:

```text
Authentication

Rate Limiting

Request Validation

Routing

Observability

API Versioning
```

---

## Suggested Technologies

```text
Kong

Traefik

NGINX

YARP (.NET)
```

---

# 5. Emotion Service

## Responsibilities

Quản lý:

```text
Emotion Post

Emotion Tag

Reaction

Attachment
```

---

## APIs

```http
POST /api/v1/posts

GET /api/v1/posts

GET /api/v1/feed

POST /api/v1/posts/{id}/react
```

---

## Database

```text
emotion_posts

emotion_tags

emotion_post_tags

post_reactions

post_attachments
```

---

## Kafka Events Published

```text
emotion.post.created

emotion.post.updated

emotion.post.deleted

emotion.post.reacted
```

---

# 6. Location Service

## Responsibilities

Quản lý:

```text
Current Device Location

Nearby Search

GeoHash Calculation

Distance Calculation
```

---

## APIs

```http
PUT /api/v1/location

GET /api/v1/location/nearby
```

---

## Database

```text
device_locations
```

---

## Redis

```text
location:{deviceId}
```

---

# 7. AI Service

## Responsibilities

Thực hiện:

```text
Emotion Classification

Sentiment Analysis

Embedding Generation

AI Suggestions

AI Coaching
```

---

## AI Pipeline

```text
Raw Emotion Text

↓

Prompt Builder

↓

OpenAI / Gemini

↓

Emotion Analysis

↓

Embedding Generation

↓

Store Result
```

---

## Database

```text
emotion_analysis

ai_suggestions

emotion_embeddings
```

---

## Kafka Events

Subscribe:

```text
emotion.post.created
```

Publish:

```text
emotion.ai.completed
```

---

# 8. Recommendation Service

## Responsibilities

Sinh danh sách:

```text
Similar Posts

Recommended Posts

Empathy Matching

Community Suggestions
```

---

## Inputs

```text
Emotion Embedding

Location

Emotion Category

Historical Behavior
```

---

## Data Sources

```text
Elasticsearch

Redis

PostgreSQL
```

---

## Database

```text
recommended_posts

empathy_clusters

empathy_cluster_members
```

---

# 9. Notification Service

## Responsibilities

Gửi:

```text
Push Notification

AI Reminder

Reaction Alert

Nearby Emotion Alert

Safety Alert
```

---

## External Systems

```text
Firebase Cloud Messaging

Apple Push Notification Service
```

---

## Database

```text
device_push_tokens

notification_settings
```

---

## Kafka Subscribe

```text
emotion.post.created

emotion.post.reacted

emotion.ai.completed

emotion.safety.detected
```

---

# 10. Safety Service

## Responsibilities

Phát hiện:

```text
Self Harm

Suicide Signals

Violence

Depression

Mental Crisis
```

---

## Workflow

```text
Post Created

↓

AI Risk Detection

↓

Safety Incident

↓

Notification

↓

Escalation
```

---

## Database

```text
safety_incidents
```

---

## Kafka Events

Publish

```text
emotion.safety.detected
```

---

# 11. Analytics Service

## Responsibilities

Xây dựng:

```text
Heatmap

Emotion Trend

Region Trend

Time Trend

Dashboard
```

---

## Data Source

```text
Kafka Events
```

---

## Output

```text
Daily Aggregation

Realtime Dashboard

Community Statistics
```

---

## Database

```text
emotion_statistics_daily
```

---

# 12. Feed Worker

## Responsibilities

Build Feed Cache.

---

## Workflow

```text
emotion.post.created

↓

Kafka

↓

Feed Worker

↓

GeoHash Expansion

↓

Redis Feed Cache
```

---

## Redis Structure

```text
feed:{geohash}
```

Ví dụ:

```text
feed:w21z
```

---

# 13. AI Worker

## Responsibilities

Xử lý AI bất đồng bộ.

---

## Workflow

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

# 14. Recommendation Worker

## Responsibilities

Sinh recommendation.

---

## Workflow

```text
emotion.ai.completed

↓

Embedding Search

↓

Similarity Ranking

↓

recommended_posts
```

---

# 15. Analytics Worker

## Responsibilities

Tổng hợp dữ liệu.

---

## Workflow

```text
Kafka Events

↓

Aggregation

↓

emotion_statistics_daily
```

---

# 16. Notification Worker

## Responsibilities

Push Notification.

---

## Workflow

```text
Kafka Event

↓

Find Devices

↓

Create Notification

↓

FCM/APNS
```

---

# 17. Data Layer Architecture

## PostgreSQL

Source Of Truth

```text
Posts

Settings

Analysis Metadata

Recommendations

Statistics
```

---

## Redis

Hot Data

```text
Feed

Counters

Online Users

Rate Limits
```

---

## Elasticsearch

Search Layer

```text
Semantic Search

Vector Search

Similarity Search

Recommendation Search
```

---

## Object Storage

Lưu:

```text
Images

Audio

Videos
```

Ví dụ:

```text
AWS S3

MinIO

Azure Blob Storage
```

---

# 18. Kafka Architecture

## Topics

```text
emotion.post.created

emotion.post.updated

emotion.post.deleted

emotion.post.reacted

emotion.ai.completed

emotion.safety.detected

notification.send
```

---

## Partition Strategy

### emotion.post.created

```text
Partitions: 24

Key: geohash
```

---

### emotion.post.reacted

```text
Partitions: 12

Key: postId
```

---

### notification.send

```text
Partitions: 24

Key: deviceId
```

---

# 19. Scalability Strategy

## Horizontal Scaling

```text
Emotion Service

AI Service

Notification Service

Analytics Service
```

Scale độc lập.

---

## Database Scaling

```text
PostgreSQL Primary

↓

Read Replicas

↓

Partitioning
```

---

## Redis Scaling

```text
Redis Cluster
```

---

## Kafka Scaling

```text
Multi Broker Cluster

3-5 Brokers
```

---

# 20. Observability

## Logging

```text
ELK Stack
```

---

## Metrics

```text
Prometheus

Grafana
```

---

## Distributed Tracing

```text
OpenTelemetry

Jaeger
```

---

# 21. Security Architecture

## Device Identity

```text
Anonymous Device Token
```

---

## Rate Limit

```text
Redis
```

---

## Abuse Protection

```text
Spam Detection

AI Moderation

Device Throttling
```

---

# 22. Disaster Recovery

## PostgreSQL

```text
Daily Backup

PITR
```

---

## Kafka

```text
Replication Factor = 3
```

---

## Redis

```text
Cluster Replication
```

---

# 23. Future Architecture

## Phase 2

```text
Voice Emotion Analysis

Image Emotion Analysis

Video Emotion Analysis
```

---

## Phase 3

```text
Emotion Knowledge Graph

Mental Wellness Copilot

Community AI Mentor
```

---

# 24. Final Architecture Summary

```text
Client Layer
    ↓
API Gateway
    ↓
Microservices Layer
    ↓
Kafka Event Bus
    ↓
Worker Layer
    ↓
Data Layer

PostgreSQL
Redis
Elasticsearch
Object Storage

    ↓

AI Layer

OpenAI
Gemini

    ↓

Observability Layer

Prometheus
Grafana
ELK
Jaeger
```
