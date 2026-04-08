package com.soul.lms.model.entity.studymaterial;

import com.fasterxml.jackson.annotation.*;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.ContentsDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizDB;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "chapter_master")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ChaptersDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "chapter_master_info")
    @SequenceGenerator(name = "chapter_master_info", sequenceName = "chapter_master_info", allocationSize = 1)
    @JsonProperty("chapterId")
    @Column(name = "chapter_id")
    private Long chapterId;

    @JsonProperty("chapterName")
    @Column(name = "chapter_name", nullable = false)
    private String chapterName;

    @JsonProperty("chapterCode")
    @Column(name = "chapter_code", nullable = false)
    private String chapterCode;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;


    @JsonManagedReference
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "quiz_id")
    private QuizDB quizDB;

    @JsonManagedReference
    @OneToMany(mappedBy = "chaptersDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContentsDB> contentsDBList = new ArrayList<>();

    @JsonBackReference
    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "material_id")
    private LibraryMasterDB libraryMasterDB;
}
