package com.soul.lms.model.entity.modelregistration.graphqlentity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class RoleInput
{
	@NotNull
	@JsonProperty("role")
	private String role;
}
