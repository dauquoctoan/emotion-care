package com.emotioncare.api.domain.reaction.service;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import com.emotioncare.api.domain.device.service.DeviceService;
import com.emotioncare.api.domain.emotion.entity.EmotionPostEntity;
import com.emotioncare.api.domain.emotion.repository.EmotionPostRepository;
import com.emotioncare.api.domain.outbox.entity.OutboxEventEntity;
import com.emotioncare.api.domain.outbox.repository.OutboxEventRepository;
import com.emotioncare.api.domain.reaction.dto.ReactionResponse;
import com.emotioncare.api.domain.reaction.entity.PostReactionEntity;
import com.emotioncare.api.domain.reaction.entity.ReactionTypeEntity;
import com.emotioncare.api.domain.reaction.repository.PostReactionRepository;
import com.emotioncare.api.domain.reaction.repository.ReactionTypeRepository;
import com.emotioncare.core.exception.BadRequestException;
import com.emotioncare.core.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReactionService {

  private final PostReactionRepository reactionRepository;
  private final ReactionTypeRepository reactionTypeRepository;
  private final EmotionPostRepository postRepository;
  private final OutboxEventRepository outboxEventRepository;
  private final DeviceService deviceService;

  public List<ReactionTypeEntity> getAllReactionTypes() {
    return reactionTypeRepository.findAll();
  }

  @Transactional
  public ReactionResponse toggleReaction(String deviceToken, UUID postId, Short reactionTypeId) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID is required to react to a post");
    }

    DeviceEntity device = deviceService.findOne(deviceToken)
        .orElseThrow(() -> new ResourceNotFoundException("Device not found with token: " + deviceToken));
    UUID resolvedDeviceId = device.getId();

    EmotionPostEntity post = postRepository.findById(postId)
        .orElseThrow(() -> new ResourceNotFoundException("Emotion post not found with ID: " + postId));

    ReactionTypeEntity reactionType = reactionTypeRepository.findById(reactionTypeId)
        .orElseThrow(() -> new ResourceNotFoundException("Reaction type not found with ID: " + reactionTypeId));

    Optional<PostReactionEntity> existingOpt = reactionRepository.findByPostIdAndDeviceId(postId, resolvedDeviceId);
    String action;
    Short finalReactionTypeId;

    if (existingOpt.isPresent()) {
      PostReactionEntity existing = existingOpt.get();
      if (existing.getReactionTypeId().equals(reactionTypeId)) {
        // Toggle OFF
        reactionRepository.delete(existing);
        action = "REMOVED";
        finalReactionTypeId = null;
      } else {
        // Change reaction type
        existing.setReactionTypeId(reactionTypeId);
        reactionRepository.save(existing);
        action = "UPDATED";
        finalReactionTypeId = reactionTypeId;
      }
    } else {
      // Add new reaction
      PostReactionEntity newReaction = PostReactionEntity.builder()
          .postId(postId)
          .deviceId(resolvedDeviceId)
          .reactionTypeId(reactionTypeId)
          .build();
      reactionRepository.save(newReaction);
      action = "ADDED";
      finalReactionTypeId = reactionTypeId;
    }

    // Record Transactional Outbox Event for notification worker / analytics
    Map<String, Object> payload = new HashMap<>();
    payload.put("postId", postId.toString());
    payload.put("postAuthorDeviceId", post.getDeviceId().toString());
    payload.put("actorDeviceId", resolvedDeviceId.toString());
    payload.put("reactionTypeId", reactionTypeId);
    payload.put("reactionTypeName", reactionType.getName());
    payload.put("action", action);
    payload.put("timestamp", Instant.now().toString());

    OutboxEventEntity outboxEvent = OutboxEventEntity.builder()
        .aggregateType("POST_REACTION")
        .aggregateId(postId.toString())
        .eventType("REACTION_" + action)
        .idempotencyKey("REACTION:" + postId + ":" + resolvedDeviceId + ":" + action + ":" + System.currentTimeMillis())
        .payload(payload)
        .status("pending")
        .build();

    outboxEventRepository.save(outboxEvent);

    long totalReactions = reactionRepository.countByPostId(postId);

    return ReactionResponse.builder()
        .postId(postId)
        .reactionTypeId(finalReactionTypeId)
        .action(action)
        .totalReactions(totalReactions)
        .build();
  }
}
