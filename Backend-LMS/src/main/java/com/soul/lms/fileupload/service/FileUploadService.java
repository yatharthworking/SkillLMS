package com.soul.lms.fileupload.service;

import com.google.common.base.Strings;
import com.opencsv.CSVReader;
import com.soul.lms.admin.service.AdminServiceInterf;
import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.model.entity.holiday.HolidayMaster;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationMasterDB;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizAnswersDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizCorrectAnswersDB;
import com.soul.lms.model.entity.studymaterial.quiz.QuizQuestionsDB;
import com.soul.lms.model.entity.tests.CorrectAnswerDB;
import com.soul.lms.model.entity.tests.TestAnswersDB;
import com.soul.lms.model.entity.tests.TestQuestionsDB;
import com.soul.lms.studymaterials.service.StudyMaterialServiceInterf;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service("fileUpload")
public class FileUploadService implements FileUploadServiceInterf{
	
	private final LmsDaoInterf lmsDaoInterf;
	private final StudyMaterialServiceInterf studyMaterialServiceInterf;
	private final AdminServiceInterf adminServiceInterf;
	
	
	private static final Logger logger = LogManager.getLogger(FileUploadService.class);
	
	@Autowired
	public FileUploadService(LmsDaoInterf lmsDaoInterf, StudyMaterialServiceInterf studyMaterialServiceInterf, AdminServiceInterf adminServiceInterf){
		super();
		this.lmsDaoInterf               = lmsDaoInterf;
		this.studyMaterialServiceInterf = studyMaterialServiceInterf;
		this.adminServiceInterf         = adminServiceInterf;
	}


