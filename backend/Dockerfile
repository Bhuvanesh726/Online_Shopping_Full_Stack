FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the application skipping tests
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar ./app.jar

# Expose port (Render sets PORT dynamically, defaults to 8081 for Spring)
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
