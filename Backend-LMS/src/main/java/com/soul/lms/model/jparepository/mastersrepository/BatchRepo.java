package com.soul.lms.model.jparepository.mastersrepository;

import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
//import com.soul.lms.model.entity.modelmasters.masterentitydb.CourseDB;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface BatchRepo extends JpaRepository<BatchDB, Long> {

    @Transactional
    @Query("SELECT b FROM BatchDB b WHERE b.batchId = :batchId and b.isActive = true")
    Optional<Page<BatchDB>> findBatchByIdPageable(@Param("batchId") Long batchId, Pageable pageable);

    @Transactional
    @Query("SELECT b FROM BatchDB b WHERE b.batchId = :batchId and b.isActive = true")
    Optional<BatchDB> findBatchById(@Param("batchId") Long batchId);

    @Transactional
    @Query("SELECT b FROM BatchDB b INNER JOIN b.organizationsDB o WHERE b.isActive = true AND o.isActive = true")
    List<BatchDB> findAllBatches();

    @Transactional
    @Query("SELECT b FROM BatchDB b INNER JOIN b.organizationsDB o WHERE b.isActive = true AND o.isActive = true AND o.orgId = :orgId")
    Optional<Page<BatchDB>> findAllBatchesByOrganizations(@Param("orgId") Long orgId, Pageable pageable);

    @Transactional
    @Query("SELECT b FROM BatchDB b INNER JOIN b.organizationsDB o WHERE b.isActive = true AND o.isActive = true AND o.orgId = :orgId")
    List<BatchDB> findAllBatchesByOrganizations(@Param("orgId") Long orgId);

}
