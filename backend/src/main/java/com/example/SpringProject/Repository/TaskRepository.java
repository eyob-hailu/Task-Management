package com.example.SpringProject.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.SpringProject.entity.TaskEntity;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

	@Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.creator.id = :creatorId")
	long countByCreatorId(@Param("creatorId") Long creatorId);

	@Query("""
			    SELECT
			        t.status,
			        COUNT(t)
			    FROM TaskEntity t
			    WHERE t.creator.id = :creatorId
			    GROUP BY t.status
			""")
	List<Object[]> countTaskByRequester(@Param("creatorId") Long creatorId);

	@Query("""
			    SELECT
			        t.status,
			        COUNT(t)
			    FROM TaskEntity t
			    WHERE t.status != 'Draft'
			    GROUP BY t.status
			""")
	List<Object[]> countTasksByStatusforManager(@Param("managerId") Long managerId);

	// manager stats

	@Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.status!='Draft'")
	long allTasks();

	// employee stats

	@Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.assignee.id = :assignedUserId")
	long countByAssignedId(@Param("assignedUserId") Long assignedUserId);

	@Query("""
			    SELECT t.status, COUNT(t)
			    FROM TaskEntity t
			    WHERE t.assignee.id = :assignedUserId
			    GROUP BY t.status
			""")
	List<Object[]> countTasksByStatusForEmployee(@Param("assignedUserId") Long assignedUserId);

}
