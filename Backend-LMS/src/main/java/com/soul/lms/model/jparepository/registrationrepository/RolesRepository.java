package com.soul.lms.model.jparepository.registrationrepository;


import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RolesRepository extends JpaRepository<RolesDB, Long>
{


    @Transactional
    @Query("SELECT DISTINCT r FROM RolesDB r LEFT JOIN FETCH r.userInfo WHERE r.roleMaster.roleMasterName = 'STUDENT'")
    Optional<List<RolesDB>> fetchAllStudentList();

    @Transactional
    @Query("SELECT DISTINCT r FROM RolesDB r LEFT JOIN FETCH r.userInfo WHERE r.roleMaster.roleMasterName = 'TEACHER'")
    Optional<List<RolesDB>> fetchAllTeacherList();

    @Transactional
    @Query("SELECT DISTINCT r FROM RolesDB r LEFT JOIN FETCH r.userInfo WHERE r.roleMaster.roleMasterName = 'ADMIN'")
    Optional<List<RolesDB>> fetchAllAdminList();

    @Transactional
    @Query("SELECT DISTINCT r FROM RolesDB r LEFT JOIN FETCH r.userInfo WHERE r.roleMaster.roleMasterName = 'SUPER_ADMIN'")
    Optional<List<RolesDB>> fetchAllSuperAdminList();

    @Transactional
    @Query("SELECT r FROM RolesDB r WHERE r.roleMaster.roleMasterName = :role ORDER BY r.rolesId DESC")
    Optional<Page<RolesDB>> getAllUsersByRole(@Param("role") String role, Pageable pageable);
}
