package com.emotioncare.api.domain.reaction.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
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
public class CreateReactionRequest {

  @JsonProperty("post_id")
  private UUID postId;

  @NotNull(message = "reaction_type_id is required")
  @JsonProperty("reaction_type_id")
  private Short reactionTypeId;
}
