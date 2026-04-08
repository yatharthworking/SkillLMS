package com.soul.lms.model.jparepository.enrollmentrepository;

import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface BatchTutorEnrollmentRepo extends JpaRepository<BatchTutorEnrollmentDB, Long> {

    @Transactional
    @Query("SELECT bte FROM BatchTutorEnrollmentDB bte WHERE bte.tutorId = :userDetailsId AND bte.isActive = :isActive")
    Optional<List<BatchTutorEnrollmentDB>> findByTutorIdAndIsActive(@Param("userDetailsId") Long userDetailsId, @Param("isActive") Boolean isActive);

}
