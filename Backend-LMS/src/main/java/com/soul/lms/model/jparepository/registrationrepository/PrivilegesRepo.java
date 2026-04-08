package com.soul.lms.model.jparepository.registrationrepository;

import com.soul.lms.model.entity.modelregistration.registrationdb.Privileges;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivilegesRepo extends JpaRepository<Privileges, Long>
{

}
