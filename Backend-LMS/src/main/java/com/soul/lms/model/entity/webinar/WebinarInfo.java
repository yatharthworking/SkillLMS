package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "webinar_info")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WebinarInfo extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_info_seq")
    @SequenceGenerator(name = "webinar_info_seq", sequenceName = "webinar_info_seq", allocationSize = 1)
    @JsonProperty("webinarInfoId")
    @Column(name = "webinar_info_Id")
    private Long webinarInfoId;

    @NotBlank(message = "webinar name cannot be empty")
    @JsonProperty("webinarName")
    @Column(name = "webinar_name", nullable = false)
    private String webinarName;

    @NotBlank(message = "webinar start Time cannot be empty")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("webinarStartTime")
    @Column(name = "webinar_start_time", nullable = false)
    private LocalDateTime webinarStartTime;

    @NotBlank(message = "webinar End Time cannot be empty")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("webinarEndTime")
    @Column(name = "webinar_end_time", nullable = false)
    private LocalDateTime webinarEndTime;

    @NotBlank(message = "webinar Registration start Time cannot be empty")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("webinarRegStartTime")
    @Column(name = "webinar_reg_start_time", nullable = false)
    private LocalDateTime webinarRegStartTime;

    @NotBlank(message = "webinar Registration End Time cannot be empty")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("webinarRegEndTime")
    @Column(name = "webinar_reg_end_time", nullable = false)
    private LocalDateTime webinarRegEndTime;

    @NotNull(message = "webinar registration price cannot be null")
    @JsonProperty("webinarRegPrice")
    @Column(name = "webinar_reg_price", nullable = false)
    private Double webinarRegPrice;

//    @NotBlank(message = "subject cannot be blank")
//    @JsonProperty("subject")
//    @Column(name = "subject", nullable = false)
//    private String subject;

    //To store number of registrations of webinars
    @JsonProperty("webinarRegistrations")
    @Column(name = "webinar_registrations")
    private Integer webinarRegistrations;

    //Meeting link can be blank initially and can be added later on
    @JsonProperty("meetingLink")
    @Column(name = "meeting_link")
    private String meetingLink;

    @JsonProperty("recordingUrl")
    @Column(name = "recording_url")
    private String recordingUrl;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("webinarImage")
    @Column(name = "webinar_image", columnDefinition = "bytea")
    private byte[] webinarImageDB;

    @JsonProperty("registrationType")
    @Column(name = "REGISTRATION_TYPE")
    private String registrationType;

    @JsonProperty("currency")
    @Column(name = "CURRENCY")
    private String currency;

    @JsonProperty("keyTakeaways")
    @NotEmpty(message = "keyTakeaways List cannot be empty")
    @JsonManagedReference
    @OneToMany(mappedBy = "webinarInfo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KeyTakeawaysEntity> keyTakeawaysEntityList = new ArrayList<>();

    @JsonProperty("audiences")
    @NotEmpty(message = "audience List cannot be empty")
    @JsonManagedReference
    @OneToMany(mappedBy = "webinarInfo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AudienceEntity> audienceEntityList = new ArrayList<>();

    @JsonProperty("speakers")
    @NotEmpty(message = "speakers List cannot be empty")
    @JsonManagedReference
    @OneToMany(mappedBy = "webinarInfo", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpeakerEntity> speakerEntityList = new ArrayList<>();

    @JsonBackReference
    @JoinColumn(name = "webinar_id")
    @ManyToOne(fetch = FetchType.EAGER)
    private WebinarEntity webinarEntity;

    @JsonBackReference(value = "webinarSubjectMasterParent")
    @JoinColumn(name = "subject_Master_Id")
    @ManyToOne(fetch = FetchType.EAGER)
    private SubjectMasterDB subjectMasterDB;


    @NotBlank(message = "webinar Date cannot be empty")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @Transient
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @JsonProperty("webinarDate")
    private LocalDate webinarDate;

    @Transient
    @JsonProperty("webinarId")
    private Long webinarId;


    @Transient
    @JsonProperty("subjectName")
    private String subjectName;

    @Transient
    @JsonProperty("subjectId")
    private Long subjectId;
}
