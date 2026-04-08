package com.soul.lms.masters.service;

import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationMasterDB;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MastersServiceInterf {

    ResponseEntity<Map<String,Object>> fetchOrganizationMaster(Long organizationMasterId);

    ResponseEntity<Map<String,Object>> fetchOrganizationsBranches(Long organizationMasterId, Long userId);

    List<OrganizationMasterDB> saveOrUpdateOrganizationMaster(List<OrganizationMasterDB> organizationMasterDB);

    ResponseEntity<Map<String, Object>> saveOrUpdateLiveClasses(LiveClassEntity liveClassEntity);

    ResponseEntity<Map<String, Object>> fetchAllUpcomingBatchesByBranch(Optional<Long> orgId, int page, int size);

    ResponseEntity<Map<String, Object>> fetchAllOngoingBatchesByBranch(Optional<Long> orgId, int page, int size);

    ResponseEntity<Map<String, Object>> fetchAllCompletedBatchesByBranch(Optional<Long> orgId, int page, int size);

    ResponseEntity<Map<String,Object>> fetchAllBatchesByOrganizations(Optional<Long> orgId);

    ResponseEntity<Map<String,Object>> saveOrUpdateBatchMaster(BatchDB batchInput);

    ResponseEntity<Map<String,Object>> fetchAllStudentEnrollmentsByBatchId(Long batchId, int page, int size);

    ResponseEntity<Map<String,Object>> fetchAllTutorEnrollmentsByBatchId(Long batchId, int page, int size);

//    ResponseEntity<Map<String,Object>> fetchAllAnnouncementsByBatchId(Long batchId, int page, int size);

    ResponseEntity<Map<String, Object>> batchMaster();

    ResponseEntity<Map<String, Object>> saveOrUpdateRoleMaster (RoleMaster roleMaster);

    ResponseEntity<Map<String, Object>> fetchRoleMaster();

    ResponseEntity<Map<String, Object>> addOrEditSubjectMaster(SubjectMasterDB subjectMasterDB);

    ResponseEntity<Map<String, Object>> fetchSubjectMaster();
}
