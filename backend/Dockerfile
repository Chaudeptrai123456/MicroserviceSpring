# ================================
# Stage 1: Build
# ================================
FROM gradle:8.4.0-jdk21-alpine AS builder
WORKDIR /app

# 1️⃣ Copy gradle wrapper & config trước (để cache)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# ⚡ Chỉ resolve dependencies, KHÔNG build
RUN ./gradlew dependencies --no-daemon

# 2️⃣ Copy source code sau
COPY src src

# 3️⃣ Build bootJar 1 lần duy nhất
RUN ./gradlew bootJar -x test --no-daemon

# ================================
# Stage 2: Runtime
# ================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 9999
ENTRYPOINT ["java", "-jar", "app.jar"]