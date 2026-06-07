package com.codewithus.crud.habit;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<Habit> getAllHabits(@AuthenticationPrincipal Long userId) {
        return habitService.getHabitsByUser(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> getHabitById(@PathVariable Long id) {
        return habitService.getHabitById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Habit createHabit(@RequestBody Habit habit, @AuthenticationPrincipal Long userId) {
        habit.setUserId(userId);
        return habitService.saveHabit(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable Long id, @RequestBody Habit habit, @AuthenticationPrincipal Long userId) {
        if (!habitService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        habit.setId(id);
        habit.setUserId(userId);
        return ResponseEntity.ok(habitService.saveHabit(habit));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Habit> patchHabit(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return habitService.patchHabit(id, updates)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        if (!habitService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        habitService.deleteHabit(id);
        return ResponseEntity.noContent().build();
    }
}
