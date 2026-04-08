# SkillLMS Feature Documentation

## 1. Purpose

This document describes the current SkillLMS product based on the existing codebase and maps it against the broader feature expectations provided in the project requirement notes.

It is intended to serve as a practical feature document for:

- product understanding
- implementation assessment
- gap analysis
- roadmap planning
- stakeholder communication


## 2. Product Summary

SkillLMS is currently implemented as a web-based learning management system with:

- public course and webinar discovery
- student registration and login
- admin and teacher login
- course and batch management
- webinar scheduling and participation
- assessments and test submission
- announcements and help/support workflows
- user profile and password management
- dashboard summaries for operational analytics

The current product is a standard online LMS focused on course delivery, webinar management, student enrollment, tests, and administrative operations.

It is not yet a full hybrid panel-native offline-first ICT classroom platform with AI-assisted lesson creation, simulation labs, whiteboard collaboration, or device sync architecture.


## 3. Solution Architecture

### 3.1 Frontend

- React application built with Create React App
- Role-based UI for public users, students, admins, and limited teacher flows
- API-driven experience using axios
- Local storage/session storage used for login state and decoded token payloads

Key frontend routing is defined in [Frontend-LMS/src/App.js](Frontend-LMS/src/App.js).

### 3.2 Backend

- Spring Boot backend
- Layered controller and service structure
- JWT-based authentication with OAuth support for Google login
- PostgreSQL configured by default
- File and content services
- webinar, study material, master data, and admin modules

Backend application entry is in [Backend-LMS/src/main/java/com/soul/lms/LmsApplication.java](Backend-LMS/src/main/java/com/soul/lms/LmsApplication.java).

### 3.3 Persistence and Platform Assumptions

- Centralized database-backed LMS
- Online API model
- No implemented local device database or sync engine for offline panel-first usage
- No Android panel-specific runtime integration found in current code


## 4. User Roles in Current Codebase

### 4.1 Public User

- browse public courses
- browse public webinars
- submit contact form
- view landing pages, terms, and privacy content

Relevant files:

- [Frontend-LMS/src/Components/PublicAccess/PublicCourse.js](Frontend-LMS/src/Components/PublicAccess/PublicCourse.js)
- [Frontend-LMS/src/Components/PublicAccess/PublicWebinar.js](Frontend-LMS/src/Components/PublicAccess/PublicWebinar.js)
- [Frontend-LMS/src/Components/PublicAccess/PublicContact.js](Frontend-LMS/src/Components/PublicAccess/PublicContact.js)
- [Backend-LMS/src/main/java/com/soul/lms/publicCourses/controller/PublicController.java](Backend-LMS/src/main/java/com/soul/lms/publicCourses/controller/PublicController.java)

### 4.2 Student

- self-registration
- OTP verification
- forgot password and reset password
- profile management
- course access and progress tracking
- classroom and skill program views
- live tests and quizzes
- schedules and notifications
- webinar registration and attendance flows
- help and support submission
- feedback submission

Relevant files:

- [Frontend-LMS/src/Components/Login/RegisterStudent.js](Frontend-LMS/src/Components/Login/RegisterStudent.js)
- [Frontend-LMS/src/Components/User/UserHomePage/UserLandingPage.js](Frontend-LMS/src/Components/User/UserHomePage/UserLandingPage.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/UserDashboard.js](Frontend-LMS/src/Components/User/UserSidebarSections/UserDashboard.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/UserCourses.js](Frontend-LMS/src/Components/User/UserSidebarSections/UserCourses.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/LiveTest.js](Frontend-LMS/src/Components/User/UserSidebarSections/LiveTest.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/ExamPage.js](Frontend-LMS/src/Components/User/UserSidebarSections/ExamPage.js)
- [Frontend-LMS/src/Components/User/Notification/UserNotification.js](Frontend-LMS/src/Components/User/Notification/UserNotification.js)
- [Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java](Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java)

### 4.3 Admin

- admin login
- dashboard totals
- organization and branch management
- batch management
- course management
- webinar scheduling and monitoring
- announcements
- holiday master
- user master
- role master
- subject master
- help/support resolution
- enrollment of students and tutors
- live class setup

Relevant files:

- [Frontend-LMS/src/Components/Admin/AdminLandingPage/AdminLandingPage.js](Frontend-LMS/src/Components/Admin/AdminLandingPage/AdminLandingPage.js)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminDashboard.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminDashboard.js)
- [Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java](Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java)

