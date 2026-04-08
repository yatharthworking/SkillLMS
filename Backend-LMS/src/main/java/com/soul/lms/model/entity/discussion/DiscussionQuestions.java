//package com.soul.lms.model.entity.discussion;
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//import com.fasterxml.jackson.annotation.JsonProperty;
//import com.soul.lms.commonentity.WhoseColumnsEntity;
//import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.EqualsAndHashCode;
//import lombok.NoArgsConstructor;
//
//import java.io.Serial;
//import java.io.Serializable;
//import java.util.ArrayList;
//import java.util.List;
//
//@EqualsAndHashCode(callSuper = false)
//@Entity
//@Table(name = "TXN_DISCUSSION_QUESTIONS")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class DiscussionQuestions extends WhoseColumnsEntity implements Serializable {
//
//    @Serial
//    private static final long serialVersionUID = 1L;
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_discussion_questions")
//    @SequenceGenerator(name = "seq_discussion_questions", sequenceName = "seq_discussion_questions", allocationSize = 1)
//    @JsonProperty("discussionQuestionId")
//    @Column(name = "discussion_question_id")
//    private Long discussionQuestionId;
//
//
//    @Lob
//    @JsonProperty("discussionQuestion")
//    @Column(name = "discussion_question", columnDefinition = "CLOB")
//    private String discussionQuestion;
//
//
//    @JsonManagedReference
//    @JsonProperty("discussionReplies")
//    @OneToMany(mappedBy = "DiscussionQuestions", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
//    private List<DiscussionReplies> discussionReplies = new ArrayList<>();
//
//
//    @JsonBackReference(value = "libraryMaster")
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "materialId")
//    private LibraryMasterDB libraryMasterDB;
//
//}
