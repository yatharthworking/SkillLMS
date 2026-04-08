package com.soul.lms.model.jparepository.webinarrepository;

import com.soul.lms.model.entity.webinar.WebinarWatchProgress;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WebinarWatchProgressRepo extends JpaRepository<WebinarWatchProgress, Long> {

    @Transactional
    Optional<WebinarWatchProgress> findByUsernameAndWebinarInfoId(String username, Long webinarInfoId);

    @Transactional
    List<WebinarWatchProgress> findByUsername(String username);
}
