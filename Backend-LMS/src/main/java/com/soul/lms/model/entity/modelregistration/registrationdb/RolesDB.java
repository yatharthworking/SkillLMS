package com.soul.lms.model.entity.modelregistration.registrationdb;

import com.fasterxml.jackson.annotation.*;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(callSuper = false, exclude = {"userInfo", "privileges", "roleMaster"})
@Entity
@Table(name = "Roles_DB")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIdentityInfo(
		generator = ObjectIdGenerators.PropertyGenerator.class,
		property = "rolesId", scope = RolesDB.class)
public class RolesDB extends WhoseColumnsEntity implements Serializable
{
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "user_roles")
	@SequenceGenerator(name = "user_roles", sequenceName = "user_roles", allocationSize = 1)
	@JsonProperty("rolesId")
	@Column(name = "roles_Id")
	private Long rolesId;
	
	@JsonProperty("role")
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "role", referencedColumnName = "role_Master_Id")
	private RoleMaster roleMaster;
	
	@ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private Set <UserInfoDB> userInfo = new HashSet <>();
	
	@JsonManagedReference
	@OneToMany(mappedBy = "rolesDB", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	private List <Privileges> privileges = new ArrayList <>();
}