	@Override
	public ResponseEntity <Map <String, Object>> uploadSpreadSheet(MultipartFile file, Optional <Long> testId, Optional <Long> chapterId, Optional <Long> quizId, Optional <Long> branchId, Optional<String> name){
		try{
			//checking if the file is empty or not
			if (!Objects.isNull(file) && !file.isEmpty() && !Strings.isNullOrEmpty(file.getOriginalFilename())) {


				//checking if fileExt is of form xls || xlsx
				boolean isXml = file.getOriginalFilename().endsWith("xls") || file.getOriginalFilename().endsWith("xlsx");

				//checking if fileExt is of form csv
				boolean isCsv = file.getOriginalFilename().endsWith("csv");

				//checking if testId is present && fileExt is of form xls || xlsx
				if (isXml && testId.isPresent()) {

					//calling current class uploadTestQuestionBankXls method
					return this.uploadTestQuestionBankXls(file, testId.get());
				}
				//checking if testId is present && fileExt is of form csv
				else if (isCsv && testId.isPresent()) {

					//calling current class uploadTestQuestionBankCsv method
					return this.uploadTestQuestionBankCsv(file, testId.get());
				}

				//checking if chapterId is present && fileExt is of form xls || xlsx
				else if (isXml && chapterId.isPresent()) {

					//calling current class uploadQuestionBankXls method
					return this.uploadQuestionBankXls(file, chapterId.get(), quizId);
				}
				//checking if testId is present && fileExt is of form csv
				else if (isCsv && chapterId.isPresent()) {

					//calling current class uploadQuestionBankCsv method
					return this.uploadQuestionBankCsv(file, chapterId.get(), testId);
				}
				// checking if branchId is present && checking if name is present && name is not null or empty && name should be case-insensitive of HOLIDAY_MASTER && fileExt is of form xls or xlsx
				else if (isXml && branchId.isPresent() && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("HOLIDAY_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankXls method
					return this.uploadHolidayMasterXls(file, branchId.get());
				}
				//checking if branchId is present && checking if name is present && name is not null or empty && name should be case-insensitive of HOLIDAY_MASTER && fileExt is of form csv
				else if (isCsv && branchId.isPresent() && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("HOLIDAY_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankCsv method
					return this.uploadHolidayMasterCsv(file, branchId.get());
				}
				//checking if name is present && name is not null or empty && name should be case-insensitive of ORGANIZATION_MASTER && fileExt is of form xls or xlsx
				else if (isXml && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("ORGANIZATION_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankXls method
					return this.parseOrganizationMasterExcel(file);
				}
				//checking if name is present && name is not null or empty && name should be case-insensitive of ORGANIZATION_MASTER && fileExt is of csv
				else if (isCsv && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("ORGANIZATION_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankCsv method
					return this.parseOrganizationMasterCsv(file);
				}
				//checking if name is present && name is not null or empty && name should be case-insensitive of SUBJECT_MASTER && fileExt is of form xls or xlsx
				else if (isXml && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("SUBJECT_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankXls method
					return this.parseSubjectMasterExcel(file);
				}
				//checking if name is present && name is not null or empty && name should be case-insensitive of SUBJECT_MASTER && fileExt is of form csv
				else if (isCsv && name.isPresent() && !Strings.isNullOrEmpty(name.get()) && Objects.equals("SUBJECT_MASTER".trim().toUpperCase(), name.get().trim().toUpperCase())) {

					//calling current class uploadQuestionBankCsv method
					return this.parseSubjectMasterCsv(file);
				}

				else {

					//throwing run-time exception
					throw new RuntimeException();
				}

			} else {
				//throwing run time exception
				throw new RuntimeException("file name is empty");
			}
		}

		//catch block
		catch(Exception e){
			//logging exception
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}
	}


	
	// parse OrganizationMaster in Excel
	private ResponseEntity <Map <String, Object>> parseOrganizationMasterExcel(MultipartFile file){
		
		HashMap <String, Object> responseMap = new HashMap <>();
		
		ArrayList <OrganizationMasterDB> organizationMasters = new ArrayList <>();
		
		try{
			Workbook workbook = this.getWorkbook(file, file.getInputStream());
			
			Sheet sheet = Objects.requireNonNull(workbook).getSheetAt(0);
			
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) continue;
				
				String organizationName = row.getCell(0).getStringCellValue();
				String organizationCode = row.getCell(1).getStringCellValue();
				Boolean isActive = row.getCell(2).getBooleanCellValue();
				String contact = row.getCell(3).getStringCellValue();
				String organizationImage = !Strings.isNullOrEmpty(row.getCell(4).getStringCellValue()) ? row.getCell(4).getStringCellValue() : null;
				organizationMasters.add(new OrganizationMasterDB(null, organizationName, organizationCode, isActive, contact, organizationImage, null, null));
				
				organizationMasters.trimToSize();
			}
			
			return saveOrganization(file, responseMap, organizationMasters);
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			responseMap.put("exception", e.getMessage());
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	

	private ResponseEntity <Map <String, Object>> saveOrganization(MultipartFile file, HashMap <String, Object> responseMap, ArrayList <OrganizationMasterDB> organizationMasters){
		
		try{
			List <OrganizationMasterDB> organizationMasterDBList = lmsDaoInterf.saveOrganizationMaster(organizationMasters);
			
			return this.responseEntity(file, responseMap, Objects.isNull(organizationMasterDBList), organizationMasterDBList.isEmpty());
		}
		catch(Exception e)
		{
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			responseMap.put("exception", e.getMessage());
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	private ResponseEntity <Map <String, Object>> responseEntity(MultipartFile file, HashMap <String, Object> responseMap, boolean aNull, boolean empty){
		
		if (!aNull && !empty) {
			// Successful response
			responseMap.put("status", Boolean.TRUE);
			responseMap.put("message", "File uploaded successfully: " + file.getOriginalFilename());
			return ResponseEntity.ok().body(responseMap);
		} else {
			// Successful response
			responseMap.put("status", Boolean.TRUE);
			responseMap.put("message", "File uploaded unsuccessfully: " + file.getOriginalFilename());
			return ResponseEntity.unprocessableEntity().body(responseMap);
		}
	}
	
	
	// parse OrganizationMaster in Csv
	private ResponseEntity <Map <String, Object>> parseOrganizationMasterCsv(MultipartFile file){
		
		HashMap <String, Object> responseMap = new HashMap <>();
		
		ArrayList <OrganizationMasterDB> organizationMasters = new ArrayList <>();
		
		try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))){
			
			List <String[]> rows = reader.readAll();
			
			// Skip the header row
			rows.removeFirst();
			
			// Start from 1 to skip the header row
			rows.forEach(row -> {
				
				String organizationName = row[0];
				String organizationCode = row[1];
				Boolean isActive = Boolean.parseBoolean(row[2]);
				String contact = row[3];
				String organizationImage = !Strings.isNullOrEmpty(row[4]) ? row[4] : null;
				organizationMasters.add(new OrganizationMasterDB(null, organizationName, organizationCode, isActive, contact, organizationImage, null, null));
				
				organizationMasters.trimToSize();
			});
			
			return saveOrganization(file, responseMap, organizationMasters);
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			responseMap.put("exception", e.getMessage());
			
			return ResponseEntity.internalServerError().body(responseMap);
		}
	}


	// parse Holiday Master in Excel
	private ResponseEntity <Map <String, Object>> uploadHolidayMasterXls(MultipartFile holidayFile, Long branchId){

		try (InputStream inputStream = holidayFile.getInputStream()){


			Workbook workbook = this.getWorkbook(holidayFile, inputStream);

			Sheet sheet = Objects.requireNonNull(workbook).getSheetAt(0);
			LinkedHashMap <String, HolidayMaster> holidayMap = new LinkedHashMap <>();

			// Start from 1 to skip the header row
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {

				Row row = sheet.getRow(i);
				if (row == null) continue;

				String holidayName = row.getCell(0).getStringCellValue();
				String holidayType = row.getCell(1).getStringCellValue();
				LocalDate holidayFromDate = LocalDate.parse(row.getCell(2).getStringCellValue(), DateTimeFormatter.ofPattern("dd-MM-yyyy"));
				LocalDate holidayToDate = LocalDate.parse(row.getCell(3).getStringCellValue(), DateTimeFormatter.ofPattern("dd-MM-yyyy"));
				Boolean isActive = row.getCell(4).getBooleanCellValue();


				HolidayMaster holiday = holidayMap.computeIfAbsent(holidayName, function -> new HolidayMaster());

				holiday.setHolidayName(holidayName);
				holiday.setHolidayType(holidayType);
				holiday.setHolidayFromDate(holidayFromDate);
				holiday.setHolidayToDate(holidayToDate);
				holiday.setIsActive(isActive);

			}

			List <HolidayMaster> holidayMasterDBS = new ArrayList <>(holidayMap.values());


			return this.adminServiceInterf.saveHolidayXsl(branchId, holidayMasterDBS);

		}

		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}

	}


	// parse Holiday Master in Csv
	private ResponseEntity <Map <String, Object>> uploadHolidayMasterCsv(MultipartFile holidayFile, Long branchId){

		try (CSVReader reader = new CSVReader(new InputStreamReader(holidayFile.getInputStream()))){

			List <String[]> rows = reader.readAll();

			// Skip the header row
			rows.removeFirst();

			LinkedHashMap <String, HolidayMaster> holidayMap = new LinkedHashMap <>();

			// Start from 1 to skip the header row
			rows.forEach(row -> {

				String holidayName = row[0];
				String holidayType = row[1];
				LocalDate holidayFromDate = LocalDate.parse(row[2], DateTimeFormatter.ofPattern("dd-MM-yyyy"));
				LocalDate holidayToDate = LocalDate.parse(row[3], DateTimeFormatter.ofPattern("dd-MM-yyyy"));
				Boolean isActive = Boolean.parseBoolean(row[4]);

				HolidayMaster holiday = holidayMap.computeIfAbsent(holidayName, function -> new HolidayMaster());

				holiday.setHolidayName(holidayName);
				holiday.setHolidayType(holidayType);
				holiday.setHolidayFromDate(holidayFromDate);
				holiday.setHolidayToDate(holidayToDate);
				holiday.setIsActive(isActive);

			});

			List <HolidayMaster> holidayMasterDBS = new ArrayList <>(holidayMap.values());

			return this.adminServiceInterf.saveHolidayXsl(branchId, holidayMasterDBS);

		}

		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);

			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}

	}


	// parse Quiz Question in Excel
	private ResponseEntity <Map <String, Object>> uploadQuestionBankXls(MultipartFile questionFile, Long chapterId, Optional <Long> quizId){
		
		try (InputStream inputStream = questionFile.getInputStream()){
			
			
			Workbook workbook = this.getWorkbook(questionFile, inputStream);
			
			Sheet sheet = Objects.requireNonNull(workbook).getSheetAt(0);
			LinkedHashMap <String, QuizQuestionsDB> questionMap = new LinkedHashMap <>();
			
			// Start from 1 to skip the header row
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				
				Row row = sheet.getRow(i);
				if (row == null) continue;
				
				String questionText = row.getCell(0).getStringCellValue();
				String answerOption = row.getCell(1).getStringCellValue();
				boolean isCorrect = row.getCell(2).getBooleanCellValue();
				String questionType = row.getCell(3).getStringCellValue();
				
				this.setQuizQuestion(questionMap, questionText, answerOption, isCorrect, questionType);
			}
			
			List <QuizQuestionsDB> questionsDBS = new ArrayList <>(questionMap.values());
			
			
			return this.studyMaterialServiceInterf.saveQuizXsl(chapterId, quizId, questionsDBS);
			
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}
		
	}
	
