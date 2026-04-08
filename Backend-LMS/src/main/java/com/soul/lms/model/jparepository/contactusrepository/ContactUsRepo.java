package com.soul.lms.model.jparepository.contactusrepository;

import com.soul.lms.model.entity.contactus.ContactUsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactUsRepo extends JpaRepository<ContactUsEntity, Long> {
}
