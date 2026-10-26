package com.emotioncare.api.domain.emotion.service;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import com.emotioncare.api.domain.device.service.DeviceService;
import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.dto.CreatePostRequest;
import com.emotioncare.api.domain.emotion.dto.PostResponse;
import com.emotioncare.api.domain.emotion.entity.EmotionCategoryEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionPostEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionPostTagEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionPostTagId;
import com.emotioncare.api.domain.emotion.entity.EmotionTagEntity;
import com.emotioncare.api.domain.emotion.repository.EmotionCategoryRepository;
import com.emotioncare.api.domain.emotion.repository.EmotionPostRepository;
import com.emotioncare.api.domain.emotion.repository.EmotionPostTagRepository;
import com.emotioncare.api.domain.emotion.repository.EmotionTagRepository;
import com.emotioncare.api.domain.outbox.entity.OutboxEventEntity;
import com.emotioncare.api.domain.outbox.repository.OutboxEventRepository;
import com.emotioncare.api.domain.reaction.entity.PostReactionEntity;
import com.emotioncare.api.domain.reaction.repository.PostReactionRepository;
import com.emotioncare.core.exception.BadRequestException;
import com.emotioncare.core.exception.ResourceNotFoundException;
import com.emotioncare.core.security.SecurityUtils;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionPostService {

  private final EmotionPostRepository postRepository;
  private final EmotionCategoryRepository categoryRepository;
  private final EmotionTagRepository tagRepository;
  private final EmotionPostTagRepository postTagRepository;
  private final DeviceService deviceService;
  private final OutboxEventRepository outboxEventRepository;
  private final PostReactionRepository postReactionRepository;

  @Transactional
  public PostResponse createPost(String explicitDeviceToken, CreatePostRequest req) {
    String token = StringUtils.isNotBlank(explicitDeviceToken) ? explicitDeviceToken
        : (StringUtils.isNotBlank(req.getDeviceId()) ? req.getDeviceId()
            : SecurityUtils.getCurrentDeviceIdString().orElse(null));

    if (StringUtils.isBlank(token)) {
      throw new BadRequestException("Device ID is required to create an emotion post");
    }

    DeviceEntity device = deviceService.findOne(token)
        .orElseThrow(() -> new ResourceNotFoundException("Device not found with token: " + token));

    EmotionCategoryEntity category = categoryRepository.findById(req.getEmotionCategoryId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Emotion category not found with ID: " + req.getEmotionCategoryId()));

    // 1. Build & save post entity (mapping device.getId() matching personal-status-be)
    EmotionPostEntity post = EmotionPostEntity.builder()
        .deviceId(device.getId())
        .emotionCategoryId(category.getId())
        .content(req.getContent())
        .isAiAssisted(Boolean.TRUE.equals(req.getIsAiAssisted()))
        .latitude(req.getLatitude())
        .longitude(req.getLongitude())
        .city(req.getCity())
        .district(req.getDistrict())
        .visibilityRadiusM(req.getVisibilityRadiusM() != null ? req.getVisibilityRadiusM() : 5000)
        .status((short) 1)
        .expiredAt(Instant.now().plus(7, ChronoUnit.DAYS))
        .build();

    EmotionPostEntity savedPost = postRepository.save(post);

    // 2. Attach tags if provided
    List<CategoryResponse.TagResponse> attachedTags = new ArrayList<>();
    if (req.getTagIds() != null && !req.getTagIds().isEmpty()) {
      List<EmotionTagEntity> tags = tagRepository.findAllById(req.getTagIds());
      for (EmotionTagEntity tag : tags) {
        EmotionPostTagEntity postTag = EmotionPostTagEntity.builder()
            .id(new EmotionPostTagId(savedPost.getId(), tag.getId()))
            .post(savedPost)
            .tag(tag)
            .build();
        postTagRepository.save(postTag);
        attachedTags.add(CategoryResponse.TagResponse.builder()
            .id(tag.getId())
            .name(tag.getName())
            .icon(tag.getIcon())
            .subIcon(tag.getSubIcon())
            .build());
      }
    }

    // 3. Atomically write outbox event (Transactional Outbox Pattern)
    Map<String, Object> payload = new HashMap<>();
    payload.put("postId", savedPost.getId().toString());
    payload.put("deviceId", device.getId().toString());
    payload.put("categoryId", category.getId());
    payload.put("categoryCode", category.getCode());
    payload.put("content", savedPost.getContent());
    payload.put("isAiAssisted", savedPost.getIsAiAssisted());
    payload.put("createdAt", savedPost.getCreatedAt() != null ? savedPost.getCreatedAt().toString() : Instant.now().toString());

    OutboxEventEntity outboxEvent = OutboxEventEntity.builder()
        .aggregateType("POST")
        .aggregateId(savedPost.getId().toString())
        .eventType("POST_CREATED")
        .idempotencyKey("POST:" + savedPost.getId() + ":POST_CREATED")
        .payload(payload)
        .status("pending")
        .build();

    outboxEventRepository.save(outboxEvent);

    log.info("Created emotion post {} with outbox event {}", savedPost.getId(), outboxEvent.getIdempotencyKey());

    return PostResponse.builder()
        .id(savedPost.getId())
        .deviceId(savedPost.getDeviceId())
        .emotionCategoryId(category.getId())
        .emotionCategoryName(category.getName())
        .emotionCategoryCode(category.getCode())
        .content(savedPost.getContent())
        .isAiAssisted(savedPost.getIsAiAssisted())
        .latitude(savedPost.getLatitude())
        .longitude(savedPost.getLongitude())
        .city(savedPost.getCity())
        .district(savedPost.getDistrict())
        .visibilityRadiusM(savedPost.getVisibilityRadiusM())
        .status(savedPost.getStatus())
        .createdAt(savedPost.getCreatedAt() != null ? savedPost.getCreatedAt() : Instant.now())
        .expiredAt(savedPost.getExpiredAt())
        .tags(attachedTags)
        .reactionCounts(Collections.emptyMap())
        .build();
  }

  @Transactional(readOnly = true)
  public Page<PostResponse> getFeed(String callerDeviceToken, Short categoryId, Integer tagId, Pageable pageable) {
    Page<EmotionPostEntity> postsPage;
    if (tagId != null) {
      postsPage = postRepository.findByTagIdAndActive(tagId, pageable);
    } else if (categoryId != null) {
      postsPage = postRepository.findByEmotionCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, (short) 1, pageable);
    } else {
      postsPage = postRepository.findByStatusOrderByCreatedAtDesc((short) 1, pageable);
    }

    if (postsPage.isEmpty()) {
      return Page.empty(pageable);
    }

    List<UUID> postIds = postsPage.getContent().stream().map(EmotionPostEntity::getId).toList();

    // Batch load tags
    List<EmotionPostTagEntity> postTags = postTagRepository.findByPostIdInWithTags(postIds);
    Map<UUID, List<CategoryResponse.TagResponse>> tagsByPostId = new HashMap<>();
    for (EmotionPostTagEntity pt : postTags) {
      tagsByPostId.computeIfAbsent(pt.getId().getPostId(), k -> new ArrayList<>())
          .add(CategoryResponse.TagResponse.builder()
              .id(pt.getTag().getId())
              .name(pt.getTag().getName())
              .icon(pt.getTag().getIcon())
              .subIcon(pt.getTag().getSubIcon())
              .build());
    }

    // Batch load reactions count
    List<Object[]> reactionCountsRaw = postReactionRepository.countReactionsGroupedByPostIds(postIds);
    Map<UUID, Map<String, Long>> reactionCountsByPostId = new HashMap<>();
    for (Object[] row : reactionCountsRaw) {
      UUID pId = (UUID) row[0];
      Short rTypeId = (Short) row[1];
      Long count = (Long) row[2];
      reactionCountsByPostId.computeIfAbsent(pId, k -> new HashMap<>())
          .put(String.valueOf(rTypeId), count);
    }

    // Batch load caller's reactions
    Map<UUID, Short> userReactionByPostId = new HashMap<>();
    if (StringUtils.isNotBlank(callerDeviceToken)) {
      UUID callerDeviceId = deviceService.findOne(callerDeviceToken)
          .map(DeviceEntity::getId)
          .orElse(null);
      if (callerDeviceId != null) {
        List<PostReactionEntity> userReactions = postReactionRepository.findByPostIdInAndDeviceId(postIds, callerDeviceId);
        for (PostReactionEntity ur : userReactions) {
          userReactionByPostId.put(ur.getPostId(), ur.getReactionTypeId());
        }
      }
    }

    List<PostResponse> responses = postsPage.getContent().stream().map(post -> {
      EmotionCategoryEntity cat = post.getEmotionCategory();
      return PostResponse.builder()
          .id(post.getId())
          .deviceId(post.getDeviceId())
          .emotionCategoryId(post.getEmotionCategoryId())
          .emotionCategoryName(cat != null ? cat.getName() : null)
          .emotionCategoryCode(cat != null ? cat.getCode() : null)
          .content(post.getContent())
          .isAiAssisted(post.getIsAiAssisted())
          .latitude(post.getLatitude())
          .longitude(post.getLongitude())
          .city(post.getCity())
          .district(post.getDistrict())
          .visibilityRadiusM(post.getVisibilityRadiusM())
          .status(post.getStatus())
          .createdAt(post.getCreatedAt())
          .expiredAt(post.getExpiredAt())
          .tags(tagsByPostId.getOrDefault(post.getId(), Collections.emptyList()))
          .reactionCounts(reactionCountsByPostId.getOrDefault(post.getId(), Collections.emptyMap()))
          .userReactionId(userReactionByPostId.get(post.getId()))
          .build();
    }).collect(Collectors.toList());

    return new PageImpl<>(responses, pageable, postsPage.getTotalElements());
  }

  @Transactional(readOnly = true)
  public PostResponse getPostById(UUID postId, String callerDeviceToken) {
    EmotionPostEntity post = postRepository.findById(postId)
        .orElseThrow(() -> new ResourceNotFoundException("Emotion post not found with ID: " + postId));

    List<EmotionPostTagEntity> postTags = postTagRepository.findByIdPostId(postId);
    List<CategoryResponse.TagResponse> tags = postTags.stream()
        .map(pt -> CategoryResponse.TagResponse.builder()
            .id(pt.getTag().getId())
            .name(pt.getTag().getName())
            .icon(pt.getTag().getIcon())
            .subIcon(pt.getTag().getSubIcon())
            .build())
        .toList();

    List<Object[]> countRows = postReactionRepository.countReactionsGroupByTypeId(postId);
    Map<String, Long> reactionCounts = new HashMap<>();
    for (Object[] row : countRows) {
      Short rTypeId = (Short) row[0];
      Long count = (Long) row[1];
      reactionCounts.put(String.valueOf(rTypeId), count);
    }

    Short userReactionId = null;
    if (StringUtils.isNotBlank(callerDeviceToken)) {
      UUID callerDeviceId = deviceService.findOne(callerDeviceToken)
          .map(DeviceEntity::getId)
          .orElse(null);
      if (callerDeviceId != null) {
        userReactionId = postReactionRepository.findByPostIdAndDeviceId(postId, callerDeviceId)
            .map(PostReactionEntity::getReactionTypeId)
            .orElse(null);
      }
    }

    EmotionCategoryEntity cat = post.getEmotionCategory();
    return PostResponse.builder()
        .id(post.getId())
        .deviceId(post.getDeviceId())
        .emotionCategoryId(post.getEmotionCategoryId())
        .emotionCategoryName(cat != null ? cat.getName() : null)
        .emotionCategoryCode(cat != null ? cat.getCode() : null)
        .content(post.getContent())
        .isAiAssisted(post.getIsAiAssisted())
        .latitude(post.getLatitude())
        .longitude(post.getLongitude())
        .city(post.getCity())
        .district(post.getDistrict())
        .visibilityRadiusM(post.getVisibilityRadiusM())
        .status(post.getStatus())
        .createdAt(post.getCreatedAt())
        .expiredAt(post.getExpiredAt())
        .tags(tags)
        .reactionCounts(reactionCounts)
        .userReactionId(userReactionId)
        .build();
  }

  @Transactional
  public void deletePost(UUID postId, String callerDeviceToken) {
    EmotionPostEntity post = postRepository.findById(postId)
        .orElseThrow(() -> new ResourceNotFoundException("Emotion post not found with ID: " + postId));

    DeviceEntity device = deviceService.findOne(callerDeviceToken)
        .orElseThrow(() -> new ResourceNotFoundException("Device not found with token: " + callerDeviceToken));

    if (!post.getDeviceId().equals(device.getId())) {
      throw new BadRequestException("You are not authorized to delete this post");
    }

    post.setStatus((short) 0);
    postRepository.save(post);
  }
}
