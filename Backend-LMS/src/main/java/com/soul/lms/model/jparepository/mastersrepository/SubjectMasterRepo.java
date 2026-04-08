package com.soul.lms.model.jparepository.mastersrepository;

import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubjectMasterRepo extends JpaRepository<SubjectMasterDB, Object> {

    @Transactional
    @Query("SELECT s FROM SubjectMasterDB s WHERE s.isActive = true ORDER BY s.subjectMasterId DESC")
    Optional<List<SubjectMasterDB>> findAllActiveSubjects();
}
