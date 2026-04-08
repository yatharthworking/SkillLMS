package com.soul.lms.model.jparepository.registrationrepository;

import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserInfoRepository extends JpaRepository <UserInfoDB, Long>
{

	@Transactional
	@Query("SELECT a FROM UserInfoDB a WHERE a.email = :email")
	Optional <UserInfoDB> findByEmail(@Param("email") String email);

	@Transactional
	@Query("SELECT a FROM UserInfoDB a WHERE a.mobileNo = :mobileNo")
	Optional <UserInfoDB> findByMobileNo(@Param("mobileNo") Long mobileNo);

	@Transactional
	@Query("SELECT a FROM UserInfoDB a WHERE (:userDetailsId IS NULL OR a.userDetailsId = :userDetailsId)")
	Optional <UserInfoDB> findByUserDetailsId(@Param("userDetailsId") Long userDetailsId);
}
