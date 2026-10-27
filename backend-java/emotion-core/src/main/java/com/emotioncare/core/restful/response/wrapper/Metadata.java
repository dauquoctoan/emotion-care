package com.emotioncare.core.restful.response.wrapper;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Metadata {

  @Builder.Default
  private String status = "SUCCESS";

  private String message;

  private Integer page;

  private Integer size;

  private Integer totalPage;

  private Long totalElements;

  private Boolean hasNextPage;

  private Boolean hasPreviousPage;

  private List<FieldViolation> errors;
}
