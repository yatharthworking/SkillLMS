package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@EqualsAndHashCode(callSuper = false,exclude = {"libraryMasterDB"})
@Entity
@Table(name = "MATERIAL_DESCRIPTION")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MaterialDescDB extends WhoseColumnsEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "material_description_info")
    @SequenceGenerator(name = "material_description_info", sequenceName = "material_description_info", allocationSize = 1)
    @JsonProperty("materialDescId")
    @Column(name = "material_description_id")
    private Long materialDescId;

    @JsonProperty("materialBrief")
    @Column(name = "material_brief", columnDefinition = "text")
    private String materialBrief;

    @JsonProperty("numberOfChapters")
    @Column(name = "number_of_chapters")
    private Long numberOfChapters;

    @JsonProperty("numberOfAssignments")
    @Column(name = "number_of_assignments")
    private Long numberOfAssignments;

    @JsonProperty("downloadableResources")
    @Column(name = "downloadable_resources")
    private Long downloadableResources;

    @JsonBackReference
    @OneToOne(mappedBy = "materialDescDB",  cascade = CascadeType.ALL)
    private LibraryMasterDB libraryMasterDB;

}
