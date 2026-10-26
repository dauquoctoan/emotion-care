package com.emotioncare.api.domain.reaction.repository;

import com.emotioncare.api.domain.reaction.entity.PostReactionEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReactionEntity, Long> {

  Optional<PostReactionEntity> findByPostIdAndDeviceId(UUID postId, UUID deviceId);

  boolean existsByPostIdAndDeviceId(UUID postId, UUID deviceId);

  long countByPostId(UUID postId);

  long countByPostIdAndReactionTypeId(UUID postId, Short reactionTypeId);

  void deleteByPostIdAndDeviceId(UUID postId, UUID deviceId);

  @Query("SELECT r.reactionTypeId, COUNT(r) FROM PostReactionEntity r WHERE r.postId = :postId GROUP BY r.reactionTypeId")
  List<Object[]> countReactionsGroupByTypeId(@Param("postId") UUID postId);

  @Query("SELECT r.postId, r.reactionTypeId, COUNT(r) FROM PostReactionEntity r WHERE r.postId IN :postIds GROUP BY r.postId, r.reactionTypeId")
  List<Object[]> countReactionsGroupedByPostIds(@Param("postIds") Collection<UUID> postIds);

  List<PostReactionEntity> findByPostIdInAndDeviceId(Collection<UUID> postIds, UUID deviceId);
}
