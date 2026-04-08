package com.soul.lms.model.entity.modelstudent;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentEntity {

    @NotNull
    @JsonProperty("userName")
    private String userName;

    @NotNull
    @JsonProperty("courseId")
    private Long courseId;

    @JsonProperty("paymentStatus")
    private String paymentStatus;

}
