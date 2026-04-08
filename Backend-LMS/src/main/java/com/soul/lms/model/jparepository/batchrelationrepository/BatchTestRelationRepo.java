package com.soul.lms.model.jparepository.batchrelationrepository;

import com.soul.lms.model.entity.batchrelation.BatchTestRelationEntity;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface BatchTestRelationRepo extends JpaRepository<BatchTestRelationEntity, Long> {

    @Transactional
    @Query("SELECT btr FROM BatchTestRelationEntity btr WHERE btr.batchId = :batchId AND btr.testType = :testType AND btr.isActive = true ORDER BY btr.testId DESC")
    Optional<List<BatchTestRelationEntity>> findBTRByBatchId(@Param("batchId") Long batchId, @Param("testType") TestType testType);


    @Transactional
    @Query("SELECT btr FROM BatchTestRelationEntity btr WHERE btr.batchId = :batchId AND btr.courseId = :courseId AND btr.testId = :testId AND btr.isActive = true ORDER BY btr.testId DESC")
    Optional<BatchTestRelationEntity> fetchBatchTestsForRemove(@Param("batchId") Long batchId, @Param("courseId") Long courseId, @Param("testId") Long testId);
}
