package com.emotioncare.api.domain.emotion.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "emotion_post_tags")
public class EmotionPostTagEntity {

  @EmbeddedId
  private EmotionPostTagId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("postId")
  @JoinColumn(name = "post_id")
  private EmotionPostEntity post;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("tagId")
  @JoinColumn(name = "tag_id")
  private EmotionTagEntity tag;
}
