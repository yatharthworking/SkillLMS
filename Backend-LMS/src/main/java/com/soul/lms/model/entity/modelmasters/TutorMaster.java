package com.soul.lms.model.entity.modelmasters;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "FND_TUTOR_MASTER")
public class TutorMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_tutor_master_jpa")
    @SequenceGenerator(name = "seq_tutor_master_jpa", sequenceName = "seq_tutor_master", allocationSize = 1)
    @JsonProperty("tutorMasterId")
    private Long tutorMasterId;

    @JsonProperty("fullName")
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @JsonProperty("email")
    @Email
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @JsonProperty("gender")
    @Column(name = "gender")
    private String gender;

    @JsonProperty("mobileNo")
    @Column(name = "mobile_no", unique = true)
    private Long mobileNo;

    @JsonProperty("dob")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    @Column(name = "dob")
    private LocalDate dob;

    @JsonProperty("userInfoId")
    @Column(name = "USER_INFO_ID", nullable = false)
    private Long userInfoId;

}