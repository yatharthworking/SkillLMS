package com.soul.lms.model.jparepository.testrepository;

import com.soul.lms.model.entity.tests.SubjectiveTestSubmit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseSubjectiveTestSubmitRepo extends JpaRepository<SubjectiveTestSubmit, Long> {

    List<SubjectiveTestSubmit> findByTestIdAndStudentIdAndQuestionId(Long testId, Long studentId, Long questionId);

    List<SubjectiveTestSubmit> findByTestId(Long testId);
}
