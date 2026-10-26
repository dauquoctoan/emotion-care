package com.emotioncare.api.domain.notification.entity;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalTime;
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
@Table(name = "notification_settings")
public class NotificationSettingEntity {

  @Id
  @Column(name = "device_id")
  private UUID deviceId;

  @Builder.Default
  @Column(name = "nearby_post_enabled", nullable = false)
  private Boolean nearbyPostEnabled = true;

  @Builder.Default
  @Column(name = "reaction_enabled", nullable = false)
  private Boolean reactionEnabled = true;

  @Builder.Default
  @Column(name = "ai_reminder_enabled", nullable = false)
  private Boolean aiReminderEnabled = true;

  @Builder.Default
  @Column(name = "daily_checkin_enabled", nullable = false)
  private Boolean dailyCheckinEnabled = true;

  @Builder.Default
  @Column(name = "safety_alert_enabled", nullable = false)
  private Boolean safetyAlertEnabled = true;

  @Column(name = "quiet_hour_from")
  private LocalTime quietHourFrom;

  @Column(name = "quiet_hour_to")
  private LocalTime quietHourTo;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @OneToOne
  @MapsId
  @JoinColumn(name = "device_id")
  private DeviceEntity device;
}
