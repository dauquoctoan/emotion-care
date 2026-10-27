package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	DatabaseURL  string
	KafkaBrokers []string
	GroupID      string
	Topics       []string
	Concurrency  int
	WorkerID     string
}

func Load() *Config {
	dbURL := getEnv("DATABASE_URL", "postgres://postgres:postgrespassword@localhost:5432/emotion_care?sslmode=disable")
	kafkaBrokersStr := getEnv("KAFKA_BROKERS", "localhost:9092")
	groupID := getEnv("KAFKA_GROUP_ID", "emotion-notification-group")
	topicsStr := getEnv("KAFKA_TOPICS", "emotion.reaction.events,emotion.post.created")
	concurrencyStr := getEnv("CONCURRENCY", "4")
	workerID := getEnv("WORKER_ID", "notification-worker-1")

	concurrency, err := strconv.Atoi(concurrencyStr)
	if err != nil || concurrency <= 0 {
		concurrency = 4
	}

	brokers := strings.Split(kafkaBrokersStr, ",")
	topics := strings.Split(topicsStr, ",")

	return &Config{
		DatabaseURL:  dbURL,
		KafkaBrokers: brokers,
		GroupID:      groupID,
		Topics:       topics,
		Concurrency:  concurrency,
		WorkerID:     workerID,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