	private void setQuizQuestion(LinkedHashMap <String, QuizQuestionsDB> questionMap, String questionText, String answerOption, boolean isCorrect, String questionType){
		
			QuizQuestionsDB quizQuestion = questionMap.computeIfAbsent(questionText, function -> new QuizQuestionsDB());
			quizQuestion.setQuestionText(questionText);
			quizQuestion.setQuestionType(questionType);
			
			QuizAnswersDB quizAnswer = new QuizAnswersDB();
			quizAnswer.setAnswerOption(answerOption);
			quizAnswer.setIsCorrect(isCorrect);
			
			if (isCorrect) {
				QuizCorrectAnswersDB correctAnswerDB = new QuizCorrectAnswersDB();
				correctAnswerDB.setQuizQuestionsDB(quizQuestion);
				correctAnswerDB.setQuizAnswersDB(quizAnswer);
				
				quizQuestion.setQuizCorrectAnswersDB(correctAnswerDB);
			}
			quizAnswer.setQuizQuestionsDB(quizQuestion);
			
			quizQuestion.getQuizAnswersDBList().add(quizAnswer);
		
	}
	
	
	// parse Quiz Question in Csv
	private ResponseEntity <Map <String, Object>> uploadQuestionBankCsv(MultipartFile questionFile, Long chapterId, Optional <Long> quizId){
		
		try (CSVReader reader = new CSVReader(new InputStreamReader(questionFile.getInputStream()))){
			
			List <String[]> rows = reader.readAll();
			
			// Skip the header row
			rows.removeFirst();
			
			LinkedHashMap <String, QuizQuestionsDB> questionMap = new LinkedHashMap <>();
			// Start from 1 to skip the header row
			rows.forEach(row -> {
				
				String questionText = row[0];
				String answerOption = row[1];
				boolean isCorrect = Boolean.parseBoolean(row[2]);
				String questionType = row[3];
				
				this.setQuizQuestion(questionMap, questionText, answerOption, isCorrect, questionType);
			});
			
			List <QuizQuestionsDB> questionsDBS = new ArrayList <>(questionMap.values());
			
			
			return this.studyMaterialServiceInterf.saveQuizXsl(chapterId, quizId, questionsDBS);
			
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}
		
	}


