package com.soul.lms.model.entity.contactus;

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
@Table(name = "TXN_CONTACT_US")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactUsEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_contact_us")
    @SequenceGenerator(name = "seq_contact_us", sequenceName = "seq_contact_us", allocationSize = 1)
    @JsonProperty("contactUsId")
    @Column(name = "contact_us_id")
    private Long contactUsId;

    @JsonProperty("contactByName")
    @Column(name = "contact_by_name")
    private String contactByName;

    @JsonProperty("contactByEmail")
    @Column(name = "contact_by_email")
    private String contactByEmail;

    @JsonProperty("contactByMobile")
    @Column(name = "contact_by_mobile")
    private String contactByMobile;

    @Lob
    @JsonProperty("message")
    @Column(name = "message")
    private String message;
}
