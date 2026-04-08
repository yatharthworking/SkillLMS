package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ContentsDBRepo extends JpaRepository<ContentsDB, Long> {


    @Transactional
    @Query("SELECT c from ContentsDB c WHERE c.chaptersDB.chapterId = :chapterId AND c.isActive=true")
    Optional<List<ContentsDB>> fetchActiveContentsByChapterId(@Param("chapterId") Long chapterId);

    @Transactional
    @Query("SELECT c FROM ContentsDB c WHERE c.contentId = :contentId AND c.isActive=true")
    Optional<ContentsDB> fetchActiveContentDetails(@Param("contentId") Long contentId);
}
