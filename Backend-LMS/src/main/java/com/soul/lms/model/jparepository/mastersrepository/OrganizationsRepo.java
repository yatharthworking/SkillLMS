package com.soul.lms.model.jparepository.mastersrepository;

import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationsDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrganizationsRepo extends JpaRepository<OrganizationsDB, Long> {

    @Transactional
    @Query("SELECT om FROM OrganizationsDB om WHERE om.isActive = true AND om.organizationMasterDB.isActive = true AND om.organizationMasterDB.organizationId = :organizationId")
    List<OrganizationsDB> findOrganizationsByMasterId(@Param("organizationId") Long organizationId);

    @Transactional
    @Query("SELECT o FROM OrganizationsDB o INNER JOIN o.organizationMasterDB om WHERE o.isActive = true AND om.isActive = true AND o.orgId = :orgId")
    Optional<OrganizationsDB> findOrganizationsById(@Param("orgId") Long orgId);
}
