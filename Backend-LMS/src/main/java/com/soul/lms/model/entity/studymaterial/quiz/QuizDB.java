package com.soul.lms.model.entity.studymaterial.quiz;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
//import com.soul.lms.model.entity.modelmasters.masterentitydb.LessonsDB;
import com.soul.lms.model.entity.studymaterial.ChaptersDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false, exclude = {"chaptersDB"})
@Table(name = "FND_QUIZ_MASTER")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizDB extends WhoseColumnsEntity implements Serializable  {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "quiz_master_info")
    @SequenceGenerator(name = "quiz_master_info", sequenceName = "quiz_master_info", allocationSize = 1)
    @JsonProperty("quizId")
    @Column(name = "quiz_id")
    private Long quizId;

    @JsonProperty("quizName")
    @Column(name = "quiz_name", nullable = false)
    private String quizName;


    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("quizQuestions")
    @JsonManagedReference
    @OneToMany(mappedBy = "quizDB", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestionsDB> quizQuestionsDBList = new ArrayList<>();



    @JsonBackReference
    @OneToOne(mappedBy = "quizDB", cascade = CascadeType.ALL)
    private ChaptersDB chaptersDB;
}
