package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.quiz.QuizCorrectAnswersDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface QuizCorrectAnswerRepo extends JpaRepository<QuizCorrectAnswersDB,Long> {

    @Transactional
    @Query("SELECT qc FROM QuizCorrectAnswersDB qc WHERE qc.quizQuestionsDB.quizQuestionId IN :questionIds")
    Optional<List<QuizCorrectAnswersDB>> fetchCorrectAnswers(@Param("questionIds") List<Long> questionIds);
}
