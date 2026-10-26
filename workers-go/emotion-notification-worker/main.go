package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/midob/emotion-care/workers-go/emotion-notification-worker/config"
	"github.com/midob/emotion-care/workers-go/emotion-notification-worker/consumer"
	"github.com/midob/emotion-care/workers-go/emotion-notification-worker/service"
)

func main() {
	log.Println("==================================================")
	log.Println("🚀 Starting Emotion Notification Worker (Golang)")
	log.Println("==================================================")

	cfg := config.Load()
	log.Printf("[CONFIG] Database URL: %s", cfg.DatabaseURL)
	log.Printf("[CONFIG] Kafka Brokers: %v | Group ID: %s", cfg.KafkaBrokers, cfg.GroupID)
	log.Printf("[CONFIG] Topics: %v | Concurrency: %d", cfg.Topics, cfg.Concurrency)

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
		log.Printf("⚠️ Warning: PostgreSQL ping failed: %v", err)
	} else {
		log.Println("✅ Connected to PostgreSQL successfully")
	}

	// 2. Initialize notification service
	notifService := service.NewNotificationService(pool)

	// 3. Start consumers for each configured topic
	var wg sync.WaitGroup
	var consumers []*consumer.Consumer

	for _, topic := range cfg.Topics {
		c := consumer.NewConsumer(cfg.KafkaBrokers, cfg.GroupID, topic, notifService)
		consumers = append(consumers, c)

		wg.Add(1)
		go func(cons *consumer.Consumer) {
			defer wg.Done()
			cons.Start(ctx)
		}(c)
	}

	// 4. Handle OS signals for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	log.Println("⚡ Notification Worker listening for Kafka events...")

	<-sigChan
	log.Println("🛑 Termination signal received. Stopping consumers gracefully...")
	cancel()

	for _, c := range consumers {
		_ = c.Close()
	}

	wg.Wait()
	log.Println("👋 Notification Worker shutdown complete.")
}
