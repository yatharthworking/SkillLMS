package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "speaker_master")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString
public class SpeakerEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "speaker_master_info")
    @SequenceGenerator(name = "speaker_master_info", sequenceName = "speaker_master_info", allocationSize = 1)
    @JsonProperty("speakerId")
    @Column(name = "speaker_id")
    private Long speakerId;

    @NotBlank(message = "name of the speaker cannot be empty")
    @JsonProperty("name")
    @Column(name = "name", nullable = false)
    private String name;

    @JsonProperty("designation")
    @Column(name = "designation")
    private String designation;

    @JsonProperty("about")
    @Lob
    @Column(name = "about")
    private String about;

    @JsonProperty("emailId")
    @Column(name = "email_id")
    private String emailId;


    @JsonBackReference
    @JoinColumn(name = "webinar_info_Id")
    @ManyToOne(fetch = FetchType.LAZY)
    private WebinarInfo webinarInfo;

}
