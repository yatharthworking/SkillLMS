package com.soul.lms.model.entity.batchenrollment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BatchEnrollmentEntity {


    @NotNull
    @JsonProperty("userName")
    private List<String> userName;

    @NotNull
    @JsonProperty("batchId")
    private Long batchId;

}
