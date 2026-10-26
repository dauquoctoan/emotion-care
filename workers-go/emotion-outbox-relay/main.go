package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/midob/emotion-care/workers-go/emotion-outbox-relay/config"
	"github.com/midob/emotion-care/workers-go/emotion-outbox-relay/kafka"
	"github.com/midob/emotion-care/workers-go/emotion-outbox-relay/relay"
)

func main() {
	log.Println("==================================================")
	log.Println("🚀 Starting Emotion Outbox Relay Worker (Golang)")
	log.Println("==================================================")

	cfg := config.Load()
	log.Printf("[CONFIG] Database URL: %s", cfg.DatabaseURL)
	log.Printf("[CONFIG] Kafka Brokers: %v", cfg.KafkaBrokers)
	log.Printf("[CONFIG] Batch Size: %d, Poll Interval: %v", cfg.BatchSize, cfg.PollInterval)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Connect to PostgreSQL
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Failed to parse PostgreSQL config: %v", err)
	}
	poolConfig.MaxConns = 10
	poolConfig.MinConns = 2

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		log.Fatalf("❌ Failed to create PostgreSQL pool: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Printf("⚠️ Warning: PostgreSQL ping failed: %v (worker will retry upon polling)", err)
	} else {
		log.Println("✅ Connected to PostgreSQL successfully")
	}

	// 2. Initialize Kafka producer
	producer := kafka.NewProducer(cfg.KafkaBrokers)
	defer producer.Close()

	// 3. Initialize relay engine
	outboxRelay := relay.NewRelay(pool, producer, cfg.BatchSize, cfg.WorkerID)

	// 4. Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	ticker := time.NewTicker(cfg.PollInterval)
	defer ticker.Stop()

	log.Printf("⚡ Outbox Relay loop started. Polling every %v...", cfg.PollInterval)

	for {
		select {
		case <-sigChan:
			log.Println("🛑 Received termination signal. Shutting down gracefully...")
			return
		case <-ticker.C:
			count, err := outboxRelay.ProcessBatch(ctx)
			if err != nil {
				log.Printf("❌ Outbox processing error: %v", err)
			} else if count > 0 {
				log.Printf("✅ Relayed %d events in batch", count)
			}
		}
	}
}