### 4.4 Teacher

Teacher support exists but is narrower than admin and student support.

Observed teacher capabilities in code:

- teacher-side webinar schedule access
- view registered students for webinar
- view webinar attendance

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/teacher/controller/TeacherController.java](Backend-LMS/src/main/java/com/soul/lms/teacher/controller/TeacherController.java)


## 5. Implemented Functional Modules

### 5.1 Authentication and Access Management

Implemented capabilities:

- username/password login
- role-sensitive login behavior for student/admin or teacher/admin accounts
- JWT token issuance and refresh support
- Google sign-in initiation
- OTP-based verification for registration and forgot-password flows
- password reset flows for student and admin users

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/auth/login/controller/AuthController.java](Backend-LMS/src/main/java/com/soul/lms/auth/login/controller/AuthController.java)
- [Backend-LMS/src/main/java/com/soul/lms/auth/login/service/LoginService.java](Backend-LMS/src/main/java/com/soul/lms/auth/login/service/LoginService.java)
- [Backend-LMS/src/main/java/com/soul/lms/auth/registration/RegistrationService.java](Backend-LMS/src/main/java/com/soul/lms/auth/registration/RegistrationService.java)
- [Frontend-LMS/src/Components/Login/UserLogin.js](Frontend-LMS/src/Components/Login/UserLogin.js)
- [Frontend-LMS/src/Components/Login/AdminLogin.js](Frontend-LMS/src/Components/Login/AdminLogin.js)
- [Frontend-LMS/src/Components/Login/ForgetPassword.js](Frontend-LMS/src/Components/Login/ForgetPassword.js)
- [Frontend-LMS/src/Components/AuthContext.js](Frontend-LMS/src/Components/AuthContext.js)

Assessment:

- implemented
- security model exists
- route protection in frontend appears incomplete because protected routes are commented out in [Frontend-LMS/src/App.js](Frontend-LMS/src/App.js)

### 5.2 Public Experience

Implemented capabilities:

- marketing/landing page
- public course catalog
- public webinar catalog
- contact form
- privacy policy and terms dialogs

Assessment:

- implemented
- suitable for brochure and discovery flows
- no advanced SEO, campaign, or content segmentation was observed

### 5.3 Course and Study Material Management

Implemented capabilities:

- library master and course master structures
- add or edit library materials
- add or edit chapters
- upload binary content into chapters
- create and edit quizzes inside chapters
- activate or deactivate materials, chapters, quizzes
- publish courses to students
- fetch course material by ID
- student dashboard course grouping into classroom and certification tracks
- mark chapter or material progress/completion
- serve chapter content to the client

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/studymaterials/controller/StudyMaterialController.java](Backend-LMS/src/main/java/com/soul/lms/studymaterials/controller/StudyMaterialController.java)
- [Backend-LMS/src/main/java/com/soul/lms/studymaterials/service/StudyMaterialService.java](Backend-LMS/src/main/java/com/soul/lms/studymaterials/service/StudyMaterialService.java)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/CourseAdmin/CourseMaster.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/CourseAdmin/CourseMaster.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/UserCourses.js](Frontend-LMS/src/Components/User/UserSidebarSections/UserCourses.js)

Assessment:

- strongly implemented for a conventional LMS
- content types appear file-driven, not simulation-driven
- NCERT/SCERT digital books are not explicitly modeled as a distinct module, though digital study materials could potentially host book files

### 5.4 Batch and Enrollment Management

Implemented capabilities:

- create and update batches
- fetch upcoming, ongoing, and completed batches
- enroll tutors into batches
- enroll students into batches
- fetch enrolled students and tutors per batch
- add courses to batches
- batch-wise student schedules
- batch-wise tests and learning delivery

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java](Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java)
- [Backend-LMS/src/main/java/com/soul/lms/masters/controller/MastersController.java](Backend-LMS/src/main/java/com/soul/lms/masters/controller/MastersController.java)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch.js)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/EnrolledStudent.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/EnrolledStudent.js)

Assessment:

- implemented
- central to academic operations in current code

### 5.5 Webinar and Live Class Management

Implemented capabilities:

