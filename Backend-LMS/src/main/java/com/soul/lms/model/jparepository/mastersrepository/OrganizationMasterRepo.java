package com.soul.lms.model.jparepository.mastersrepository;

import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationMasterDB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OrganizationMasterRepo extends JpaRepository<OrganizationMasterDB, Long> {

    @Transactional
    @Query("SELECT o FROM OrganizationMasterDB o WHERE o.organizationId = :organizationId AND o.isActive = true")
    Optional<OrganizationMasterDB> findOrganizationMasterById(@Param("organizationId") Long organizationId);

    @Transactional
    @Query("SELECT o FROM OrganizationMasterDB o WHERE o.organizationCode = :organizationCode")
    Optional<OrganizationMasterDB> findOrganizationMasterByCode(@Param("organizationCode") String organizationCode);
}
