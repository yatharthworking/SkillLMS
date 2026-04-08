package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "enrolled_chapters")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class EnrolledChaptersDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "enrolled_chapters_info")
    @SequenceGenerator(name = "enrolled_chapters_info", sequenceName = "enrolled_chapters_info", allocationSize = 1)
    @JsonProperty("enrolledChapterId")
    @Column(name = "enrolled_chapter_id")
    private Long enrolledChapterId;

    @NotNull(message = "chapter_id cannot be null")
    @JsonProperty("chapterId")
    @Column(name = "chapter_id",nullable = false)
    private Long chapterId;
    
    @JsonProperty("chapterName")
    @Column(name = "chapter_name")
    private String chapterName;
    
    //Storing username inplace of userId since in Login Response client side is getting only username
    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    @Column(name = "username",nullable = false)
    private String username;

    @JsonProperty("isCompleted")
    @Column(name = "is_completed")
    private Boolean isCompleted;
    
    
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_enrollment_Id")
    private MaterialEnrollmentDB materialEnrollmentDB;
    
    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

}
