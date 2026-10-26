package com.emotioncare.api.domain.emotion.repository;

import com.emotioncare.api.domain.emotion.entity.EmotionTagEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmotionTagRepository extends JpaRepository<EmotionTagEntity, Integer> {
  List<EmotionTagEntity> findByCategoryId(Short categoryId);
}
