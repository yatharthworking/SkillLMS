package com.soul.lms.model.entity.modelmasters.masterentitydb;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "FND_ORGANIZATION_GROUPS")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationsDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_organization_groups")
    @SequenceGenerator(name = "seq_organization_groups", sequenceName = "seq_organization_groups", allocationSize = 1)
    @JsonProperty("orgId")
    @Column(name = "org_id")
    private Long orgId;

    @JsonProperty("orgName")
    @Column(name = "org_name")
    private String orgName;

    @JsonProperty("orgCode")
    @Column(name = "org_code")
    private String orgCode;

    @JsonProperty("orgAddress")
    @Column(name = "org_address")
    private String orgAddress;

    @JsonProperty("orgCity")
    @Column(name = "org_city")
    private String orgCity;

    @JsonProperty("orgState")
    @Column(name = "org_state")
    private String orgState;

    @JsonProperty("orgCountry")
    @Column(name = "org_country")
    private String orgCountry;

    @JsonProperty("orgPincode")
    @Column(name = "org_pincode")
    private String orgPincode;

    @JsonProperty("orgContactNo")
    @Column(name = "org_contact_no")
    private String orgContactNo;

    @JsonProperty("orgLatitude")
    @Column(name = "org_latitude")
    private Double orgLatitude;

    @JsonProperty("orgLongitude")
    @Column(name = "org_longitude")
    private Double orgLongitude;

    @JsonProperty("orgCurrency")
    @Column(name = "org_currency")
    private String orgCurrency;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("organizationMasterId")
    @Transient
    private Long organizationMasterId;

    @JsonProperty("organizationMasterName")
    @Transient
    private String organizationMasterName;

    @JsonManagedReference
    @JsonProperty("batches")
    @OneToMany(mappedBy = "organizationsDB", fetch = FetchType.EAGER, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<BatchDB> batchDB = new ArrayList<>();

    @JsonBackReference
    @JoinColumn(name = "organization_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private OrganizationMasterDB organizationMasterDB;

}
