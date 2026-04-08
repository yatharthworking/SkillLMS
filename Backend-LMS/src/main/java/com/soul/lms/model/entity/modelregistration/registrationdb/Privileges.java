package com.soul.lms.model.entity.modelregistration.registrationdb;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Table(name = "priviledges")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Privileges extends WhoseColumnsEntity implements Serializable
{
	
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "user_privileges")
	@SequenceGenerator(name = "user_privileges", sequenceName = "user_privileges", allocationSize = 1)
	@JsonProperty("privilegesId")
	@Column(name = "privileges_Id")
	private Long privilegesId;
	
	@JsonProperty("privilegesName")
	@Column(name = "privileges_Name")
	private String privilegesName;
	
	@JsonProperty("privilegesCode")
	@Column(name = "privileges_Code")
	private String privilegesCode;
	
	@JsonBackReference
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "roles_Id", referencedColumnName = "roles_Id")
	private RolesDB rolesDB;
	
	
}
