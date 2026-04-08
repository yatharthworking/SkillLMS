package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.ObjectiveTestSubmit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseObjectiveTestSubmitRepo extends JpaRepository<ObjectiveTestSubmit,Long> {

    List<ObjectiveTestSubmit> findByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId);
}