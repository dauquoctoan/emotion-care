package com.emotioncare.api.domain.emotion.repository;

import com.emotioncare.api.domain.emotion.entity.EmotionPostTagEntity;
import com.emotioncare.api.domain.emotion.entity.EmotionPostTagId;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmotionPostTagRepository extends JpaRepository<EmotionPostTagEntity, EmotionPostTagId> {

  List<EmotionPostTagEntity> findByIdPostId(UUID postId);

  @Query("SELECT pt FROM EmotionPostTagEntity pt JOIN FETCH pt.tag WHERE pt.id.postId IN :postIds")
  List<EmotionPostTagEntity> findByPostIdInWithTags(@Param("postIds") Collection<UUID> postIds);
}
