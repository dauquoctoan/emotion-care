package com.emotioncare.api.domain.moderation.entity;

import com.emotioncare.api.domain.emotion.entity.EmotionPostEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "moderation_queue")
public class ModerationQueueEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "post_id", nullable = false)
  private UUID postId;

  @Column(name = "risk_score", precision = 5, scale = 2)
  private BigDecimal riskScore;

  @Column(name = "risk_type", length = 50)
  private String riskType; // SUICIDE, VIOLENCE, ABUSE, SPAM, SELF_HARM

  @Builder.Default
  @Column(name = "status", nullable = false, length = 50)
  private String status = "PENDING";

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", insertable = false, updatable = false)
  private EmotionPostEntity post;
}
