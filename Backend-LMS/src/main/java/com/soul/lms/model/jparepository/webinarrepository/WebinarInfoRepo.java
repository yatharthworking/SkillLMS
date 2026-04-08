package com.soul.lms.model.jparepository.webinarrepository;

import com.soul.lms.model.entity.webinar.WebinarInfo;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface WebinarInfoRepo extends JpaRepository<WebinarInfo, Long> {

    @Transactional
    @Query("SELECT w FROM WebinarInfo w WHERE w.webinarInfoId = :webinarInfoId and w.isActive = true")
    Optional<WebinarInfo> fetchActiveWebinarInfoById(@Param("webinarInfoId") Long webinarInfoId);

    @Transactional
    @Query("SELECT w FROM WebinarInfo w WHERE w.webinarInfoId = :webinarInfoId")
    Optional<WebinarInfo> fetchAllWebinarInfoById(@Param("webinarInfoId") Long webinarInfoId);

    //fetching child webinarInfo on request of client Team
    @Transactional
    Page<WebinarInfo> findByIsActiveTrueOrderByCreationTimeStampDesc(Pageable pageable);

    @Transactional
    Page<WebinarInfo> findByIsActiveTrueAndSubjectMasterDB_SubjectMasterIdOrderByCreationTimeStampDesc(Long subjectId, Pageable pageable);

    @Transactional
    Page<WebinarInfo> findByIsActiveTrueAndWebinarStartTimeGreaterThanEqualOrderByCreationTimeStampDesc(LocalDateTime today, Pageable pageable);

    @Transactional
    Page<WebinarInfo> findByIsActiveTrueAndWebinarStartTimeGreaterThanEqualAndSubjectMasterDB_SubjectMasterIdOrderByCreationTimeStampDesc(LocalDateTime today, Long subjectId, Pageable pageable);

    @Transactional
    @Query("SELECT w FROM WebinarInfo w WHERE w.webinarInfoId = :webinarInfoId AND w.isActive = true AND YEAR(w.webinarStartTime) = YEAR(:dateValue) " + "AND MONTH(w.webinarStartTime) = MONTH(:dateValue) " + "AND DAY(w.webinarStartTime) = DAY(:dateValue)")
    Optional<WebinarInfo> findWebinarDateWise(@Param("webinarInfoId") Long webinarInfoId, @Param("dateValue") LocalDate dateValue);
}
