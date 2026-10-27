package com.emotioncare.api.domain.reaction.mapper;

import com.emotioncare.api.domain.reaction.dto.ReactionResponse;
import java.util.UUID;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReactionMapper {

  default ReactionResponse toResponse(UUID postId, Short reactionTypeId, String action, Long totalReactions) {
    return ReactionResponse.builder()
        .postId(postId)
        .reactionTypeId(reactionTypeId)
        .action(action)
        .totalReactions(totalReactions)
        .build();
  }
}
