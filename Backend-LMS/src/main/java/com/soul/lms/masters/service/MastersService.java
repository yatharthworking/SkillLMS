package com.soul.lms.masters.service;

import com.google.common.base.Strings;
import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.helper.HelperInterf;
import com.soul.lms.model.entity.announcement.AnnouncementEntity;
import com.soul.lms.model.entity.batchenrollment.BatchStudentEnrollmentsDB;
import com.soul.lms.model.entity.batchenrollment.BatchTutorEnrollmentDB;
import com.soul.lms.model.entity.batchrelation.BatchCourseRelationEntity;
import com.soul.lms.model.entity.liveclass.LiveClassEntity;
import com.soul.lms.model.entity.liveclass.LiveClassesEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.*;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.modelmasters.RoleMaster;
import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service("mastersService")
public class MastersService implements MastersServiceInterf{
	private static final Set<String> SYSTEM_ROLE_NAMES = Set.of("ADMIN", "SUPER_ADMIN", "TEACHER", "STUDENT");

	private final LmsDaoInterf lmsDaoInterf;

	private final HelperInterf helperInterf;

	@Autowired
	public MastersService(LmsDaoInterf lmsDaoInterf, HelperInterf helperInterf){
		this.lmsDaoInterf = lmsDaoInterf;
		this.helperInterf = helperInterf;
	}

	//logger
	private final Logger logger = LogManager.getLogger(MastersService.class);

	private BatchDB buildBatchSummary(BatchDB batchDB) {
		BatchDB summary = new BatchDB();

		summary.setBatchId(batchDB.getBatchId());
		summary.setBatchName(batchDB.getBatchName());
		summary.setBatchCapacity(batchDB.getBatchCapacity());
		summary.setBatchStartDateTime(batchDB.getBatchStartDateTime());
		summary.setBatchEndDateTime(batchDB.getBatchEndDateTime());
		summary.setIsActive(batchDB.getIsActive());
		summary.setCreatedBy(batchDB.getCreatedBy());
		summary.setUpdatedBy(batchDB.getUpdatedBy());
		summary.setCreationTimeStamp(batchDB.getCreationTimeStamp());
		summary.setUpdationTimeStamp(batchDB.getUpdationTimeStamp());

		summary.setTotalEnrolledStudents(
				Optional.ofNullable(batchDB.getBatchStudentEnrollmentsDB())
						.orElseGet(Collections::emptyList)
						.stream()
						.filter(BatchStudentEnrollmentsDB::getIsActive)
						.toList()
						.size()
		);
		summary.setTotalEnrolledTutors(
				Optional.ofNullable(batchDB.getBatchTutorEnrollmentsDB())
						.orElseGet(Collections::emptyList)
						.stream()
						.filter(BatchTutorEnrollmentDB::getIsActive)
						.toList()
						.size()
		);
		summary.setTotalAnnouncements(
				Optional.ofNullable(batchDB.getAnnouncementEntityDB())
						.orElseGet(Collections::emptyList)
						.stream()
						.filter(AnnouncementEntity::getIsActive)
						.toList()
						.size()
		);
		summary.setTotalEnrolledCourses(lmsDaoInterf.fetchBatchCourses(batchDB.getBatchId()).orElse(Collections.emptyList()).size());

		OrganizationsDB organization = batchDB.getOrganizationsDB();
		if (organization != null) {
			summary.setBranchId(organization.getOrgId());
			summary.setBranchName(organization.getOrgName());
		}

		return summary;
	}


	// Fetch organization master
	@Override
	public ResponseEntity<Map<String,Object>> fetchOrganizationMaster(Long organizationMasterId){

		HashMap<String, Object> responseMap = new HashMap<>();

		// fetch organizationsDB
		Optional<OrganizationMasterDB> optionalPresentOrganization = lmsDaoInterf.findOrganizationMasterById(organizationMasterId);

		// check if List is present
		if(optionalPresentOrganization.isEmpty()){
			responseMap.put("status", Boolean.FALSE);
			return ResponseEntity.internalServerError().body(responseMap);
		} else {
			optionalPresentOrganization.get().setOrganizationsDB(null);
			responseMap.put("data", optionalPresentOrganization);
			responseMap.put("status", Boolean.TRUE);
			return ResponseEntity.ok(responseMap);
		}

	}

	// Organization master fetches all active organizations
	@Override
	public ResponseEntity<Map<String,Object>> fetchOrganizationsBranches(Long organizationMasterId, Long userId){

		HashMap<String, Object> responseMap = new HashMap<>();

		Optional<UserInfoDB> userInfoDBOptional = Optional.empty();

		if(userId!= 0L) {
			userInfoDBOptional = lmsDaoInterf.getUserInfoById(userId);
		}

		if(userInfoDBOptional.isPresent()) {

			boolean isSuperAdmin = userInfoDBOptional.get().getRoles().stream().anyMatch(userInfo -> Objects.equals(userInfo.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "SUPER_ADMIN".trim().toUpperCase()));
			boolean isAdmin = userInfoDBOptional.get().getRoles().stream().anyMatch(userInfo -> Objects.equals(userInfo.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "ADMIN".trim().toUpperCase()));
			boolean isTeacher = userInfoDBOptional.get().getRoles().stream().anyMatch(userInfo -> Objects.equals(userInfo.getRoleMaster().getRoleMasterName().trim().toUpperCase(), "TEACHER".trim().toUpperCase()));

			// check if the List is present
			if (isSuperAdmin) {

				// fetch organizationsDB
				List<OrganizationsDB> organizationsList = lmsDaoInterf.findOrganizationsByMasterId(organizationMasterId);

				organizationsList.forEach(organizations -> {
					organizations.setBatchDB(null);
					organizations.setOrganizationMasterName(organizations.getOrganizationMasterDB().getOrganizationName());
				});

				responseMap.put("data", organizationsList);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);

			} else if(isAdmin || isTeacher) {

				Optional<OrganizationsDB> organizations = lmsDaoInterf.findOrganizationsById(userInfoDBOptional.get().getOrganizationsDB().getOrgId());
				ArrayList<OrganizationsDB> organizationsList = new ArrayList<>();
				if(organizations.isPresent()) {
					organizations.get().setBatchDB(null);
					organizations.get().setOrganizationMasterName(organizations.get().getOrganizationMasterDB().getOrganizationName());
					organizationsList.add(organizations.get());
					organizationsList.trimToSize();
				}
				responseMap.put("data", organizationsList);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			}
		} else if(userId.equals(0L)){

			// fetch organizationsDB
			List<OrganizationsDB> organizationsList = lmsDaoInterf.findOrganizationsByMasterId(organizationMasterId);

			organizationsList.forEach(organizations -> organizations.setBatchDB(null));

			responseMap.put("data", organizationsList);
			responseMap.put("status", Boolean.TRUE);
			return ResponseEntity.ok(responseMap);
		}

