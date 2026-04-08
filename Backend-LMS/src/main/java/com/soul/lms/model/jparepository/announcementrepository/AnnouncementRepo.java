package com.soul.lms.model.jparepository.announcementrepository;

import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AnnouncementRepo extends JpaRepository<AnnouncementEntity, Long> {

    @Transactional(readOnly = true)
    List<AnnouncementEntity> findByIsActiveTrueOrderByCreationTimeStampDesc();

    @Transactional
    @Query("SELECT ar FROM AnnouncementEntity ar WHERE ar.isActive = true AND ar.batchDB.organizationsDB.orgId = :branchId ORDER BY ar.creationTimeStamp DESC")
    Optional<List<AnnouncementEntity>> fetchAllActiveAnnouncements(@Param("branchId") Long branchId);

    @Transactional
    @Query("SELECT ar FROM AnnouncementEntity ar WHERE ar.isActive = true AND ar.announcementId = :announcementId ORDER BY ar.creationTimeStamp DESC")
    Optional<AnnouncementEntity> findActiveAnnouncementById(@Param("announcementId") Long announcementId);

}
