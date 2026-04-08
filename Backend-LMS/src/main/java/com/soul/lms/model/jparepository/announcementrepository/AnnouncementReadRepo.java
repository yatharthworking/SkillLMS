package com.soul.lms.model.jparepository.announcementrepository;

import com.soul.lms.model.entity.announcement.AnnouncementReadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnnouncementReadRepo extends JpaRepository<AnnouncementReadEntity, Long> {


    @Transactional
    @Query("SELECT ar FROM AnnouncementReadEntity ar WHERE ar.announcementId = :announcementId ORDER BY ar.creationTimeStamp DESC")
    Optional<List<AnnouncementReadEntity>> fetchAnnouncementReadByAnnouncementId(@Param("announcementId") Long announcementId);

    @Transactional
    @Query("SELECT ar FROM AnnouncementReadEntity ar WHERE ar.studentId = :studentId AND ar.markAsRead = :markAsRead AND ar.creationTimeStamp >= :startDate ORDER BY ar.creationTimeStamp DESC")
    Optional<List<AnnouncementReadEntity>> fetchAnnouncementReadByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("markAsRead") Boolean markAsRead, @Param("startDate") LocalDateTime startDate);
}
