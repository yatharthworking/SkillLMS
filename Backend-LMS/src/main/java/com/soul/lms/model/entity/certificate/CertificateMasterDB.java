package com.soul.lms.model.entity.certificate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.CourseMaster;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "certificate_master")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CertificateMasterDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "certificate_master_info")
    @SequenceGenerator(name = "certificate_master_info", sequenceName = "certificate_master_info",allocationSize = 1)
    @JsonProperty("certificateId")
    @Column(name = "certificate_id")
    private Long certificateId;
    
    @JsonProperty("uniqueCertificateId")
    @Column(name = "unq_certificate_id")
    private Long uniqueCertificateId;
    
    //Storing userName inplace of userId since in Login Response client side is getting only userName
    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    @Column(name = "username",nullable = false)
    private String username;

    @Lob
    @JsonProperty("certificate")
    @Column(name = "CERTIFICATE")
    private byte[] content;

}
