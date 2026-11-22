package com.emotioncare.api.domain.reaction.controller;

import com.emotioncare.api.domain.reaction.entity.ReactionTypeEntity;
import com.emotioncare.api.domain.reaction.service.ReactionService;
import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reactions")
@RequiredArgsConstructor
@Tag(name = "Reaction Types", description = "Endpoints for browsing empathy and reaction master data")
public class ReactionTypeController {

  private final ReactionService reactionService;

  @GetMapping("/types")
  @Operation(summary = "Get all available reaction types")
  public BaseResponse<List<ReactionTypeEntity>> getAllReactionTypes() {
    return BaseResponse.of(reactionService.getAllReactionTypes());
  }
}
