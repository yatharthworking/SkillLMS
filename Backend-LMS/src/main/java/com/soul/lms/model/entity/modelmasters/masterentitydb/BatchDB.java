package com.soul.lms.model.entity.modelmasters.masterentitydb;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(callSuper = false)
@Table(name = "FND_BATCHES")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "batchId", scope = BatchDB.class)
public class BatchDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_batch_master")
    @SequenceGenerator(name = "seq_batch_master", sequenceName = "seq_batch_master", allocationSize = 1)
    @JsonProperty("batchId")
    @Column(name = "batch_id")
    private Long batchId;

    @JsonProperty("batchName")
    @Column(name = "batch_name")
    private String batchName;

    @JsonProperty("batchDescription")
    @Column(name = "batch_description", columnDefinition = "text")
    private String batchDescription;

    @JsonProperty("batchCapacity")
    @Column(name = "batch_capacity")
    private Long batchCapacity;

    @JsonProperty("numberOfEnrolledStudents")
    @Column(name = "number_of_enrollments")
    private Long numberOfEnrolledStudents;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("batchStartDateTime")
    @Column(name = "batch_start_date_time")
    private LocalDateTime batchStartDateTime;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("batchEndDateTime")
    @Column(name = "batch_end_date_time")
    private LocalDateTime batchEndDateTime;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("organizationMasterName")
    @Transient
    private String organizationMasterName;

    @JsonProperty("studentsEnrollment")
    @JsonManagedReference
    @OneToMany(mappedBy = "batchDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BatchStudentEnrollmentsDB> batchStudentEnrollmentsDB = new ArrayList<>();

    @JsonProperty("tutorsEnrollment")
    @JsonManagedReference
    @OneToMany(mappedBy = "batchDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BatchTutorEnrollmentDB> batchTutorEnrollmentsDB = new ArrayList<>();

    @JsonProperty("announcements")
    @JsonManagedReference
    @OneToMany(mappedBy = "batchDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnouncementEntity> announcementEntityDB = new ArrayList<>();

    @JsonBackReference
    @JoinColumn(name = "org_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private OrganizationsDB organizationsDB;

    @Transient
    @JsonProperty("totalEnrolledStudents")
    private Integer totalEnrolledStudents;

    @Transient
    @JsonProperty("totalEnrolledTutors")
    private Integer totalEnrolledTutors;

    @Transient
    @JsonProperty("totalAnnouncements")
    private Integer totalAnnouncements;

    @Transient
    @JsonProperty("totalEnrolledCourses")
    private Integer totalEnrolledCourses;

    @Transient
    @JsonProperty("branchId")
    private Long branchId;

    @Transient
    @JsonProperty("branchName")
    private String branchName;


//    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
//    @JoinTable(
//            name = "batch_course_mapping",
//            joinColumns = {@JoinColumn(name = "batch_id")},
//            inverseJoinColumns = {@JoinColumn(name = "material_id")}
//    )
//    private Set<LibraryMasterDB> courses = new HashSet<>();

}
