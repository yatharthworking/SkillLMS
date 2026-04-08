package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.EnrolledChaptersDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompletedChaptersRepo extends JpaRepository<EnrolledChaptersDB,Long> {

    @Transactional
    @Query("SELECT cc FROM EnrolledChaptersDB cc WHERE cc.username = :username AND cc.isActive = true")
    Optional<List<EnrolledChaptersDB>> fetchActiveCompletedChapters(@Param("username") String username);
    
    @Transactional
    @Query("SELECT cc FROM EnrolledChaptersDB cc WHERE cc.username = :username AND cc.chapterId = :chapterId AND cc.isActive = true")
    Optional<List<EnrolledChaptersDB>> fetchEnrolledChapters(@Param("username") String username, @Param("chapterId") Long chapterId);
    
    
}