- create and edit webinar details
- fetch webinar schedules
- register for webinars
- join webinars
- fetch registered webinars
- fetch attended webinars
- fetch students registered and attended per webinar
- toggle webinar active status
- email notifications to webinar speakers
- live class save/update endpoints and student live-class retrieval

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/webinar/controller/WebinarController.java](Backend-LMS/src/main/java/com/soul/lms/webinar/controller/WebinarController.java)
- [Backend-LMS/src/main/java/com/soul/lms/webinar/service/WebinarService.java](Backend-LMS/src/main/java/com/soul/lms/webinar/service/WebinarService.java)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/WebinarAdmin/CreateWebinar.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/WebinarAdmin/CreateWebinar.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/UserWebinars.js](Frontend-LMS/src/Components/User/UserSidebarSections/UserWebinars.js)
- [Frontend-LMS/src/Components/User/WebinarDetails/WebinarDetail.js](Frontend-LMS/src/Components/User/WebinarDetails/WebinarDetail.js)

Assessment:

- implemented for webinar lifecycle management
- no evidence of built-in whiteboard collaboration, polling, live cursor sharing, or remote classroom control features

### 5.6 Assessment and Testing

Implemented capabilities:

- fetch upcoming, attempted, and unattempted tests
- fetch question sets for tests
- submit objective tests
- submit subjective tests
- fetch prior submissions
- student test-taking UI with timer and answer tracking
- quiz support inside learning content chapters

Relevant files:

- [Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java](Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java)
- [Frontend-LMS/src/Components/User/UserSidebarSections/LiveTest.js](Frontend-LMS/src/Components/User/UserSidebarSections/LiveTest.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/ExamPage.js](Frontend-LMS/src/Components/User/UserSidebarSections/ExamPage.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/ExamConfirmation.js](Frontend-LMS/src/Components/User/UserSidebarSections/ExamConfirmation.js)

Assessment:

- implemented for standard online assessment workflows
- no evidence of AI-generated question authoring in backend services
- the component named [Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/LiveQuestionGenerator.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/LiveQuestionGenerator.js) is currently a static management UI, not an actual AI generator

### 5.7 Dashboards and Reporting

Implemented capabilities:

- admin dashboard totals for users, courses, batches, and concerns
- branch-aware dashboard filtering for super admin or branch-admin usage
- student dashboard for enrolled courses and schedules
- user progress displays on course cards

Relevant files:

- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminDashboard.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminDashboard.js)
- [Frontend-LMS/src/Components/User/UserSidebarSections/UserDashboard.js](Frontend-LMS/src/Components/User/UserSidebarSections/UserDashboard.js)
- [Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java](Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java)

Assessment:

- implemented at operational dashboard level
- current reporting is not yet a full monitoring stack across schools, blocks, districts, and states
- no evidence of device telemetry or panel sync reporting

### 5.8 Notifications, Announcements, and Help Support

Implemented capabilities:

- add announcements to batches
- edit announcements
- student fetch unread and read announcements
- mark announcements as read
- help and support ticket submission by student
- help and support resolution by admin

Relevant files:

- [Frontend-LMS/src/Components/User/Notification/UserNotification.js](Frontend-LMS/src/Components/User/Notification/UserNotification.js)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/AnnouncementAdmin/AnnouncementTable.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/AnnouncementAdmin/AnnouncementTable.js)
- [Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminHelpSupport/AdminHelpSupport.js](Frontend-LMS/src/Components/Admin/AdminSidebarSection/AdminHelpSupport/AdminHelpSupport.js)
- [Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java](Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java)
- [Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java](Backend-LMS/src/main/java/com/soul/lms/admin/controller/AdminController.java)

Assessment:

- implemented

### 5.9 Profile and Account Management

Implemented capabilities:

- fetch user details
- update user details
- reset password
- admin profile pages
- user profile pages
- certificate and payment sections in user profile UI

Relevant files:

- [Frontend-LMS/src/Components/User/UserProfile/UserProfile.js](Frontend-LMS/src/Components/User/UserProfile/UserProfile.js)
- [Frontend-LMS/src/Components/Admin/AdminProfile/AdminProfile.js](Frontend-LMS/src/Components/Admin/AdminProfile/AdminProfile.js)
- [Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java](Backend-LMS/src/main/java/com/soul/lms/student/controller/StudentController.java)

Assessment:

- implemented for common account management

### 5.10 Payment and Purchase Workflow

Implemented capabilities:

- purchase flow UI
- billing address collection UI
- backend purchase call with success status posting

Relevant files:

