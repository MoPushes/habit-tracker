FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY java-crud-service/pom.xml ./java-crud-service/pom.xml
COPY java-crud-service/src ./java-crud-service/src
RUN mvn -pl java-crud-service -am package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/java-crud-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
