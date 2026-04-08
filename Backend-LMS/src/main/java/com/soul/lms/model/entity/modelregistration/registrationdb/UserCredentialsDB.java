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

@EqualsAndHashCode(callSuper = false, exclude = {"userInfo"})
@Table(name = "USER_CREDENTIALS_DB")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCredentialsDB extends WhoseColumnsEntity implements Serializable
{
   @Serial
   private static final long serialVersionUID = 1L;
   
   @Id
   @GeneratedValue(strategy = GenerationType.AUTO, generator = "user_Credential")
   @SequenceGenerator(name = "user_Credential", sequenceName = "user_Credential", allocationSize = 1)
   @JsonProperty("userCredentialId")
   @Column(name = "user_Credential_Id")
   private Long userCredentialId;
   
   @JsonProperty("username")
   @Column(name = "user_name", unique = true, nullable = false)
   private String username;
   
   @JsonProperty("password")
   @Column(name = "user_password", nullable = false)
   private String password;
   
   @JsonBackReference
   @OneToOne(fetch = FetchType.EAGER)
   @JoinColumn(name = "user_Details_Id", referencedColumnName = "user_Details_Id")
   private UserInfoDB userInfo;
   
}
