package com.emotioncare.api.domain.emotion.controller;

import com.emotioncare.api.domain.emotion.dto.CreatePostRequest;
import com.emotioncare.api.domain.emotion.dto.PostResponse;
import com.emotioncare.api.domain.emotion.service.EmotionPostService;
import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import com.emotioncare.core.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/posts", "/emotion-post"})
@RequiredArgsConstructor
@Tag(name = "Emotion Posts", description = "Endpoints for creating and browsing anonymous emotion posts")
public class EmotionPostController {

  private final EmotionPostService postService;

  @PostMapping
  @Operation(summary = "Create an anonymous emotion post with Transactional Outbox event")
  public BaseResponse<PostResponse> createPost(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId,
      @Valid @RequestBody CreatePostRequest req
  ) {
    String currentDeviceId = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(postService.createPost(currentDeviceId, req));
  }

  @GetMapping
  @Operation(summary = "Get paginated emotion feed (optionally filtered by category or tag)")
  public BaseResponse<List<PostResponse>> getFeed(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId,
      @RequestParam(value = "categoryId", required = false) Short categoryId,
      @RequestParam(value = "tagId", required = false) Integer tagId,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
  ) {
    String currentDeviceId = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    Page<PostResponse> page = postService.getFeed(currentDeviceId, categoryId, tagId, pageable);
    return BaseResponse.ofPage(page);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get emotion post detail by ID")
  public BaseResponse<PostResponse> getPostById(
      @PathVariable UUID id,
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId
  ) {
    String currentDeviceId = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(postService.getPostById(id, currentDeviceId));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete an emotion post (only owner device allowed)")
  public BaseResponse<Void> deletePost(
      @PathVariable UUID id,
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId
  ) {
    String currentDeviceId = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    postService.deletePost(id, currentDeviceId);
    return BaseResponse.ok();
  }
}
