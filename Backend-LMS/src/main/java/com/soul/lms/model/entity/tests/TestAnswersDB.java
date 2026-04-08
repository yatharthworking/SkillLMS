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

@EqualsAndHashCode(callSuper = false)
@Data
@Entity
@Table(name = "FND_TEST_ANSWER_MASTER")
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestAnswersDB implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_test_answer_master")
    @SequenceGenerator(name = "seq_test_answer_master", sequenceName = "seq_test_answer_master", allocationSize = 1)
    @JsonProperty("answerId")
    @Column(name = "answer_id")
    private Long answerId;

    @Lob
    @JsonProperty("answer")
    @Column(name = "answer")
    private String answer;

    @Transient
    @JsonProperty("correctOption")
    private Boolean correctOption;

    @JsonBackReference
    @JoinColumn(name = "question_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private TestQuestionsDB testQuestionsDB;
}
