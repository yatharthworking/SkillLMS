package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.CorrectAnswerDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CorrectAnswerRepo extends JpaRepository<CorrectAnswerDB,Long> {

    CorrectAnswerDB findByTestQuestionsDB(TestQuestionsDB testQuestionsDB);
}
