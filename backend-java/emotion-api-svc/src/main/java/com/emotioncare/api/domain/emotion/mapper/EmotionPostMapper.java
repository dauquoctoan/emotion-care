package com.emotioncare.api.domain.emotion.mapper;

import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.dto.CreatePostRequest;
import com.emotioncare.api.domain.emotion.dto.PostResponse;
import com.emotioncare.api.domain.emotion.entity.EmotionPostEntity;
import java.util.List;
import java.util.Map;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {CategoryMapper.class})
public interface EmotionPostMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "status", constant = "1")
  @Mapping(target = "isAiAssisted", expression = "java(Boolean.TRUE.equals(req.getIsAiAssisted()))")
  @Mapping(target = "visibilityRadiusM", expression = "java(req.getVisibilityRadiusM() != null ? req.getVisibilityRadiusM() : 5000)")
  EmotionPostEntity toEntity(CreatePostRequest req);

  @Mapping(target = "emotionCategoryName", source = "emotionCategory.name")
  @Mapping(target = "emotionCategoryCode", source = "emotionCategory.code")
  PostResponse toResponse(EmotionPostEntity post);

  @Mapping(target = "id", source = "post.id")
  @Mapping(target = "deviceId", source = "post.deviceId")
  @Mapping(target = "emotionCategoryId", source = "post.emotionCategoryId")
  @Mapping(target = "emotionCategoryName", source = "post.emotionCategory.name")
  @Mapping(target = "emotionCategoryCode", source = "post.emotionCategory.code")
  @Mapping(target = "content", source = "post.content")
  @Mapping(target = "isAiAssisted", source = "post.isAiAssisted")
  @Mapping(target = "latitude", source = "post.latitude")
  @Mapping(target = "longitude", source = "post.longitude")
  @Mapping(target = "city", source = "post.city")
  @Mapping(target = "district", source = "post.district")
  @Mapping(target = "visibilityRadiusM", source = "post.visibilityRadiusM")
  @Mapping(target = "status", source = "post.status")
  @Mapping(target = "createdAt", source = "post.createdAt")
  @Mapping(target = "expiredAt", source = "post.expiredAt")
  @Mapping(target = "tags", source = "tags")
  @Mapping(target = "reactionCounts", source = "reactionCounts")
  @Mapping(target = "userReactionId", source = "userReactionId")
  PostResponse toResponse(
      EmotionPostEntity post,
      List<CategoryResponse.TagResponse> tags,
      Map<String, Long> reactionCounts,
      Short userReactionId
  );
}
