package consumer

import (
	"context"
	"log"
	"time"

	"github.com/midob/emotion-care/workers-go/emotion-notification-worker/service"
	"github.com/segmentio/kafka-go"
)

type Consumer struct {
	reader  *kafka.Reader
	service *service.NotificationService
}

func NewConsumer(brokers []string, groupID string, topic string, notifService *service.NotificationService) *Consumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        brokers,
		GroupID:        groupID,
		Topic:          topic,
		MinBytes:       10e3, // 10KB
		MaxBytes:       10e6, // 10MB
		CommitInterval: 1 * time.Second,
		StartOffset:    kafka.FirstOffset,
	})

	log.Printf("[CONSUMER] Initialized reader for topic '%s', group '%s'", topic, groupID)
	return &Consumer{
		reader:  reader,
		service: notifService,
	}
}

func (c *Consumer) Start(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			log.Println("[CONSUMER] Stopping consumer loop...")
			return
		default:
			msg, err := c.reader.FetchMessage(ctx)
			if err != nil {
				if ctx.Err() != nil {
					return
				}
				log.Printf("[CONSUMER] Error fetching message: %v", err)
				time.Sleep(500 * time.Millisecond)
				continue
			}

			// Process message
			if err := c.service.ProcessReactionEvent(ctx, msg.Value); err != nil {
				log.Printf("[CONSUMER] Failed to process message offset %d: %v", msg.Offset, err)
			}

			// Commit offset
			if err := c.reader.CommitMessages(ctx, msg); err != nil {
				log.Printf("[CONSUMER] Failed to commit message offset %d: %v", msg.Offset, err)
			}
		}
	}
}

func (c *Consumer) Close() error {
	log.Println("[CONSUMER] Closing Kafka reader...")
	return c.reader.Close()
}
