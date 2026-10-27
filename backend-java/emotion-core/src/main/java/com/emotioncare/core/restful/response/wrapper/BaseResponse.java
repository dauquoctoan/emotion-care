package com.emotioncare.core.restful.response.wrapper;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.springframework.data.domain.Page;

/**
 * Standard REST Response Wrapper for Emotion Care Platform.
 * Formatted cleanly for React Native Expo client consumption.
 *
 * @param <T> Payload data type
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BaseResponse<T> {

  @Builder.Default
  @JsonProperty("success")
  private Boolean success = true;

  @Builder.Default
  @JsonProperty("statusCode")
  private Integer statusCode = 200;

  private T data;

  @Builder.Default
  private Metadata metadata = new Metadata();

  public static <T> BaseResponse<T> of(T data) {
    BaseResponse<T> response = new BaseResponse<>();
    response.setSuccess(true);
    response.setStatusCode(200);
    response.setData(data);
    return response;
  }

  public static <T> BaseResponse<List<T>> ofPage(Page<T> page) {
    BaseResponse<List<T>> response = new BaseResponse<>();
    response.setSuccess(true);
    response.setStatusCode(200);
    response.setData(page.getContent());

    Metadata meta = new Metadata();
    meta.setPage(page.getNumber());
    meta.setSize(page.getSize());
    meta.setTotalPage(page.getTotalPages());
    meta.setTotalElements(page.getTotalElements());
    meta.setHasNextPage(page.hasNext());
    meta.setHasPreviousPage(page.hasPrevious());

    response.setMetadata(meta);
    return response;
  }

  public static BaseResponse<Void> ok() {
    BaseResponse<Void> response = new BaseResponse<>();
    response.setSuccess(true);
    response.setStatusCode(200);
    return response;
  }

  public static BaseResponse<Void> fail(String message) {
    BaseResponse<Void> response = new BaseResponse<>();
    response.setSuccess(false);
    response.setStatusCode(500);
    response.getMetadata().setMessage(message);
    response.getMetadata().setStatus("ERROR");
    return response;
  }

  public static BaseResponse<Void> fail(List<FieldViolation> errors) {
    BaseResponse<Void> response = new BaseResponse<>();
    response.setSuccess(false);
    response.setStatusCode(400);
    response.getMetadata().setErrors(errors != null ? errors : new ArrayList<>());
    response.getMetadata().setStatus("ERROR");
    return response;
  }
}
