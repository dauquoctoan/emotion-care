# Stage 1: Build JAR package
FROM maven:3.9.8-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy POMs and build dependencies layer
COPY pom.xml .
COPY emotion-base/pom.xml emotion-base/
COPY emotion-core/pom.xml emotion-core/
COPY emotion-api-svc/pom.xml emotion-api-svc/

# Copy all source codes
COPY emotion-base emotion-base
COPY emotion-core emotion-core
COPY emotion-api-svc emotion-api-svc

# Package jar skipping unit tests
RUN mvn clean package -DskipTests

# Stage 2: Ultra-lightweight JRE runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl tzdata && \
    cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    echo "Asia/Ho_Chi_Minh" > /etc/timezone

COPY --from=builder /app/emotion-api-svc/target/emotion-api-svc-*.jar /app/app.jar

ENV SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
