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
@Table(name = "ai_suggestions")
public class AiSuggestionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "post_id", nullable = false)
  private UUID postId;

  @Column(name = "suggestion_type", nullable = false, length = 50)
  private String suggestionType; // Gentle, Direct, Expressive

  @Column(name = "content", nullable = false, columnDefinition = "text")
  private String content;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", insertable = false, updatable = false)
  private EmotionPostEntity post;
}
