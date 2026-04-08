package com.soul.lms.model.jparepository.webinarrepository;

import com.soul.lms.model.entity.webinar.WebinarRegister;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WebinarRegisterRepo extends JpaRepository<WebinarRegister, Long> {

    @Transactional
    @Query("SELECT wr.webinarInfoId FROM WebinarRegister wr WHERE wr.username = :username")
    Optional<Page<Long>> fetchRegisteredWebinarInfoIds(@Param("username") String username, Pageable pageable);

    @Transactional
    @Query("SELECT wr from WebinarRegister wr WHERE wr.webinarInfoId = :webinarInfoId")
    Optional<List<WebinarRegister>> fetchRegisteredStudents(@Param("webinarInfoId") Long webinarInfoId);

    @Transactional
    @Query("SELECT wr.webinarInfoId FROM WebinarRegister wr WHERE wr.username = :username")
    Optional<List<Long>> fetchRegisteredWebinarInfoByStudent(@Param("username") String username);

    Boolean existsByUsernameAndWebinarInfoId(String username, Long webinarInfoId);

}
