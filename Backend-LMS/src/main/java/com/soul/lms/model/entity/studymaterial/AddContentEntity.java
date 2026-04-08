package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddContentEntity {

    @JsonProperty("chapterId")
    private Long chapterId;

    @JsonProperty("content")
    private ContentsDB content;
}
