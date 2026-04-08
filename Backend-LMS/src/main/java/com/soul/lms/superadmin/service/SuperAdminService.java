package com.soul.lms.superadmin.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.modelregistration.registrationdb.Privileges;
import com.soul.lms.model.entity.modelregistration.registrationdb.RolesDB;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service("superAdminService")
public class SuperAdminService implements SuperAdminServiceInterf
{
     private final LmsDaoInterf lmsDaoInterf;
	
	 @Autowired
	public SuperAdminService(LmsDaoInterf lmsDaoInterf){
		 super();
		 this.lmsDaoInterf = lmsDaoInterf;
	}
	
	//logger
	private final Logger logger = LogManager.getLogger(SuperAdminService.class);
	
	 @Override
	 public ResponseEntity<RolesDB> addUpdatePrevileges(Long roleId, List <Privileges> privilegesList)
	{
		try
		{
			Optional <RolesDB> fetchRole = lmsDaoInterf.getRole(roleId);
			
			if(fetchRole.isPresent())
			{
				if(!Objects.isNull(privilegesList) && !privilegesList.isEmpty())
				{
					List<Privileges> existingPrivilegesList = fetchRole.get().getPrivileges();
					
					privilegesList.forEach(privilege -> {
						
						Optional<Privileges> existingPrivilege = existingPrivilegesList.stream().filter(priv -> !Objects.isNull(privilege.getPrivilegesId()) && !Objects.equals(privilege.getPrivilegesId(), priv.getPrivilegesId())).findFirst();
						
						if(existingPrivilege.isPresent())
						{
							int index = existingPrivilegesList.indexOf(existingPrivilege.get());
							
							existingPrivilege.get().setPrivilegesName(privilege.getPrivilegesName());
							existingPrivilege.get().setPrivilegesCode(privilege.getPrivilegesCode());
							
							//whose who is column
							existingPrivilege.get().setUpdatedBy(privilege.getUpdatedBy());
							existingPrivilege.get().setUpdationTimeStamp(LocalDateTime.now());
							
							//setting reference
							existingPrivilege.get().setRolesDB(fetchRole.get());
							
							//updating an object in a list
							privilegesList.set(index, existingPrivilege.get());
						}
						else
						{
							Privileges newPrivilege = new Privileges();
							
							newPrivilege.setPrivilegesName(privilege.getPrivilegesName());
							newPrivilege.setPrivilegesCode(privilege.getPrivilegesCode());
							
							//whose who is column
							newPrivilege.setUpdatedBy(privilege.getUpdatedBy());
							newPrivilege.setUpdationTimeStamp(LocalDateTime.now());
							
							//setting reference
							newPrivilege.setRolesDB(fetchRole.get());
							
							//adding an object in a list
							existingPrivilegesList.add(newPrivilege);
						}
						
					});
					
					//setting a privilege list in a roleDb object
					fetchRole.get().setPrivileges(existingPrivilegesList);
					
					RolesDB rolesDB = lmsDaoInterf.saveRole(fetchRole.get());
					
					if(!Objects.isNull(rolesDB))
					{
						return ResponseEntity.ok(rolesDB);
					}
					
					else
					{
						return ResponseEntity.unprocessableEntity().build();
					}
				}
				else
				{
					return ResponseEntity.badRequest().build();
				}
			}
			
			else
				return ResponseEntity.unprocessableEntity().build();
		}
		
		catch(Exception e)
		{
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return ResponseEntity.internalServerError().build();
		}
	}
}
