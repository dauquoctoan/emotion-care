package relay

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/midob/emotion-care/workers-go/emotion-outbox-relay/kafka"
)

type OutboxEvent struct {
	ID             string
	AggregateType  string
	AggregateID    string
	EventType      string
	IdempotencyKey string
	Payload        []byte
}

type Relay struct {
	pool      *pgxpool.Pool
	producer  *kafka.Producer
	batchSize int
	workerID  string
}

func NewRelay(pool *pgxpool.Pool, producer *kafka.Producer, batchSize int, workerID string) *Relay {
	return &Relay{
		pool:      pool,
		producer:  producer,
		batchSize: batchSize,
		workerID:  workerID,
	}
}

// ProcessBatch locks and relays a batch of pending events.
func (r *Relay) ProcessBatch(ctx context.Context) (int, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Pick events safely with row-level locks, skipping locked rows by other concurrent workers
	query := `
		SELECT id, aggregate_type, aggregate_id, event_type, idempotency_key, payload::text
		FROM outbox_events
		WHERE status = 'pending'
		ORDER BY created_at ASC
		LIMIT $1
		FOR UPDATE SKIP LOCKED;
	`

	rows, err := tx.Query(ctx, query, r.batchSize)
	if err != nil {
		return 0, fmt.Errorf("failed to query outbox_events: %w", err)
	}
	defer rows.Close()

	var events []OutboxEvent
	for rows.Next() {
		var e OutboxEvent
		var payloadStr string
		if err := rows.Scan(&e.ID, &e.AggregateType, &e.AggregateID, &e.EventType, &e.IdempotencyKey, &payloadStr); err != nil {
			return 0, fmt.Errorf("failed to scan outbox_event row: %w", err)
		}
		e.Payload = []byte(payloadStr)
		events = append(events, e)
	}

	if len(events) == 0 {
		return 0, nil
	}

	// 2. Publish each event to Kafka and update status
	for _, event := range events {
		topic := resolveTopic(event.EventType)

		pubErr := r.producer.Publish(ctx, topic, event.AggregateID, event.Payload)
		if pubErr != nil {
			log.Printf("[OUTBOX-RELAY] Failed to publish event %s (%s) to topic %s: %v", event.ID, event.EventType, topic, pubErr)

			_, updateErr := tx.Exec(ctx, `
				UPDATE outbox_events
				SET status = 'failed',
				    retry_count = retry_count + 1,
				    error_message = $2
				WHERE id = $1;
			`, event.ID, pubErr.Error())

			if updateErr != nil {
				log.Printf("[OUTBOX-RELAY] Failed to update error status for event %s: %v", event.ID, updateErr)
			}
			continue
		}

		// Published successfully -> update status to processed
		_, updateErr := tx.Exec(ctx, `
			UPDATE outbox_events
			SET status = 'processed',
			    processed_at = NOW(),
			    error_message = NULL
			WHERE id = $1;
		`, event.ID)

		if updateErr != nil {
			return 0, fmt.Errorf("failed to mark event %s as processed: %w", event.ID, updateErr)
		}

		log.Printf("[OUTBOX-RELAY] Published event %s [%s] -> topic '%s'", event.ID, event.EventType, topic)
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("failed to commit outbox transaction: %w", err)
	}

	return len(events), nil
}

func resolveTopic(eventType string) string {
	switch eventType {
	case "POST_CREATED":
		return "emotion.post.created"
	case "REACTION_ADDED", "REACTION_REMOVED", "REACTION_UPDATED":
		return "emotion.reaction.events"
	default:
		return "emotion.events"
	}
}
