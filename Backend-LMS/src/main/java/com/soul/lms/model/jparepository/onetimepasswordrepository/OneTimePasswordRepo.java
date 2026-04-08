package com.soul.lms.model.jparepository.onetimepasswordrepository;

import com.soul.lms.model.entity.modelonetimepassword.onetimepassworddb.OneTimePasswordEntityDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OneTimePasswordRepo extends JpaRepository<OneTimePasswordEntityDB, Long> {

    @Query("SELECT o FROM OneTimePasswordEntityDB o WHERE identifier = :identifier ORDER BY otpId DESC FETCH FIRST 1 ROW ONLY")
    Optional<OneTimePasswordEntityDB> findByIdentifier(@Param("identifier") String identifier);
}
