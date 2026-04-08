package com.soul.lms.model.entity.feedback;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.feedback.enumentity.FeedbackType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "TXN_USER_FEEDBACK")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedbackEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_user_feedback")
    @SequenceGenerator(name = "seq_user_feedback", sequenceName = "seq_user_feedback", allocationSize = 1)
    @JsonProperty("feedbackId")
    @Column(name = "feedback_id")
    private Long feedbackId;

    @Enumerated(EnumType.STRING)
    @JsonProperty("feedbackType")
    @Column(name = "feedback_type")
    private FeedbackType feedbackType;

    @Lob
    @JsonProperty("feedbackRemarks")
    @Column(name = "feedback_remarks")
    private String feedbackRemarks;

    @JsonProperty("feedbackRatings")
    @Column(name = "feedback_ratings")
    private Integer feedbackRatings;

    @JsonProperty("feedbackTestId")
    @Column(name = "feedback_test_id")
    private Long feedbackTestId;

    @JsonProperty("feedbackCourseId")
    @Column(name = "feedback_course_id")
    private Long feedbackCourseId;

    @JsonProperty("feedbackByUser")
    @Column(name = "feedback_by_user")
    private Long feedbackByUser;

    @Transient
    @JsonProperty("userName")
    private String userName;

}
