package com.soul.lms.model.jparepository.enrollmentrepository;

import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface BatchStudentEnrollmentRepo extends JpaRepository<BatchStudentEnrollmentsDB, Long> {

    Optional<List<BatchStudentEnrollmentsDB>> findByStudentIdAndIsActive(Long userDetailsId, Boolean isActive);

    @Transactional
    @Query("SELECT bse FROM BatchStudentEnrollmentsDB bse LEFT JOIN bse.batchDB b WHERE bse.studentId = :studentId AND b.batchId = :batchId AND bse.isActive = true")
    Optional<BatchStudentEnrollmentsDB> findBatchStudents(@Param("studentId") Long studentId, @Param("batchId") Long batchId);


    @Transactional
    @Query("SELECT bse FROM BatchStudentEnrollmentsDB bse LEFT JOIN bse.batchDB b where b.batchId = :batchId AND bse.isActive = true")
    Optional<List<BatchStudentEnrollmentsDB>> findStudentsEnrolledInABatch(Long batchId);
}
