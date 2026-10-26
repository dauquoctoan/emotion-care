package com.emotioncare.api.domain.reaction.repository;

import com.emotioncare.api.domain.reaction.entity.ReactionTypeEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReactionTypeRepository extends JpaRepository<ReactionTypeEntity, Short> {
  Optional<ReactionTypeEntity> findByCode(String code);
}
