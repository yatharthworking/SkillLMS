package com.soul.lms.model.jparepository.webinarrepository;

import com.soul.lms.model.entity.webinar.WebinarAttended;
import com.soul.lms.model.entity.webinar.WebinarRegister;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;
import java.util.Optional;

public interface WebinarAttendedRepo extends JpaRepository<WebinarAttended,Long> {

    @Transactional
    @Query("SELECT wa.webinarInfoId FROM WebinarAttended wa WHERE wa.username = :username")
    Optional<Page<Long>> fetchAttendedWebinarsInfoIds(@Param("username") String username, Pageable pageable);

    @Transactional
    @Query("SELECT wa from WebinarAttended wa WHERE wa.webinarInfoId = :webinarInfoId")
    Optional<List<WebinarAttended>> fetchAttendedStudents(@Param("webinarInfoId") Long webinarInfoId);

    @Transactional
    @Query("SELECT wa from WebinarAttended wa WHERE wa.username = :userName AND wa.webinarInfoId = :webinarInfoId")
    Optional<WebinarAttended> alreadyAttendedWebinar(@Param("userName") String userName, @Param("webinarInfoId") Long webinarInfoId);
}
