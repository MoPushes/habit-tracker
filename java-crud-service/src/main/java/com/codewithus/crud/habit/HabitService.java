package com.codewithus.crud.habit;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class HabitService {

    private final HabitCrudRepository habitRepository;
    private final ReminderClient reminderClient;

    public HabitService(HabitCrudRepository habitRepository, ReminderClient reminderClient) {
        this.habitRepository = habitRepository;
        this.reminderClient = reminderClient;
    }

    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }

    public List<Habit> getHabitsByUser(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public Optional<Habit> getHabitById(Long id) {
        return habitRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return habitRepository.existsById(id);
    }

    public Habit saveHabit(Habit habit) {
        boolean isNew = habit.getId() == null;
        Habit saved = habitRepository.save(habit);

        String reminderTime = saved.getReminderTime();
        if (reminderTime == null || reminderTime.isBlank()) return saved;

        if (isNew) {
            Long reminderId = reminderClient.createReminder(
                saved.getName(), reminderTime, saved.getType(), saved.getUserId()
            );
            if (reminderId != null) {
                saved.setReminderId(reminderId);
                saved = habitRepository.save(saved);
            }
        } else if (saved.getReminderId() != null) {
            reminderClient.updateReminder(
                saved.getReminderId(), saved.getName(), reminderTime, saved.getType()
            );
        }

        return saved;
    }

    /**
     * Partial update. Only fields present in the map are touched.
     * A `reminder` key with a null value clears the reminder.
     */
    @SuppressWarnings("unchecked")
    public Optional<Habit> patchHabit(Long id, Map<String, Object> updates) {
        return habitRepository.findById(id).map(habit -> {
            if (updates.containsKey("name") && updates.get("name") != null) {
                habit.setName((String) updates.get("name"));
            }
            if (updates.containsKey("description")) {
                habit.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("type")) {
                habit.setType((String) updates.get("type"));
            }
            if (updates.containsKey("reminderTime")) {
                habit.setReminderTime((String) updates.get("reminderTime"));
            }
            if (updates.containsKey("reminder")) {
                Object raw = updates.get("reminder");
                if (raw == null) {
                    // Reminder removed — delete from Node service
                    if (habit.getReminderId() != null) {
                        reminderClient.deleteReminder(habit.getReminderId());
                        habit.setReminderId(null);
                    }
                    habit.setReminder(null);
                } else if (raw instanceof Map) {
                    Map<String, Object> rm = (Map<String, Object>) raw;
                    HabitReminder hr = new HabitReminder();
                    Object t = rm.get("time");
                    Object f = rm.get("freq");
                    Object d = rm.get("days");
                    if (t != null) hr.setTime(t.toString());
                    if (f != null) hr.setFreq(f.toString());
                    if (d instanceof List) {
                        List<?> rawDays = (List<?>) d;
                        java.util.List<Integer> days = new java.util.ArrayList<>(rawDays.size());
                        for (Object o : rawDays) {
                            if (o instanceof Number) days.add(((Number) o).intValue());
                            else if (o != null) days.add(Integer.parseInt(o.toString()));
                        }
                        hr.setDays(days);
                    } else {
                        hr.setDays(java.util.Collections.emptyList());
                    }
                    habit.setReminder(hr);

                    // Sync with Node scheduler
                    String time = hr.getTime();
                    String type = habit.getType() != null ? habit.getType() : "good";
                    if (habit.getReminderId() == null) {
                        // No existing Node reminder — create one
                        Long reminderId = reminderClient.createReminder(
                            habit.getName(), time, type, habit.getUserId()
                        );
                        habit.setReminderId(reminderId);
                    } else {
                        // Update the existing Node reminder
                        reminderClient.updateReminder(
                            habit.getReminderId(), habit.getName(), time, type
                        );
                    }
                }
            }
            return habitRepository.save(habit);
        });
    }

    public void deleteHabit(Long id) {
        habitRepository.findById(id).ifPresent(habit -> {
            if (habit.getReminderId() != null) {
                reminderClient.deleteReminder(habit.getReminderId());
            }
        });
        habitRepository.deleteById(id);
    }
}
