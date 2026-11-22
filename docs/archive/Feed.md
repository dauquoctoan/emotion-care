# AI Caption Generator System Design

## 1. Tổng Quan

### Mục tiêu

Xây dựng hệ thống sinh Caption bằng AI dựa trên cảm xúc người dùng lựa chọn.

Hệ thống có khả năng:

* Sinh caption bằng AI
* Lưu caption vào Elasticsearch Vector Database
* Tìm kiếm caption tương tự bằng Semantic Search
* Sinh caption mới dựa trên các caption đã tồn tại
* Tránh trùng lặp nội dung
* Hỗ trợ nhiều ngôn ngữ

Ví dụ:

Người dùng chọn:

```json
{
    "emotion": "sad",
    "language": "vi"
}
```

Kết quả:

```text
Người đi rồi, ký ức vẫn ở lại.
```

---

# 2. Functional Requirements

## FR01 - Generate Caption

Người dùng chọn:

* Emotion
* Language
* Number of captions

Hệ thống sinh caption bằng AI.

---

## FR02 - Search Caption

Tìm caption theo:

* Keyword
* Emotion
* Sub Emotion

---

## FR03 - Similar Caption

Tìm caption tương tự bằng Vector Search.

---

## FR04 - Trending Caption

Lấy caption phổ biến nhất.

---

## FR05 - Regenerate Caption

Sinh caption mới dựa trên:

* Emotion
* Caption đã có

---

## FR06 - Multi Language

Hỗ trợ:

* Vietnamese
* English
* Korean
* Japanese

---

# 3. Emotion Taxonomy

Không nên chỉ lưu emotion đơn giản.

## Emotion Tree

```text
Sad
 ├─ Breakup
 ├─ Loneliness
 ├─ Missing
 └─ Depression

Happy
 ├─ Success
 ├─ Friendship
 └─ Family

Love
 ├─ Crush
 ├─ Couple
 └─ Marriage

Excited
 ├─ Travel
 ├─ New Job
 └─ Achievement

Motivation
 ├─ Career
 ├─ Business
 └─ Study
```

---

# 4. High Level Architecture

```text
                +-------------+
                |  Frontend   |
                +------+------+
                       |
                       v
                +-------------+
                | API Gateway |
                +------+------+
                       |
     +-----------------+------------------+
     |                 |                  |
     v                 v                  v

+------------+  +------------+   +------------+
| CaptionSvc |  | SearchSvc  |   | AdminSvc   |
+-----+------+  +------+-----+   +------------+
      |                |
      |                |
      v                v

+-------------+  +--------------+
| AI Service  |  | ES Service   |
+------+------+  +------+-------+
       |                |
       |                |
       v                v

+--------------+  +----------------+
| OpenAI LLM   |  | Elasticsearch  |
+--------------+  +----------------+

         |
         v

+----------------+
| Embedding API  |
+----------------+

         |
         v

+----------------+
| Kafka Queue    |
+----------------+

         |
         v

+----------------+
| EmbeddingWorker|
+----------------+

         |
         v

+----------------+
| Elasticsearch  |
+----------------+
```

---

# 5. Generate Caption Flow

## Step 1

User Request

```json
{
  "emotion":"sad",
  "subEmotion":"breakup",
  "language":"vi",
  "count":20
}
```

---

## Step 2

AI Prompt

```text
Generate 20 Vietnamese captions.

Emotion:
Sad

Sub Emotion:
Breakup

Rules:
- Emotional
- Short
- Social Media Style
- Maximum 30 words
- Unique
```

---

## Step 3

AI Generate

```text
Người đi rồi, ký ức vẫn ở lại.

Có những chuyện chỉ nên giữ trong lòng.

Đêm dài nhất là đêm còn nhớ một người.
```

---

## Step 4

Publish Event

```json
{
  "event":"CAPTION_GENERATED",
  "captionId":"123"
}
```

Kafka Topic:

```text
caption-generated
```

---

## Step 5

Embedding Worker

Lấy caption vừa sinh.

Gọi Embedding API.

---

## Step 6

Generate Vector

```json
[
  0.123,
  -0.452,
  0.881,
  ...
]
```

Dimension:

```text
1536
```

---

## Step 7

Save Elasticsearch

```json
{
  "id":"123",
  "caption":"Người đi rồi, ký ức vẫn ở lại.",
  "emotion":"sad",
  "subEmotion":"breakup",
  "vector":[...]
}
```

---

# 6. Database Design

## PostgreSQL

### caption

```sql
CREATE TABLE captions
(
    id UUID PRIMARY KEY,

    emotion VARCHAR(50),

    sub_emotion VARCHAR(50),

    language VARCHAR(10),

    caption TEXT,

    likes BIGINT DEFAULT 0,

    views BIGINT DEFAULT 0,

    generated_by VARCHAR(50),

    created_at TIMESTAMP,

    updated_at TIMESTAMP
);
```

