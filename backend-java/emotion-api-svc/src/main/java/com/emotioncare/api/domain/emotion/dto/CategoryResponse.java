package com.emotioncare.api.domain.emotion.dto;

import com.emotioncare.api.domain.emotion.entity.EmotionTagEntity.IconSnapshot;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
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
public class CategoryResponse {
  private Short id;
  private String code;
  private String name;
  private String icon;

  @JsonProperty("display_order")
  private Integer displayOrder;

  private List<TagResponse> tags;

  @Getter
  @Setter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TagResponse {
    private Integer id;
    private String name;
    private IconSnapshot icon;

    @JsonProperty("sub_icon")
    private IconSnapshot subIcon;
  }
}
