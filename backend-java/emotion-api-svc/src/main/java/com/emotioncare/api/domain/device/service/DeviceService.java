package com.emotioncare.api.domain.device.service;

import com.emotioncare.api.domain.device.dto.AuthResponse;
import com.emotioncare.api.domain.device.dto.DeviceResponse;
import com.emotioncare.api.domain.device.dto.RegisterDeviceRequest;
import com.emotioncare.api.domain.device.dto.UpdateDeviceSettingRequest;
import com.emotioncare.api.domain.device.entity.DeviceEntity;
import com.emotioncare.api.domain.device.entity.DevicePushTokenEntity;
import com.emotioncare.api.domain.device.entity.DeviceSettingEntity;
import com.emotioncare.api.domain.device.repository.DevicePushTokenRepository;
import com.emotioncare.api.domain.device.repository.DeviceRepository;
import com.emotioncare.api.domain.device.repository.DeviceSettingRepository;
import com.emotioncare.core.exception.BadRequestException;
import com.emotioncare.core.security.JwtTokenProvider;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

  private final DeviceRepository deviceRepository;
  private final DeviceSettingRepository deviceSettingRepository;
  private final DevicePushTokenRepository pushTokenRepository;
  private final JwtTokenProvider jwtTokenProvider;

  @Transactional
  public AuthResponse authenticateDevice(RegisterDeviceRequest request) {
    Optional<DeviceEntity> existingDevice = deviceRepository.findByDeviceToken(request.getDeviceToken());

    DeviceEntity device;
    if (existingDevice.isPresent()) {
      device = existingDevice.get();
      device.setLastActiveAt(Instant.now());
    } else {
      device = DeviceEntity.builder()
          .deviceToken(request.getDeviceToken())
          .lastActiveAt(Instant.now())
          .build();

      DeviceSettingEntity setting = DeviceSettingEntity.builder()
          .device(device)
          .shareNearby(true)
          .receiveNearby(true)
          .useLocation(true)
          .approximateLocation(true)
          .aiSuggestionEnabled(true)
          .lowPressureMode(false)
          .build();

      device.setSetting(setting);
      device = deviceRepository.save(device);
      log.info("Registered new anonymous device [{}]", device.getId());
    }

    // Save/update push token if present
    if (StringUtils.isNotBlank(request.getPushToken())) {
      saveOrUpdatePushToken(device, request.getPlatform(), request.getPushToken());
    }

    String token = jwtTokenProvider.generateToken(device.getId().toString());

    return AuthResponse.builder()
        .deviceId(device.getId())
        .deviceToken(device.getDeviceToken())
        .token(token)
        .build();
  }

  public Optional<DeviceEntity> findOne(String deviceToken) {
    if (StringUtils.isBlank(deviceToken)) {
      return Optional.empty();
    }
    return deviceRepository.findByDeviceToken(deviceToken.trim());
  }

  @Transactional
  public DeviceResponse getDeviceInfo(String deviceToken) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID (token) is required");
    }

    DeviceEntity device = deviceRepository.findByDeviceToken(deviceToken.trim())
        .orElseGet(() -> {
          DeviceEntity newDevice = DeviceEntity.builder()
              .deviceToken(deviceToken.trim())
              .lastActiveAt(Instant.now())
              .build();

          DeviceSettingEntity setting = DeviceSettingEntity.builder()
              .device(newDevice)
              .shareNearby(true)
              .receiveNearby(true)
              .useLocation(true)
              .approximateLocation(true)
              .aiSuggestionEnabled(true)
              .lowPressureMode(false)
              .build();

          newDevice.setSetting(setting);
          return deviceRepository.save(newDevice);
        });

    device.setLastActiveAt(Instant.now());

    DeviceSettingEntity s = device.getSetting();
    DeviceResponse.DeviceSettingResponse settingResp = null;
    if (s != null) {
      settingResp = DeviceResponse.DeviceSettingResponse.builder()
          .deviceId(s.getDeviceId() != null ? s.getDeviceId() : device.getId())
          .shareNearby(s.getShareNearby())
          .receiveNearby(s.getReceiveNearby())
          .useLocation(s.getUseLocation())
          .approximateLocation(s.getApproximateLocation())
          .aiSuggestionEnabled(s.getAiSuggestionEnabled())
          .lowPressureMode(s.getLowPressureMode())
          .updatedAt(s.getUpdatedAt())
          .build();
    }

    return DeviceResponse.builder()
        .id(device.getId())
        .deviceToken(device.getDeviceToken())
        .createdAt(device.getCreatedAt())
        .lastActiveAt(device.getLastActiveAt())
        .setting(settingResp)
        .build();
  }

  @Transactional
  public DeviceResponse.DeviceSettingResponse updateSetting(String deviceToken, UpdateDeviceSettingRequest req) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID (token) is required");
    }

    DeviceEntity dev = deviceRepository.findByDeviceToken(deviceToken.trim())
        .orElseGet(() -> {
          DeviceEntity newDevice = DeviceEntity.builder()
              .deviceToken(deviceToken.trim())
              .lastActiveAt(Instant.now())
              .build();

          DeviceSettingEntity newSetting = DeviceSettingEntity.builder()
              .device(newDevice)
              .shareNearby(true)
              .receiveNearby(true)
              .useLocation(true)
              .approximateLocation(true)
              .aiSuggestionEnabled(true)
              .lowPressureMode(false)
              .build();
          newDevice.setSetting(newSetting);
          return deviceRepository.save(newDevice);
        });

    DeviceSettingEntity setting = dev.getSetting();
    if (setting == null) {
      setting = DeviceSettingEntity.builder()
          .device(dev)
          .deviceId(dev.getId())
          .shareNearby(true)
          .receiveNearby(true)
          .useLocation(true)
          .approximateLocation(true)
          .aiSuggestionEnabled(true)
          .lowPressureMode(false)
          .build();
      dev.setSetting(setting);
    }

    if (req.getShareNearby() != null) setting.setShareNearby(req.getShareNearby());
    if (req.getReceiveNearby() != null) setting.setReceiveNearby(req.getReceiveNearby());
    if (req.getUseLocation() != null) setting.setUseLocation(req.getUseLocation());
    if (req.getApproximateLocation() != null) setting.setApproximateLocation(req.getApproximateLocation());
    if (req.getAiSuggestionEnabled() != null) setting.setAiSuggestionEnabled(req.getAiSuggestionEnabled());
    if (req.getLowPressureMode() != null) setting.setLowPressureMode(req.getLowPressureMode());

    DeviceSettingEntity updated = deviceSettingRepository.save(setting);

    return DeviceResponse.DeviceSettingResponse.builder()
        .deviceId(updated.getDeviceId() != null ? updated.getDeviceId() : dev.getId())
        .shareNearby(updated.getShareNearby())
        .receiveNearby(updated.getReceiveNearby())
        .useLocation(updated.getUseLocation())
        .approximateLocation(updated.getApproximateLocation())
        .aiSuggestionEnabled(updated.getAiSuggestionEnabled())
        .lowPressureMode(updated.getLowPressureMode())
        .updatedAt(updated.getUpdatedAt())
        .build();
  }

  private void saveOrUpdatePushToken(DeviceEntity device, String platform, String pushToken) {
    DevicePushTokenEntity tokenEntity = DevicePushTokenEntity.builder()
        .deviceId(device.getId())
        .platform(StringUtils.defaultIfBlank(platform, "UNKNOWN"))
        .pushToken(pushToken)
        .isActive(true)
        .build();
    pushTokenRepository.save(tokenEntity);
  }
}
