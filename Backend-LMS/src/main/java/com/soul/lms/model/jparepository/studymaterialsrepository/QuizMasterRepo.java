package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.quiz.QuizDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizMasterRepo extends JpaRepository<QuizDB,Long> {

    @Transactional
    @Query("SELECT qd FROM QuizDB qd where qd.quizId = :quizId")
    public Optional<QuizDB> fetchAllQuizDetails(@Param("quizId") Long quizId);

    @Transactional
    @Query("SELECT qd FROM QuizDB qd where qd.quizId = :quizId AND qd.isActive=true")
    public Optional<QuizDB> fetchActiveQuizDetails(@Param("quizId") Long quizId);
}
