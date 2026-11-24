package com.emotioncare.api.domain.emotion.repository;

import com.emotioncare.api.domain.emotion.entity.SavedPostEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPostEntity, Long> {

  Page<SavedPostEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId, Pageable pageable);

  Optional<SavedPostEntity> findByDeviceIdAndPostId(UUID deviceId, UUID postId);

  boolean existsByDeviceIdAndPostId(UUID deviceId, UUID postId);

  void deleteByDeviceIdAndPostId(UUID deviceId, UUID postId);
}
