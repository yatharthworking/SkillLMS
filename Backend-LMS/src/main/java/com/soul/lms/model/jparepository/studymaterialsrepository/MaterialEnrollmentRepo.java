package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.MaterialEnrollmentDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaterialEnrollmentRepo extends JpaRepository<MaterialEnrollmentDB,Long> {

    @Transactional
    @Query("SELECT me FROM MaterialEnrollmentDB me WHERE me.username = :username AND (:isCompleted IS NULL OR me.isCompleted = :isCompleted) AND me.isActive = true")
    Optional<List<MaterialEnrollmentDB>> fetchActiveEnrolledMaterials(@Param("username") String username, @Param("isCompleted") Boolean isCompleted);

    @Transactional
    @Query("SELECT me FROM MaterialEnrollmentDB me WHERE me.username = :username AND me.isActive = true AND me.materialId = :materialId")
    Optional<MaterialEnrollmentDB> fetchEnrollmentStatus(@Param("materialId")Long materialId,@Param("username")String username);

    @Transactional
    @Query("SELECT COUNT(me) FROM MaterialEnrollmentDB me where me.username = :username AND me.isActive = true")
    Integer countCourseEnrollments(@Param("username") String username);

    @Transactional
    @Query("SELECT COUNT(me) FROM MaterialEnrollmentDB me where me.materialId = :materialId AND me.isActive = true")
    Integer countStudentEnrollments(@Param("materialId") Long materialId);
    
    @Transactional
    @Query("SELECT me FROM MaterialEnrollmentDB me where me.materialId = :materialId AND me.isActive = true")
    Optional<MaterialEnrollmentDB> studentEnrollments(@Param("materialId") Long materialId);
}
