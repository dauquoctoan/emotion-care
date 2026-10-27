package com.emotioncare.api.domain.device.repository;

import com.emotioncare.api.domain.device.entity.DeviceSettingEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceSettingRepository extends JpaRepository<DeviceSettingEntity, UUID> {
}
