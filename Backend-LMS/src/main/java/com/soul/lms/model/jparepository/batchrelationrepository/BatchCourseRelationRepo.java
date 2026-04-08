package com.soul.lms.model.jparepository.batchrelationrepository;

import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface BatchCourseRelationRepo extends JpaRepository<BatchCourseRelationEntity, Long> {

    @Transactional
    @Query("SELECT bcr FROM BatchCourseRelationEntity bcr WHERE bcr.batchId = :batchId AND bcr.isActive = true")
    Optional<List<BatchCourseRelationEntity>> findByBatchId(@Param("batchId") Long batchId);


    @Transactional
    @Query("SELECT bcr FROM BatchCourseRelationEntity bcr WHERE bcr.batchId = :batchId AND bcr.courseId = :courseId AND bcr.isActive = true")
    Optional<BatchCourseRelationEntity> findByBatchIdAndCourseId(@Param("batchId") Long batchId, @Param("courseId") Long courseId);


    @Transactional
    @Query("SELECT bcr FROM BatchCourseRelationEntity bcr WHERE bcr.batchId = :batchId AND bcr.tutorId = :tutorId AND bcr.courseId = :courseId AND bcr.isActive = true")
    Optional<BatchCourseRelationEntity> fetchBatchCoursesForRemove(@Param("batchId") Long batchId, @Param("tutorId") Long tutorId, @Param("courseId") Long courseId);
}
