# ------------------------------------------------------------
# 1️⃣ Build stage – compile the Spring Boot application
# ------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom first (dependency cache optimization)
COPY pom.xml .
COPY src ./src

# Build jar
RUN mvn -B clean package -DskipTests

# ------------------------------------------------------------
# 2️⃣ Runtime stage – run the jar with a small JRE
# ------------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
