package com.emotioncare.api.domain.moderation.entity;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import jakarta.persistence.Column;
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
@Table(name = "posting_rate_limits")
public class PostingRateLimitEntity {

  @EmbeddedId
  private PostingRateLimitId id;

  @Builder.Default
  @Column(name = "post_count", nullable = false)
  private Integer postCount = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("deviceId")
  @JoinColumn(name = "device_id")
  private DeviceEntity device;
}
