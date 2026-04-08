package com.soul.lms.model.entity.modelregistration.graphqlentity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UserCredentialsInput
{
	@JsonProperty("username")
	private String username;

	@NotNull
	@JsonProperty("password")
	private String password;
}
