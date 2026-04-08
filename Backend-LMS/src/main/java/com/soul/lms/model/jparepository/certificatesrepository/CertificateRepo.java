package com.soul.lms.model.jparepository.certificatesrepository;

import com.soul.lms.model.entity.certificate.CertificateMasterDB;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CertificateRepo extends JpaRepository<CertificateMasterDB,Long> {

    @Transactional
    @Query("SELECT c FROM CertificateMasterDB c WHERE c.username = :username")
    Optional<List<CertificateMasterDB>> fetchCertificates(@Param("username") String username);
}