- [Frontend-LMS/src/Components/User/CoursePaymentPage/CoursePayment.js](Frontend-LMS/src/Components/User/CoursePaymentPage/CoursePayment.js)
- [Backend-LMS/src/main/java/com/soul/lms/studymaterials/controller/StudyMaterialController.java](Backend-LMS/src/main/java/com/soul/lms/studymaterials/controller/StudyMaterialController.java)

Assessment:

- partially implemented
- appears to be a simplified payment confirmation flow rather than a full external payment gateway integration


## 6. Requirement-to-Code Mapping

The following section maps your requirement narrative to the current codebase status.

### 6.1 Fully or Substantially Supported in Current Code

#### Teacher, Student, and Admin Login

Status:

- implemented

Evidence:

- auth APIs and login screens exist
- separate student and admin experiences exist
- teacher role is present in backend and role handling

#### Course Delivery and Digital Learning Content

Status:

- implemented

Evidence:

- course library, chapters, content files, quizzes, completion tracking, dashboard grouping

#### Webinar and Live Session Management

Status:

- implemented

Evidence:

- webinar scheduling, registration, attendance, join flow, admin and teacher webinar views

#### Student Assessments

Status:

- implemented

Evidence:

- test fetch, question fetch, objective and subjective submission, quiz support, student test pages

#### Usage Dashboards and Role-Based Operational Reporting

Status:

- partially implemented

Evidence:

- admin dashboard totals and branch-aware views exist
- student dashboard exists


### 6.2 Partially Supported in Current Code

#### Personalized Learning Mode

Status:

- partially supported only at a very basic level

Evidence:

- student-specific enrollments, progress, schedules, and role-aware dashboards exist

Gap:

- no adaptive engine
- no class learning-level analysis
- no remedial-content recommendation logic

#### Analytics for Teacher and Student Performance

Status:

- partially supported

Evidence:

- totals and operational counts exist
- test submission and progress data exist

Gap:

- no deep analytics model for mastery, learning gaps, trend analysis, comparative performance, or district/state reporting

#### Continuous Formative and Summative Assessment Ecosystem

Status:

- partially supported

Evidence:

- tests and quizzes exist
- submissions are stored

Gap:

- no explicit formative versus summative assessment orchestration
- no structured intervention planner based on outcomes

#### Competitive Exam and Coaching Support

Status:

- partially supportable through normal course structures

Evidence:

- course and batch frameworks could host such content

Gap:

- no dedicated module, taxonomy, dashboard, or journey for competitive preparation was found


### 6.3 Not Yet Implemented in Current Code

The following requirement groups were not found as implemented modules in the codebase.

#### Offline-first Operation on Interactive Panels

Not found:

- local offline content repository for panels
- device-side data queueing
- background sync engine
- conflict resolution logic
- Android panel-native storage or service layer

#### Interactive Panel Native Operation on Android OS

Not found:

- Android native application code
- kiosk mode handling
- device management integration
- panel-specific APIs

#### AI Lesson Plan Generation

Not found:

- LLM or AI model integration
- lesson plan generation service
- 5E methodology generation workflow
- source-aware AI output pipeline

#### AI Assessment Generation

Not found:

- dynamic worksheet generation service
- AI quiz creation backend
- AI prompt pipeline

#### AI Remedial Guidance and PAL Engine

Not found:

- mastery model
- personalized adaptive learning engine
- recommendation rules or AI model for remedial content

#### AI Summarisation, Annotation, Writing Tools, Equation Solvers

Not found:

- summarisation service
- annotation AI
- math or chemistry solver service
- circle-to-search image intelligence

#### Regional Language AI Content Creation

Not found:

- translation or multilingual content generation module

#### Whiteboard Collaboration Features

Not found:

- shared whiteboard canvas
- live cursor collaboration
- teacher permission control for writing
- QR-based live collaboration invite
- infinite canvas tools
- palm erasing support
- annotation over visual presenter/mobile feeds

#### Wireless File Sharing and QR Export

Not found:

- QR code lesson sharing
- wireless receive/send layer
- access-code based file sharing service

#### Device Casting and Multiscreen Collaboration

Not found:

- screen casting management
- multiple mirrored screens
- desktop/mobile panel casting flows

#### Simulation and 3D Lab Stack

Not found:

- 365+ interactive simulations module
- STEM 3D lab engine
- simulation repository and runtime controls

#### NCERT/SCERT Digital Book Platform

Not found as a named, dedicated product feature.

Possible closest current base:

- generic study materials and content uploads

