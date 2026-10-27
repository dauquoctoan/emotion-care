package com.emotioncare.api.domain.device.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class UpdateDeviceSettingRequest {

  @JsonProperty("share_nearby")
  private Boolean shareNearby;

  @JsonProperty("receive_nearby")
  private Boolean receiveNearby;

  @JsonProperty("use_location")
  private Boolean useLocation;

  @JsonProperty("approximate_location")
  private Boolean approximateLocation;

  @JsonProperty("ai_suggestion_enabled")
  private Boolean aiSuggestionEnabled;

  @JsonProperty("low_pressure_mode")
  private Boolean lowPressureMode;
}
