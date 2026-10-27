package com.emotioncare.api.domain.device.mapper;

import com.emotioncare.api.domain.device.dto.DeviceResponse;
import com.emotioncare.api.domain.device.dto.UpdateDeviceSettingRequest;
import com.emotioncare.api.domain.device.entity.DeviceEntity;
import com.emotioncare.api.domain.device.entity.DeviceSettingEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DeviceMapper {

  DeviceResponse toResponse(DeviceEntity entity);

  @Mapping(target = "deviceId", expression = "java(entity.getDeviceId() != null ? entity.getDeviceId() : (entity.getDevice() != null ? entity.getDevice().getId() : null))")
  DeviceResponse.DeviceSettingResponse toSettingResponse(DeviceSettingEntity entity);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateSettingFromDto(UpdateDeviceSettingRequest req, @MappingTarget DeviceSettingEntity entity);
}
