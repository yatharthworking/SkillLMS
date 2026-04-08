package com.soul.lms.model.entity.modelmasters.masterentitydb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "FND_ORGANIZATION_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationMasterDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_organization_master")
    @SequenceGenerator(name = "seq_organization_master", sequenceName = "seq_organization_master", allocationSize = 1)
    @JsonProperty("organizationId")
    @Column(name = "organization_id")
    private Long organizationId;

    @JsonProperty("organizationName")
    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @JsonProperty("organizationCode")
    @Column(name = "organization_code", nullable = false, unique = true)
    private String organizationCode;

    @JsonProperty("isActive")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @JsonProperty("contact")
    @Column(name = "contact")
    private String contact;

    @JsonProperty("organizationImage")
    @Column(name = "organization_image", columnDefinition = "text")
    private String organizationImage;

//    @JsonProperty("organizationWebsite")
//    @Column(name = "organizationWebsite")
//    private String organizationWebsite;
//
//    @Lob
//    @JsonProperty("organizationDescription")
//    @Column(name = "organization_description")
//    private String organizationDescription;
//
//
//    @JsonProperty("organizationFacebookLink")
//    @Column(name = "organization_facebook_link")
//    private String organizationFacebookLink;
//
//
//    @JsonProperty("organizationInstagramLink")
//    @Column(name = "organization_instagram_link")
//    private String organizationInstagramLink;
//
//
//    @JsonProperty("organizationTwitterLink")
//    @Column(name = "organization_twitter_link")
//    private String organizationTwitterLink;

    @Transient
    @JsonProperty("userName")
    private String userName;

    @JsonProperty("organizationGroups")
    @JsonManagedReference
    @OneToMany(mappedBy = "organizationMasterDB", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<OrganizationsDB> organizationsDB;


}