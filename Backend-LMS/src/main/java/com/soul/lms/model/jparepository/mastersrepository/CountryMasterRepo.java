package com.soul.lms.model.jparepository.mastersrepository;

import com.soul.lms.model.entity.modelmasters.CountryMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryMasterRepo extends JpaRepository<CountryMaster, Long> {
}
