package com.soul.lms.model.entity.tests;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false, exclude = {"testQuestionsDB", "testAnswersDB"})
@Data
@Entity
@Table(name = "FND_CORRECT_ANSWER_MASTER")
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CorrectAnswerDB implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_correct_answer_master")
    @SequenceGenerator(name = "seq_correct_answer_master", sequenceName = "seq_correct_answer_master", allocationSize = 1)
    @JsonProperty("correctAnswerId")
    @Column(name = "correct_answer_id")
    private Long correctAnswerId;

    @JsonBackReference
    @JoinColumn(name = "question_id")
    @OneToOne(fetch = FetchType.LAZY)
    private TestQuestionsDB testQuestionsDB;

    @JoinColumn(name = "answer_id")
    @OneToOne
    private TestAnswersDB testAnswersDB;

}
