package com.emotioncare.api.domain.moderation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.LocalDate;
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
public class PostingRateLimitId implements Serializable {

  @Column(name = "device_id")
  private UUID deviceId;

  @Column(name = "post_date")
  private LocalDate postDate;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    PostingRateLimitId that = (PostingRateLimitId) o;
    return Objects.equals(deviceId, that.deviceId) && Objects.equals(postDate, that.postDate);
  }

  @Override
  public int hashCode() {
    return Objects.hash(deviceId, postDate);
  }
}
