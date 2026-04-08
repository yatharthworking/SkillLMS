package com.soul.lms.model.jparepository.rolemasterrepository;

import com.soul.lms.model.entity.modelmasters.RoleMaster;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoleMasterRepo extends JpaRepository<RoleMaster, Long>
{
	
	@Transactional
	@Query("SELECT a FROM RoleMaster a WHERE a.roleMasterCode = :roleMasterCode")
	Optional <RoleMaster> findRoleMasterByRoleMasterCode(@Param("roleMasterCode") String roleMasterCode);

	@Transactional
	@Query("SELECT a FROM RoleMaster a WHERE UPPER(a.roleMasterCode) = UPPER(:roleMasterCode)")
	Optional <RoleMaster> findRoleMasterByRoleMasterCodeIgnoreCase(@Param("roleMasterCode") String roleMasterCode);

	@Transactional
	@Query("SELECT a FROM RoleMaster a WHERE UPPER(a.roleMasterName) = UPPER(:roleMasterName)")
	Optional <RoleMaster> findRoleMasterByRoleMasterNameIgnoreCase(@Param("roleMasterName") String roleMasterName);

	@Transactional
	@Query("SELECT COUNT(DISTINCT ui.userDetailsId) FROM UserInfoDB ui JOIN ui.roles r WHERE r.roleMaster.roleMasterId = :roleMasterId AND ui.isActive = true")
	Long countActiveUsersByRoleMasterId(@Param("roleMasterId") Long roleMasterId);
	
}
