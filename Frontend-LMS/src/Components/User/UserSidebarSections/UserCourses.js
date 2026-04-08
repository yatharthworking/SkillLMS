import React, { useCallback, useEffect, useRef, useState } from "react";
import "../UserSidebarSections/UserCourses.css";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../../../Assets/Images/searchIcon.svg";
import CourseBoxPicture from "../../../Assets/Images/courseBoxPicture.svg";
import NoClassImage from "../../../Assets/Images/noClassImage.svg";
import RatedStar from "../../../Assets/Images/ratedStar.svg";
import { renderStars } from "./UserStarRating";
import axios from "axios";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";
import { toast } from "react-toastify";
import ActionMenu from "../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from '@mui/icons-material/Check';

export default function UserCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inProgress"); // State to track active tab

  const [courseMaster, setCourseMaster] = useState([]);
  const [skillCourseMaster, setSkillCourseMaster] = useState([]);

  // State variables for filtered courses
  const [filteredLibraryCourses, setFilteredLibraryCourses] = useState([]);
  const [filteredInProgressCourses, setFilteredInProgressCourses] = useState([]);
  const [filteredCompletedCourses, setFilteredCompletedCourses] = useState([]);
 
  // Unified filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]); // Dynamic subjects from backend
 

  const [userEmail, setUserEmail] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [skillEnrollments, setSkillEnrollments] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [skillCompletedCourses, setSkillCompletedCourses] = useState([]);
  const [knownSkillMaterialIds, setKnownSkillMaterialIds] = useState([]);

  // Loading states for each tab
  const [loadingCourses, setLoadingCourses] = useState(false); // State for courses loading
  const [loadingInProgress, setLoadingInProgress] = useState(false); // State for in-progress loading
  const [loadingCompleted, setLoadingCompleted] = useState(false); // State for completed loading
  const [selectedSection, setSelectedSection] = useState("Skill");
  const [studentBatchId, setStudentBatchId] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [expandedCourseKey, setExpandedCourseKey] = useState("");
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pollingTimerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const hasLoadedCoursesRef = useRef(false);
  const token = localStorage.getItem("token");
  const getAuthConfig = useCallback(
    () =>
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {},
    [token]
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleGoToCourseDetailPage = (course) => {
    navigate("/courseDetail", { state: { course } });
  };

  const handleEnrollNow = async (course) => {
    if (!course?.materialId || !userEmail) {
      toast.error("Unable to enroll in this course right now.");
      return;
    }

    if (course?.isActive === false) {
      toast.error("This skill program is inactive right now.");
      return;
    }

    const enrollPayload = {
      username: userEmail,
      materialId: course.materialId,
      paymentStatus: "SUCCESS",
    };
    const shouldStayInSkillPrograms = selectedSection === "Skill" || isSkillCourse(course);

    const enrollRequestConfig = {
      ...getAuthConfig(),
      params: {
        userName: userEmail,
        ...(studentBatchId != null ? { batchId: studentBatchId } : {}),
      },
    };

    try {
      let response;

      try {
        response = await axios.post(
          `${BACKEND_BASEURL}/student/courses/enroll`,
          enrollPayload,
          enrollRequestConfig
        );
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        response = await axios.post(
          `${BACKEND_BASEURL}/studyMaterial/purchaseMaterial`,
          enrollPayload,
          getAuthConfig()
        );
      }

      if (response?.status === 200) {
        toast.success(response?.data?.message === "ALREADY_ENROLLED" ? "Course already enrolled." : "Course enrolled successfully.");
        if (shouldStayInSkillPrograms) {
          rememberSkillMaterialIds([course]);
        }
        await fetchMyCoursesOverview({ silent: true });
        if (shouldStayInSkillPrograms) {
          await fetchStudentSkillPrograms();
        }
        setSelectedSection(shouldStayInSkillPrograms ? "Skill" : "Classroom");
        setActiveTab("inProgress");
        setSelectedSubject("");
        setExpandedCourseKey("");
        setLessonSearchQuery("");
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      toast.error(error?.response?.data?.message || "Failed to enroll in course");
    }
  };

  const getSafeNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };

  const createSkillProgramLessonPlaceholders = (programId, totalLessons = 0, completedLessons = 0) =>
    Array.from({ length: Math.max(0, totalLessons) }, (_, index) => ({
      chapterId: `${programId || "skill-program"}-${index + 1}`,
      chapterName: `Lesson ${index + 1}`,
      isCompleted: index < completedLessons,
      isActive: true,
    }));

  const normalizeSkillProgramCard = (programCard = {}) => {
    const materialId = programCard?.id ?? null;
    const totalLessons = Math.max(0, Math.round(getSafeNumber(programCard?.totalLessons)));
    const progressValue = Math.max(0, Math.min(100, Math.round(getSafeNumber(programCard?.progress))));
    const completedLessons = totalLessons > 0
      ? Math.min(totalLessons, Math.round((progressValue / 100) * totalLessons))
      : 0;

    return {
      materialId,
      materialName: programCard?.title || "Untitled Course",
      tutorName: programCard?.instructor || "Unknown Tutor",
      assignedTeacher: programCard?.instructor || "Unknown Tutor",
      subjectName: programCard?.subject || "General",
      progressPercentage: progressValue,
      isCompleted: programCard?.status === "completed" || progressValue >= 100,
      chapterList: createSkillProgramLessonPlaceholders(materialId, totalLessons, completedLessons),
    };
  };

  const isSkillCourse = (course) => {
    const courseIdentifier = getCourseIdentifier(course);

    return Boolean(
      (courseIdentifier && knownSkillMaterialIds.includes(courseIdentifier)) ||
      course?.isCertificationRequired === true ||
      course?.chapterList?.isCertificationRequired === true ||
      course?.libraryMasterDB?.isCertificationRequired === true
    );
  };

  const clampProgress = (value) => Math.max(0, Math.min(100, Math.round(getSafeNumber(value))));

  const getCourseSubjectName = (course) =>
    course?.subjectName ||
    course?.subject ||
    course?.libraryMasterDB?.subjectName ||
    course?.chapterList?.subjectName ||
    "General";

  const getCourseTutorName = (course) =>
    course?.tutorName ||
    course?.instructor ||
    course?.assignedTeacher ||
    course?.chapterList?.tutorName ||
    "Unknown Tutor";

  const getCourseTitle = (course) =>
    course?.materialName ||
    course?.title ||
    course?.libraryMasterDB?.materialName ||
    course?.chapterList?.materialName ||
    "Untitled Course";

  const getCourseLessons = (course) => {
    const chapters = course?.enrolledChaptersDBList || course?.chapterList || course?.chapters || course?.lessons || [];
    return Array.isArray(chapters) ? chapters : [];
  };

  const getLessonTitle = (lesson, index) =>
    lesson?.chapterName ||
    lesson?.lessonTitle ||
    lesson?.title ||
    lesson?.topicName ||
    lesson?.contentTitle ||
    `Lesson ${index + 1}`;

  const getLessonDuration = (lesson) => {
    const durationValue =
      lesson?.duration ||
      lesson?.durationInMinutes ||
      lesson?.videoDuration ||
      lesson?.timeDuration ||
      lesson?.estimatedDuration;

    if (!durationValue) {
      return "20 min";
    }

    if (typeof durationValue === "number") {
      return `${durationValue} min`;
    }

    return durationValue;
  };

  const getLessonStatus = (lesson, index, courseProgress, totalLessons = 1) => {
    if (lesson?.isCompleted || lesson?.status === "Completed") {
      return { label: "Completed", tone: "completed", icon: "Done" };
    }

    if (lesson?.isLocked || lesson?.status === "Locked") {
      return { label: "Locked", tone: "locked", icon: "Locked" };
    }

    if (lesson?.isInProgress || lesson?.status === "In Progress") {
      return { label: "In Progress", tone: "progress", icon: "Live" };
    }

    const lessonRatio = (index + 1) / Math.max(totalLessons, 1);
    if (courseProgress >= 100) {
      return { label: "Completed", tone: "completed", icon: "Done" };
    }

    if (courseProgress > 0 && lessonRatio <= courseProgress / 100) {
      return { label: "In Progress", tone: "progress", icon: "Live" };
    }

    return { label: index === 0 && courseProgress === 0 ? "Pending" : "Locked", tone: index === 0 && courseProgress === 0 ? "pending" : "locked", icon: index === 0 && courseProgress === 0 ? "Next" : "Locked" };
  };

  const getCourseProgressValue = (course) => {
    if (course?.isCompleted) {
      return 100;
    }

    if (course?.progressPercentage !== undefined && course?.progressPercentage !== null) {
      return clampProgress(course.progressPercentage);
    }

    if (course?.progress !== undefined && course?.progress !== null) {
      return clampProgress(course.progress);
    }

    const lessons = getCourseLessons(course);
    if (!lessons.length) {
      return 0;
    }

    const completedLessons = lessons.filter((lesson) => lesson?.isCompleted || lesson?.status === "Completed").length;
    return clampProgress((completedLessons / lessons.length) * 100);
  };

  const getLastStudiedLabel = (course) => {
    const rawDate =
      course?.lastAccessedAt ||
      course?.lastAccessedDate ||
      course?.updatedAt ||
      course?.updatedDate ||
      course?.modifiedDate ||
      course?.startDate;

    if (rawDate) {
      const parsedDate = new Date(rawDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        const diffInMs = Date.now() - parsedDate.getTime();
        const diffInDays = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
        if (diffInDays === 0) return "Last studied today";
        if (diffInDays === 1) return "Last studied 1 day ago";
        return `Last studied ${diffInDays} days ago`;
      }
    }

    const progressValue = getCourseProgressValue(course);
    if (progressValue >= 100) return "Completed recently";
    if (progressValue > 0) return "In progress";
    return "Not started yet";
  };

  const getCourseMetrics = (course) => {
    const lessons = getCourseLessons(course);
    const progressValue = getCourseProgressValue(course);
    const completedLessons = lessons.filter((lesson, index) => getLessonStatus(lesson, index, progressValue, lessons.length).tone === "completed").length;

    return {
      lessons,
      progressValue,
      completedLessons,
      totalLessons: lessons.length,
      subjectName: getCourseSubjectName(course),
      tutorName: getCourseTutorName(course),
      lastStudiedLabel: getLastStudiedLabel(course),
    };
  };

  const getCourseIdentifier = (course) =>
    course?.materialId ||
    course?.id ||
    course?.libraryMasterDB?.materialId ||
    course?.chapterList?.materialId ||
    course?.materialName ||
    course?.title ||
    course?.libraryMasterDB?.materialName ||
    "";

  const isEnrollmentLikeSkillProgram = (course) =>
    Boolean(course?.libraryMasterDB || course?.enrolledChaptersDBList || course?.username);

  const rememberSkillMaterialIds = useCallback((courses = []) => {
    const incomingIds = (courses || [])
      .map((course) => getCourseIdentifier(course))
      .filter(Boolean);

    if (!incomingIds.length) {
      return;
    }

    setKnownSkillMaterialIds((currentIds) => {
      const mergedIds = new Set(currentIds);
      let hasNewId = false;

      incomingIds.forEach((courseId) => {
        if (!mergedIds.has(courseId)) {
          mergedIds.add(courseId);
          hasNewId = true;
        }
      });

      return hasNewId ? Array.from(mergedIds) : currentIds;
    });
  }, []);

  const dedupeCoursesByIdentifier = (courses = []) => {
    const seenCourses = new Set();

    return (courses || []).filter((course) => {
      const courseIdentifier = `${getCourseIdentifier(course)}-${getCourseSubjectName(course)}`;

      if (seenCourses.has(courseIdentifier)) {
        return false;
      }

      seenCourses.add(courseIdentifier);
      return true;
    });
  };

  const normalizeLegacyCourse = (course, { forceCompleted = false } = {}) => {
    const sourceMaterial = course?.libraryMasterDB || course || {};
    const normalizedProgress = forceCompleted
      ? 100
      : clampProgress(
          course?.progressPercentage ??
          course?.completionPercentage ??
          sourceMaterial?.progressPercentage ??
          0
        );

    return {
      ...sourceMaterial,
      ...course,
      materialId: course?.materialId ?? sourceMaterial?.materialId,
      materialName: course?.materialName || sourceMaterial?.materialName || "Untitled Course",
      tutorName:
        course?.tutorName ||
        course?.assignedTeacher ||
        sourceMaterial?.tutorName ||
        sourceMaterial?.assignedTeacher ||
        sourceMaterial?.userInfoDB?.fullName ||
        "Unknown Tutor",
      assignedTeacher:
        course?.assignedTeacher ||
        course?.tutorName ||
        sourceMaterial?.assignedTeacher ||
        sourceMaterial?.userInfoDB?.fullName ||
        "Unknown Tutor",
      subjectName:
        course?.subjectName ||
        sourceMaterial?.subjectName ||
        sourceMaterial?.subjectMasterDB?.subjectName ||
        "General",
      subjectId:
        course?.subjectId ??
        sourceMaterial?.subjectId ??
        sourceMaterial?.subjectMasterDB?.subjectMasterId ??
        null,
      chapterList: Array.isArray(course?.chapterList)
        ? course.chapterList
        : Array.isArray(sourceMaterial?.chaptersDBList)
          ? sourceMaterial.chaptersDBList
          : Array.isArray(sourceMaterial?.chapterList)
            ? sourceMaterial.chapterList
            : [],
      progressPercentage: normalizedProgress,
      isCompleted: forceCompleted || Boolean(course?.isCompleted) || normalizedProgress >= 100,
      libraryMasterDB: course?.libraryMasterDB || null,
    };
  };

  const buildSubjectsFromCourses = (courses = []) => {
    const subjectMap = new Map();

    (courses || []).forEach((course) => {
      const subjectName = getCourseSubjectName(course);

      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          subjectMasterId: course?.subjectId || course?.libraryMasterDB?.subjectId || subjectMap.size + 1,
          subjectName,
        });
      }
    });

    return Array.from(subjectMap.values());
  };

  const splitCoursesByProgramType = (courses = []) => {
    const normalizedCourses = dedupeCoursesByIdentifier(courses);

    return normalizedCourses.reduce(
      (accumulator, course) => {
        if (isSkillCourse(course)) {
          accumulator.skillCourses.push(course);
          return accumulator;
        }

        accumulator.classroomCourses.push(course);
        return accumulator;
      },
      { classroomCourses: [], skillCourses: [] }
    );
  };

  const buildLegacyOverviewPayload = ({
    libraryResponse,
    inProgressResponse,
    completedResponse,
    dashboardResponse,
  }) => {
    const normalizedInProgressCourses = dedupeCoursesByIdentifier(
      (inProgressResponse?.data || [])
        .map((course) => normalizeLegacyCourse(course))
        .filter((course) => !course?.isCompleted && getCourseProgressValue(course) < 100)
    );

    const normalizedCompletedCourses = dedupeCoursesByIdentifier(
      (completedResponse?.data?.data || [])
        .map((course) => normalizeLegacyCourse(course, { forceCompleted: true }))
    );

    const enrolledCourseIds = new Set(
      [...normalizedInProgressCourses, ...normalizedCompletedCourses]
        .map((course) => getCourseIdentifier(course))
        .filter(Boolean)
    );

    const classroomDashboardCourses = (dashboardResponse?.data?.classroomMaterials || []).map((course) =>
      normalizeLegacyCourse(course)
    );
    const skillDashboardCourses = (dashboardResponse?.data?.certificationCourses || []).map((course) =>
      normalizeLegacyCourse(course)
    );

    const normalizedLibraryCourses = dedupeCoursesByIdentifier(
      [
        ...((libraryResponse?.data?.data || []).map((course) => normalizeLegacyCourse(course))),
        ...classroomDashboardCourses,
        ...skillDashboardCourses,
      ].filter((course) => {
        const courseId = getCourseIdentifier(course);
        return courseId ? !enrolledCourseIds.has(courseId) : true;
      })
    );

    const splitLibraryCourses = splitCoursesByProgramType(normalizedLibraryCourses);
    const splitInProgressCourses = splitCoursesByProgramType(normalizedInProgressCourses);
    const splitCompletedCourses = splitCoursesByProgramType(normalizedCompletedCourses);

    const classroomEnrolledCourses = [
      ...splitInProgressCourses.classroomCourses,
      ...splitCompletedCourses.classroomCourses,
    ];
    const classroomVisibleCourses = [
      ...splitLibraryCourses.classroomCourses,
      ...classroomEnrolledCourses,
    ];
    const subjects = buildSubjectsFromCourses(classroomVisibleCourses);
    const totalLessonsAcrossCourses = classroomEnrolledCourses.reduce(
      (totalValue, course) => totalValue + getCourseMetrics(course).totalLessons,
      0
    );
    const completedLessonsAcrossCourses = classroomEnrolledCourses.reduce(
      (totalValue, course) => totalValue + getCourseMetrics(course).completedLessons,
      0
    );

    return {
      libraryCourses: splitLibraryCourses.classroomCourses,
      inProgressCourses: splitInProgressCourses.classroomCourses,
      completedCourses: splitCompletedCourses.classroomCourses,
      subjects,
      summary: {
        enrolledSubjectsCount: buildSubjectsFromCourses(classroomEnrolledCourses).length || subjects.length,
        completionRate: totalLessonsAcrossCourses
          ? Math.round((completedLessonsAcrossCourses / totalLessonsAcrossCourses) * 100)
          : splitCompletedCourses.classroomCourses.length
            ? 100
            : 0,
        streak: 0,
      },
      skillPrograms: {
        libraryPrograms: splitLibraryCourses.skillCourses,
        inProgressPrograms: splitInProgressCourses.skillCourses,
        completedPrograms: splitCompletedCourses.skillCourses,
      },
    };
  };

  const applySkillProgramsPayload = useCallback((payload) => {
    const explicitStatusById = new Map(
      (payload?.programs || [])
        .map((programCard) => [programCard?.id, programCard?.status])
        .filter(([programId]) => programId !== undefined && programId !== null)
    );

    const stagedPrograms = dedupeCoursesByIdentifier([
      ...(payload?.libraryPrograms || []),
      ...(payload?.inProgressPrograms || []),
      ...(payload?.completedPrograms || []),
      ...(payload?.programs || []).map((programCard) => normalizeSkillProgramCard(programCard)),
    ]);

    const nextLibraryPrograms = [];
    const nextInProgressPrograms = [];
    const nextCompletedPrograms = [];

    stagedPrograms.forEach((program) => {
      const programId = getCourseIdentifier(program);
      const explicitStatus = explicitStatusById.get(programId);
      const progressValue = getCourseProgressValue(program);

      if (explicitStatus === "completed" || program?.isCompleted || progressValue >= 100) {
        nextCompletedPrograms.push(program);
        return;
      }

      if (explicitStatus === "in-progress" || explicitStatus === "assigned" || isEnrollmentLikeSkillProgram(program)) {
        nextInProgressPrograms.push(program);
        return;
      }

      nextLibraryPrograms.push(program);
    });

    const libraryPrograms = dedupeCoursesByIdentifier(nextLibraryPrograms);
    const inProgressPrograms = dedupeCoursesByIdentifier(nextInProgressPrograms);
    const completedPrograms = dedupeCoursesByIdentifier(nextCompletedPrograms);

    rememberSkillMaterialIds([
      ...libraryPrograms,
      ...inProgressPrograms,
      ...completedPrograms,
    ]);

    setSkillCourseMaster(libraryPrograms);
    setSkillEnrollments(inProgressPrograms);
    setSkillCompletedCourses(completedPrograms);
  }, [rememberSkillMaterialIds]);

  const resolveStudentContext = useCallback(async () => {
    const userLoginResponse = getFromLocalStorageSafe("UserLoginResponse");
    const studentDetails = getFromLocalStorageSafe("studentDetails");

    const resolvedEmail = studentDetails?.email || userLoginResponse?.username || "";
    let resolvedBatchId = studentDetails?.batchId ?? userLoginResponse?.batchId ?? null;

    setUserEmail(resolvedEmail);

    if (!resolvedEmail) {
      setStudentBatchId(null);
      return;
    }

    if (resolvedBatchId != null) {
      setStudentBatchId(resolvedBatchId);
      return;
    }

    try {
      const userDetailsResponse = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails`, {
        ...getAuthConfig(),
        params: { email: resolvedEmail },
      });

      const userDetails = userDetailsResponse?.data || {};
      const studentId = userDetails?.userDetailsId || userLoginResponse?.userDetailsId || null;
      const organizationId = userDetails?.organizationsDB?.orgId || userLoginResponse?.organizationId || null;
      resolvedBatchId = userDetails?.batchId ?? null;

      if (resolvedBatchId == null && studentId && organizationId) {
        const batchInfoResponse = await axios.get(`${BACKEND_BASEURL}/student/getBatchInfo`, {
          ...getAuthConfig(),
          params: {
            studentId,
            organizationId,
          },
        });

        resolvedBatchId = batchInfoResponse?.data?.batchDetails?.batchId ?? null;
      }

      setStudentBatchId(resolvedBatchId);
    } catch (error) {
      console.error("Failed to resolve student context:", error);
      setStudentBatchId(null);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    resolveStudentContext();
  }, [resolveStudentContext]);

  const applyOverviewPayload = useCallback((overview) => {
    const splitLibraryCourses = splitCoursesByProgramType(overview?.libraryCourses || []);
    const splitInProgressCourses = splitCoursesByProgramType(overview?.inProgressCourses || []);
    const splitCompletedCourses = splitCoursesByProgramType(overview?.completedCourses || []);
    const liveSubjects = overview?.subjects || [];
    const skillProgramsPayload = {
      libraryPrograms: dedupeCoursesByIdentifier([
        ...splitLibraryCourses.skillCourses,
        ...(overview?.skillPrograms?.libraryPrograms || []),
      ]),
      inProgressPrograms: dedupeCoursesByIdentifier([
        ...splitInProgressCourses.skillCourses,
        ...(overview?.skillPrograms?.inProgressPrograms || []),
      ]),
      completedPrograms: dedupeCoursesByIdentifier([
        ...splitCompletedCourses.skillCourses,
        ...(overview?.skillPrograms?.completedPrograms || []),
      ]),
    };
    const skillCourseIdentifiers = new Set(
      [
        ...knownSkillMaterialIds,
        ...skillProgramsPayload.libraryPrograms,
        ...skillProgramsPayload.inProgressPrograms,
        ...skillProgramsPayload.completedPrograms,
      ]
        .map((course) => (typeof course === "object" ? getCourseIdentifier(course) : course))
        .filter(Boolean)
    );
    const libraryCourses = splitLibraryCourses.classroomCourses.filter(
      (course) => !skillCourseIdentifiers.has(getCourseIdentifier(course))
    );
    const inProgressCourses = splitInProgressCourses.classroomCourses.filter(
      (course) => !skillCourseIdentifiers.has(getCourseIdentifier(course))
    );
    const completedCoursesList = splitCompletedCourses.classroomCourses.filter(
      (course) => !skillCourseIdentifiers.has(getCourseIdentifier(course))
    );
    const skillCourseCount =
      skillProgramsPayload.libraryPrograms.length +
      skillProgramsPayload.inProgressPrograms.length +
      skillProgramsPayload.completedPrograms.length;
    const classroomCourseCount =
      libraryCourses.length +
      inProgressCourses.length +
      completedCoursesList.length;

    setCourseMaster(libraryCourses);
    setEnrollments(inProgressCourses);
    setCompletedCourses(completedCoursesList);
    setSubjects(liveSubjects);
    setDashboardSummary(overview?.summary || null);
    localStorage.setItem("courseMaster", JSON.stringify(libraryCourses));

    setSelectedSection((currentSection) => {
      if (currentSection === "Skill" && skillCourseCount === 0 && classroomCourseCount > 0) {
        return "Classroom";
      }
      if (currentSection === "Classroom" && classroomCourseCount === 0 && skillCourseCount > 0) {
        return "Skill";
      }
      return currentSection;
    });

    applySkillProgramsPayload(skillProgramsPayload);
  }, [applySkillProgramsPayload, knownSkillMaterialIds]);

  const fetchStudentSkillPrograms = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_BASEURL}/student/skill-programs`, {
        ...getAuthConfig(),
        params: {
          userName: userEmail,
          ...(studentBatchId != null ? { batchId: studentBatchId } : {}),
        },
      });

      if (response?.status === 200) {
        applySkillProgramsPayload(response?.data || {});
      }
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error("Failed to fetch student skill programs:", error);
      }
    }
  }, [applySkillProgramsPayload, getAuthConfig, studentBatchId, userEmail]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchMyCoursesOverview = useCallback(
    async ({ silent = false } = {}) => {
      if (!userEmail) {
        return;
      }

      if (!silent) {
        setLoadingCourses(true);
        setLoadingInProgress(true);
        setLoadingCompleted(true);
      }

      try {
        const requestConfig = {
          ...getAuthConfig(),
          params: {
            userName: userEmail,
            ...(studentBatchId != null ? { batchId: studentBatchId } : {}),
          },
        };

        let response;

        try {
          response = await axios.get(`${BACKEND_BASEURL}/student/my-courses/overview`, requestConfig);
        } catch (overviewError) {
          if (overviewError?.response?.status !== 404) {
            throw overviewError;
          }

          try {
            response = await axios.get(`${BACKEND_BASEURL}/student/courses`, requestConfig);
          } catch (coursesError) {
            if (coursesError?.response?.status !== 404) {
              throw coursesError;
            }

            const legacyRequestConfig = {
              ...getAuthConfig(),
            };

            const legacyParams = {
              username: userEmail,
              ...(studentBatchId != null ? { batchId: studentBatchId } : {}),
            };

            const [
              libraryResult,
              inProgressResult,
              completedResult,
              dashboardResult,
            ] = await Promise.allSettled([
              axios.get(`${BACKEND_BASEURL}/studyMaterial/getLibraryMaster`, {
                ...legacyRequestConfig,
                params: legacyParams,
              }),
              axios.get(`${BACKEND_BASEURL}/studyMaterial/getInProgressMaterials`, {
                ...legacyRequestConfig,
                params: {
                  ...legacyParams,
                  isCompleted: false,
                },
              }),
              axios.get(`${BACKEND_BASEURL}/studyMaterial/getCompletedMaterials`, {
                ...legacyRequestConfig,
                params: {
                  ...legacyParams,
                  isCompleted: true,
                },
              }),
              axios.get(`${BACKEND_BASEURL}/studyMaterial/getDashBoardCourses`, {
                ...legacyRequestConfig,
                params: legacyParams,
              }),
            ]);

            const hasLegacySuccess = [
              libraryResult,
              inProgressResult,
              completedResult,
              dashboardResult,
            ].some((result) => result.status === "fulfilled");

            if (!hasLegacySuccess) {
              throw coursesError;
            }

            response = {
              status: 200,
              data: buildLegacyOverviewPayload({
                libraryResponse: libraryResult.status === "fulfilled" ? libraryResult.value : null,
                inProgressResponse: inProgressResult.status === "fulfilled" ? inProgressResult.value : null,
                completedResponse: completedResult.status === "fulfilled" ? completedResult.value : null,
                dashboardResponse: dashboardResult.status === "fulfilled" ? dashboardResult.value : null,
              }),
            };
          }
        }

        if (response.status === 200) {
          applyOverviewPayload(response?.data || {});
          hasLoadedCoursesRef.current = true;
        }
      } catch (error) {
        if (!silent) {
          toast.error("Failed to fetch my courses");
          setCourseMaster([]);
          setSkillCourseMaster([]);
          setEnrollments([]);
          setSkillEnrollments([]);
          setCompletedCourses([]);
          setSkillCompletedCourses([]);
          setSubjects([]);
          setDashboardSummary(null);
        }
        console.error("Failed to fetch my courses overview:", error);
      } finally {
        if (!silent) {
          setLoadingCourses(false);
          setLoadingCompleted(false);
          setLoadingInProgress(false);
        }
      }
    },
    [applyOverviewPayload, getAuthConfig, studentBatchId, userEmail]
  );

  useEffect(() => {
    if (!userEmail) {
      setCourseMaster([]);
      setSkillCourseMaster([]);
      setEnrollments([]);
      setSkillEnrollments([]);
      setCompletedCourses([]);
      setSkillCompletedCourses([]);
      setKnownSkillMaterialIds([]);
      setSubjects([]);
      setDashboardSummary(null);
      setLoadingCourses(false);
      setLoadingInProgress(false);
      setLoadingCompleted(false);
      hasLoadedCoursesRef.current = false;
      return;
    }

    fetchMyCoursesOverview();
  }, [fetchMyCoursesOverview, userEmail]);

  useEffect(() => {
    if (!knownSkillMaterialIds.length) {
      return;
    }

    const removeKnownSkillPrograms = (courses = []) =>
      (courses || []).filter((course) => !knownSkillMaterialIds.includes(getCourseIdentifier(course)));

    setCourseMaster((currentCourses) => removeKnownSkillPrograms(currentCourses));
    setEnrollments((currentCourses) => removeKnownSkillPrograms(currentCourses));
    setCompletedCourses((currentCourses) => removeKnownSkillPrograms(currentCourses));
  }, [knownSkillMaterialIds]);

  useEffect(() => {
    if (!userEmail || selectedSection !== "Skill") {
      return;
    }

    fetchStudentSkillPrograms();
  }, [fetchStudentSkillPrograms, selectedSection, userEmail]);

  useEffect(() => {
    if (!userEmail) {
      return undefined;
    }

    const startPolling = () => {
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
      }

      pollingTimerRef.current = window.setInterval(() => {
        if (!document.hidden && hasLoadedCoursesRef.current) {
          fetchMyCoursesOverview({ silent: true });
          if (selectedSection === "Skill") {
            fetchStudentSkillPrograms();
          }
        }
      }, 30000);
    };

    startPolling();
    document.addEventListener("visibilitychange", startPolling);

    return () => {
      document.removeEventListener("visibilitychange", startPolling);
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
      }
    };
  }, [fetchMyCoursesOverview, fetchStudentSkillPrograms, selectedSection, userEmail]);

  const handleSearchInputChange = (event) => {
    // Check if event or event.target is null
    if (!event || !event.target) {
      return;
    }

    // Extract the search query from the event target's value, handling null or undefined values
    const query = event.target.value || "";
    setSearchQuery(query);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const activeLibraryCourses = selectedSection === "Skill" ? skillCourseMaster : courseMaster;
  const activeInProgressCourses = selectedSection === "Skill" ? skillEnrollments : enrollments;
  const activeCompletedCourses = selectedSection === "Skill" ? skillCompletedCourses : completedCourses;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const buildGlobalSearchEntries = (courses, section, bucket) =>
    (courses || []).map((course) => ({
      key: `${section}-${bucket}-${getCourseIdentifier(course)}-${getCourseSubjectName(course)}`,
      course,
      section,
      bucket,
      title: getCourseTitle(course),
      tutorName: getCourseTutorName(course),
      subjectName: getCourseSubjectName(course),
      progressValue: getCourseProgressValue(course),
    }));

  const globalSearchEntries = [
    ...buildGlobalSearchEntries(enrollments, "Classroom", "inProgress"),
    ...buildGlobalSearchEntries(completedCourses, "Classroom", "completed"),
    ...buildGlobalSearchEntries(courseMaster, "Classroom", "all"),
    ...buildGlobalSearchEntries(skillEnrollments, "Skill", "inProgress"),
    ...buildGlobalSearchEntries(skillCompletedCourses, "Skill", "completed"),
    ...buildGlobalSearchEntries(skillCourseMaster, "Skill", "all"),
  ].reduce((accumulator, entry) => {
    const dedupeKey = `${entry.section}-${getCourseIdentifier(entry.course)}-${entry.subjectName}`;
    if (!dedupeKey || accumulator.some((item) => `${item.section}-${getCourseIdentifier(item.course)}-${item.subjectName}` === dedupeKey)) {
      return accumulator;
    }
    accumulator.push(entry);
    return accumulator;
  }, []);

  const getSearchScore = (entry) => {
    if (!normalizedSearchQuery) {
      return 0;
    }

    const title = entry.title.toLowerCase();
    const tutorName = entry.tutorName.toLowerCase();
    const subjectName = entry.subjectName.toLowerCase();
    const sectionName = entry.section.toLowerCase();
    let score = 0;
    let hasTextMatch = false;

    if (title.startsWith(normalizedSearchQuery)) {
      score += 120;
      hasTextMatch = true;
    } else if (title.includes(normalizedSearchQuery)) {
      score += 90;
      hasTextMatch = true;
    }

    if (subjectName.startsWith(normalizedSearchQuery)) {
      score += 50;
      hasTextMatch = true;
    } else if (subjectName.includes(normalizedSearchQuery)) {
      score += 36;
      hasTextMatch = true;
    }

    if (tutorName.startsWith(normalizedSearchQuery)) {
      score += 42;
      hasTextMatch = true;
    } else if (tutorName.includes(normalizedSearchQuery)) {
      score += 24;
      hasTextMatch = true;
    }

    if (sectionName.includes(normalizedSearchQuery)) {
      score += 18;
      hasTextMatch = true;
    }

    if (!hasTextMatch) {
      return 0;
    }

    if (entry.bucket === "inProgress") score += 12;
    if (entry.bucket === "completed") score += 8;

    return score;
  };

  const searchResults = normalizedSearchQuery
    ? globalSearchEntries
        .map((entry) => ({
          ...entry,
          score: getSearchScore(entry),
        }))
        .filter((entry) => entry.score > 0)
        .sort((firstEntry, secondEntry) => secondEntry.score - firstEntry.score || firstEntry.title.localeCompare(secondEntry.title))
        .slice(0, 8)
    : [];

  const showSearchDropdown = isSearchFocused && (Boolean(normalizedSearchQuery) || globalSearchEntries.length > 0);

  const handleSearchResultSelect = (entry) => {
    if (!entry?.course) {
      return;
    }

    setSelectedSection(entry.section);
    setActiveTab(entry.bucket);
    setSelectedSubject("");
    setExpandedCourseKey("");
    setLessonSearchQuery("");
    setSearchQuery(entry.title);
    setIsSearchFocused(false);

    if (entry.bucket === "inProgress") {
      handleContinueCourse(entry.course);
      return;
    }

    if (entry.bucket === "completed") {
      handleViewCompletedCourse(entry.course);
      return;
    }

    handleGoToCourseDetailPage(entry.course);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && searchResults.length > 0) {
      event.preventDefault();
      handleSearchResultSelect(searchResults[0]);
    }

    if (event.key === "Escape") {
      setIsSearchFocused(false);
    }
  };
  
  // Unified Filtering Logic for all branches
  useEffect(() => {
    if (!isSearchFocused) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSearchFocused]);

  useEffect(() => {
    const filterCourses = (courses) => {
      return (courses || []).filter((course) => {
        // 1. Search Text Filter
        if (normalizedSearchQuery) {
          const courseName = getCourseTitle(course).toLowerCase();
          const tutorName = getCourseTutorName(course).toLowerCase();
          const subjectName = getCourseSubjectName(course).toLowerCase();
          if (
            !courseName.includes(normalizedSearchQuery) &&
            !tutorName.includes(normalizedSearchQuery) &&
            !subjectName.includes(normalizedSearchQuery)
          ) {
            return false;
          }
        }

        // 2. Subject Filter
        if (selectedSubject) {
          const courseSubjectName = course.subjectName || course.libraryMasterDB?.subjectName || "";
          if (courseSubjectName !== selectedSubject) { // Ensure the text explicitly matches the selected subject
             return false;
          }
        }

        return true;
      });
    };

    setFilteredLibraryCourses(filterCourses(activeLibraryCourses));
    
    // In progress materials format varies slightly
    setFilteredInProgressCourses(filterCourses(activeInProgressCourses));
    
    setFilteredCompletedCourses(filterCourses(activeCompletedCourses));
    
  }, [activeCompletedCourses, activeInProgressCourses, activeLibraryCourses, normalizedSearchQuery, selectedSubject]);

  const handleInprogress = (course) => {
    console.log(course);
    navigate("/progressDetail", { state: { course } });
  };

  const handleContinueCourse = (course) => {
    if (!course) {
      return;
    }

    if (getCourseProgressValue(course) >= 100 || course?.isCompleted) {
      handleGoToCourseDetailPage(course);
      return;
    }

    handleInprogress(course);
  };

  const handleResumeShortcut = () => {
    if (resumeCourse) {
      handleContinueCourse(resumeCourse);
      return;
    }

    setActiveTab("all");
  };

  const handleSelection = (section) => {
    setSelectedSection(section);
    setExpandedCourseKey("");
    setLessonSearchQuery("");
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (event) => {
    // Set menuAnchor to the event target
    setMenuAnchor(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setIsMenuOpen(false);
  };

  const handleViewCompletedCourse = (course) => {
    handleMenuClose();
    navigate("/courseDetail", { state: { course } });
  };

  const handleCompletedCertificate = () => {
    handleMenuClose();
    navigate("/userProfile", { state: { selectedTab: "MyCertificate" } });
  };


  //FOR RATING THE COURSE

  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isThankYouDialogOpen, setIsThankYouDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);

  const openRatingDialog = () => {
    setIsRatingDialogOpen(true);
  };
  
  const submitRating = () => {
    // Store the rating in the DB
    // Example: await saveRatingToDB(rating);
  
    // Close the rating dialog and open the thank you dialog
    setIsRatingDialogOpen(false);
    setIsThankYouDialogOpen(true);
  
    // Close the thank you dialog after 2 seconds
    setTimeout(() => {
      setIsThankYouDialogOpen(false);
    }, 2000);
  };

  const handleSubjectClick = (subject) => {
    if (selectedSubject === subject) {
      setSelectedSubject(""); // Click again to toggle off
      setExpandedCourseKey("");
    } else {
      setSelectedSubject(subject);
    }
  };

  const toggleExpandedCourse = (courseKey) => {
    setExpandedCourseKey((currentValue) => (currentValue === courseKey ? "" : courseKey));
  };

  const combinedEnrolledCourses = [
    ...activeInProgressCourses,
    ...activeCompletedCourses.map((course) => ({ ...course, isCompleted: true })),
  ].reduce((accumulator, course) => {
    const courseKey = `${course?.materialId || course?.chapterList?.materialId || course?.materialName}-${getCourseSubjectName(course)}`;
    if (!accumulator.some((existingCourse) => `${existingCourse?.materialId || existingCourse?.chapterList?.materialId || existingCourse?.materialName}-${getCourseSubjectName(existingCourse)}` === courseKey)) {
      accumulator.push(course);
    }
    return accumulator;
  }, []);

  const subjectCatalog = [
    ...(selectedSection === "Skill" ? [] : subjects),
    ...buildSubjectsFromCourses([
      ...activeLibraryCourses,
      ...combinedEnrolledCourses,
    ]),
  ].reduce(
    (accumulator, subjectObj, index) => {
      const subjectName = subjectObj?.subjectName;
      if (!subjectName || accumulator.some((item) => item.subjectName === subjectName)) {
        return accumulator;
      }

      accumulator.push({
        subjectMasterId: subjectObj?.subjectMasterId || subjectObj?.subjectId || index + 1,
        subjectName,
      });

      return accumulator;
    },
    []
  );

  const enrolledCoursesForInsights = combinedEnrolledCourses;

  const enrolledSubjectCards = subjectCatalog
    .map((subjectObj) => {
      const subjectCourses = enrolledCoursesForInsights.filter(
        (course) => getCourseSubjectName(course) === subjectObj.subjectName
      );
      const subjectLessons = subjectCourses.flatMap((course) => getCourseMetrics(course).lessons);
      const completedLessons = subjectCourses.reduce(
        (totalValue, course) => totalValue + getCourseMetrics(course).completedLessons,
        0
      );

      return {
        ...subjectObj,
        courseCount: subjectCourses.length,
        lessonCount: subjectLessons.length,
        completedLessons,
      };
    })
    .filter((subjectObj) => subjectObj.courseCount > 0 || !selectedSection);

  const selectedSubjectCourses = (selectedSubject
    ? enrolledCoursesForInsights.filter((course) => getCourseSubjectName(course) === selectedSubject)
    : enrolledCoursesForInsights
  ).filter((course) => {
    if (!lessonSearchQuery.trim()) {
      return true;
    }

    const normalizedLessonQuery = lessonSearchQuery.trim().toLowerCase();
    return getCourseMetrics(course).lessons.some((lesson, index) =>
      getLessonTitle(lesson, index).toLowerCase().includes(normalizedLessonQuery)
    );
  });

  const totalLessonsAcrossCourses = enrolledCoursesForInsights.reduce(
    (totalValue, course) => totalValue + getCourseMetrics(course).totalLessons,
    0
  );

  const completedLessonsAcrossCourses = enrolledCoursesForInsights.reduce(
    (totalValue, course) => totalValue + getCourseMetrics(course).completedLessons,
    0
  );

  const learningStreakDays = Math.max(0, Number(dashboardSummary?.streak || 0));
  const completionRate = Math.max(
    0,
    Math.min(
      100,
      selectedSection === "Classroom" && Number.isFinite(Number(dashboardSummary?.completionRate))
        ? Math.round(Number(dashboardSummary?.completionRate))
        : totalLessonsAcrossCourses
          ? Math.round((completedLessonsAcrossCourses / totalLessonsAcrossCourses) * 100)
          : 0
    )
  );

  const enrolledSubjectsCount =
    selectedSection === "Classroom" && Number(dashboardSummary?.enrolledSubjectsCount) > 0
      ? Number(dashboardSummary.enrolledSubjectsCount)
      : enrolledSubjectCards.length;

  const resumeCourse = filteredInProgressCourses[0] || selectedSubjectCourses[0] || null;

  const renderEmptyState = (title, subtitle) => (
    <div className="noDataImage courseEmptyState">
      <div><img src={NoClassImage} alt="" /></div>
      <div className="courseEmptyTitle">{title}</div>
      <div className="courseEmptySubTitle">{subtitle}</div>
      <button type="button" className="enrollBtn courseEmptyAction" onClick={() => handleTabClick("all")}>
        Browse Courses
      </button>
    </div>
  );

  const renderCourseSkeletons = (count = 3) =>
    Array.from({ length: count }, (_, index) => (
      <div key={`course-skeleton-${index}`} className="userCourseBox enhancedCourseBox courseSkeletonCard">
        <div className="userCourseBoxPicture courseSkeletonBlock courseSkeletonImage"></div>
        <div className="userCourseBoxTxtSection">
          <div className="userCourseBoxTxtContainer">
            <div className="courseSkeletonBlock courseSkeletonTitle"></div>
            <div className="courseSkeletonBlock courseSkeletonSubtitle"></div>
          </div>
          <div className="courseSkeletonBlock courseSkeletonMeta"></div>
          <div className="courseSkeletonBlock courseSkeletonMeta"></div>
          <div className="progressContainer">
            <div className="progressBar courseSkeletonProgressTrack">
              <div className="courseSkeletonProgressFill"></div>
            </div>
            <div className="courseSkeletonRow">
              <div className="courseSkeletonBlock courseSkeletonText"></div>
              <div className="courseSkeletonBlock courseSkeletonText"></div>
            </div>
          </div>
        </div>
        <div className="userCourseBoxBtnSection">
          <div className="courseSkeletonBlock courseSkeletonButton"></div>
          <div className="courseSkeletonBlock courseSkeletonButton courseSkeletonButtonPrimary"></div>
        </div>
      </div>
    ));

  const renderCourseInsights = (course) => {
    const metrics = getCourseMetrics(course);
    const courseKey = `${course?.materialId || course?.chapterList?.materialId || course?.materialName}-${metrics.subjectName}`;
    const isExpanded = expandedCourseKey === courseKey;
    const lessonsToDisplay = metrics.lessons.filter((lesson, index) =>
      lessonSearchQuery.trim()
        ? getLessonTitle(lesson, index).toLowerCase().includes(lessonSearchQuery.trim().toLowerCase())
        : true
    );

    return (
      <div key={courseKey} className={`courseInsightCard ${isExpanded ? "expanded" : ""}`}>
        <button
          type="button"
          className="courseInsightHeader"
          onClick={() => toggleExpandedCourse(courseKey)}
        >
          <div className="courseInsightHeaderCopy">
            <div className="courseInsightTagRow">
              <span className="courseInsightSubject">{metrics.subjectName}</span>
              <span className="courseInsightMeta">{metrics.completedLessons}/{metrics.totalLessons || 0} lessons</span>
            </div>
            <div className="courseInsightTitle">{course?.materialName || course?.chapterList?.materialName}</div>
            <div className="courseInsightSubTitle">{metrics.tutorName}</div>
          </div>
          <div className="courseInsightHeaderActions">
            <div className="courseInsightPercent">{metrics.progressValue}%</div>
            <div className={`courseInsightChevron ${isExpanded ? "open" : ""}`}>+</div>
          </div>
        </button>

        <div className="courseInsightProgress">
          <div className="progressBar insightProgressBar">
            <div className="progress" style={{ width: `${metrics.progressValue}%` }}></div>
          </div>
          <div className="courseInsightProgressRow">
            <span>{metrics.completedLessons} of {metrics.totalLessons || 0} lessons completed</span>
            <span>{metrics.lastStudiedLabel}</span>
          </div>
        </div>

        <div className={`courseLessonAccordion ${isExpanded ? "open" : ""}`}>
          <div className="courseLessonList">
            {lessonsToDisplay.length === 0 ? (
              <div className="courseLessonEmpty">No lessons match this search yet.</div>
            ) : (
              lessonsToDisplay.map((lesson, index) => {
                const lessonStatus = getLessonStatus(lesson, index, metrics.progressValue, metrics.totalLessons);
                return (
                  <button
                    type="button"
                    key={`${courseKey}-lesson-${index}`}
                    className="courseLessonItem"
                    onClick={() => handleContinueCourse(course)}
                  >
                    <div className="courseLessonCopy">
                      <div className="courseLessonTitle">{getLessonTitle(lesson, index)}</div>
                      <div className="courseLessonDuration">{getLessonDuration(lesson)}</div>
                    </div>
                    <div className={`courseLessonStatus ${lessonStatus.tone}`}>
                      <span>{lessonStatus.icon}</span>
                      <span>{lessonStatus.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="courseInsightFooter">
            <button
              type="button"
              className="viewDetailBtn"
              onClick={(event) => {
                event.stopPropagation();
                handleGoToCourseDetailPage(course);
              }}
            >
              View details
            </button>
            <button
              type="button"
              className="enrollBtn courseResumeBtn"
              onClick={(event) => {
                event.stopPropagation();
                handleContinueCourse(course);
              }}
            >
              {metrics.progressValue >= 100 ? "Open course" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="userCoursesPage">
        <div className="userCourseContainer">
          {/* Header section */}
          <div className="userHeaderSection">
            <div className="userHeaderBox">
              <div className="userHeaderTxt">Courses</div>

              <div className="userHeaderFilterSection">
               { /*<div>
                  <select
                    className="userCourseDropdown"
                  >
                    <option value="">Select Subject</option>
                    {courseMaster.map((course) => (
                      <option
                        key={course?.materialId}
                        value={course?.materialId}
                      >
                        {course?.materialName}
                      </option>
                    ))}
                  </select>
                </div>*/}
                {/* Toggle Section */}
                <div className="courseDialogToggleSection">
                  <div
                    className={`toggleSectionBox ${
                      selectedSection === "Classroom" ? "selected" : ""
                    }`}
                    onClick={() => handleSelection("Classroom")}
                  >
                    Classroom Programs
                  </div>
                  <div
                    className={`toggleSectionBox ${
                      selectedSection === "Skill" ? "selected" : ""
                    }`}
                    onClick={() => handleSelection("Skill")}
                  >
                    Skill Programs
                  </div>
                </div>

                <div className="userSearchStack" ref={searchContainerRef}>
                  <div className={`userSearchBox ${showSearchDropdown ? "searchActive" : ""}`}>
                    <div className="userSearchIconShell">
                      <img src={SearchIcon} alt="" />
                    </div>
                    <div className="userSearchFieldGroup">
                      <input
                        className="userSearchInput"
                        placeholder="Search classroom or skill programs"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onFocus={() => setIsSearchFocused(true)}
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    {searchQuery.trim() ? (
                      <button type="button" className="userSearchClearButton" onClick={handleSearchClear}>
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="userSearchSubtext">
                    Search by course name, subject, teacher, or program type
                  </div>

                  {showSearchDropdown ? (
                    <div className="userSearchResultsPanel">
                      <div className="userSearchResultsHeader">
                        <span>Course Search</span>
                        <small>
                          {normalizedSearchQuery
                            ? `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`
                            : `Search across ${courseMaster.length + enrollments.length + completedCourses.length} classroom and ${skillCourseMaster.length + skillEnrollments.length + skillCompletedCourses.length} skill items`}
                        </small>
                      </div>

                      {normalizedSearchQuery ? (
                        searchResults.length > 0 ? (
                          <div className="userSearchResultsList">
                            {searchResults.map((entry) => (
                              <button
                                type="button"
                                key={entry.key}
                                className="userSearchResultItem"
                                onClick={() => handleSearchResultSelect(entry)}
                              >
                                <div className="userSearchResultCopy">
                                  <div className="userSearchResultTitleRow">
                                    <span className="userSearchResultTitle">{entry.title}</span>
                                    <span className={`userSearchResultSection ${entry.section === "Skill" ? "skill" : "classroom"}`}>
                                      {entry.section}
                                    </span>
                                  </div>
                                  <div className="userSearchResultMeta">
                                    <span>{entry.subjectName}</span>
                                    <span>{entry.tutorName}</span>
                                    <span>
                                      {entry.bucket === "all"
                                        ? "Library"
                                        : entry.bucket === "inProgress"
                                          ? "In Progress"
                                          : "Completed"}
                                    </span>
                                  </div>
                                </div>
                                <div className="userSearchResultAction">
                                  <span>{entry.bucket === "inProgress" ? "Continue" : "Open"}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="userSearchEmptyState">
                            <div className="userSearchEmptyTitle">No matching course found</div>
                            <div className="userSearchEmptyCopy">
                              Try a course name, teacher name, subject, or switch spelling and search again.
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="userSearchStarterState">
                          <span className="userSearchStarterChip">Classroom Programs</span>
                          <span className="userSearchStarterChip skill">Skill Programs</span>
                          <span className="userSearchStarterHint">Start typing to jump directly to any course.</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {/* <button className='myCourseBtn'>My Courses <span className='myCourseBtnSubTxt'>(12)</span></button> */}
          </div>

          <div className="userHeaderVerticleLine"></div>

          <div className="userCourseDetailsListSection">

            <div className="courseSubjectList" style={{width:'200px',height:'77vh'}}>
              <div className='courseSubjectHeaderDetails'>
                <div className="subjectHeaderName">SUBJECTS</div>
                <button type="button" className='clearAll clearButton' onClick={() => setSelectedSubject('')}>Clear</button>
              </div>
              <div className="userHeaderHorizontalLine"></div>
              <div className="subjectSummaryCard">
                <div className="subjectSummaryValue">{enrolledSubjectsCount}</div>
                <div className="subjectSummaryLabel">Enrolled subjects</div>
                <div className="subjectSummaryMeta">{learningStreakDays} day learning streak</div>
              </div>
              <div className="subjectListDetails">
              {subjectCatalog.map((subjectObj) => {
                const matchedSubject = enrolledSubjectCards.find((item) => item.subjectName === subjectObj.subjectName);
                return (
                <button
                  type="button"
                  key={subjectObj.subjectMasterId}
                  className={`subjectItem ${selectedSubject === subjectObj.subjectName ? 'selected' : ''}`}
                  onClick={() => handleSubjectClick(subjectObj.subjectName)}
                >
                  <div className="subjectItemCopy">
                    <span>{subjectObj.subjectName}</span>
                    <small>{matchedSubject?.completedLessons || 0}/{matchedSubject?.lessonCount || 0} lessons</small>
                  </div>
                  <div className="subjectItemMeta">
                    {matchedSubject?.courseCount ? <span className="subjectCountBadge">{matchedSubject.courseCount}</span> : null}
                  {selectedSubject === subjectObj.subjectName && <CheckIcon className="tickIcon" />}
                  </div>
                </button>
              )})}
            </div>
            </div>

          {/* Course section */}
          <div className="userCourseSection">
            <div className="courseSummaryStrip">
              <div className="courseSummaryStat">
                <span className="courseSummaryLabel">Enrolled Courses</span>
                <span className="courseSummaryValue">{enrolledCoursesForInsights.length}</span>
              </div>
              <div className="courseSummaryStat">
                <span className="courseSummaryLabel">Completion</span>
                <span className="courseSummaryValue">{completionRate}%</span>
              </div>
              <div className="courseSummaryStat">
                <span className="courseSummaryLabel">Learning Streak</span>
                <span className="courseSummaryValue">{learningStreakDays} day{learningStreakDays === 1 ? "" : "s"}</span>
              </div>
              <div className="courseSummaryAction">
                <div className="courseSummaryActionText">
                  <span className="courseSummaryLabel">Continue Learning</span>
                  <span className="courseSummaryActionTitle">{resumeCourse?.materialName || "Browse your library"}</span>
                </div>
                <button
                  type="button"
                  className="enrollBtn courseSummaryButton"
                  onClick={handleResumeShortcut}
                >
                  {resumeCourse ? "Continue" : "Browse"}
                </button>
              </div>
            </div>

            <div className="courseInsightPanel learningPathPanel">
              <div className="courseInsightPanelHeader">
                <div>
                  <div className="courseInsightEyebrow">Learning Path</div>
                  <div className="courseInsightPanelTitle">
                    {selectedSubject ? `${selectedSubject} learning path` : "Your enrolled learning path"}
                  </div>
                  <div className="courseInsightSubTitle">
                    Track course progress, lessons completed, and continue where you left off.
                  </div>
                </div>
                <div className="courseInsightPanelTools">
                  <input
                    className="courseLessonSearch"
                    placeholder="Search lessons"
                    value={lessonSearchQuery}
                    onChange={(event) => setLessonSearchQuery(event.target.value)}
                  />
                </div>
              </div>

              {selectedSubjectCourses.length === 0 ? (
                <div className="courseInsightEmpty">
                  <div className="courseInsightEmptyTitle">No enrolled subject details yet</div>
                  <div className="courseInsightEmptySubTitle">
                    Select a subject with active enrollments or continue a course to unlock lesson tracking here.
                  </div>
                  <button type="button" className="enrollBtn courseEmptyAction" onClick={() => handleTabClick("all")}>
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="courseInsightList">
                  {selectedSubjectCourses.map((course) => renderCourseInsights(course))}
                </div>
              )}
            </div>

            {/* Tabs section */}
            <div className="userCourseTabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => handleTabClick("all")}
              >
                Library{" "}
                {loadingCourses ? null : (
                  <span className={`tabCount ${activeTab === "all" ? "active" : ""}`}>
                    ({filteredLibraryCourses?.length})
                  </span>
                )}
              </button>
              <button
                className={`tab ${activeTab === "inProgress" ? "active" : ""}`}
                onClick={() => handleTabClick("inProgress")}
              >
                In Progress{" "}
                {loadingInProgress ? null : (
                  <span className={`tabCount ${activeTab === "inProgress" ? "active" : ""}`}>
                    ({filteredInProgressCourses?.length})
                  </span>
                )}
              </button>
              <button
                className={`tab ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => handleTabClick("completed")}
              >
                Completed{" "}
                {loadingCompleted ? null : (
                  <span className={`tabCount ${activeTab === "completed" ? "active" : ""}`}>
                    ({filteredCompletedCourses?.length})
                  </span>
                )}
              </button>
            </div>
            {/* Course Area wrap start here */}

            {/* Course Area wrap start here */}
            <div className="userCourseArea">

              {activeTab === "all" && (
                <>

                {loadingCourses && (
                  <div className="userCourseArea courseSkeletonGrid">
                    {renderCourseSkeletons()}
                  </div>
                )}

                  {!loadingCourses && (
                
                <>

                  {filteredLibraryCourses?.length === 0 ? (
                    renderEmptyState("No courses available", "New teacher-assigned courses will appear here. Enroll to move them into your in-progress list.")
                  ) : ( 
                  
                  filteredLibraryCourses.map((course) => {
                    const linkedEnrollment = combinedEnrolledCourses.find((item) => item.materialId === course.materialId);
                    const metrics = getCourseMetrics(linkedEnrollment || course);
                    const isUnavailable = !linkedEnrollment && course?.isActive === false;

                    return (
                    <div key={course.materialId} className="userCourseBox enhancedCourseBox">
                      <div className="userCourseBoxPicture">
                        <img src={CourseBoxPicture} alt="" />
                      </div>

                      <div className="userCourseBoxTxtSection">
                        <div className="userCourseBoxTxtContainer">
                          <div className="userCourseBoxHeader">
                            {course?.materialName}
                          </div>
                          <div className="userCourseBoxSubHeader">
                            By {metrics.tutorName}
                          </div>
                        </div>

                        <div className="courseCardMetaRow">
                          <span className="courseMetaPill">{getCourseSubjectName(course)}</span>
                          <span className="courseMetaTime">{metrics.lastStudiedLabel}</span>
                        </div>

                        <div className="userCourseBoxTxtContainer">
                          <div className="userCourseBoxRatingSection">
                            <span className="ratingNumberSection">
                              {course?.rating || "N/A"}
                            </span>
                            <span className="ratingstarSection">
                              {renderStars(course.rating || 0)}
                            </span>
                            <span className="ratingCountSection">
                              ({course?.totalRatings})
                            </span>
                          </div>

                          <div className="userCourseBoxPriceSection">
                            <span className="discountedPriceSection">
                              {course?.discountedPrice
                                ? `₹ ${course.discountedPrice}`
                                : "Free"}
                            </span>
                            {course.discountPercentage > 0 &&
                              <span className="actualPriceSection">
                                {course?.materialPrice
                                  ? `₹ ${course.materialPrice}`
                                  : " "}
                              </span>
                            }
                          </div>
                        </div>

                        <div className="progressContainer">
                          <div className="progressBar">
                            <div
                              className="progress"
                              style={{
                                width: `${metrics.progressValue}%`,
                              }}
                            ></div>
                          </div>
                          <div className="progressText progressTextRow">
                            <span>{metrics.progressValue}% COMPLETE</span>
                            <span>{metrics.completedLessons}/{metrics.totalLessons || 0} lessons</span>
                          </div>
                        </div>
                      </div>

                      <div className="userCourseBoxBtnSection">
                        <button
                          className="viewDetailBtn"
                          onClick={() => handleGoToCourseDetailPage(course)}
                        >
                          View Details
                        </button>
                        <button
                          className="enrollBtn"
                          disabled={isUnavailable}
                          onClick={() => (linkedEnrollment ? handleContinueCourse(linkedEnrollment) : handleEnrollNow(course))}
                        >
                          {linkedEnrollment ? "Continue" : isUnavailable ? "Unavailable" : "Enroll"}
                        </button>
                      </div>
                    </div>
                 )})
                  )}
                  </>
                )}
                </>
              )}
              {activeTab === "inProgress" && (
                <>
                
                {loadingInProgress && (
                  <div className="userCourseArea courseSkeletonGrid">
                    {renderCourseSkeletons()}
                  </div>
                )}

                {!loadingInProgress && (
                
                <>

                  {filteredInProgressCourses?.length === 0 ? (
                    renderEmptyState("No in-progress courses", "Start a lesson from the library to see your study flow and module progress here.")
                  ) : (               
                
                filteredInProgressCourses?.map((course) => {
                    const metrics = getCourseMetrics(course);
                    return (
                    <div
                      key={course.materialId}
                      className="userCourseBox enhancedCourseBox"
                      onClick={() => handleContinueCourse(course)}
                    >
                      <div className="userCourseBoxPicture">
                        <img src={CourseBoxPicture} alt="" />
                      </div>

                      <div className="userCourseBoxTxtSection">
                        <div className="userCourseBoxTxtContainer">
                          <div className="userCourseBoxHeader">
                            {course?.materialName}
                          </div>
                          <div className="userCourseBoxSubHeader">
                            {metrics.tutorName}
                          </div>
                        </div>

                        <div className="courseCardMetaRow">
                          <span className="courseMetaPill">{metrics.subjectName}</span>
                          <span className="courseMetaTime">{metrics.lastStudiedLabel}</span>
                        </div>

                        <div className="progressContainer">
                          <div className="progressBar">
                            <div
                              className="progress"
                              style={{
                                width: `${metrics.progressValue}%`,
                              }}
                            ></div>
                          </div>
                          <div className="progressText progressTextRow">
                            <span>{metrics.progressValue}% COMPLETE</span>
                            <span>{metrics.completedLessons}/{metrics.totalLessons || 0} lessons</span>
                          </div>
                        </div>

                        <div className="courseActionRow">
                          <button
                            type="button"
                            className="viewDetailBtn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleGoToCourseDetailPage(course);
                            }}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="enrollBtn courseResumeBtn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleContinueCourse(course);
                            }}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  )})
                  )}
                  </>
                )}
                </>
              )}
              {activeTab === "completed" && (
                <>

                {loadingCompleted && (
                  <div className="userCourseArea courseSkeletonGrid">
                    {renderCourseSkeletons()}
                  </div>
                )}

                {!loadingCompleted && (
                
                <>

                  {filteredCompletedCourses?.length === 0 ? (
                    renderEmptyState("No completed courses yet", "Keep learning through your active modules and completed courses will appear here.")
                  ) : (
                    filteredCompletedCourses?.map((course) => {
                      const metrics = getCourseMetrics({ ...course, isCompleted: true });
                      return (
                      <div key={course.materialId} className="userCourseBox enhancedCourseBox" onClick={() => handleViewCompletedCourse(course)}>
                        <div className="userCourseBoxPicture">
                          <img src={CourseBoxPicture} alt="" />
                        </div>
                        <div className="userCourseBoxTxtSection">
                          <div className="userCourseBoxTxtContainer">
                            <div className="userCourseBoxHeader">
                              {course?.materialName || course?.chapterList?.materialName}
                            </div>
                            <div className="userCourseBoxSubHeader">
                              {metrics.tutorName}
                            </div>
                          </div>
                          <div className="courseCardMetaRow">
                            <span className="courseMetaPill">{metrics.subjectName}</span>
                            <span className="courseMetaTime">{metrics.lastStudiedLabel}</span>
                          </div>
                          <div className="progressContainer">
                            <div className="progressBar">
                              <div className="progress" style={{ width: "100%" }}></div>
                            </div>
                            <div className="progressText progressTextRow">
                              <span>100% COMPLETE</span>
                              <span>{metrics.totalLessons || 0}/{metrics.totalLessons || 0} lessons</span>
                            </div>
                          </div>
                          <div className="userCourseBoxBtnSection">
                        <button
                          className="viewRateDetailBtn"
                          onClick={(event) => {
                            event.stopPropagation();
                            openRatingDialog();
                          }}
                        >
                          Rate Course
                        </button>
                        <button className="PreviewButton" onClick={(event) => {
                          event.stopPropagation();
                          handleMenuClick(event);
                        }}>
                        <img
                        src={ActionMenu}
                        alt="ActionMenuImg"
                        />       
                     
                        </button>
                        {isMenuOpen && (
                          <Menu
                            anchorEl={menuAnchor} // You'll need to set this appropriately
                            open={Boolean(menuAnchor)}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              style={{ fontSize: "14px", cursor: "pointer",fontFamily:'Plus Jakarta Sans' }}
                              onClick={() => handleViewCompletedCourse(course)}
                            >
                              <img src="" alt="" style={{ marginRight: "8px" }} />
                              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{paddingRight:'8px'}}>
                                <g clip-path="url(#clip0_3198_6790)">
                                <path d="M1.33333 9.99967C1.33333 9.99967 4.66666 3.33301 10.5 3.33301C16.3333 3.33301 19.6667 9.99967 19.6667 9.99967C19.6667 9.99967 16.3333 16.6663 10.5 16.6663C4.66666 16.6663 1.33333 9.99967 1.33333 9.99967Z" stroke="#102E3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10.5 12.5C11.8807 12.5 13 11.3807 13 10C13 8.61929 11.8807 7.5 10.5 7.5C9.11929 7.5 8 8.61929 8 10C8 11.3807 9.11929 12.5 10.5 12.5Z" stroke="#102E3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_3198_6790">
                                <rect width="20" height="20" fill="white" transform="translate(0.5)"/>
                                </clipPath>
                                </defs>
                              </svg>

                              View Course
                            </MenuItem>
                            <MenuItem
                              style={{ fontSize: "14px", cursor: "pointer" ,fontFamily:'Plus Jakarta Sans'}}
                              onClick={handleCompletedCertificate}
                            >
                              <img src="" alt="" style={{ marginRight: "8px" }} />
                              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{paddingRight:'8px'}}>
                                <path d="M18 12.5V15.8333C18 16.2754 17.8244 16.6993 17.5118 17.0118C17.1993 17.3244 16.7754 17.5 16.3333 17.5H4.66667C4.22464 17.5 3.80072 17.3244 3.48816 17.0118C3.17559 16.6993 3 16.2754 3 15.8333V12.5" stroke="#102E3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6.33333 8.33301L10.5 12.4997L14.6667 8.33301" stroke="#102E3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10.5 12.5V2.5" stroke="#102E3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>

                              Download Certificate
                            </MenuItem>
                          </Menu>
                        )}

                        {isRatingDialogOpen && (
                        <div>
                          <div className="translucentBackground"></div>
                          <div className="ratingDialog">

                            <div className='ratingHeader'>
                              <div className='ratingHeaderTxt'>Rate Course</div>
                              <div className='ratingsubHeaderTxt'> From 1 to 5</div>
                            </div>

                            <div className="stars">
                              {/* Render the stars here and set the rating value */}
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  onClick={() => setRating(star)}
                                  className={star <= rating ? 'filledStar' : 'emptyStar'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>

                            <div className="userCourseBoxBtnSection" style={{width:'auto',margin:'20px'}}>

                                <button className="viewRateDetailBtn" onClick={() => setIsRatingDialogOpen(false)}>Do it later</button>
                                <button className="enrollBtn" style={{width:'150px', padding:'6px 36px'}} onClick={submitRating}>Submit</button>
                            </div>
                          </div>
                        </div>
                        )}

                        {isThankYouDialogOpen && (
                        <div>
                          <div className="translucentBackground"></div>
                          <div className="thankYouDialog">
                            <div className='ratingHeader' style={{background:'#D4F8DA'}}>
                              <div className='ratingHeaderTxt'><img src={RatedStar} alt=''/></div>                            
                            </div>
                            <div className='ratingHeaderTxt'>Thank you!</div>
                            <div className='ratingsubHeaderTxt' style={{margin:'20px',width:'auto',fontSize:'14px'}}>Your feedback is invaluable and helps us improve our services.</div>
                          </div>
                        </div>
                        )}
                      </div>
                        </div>
                      </div>
                    )})
                  )}
                  </>
                )}
                </>
              )}
            </div>
            {/* Course Area wrap end here */}
          </div>

          </div>
        </div>
      </div>
    </>
  );
}
