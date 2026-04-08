package com.soul.lms.model.jparepository.feedbackrepository;

import com.soul.lms.model.entity.feedback.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepo extends JpaRepository<FeedbackEntity, Long> {
}
