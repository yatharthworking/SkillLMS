package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddChapterEntity {

    @JsonProperty("materialId")
    private Long materialId;

    @JsonProperty("chapter")
    private List<ChaptersDB> chapters;
}
