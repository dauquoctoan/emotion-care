package kafka

import (
	"context"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokers []string) *Producer {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Balancer:     &kafka.LeastBytes{},
		WriteTimeout: 5 * time.Second,
		ReadTimeout:  5 * time.Second,
		Async:        false, // Synchronous delivery guarantee for transactional outbox
		BatchTimeout: 10 * time.Millisecond,
	}

	log.Printf("[KAFKA] Initialized producer for brokers: %v", brokers)
	return &Producer{writer: writer}
}

func (p *Producer) Publish(ctx context.Context, topic, key string, value []byte) error {
	msg := kafka.Message{
		Topic: topic,
		Key:   []byte(key),
		Value: value,
		Time:  time.Now(),
	}

	return p.writer.WriteMessages(ctx, msg)
}

func (p *Producer) Close() error {
	log.Println("[KAFKA] Closing Kafka producer...")
	return p.writer.Close()
}
