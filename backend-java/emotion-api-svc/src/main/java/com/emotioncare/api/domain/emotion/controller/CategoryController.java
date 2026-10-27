package com.emotioncare.api.domain.emotion.controller;

import com.emotioncare.api.domain.emotion.dto.CategoryResponse;
import com.emotioncare.api.domain.emotion.service.CategoryService;
import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Emotion Categories", description = "Endpoints for browsing emotion categories and tags")
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  @Operation(summary = "Get all emotion categories with nested tags")
  public BaseResponse<List<CategoryResponse>> getAllCategories() {
    return BaseResponse.of(categoryService.getAllCategories());
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get emotion category by ID")
  public BaseResponse<CategoryResponse> getCategoryById(@PathVariable Short id) {
    return BaseResponse.of(categoryService.getCategoryById(id));
  }
}
