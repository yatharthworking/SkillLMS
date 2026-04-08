package com.soul.lms.model.entity.modelmasters;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Data
@NoArgsConstructor@AllArgsConstructor
@Entity
@Table(name = "FND_COURSE_MASTER",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"courseId", "courseCode", "courseName"})
        }
)
public class CourseMaster extends WhoseColumnsEntity implements Serializable {

    @Id
    @JsonProperty("courseId")
    @Column(name = "COURSE_ID")
    private Long courseId;

    @JsonProperty("courseName")
    @Column(name = "COURSE_NAME")
    private String courseName;

    @JsonProperty("courseCode")
    @Column(name = "COURSE_CODE")
    private String courseCode;


    @JsonProperty("coursePrice")
    private Double coursePrice;
}
