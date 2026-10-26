package com.emotioncare.api.domain.emotion.service;

import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.entity.EmotionCategoryEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionTagEntity;
import com.emotioncare.api.domain.emotion.repository.EmotionCategoryRepository;
import com.emotioncare.core.exception.ResourceNotFoundException;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

  private final EmotionCategoryRepository categoryRepository;

  public List<CategoryResponse> getAllCategories() {
    List<EmotionCategoryEntity> categories = categoryRepository.findAllWithTagsOrderByDisplayOrderAsc();
    return categories.stream().map(this::mapToResponse).toList();
  }

  public CategoryResponse getCategoryById(Short id) {
    EmotionCategoryEntity category = categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Emotion category not found with id: " + id));
    return mapToResponse(category);
  }

  private CategoryResponse mapToResponse(EmotionCategoryEntity category) {
    List<CategoryResponse.TagResponse> tags = category.getTags() == null ? Collections.emptyList()
        : category.getTags().stream()
            .map(tag -> CategoryResponse.TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .icon(tag.getIcon())
                .subIcon(tag.getSubIcon())
                .build())
            .toList();

    return CategoryResponse.builder()
        .id(category.getId())
        .code(category.getCode())
        .name(category.getName())
        .icon(category.getIcon())
        .displayOrder(category.getDisplayOrder())
        .tags(tags)
        .build();
  }
}
