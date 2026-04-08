package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.TestDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TestRepo extends JpaRepository<TestDB, Long> {

    @Transactional
    @Query("SELECT t FROM TestDB t WHERE t.isActive = true AND t.testId = :testId ORDER BY t.testStartDate DESC")
    Optional<TestDB> findActiveTestById(@Param("testId") Long testId);

    @Transactional
    @Query("SELECT t FROM TestDB t WHERE t.isActive = true AND t.isPublished = true AND t.testId = :testId ORDER BY t.testStartDate DESC")
    Optional<TestDB> findActiveAndPublishedTestById(@Param("testId") Long testId);


    @Transactional
    @Query("SELECT t FROM TestDB t WHERE t.isActive = true AND t.isPublished = true AND t.testId = :testId AND t.testEndDate > :currentTime ORDER BY t.testStartDate DESC")
    Optional<TestDB> findUpcomingTestsById(@Param("testId") Long testId, @Param("currentTime") LocalDateTime currentTime);


    @Transactional
    @Query("SELECT t FROM TestDB t LEFT JOIN t.libraryMasterDB lm WHERE lm.isActive = true AND t.isActive = true AND t.isPublished = true AND lm.materialId = :courseId ORDER BY t.testStartDate DESC")
    Optional<List<TestDB>> findTestByCourseId(@Param("courseId") Long courseId);


    @Transactional
    @Query("SELECT t FROM TestDB t WHERE t.testId = :testId AND t.isActive = true AND t.isPublished = true AND YEAR(t.testStartDate) = YEAR(:dateValue) " + "AND MONTH(t.testStartDate) = MONTH(:dateValue) " + "AND DAY(t.testStartDate) = DAY(:dateValue) ORDER BY t.testStartDate DESC")
    TestDB findTestsDateWise(@Param("testId") Long testId, @Param("dateValue") LocalDate dateValue);


    @Transactional
    @Query("SELECT t FROM TestDB t WHERE t.testId IN (:testIds) AND t.testType = 'LIVE_TEST' AND t.isActive = true AND t.testStartDate >= :today AND (t.testStartDate <= :endDate AND t.testEndDate >= :startDate)")
    List<TestDB> findOverlappingTests(@Param("testIds") List<Long> testIds, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("today") LocalDateTime today);

    List<TestDB> findByCreatedByAndBatchIdAndIsActiveTrue(Long createdBy, Long batchId);

    List<TestDB> findByCreatedByAndIsActiveTrue(Long createdBy);
}
