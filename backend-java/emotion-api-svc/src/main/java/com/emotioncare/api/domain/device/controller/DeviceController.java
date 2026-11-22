package com.emotioncare.api.domain.device.controller;

import com.emotioncare.api.domain.device.dto.DeviceResponse;
import com.emotioncare.api.domain.device.dto.RegisterPushTokenRequest;
import com.emotioncare.api.domain.device.dto.UpdateDeviceSettingRequest;
import com.emotioncare.api.domain.device.service.DeviceService;
import com.emotioncare.core.restful.response.wrapper.BaseResponse;
import com.emotioncare.core.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
@Tag(name = "Device & Settings", description = "Endpoints for device metadata and privacy settings")
public class DeviceController {

  private final DeviceService deviceService;

  @GetMapping("/me")
  @Operation(summary = "Get current device info and settings")
  public BaseResponse<DeviceResponse> getCurrentDevice(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId
  ) {
    String deviceToken = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(deviceService.getDeviceInfo(deviceToken));
  }

  @PostMapping("/me")
  @Operation(summary = "Initialize / register current device")
  public BaseResponse<DeviceResponse> initCurrentDevice(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId
  ) {
    String deviceToken = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(deviceService.getDeviceInfo(deviceToken));
  }

  @PatchMapping("/me/settings")
  @Operation(summary = "Update device privacy and notification settings")
  public BaseResponse<DeviceResponse.DeviceSettingResponse> updateDeviceSetting(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId,
      @RequestBody UpdateDeviceSettingRequest req
  ) {
    String deviceToken = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    return BaseResponse.of(deviceService.updateSetting(deviceToken, req));
  }

  @PostMapping("/me/push-token")
  @Operation(summary = "Register Expo push notification token for device")
  public BaseResponse<Void> registerPushToken(
      @RequestHeader(value = "x-device-id", required = false) String headerDeviceId,
      @Valid @RequestBody RegisterPushTokenRequest req
  ) {
    String deviceToken = SecurityUtils.getCurrentDeviceIdString().orElse(headerDeviceId);
    deviceService.registerPushToken(deviceToken, req);
    return BaseResponse.ok();
  }
}
