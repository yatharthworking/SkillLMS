package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.tests.TestStudentRelation;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TestStudentRelationRepo extends JpaRepository<TestStudentRelation, Long> {

    @Transactional
    @Query("SELECT ts from TestStudentRelation ts WHERE ts.testId = :testId AND ts.studentId = :studentId AND ts.isTestAttempted = true")
    Optional<TestStudentRelation> findAttemptedTestByTestIdAndStudentId(@Param("testId") Long testId, @Param("studentId") Long studentId);

    @Transactional
    @Query("SELECT ts from TestStudentRelation ts WHERE ts.testId = :testId AND ts.studentId = :studentId AND ts.isTestAttempted = false")
    Optional<TestStudentRelation> findUnAttemptedTestByTestIdAndStudentId(@Param("testId") Long testId, @Param("studentId") Long studentId);

}
