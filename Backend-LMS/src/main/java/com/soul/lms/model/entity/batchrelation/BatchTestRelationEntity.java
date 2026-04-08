package com.soul.lms.model.entity.batchrelation;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;


@EqualsAndHashCode(callSuper = false)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TXN_BATCH_TEST_RELATION",
        indexes = {
                @Index(name = "idx_bt_batch_id", columnList = "batch_id"),
                @Index(name = "idx_bt_course_id", columnList = "test_id"),
                @Index(name = "idx_batch_test", columnList = "batch_id, testId")},
        uniqueConstraints = {@UniqueConstraint(columnNames = {"batchId", "testId", "courseId", "isActive"})}
)
public class BatchTestRelationEntity extends WhoseColumnsEntity implements Serializable {


    @Id
    @Column(name = "batchTestRelationId")
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_batch_test_relation")
    @SequenceGenerator(name = "seq_batch_test_relation", sequenceName = "seq_batch_test_relation", allocationSize = 1)
    private Long batchTestRelationId;

    @JsonProperty("batchId")
    @Column(name = "batch_id")
    private Long batchId;

    @JsonProperty("testId")
    @Column(name = "test_id")
    private Long testId;

    @JsonProperty("courseId")
    @Column(name = "course_id")
    private Long courseId;

    @Enumerated(EnumType.STRING)
    @JsonProperty("testType")
    @Column(name = "test_type")
    private TestType testType;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

}
