package com.emotioncare.api.domain.emotion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;
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
@Embeddable
public class EmotionPostTagId implements Serializable {

  @Column(name = "post_id")
  private UUID postId;

  @Column(name = "tag_id")
  private Integer tagId;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    EmotionPostTagId that = (EmotionPostTagId) o;
    return Objects.equals(postId, that.postId) && Objects.equals(tagId, that.tagId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(postId, tagId);
  }
}
