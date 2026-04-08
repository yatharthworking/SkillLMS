package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Table(name = "webinar_registration")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WebinarRegister extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_registration_seq")
    @SequenceGenerator(name = "webinar_registration_seq", sequenceName = "webinar_registration_seq", allocationSize = 1)
    @JsonProperty("webinarRegId")
    @Column(name = "webinar_registration_Id")
    private Long webinarRegId;

    @NotNull(message = "webinar_id cannot be null")
    @JsonProperty("webinarId")
    @Column(name = "webinar_id",nullable = false)
    private Long webinarId;

    @NotNull(message = "webinar_info_id cannot be null")
    @JsonProperty("webinarInfoId")
    @Column(name = "webinar_info_id",nullable = false)
    private Long webinarInfoId;

    //Storing userName inplace of userId since in Login Response client side is getting only userName
    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    @Column(name = "username",nullable = false)
    private String username;

    @NotBlank(message = "webinar Registration Date Time cannot be empty")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm")
    @JsonProperty("webinarRegDateTime")
    @Column(name = "webinar_reg_date_time", nullable = false)
    private LocalDateTime webinarRegDateTime;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

}
