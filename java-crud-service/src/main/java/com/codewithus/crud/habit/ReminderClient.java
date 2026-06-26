package com.codewithus.crud.habit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class ReminderClient {

    private final RestClient restClient;

    public ReminderClient(@Value("${reminder.service.url}") String reminderServiceUrl) {
        this.restClient = RestClient.create(reminderServiceUrl);
    }

    private String mapJavaTypeToNodeType(String habitType) {
        if (habitType == null) {
            return "good";
        }
        if ("build".equalsIgnoreCase(habitType)) {
            return "good";
        }
        return habitType;
    }

    @SuppressWarnings("unchecked")
    public Long createReminder(String habitName, String reminderTime, String habitType, Long userId) {
        try {
            Map<String, Object> response = (Map<String, Object>) restClient.post()
                .uri("/reminders")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "userId", userId != null ? String.valueOf(userId) : "anonymous",
                    "text", habitName,
                    "time", reminderTime,
                    "type", mapJavaTypeToNodeType(habitType)
                ))
                .retrieve()
                .body(Map.class);

            if (response != null && response.containsKey("id")) {
                Object id = response.get("id");
                return id instanceof Number n ? n.longValue() : null;
            }
        } catch (Exception e) {
            System.err.println("[ReminderClient] Service unavailable: " + e.getMessage());
        }
        return null;
    }

    public void updateReminder(Long reminderId, String habitName, String reminderTime, String habitType) {
        try {
            restClient.put()
                .uri("/reminders/{id}", reminderId)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "text", habitName,
                    "time", reminderTime,
                    "type", mapJavaTypeToNodeType(habitType)
                ))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("[ReminderClient] Could not update reminder " + reminderId + ": " + e.getMessage());
        }
    }

    public void deleteReminder(Long reminderId) {
        try {
            restClient.delete()
                .uri("/reminders/{id}", reminderId)
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            System.err.println("[ReminderClient] Could not delete reminder " + reminderId + ": " + e.getMessage());
        }
    }
}