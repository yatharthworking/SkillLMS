package com.soul.lms.model.jparepository.liveclassrepository;

import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LiveClassRepository extends JpaRepository<LiveClassEntity, Long>
{
	@Transactional
	@Query("SELECT l FROM LiveClassEntity l WHERE (:meetDate IS NULL OR l.meetDate = :meetDate) ORDER BY l.meetDate ASC")
	Optional<List<LiveClassEntity>> findByMeetDate(@Param("meetDate") LocalDate meetDate);
}
