package com.soul.lms.model.entity.tests;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.tests.enumentity.TestPattern;
import com.soul.lms.model.entity.tests.enumentity.TestType;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "FND_TEST_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_test_master")
    @SequenceGenerator(name = "seq_test_master", sequenceName = "seq_test_master", allocationSize = 1)
    @JsonProperty("testId")
    @Column(name = "test_id")
    private Long testId;

    @JsonProperty("testName")
    @Column(name = "test_name")
    private String testName;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @JsonProperty("testStartDate")
    @Column(name = "test_start_date")
    private LocalDateTime testStartDate;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @JsonProperty("testEndDate")
    @Column(name = "test_end_date")
    private LocalDateTime testEndDate;

    @JsonProperty("description")
    @Column(name = "description", columnDefinition = "text")
    private String description;

    @JsonProperty("totalQuestions")
    @Column(name = "total_questions")
    private Integer totalQuestions;

    @JsonProperty("totalMarks")
    @Column(name = "total_marks")
    private Integer totalMarks;

    @Enumerated(EnumType.STRING)
    @JsonProperty("testType")
    @Column(name = "test_type")
    private TestType testType;

    @Enumerated(EnumType.STRING)
    @JsonProperty("testPattern")
    @Column(name = "test_pattern")
    private TestPattern testPattern;

    @JsonProperty("isPublished")
    @Column(name = "is_published")
    private Boolean isPublished;

    @JsonProperty("isDraft")
    @Column(name = "is_draft")
    private Boolean isDraft;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @Transient
    @JsonProperty("teacherName")
    private String tutorName;

    @Transient
    @JsonProperty("subject")
    private String subject;

    @Transient
    @JsonProperty("materialId")
    private Long materialId;

    @Transient
    @JsonProperty("materialName")
    private String materialName;

    @JsonProperty("timeLimit")
    @Column(name = "time_limit")
    private Integer timeLimit;

    @JsonProperty("gradingCriteria")
    @Column(name = "grading_criteria", columnDefinition = "text")
    private String gradingCriteria;

    @JsonProperty("passingMarks")
    @Column(name = "passing_marks")
    private Integer passingMarks;

    @JsonProperty("batchId")
    @Column(name = "batch_id")
    private Long batchId;

    @Transient
    @JsonProperty("userName")
    private String userName;

    @JsonProperty("testQuestions")
    @JsonManagedReference
    @OneToMany(mappedBy = "testDB", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<TestQuestionsDB> testQuestionsDB = new ArrayList <>();

    @JsonBackReference
    @JoinColumn(name = "material_id")
    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private LibraryMasterDB libraryMasterDB;
}
