package com.emotioncare.api.domain.emotion.service;

import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.entity.EmotionCategoryEntity;
import com.emotioncare.api.domain.emotion.mapper.CategoryMapper;
import com.emotioncare.api.domain.emotion.repository.EmotionCategoryRepository;
import com.emotioncare.core.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

  private final EmotionCategoryRepository categoryRepository;
  private final CategoryMapper categoryMapper;

  public List<CategoryResponse> getAllCategories() {
    return categoryMapper.toResponseList(categoryRepository.findAllWithTagsOrderByDisplayOrderAsc());
  }

  public CategoryResponse getCategoryById(Short id) {
    EmotionCategoryEntity category = categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Emotion category not found with id: " + id));
    return categoryMapper.toResponse(category);
  }
}