		responseMap.put("status", Boolean.FALSE);
		return ResponseEntity.internalServerError().body(responseMap);
	}

	// SaveOrUpdate organization Master
	public List<OrganizationMasterDB> saveOrUpdateOrganizationMaster(List<OrganizationMasterDB> organizationMasterDB){
		try{

			// initialization of newOrganizationMasterList
			LinkedList <OrganizationMasterDB> newOrganizationMasterList = new LinkedList <>();

			// using for-each on organization input list
			organizationMasterDB.forEach(organizationMasterEntity -> {


				// checking if organizationId present in input or not
				if(organizationMasterEntity.getOrganizationId() != null){

					// extracting organizationMaster using organizationId
					Optional<OrganizationMasterDB> optionalPresentOrganization = lmsDaoInterf.findOrganizationMasterById(organizationMasterEntity.getOrganizationId());

					// checking if organizationMaster present in DB or not
					if(optionalPresentOrganization.isPresent()){

						OrganizationMasterDB presentOrganization = optionalPresentOrganization.get();

						// setting organizationMaster details
						presentOrganization.setOrganizationName(organizationMasterEntity.getOrganizationName());
						presentOrganization.setOrganizationCode(organizationMasterEntity.getOrganizationCode());
						presentOrganization.setIsActive(organizationMasterEntity.getIsActive());
						presentOrganization.setContact(organizationMasterEntity.getContact());
						presentOrganization.setOrganizationImage(organizationMasterEntity.getOrganizationImage());


						// setting updatedBy
						presentOrganization.setUpdatedBy(organizationMasterEntity.getUpdatedBy());

						// extracting organizationGroup List from input_OrganizationMaster and  DB_OrganizationGroup List
						List<OrganizationsDB> organizationsDBList = organizationMasterEntity.getOrganizationsDB();
						List<OrganizationsDB> OrganizationsDB = presentOrganization.getOrganizationsDB();

						if(!organizationsDBList.isEmpty()) {
							// using for-each on organizationGroup input list
							organizationsDBList.forEach(organizationsInput -> {

								// checking if organizationGroup present in DB or not using orgId
								Optional<OrganizationsDB> optionalPresentOrganizations = OrganizationsDB.stream()
										.filter(organizations -> !Objects.isNull(organizationsInput.getOrgId()) && Objects.equals(organizations.getOrgId(), organizationsInput.getOrgId()))
										.findFirst();

								// check if organizationGroup present and organization master is active
								if (optionalPresentOrganizations.isPresent() && Boolean.TRUE.equals(organizationMasterEntity.getIsActive())) {

									// extracting organizationGroup from OrganizationMaster
									OrganizationsDB presentOrganizations = optionalPresentOrganizations.get();

									// extracting index
									int organizationsIndex = OrganizationsDB.indexOf(presentOrganizations);

									// setting organizationGroup details
									presentOrganizations.setOrgName(organizationsInput.getOrgName());
									presentOrganizations.setOrgCode(organizationsInput.getOrgCode());
									presentOrganizations.setOrgAddress(organizationsInput.getOrgAddress());
									presentOrganizations.setOrgCity(organizationsInput.getOrgCity());
									presentOrganizations.setOrgState(organizationsInput.getOrgState());
									presentOrganizations.setOrgCountry(organizationsInput.getOrgCountry());
									presentOrganizations.setOrgPincode(organizationsInput.getOrgPincode());
									if (helperInterf.isValidPhoneNumber(organizationsInput.getOrgContactNo())) {
										presentOrganizations.setOrgContactNo(organizationsInput.getOrgContactNo());
									}
									presentOrganizations.setOrgLatitude(organizationsInput.getOrgLatitude());
									presentOrganizations.setOrgLongitude(organizationsInput.getOrgLongitude());
									presentOrganizations.setOrgCurrency(organizationsInput.getOrgCurrency());
									presentOrganizations.setIsActive(organizationsInput.getIsActive());

									// setting updatedBy
									presentOrganizations.setUpdatedBy(organizationMasterEntity.getUpdatedBy());

									// updating an object in a list
									OrganizationsDB.set(organizationsIndex, presentOrganizations);

								}
								// check if organizationGroup present and if input_OrganizationMaster or DB_OrganizationMaster is inactive
								else if (optionalPresentOrganizations.isPresent() && Boolean.FALSE.equals(organizationMasterEntity.getIsActive())) {

									// extracting organizationGroup from OrganizationMaster
									OrganizationsDB presentOrganizations = optionalPresentOrganizations.get();

									// extracting index
									int organizationsIndex = OrganizationsDB.indexOf(presentOrganizations);

									// setting organizationGroup isActive to false
									presentOrganizations.setIsActive(Boolean.FALSE);
									presentOrganizations.setUpdatedBy(organizationMasterEntity.getUpdatedBy());

									// updating an object in a list
									OrganizationsDB.set(organizationsIndex, presentOrganizations);

								}
								// create new organizationGroup
								else {

									// setting organizationGroup details
									OrganizationsDB newOrganizationDB = new OrganizationsDB();
									newOrganizationDB.setOrgName(organizationsInput.getOrgName());
									newOrganizationDB.setOrgCode(organizationsInput.getOrgCode());
									newOrganizationDB.setOrgAddress(organizationsInput.getOrgAddress());
									newOrganizationDB.setOrgCity(organizationsInput.getOrgCity());
									newOrganizationDB.setOrgCountry(organizationsInput.getOrgCountry());
									newOrganizationDB.setOrgState(organizationsInput.getOrgState());
									newOrganizationDB.setOrgPincode(organizationsInput.getOrgPincode());
									if (helperInterf.isValidPhoneNumber(organizationsInput.getOrgContactNo())) {
										newOrganizationDB.setOrgContactNo(organizationsInput.getOrgContactNo());
									}
									newOrganizationDB.setOrgLatitude(organizationsInput.getOrgLatitude());
									newOrganizationDB.setOrgLongitude(organizationsInput.getOrgLongitude());
									newOrganizationDB.setOrgCurrency(organizationsInput.getOrgCurrency());
									newOrganizationDB.setIsActive(organizationsInput.getIsActive() != null ? organizationsInput.getIsActive() : Boolean.TRUE);

									// setting createdBy
									newOrganizationDB.setCreatedBy(organizationMasterEntity.getCreatedBy());

									// setting reference
									newOrganizationDB.setOrganizationMasterDB(presentOrganization);

									// adding newOrganizationDB object in OrganizationsDB List
									OrganizationsDB.add(newOrganizationDB);

								}
							});
						}

						//adding presentOrganization object in a list
						newOrganizationMasterList.add(presentOrganization);

					}
				}else {

					OrganizationMasterDB newOrganizationMasterDB = new OrganizationMasterDB();

					// setting organizationMaster details
					newOrganizationMasterDB.setOrganizationName(organizationMasterEntity.getOrganizationName());
					newOrganizationMasterDB.setOrganizationCode(organizationMasterEntity.getOrganizationCode());
					newOrganizationMasterDB.setIsActive(organizationMasterEntity.getIsActive() != null ? organizationMasterEntity.getIsActive() : Boolean.TRUE);
					newOrganizationMasterDB.setContact(organizationMasterEntity.getContact());
					newOrganizationMasterDB.setOrganizationImage(organizationMasterEntity.getOrganizationImage());

					// updating createdBy
					newOrganizationMasterDB.setCreatedBy(organizationMasterEntity.getCreatedBy());

					// extracting organizationGroup List from input
					List<OrganizationsDB> organizationsDBList = organizationMasterEntity.getOrganizationsDB();
					LinkedList<OrganizationsDB> organizationsList = new LinkedList<>();

					// using for-each on orgnaizationGroup input List
					organizationsDBList.forEach(organizationsEntity ->{

						OrganizationsDB newOrganizationDB = new OrganizationsDB();

						// setting organizationGroup details
						newOrganizationDB.setOrgName(organizationsEntity.getOrgName());
						newOrganizationDB.setOrgCode(organizationsEntity.getOrgCode());
						newOrganizationDB.setOrgAddress(organizationsEntity.getOrgAddress());
						newOrganizationDB.setOrgCity(organizationsEntity.getOrgCity());
						newOrganizationDB.setOrgState(organizationsEntity.getOrgState());
						newOrganizationDB.setOrgCountry(organizationsEntity.getOrgCountry());
						newOrganizationDB.setOrgPincode(organizationsEntity.getOrgPincode());
						if(!Objects.isNull(organizationsEntity.getOrgContactNo()) && helperInterf.isValidPhoneNumber(organizationsEntity.getOrgContactNo())) {
							newOrganizationDB.setOrgContactNo(organizationsEntity.getOrgContactNo());
						}
						newOrganizationDB.setOrgLatitude(organizationsEntity.getOrgLatitude());
						newOrganizationDB.setOrgLongitude(organizationsEntity.getOrgLongitude());
						newOrganizationDB.setOrgCurrency(organizationsEntity.getOrgCurrency());
						newOrganizationDB.setIsActive(organizationsEntity.getIsActive() != null ? organizationsEntity.getIsActive() : Boolean.TRUE);

						// setting createdBy
						newOrganizationDB.setCreatedBy(organizationMasterEntity.getCreatedBy());

						// setting reference
						newOrganizationDB.setOrganizationMasterDB(newOrganizationMasterDB);

						//adding newOrganizationDB object in organizationsList
						organizationsList.add(newOrganizationDB);
					});


					// setting organizationsList to newOrganizationMasterDB
					newOrganizationMasterDB.setOrganizationsDB(organizationsList);

					//adding newOrganizationMasterDB object in a list
					newOrganizationMasterList.add(newOrganizationMasterDB);
				}
			});

			return lmsDaoInterf.saveOrganizationMaster(newOrganizationMasterList);

		} catch(Exception e){

			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	@Override
	public ResponseEntity<Map<String, Object>> saveOrUpdateLiveClasses(LiveClassEntity liveClassEntity) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Boolean isSaved = Boolean.FALSE;

			// Fetch user information based on the provided username
			Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(liveClassEntity.getUserName());

			// Extract studentId from the user information if present
			Long userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

			// Check if liveClassId is present in the input entity
			if (liveClassEntity.getLiveClassId() != null) {

				// Fetch the existing LiveClassEntity based on the liveClassId
				Optional<LiveClassEntity> optionalPresentLiveClass = lmsDaoInterf.fetchLiveClassById(liveClassEntity.getLiveClassId());

				// Check if the LiveClassEntity is present in the database
				if (optionalPresentLiveClass.isPresent()) {

					LiveClassEntity presentLiveClassEntity = optionalPresentLiveClass.get();

					// Update LiveClassEntity details
					presentLiveClassEntity.setMeetDate(liveClassEntity.getMeetDate());
					presentLiveClassEntity.setUpdatedBy(userId);

					List<LiveClassesEntity> enteredLiveClasses = liveClassEntity.getLiveClassesEntityList();
					List<LiveClassesEntity> presentLiveClassesDB = presentLiveClassEntity.getLiveClassesEntityList();

					// Using for-each loop on the entered live classes list
					enteredLiveClasses.forEach(liveClassesEntity -> {

						Optional<LiveClassesEntity> optionalPresentClasses = presentLiveClassesDB.stream()
								.filter(classes -> !Objects.isNull(liveClassesEntity.getLiveClassesId()) && Objects.equals(classes.getLiveClassesId(), liveClassesEntity.getLiveClassesId()))
								.findFirst();

						if(optionalPresentClasses.isPresent()){

							LiveClassesEntity presentClasses = optionalPresentClasses.get();

							// Extract index
							int classesIndex = presentLiveClassesDB.indexOf(presentClasses);

							// Update LiveClassesEntity details
							presentClasses.setStartClassDateTime(liveClassesEntity.getStartClassDateTime());
							presentClasses.setEndClassDateTime(liveClassesEntity.getEndClassDateTime());
							presentClasses.setBatchId(liveClassesEntity.getBatchId());
							presentClasses.setBatchName(liveClassesEntity.getBatchName());
							presentClasses.setTutorId(liveClassesEntity.getTutorId());
							presentClasses.setTutorName(liveClassesEntity.getTutorName());
							presentClasses.setCourseId(liveClassesEntity.getCourseId());
							presentClasses.setCourseName(liveClassesEntity.getCourseName());
							presentClasses.setMeetLink(liveClassesEntity.getMeetLink());

							// Update the object in the list
							presentLiveClassesDB.set(classesIndex, presentClasses);

						} else {

							LiveClassesEntity newLiveClassesEntity = new LiveClassesEntity();

							// Set details for the new LiveClassesEntity
							newLiveClassesEntity.setStartClassDateTime(liveClassesEntity.getStartClassDateTime());
							newLiveClassesEntity.setEndClassDateTime(liveClassesEntity.getEndClassDateTime());
							newLiveClassesEntity.setBatchId(liveClassesEntity.getBatchId());
							newLiveClassesEntity.setBatchName(liveClassesEntity.getBatchName());
							newLiveClassesEntity.setTutorId(liveClassesEntity.getTutorId());
							newLiveClassesEntity.setTutorName(liveClassesEntity.getTutorName());
							newLiveClassesEntity.setCourseId(liveClassesEntity.getCourseId());
							newLiveClassesEntity.setCourseName(liveClassesEntity.getCourseName());
							newLiveClassesEntity.setMeetLink(liveClassesEntity.getMeetLink());

							// Set reference to the parent LiveClassEntity
							newLiveClassesEntity.setLiveClassEntity(presentLiveClassEntity);

							presentLiveClassesDB.add(newLiveClassesEntity);
						}
					});

					// Save the new LiveClassEntity
					isSaved = lmsDaoInterf.saveLiveClass(presentLiveClassEntity);

				} else {

					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "Live Class Id not found");
					return ResponseEntity.unprocessableEntity().body(responseMap);
				}

			} else {

				// Create new LiveClassEntity
				LiveClassEntity newLiveClassEntity = new LiveClassEntity();
				newLiveClassEntity.setMeetDate(liveClassEntity.getMeetDate());
				newLiveClassEntity.setCreatedBy(userId);

				List<LiveClassesEntity> enteredLiveClasses = liveClassEntity.getLiveClassesEntityList();
				LinkedList<LiveClassesEntity> newLiveClassesList = new LinkedList<>();

				// Using for-each loop on the entered live classes list
				enteredLiveClasses.forEach(liveClassesEntity -> {

					// Create new LiveClassesEntity
					LiveClassesEntity newLiveClassesEntity = new LiveClassesEntity();

					// Set details for the new LiveClassesEntity
					newLiveClassesEntity.setStartClassDateTime(liveClassesEntity.getStartClassDateTime());
					newLiveClassesEntity.setEndClassDateTime(liveClassesEntity.getEndClassDateTime());
					newLiveClassesEntity.setBatchId(liveClassesEntity.getBatchId());
					newLiveClassesEntity.setBatchName(liveClassesEntity.getBatchName());
					newLiveClassesEntity.setTutorId(liveClassesEntity.getTutorId());
					newLiveClassesEntity.setTutorName(liveClassesEntity.getTutorName());
					newLiveClassesEntity.setCourseId(liveClassesEntity.getCourseId());
					newLiveClassesEntity.setCourseName(liveClassesEntity.getCourseName());
					newLiveClassesEntity.setMeetLink(liveClassesEntity.getMeetLink());

					// Set reference to the parent LiveClassEntity
					newLiveClassesEntity.setLiveClassEntity(newLiveClassEntity);

					// Add newLiveClassesEntity to the list
					newLiveClassesList.add(newLiveClassesEntity);
				});

				// Set newLiveClassesList to newLiveClassEntity
				newLiveClassEntity.setLiveClassesEntityList(newLiveClassesList);

				// Save the new LiveClassEntity
				isSaved = lmsDaoInterf.saveLiveClass(newLiveClassEntity);
			}

			if(isSaved) {
				responseMap.put("status", Boolean.TRUE);
				responseMap.put("message", "Live classes added/updated successfully");
				return ResponseEntity.ok(responseMap);
			}

			responseMap.put("status", Boolean.FALSE);
			responseMap.put("message", "Live classes cannot add/update");
			return ResponseEntity.internalServerError().body(responseMap);

		} catch (Exception e) {

			System.out.println("exception " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	// Organization master fetch all active batches
	@Override
	@Transactional(readOnly = true)
	public ResponseEntity<Map<String, Object>> fetchAllUpcomingBatchesByBranch(Optional<Long> orgId, int page, int size) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Pageable pageable = PageRequest.of(page,size);


			Page<BatchDB> batchDBPage = lmsDaoInterf.findAllBatchesByOrganizationId(orgId.orElse(null), pageable).orElseGet(Page::empty);

			// Fetch batchDB
			List<BatchDB> batchList = batchDBPage.getContent();

			// Define lists for upcoming, ongoing, and completed batches
			LinkedList<BatchDB> upcomingBatches = new LinkedList<>();

			// Check if List is present
			if (!batchList.isEmpty()) {
				// Categorize each batch
				batchList.forEach(batchDB -> {
					LocalDateTime now = LocalDateTime.now();
					BatchDB batchSummary = buildBatchSummary(batchDB);

					if (batchSummary.getBatchStartDateTime().isAfter(now)) {
						upcomingBatches.add(batchSummary);
					}
				});

				responseMap.put("upcomingBatches", upcomingBatches);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "No batches found");
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {
			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	// Organization master fetch all active batches
	@Override
	@Transactional(readOnly = true)
	public ResponseEntity<Map<String, Object>> fetchAllOngoingBatchesByBranch(Optional<Long> orgId, int page, int size) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Pageable pageable = PageRequest.of(page,size);


			Page<BatchDB> batchDBPage = lmsDaoInterf.findAllBatchesByOrganizationId(orgId.orElse(null), pageable).orElseGet(Page::empty);

			// Fetch batchDB
			List<BatchDB> batchList = batchDBPage.getContent();

			// Define lists for upcoming, ongoing, and completed batches
			LinkedList<BatchDB> ongoingBatches = new LinkedList<>();

			// Check if List is present
			if (!batchList.isEmpty()) {
				// Categorize each batch
				batchList.forEach(batchDB -> {
					LocalDateTime now = LocalDateTime.now();
					BatchDB batchSummary = buildBatchSummary(batchDB);

					if (batchSummary.getBatchStartDateTime().isBefore(now) && batchSummary.getBatchEndDateTime().isAfter(now)) {
						ongoingBatches.add(batchSummary);
					}
				});

				responseMap.put("ongoingBatches", ongoingBatches);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "No batches found");
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {
			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	// Organization master fetch all active batches
	@Override
	@Transactional(readOnly = true)
	public ResponseEntity<Map<String, Object>> fetchAllCompletedBatchesByBranch(Optional<Long> orgId, int page, int size) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Pageable pageable = PageRequest.of(page,size);


			Page<BatchDB> batchDBPage = lmsDaoInterf.findAllBatchesByOrganizationId(orgId.orElse(null), pageable).orElseGet(Page::empty);

			// Fetch batchDB
			List<BatchDB> batchList = batchDBPage.getContent();

			// Define lists for upcoming, ongoing, and completed batches
			LinkedList<BatchDB> completedBatches = new LinkedList<>();

			// Check if List is present
			if (!batchList.isEmpty()) {
				// Categorize each batch
				batchList.forEach(batchDB -> {
					LocalDateTime now = LocalDateTime.now();
					BatchDB batchSummary = buildBatchSummary(batchDB);

					if (batchSummary.getBatchEndDateTime().isBefore(now)) {
						completedBatches.add(batchSummary);
					}
				});

				responseMap.put("completedBatches", completedBatches);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "No batches found");
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {
			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	// Organization master fetch all active batches by organizations
	@Override
	@Transactional(readOnly = true)
	public ResponseEntity<Map<String,Object>> fetchAllBatchesByOrganizations(Optional<Long> orgId) {

		HashMap<String, Object> responseMap = new HashMap<>();

		LinkedList<BatchDB> allBatches = new LinkedList<>();
		LinkedList<BatchDB> ongoingBatches = new LinkedList<>();
		LinkedList<BatchDB> completedBatches = new LinkedList<>();
		LinkedList<BatchDB> upcomingBatches = new LinkedList<>();

		try {
			// fetch batchDB
			List<BatchDB> batchList = lmsDaoInterf.findAllBatchesByOrganizationId(orgId.orElse(null));

			// check if List is present
			if (!batchList.isEmpty()) {

				batchList.forEach(batchDB -> {
					LocalDateTime now = LocalDateTime.now();
					BatchDB batchSummary = buildBatchSummary(batchDB);
					allBatches.add(batchSummary);

					if (batchSummary.getBatchStartDateTime().isBefore(now) && batchSummary.getBatchEndDateTime().isAfter(now)) {
						ongoingBatches.add(batchSummary);
					}

					if (batchSummary.getBatchEndDateTime().isBefore(now)) {
						completedBatches.add(batchSummary);
					}

					if (batchSummary.getBatchStartDateTime().isAfter(now)) {
						upcomingBatches.add(batchSummary);
					}

				});


				responseMap.put("allBatches", allBatches);
				responseMap.put("ongoingBatches", ongoingBatches);
				responseMap.put("completedBatches", completedBatches);
				responseMap.put("upcomingBatches", upcomingBatches);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {

			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}

	}


	// SaveOrUpdate Batch Master
	public ResponseEntity<Map<String,Object>> saveOrUpdateBatchMaster(BatchDB batchInput) {

		HashMap<String, Object> responseMap = new HashMap<>();

		Boolean isSaved = Boolean.FALSE;

		try {

			if(!Objects.isNull(batchInput) && !Objects.isNull(batchInput.getBranchId())){

				Optional<OrganizationsDB> presentOrganizationsDB = lmsDaoInterf.findOrganizationsById(batchInput.getBranchId());

				if(presentOrganizationsDB.isPresent()) {

					if (!Objects.isNull(batchInput.getBatchId())) {

						Optional<BatchDB> optionalPresentBatch = lmsDaoInterf.findBatchById(batchInput.getBatchId());

						if (optionalPresentBatch.isPresent()) {

							BatchDB presentBatch = optionalPresentBatch.get();

							presentBatch.setBatchName(batchInput.getBatchName());
							presentBatch.setBatchDescription(batchInput.getBatchDescription());
							presentBatch.setBatchCapacity(batchInput.getBatchCapacity());
							presentBatch.setBatchStartDateTime(batchInput.getBatchStartDateTime());
							presentBatch.setBatchEndDateTime(batchInput.getBatchEndDateTime());
							presentBatch.setIsActive(batchInput.getIsActive());

							presentBatch.setOrganizationsDB(presentOrganizationsDB.get());

							BatchDB savedBatch = lmsDaoInterf.persistBatchMaster(presentBatch);

							if (!Objects.isNull(savedBatch.getBatchId())) {
								isSaved = Boolean.TRUE;
							}
						}

					} else {

						BatchDB newBatch = new BatchDB();

						newBatch.setBatchName(batchInput.getBatchName());
						newBatch.setBatchDescription(batchInput.getBatchDescription());
						newBatch.setBatchCapacity(batchInput.getBatchCapacity());
						newBatch.setBatchStartDateTime(batchInput.getBatchStartDateTime());
						newBatch.setBatchEndDateTime(batchInput.getBatchEndDateTime());
						newBatch.setIsActive(batchInput.getIsActive() != null ? batchInput.getIsActive() : Boolean.TRUE);

						newBatch.setOrganizationsDB(presentOrganizationsDB.get());

						BatchDB savedBatch = lmsDaoInterf.persistBatchMaster(newBatch);

						if (!Objects.isNull(savedBatch.getBatchId())) {
							isSaved = Boolean.TRUE;
						}

					}

					if (isSaved) {
						responseMap.put("status", Boolean.TRUE);
						responseMap.put("message", "Batch saved/updated successfully");
						return ResponseEntity.ok(responseMap);
					}


					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "Batch not saved/updated");
					return ResponseEntity.unprocessableEntity().body(responseMap);

				}

				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "branch id is invalid");
				return ResponseEntity.unprocessableEntity().body(responseMap);

			}

			responseMap.put("status", Boolean.FALSE);
			responseMap.put("message", "Batch object or branch id is mandatory");
			return ResponseEntity.unprocessableEntity().body(responseMap);

		} catch (Exception e) {
			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	@Override
	public ResponseEntity<Map<String,Object>> fetchAllStudentEnrollmentsByBatchId(Long batchId, int page, int size) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Pageable pageable = PageRequest.of(page,size);

			// fetch batchDB
			Page<BatchDB> batchPages = lmsDaoInterf.findBatchById(batchId, pageable).orElseGet(Page::empty);

			// fetch batchDB
			List<BatchDB> batchList = batchPages.getContent();

			// check if List is present
			if (!batchList.isEmpty()) {

				// setting required values
				batchList.forEach(batchDB -> {

					if(!Objects.isNull(batchDB.getBatchStudentEnrollmentsDB())) {
						batchDB.setTotalEnrolledStudents(batchDB.getBatchStudentEnrollmentsDB().size());
					}
					batchDB.setBatchTutorEnrollmentsDB(null);
					batchDB.setAnnouncementEntityDB(null);
				});

				responseMap.put("data", batchList);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {

			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	@Override
	public ResponseEntity<Map<String,Object>> fetchAllTutorEnrollmentsByBatchId(Long batchId, int page, int size) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Pageable pageable = PageRequest.of(page,size);

			// fetch batchDB
			Page<BatchDB> batchPages = lmsDaoInterf.findBatchById(batchId, pageable).orElseGet(Page::empty);

			// fetch batchDB
			List<BatchDB> batchList = batchPages.getContent();

			// check if List is present
			if (!batchList.isEmpty()) {

				// setting required values
				batchList.forEach(batchDB -> {

					if(!Objects.isNull(batchDB.getBatchTutorEnrollmentsDB())) {
						batchDB.setTotalEnrolledTutors(batchDB.getBatchTutorEnrollmentsDB().size());
					}
					batchDB.setBatchStudentEnrollmentsDB(null);
					batchDB.setAnnouncementEntityDB(null);
				});

				responseMap.put("data", batchList);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {

			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


//	@Override
//	public ResponseEntity<Map<String,Object>> fetchAllAnnouncementsByBatchId(Long batchId, int page, int size) {
//
//		HashMap<String, Object> responseMap = new HashMap<>();
//
//		try {
//
//			Pageable pageable = PageRequest.of(page,size);
//
//			// fetch batchDB
//			Page<BatchDB> batchPages = lmsDaoInterf.findBatchById(batchId, pageable).orElseGet(Page::empty);
//
//			// fetch batchDB
//			List<BatchDB> batchList = batchPages.getContent();
//
//			// check if List is present
//			if (!batchList.isEmpty()) {
//
//				// setting required values
//				batchList.forEach(batchDB -> {
//
//					if(!Objects.isNull(batchDB.getAnnouncementEntityDB())) {
//						batchDB.setTotalAnnouncements(batchDB.getAnnouncementEntityDB().size());
//					}
//					batchDB.setBatchStudentEnrollmentsDB(null);
//					batchDB.setBatchTutorEnrollmentsDB(null);
//				});
//
//				responseMap.put("data", batchList);
//				responseMap.put("status", Boolean.TRUE);
//				return ResponseEntity.ok(responseMap);
//			} else {
//				responseMap.put("status", Boolean.FALSE);
//				return ResponseEntity.internalServerError().body(responseMap);
//			}
//		} catch (Exception e) {
//
//			System.out.println("Exception: " + e.getMessage());
//			logger.error(e.fillInStackTrace());
//			logger.catching(e);
//
//			throw new RuntimeException(e);
//		}
//	}




	// Organization master fetch all active batches
	@Override
	@Transactional(readOnly = true)
	public ResponseEntity<Map<String, Object>> batchMaster() {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			// Fetch batchDB
			List<BatchDB> batchList = lmsDaoInterf.findAllBatches().orElse(Collections.emptyList());

			// Define lists for all active batches and ongoing batches
			LinkedList<BatchDB> allBatches = new LinkedList<>();
			LinkedList<BatchDB> ongoingBatches = new LinkedList<>();

			// Check if List is present
			if (!batchList.isEmpty()) {
				// Categorize each batch
				batchList.forEach(batchDB -> {
					BatchDB batchSummary = buildBatchSummary(batchDB);
					allBatches.add(batchSummary);

					if (batchSummary.getBatchStartDateTime().isBefore(LocalDateTime.now()) && batchSummary.getBatchEndDateTime().isAfter(LocalDateTime.now())) {
						ongoingBatches.add(batchSummary);
					}
				});

				responseMap.put("batchMaster", allBatches);
				responseMap.put("allBatches", allBatches);
				responseMap.put("ongoingBatches", ongoingBatches);
				responseMap.put("status", Boolean.TRUE);
				return ResponseEntity.ok(responseMap);
			} else {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "No batches found");
				return ResponseEntity.internalServerError().body(responseMap);
			}
		} catch (Exception e) {
			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}


	@Override
	public ResponseEntity<Map<String, Object>> saveOrUpdateRoleMaster(RoleMaster roleMaster) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {
			Long userId = null;
			Boolean isSaved;
			String normalizedRoleName = normalizeRoleName(roleMaster.getRoleMasterName());
			String normalizedRoleCode = normalizeRoleCode(roleMaster.getRoleMasterCode());

			if (Strings.isNullOrEmpty(normalizedRoleName)) {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "ROLE_NAME_REQUIRED");
				return ResponseEntity.unprocessableEntity().body(responseMap);
			}

			if (Strings.isNullOrEmpty(normalizedRoleCode)) {
				normalizedRoleCode = buildRoleCode(normalizedRoleName);
			}

			if (Strings.isNullOrEmpty(normalizedRoleCode)) {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "ROLE_CODE_REQUIRED");
				return ResponseEntity.unprocessableEntity().body(responseMap);
			}

			if(!Strings.isNullOrEmpty(roleMaster.getUserName())) {

				// Fetch user information based on the provided username
				Optional<UserInfoDB> userInfo = lmsDaoInterf.getUserInfo(roleMaster.getUserName());

				// Extract studentId from the user information if present
				userId = userInfo.map(UserInfoDB::getUserDetailsId).orElse(null);

			}

			if(!Objects.isNull(userId)){
				Optional<RoleMaster> roleWithSameName = lmsDaoInterf.getRoleMasterByName(normalizedRoleName);
				Optional<RoleMaster> roleWithSameCode = lmsDaoInterf.getRoleMasterByCode(normalizedRoleCode);

				if (!Objects.isNull(roleMaster.getRoleMasterId())) {

					Optional<RoleMaster> optionalPresentRole = lmsDaoInterf.getRoleMasterById(roleMaster.getRoleMasterId());

					if (optionalPresentRole.isPresent()) {
						RoleMaster existingRole = optionalPresentRole.get();

						if (isProtectedRole(existingRole.getRoleMasterName()) && (!Objects.equals(normalizeRoleName(existingRole.getRoleMasterName()), normalizedRoleName) || !Objects.equals(normalizeRoleCode(existingRole.getRoleMasterCode()), normalizedRoleCode))) {
							responseMap.put("status", Boolean.FALSE);
							responseMap.put("message", "SYSTEM_ROLE_CANNOT_BE_MODIFIED");
							return ResponseEntity.unprocessableEntity().body(responseMap);
						}

						if (roleWithSameName.isPresent() && !Objects.equals(roleWithSameName.get().getRoleMasterId(), existingRole.getRoleMasterId())) {
							responseMap.put("status", Boolean.FALSE);
							responseMap.put("message", "ROLE_NAME_ALREADY_EXISTS");
							return ResponseEntity.unprocessableEntity().body(responseMap);
						}

						if (roleWithSameCode.isPresent() && !Objects.equals(roleWithSameCode.get().getRoleMasterId(), existingRole.getRoleMasterId())) {
							responseMap.put("status", Boolean.FALSE);
							responseMap.put("message", "ROLE_CODE_ALREADY_EXISTS");
							return ResponseEntity.unprocessableEntity().body(responseMap);
						}

						existingRole.setRoleMasterCode(normalizedRoleCode);
						existingRole.setRoleMasterName(normalizedRoleName);
						existingRole.setUpdatedBy(userId);

						isSaved = lmsDaoInterf.saveRoleMaster(existingRole);

						if(isSaved){
							responseMap.put("status", Boolean.TRUE);
							responseMap.put("message", "Role master updated");
							return ResponseEntity.ok(responseMap);
						}

						responseMap.put("status", Boolean.FALSE);
						responseMap.put("message", "ROLE_MASTER_SAVE_FAILED");
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}

					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "ROLE_MASTER_NOT_FOUND");
					return ResponseEntity.unprocessableEntity().body(responseMap);
				} else {
					if (isProtectedRole(normalizedRoleName)) {
						responseMap.put("status", Boolean.FALSE);
						responseMap.put("message", "SYSTEM_ROLE_ALREADY_RESERVED");
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}

					if (roleWithSameName.isPresent()) {
						responseMap.put("status", Boolean.FALSE);
						responseMap.put("message", "ROLE_NAME_ALREADY_EXISTS");
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}

					if (roleWithSameCode.isPresent()) {
						responseMap.put("status", Boolean.FALSE);
						responseMap.put("message", "ROLE_CODE_ALREADY_EXISTS");
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}

					roleMaster.setRoleMasterName(normalizedRoleName);
					roleMaster.setRoleMasterCode(normalizedRoleCode);
					roleMaster.setCreatedBy(userId);
					isSaved = lmsDaoInterf.saveRoleMaster(roleMaster);

					if(isSaved){
						responseMap.put("status", Boolean.TRUE);
						responseMap.put("message", "Role master added");
						return ResponseEntity.ok(responseMap);
					}

					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "ROLE_MASTER_SAVE_FAILED");
					return ResponseEntity.unprocessableEntity().body(responseMap);
				}
			}

			responseMap.put("status", Boolean.FALSE);
			responseMap.put("message", "user not found");
			return ResponseEntity.unprocessableEntity().body(responseMap);

		} catch (Exception e) {

			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}




	@Override
	public ResponseEntity<Map<String, Object>> fetchRoleMaster () {

		HashMap<String, Object> responseMap = new HashMap<>();

		try {

			Optional<List<RoleMaster>> optionalPresentRoleList = lmsDaoInterf.getRoleMaster();

			if (optionalPresentRoleList.isPresent()) {
				List<RoleMaster> roleMasterList = optionalPresentRoleList.get().stream()
						.sorted(Comparator.comparing(RoleMaster::getRoleMasterName, Comparator.nullsLast(String::compareToIgnoreCase)))
						.peek(roleMaster -> roleMaster.setUserCount(lmsDaoInterf.countActiveUsersByRoleMasterId(roleMaster.getRoleMasterId())))
						.collect(Collectors.toList());
				responseMap.put("status", Boolean.TRUE);
				responseMap.put("data", roleMasterList);
				return ResponseEntity.ok(responseMap);
			}

			responseMap.put("status", Boolean.FALSE);
			responseMap.put("message", "roles not found");
			return ResponseEntity.unprocessableEntity().body(responseMap);

		} catch (Exception e) {

			System.out.println("Exception: " + e.getMessage());
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			throw new RuntimeException(e);
		}
	}

	private String normalizeRoleName(String roleName) {
		return Strings.nullToEmpty(roleName).trim().toUpperCase(Locale.ROOT);
	}

	private String normalizeRoleCode(String roleCode) {
		String normalizedCode = Strings.nullToEmpty(roleCode)
				.trim()
				.toUpperCase(Locale.ROOT)
				.replaceAll("[^A-Z0-9]+", "_")
				.replaceAll("_+", "_")
				.replaceAll("^_", "")
				.replaceAll("_$", "");

		return normalizedCode;
	}

	private String buildRoleCode(String roleName) {
		String normalizedRoleName = normalizeRoleCode(roleName);
		return Strings.isNullOrEmpty(normalizedRoleName) ? "" : normalizedRoleName + "_MASTER_ROLE_1";
	}

	private boolean isProtectedRole(String roleName) {
		return SYSTEM_ROLE_NAMES.contains(normalizeRoleName(roleName));
	}


	@Override
	public ResponseEntity<Map<String, Object>> addOrEditSubjectMaster(SubjectMasterDB subjectMasterDB) {

		HashMap<String, Object> responseMap = new HashMap<>();

		try{
			String normalizedSubjectName = Strings.nullToEmpty(subjectMasterDB.getSubjectName()).trim();

			Boolean isSaved;

			if (Strings.isNullOrEmpty(normalizedSubjectName)) {
				responseMap.put("status", Boolean.FALSE);
				responseMap.put("message", "SUBJECT_NAME_REQUIRED");
				return ResponseEntity.unprocessableEntity().body(responseMap);
			}

			Optional<List<SubjectMasterDB>> subjectList = lmsDaoInterf.getAllSubjects();

			if(!Objects.isNull(subjectMasterDB.getSubjectMasterId())){
				SubjectMasterDB existingSubject = lmsDaoInterf.getSubject(subjectMasterDB.getSubjectMasterId()).orElse(null);

				if (!Objects.isNull(existingSubject)) {
					boolean isDuplicateSubject = subjectList.isPresent() && subjectList.get().stream()
							.anyMatch(activeSubject -> !Objects.equals(activeSubject.getSubjectMasterId(), existingSubject.getSubjectMasterId())
									&& Objects.equals(Strings.nullToEmpty(activeSubject.getSubjectName()).trim().toUpperCase(Locale.ROOT), normalizedSubjectName.toUpperCase(Locale.ROOT)));

					if (isDuplicateSubject) {
						responseMap.put("status", Boolean.FALSE);
						responseMap.put("message", "SUBJECT_ALREADY_EXISTS");
						return ResponseEntity.unprocessableEntity().body(responseMap);
					}

					existingSubject.setUpdatedBy(subjectMasterDB.getUpdatedBy());
					existingSubject.setUpdationTimeStamp(LocalDateTime.now());
					existingSubject.setIsActive(subjectMasterDB.getIsActive() != null ? subjectMasterDB.getIsActive() : existingSubject.getIsActive());
					existingSubject.setSubjectName(normalizedSubjectName);

					isSaved = lmsDaoInterf.saveSubjectMaster(existingSubject);
				}else {
					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "SUBJECT_NOT_EXISTS");
					return ResponseEntity.badRequest().body(responseMap);
				}
			}else {
				// Check for duplicates using Streams
				if (subjectList.isPresent() && subjectList.get().stream().anyMatch(existingSubject -> Objects.equals(Strings.nullToEmpty(existingSubject.getSubjectName()).trim().toUpperCase(Locale.ROOT), normalizedSubjectName.toUpperCase(Locale.ROOT)))) {

					// Return message if a duplicate is found
					responseMap.put("status", Boolean.FALSE);
					responseMap.put("message", "SUBJECT_ALREADY_EXISTS");
					return ResponseEntity.unprocessableEntity().body(responseMap);
				}

				subjectMasterDB.setSubjectName(normalizedSubjectName);
				subjectMasterDB.setIsActive(subjectMasterDB.getIsActive() != null ? subjectMasterDB.getIsActive() : Boolean.TRUE);
				isSaved = lmsDaoInterf.saveSubjectMaster(subjectMasterDB);
			}

			responseMap.put("status", isSaved);
			responseMap.put("message", isSaved ? "SUBJECT_SAVED" : "SUBJECT_SAVE_FAILED");
			return ResponseEntity.ok(responseMap);

		}catch (Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());

			responseMap.put("Exception", e.getMessage());

			return ResponseEntity.internalServerError().body(responseMap);
		}
	}

	@Override
	public ResponseEntity<Map<String, Object>> fetchSubjectMaster() {

		HashMap<String, Object> responseMap = new HashMap<>();

		try{
			List<SubjectMasterDB> subjectMasterDBList = lmsDaoInterf.getAllSubjects().orElse(Collections.emptyList());

			subjectMasterDBList = subjectMasterDBList.stream()
					.sorted(Comparator.comparing(SubjectMasterDB::getSubjectName, Comparator.nullsLast(String::compareToIgnoreCase)))
					.peek(subjectMasterDB -> {
					subjectMasterDB.setTotalWebinars((int) subjectMasterDB.getWebinarInfoList().stream().filter(webinarInfo -> Boolean.TRUE.equals(webinarInfo.getIsActive())).count());
					subjectMasterDB.setTotalCertificationCourses(
							(int) subjectMasterDB.getLibraryMasterDBList().stream()
									.filter(libraryMasterDB -> Boolean.TRUE.equals(libraryMasterDB.getIsActive()) && Boolean.TRUE.equals(libraryMasterDB.getIsCertificationRequired()))
									.count());
					subjectMasterDB.setTotalClassroomCourses(
							(int) subjectMasterDB.getLibraryMasterDBList().stream()
									.filter(libraryMasterDB -> Boolean.TRUE.equals(libraryMasterDB.getIsActive()) && !Boolean.TRUE.equals(libraryMasterDB.getIsCertificationRequired()))
									.count()
					);
				subjectMasterDB.setLibraryMasterDBList(null);
				subjectMasterDB.setWebinarInfoList(null);
			}).collect(Collectors.toList());

			responseMap.put("subjects", subjectMasterDBList);
			responseMap.put("status", Boolean.TRUE);
			return ResponseEntity.ok(responseMap);

		}catch (Exception e){
			logger.catching(e);
			logger.error(e.fillInStackTrace());

			responseMap.put("Exception", e.getMessage());

			return ResponseEntity.internalServerError().body(responseMap);
		}
	}

}
