package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.TestAnswersDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestAnswersRepo extends JpaRepository<TestAnswersDB,Long> {

    List<TestAnswersDB> findByTestQuestionsDB(TestQuestionsDB testQuestionsDB);
}