---

### caption_tags

```sql
CREATE TABLE caption_tags
(
    caption_id UUID,

    tag VARCHAR(100)
);
```

---

### emotions

```sql
CREATE TABLE emotions
(
    id UUID PRIMARY KEY,

    emotion_name VARCHAR(100),

    parent_id UUID
);
```

---

# 7. Elasticsearch Design

## Index

```text
caption_index
```

---

## Mapping

```json
PUT caption_index
{
  "mappings": {
    "properties": {

      "id":{
        "type":"keyword"
      },

      "caption":{
        "type":"text"
      },

      "emotion":{
        "type":"keyword"
      },

      "subEmotion":{
        "type":"keyword"
      },

      "language":{
        "type":"keyword"
      },

      "vector":{
        "type":"dense_vector",
        "dims":1536,
        "index":true,
        "similarity":"cosine"
      },

      "createdAt":{
        "type":"date"
      }
    }
  }
}
```

---

# 8. Semantic Search Flow

## User Query

```json
{
    "emotion":"sad"
}
```

---

## Create Search Embedding

```text
sad heartbreak loneliness
```

---

## Generate Vector

```json
[
  0.11,
  0.24,
  ...
]
```

---

## KNN Search

```json
POST caption_index/_search
{
  "knn": {
    "field": "vector",
    "query_vector": [...],
    "k": 20,
    "num_candidates": 100
  }
}
```

---

## Return Similar Captions

```text
Người đi rồi, ký ức vẫn ở lại.

Im lặng cũng là một câu trả lời.

Có những nỗi buồn chẳng thể gọi tên.
```

---

# 9. RAG Caption Generation

Thay vì sinh caption hoàn toàn mới.

Sử dụng:

* Emotion
* Similar Captions

làm Context.

---

## Prompt

```text
Emotion:
Sad

Reference Captions:

1. Người đi rồi, ký ức vẫn ở lại.

2. Có những chuyện chỉ nên giữ trong lòng.

3. Im lặng cũng là một câu trả lời.

Generate 10 completely new captions.

Do not duplicate.
```

---

## Result

```text
Đêm dài nhất là đêm còn nhớ một người.

Cơn mưa nào rồi cũng tạnh, chỉ có nỗi nhớ là ở lại.
```

---

# 10. API Design

## Generate Caption

```http
POST /api/captions/generate
```

Request

```json
{
  "emotion":"sad",
  "subEmotion":"breakup",
  "count":20
}
```

---

## Search Caption

```http
POST /api/captions/search
```

Request

```json
{
  "keyword":"chia tay"
}
```

---

## Similar Caption

```http
GET /api/captions/{id}/similar
```

---

## Trending Caption

```http
GET /api/captions/trending
```

---

## Like Caption

```http
POST /api/captions/{id}/like
```

---

# 11. Kafka Design

## Topics

### caption-generated

```json
{
  "captionId":"123"
}
```

---

### embedding-created

```json
{
  "captionId":"123",
  "status":"SUCCESS"
}
```

---

# 12. Redis Design

Cache:

```text
trending captions

popular captions

emotion captions
```

Key

```text
caption:trending

caption:sad

caption:happy
```

TTL

```text
30 minutes
```

---

# 13. Scalability

## Stateless Services

* Caption Service
* Search Service
* AI Service

Có thể scale ngang bằng Kubernetes.

---

## Elasticsearch

Deployment:

```text
3 Master Nodes

5 Data Nodes
```

---

## Kafka

```text
3 Brokers

Replication Factor = 3
```

---

## PostgreSQL

```text
Primary

Read Replica
```

---

# 14. Future Enhancements

## AI Caption Personalization

Dựa trên:

* User History
* User Preference
* User Favorite Emotion

Sinh caption cá nhân hóa.

---

## Multi Modal Caption

Input:

* Text
* Image

Output:

* Caption

---

## Caption Recommendation

Gợi ý caption phù hợp với:

* Ảnh
* Bài đăng
* Cảm xúc hiện tại

---

# 15. Technology Stack

## Backend

```text
Java Spring Boot
```

hoặc

```text
ASP.NET Core
```

---

## Database

```text
PostgreSQL
```

---

## Cache

```text
Redis
```

---

## Message Queue

```text
Kafka
```

---

## Vector Database

```text
Elasticsearch
```

---

## AI

```text
OpenAI GPT

OpenAI Embedding
```

---

# 16. Kết Luận

Kiến trúc này kết hợp:

* AI Generation
* RAG
* Elasticsearch Vector Search
* Kafka Event Driven Architecture
* PostgreSQL Metadata Storage

giúp hệ thống:

* Sinh caption chất lượng cao
* Tránh trùng lặp
* Tìm kiếm ngữ nghĩa nhanh
* Mở rộng dễ dàng tới hàng triệu caption
* Hỗ trợ cá nhân hóa trong tương lai
  .
