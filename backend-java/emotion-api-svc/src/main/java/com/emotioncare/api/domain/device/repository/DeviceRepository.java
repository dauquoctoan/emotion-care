package com.emotioncare.api.domain.device.repository;

import com.emotioncare.api.domain.device.entity.DeviceEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<DeviceEntity, UUID> {
  Optional<DeviceEntity> findByDeviceToken(String deviceToken);
  boolean existsByDeviceToken(String deviceToken);
}
