package com.soul.lms.model.jparepository.studymaterialsrepository;

import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionMasterRepo extends JpaRepository<QuizQuestionsDB, Long>
{

}
