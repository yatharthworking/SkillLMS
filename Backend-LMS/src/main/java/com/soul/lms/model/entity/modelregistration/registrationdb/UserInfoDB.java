package com.soul.lms.model.entity.modelregistration.registrationdb;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationsDB;
import com.soul.lms.model.entity.modelregistration.enumentity.Provider;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = false, exclude = {"userCredentialsDB", "roles"})
@Table(name = "user_info")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIdentityInfo(
		generator = ObjectIdGenerators.PropertyGenerator.class,
		property = "userDetailsId", scope = UserInfoDB.class)
public class UserInfoDB extends WhoseColumnsEntity implements Serializable
{
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "user_details")
	@SequenceGenerator(name = "user_details", sequenceName = "user_details", allocationSize = 1)
	@JsonProperty("userDetailsId")
	@Column(name = "user_details_Id")
	private Long userDetailsId;
	
	@JsonProperty("fullName")
	@Column(name = "full_name", nullable = false)
	private String fullName;
	
	@JsonProperty("email")
	@Email
	@Column(name = "email", unique = true, nullable = false)
	private String email;
	
	@JsonProperty("userSignature")
	@Column(name = "user_signature", columnDefinition = "bytea")
	private byte[] userSignature;
	
	@JsonProperty("gender")
	@Column(name = "gender")
	private String gender;
	
	@JsonProperty("mobileNo")
	@Column(name = "mobile_no", unique = true, nullable = false)
	private Long mobileNo;
	
	@JsonProperty("dob")
	@JsonSerialize(using = LocalDateSerializer.class)
	@JsonDeserialize(using = LocalDateDeserializer.class)
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	@Column(name = "dob")
	private LocalDate dob;

	@JsonProperty("isMobileVerified")
	@Column(name = "IS_MOBILE_VERIFIED")
	private Boolean isMobileVerified;

	@JsonProperty("isEmailVerified")
	@Column(name = "IS_EMAIL_VERIFIED")
	private Boolean isEmailVerified;

	@Enumerated(EnumType.STRING)
	@JsonProperty("provider")
	@Column(name = "provider")
	private Provider provider;

	@JsonProperty("isActive")
	@Column(name = "IS_ACTIVE")
	private Boolean isActive;

	@Transient
	@JsonProperty("batchId")
	private Long batchId;

	@Transient
	@JsonProperty("batchName")
	private String batchName;

	@JsonProperty("userImage")
	@Column(name = "user_image", columnDefinition = "text")
	private String userImage;

	@JsonProperty("coursesEnrolled")
	@Transient
	private Integer coursesEnrolled;

	@JsonProperty("totalAnnouncements")
	@Transient
	private Integer totalAnnouncements;
	
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "branch_id", referencedColumnName = "org_id")
	private OrganizationsDB organizationsDB;

	@JsonManagedReference
	@OneToOne(mappedBy = "userInfo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	private UserCredentialsDB userCredentialsDB;
	
	@ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	@JoinTable(
			name = "user_info_role_mapping",
			joinColumns = {@JoinColumn(name = "user_details_Id")},
			inverseJoinColumns = {@JoinColumn(name = "roles_Id")}
	)
	private Set<RolesDB> roles = new HashSet<>();

//	@ManyToMany(mappedBy = "tutors", fetch = FetchType.LAZY)
//	private Set<LibraryMasterDB> courses = new HashSet<>();
}

