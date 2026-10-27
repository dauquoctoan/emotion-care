package com.emotioncare.api.domain.reaction.controller;

import com.emotioncare.api.domain.reaction.dto.CreateReactionRequest;
import com.emotioncare.api.domain.reaction.dto.ReactionResponse;
import com.emotioncare.api.domain.reaction.entity.ReactionTypeEntity;
import com.emotioncare.api.domain.reaction.service.ReactionService;
import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import com.emotioncare.core.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Post Reactions", description = "Endpoints for empathy reactions on emotion posts")
public class PostReactionController {

  private final ReactionService reactionService;

  @GetMapping("/reactions/types")
  @Operation(summary = "Get all available reaction types")
  public BaseResponse<List<ReactionTypeEntity>> getAllReactionTypes() {
    return BaseResponse.of(reactionService.getAllReactionTypes());
  }

  @PostMapping("/posts/{postId}/reactions")
  @Operation(summary = "Toggle empathy reaction on a post")
  public BaseResponse<ReactionResponse> reactToPost(
      @PathVariable UUID postId,
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId,
      @Valid @RequestBody CreateReactionRequest req
  ) {
    String currentDeviceId = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(reactionService.toggleReaction(currentDeviceId, postId, req.getReactionTypeId()));
  }
}
