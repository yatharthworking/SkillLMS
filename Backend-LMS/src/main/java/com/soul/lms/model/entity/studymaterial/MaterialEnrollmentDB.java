package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "material_enrollment",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"username", "materialId", "isActive"})
        })
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MaterialEnrollmentDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "material_enrollment_seq")
    @SequenceGenerator(name = "material_enrollment_seq", sequenceName = "material_enrollment_seq", allocationSize = 1)
    @JsonProperty("materialEnrollmentId")
    @Column(name = "material_enrollment_Id")
    private Long materialEnrollmentId;

    //Storing username inplace of userId since in Login Response client side is getting only userName
    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    @Column(name = "username",nullable = false)
    private String username;

    @NotNull(message = "material Id cannot be null")
    @JsonProperty("materialId")
    @Column(name = "material_id",unique = true ,nullable = false)
    private Long materialId;
    
    @JsonProperty("tutorName")
    @Column(name = "tutor_name")
    private String tutorName;
    
    @JsonProperty("materialName")
    @Column(name = "material_name")
    private String materialName;
    
    @JsonProperty("isCompleted")
    @Column(name = "is_completed")
    private Boolean isCompleted;
    
    @JsonProperty("chapterList")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LIBRARY_MASTERDB_MATERIAL_ID", referencedColumnName = "material_id")
    private LibraryMasterDB libraryMasterDB;
    
    @JsonManagedReference
    @OneToMany(mappedBy = "materialEnrollmentDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List <EnrolledChaptersDB> enrolledChaptersDBList = new ArrayList <>();
    
    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;
}
