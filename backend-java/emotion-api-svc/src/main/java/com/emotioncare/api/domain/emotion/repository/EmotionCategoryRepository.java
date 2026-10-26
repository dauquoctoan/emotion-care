package com.emotioncare.api.domain.emotion.repository;

import com.emotioncare.api.domain.emotion.entity.EmotionCategoryEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmotionCategoryRepository extends JpaRepository<EmotionCategoryEntity, Short> {
  Optional<EmotionCategoryEntity> findByCode(String code);

  @Query("SELECT DISTINCT c FROM EmotionCategoryEntity c LEFT JOIN FETCH c.tags t ORDER BY c.displayOrder ASC, t.id ASC")
  List<EmotionCategoryEntity> findAllWithTagsOrderByDisplayOrderAsc();

  List<EmotionCategoryEntity> findAllByOrderByDisplayOrderAsc();
}
