package com.codewithus.crud.habit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitCrudRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserId(Long userId);
}
