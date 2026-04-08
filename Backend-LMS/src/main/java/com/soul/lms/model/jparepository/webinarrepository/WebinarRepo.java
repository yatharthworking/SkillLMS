package com.soul.lms.model.jparepository.webinarrepository;

import com.soul.lms.model.entity.webinar.WebinarEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface WebinarRepo extends JpaRepository<WebinarEntity, Long> {

    //have made the searchDate and webinarId not mandatory as in some cases I will be sending only webinarDate and in some cases I will be sending
    //only webinarId for searching purpose
    //@Transactional
//    @Query("SELECT w FROM WebinarEntity w WHERE (:searchDate IS NULL OR w.webinarDate = :searchDate) AND (:webinarId IS NULL OR w.webinarId = :webinarId)")
    Optional<WebinarEntity> findByWebinarDate(LocalDate webinarDate);

    @Transactional
    @Query("SELECT w FROM WebinarEntity w WHERE w.webinarDate >= :today ORDER BY w.webinarDate ASC")
    Optional<List<WebinarEntity>> findWebinarsFromDate(@Param("today") LocalDate today);

}
