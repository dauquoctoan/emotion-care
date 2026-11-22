# Emotion Care Platform

## AI-Powered Emotional Intelligence Platform

Version: 3.0

Author: Solution Architecture Design

---

# 1. Product Vision

## Bài toán

Hiện nay phần lớn mạng xã hội được thiết kế để chia sẻ:

* Thành công
* Hạnh phúc
* Thành tích
* Hình ảnh đẹp

Nhưng rất ít nơi cho phép mọi người chia sẻ:

* Nỗi buồn
* Áp lực
* Lo âu
* Cô đơn
* Mất phương hướng

một cách an toàn và ẩn danh.

Nhiều người không biết cách diễn đạt cảm xúc của mình.

Nhiều người muốn được lắng nghe nhưng không muốn lộ danh tính.

---

## Tầm nhìn sản phẩm

Emotion Care là nền tảng hỗ trợ sức khỏe tinh thần cộng đồng.

Mục tiêu:

* Giúp người dùng diễn đạt cảm xúc
* Giúp người dùng tìm thấy sự đồng cảm
* Giúp cộng đồng hỗ trợ lẫn nhau
* Sử dụng AI để hiểu cảm xúc con người

---

# 2. Giá Trị Cốt Lõi

Emotion Care không phải Social Network.

Emotion Care cũng không phải ChatGPT.

Emotion Care là:

```text
Human Emotion + AI Intelligence
```

---

## Value 1

Emotion Expression

Giúp người dùng diễn đạt cảm xúc.

---

## Value 2

Emotion Discovery

Khám phá những người có cảm xúc tương tự.

---

## Value 3

Emotion Support

Nhận được sự đồng cảm từ cộng đồng.

---

## Value 4

Emotion Insight

Hiểu chính cảm xúc của mình.

---

# 3. Core User Journey

## Bước 1

Người dùng mở ứng dụng.

---

## Bước 2

Chọn cảm xúc.

Ví dụ:

```text
Sad
Stress
Lonely
Happy
Excited
Love
```

---

## Bước 3

Người dùng nhập:

```text
Hôm nay mình cảm thấy rất mệt mỏi.
```

---

## Bước 4

AI phân tích.

```text
Emotion:
Stress

Confidence:
92%
```

---

## Bước 5

AI đề xuất cách diễn đạt.

Ví dụ:

```text
Đôi khi áp lực không đến từ công việc,
mà đến từ việc phải mạnh mẽ quá lâu.
```

---

## Bước 6

Người dùng đăng bài.

---

## Bước 7

AI tìm các bài viết tương đồng.

---

## Bước 8

Người dùng nhận được:

* Empathy
* Support
* Suggestion

---

# 4. AI Domain Model

## Emotion Classification

Xác định cảm xúc.

Ví dụ:

```text
Input

"Mình vừa chia tay."
```

Output

```json
{
  "emotion":"sad",
  "subEmotion":"breakup",
  "score":0.96
}
```

---

## Emotion Caption Generator

Sinh caption.

Ví dụ:

Input:

```text
sad + breakup
```

Output:

```text
Người đi rồi,
ký ức vẫn chọn ở lại.
```

---

## Emotion Embedding

Mọi nội dung đều được chuyển thành vector.

Ví dụ:

```text
"Mình vừa chia tay"

↓

[0.123,0.543,0.912,...]
```

---

## Similar Emotion Search

Tìm những bài viết có cảm xúc tương tự.

Không tìm theo từ khóa.

Tìm theo ngữ nghĩa.

---

## Risk Detection

Phát hiện dấu hiệu nguy hiểm.

Ví dụ:

```text
Tôi muốn biến mất.
```

AI trả về:

```json
{
  "risk":"HIGH",
  "score":0.98
}
```

---

# 5. AI Modules

## Module 1

Emotion Analysis Engine

Trách nhiệm:

* Emotion Classification
* Emotion Score
* Sentiment Analysis

---

## Module 2

Caption Generation Engine

Trách nhiệm:

* Sinh caption
* Rewrite nội dung
* Gợi ý cách diễn đạt

---

## Module 3

Emotion Similarity Engine

Trách nhiệm:

* Tìm bài viết tương tự
* Tìm cộng đồng đồng cảm

---

## Module 4

Recommendation Engine

Trách nhiệm:

* Gợi ý bài viết
* Gợi ý cảm xúc liên quan

---

## Module 5

Safety Engine

Trách nhiệm:

* Self-harm Detection
* Depression Detection
* Crisis Detection

---

# 6. Emotion Vector Architecture

Đây là thành phần quan trọng nhất.

---

## Tại sao cần Vector Database

Keyword Search:

```text
chia tay
```

chỉ tìm được:

```text
chia tay
```

---

Vector Search:

```text
chia tay
```

có thể tìm được:

```text
người rời đi

mối quan hệ kết thúc

cô đơn sau tình yêu
```

---

## Elasticsearch

Index:

```text
emotion_vector_index
```

---

Document

```json
{
  "postId":"1001",
  "emotion":"sad",
  "subEmotion":"breakup",
  "content":"Mình vừa chia tay.",
  "vector":[...]
}
```

---

# 7. AI Caption Knowledge Base

Thay vì mỗi lần gọi AI đều sinh mới.

Hệ thống lưu:

```text
Millions of captions
```

trong Elasticsearch.

---

Flow

```text
Emotion

↓

Vector Search

↓

Top Similar Captions

↓

Prompt Context

↓

LLM

↓

New Caption
```

---

Đây chính là mô hình RAG.

---

# 8. Anonymous Empathy Matching

Tính năng khác biệt nhất.

---

Ví dụ

User A:

```text
Mình vừa mất việc.
```

User B:

```text
Tôi cũng đang thất nghiệp.
```

---

AI nhận diện:

```text
Same Emotional Context
```

---

Hệ thống gợi ý:

```text
Bạn không cô đơn.
Có 53 người khác
đang trải qua cảm xúc tương tự.
```

---

# 9. Community Emotion Heatmap

Tổng hợp toàn bộ dữ liệu cảm xúc.

Ví dụ:

```text
Hà Nội

Stress: 40%

Sad: 25%

Happy: 20%

Other: 15%
```

---

Hiển thị:

* Theo thành phố
* Theo quận huyện
* Theo thời gian

---

# 10. Event Driven Architecture

## Topic

```text
emotion.post.created

emotion.analysis.completed

emotion.embedding.created

emotion.caption.generated

emotion.risk.detected

emotion.recommendation.generated
```

---

# 11. Data Flow

User Create Post

↓

Emotion Service

↓

PostgreSQL

↓

Outbox

↓

Kafka

↓

AI Worker

↓

Emotion Analysis

↓

Embedding Generation

↓

Caption Generation

↓

Elasticsearch

↓

Recommendation

↓

Notification

---

# 12. Future Roadmap

Phase 1

* Emotion Sharing
* AI Caption
* Emotion Search

---

Phase 2

* Empathy Matching
* Emotion Feed
* Emotion Heatmap

---

Phase 3

* AI Mental Health Assistant
* AI Daily Journal
* AI Emotion Coach

---

# 13. Competitive Advantage

Emotion Care khác mạng xã hội truyền thống ở chỗ:

* Không tập trung vào người nổi tiếng
* Không tập trung vào follower
* Không tập trung vào quảng cáo

Mà tập trung vào:

```text
Emotion Understanding

Emotion Support

Emotion Intelligence
```

AI không chỉ tạo nội dung.

AI trở thành lớp "hiểu cảm xúc" của toàn bộ nền tảng.
