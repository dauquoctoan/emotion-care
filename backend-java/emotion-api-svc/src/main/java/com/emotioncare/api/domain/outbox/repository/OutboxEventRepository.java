package com.emotioncare.api.domain.outbox.repository;

import com.emotioncare.api.domain.outbox.entity.OutboxEventEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEventEntity, UUID> {

  List<OutboxEventEntity> findTop100ByStatusOrderByCreatedAtAsc(String status);

  boolean existsByIdempotencyKey(String idempotencyKey);
}
