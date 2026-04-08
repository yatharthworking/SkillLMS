package com.soul.lms.model.entity.modelmasters.masterentitydb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "COURSE_CATEGORY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseCategoriesDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_course_category_jpa")
    @SequenceGenerator(name = "seq_course_category_jpa", sequenceName = "seq_course_category", allocationSize = 1)
    private Long courseCategoryId;

    @JsonProperty("categoryCode")
    @Column(name = "category_code")
    private String categoryCode;

    @JsonProperty("categoryName")
    @Column(name = "category_name")
    private String categoryName;

    @JsonProperty("categoryDesc")
    @Column(name = "category_desc", columnDefinition = "text")
    private String categoryDesc;
}
