package com.soul.lms.superadmin.service;

import com.soul.lms.model.entity.modelregistration.registrationdb.Privileges;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface SuperAdminServiceInterf
{
	ResponseEntity <RolesDB> addUpdatePrevileges(Long roleId, List <Privileges> privilegesList);

}
