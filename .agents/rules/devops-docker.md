# DevOps & Docker Guidelines for Emotion Care

## 1. Local Development Topology
- Docker Compose file: `docker-compose.local.yml`
- Local services:
  - `emotion-postgres-local`: PostgreSQL 16 (port 5432)
  - `emotion-redis-local`: Redis 7 (port 6379)
  - `emotion-kafka-local`: Apache Kafka 3.7 KRaft mode (port 9092)
  - `emotion-api-local`: Spring Boot application (port 8080)

## 2. Docker Best Practices
- Multi-stage build in Dockerfile:
  - Stage 1 (`builder`): Maven 3.9 + Eclipse Temurin 17/21 Alpine for compiling JAR.
  - Stage 2 (`runtime`): Eclipse Temurin JRE Alpine for lightweight container footprint.
- Always include `tzdata` and set timezone to `Asia/Ho_Chi_Minh`.
- Database migrations run automatically on startup via Liquibase. Never disable Liquibase in container environments.
- Use health checks (`curl -f http://localhost:8080/actuator/health`) to ensure proper service orchestration ordering.
