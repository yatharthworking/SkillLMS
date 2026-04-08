package com.soul.lms.model.entity.modelmasters;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serial;
import java.io.Serializable;

@Entity
@Table(name = "COUNTRY_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CountryMaster implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_country_master_jpa")
    @SequenceGenerator(name = "seq_country_master_jpa", sequenceName = "seq_country_master", allocationSize = 1)
    @JsonProperty("id")
    private Long countryId;

    @JsonProperty("code")
    @Column(name = "countryCode")
    private String countryCode;

    @JsonProperty("phoneCode")
    @Column(name = "phoneCode")
    private String phoneCode;

    @JsonProperty("description")
    @Column(name = "description")
    private String description;

    @JsonProperty("isActive")
    @Column(name = "isActive")
    private Boolean isActive;

    @JsonProperty("nationality")
    @Column(name = "nationality")
    private String nationality;
}
