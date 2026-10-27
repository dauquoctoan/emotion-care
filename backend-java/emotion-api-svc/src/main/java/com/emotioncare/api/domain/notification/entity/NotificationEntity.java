package com.emotioncare.api.domain.notification.entity;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
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
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class NotificationEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "device_id", nullable = false)
  private UUID deviceId;

  @Column(name = "template_code", length = 100)
  private String templateCode;

  @Column(name = "title", length = 200)
  private String title;

  @Column(name = "body", columnDefinition = "text")
  private String body;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payload", columnDefinition = "jsonb")
  private Map<String, Object> payload;

  @Builder.Default
  @Column(name = "status", nullable = false)
  private Short status = 0; // 0=Pending, 1=Sent, 2=Read, 3=Failed

  @Column(name = "sent_at")
  private Instant sentAt;

  @Column(name = "read_at")
  private Instant readAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "device_id", insertable = false, updatable = false)
  private DeviceEntity device;
}
