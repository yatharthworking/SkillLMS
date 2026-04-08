package com.soul.lms.model.jparepository.helpandsupportrepository;

import com.soul.lms.model.entity.modelstudent.HelpAndSupportEntity;
import jakarta.transaction.Transactional;
import org.hibernate.annotations.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HelpAndSupportRepository extends JpaRepository<HelpAndSupportEntity, Long> {

    @Transactional
    @Query("SELECT h FROM HelpAndSupportEntity h WHERE h.grievanceId = :grievanceId AND h.isResolved = :getValue")
    Optional<HelpAndSupportEntity> findHelpAndSupportById(@Param("grievanceId") Long grievanceId, Boolean getValue);

    @Transactional
    @Query("SELECT h FROM HelpAndSupportEntity h WHERE (:branchId IS NULL OR h.organizationsDB.orgId = :branchId OR h.organizationsDB IS NULL) AND h.isResolved = :isResolved AND h.creationTimeStamp >= :threeMonthsAgo ORDER BY h.creationTimeStamp DESC")
    Optional<List<HelpAndSupportEntity>> findAllHelpAndSupport(@Param("branchId") Long branchId, @Param("isResolved") Boolean isResolved, @Param("threeMonthsAgo") LocalDateTime threeMonthsAgo);

    @Transactional
    @Query("SELECT h FROM HelpAndSupportEntity h WHERE h.complainantId = :complainantId AND h.creationTimeStamp >= :threeMonthsAgo ORDER BY h.creationTimeStamp DESC")
    Optional<List<HelpAndSupportEntity>> findHelpAndSupportStudentWise(@Param("complainantId") Long complainantId,  @Param("threeMonthsAgo") LocalDateTime threeMonthsAgo);


    @Transactional
    @Query("SELECT h FROM HelpAndSupportEntity h WHERE (:branchId IS NULL OR h.organizationsDB.orgId = :branchId OR h.organizationsDB IS NULL) AND h.isResolved = :isResolved ORDER BY h.creationTimeStamp DESC")
    Optional<List<HelpAndSupportEntity>> findAllTimeHelpAndSupport(@Param("branchId") Long branchId, @Param("isResolved") Boolean isResolved);
}
