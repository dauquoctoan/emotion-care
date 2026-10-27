package com.emotioncare.api.domain.emotion.repository;

import com.emotioncare.api.domain.emotion.entity.EmotionPostEntity;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmotionPostRepository extends JpaRepository<EmotionPostEntity, UUID> {

  Page<EmotionPostEntity> findByStatusOrderByCreatedAtDesc(Short status, Pageable pageable);

  Page<EmotionPostEntity> findByEmotionCategoryIdAndStatusOrderByCreatedAtDesc(
      Short emotionCategoryId,
      Short status,
      Pageable pageable
  );

  Page<EmotionPostEntity> findByDeviceIdOrderByCreatedAtDesc(UUID deviceId, Pageable pageable);

  @Query("SELECT p FROM EmotionPostEntity p " +
         "JOIN p.postTags pt " +
         "WHERE pt.id.tagId = :tagId AND p.status = 1 " +
         "ORDER BY p.createdAt DESC")
  Page<EmotionPostEntity> findByTagIdAndActive(
      @Param("tagId") Integer tagId,
      Pageable pageable
  );
}
