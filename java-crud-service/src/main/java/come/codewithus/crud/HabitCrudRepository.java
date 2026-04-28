package come.codewithus.crud;

import org.springframework.data.jpa.repository.JpaRepository;
import come.codewithus.crud.Habit;

public interface HabitCrudRepository extends JpaRepository<Habit, Long> {
}
