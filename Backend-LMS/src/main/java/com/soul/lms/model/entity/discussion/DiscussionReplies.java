//package com.soul.lms.model.entity.discussion;
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonProperty;
//import com.soul.lms.commonentity.WhoseColumnsEntity;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.EqualsAndHashCode;
//import lombok.NoArgsConstructor;
//
//import java.io.Serializable;
//
//
//@EqualsAndHashCode(callSuper = false)
//@Entity
//@Table(name = "TXN_DISCUSSION_REPLIES")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class DiscussionReplies extends WhoseColumnsEntity implements Serializable {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_discussion_replies")
//    @SequenceGenerator(name = "seq_discussion_replies", sequenceName = "seq_discussion_replies", allocationSize = 1)
//    @JsonProperty("discussionReplyId")
//    @Column(name = "discussion_reply_id")
//    private Long discussionReplyId;
//
//
//    @Lob
//    @JsonProperty("discussionReply")
//    @Column(name = "discussion_reply", columnDefinition = "CLOB")
//    private String discussionReply;
//
//
//    @JsonBackReference(value = "libraryMaster")
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "discussionQuestionId")
//    private DiscussionQuestions discussionQuestions;
//
//}
