package com.soul.lms.model.entity.modelregistration.graphqlentity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.soul.lms.model.entity.modelregistration.enumentity.Provider;
import jakarta.persistence.*;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class UserInfoInput
{
	
	@NotNull
	@JsonProperty("fullName")
	private String fullName;
	
	@NotNull
	@JsonProperty("email")
	private String email;
	
	@JsonProperty("gender")
	private String gender;
	
	@JsonProperty("mobileNo")
	private Long mobileNo;

	@JsonProperty("branchId")
	private Long branchId;

	@JsonProperty("branchName")
	private String branchName;
	
	@JsonProperty("dob")
	@JsonSerialize(using = LocalDateSerializer.class)
	@JsonDeserialize(using = LocalDateDeserializer.class)
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	private LocalDate dob;
	
	@JsonProperty("isMobileVerified")
	private Boolean isMobileVerified;
	
	@JsonProperty("isEmailVerified")
	private Boolean isEmailVerified;
	
	@Enumerated(EnumType.STRING)
	@JsonProperty("provider")
	private Provider provider;
	
	@NotNull
	@JsonProperty("userCredentialsInput")
	private UserCredentialsInput userCredentialsInput;
	
	@NotNull
	@JsonProperty("roles")
	private List <RoleInput> roles = new ArrayList <>();
}
