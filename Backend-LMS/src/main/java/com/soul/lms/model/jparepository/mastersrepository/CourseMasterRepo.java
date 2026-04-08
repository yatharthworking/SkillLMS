package com.soul.lms.model.jparepository.mastersrepository;


import com.soul.lms.model.entity.modelmasters.CourseMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseMasterRepo extends JpaRepository<CourseMaster, Long>{
}
