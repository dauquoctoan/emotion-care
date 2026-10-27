package com.emotioncare.api.domain.reaction.entity;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
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
import jakarta.persistence.UniqueConstraint;
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
@Table(
    name = "post_reactions",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_post_device_reaction",
        columnNames = {"post_id", "device_id"}
    )
)
public class PostReactionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "post_id", nullable = false)
  private UUID postId;

  @Column(name = "device_id", nullable = false)
  private UUID deviceId;

  @Column(name = "reaction_type_id", nullable = false)
  private Short reactionTypeId;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", insertable = false, updatable = false)
  private EmotionPostEntity post;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "device_id", insertable = false, updatable = false)
  private DeviceEntity device;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reaction_type_id", insertable = false, updatable = false)
  private ReactionTypeEntity reactionType;
}