#### Offline Usage Sync to Monitoring Dashboards

Not found:

- sync jobs
- offline event log persistence on panel
- reconnect sync workflows
- device status ingestion

#### School, Block, District, and State Monitoring Views

Not found:

- reporting hierarchy for school, block, district, state
- geographic education-monitoring dashboard dimensions

#### AI Class Recording and Auto Summary Generation

Not found:

- recording subsystem
- speech-to-text pipeline
- transcript summarisation
- question extraction from recorded classes


## 7. Current Product Positioning Based on Code

The current codebase is best described as:

"A role-based web LMS for course delivery, batch management, webinars, tests, announcements, and administrative operations."

It is not yet best described as:

"An offline-first AI-powered interactive panel classroom operating system for ICT labs."

This distinction matters because the requirement narrative describes a significantly larger platform than what the current implementation supports.


## 8. Major Gaps Between Current Product and Target Vision

### 8.1 Platform Gap

Current:

- browser-based web LMS

Target:

- Android interactive panel runtime with offline-first sync

### 8.2 Intelligence Gap

Current:

- standard rules-based LMS

Target:

- AI lesson planning, AI quiz generation, AI summarisation, AI tutoring, AI remedial recommendations

### 8.3 Classroom Collaboration Gap

Current:

- webinar and live-class scheduling

Target:

- collaborative whiteboard, polling, remote student control, live collaboration, QR join workflows

### 8.4 STEM and Simulation Gap

Current:

- file-based course materials and quizzes

Target:

- simulation lab, 3D lab, math toolset, experiment visualisation

### 8.5 Monitoring Gap

Current:

- admin operational dashboard

Target:

- multi-level education governance dashboard with device health, usage, content consumption, downtime alerts, and sync visibility


## 9. Recommended Product Documentation Structure

For stakeholder presentation, the product should be documented in three layers.

### 9.1 Current Product Feature Set

- authentication and user roles
- public discovery pages
- student learning experience
- admin academic operations
- webinar management
- assessments and progress tracking
- announcements and support
- operational dashboards

### 9.2 Planned Advanced Capability Layer

- offline-first panel operation
- Android panel deployment
- AI teacher assistance
- AI assessment generation
- adaptive learning engine
- simulations and 3D labs
- district/state monitoring dashboards
- classroom collaboration tools

### 9.3 Delivery Roadmap Layer

- Phase 1: stabilize existing LMS
- Phase 2: strengthen analytics, reporting, and protected access
- Phase 3: add AI services and recommendation engine
- Phase 4: build offline sync and panel runtime capabilities
- Phase 5: add collaborative whiteboard and device integration tools


## 10. Suggested Roadmap Based on Existing Code

### Phase 1: LMS Stabilization

- restore proper protected routes on frontend
- harden auth and token handling
- clean role-based flows
- fix payment integration if commercial purchase is required
- improve dashboard consistency and API error handling

### Phase 2: Academic Intelligence Foundation

- add structured question bank management
- add learning outcome tagging
- add assessment analytics and learning-gap dashboards
- add remedial content mapping rules

### Phase 3: AI Services

- AI lesson plan generator
- AI worksheet and quiz generator
- AI summarisation and teacher assistant
- AI remedial suggestion engine

### Phase 4: Offline and Device Architecture

- local offline content package store
- offline event logging
- sync engine on reconnect
- device identity and telemetry ingestion
- Android panel deployment model

### Phase 5: Smart Classroom Tooling

- interactive whiteboard collaboration
- QR code join and lesson sharing
- live polling and cursor collaboration
- annotation on mirrored content
- simulation and 3D STEM tools


## 11. Executive Conclusion

Based on the current code, SkillLMS already provides a meaningful LMS foundation with:

- role-based access
- public discovery flows
- student course delivery
- assessments and progress tracking
- webinar workflows
- admin academic operations
- announcements and dashboard summaries

However, the requirement document describes a broader EdTech platform with:

- offline-first panel operation
- AI-driven teaching workflows
- adaptive learning
- classroom collaboration tools
- STEM simulations and digital whiteboard capabilities
- device monitoring and hierarchical reporting

Those advanced capabilities are not yet implemented in the present codebase and should be documented as future roadmap modules rather than current features.


## 12. Recommended Usage of This Document

This document can be used as:

- a current-state feature document
- a gap-analysis document
- a base input for PRD or BRD preparation
- a roadmap planning reference for future development phases