	// parse Test Questions in Excel
	private ResponseEntity <Map <String, Object>> uploadTestQuestionBankXls(MultipartFile questionFile, Long testId){
		
		try (InputStream inputStream = questionFile.getInputStream()){
			
			
			Workbook workbook = this.getWorkbook(questionFile, inputStream);
			
			Sheet sheet = Objects.requireNonNull(workbook).getSheetAt(0);
			LinkedHashMap <String, TestQuestionsDB> questionMap = new LinkedHashMap <>();
			
			// Start from 1 to skip the header row
			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				
				Row row = sheet.getRow(i);
				if (row == null) continue;
				
				String questionText = row.getCell(0).getStringCellValue();
				String answerOption = row.getCell(1).getStringCellValue();
				boolean isCorrect = row.getCell(2).getBooleanCellValue();
				String questionType = row.getCell(3).getStringCellValue();
				Integer questionMark = (int) row.getCell(4).getNumericCellValue();
				
				saveTestQuestion(questionMap, questionText, answerOption, isCorrect, questionType, questionMark);
			}
			
			List <TestQuestionsDB> questionsDBS = new ArrayList <>(questionMap.values());
			
			
			return this.adminServiceInterf.saveTestXsl(testId, questionsDBS);
			
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}
		
	}


	// parse Test Questions in Csv
	private ResponseEntity <Map <String, Object>> uploadTestQuestionBankCsv(MultipartFile questionFile, Long testId){
		
		try (CSVReader reader = new CSVReader(new InputStreamReader(questionFile.getInputStream()))){
			
			List <String[]> rows = reader.readAll();
			
			// Skip the header row
			rows.removeFirst();
			
			LinkedHashMap <String, TestQuestionsDB> questionMap = new LinkedHashMap <>();
			
			// Start from 1 to skip the header row
			rows.forEach(row -> {
				
				String questionText = row[0];
				String answerOption = row[1];
				boolean isCorrect = Boolean.parseBoolean(row[2]);
				String questionType = row[3];
				Integer questionMark = Integer.valueOf(row[4]);
				
				saveTestQuestion(questionMap, questionText, answerOption, isCorrect, questionType, questionMark);
				
			});
			
			List <TestQuestionsDB> questionsDBS = new ArrayList <>(questionMap.values());
			
			
			return this.adminServiceInterf.saveTestXsl(testId, questionsDBS);
			
		}
		
		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			
			return ResponseEntity.internalServerError().body(Collections.emptyMap());
		}
		
	}


	// parse OrganizationMaster in Excel
	private ResponseEntity <Map <String, Object>> parseSubjectMasterExcel(MultipartFile file){

		HashMap <String, Object> responseMap = new HashMap <>();

		ArrayList <SubjectMasterDB> subjectMasterDBS = new ArrayList <>();

		try{
			Workbook workbook = this.getWorkbook(file, file.getInputStream());

			Sheet sheet = Objects.requireNonNull(workbook).getSheetAt(0);

			for (int i = 1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				if (row == null) continue;

				String subjectName = row.getCell(0).getStringCellValue();
				Boolean isActive = row.getCell(1).getBooleanCellValue();
				subjectMasterDBS.add(new SubjectMasterDB(null, subjectName, isActive, null, null, null, null,null));

				subjectMasterDBS.trimToSize();
			}

			List <SubjectMasterDB> subjectMasterList = lmsDaoInterf.saveSubjectMaster(subjectMasterDBS);
			
			return this.responseEntity(file, responseMap, Objects.isNull(subjectMasterList), subjectMasterList.isEmpty());
		}

		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			responseMap.put("exception", e.getMessage());

			return ResponseEntity.internalServerError().body(responseMap);
		}
	}


	// parse OrganizationMaster in Csv
	private ResponseEntity <Map <String, Object>> parseSubjectMasterCsv(MultipartFile file){

		HashMap <String, Object> responseMap = new HashMap <>();

		ArrayList <SubjectMasterDB> subjectMasterDBS = new ArrayList <>();

		try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))){

			List <String[]> rows = reader.readAll();

			// Skip the header row
			rows.removeFirst();

			// Start from 1 to skip the header row
			rows.forEach(row -> {

				String subjectName = row[0];
				Boolean isActive = Boolean.parseBoolean(row[1]);
				subjectMasterDBS.add(new SubjectMasterDB(null, subjectName, isActive, null, null, null, null,null));

				subjectMasterDBS.trimToSize();
			});

			List <SubjectMasterDB> subjectMasterList = lmsDaoInterf.saveSubjectMaster(subjectMasterDBS);
			
			return this.responseEntity(file, responseMap, Objects.isNull(subjectMasterList), subjectMasterList.isEmpty());
		}

		catch(Exception e){
			logger.error(e.fillInStackTrace());
			logger.catching(e);
			responseMap.put("exception", e.getMessage());

			return ResponseEntity.internalServerError().body(responseMap);
		}
	}
	
	private void saveTestQuestion(LinkedHashMap <String, TestQuestionsDB> questionMap, String questionText, String answerOption, boolean isCorrect, String questionType, Integer questionMark){
		TestQuestionsDB quizQuestion = questionMap.computeIfAbsent(questionText, function -> new TestQuestionsDB());
		
		quizQuestion.setQuestion(questionText);
		quizQuestion.setQuestionType(questionType);
		quizQuestion.setQuestionMark(questionMark);
		
		TestAnswersDB quizAnswer = new TestAnswersDB();
		quizAnswer.setAnswer(answerOption);
		quizAnswer.setCorrectOption(isCorrect);
		
		if (isCorrect) {
			CorrectAnswerDB correctAnswerDB = new CorrectAnswerDB();
			correctAnswerDB.setTestQuestionsDB(quizQuestion);
			correctAnswerDB.setTestAnswersDB(quizAnswer);
			
			quizQuestion.setCorrectAnswerDB(correctAnswerDB);
		}
		quizAnswer.setTestQuestionsDB(quizQuestion);
		
		quizQuestion.getTestAnswersDB().add(quizAnswer);
	}
	
	
	private Workbook getWorkbook(MultipartFile questionFile, InputStream inputStream) throws IOException{
		
		if (Objects.requireNonNull(questionFile.getOriginalFilename()).endsWith("xlsx")) {
			return new XSSFWorkbook(inputStream);
		} else if (questionFile.getOriginalFilename().endsWith("xls")) {
			return new HSSFWorkbook(inputStream);
		}
		return null;
		
	}
}
