package com.soul.lms.model.entity.modelregistration.graphqlentity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordEntity {

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("newPassword")
    private String newPassword;
}
