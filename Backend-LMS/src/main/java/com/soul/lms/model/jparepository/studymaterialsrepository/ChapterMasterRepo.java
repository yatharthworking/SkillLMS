package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.ChaptersDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChapterMasterRepo extends JpaRepository<ChaptersDB,Long> {

    @Transactional
    @Query("SELECT cd FROM ChaptersDB cd where cd.chapterId = :chapterId AND cd.isActive=true")
    public Optional<ChaptersDB> fetchActiveChapterDetails(@Param("chapterId") Long chapterId);

    @Transactional
    @Query("SELECT cd FROM ChaptersDB cd where cd.chapterId = :chapterId")
    public Optional<ChaptersDB> fetchAllChapterDetails(@Param("chapterId") Long chapterId);

}
