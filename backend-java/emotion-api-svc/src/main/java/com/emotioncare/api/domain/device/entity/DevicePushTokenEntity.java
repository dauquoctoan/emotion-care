package com.emotioncare.api.domain.device.entity;

import com.emotioncare.core.audit.AuditTrail;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "device_push_tokens")
public class DevicePushTokenEntity extends AuditTrail {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "device_id", nullable = false)
  private UUID deviceId;

  @Column(name = "platform", nullable = false, length = 20)
  private String platform; // ANDROID, IOS

  @Column(name = "push_token", nullable = false, columnDefinition = "text")
  private String pushToken;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "device_id", insertable = false, updatable = false)
  private DeviceEntity device;
}
