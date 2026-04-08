package com.soul.lms.model.jparepository.liveclassrepository;

import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LiveClassesRepository extends JpaRepository<LiveClassesEntity, Long> {

    @Transactional
    @Query("SELECT l FROM LiveClassesEntity l LEFT JOIN l.liveClassEntity c WHERE l.batchId = :batchId AND c.meetDate = :date ORDER BY c.meetDate ASC")
    Optional<List<LiveClassesEntity>> fetchLiveClassesByBatchIdAndDate(@Param("batchId") Long batchId, @Param("date") LocalDate date);

}
