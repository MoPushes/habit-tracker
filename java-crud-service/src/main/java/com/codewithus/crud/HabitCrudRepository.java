package com.codewithus.crud;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitCrudRepository extends JpaRepository<Habit, Long> {
}
