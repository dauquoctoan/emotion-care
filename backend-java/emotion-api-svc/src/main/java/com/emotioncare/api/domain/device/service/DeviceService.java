package com.emotioncare.api.domain.device.service;

import com.emotioncare.api.domain.device.dto.DeviceResponse;
import com.emotioncare.api.domain.device.dto.RegisterPushTokenRequest;
import com.emotioncare.api.domain.device.dto.UpdateDeviceSettingRequest;
import com.emotioncare.api.domain.device.entity.DeviceEntity;
import com.emotioncare.api.domain.device.entity.DevicePushTokenEntity;
import com.emotioncare.api.domain.device.entity.DeviceSettingEntity;
import com.emotioncare.api.domain.device.mapper.DeviceMapper;
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
  private final DeviceMapper deviceMapper;

  @Transactional
  public void registerPushToken(String deviceToken, RegisterPushTokenRequest req) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID is required to register push token");
    }
    DeviceEntity device = getOrCreateDevice(deviceToken);
    String platform = StringUtils.defaultIfBlank(req.getPlatform(), "UNKNOWN").toUpperCase();

    Optional<DevicePushTokenEntity> existing = pushTokenRepository
        .findByDeviceIdAndPushToken(device.getId(), req.getPushToken());

    if (existing.isPresent()) {
      DevicePushTokenEntity token = existing.get();
      token.setIsActive(true);
      token.setPlatform(platform);
      pushTokenRepository.save(token);
    } else {
      DevicePushTokenEntity token = DevicePushTokenEntity.builder()
          .deviceId(device.getId())
          .platform(platform)
          .pushToken(req.getPushToken())
          .isActive(true)
          .build();
      pushTokenRepository.save(token);
    }
    log.info("Registered push token for device [{}] (platform: {})", device.getId(), platform);
  }

  public Optional<DeviceEntity> findOne(String deviceTokenOrId) {
    if (StringUtils.isBlank(deviceTokenOrId)) {
      return Optional.empty();
    }
    String val = deviceTokenOrId.trim();
    Optional<DeviceEntity> byToken = deviceRepository.findByDeviceToken(val);
    if (byToken.isPresent()) {
      return byToken;
    }
    try {
      UUID id = UUID.fromString(val);
      return deviceRepository.findById(id);
    } catch (IllegalArgumentException e) {
      return Optional.empty();
    }
  }

  @Transactional
  public DeviceEntity getOrCreateDevice(String deviceTokenOrId) {
    if (StringUtils.isBlank(deviceTokenOrId)) {
      throw new BadRequestException("Device ID is required");
    }
    return findOne(deviceTokenOrId)
        .orElseGet(() -> {
          DeviceEntity newDevice = DeviceEntity.builder()
              .deviceToken(deviceTokenOrId.trim())
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
  }

  @Transactional
  public DeviceResponse getDeviceInfo(String deviceToken) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID (token) is required");
    }

    DeviceEntity device = getOrCreateDevice(deviceToken);
    device.setLastActiveAt(Instant.now());
    return deviceMapper.toResponse(device);
  }

  @Transactional
  public DeviceResponse.DeviceSettingResponse updateSetting(String deviceToken, UpdateDeviceSettingRequest req) {
    if (StringUtils.isBlank(deviceToken)) {
      throw new BadRequestException("Device ID (token) is required");
    }

    DeviceEntity dev = getOrCreateDevice(deviceToken);

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

    deviceMapper.updateSettingFromDto(req, setting);
    DeviceSettingEntity updated = deviceSettingRepository.save(setting);
    return deviceMapper.toSettingResponse(updated);
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
