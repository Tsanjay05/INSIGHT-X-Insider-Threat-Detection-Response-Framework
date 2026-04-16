FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar app.jar

ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]

