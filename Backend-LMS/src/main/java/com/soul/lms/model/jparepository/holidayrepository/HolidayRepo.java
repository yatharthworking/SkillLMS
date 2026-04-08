package com.soul.lms.model.jparepository.holidayrepository;

import com.soul.lms.model.entity.holiday.HolidayMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface HolidayRepo extends JpaRepository<HolidayMaster, Long> {

    @Transactional
    @Query("SELECT h FROM HolidayMaster h WHERE h.isActive = true AND h.organizationsDB.orgId = :branchId ORDER BY h.creationTimeStamp DESC")
    List<HolidayMaster> findAllHolidays(@Param("branchId") Long branchId);


    @Transactional
    @Query("SELECT h FROM HolidayMaster h WHERE h.isActive = true AND h.organizationsDB.orgId = :branchId AND h.holidayFromDate = :date")
    List<HolidayMaster> findHolidaysDateWise(@Param("branchId") Long branchId, @Param("date") LocalDate date);

}
