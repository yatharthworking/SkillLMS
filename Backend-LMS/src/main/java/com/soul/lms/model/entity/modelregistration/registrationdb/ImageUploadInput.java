package com.soul.lms.model.entity.modelregistration.registrationdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadInput {

    @JsonProperty("userDetailsId")
    private Long userDetailsId;

    @Lob
    @JsonProperty("userImage")
    private String userImage;


}
