package com.emotioncare.api.domain.reaction.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionResponse {

  @JsonProperty("post_id")
  private UUID postId;

  @JsonProperty("reaction_type_id")
  private Short reactionTypeId;

  @JsonProperty("action")
  private String action; // ADDED, REMOVED, UPDATED

  @JsonProperty("total_reactions")
  private Long totalReactions;
}
