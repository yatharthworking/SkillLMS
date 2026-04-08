package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.*;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.tests.TestDB;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false,exclude = {"materialDescDB"})
@Table(name = "library_master")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "materialId", scope = LibraryMasterDB.class)
public class LibraryMasterDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "library_master_info")
    @SequenceGenerator(name = "library_master_info", sequenceName = "library_master_info",allocationSize = 1)
    @JsonProperty("materialId")
    @Column(name = "material_id")
    private Long materialId;

    @NotBlank(message = "material Name cannot be blank")
    @JsonProperty("materialName")
    @Column(name = "material_name",nullable = false)
    private String materialName;

    @JsonProperty("materialCode")
    @Column(name = "material_code" , nullable = false)
    private String materialCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_info", referencedColumnName = "user_details_Id")
    private UserInfoDB userInfoDB;
    
    @JsonProperty("materialPrice")
    @Column(name = "material_price")
    private Double materialPrice;

    @JsonProperty("discountPercentage")
    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Transient
    @JsonProperty("discountedPrice")
    private Double discountedPrice;

    @JsonProperty("rating")
    @Column(name = "rating")
    private Float rating;

    @JsonProperty("totalRatings")
    @Column(name = "total_ratings")
    private Integer totalRatings;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("materialImage")
    @Transient
    private String materialImage;

    @JsonProperty("materialImageDB")
    @Basic(fetch = FetchType.EAGER)
    @Column(name = "material_image", columnDefinition = "bytea")
    private byte[] materialImageDB;

    //Added the below property to check whether to generate
    @JsonProperty("isCertificationRequired")
    @Column(name = "is_certification_required")
    private Boolean isCertificationRequired;

    //Added this key to track progress. Taking it integer to show only whole numbers
    @Transient
    @JsonProperty("progressPercentage")
    private Integer progressPercentage;

    @JsonProperty("passingPercentage")
    @Column(name = "passing_percentage")
    private Integer passingPercentage;

    @JsonProperty("isPublished")
    @Column(name = "is_published")
    private Boolean isPublished;

    @Transient
    @JsonProperty("assignedTeacher")
    private String assignedTeacher;

    @Transient
    @JsonProperty("assignedTeacherId")
    private Long assignedTeacherId;

    @Transient
    @JsonProperty("totalEnrolledStudents")
    private Integer totalEnrolledStudents;

    @JsonProperty("materialDescription")
    @JsonManagedReference
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "material_description_id", referencedColumnName = "material_description_id")
    private MaterialDescDB materialDescDB;

    @JsonManagedReference
    @OneToMany(mappedBy = "libraryMasterDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<ChaptersDB> chaptersDBList = new ArrayList<>();

    @JsonProperty("tests")
    @JsonManagedReference
    @OneToMany(mappedBy = "libraryMasterDB", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestDB> testDB = new ArrayList<>();

    @JsonProperty("isDefault")
    @Transient
    private Boolean isDefault;

    @Transient
    @JsonProperty("subjectName")
    private String subjectName;

    @Transient
    @JsonProperty("subjectId")
    private Long subjectId;

//    @ManyToMany(mappedBy = "courses", fetch = FetchType.LAZY)
//    private Set<BatchDB> batches = new HashSet<>();

//    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
//    @JoinTable(
//            name = "course_tutor_mapping",
//            joinColumns = {@JoinColumn(name = "materialId")},
//            inverseJoinColumns = {@JoinColumn(name = "user_details_Id")}
//    )
//    private Set<UserInfoDB> tutors = new HashSet<>();

    @JsonBackReference(value = "librarySubjectMasterParent")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subjectMasterId")
    private SubjectMasterDB subjectMasterDB;
}
