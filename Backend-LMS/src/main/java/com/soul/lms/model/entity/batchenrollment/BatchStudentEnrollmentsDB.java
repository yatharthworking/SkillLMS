package com.soul.lms.model.entity.batchenrollment;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_BATCH_STUDENT_ENROLLMENTS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BatchStudentEnrollmentsDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_batch_student_enrollments")
    @SequenceGenerator(name = "seq_batch_student_enrollments", sequenceName = "seq_batch_student_enrollments", allocationSize = 1)
    private Long enrollmentId;

    @Transient
    private BatchDB batchDBStudentTransientObj;

    @JsonProperty("studentId")
    @Column(name = "student_id")
    private Long studentId;

    @JsonProperty("enrollmentDate")
    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("reasonOfCancellation")
    @Column(name = "reason_of_cancellation", columnDefinition = "text")
    private String reasonOfCancellation;

    @JsonBackReference
    @JoinColumn(name = "batch_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private BatchDB batchDB;

}
