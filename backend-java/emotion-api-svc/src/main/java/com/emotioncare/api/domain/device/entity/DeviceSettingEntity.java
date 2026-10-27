package com.emotioncare.api.domain.device.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "device_settings")
public class DeviceSettingEntity {

  @Id
  @Column(name = "device_id")
  private UUID deviceId;

  @Builder.Default
  @Column(name = "share_nearby", nullable = false)
  private Boolean shareNearby = true;

  @Builder.Default
  @Column(name = "receive_nearby", nullable = false)
  private Boolean receiveNearby = true;

  @Builder.Default
  @Column(name = "use_location", nullable = false)
  private Boolean useLocation = true;

  @Builder.Default
  @Column(name = "approximate_location", nullable = false)
  private Boolean approximateLocation = true;

  @Builder.Default
  @Column(name = "ai_suggestion_enabled", nullable = false)
  private Boolean aiSuggestionEnabled = true;

  @Builder.Default
  @Column(name = "low_pressure_mode", nullable = false)
  private Boolean lowPressureMode = false;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @OneToOne
  @MapsId
  @JoinColumn(name = "device_id")
  private DeviceEntity device;
}
