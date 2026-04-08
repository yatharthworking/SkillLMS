package com.soul.lms.model.entity.tests;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_SUBJECTIVE_TEST_SUBMISSION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubjectiveTestSubmit extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_subjective_test_submission")
    @SequenceGenerator(name = "seq_subjective_test_submission", sequenceName = "seq_subjective_test_submission", allocationSize = 1)
    private Long testSubmissionId;

    @JsonProperty("studentId")
    @Column(name = "student_id")
    private Long studentId;

    @JsonProperty("courseId")
    @Column(name = "course_id")
    private Long courseId;

    @JsonProperty("testId")
    @Column(name = "test_id")
    private Long testId;

    @JsonProperty("questionId")
    @Column(name = "question_id")
    private Long questionId;

    @JsonProperty("submittedAnswer")
    @Column(name = "submitted_answer", columnDefinition = "text")
    private String submittedAnswer;

    @JsonProperty("marksObtained")
    @Column(name = "marks_obtained")
    private Integer marksObtained;

    @JsonProperty("feedback")
    @Column(name = "feedback", columnDefinition = "text")
    private String feedback;

    @Transient
    @JsonProperty("userName")
    private String userName;

}
