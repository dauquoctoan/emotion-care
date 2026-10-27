package com.emotioncare.api.domain.device.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
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
public class RegisterPushTokenRequest {

  @NotBlank(message = "push_token is required")
  @JsonProperty("push_token")
  private String pushToken;

  private String platform;
}
