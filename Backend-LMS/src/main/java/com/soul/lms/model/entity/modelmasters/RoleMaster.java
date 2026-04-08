package com.soul.lms.model.entity.modelmasters;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "FND_ROLE_MASTER")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleMaster extends WhoseColumnsEntity implements Serializable {


    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_role_master")
    @SequenceGenerator(name = "seq_role_master", sequenceName = "seq_role_master", allocationSize = 1)
    @Column(name = "role_master_id")
    private Long roleMasterId;

    @JsonProperty("roleMasterName")
    @Column(name = "role_master_name")
    private String roleMasterName;

    @JsonProperty("roleMasterCode")
    @Column(name = "role_master_code", unique = true, nullable = false)
    private String roleMasterCode;

    @Transient
    @JsonProperty("userCount")
    private Long userCount;

    @Transient
    @JsonProperty("userName")
    private String userName;

}
