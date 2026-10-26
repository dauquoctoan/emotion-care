package com.emotioncare.api.domain.device.repository;

import com.emotioncare.api.domain.device.entity.DevicePushTokenEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevicePushTokenRepository extends JpaRepository<DevicePushTokenEntity, UUID> {
  List<DevicePushTokenEntity> findByDeviceIdAndIsActiveTrue(UUID deviceId);
}
