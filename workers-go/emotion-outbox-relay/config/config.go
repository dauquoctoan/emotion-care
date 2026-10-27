package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	DatabaseURL  string
	KafkaBrokers []string
	BatchSize    int
	PollInterval time.Duration
	WorkerID     string
}

func Load() *Config {
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgrespassword@localhost:5432/emotion_care?sslmode=disable")
	kafkaBroker := getEnv("KAFKA_BROKERS", "localhost:9092")
	batchSizeStr := getEnv("BATCH_SIZE", "50")
	pollMsStr := getEnv("POLL_INTERVAL_MS", "500")
	workerID := getEnv("WORKER_ID", "outbox-relay-1")

	batchSize, err := strconv.Atoi(batchSizeStr)
	if err != nil || batchSize <= 0 {
		batchSize = 50
	}

	pollMs, err := strconv.Atoi(pollMsStr)
	if err != nil || pollMs <= 0 {
		pollMs = 500
	}

	return &Config{
		DatabaseURL:  dbURL,
		KafkaBrokers: []string{kafkaBroker},
		BatchSize:    batchSize,
		PollInterval: time.Duration(pollMs) * time.Millisecond,
		WorkerID:     workerID,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
