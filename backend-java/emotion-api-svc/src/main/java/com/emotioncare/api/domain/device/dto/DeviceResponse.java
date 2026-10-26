package com.emotioncare.api.domain.device.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
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
public class DeviceResponse {

  private UUID id;

  @JsonProperty("device_token")
  private String deviceToken;

  @JsonProperty("created_at")
  private Instant createdAt;

  @JsonProperty("last_active_at")
  private Instant lastActiveAt;

  private DeviceSettingResponse setting;

  @Getter
  @Setter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DeviceSettingResponse {
    @JsonProperty("device_id")
    private UUID deviceId;

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

    @JsonProperty("updated_at")
    private Instant updatedAt;
  }
}
