package com.soul.lms.model.entity.modelonetimepassword.onetimepassworddb;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelonetimepassword.enumentity.Medium;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import jakarta.persistence.*;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_OTP")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OneTimePasswordEntityDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "Seq_otp_jpa")
    @SequenceGenerator(name = "Seq_otp_jpa", sequenceName = "Seq_otp", allocationSize = 1)
    private Long otpId;

    @NotNull
    @JsonProperty("identifier")
    @Column(name = "IDENTIFIER", nullable = false)
    private String identifier;

    @NotNull
    @Enumerated(EnumType.STRING)
    @JsonProperty("medium")
    @Column(name = "MEDIUM", nullable = false)
    private Medium medium;

    @NotNull
    @JsonProperty("otp")
    @Column(name = "OTP", nullable = false)
    private Integer otp;

    @JsonProperty("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    private UserInfoDB userId;

}
