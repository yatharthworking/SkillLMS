package com.soul.lms.superadmin.controller;

import com.soul.lms.model.entity.modelregistration.registrationdb.Privileges;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import com.soul.lms.superadmin.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/super-admin")
@CrossOrigin
public class SuperAdminController
{
	
	private final SuperAdminService superAdminService;
	
	@Autowired
	public SuperAdminController(SuperAdminService superAdminService){
		super();
		this.superAdminService = superAdminService;
	}
	
	@PatchMapping("/save-update-preveleges")
	public ResponseEntity<RolesDB> saveUpdatePreveleges(@RequestParam Long roleId, @RequestBody List <Privileges> privilegesList)
	{
		return superAdminService.addUpdatePrevileges(roleId, privilegesList);
	}
	
}
