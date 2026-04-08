package com.soul.lms.model.entity.email;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailEntity {

    @JsonProperty("to")
    private String to;

    @JsonProperty("from")
    private String from;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("singleContent")
    private String singleContent;

    @JsonProperty("messageHeader")
    private String messageHeader;

    @JsonProperty("messageBodyP1")
    private String messageBodyP1;

    @JsonProperty("messageBodyP2")
    private String messageBodyP2;

    @JsonProperty("messageBodyP3")
    private String messageBodyP3;

    @JsonProperty("messageFooter")
    private String messageFooter;

}
