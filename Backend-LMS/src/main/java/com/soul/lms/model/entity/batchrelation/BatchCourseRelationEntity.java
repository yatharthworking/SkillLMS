package com.soul.lms.model.entity.batchrelation;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TXN_BATCH_COURSE_RELATION",
        indexes = {
        @Index(name = "idx_batch_id", columnList = "BATCH_ID"),
        @Index(name = "idx_course_id", columnList = "COURSE_ID"),
        @Index(name = "idx_batch_course", columnList = "BATCH_ID, COURSE_ID")},
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"batchId", "courseId", "tutorId", "isActive"})
        }
)
public class BatchCourseRelationEntity {

    @Id
    @Column(name = "batchCourseRelationId")
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_batchCourseRelation_jpa")
    @SequenceGenerator(name = "seq_batchCourseRelation_jpa", sequenceName = "seq_batchCourseRelation", allocationSize = 1)
    private Long batchCourseRelationId;

    @NotNull
    @JsonProperty("batchId")
    @Column(name = "BATCH_ID")
    private Long batchId;

    @NotNull
    @JsonProperty("courseId")
    @Column(name = "COURSE_ID")
    private Long courseId;

    @NotNull
    @JsonProperty("tutorId")
    @Column(name = "TUTOR_ID")
    private Long tutorId;

    @JsonProperty("isDefault")
    @Column(name = "IS_DEFAULT")
    private Boolean isDefault;

    @JsonProperty("isActive")
    @Column(name = "IS_ACTIVE")
    private Boolean isActive;
}