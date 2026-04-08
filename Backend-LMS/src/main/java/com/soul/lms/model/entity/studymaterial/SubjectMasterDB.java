package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.webinar.WebinarInfo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false, exclude = {"webinarInfoList", "libraryMasterDBList"})
@Entity
@Table(name = "FND_SUBJECT_MASTER")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class SubjectMasterDB extends WhoseColumnsEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_subject_master_jpa")
    @SequenceGenerator(name = "seq_subject_master_jpa", sequenceName = "seq_subject_master", allocationSize = 1)
    @Column(name = "subject_Master_Id")
    @JsonProperty("subjectMasterId")
    private Long subjectMasterId;

    @JsonProperty("subjectName")
    @Column(name = "Subject_Name")
    private String subjectName;

    @JsonProperty("isActive")
    @Column(name = "IS_ACTIVE")
    private Boolean isActive;

    @Transient
    private Integer totalClassroomCourses;

    @Transient
    private Integer totalCertificationCourses;

    @Transient
    private Integer totalWebinars;

    @JsonProperty("courses")
    @JsonManagedReference(value = "librarySubjectMasterParent")
    @OneToMany(mappedBy = "subjectMasterDB", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LibraryMasterDB> libraryMasterDBList = new ArrayList<>();

    @JsonProperty("webinars")
    @JsonManagedReference(value = "webinarSubjectMasterParent")
    @OneToMany(mappedBy = "subjectMasterDB", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WebinarInfo> webinarInfoList = new ArrayList<>();

}
