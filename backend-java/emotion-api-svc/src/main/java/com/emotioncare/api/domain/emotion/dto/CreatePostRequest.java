package com.emotioncare.api.domain.emotion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
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
public class CreatePostRequest {

  @JsonProperty("device_id")
  private String deviceId;

  @NotNull(message = "emotion_category_id is required")
  @JsonProperty("emotion_category_id")
  private Short emotionCategoryId;

  @NotBlank(message = "content must not be blank")
  @Size(max = 2000, message = "content cannot exceed 2000 characters")
  private String content;

  @JsonProperty("tag_ids")
  private List<Integer> tagIds;

  @Builder.Default
  @JsonProperty("is_ai_assisted")
  private Boolean isAiAssisted = false;

  private BigDecimal latitude;

  private BigDecimal longitude;

  private String city;

  private String district;

  @Builder.Default
  @JsonProperty("visibility_radius_m")
  private Integer visibilityRadiusM = 5000;

  private String code;
}
