package com.emotioncare.api.domain.emotion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
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
public class PostResponse {

  private UUID id;

  @JsonProperty("device_id")
  private UUID deviceId;

  @JsonProperty("emotion_category_id")
  private Short emotionCategoryId;

  @JsonProperty("emotion_category_name")
  private String emotionCategoryName;

  @JsonProperty("emotion_category_code")
  private String emotionCategoryCode;

  private String content;

  @JsonProperty("author_alias")
  private String authorAlias;

  @JsonProperty("style_type")
  private String styleType;

  @JsonProperty("atmosphere")
  private String atmosphere;

  @JsonProperty("copy_count")
  private Integer copyCount;

  @JsonProperty("viral_score")
  private BigDecimal viralScore;

  @JsonProperty("is_ai_assisted")
  private Boolean isAiAssisted;

  private BigDecimal latitude;

  private BigDecimal longitude;

  private String city;

  private String district;

  @JsonProperty("visibility_radius_m")
  private Integer visibilityRadiusM;

  private Short status;

  @JsonProperty("created_at")
  private Instant createdAt;

  @JsonProperty("expired_at")
  private Instant expiredAt;

  private List<CategoryResponse.TagResponse> tags;

  @JsonProperty("reaction_counts")
  private Map<String, Long> reactionCounts;

  @JsonProperty("user_reaction_id")
  private Short userReactionId;
}
