package com.soul.lms.config;

import com.soul.lms.model.entity.studymaterial.LibraryMasterDB;
import com.soul.lms.model.entity.studymaterial.MaterialDescDB;
import com.soul.lms.model.entity.studymaterial.MaterialEnrollmentDB;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import com.soul.lms.model.jparepository.mastersrepository.SubjectMasterRepo;
import com.soul.lms.model.jparepository.studymaterialsrepository.LibraryMasterRepo;
import com.soul.lms.model.jparepository.studymaterialsrepository.MaterialEnrollmentRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEMO_USER = "student@gmail.com";

    private final SubjectMasterRepo subjectMasterRepo;
    private final LibraryMasterRepo libraryMasterRepo;
    private final MaterialEnrollmentRepo materialEnrollmentRepo;

    public DemoDataSeeder(SubjectMasterRepo subjectMasterRepo,
                          LibraryMasterRepo libraryMasterRepo,
                          MaterialEnrollmentRepo materialEnrollmentRepo) {
        this.subjectMasterRepo = subjectMasterRepo;
        this.libraryMasterRepo = libraryMasterRepo;
        this.materialEnrollmentRepo = materialEnrollmentRepo;
    }

    @Override
    public void run(String... args) {
        seedSubjectsAndCourses();
    }

    private void seedSubjectsAndCourses() {
        // avoid re-seeding when enrollments already exist for demo user
        boolean hasEnrollments = materialEnrollmentRepo.fetchActiveEnrolledMaterials(DEMO_USER, null)
                .map(list -> !list.isEmpty())
                .orElse(false);
        if (hasEnrollments) {
            return;
        }

        SubjectMasterDB physics = findOrCreateSubject("Physics");
        SubjectMasterDB chemistry = findOrCreateSubject("Chemistry");
        SubjectMasterDB excel = findOrCreateSubject("Excel Skills");

        LibraryMasterDB classroom1 = findOrCreateCourse("PHY-101", "Physics Basics", false,
                physics, "Introductory mechanics, motion, and energy.");
        LibraryMasterDB classroom2 = findOrCreateCourse("CHE-101", "Chemistry Essentials", false,
                chemistry, "Atomic structure, bonding, and reactions overview.");
        LibraryMasterDB skill1 = findOrCreateCourse("SKL-201", "Excel Mastery", true,
                excel, "Hands-on Excel for data analysis and dashboards.");

        // mark one course completed, others in-progress
        ensureEnrollment(classroom1, false);
        ensureEnrollment(skill1, true);
        ensureEnrollment(classroom2, false);
    }

    private SubjectMasterDB findOrCreateSubject(String name) {
        return subjectMasterRepo.findAll().stream()
                .filter(s -> name.equalsIgnoreCase(s.getSubjectName()))
                .findFirst()
                .orElseGet(() -> {
                    SubjectMasterDB subject = new SubjectMasterDB();
                    subject.setSubjectName(name);
                    subject.setIsActive(Boolean.TRUE);
                    return subjectMasterRepo.save(subject);
                });
    }

    private LibraryMasterDB findOrCreateCourse(String code, String name, boolean certification,
                                               SubjectMasterDB subject, String brief) {
        Optional<LibraryMasterDB> existing = libraryMasterRepo.findAll().stream()
                .filter(c -> code.equalsIgnoreCase(c.getMaterialCode()))
                .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        LibraryMasterDB course = new LibraryMasterDB();
        course.setMaterialName(name);
        course.setMaterialCode(code);
        course.setSubjectMasterDB(subject);
        course.setIsCertificationRequired(certification);
        course.setIsPublished(Boolean.TRUE);
        course.setIsActive(Boolean.TRUE);
        course.setMaterialPrice(0.0);
        course.setDiscountPercentage(0.0);
        course.setRating(4.5f);
        course.setTotalRatings(10);

        MaterialDescDB desc = new MaterialDescDB();
        desc.setMaterialBrief(brief);
        desc.setNumberOfChapters(6L);
        desc.setNumberOfAssignments(1L);
        desc.setDownloadableResources(2L);
        course.setMaterialDescDB(desc);

        return libraryMasterRepo.save(course);
    }

    private void ensureEnrollment(LibraryMasterDB course, boolean completed) {
        if (course.getMaterialId() == null) {
            return;
        }

        boolean alreadyEnrolled = materialEnrollmentRepo.fetchEnrollmentStatus(course.getMaterialId(), DEMO_USER)
                .isPresent();

        if (alreadyEnrolled) {
            return;
        }

        MaterialEnrollmentDB enrollment = new MaterialEnrollmentDB();
        enrollment.setUsername(DEMO_USER);
        enrollment.setMaterialId(course.getMaterialId());
        enrollment.setMaterialName(course.getMaterialName());
        enrollment.setTutorName("Demo Tutor");
        enrollment.setIsCompleted(completed);
        enrollment.setIsActive(Boolean.TRUE);
        enrollment.setLibraryMasterDB(course);

        materialEnrollmentRepo.save(enrollment);
    }
}
