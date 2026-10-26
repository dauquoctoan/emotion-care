package com.emotioncare.api.domain.device.dto;

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
public class RegisterDeviceRequest {

  @NotBlank(message = "deviceToken is required")
  private String deviceToken;

  private String platform; // ANDROID, IOS

  private String pushToken;
}
