package com.soul.lms.model.entity.modelonetimepassword.graphqlentity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.model.entity.modelonetimepassword.enumentity.Medium;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
public class OneTimePasswordInput
{

    @JsonProperty("identifier")
    private String identifier;

    @Enumerated(EnumType.STRING)
    @JsonProperty("medium")
    private Medium medium;

    @JsonProperty("otp")
    private Integer otp;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("userId")
    private UserInfoDB userId;
    
    
}
