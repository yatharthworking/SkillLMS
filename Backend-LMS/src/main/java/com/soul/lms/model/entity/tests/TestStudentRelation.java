package com.soul.lms.model.entity.tests;

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
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name = "TXN_TEST_STUDENT_RELATION",
        indexes = {
        @Index(name = "idx_st_test_id", columnList = "test_id"),
        @Index(name = "idx_st_student_id", columnList = "student_id"),
        @Index(name = "idx_st_test_student", columnList = "test_id, student_id")},
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"testId", "studentId", "isTestAttempted"})
        }
)
public class TestStudentRelation implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_test_student_relation")
    @SequenceGenerator(name = "seq_test_student_relation", sequenceName = "seq_test_student_relation", allocationSize = 1)
    @JsonProperty("testStudentRelationId")
    @Column(name = "test_student_relation_id")
    private Long testStudentRelationId;


    @JsonProperty("testId")
    @Column(name = "test_id")
    private Long testId;

    @JsonProperty("studentId")
    @Column(name = "student_id")
    private Long studentId;


    @JsonProperty("isTestAttempted")
    @Column(name = "is_test_attempted")
    private Boolean isTestAttempted;

}
