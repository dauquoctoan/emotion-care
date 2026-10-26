package com.emotioncare.api.domain.emotion.entity;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
@Table(name = "emotion_posts")
public class EmotionPostEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "device_id", nullable = false)
  private UUID deviceId;

  @Column(name = "emotion_category_id", nullable = false)
  private Short emotionCategoryId;

  @Column(name = "content", nullable = false, columnDefinition = "text")
  private String content;

  @Builder.Default
  @Column(name = "is_ai_assisted", nullable = false)
  private Boolean isAiAssisted = false;

  @Column(name = "latitude", precision = 10, scale = 7)
  private BigDecimal latitude;

  @Column(name = "longitude", precision = 10, scale = 7)
  private BigDecimal longitude;

  @Column(name = "city", length = 100)
  private String city;

  @Column(name = "district", length = 100)
  private String district;

  @Builder.Default
  @Column(name = "visibility_radius_m", nullable = false)
  private Integer visibilityRadiusM = 5000;

  @Builder.Default
  @Column(name = "status", nullable = false)
  private Short status = 1;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "expired_at")
  private Instant expiredAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "device_id", insertable = false, updatable = false)
  private DeviceEntity device;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "emotion_category_id", insertable = false, updatable = false)
  private EmotionCategoryEntity emotionCategory;

  @Builder.Default
  @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<EmotionPostTagEntity> postTags = new ArrayList<>();
}
