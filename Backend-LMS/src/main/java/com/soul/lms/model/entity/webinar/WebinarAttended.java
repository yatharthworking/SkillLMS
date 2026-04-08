package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "webinar_attendance")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WebinarAttended extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_attendance_info")
    @SequenceGenerator(name = "webinar_attendance_info", sequenceName = "webinar_attendance_info", allocationSize = 1)
    @JsonProperty("webinarAttendanceId")
    @Column(name = "webinar_attendance_Id")
    private Long webinarAttendanceId;

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

}
