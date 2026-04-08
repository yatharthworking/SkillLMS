package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.TestDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface TestQuestionsRepo extends JpaRepository<TestQuestionsDB,Long> {

    List<TestQuestionsDB> findByTestDB(TestDB testDB);

    @Transactional
    @Query("SELECT q FROM TestQuestionsDB q INNER JOIN q.testDB t WHERE t.testId = :testId AND t.isActive = true")
    Optional<List<TestQuestionsDB>> findQuestionsFromTestId(@Param("testId") Long testId);

}
