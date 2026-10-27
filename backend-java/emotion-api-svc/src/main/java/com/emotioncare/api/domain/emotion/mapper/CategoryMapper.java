package com.emotioncare.api.domain.emotion.mapper;

import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.entity.EmotionCategoryEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionTagEntity;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

  CategoryResponse toResponse(EmotionCategoryEntity entity);

  List<CategoryResponse> toResponseList(List<EmotionCategoryEntity> entities);

  CategoryResponse.TagResponse toTagResponse(EmotionTagEntity tag);

  List<CategoryResponse.TagResponse> toTagResponseList(List<EmotionTagEntity> tags);
}
