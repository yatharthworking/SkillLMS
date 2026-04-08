package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface LibraryMasterRepo extends JpaRepository<LibraryMasterDB, Long> {


    @Transactional
    @Query("SELECT lm FROM LibraryMasterDB lm WHERE lm.isActive = true order by lm.creationTimeStamp DESC")
    Optional<List<LibraryMasterDB>> findActiveMaterial();
    
    @Transactional
    @Query("SELECT lm FROM LibraryMasterDB lm WHERE lm.isActive = :isActive AND lm.materialId NOT IN :materialIds order by lm.creationTimeStamp DESC")
    Optional<List<LibraryMasterDB>> findLibraryMasterDBByMaterialId(@Param("isActive") Boolean isActive, @Param("materialIds") List<Long> materialIds);

    @Transactional
    @Query("SELECT lm from LibraryMasterDB lm where lm.materialId = :materialId AND lm.isActive = true")
    Optional<LibraryMasterDB> fetchActiveLibraryMasterById(@Param("materialId") Long materialId);

    @Transactional
    @Query("SELECT lm from LibraryMasterDB lm where lm.materialId = :materialId")
    Optional<LibraryMasterDB> fetchAllLibraryMasterById(@Param("materialId") Long materialId);

    @Transactional
    @Query("SELECT lm FROM LibraryMasterDB lm WHERE lm.userInfoDB.userDetailsId = :tutorId AND lm.materialId != :materialId AND lm.isActive = true")
    Optional<List<LibraryMasterDB>> findByTutorId(Long tutorId, Long materialId);

    @Transactional
    @Query("SELECT lm FROM LibraryMasterDB lm ORDER BY lm.creationTimeStamp DESC")
    Optional<Page<LibraryMasterDB>> fetchAllCourses(Pageable pageable);


    @Transactional
    @Query("SELECT lm FROM LibraryMasterDB lm WHERE lm.isActive = true AND (lm.subjectMasterDB.subjectMasterId = :subjectId OR :subjectId IS NULL) ORDER BY lm.creationTimeStamp DESC")
    Optional<Page<LibraryMasterDB>> getActiveCoursesBySubject(Pageable pageable, @Param("subjectId") Optional<Long> subjectId);


}
