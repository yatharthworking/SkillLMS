package com.soul.lms.model.jparepository.registrationrepository;

import com.soul.lms.model.entity.modelregistration.registrationdb.UserCredentialsDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserCredentialsRepository extends JpaRepository<UserCredentialsDB, Long>
{
	@Transactional
	@Query("SELECT a FROM UserCredentialsDB a WHERE a.username = :username")
	Optional <UserCredentialsDB> findByUsername(@Param("username") String username);
	
}
