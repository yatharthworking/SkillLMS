import React, { useCallback, useEffect, useMemo, useState } from "react";
import CourseBoxPicture from "../../../Assets/Images/courseBoxPicture.svg";
import "../UserSidebarSections/UserDashboard.css";
import axios from "axios";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";
import LinearProgress from "@mui/material/LinearProgress";
import "react-calendar/dist/Calendar.css";
import { BeatLoader } from "react-spinners";
import Calendar from "react-calendar";
import { toast } from "react-toastify";
import PulseLoader from 'react-spinners/PulseLoader';
import { useNavigate } from 'react-router-dom';
import EmptyImage from '../../../Assets/Images/emptyImage.svg';
import NoSchedule from '../../../Assets/Images/NoSchedule.svg';
import { formatTimeRange } from "../webinarUtils";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";

export default function UserDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [studentBatchId, setStudentBatchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredCertificationCourses, setFilteredCertificationCourses] = useState([]);
  const [filteredClassroomMaterials, setFilteredClassroomMaterials] = useState([]);
  const [classroomMaterials, setClassroomMaterials] = useState([]);
  const [certificationCourses, setCertificationCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlySchedules, setMonthlySchedules] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
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

  const resolveStudentContext = useCallback(async () => {
    const loginResponse = getFromLocalStorageSafe("UserLoginResponse");
    const storedStudentDetails = getFromLocalStorageSafe("studentDetails");

    const resolvedEmail = storedStudentDetails?.email || loginResponse?.username || "";
    let resolvedBatchId = storedStudentDetails?.batchId ?? loginResponse?.batchId ?? null;

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
      const userDetailsResponse = await axios.get(
        `${BACKEND_BASEURL}/student/fetchUserDetails`,
        {
          ...getAuthConfig(),
          params: { email: resolvedEmail },
        }
      );

      const userDetails = userDetailsResponse?.data || {};
      const studentId = userDetails?.userDetailsId || loginResponse?.userDetailsId || null;
      const organizationId = userDetails?.organizationsDB?.orgId || loginResponse?.organizationId || null;
      resolvedBatchId = userDetails?.batchId ?? null;

      let updatedStudentDetails = userDetails;

      if (resolvedBatchId == null && studentId && organizationId) {
        const batchInfoResponse = await axios.get(
          `${BACKEND_BASEURL}/student/getBatchInfo`,
          {
            ...getAuthConfig(),
            params: {
              studentId,
              organizationId,
            },
          }
        );

        const batchDetails = batchInfoResponse?.data?.batchDetails || {};
        resolvedBatchId = batchDetails?.batchId ?? null;
        updatedStudentDetails = {
          ...userDetails,
          batchId: resolvedBatchId,
          batchName: batchDetails?.batchName || userDetails?.batchName,
        };
      }

      if (updatedStudentDetails && Object.keys(updatedStudentDetails).length > 0) {
        localStorage.setItem("studentDetails", JSON.stringify(updatedStudentDetails));
      }

      setStudentBatchId(resolvedBatchId);
    } catch (error) {
      console.error("Failed to resolve student context:", error);
      setStudentBatchId(null);
    }
  }, [getAuthConfig]);

  const fetchEnrollments = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    setLoading(true);

    try {
      const params = { username: userEmail };
      
      // Add batchId to params if it exists
      if (studentBatchId) {
        params.batchId = studentBatchId;
      }

      const response = await axios.get(
        `${BACKEND_BASEURL}/studyMaterial/getDashBoardCourses`,
        {
          ...getAuthConfig(),
          params: params,
        }
      );

      if (response.status === 200) {
        const data = response?.data;

        setClassroomMaterials(data?.classroomMaterials || []);
        setCertificationCourses(data?.certificationCourses || []);

        setFilteredClassroomMaterials(data?.classroomMaterials || []);
        setFilteredCertificationCourses(data?.certificationCourses || []);
      }
    } catch (error) {
      toast.error("Failed to fetch user dashboard courses");
      console.error("Failed to fetch dashboard courses:", error);
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, userEmail, studentBatchId]);

  useEffect(() => {
    resolveStudentContext();
  }, [resolveStudentContext]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const fetchDashboardSummary = useCallback(async () => {
    if (!userEmail) {
      setDashboardSummary(null);
      return;
    }

    try {
      setSummaryLoading(true);
      const response = await axios.get(`${BACKEND_BASEURL}/student/dashboard/summary`, {
        ...getAuthConfig(),
        params: {
          userName: userEmail,
          ...(studentBatchId ? { batchId: studentBatchId } : {}),
          testType: "LIVE_TEST",
        },
      });

      if (response.status === 200 && response?.data?.status) {
        setDashboardSummary(response?.data?.summary || null);
      } else {
        setDashboardSummary(null);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
      setDashboardSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [getAuthConfig, studentBatchId, userEmail]);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  const fetchMonthlyEvents = useCallback(async (year, month) => {
    if (!userEmail || studentBatchId == null) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true); 
      const response = await axios.get(
        `${BACKEND_BASEURL}/student/getMonthlyStudentSchedules`,
        {
          ...getAuthConfig(),
          params: {
            userName: userEmail,
            year: year,
            month: month,
            batchId: studentBatchId,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setMonthlySchedules(data.schedules || {});
      }
    } catch (error) {
      console.error("Failed to fetch monthly schedules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthConfig, studentBatchId, userEmail]);

  const fetchAnnouncements = useCallback(async () => {
    if (!userEmail) return;
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/student/fetchAnnouncements`, {
        ...getAuthConfig(),
        params: {
          userName: userEmail,
          markAsRead: false,
        },
      });
      if (response.status === 200) {
        setAnnouncements(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  }, [getAuthConfig, userEmail]);

  useEffect(() => {
    const now = new Date();
    fetchMonthlyEvents(now.getFullYear(), now.getMonth() + 1);
    fetchAnnouncements();
  }, [fetchMonthlyEvents, fetchAnnouncements]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const renderTileContent = ({ date, view }) => {
    if (view === "month") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const dateSchedules = monthlySchedules[formattedDate] || [];
      const hasHoliday = dateSchedules.some((schedule) => schedule.scheduleType === "HOLIDAY");
      const hasClassEvent = dateSchedules.some(
        (schedule) => schedule.scheduleType === "WEBINAR" || schedule.scheduleType === "LIVE TEST"
      );
      const hasAnnouncement = getAnnouncementsForDate(date).length > 0;

      if (hasHoliday || hasClassEvent || hasAnnouncement) {
        return (
          <div className="dashboardCalendarMarkers">
            {hasHoliday && <span className="dashboardCalendarMarker holiday" title="Holiday or festival" />}
            {hasClassEvent && <span className="dashboardCalendarMarker class" title="Scheduled class event" />}
            {hasAnnouncement && <span className="dashboardCalendarMarker announcement" title="Teacher announcement" />}
          </div>
        );
      }
    }
    return null;
  };

  const getSchedulesForSelectedDate = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return monthlySchedules[formattedDate] || [];
  };

  const getAnnouncementsForDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    return announcements.filter((announcement) => {
      if (!announcement?.creationTimeStamp) {
        return false;
      }

      const announcementDate = new Date(announcement.creationTimeStamp);
      if (Number.isNaN(announcementDate.getTime())) {
        return false;
      }

      const announcementKey = `${announcementDate.getFullYear()}-${String(
        announcementDate.getMonth() + 1
      ).padStart(2, '0')}-${String(announcementDate.getDate()).padStart(2, '0')}`;

      return announcementKey === formattedDate;
    });
  }, [announcements]);

  const getProgressPercentage = (text) => {
    const match = text.match(/(\d+)%/);
    return match ? `${match[1]}%` : "0%";
  };

  const navigate = useNavigate();

  const handleGoTOUserCourses = () => {
    navigate('/userLandingPage', { state: { selectedBox: 'myCourses' } });
  };

  const handleLivetestPage = () =>{
    navigate('/userLandingPage', { state: { selectedBox: 'examsTests' } });
  }

  const handleWebinarPage = () =>{
    navigate('/userLandingPage', { state: { selectedBox: 'webinars', activeTab: 'all' }})
  }

  const handleNotificationsPage = () => {
    navigate('/userNotification', { state: { selectedBox: 'dashboard', selectedSubBox: '' } });
  };

  const handleSummaryCardClick = (cardTitle) => {
    if (cardTitle === "Study Time Today") {
      navigate('/userLandingPage', { state: { selectedBox: 'classes' } });
      return;
    }

    if (cardTitle === "Courses Accessed") {
      handleGoTOUserCourses();
      return;
    }

    if (cardTitle === "Completion Rate") {
      navigate('/userLandingPage', { state: { selectedBox: 'resultsPerformance' } });
      return;
    }

    navigate('/userLandingPage', { state: { selectedBox: 'adaptiveLearning' } });
  };

  const handleTaskNavigation = (task) => {
    if (task.scheduleType === 'WEBINAR') {
      navigate('/userLandingPage', { state: { selectedBox: 'webinars', activeTab: 'Registered' } });
      return;
    }

    if (task.scheduleType === 'LIVE TEST') {
      navigate('/userLandingPage', { state: { selectedBox: 'examsTests' } });
      return;
    }

    navigate('/userLandingPage', { state: { selectedBox: 'dashboard' } });
  };

  const allCourses = [...(classroomMaterials || []), ...(certificationCourses || [])];
  const activeCourses = allCourses.filter((course) => Number(course?.progressPercentage || 0) < 100);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;
  const todaySchedules = monthlySchedules[todayKey] || [];
  const upcomingTasks = Object.entries(monthlySchedules)
    .flatMap(([date, schedules]) =>
      (schedules || []).map((schedule) => ({
        ...schedule,
        scheduleDate: date,
      }))
    )
    .filter((schedule) => new Date(`${schedule.scheduleDate}T00:00:00`) >= new Date(`${todayKey}T00:00:00`))
    .filter((schedule) => schedule.scheduleType !== 'HOLIDAY')
    .sort((first, second) => new Date(first.scheduleDate) - new Date(second.scheduleDate))
    .slice(0, 5);

  const aiSuggestions = [];
  const continueCourse = [...activeCourses].sort(
    (first, second) => Number(second?.progressPercentage || 0) - Number(first?.progressPercentage || 0)
  )[0];
  const reviseCourse = [...activeCourses].sort(
    (first, second) => Number(first?.progressPercentage || 0) - Number(second?.progressPercentage || 0)
  )[0];
  const liveTestTask = upcomingTasks.find((task) => task.scheduleType === 'LIVE TEST');

  if (continueCourse) {
    aiSuggestions.push({
      title: `Continue ${continueCourse.materialName}`,
      description: `You are already ${continueCourse.progressPercentage || 0}% through this course. A short session today keeps your momentum strong.`,
      action: "Resume course",
      icon: <PlayCircleRoundedIcon />,
      onClick: handleGoTOUserCourses,
    });
  }

  if (reviseCourse) {
    aiSuggestions.push({
      title: `Revise ${reviseCourse.materialName}`,
      description: `This is your lowest-progress active course right now. A focused revision pass can improve confidence quickly.`,
      action: "Review topics",
      icon: <MenuBookRoundedIcon />,
      onClick: handleGoTOUserCourses,
    });
  }

  if (liveTestTask) {
    aiSuggestions.push({
      title: `Attempt ${liveTestTask.testName || "your next live test"}`,
      description: `A scheduled assessment is coming up on ${new Date(
        `${liveTestTask.scheduleDate}T00:00:00`
      ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}.`,
      action: "Open tests",
      icon: <QuizRoundedIcon />,
      onClick: handleLivetestPage,
    });
  }

  if (!aiSuggestions.length) {
    aiSuggestions.push({
      title: "Explore a fresh learning path",
      description: "Your dashboard is clear right now. Try a new classroom or skill program to keep your streak growing.",
      action: "Browse courses",
      icon: <AutoAwesomeRoundedIcon />,
      onClick: handleGoTOUserCourses,
    });
  }

  const liveStudyTimeMinutes = Number(dashboardSummary?.studyTimeMinutes || 0);
  const liveStudyTimeLabel = dashboardSummary?.studyTime || "0 mins";
  const liveCoursesAccessed = Number(dashboardSummary?.coursesAccessed || 0);
  const liveCompletionRate = Number(dashboardSummary?.completionRate || 0);
  const liveLearningStreak = Number(dashboardSummary?.streak || 0);
  const liveLearningStreakLabel = dashboardSummary?.streakLabel || "0 days";
  const weeklyProgress = Array.isArray(dashboardSummary?.weeklyProgress) && dashboardSummary.weeklyProgress.length
    ? dashboardSummary.weeklyProgress
    : Array.from({ length: 7 }, (_, index) => {
        const currentDate = new Date();
        currentDate.setDate(today.getDate() - (6 - index));
        return {
          label: currentDate.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2),
          value: 8,
          active: index === 6,
        };
      });

  const summaryCards = [
    {
      title: "Study Time Today",
      value: summaryLoading ? "Loading..." : liveStudyTimeLabel,
      detail: todaySchedules.length ? `${todaySchedules.length} planned sessions` : "Build a steady rhythm today",
      icon: <AccessTimeFilledRoundedIcon />,
      accent: "teal",
      progress: Math.min(100, Math.round((liveStudyTimeMinutes / 240) * 100)),
    },
    {
      title: "Courses Accessed",
      value: summaryLoading ? "Loading..." : `${liveCoursesAccessed}`,
      detail: `${allCourses.length} active learning paths`,
      icon: <MenuBookRoundedIcon />,
      accent: "blue",
      progress: allCourses.length ? Math.round((liveCoursesAccessed / allCourses.length) * 100) : 0,
    },
    {
      title: "Completion Rate",
      value: summaryLoading ? "Loading..." : `${liveCompletionRate}%`,
      detail: "Average progress across your dashboard",
      icon: <TrendingUpRoundedIcon />,
      accent: "orange",
      progress: liveCompletionRate,
    },
    {
      title: "Learning Streak",
      value: summaryLoading ? "Loading..." : liveLearningStreakLabel,
      detail: "Consistency is building your momentum",
      icon: <LocalFireDepartmentRoundedIcon />,
      accent: "gold",
      progress: Math.min(100, liveLearningStreak * 8),
    },
  ];

  const learnerProfile =
    getFromLocalStorageSafe("studentDetails") ||
    getFromLocalStorageSafe("UserLoginResponse") ||
    getFromLocalStorageSafe("user");
  const learnerName =
    learnerProfile?.firstName ||
    learnerProfile?.fullName ||
    learnerProfile?.name ||
    learnerProfile?.username ||
    (userEmail ? userEmail.split("@")[0] : "Learner");
  const branchDisplayLabel =
    learnerProfile?.batchName ||
    learnerProfile?.branchName ||
    learnerProfile?.organizationsDB?.orgName ||
    learnerProfile?.organizationsDB?.organizationName ||
    (studentBatchId ? `Batch ${studentBatchId}` : "General");
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";
  const nextTask = upcomingTasks[0] || todaySchedules.find((schedule) => schedule.scheduleType !== "HOLIDAY") || null;
  const nextTaskDate = nextTask?.scheduleDate
    ? new Date(`${nextTask.scheduleDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : "No upcoming deadlines";

  const heroHighlights = [
    {
      label: "Active courses",
      value: allCourses.length,
    },
    {
      label: "Today",
      value: todaySchedules.length ? `${todaySchedules.length} sessions` : "Free day",
    },
    {
      label: "Notifications",
      value: announcements.length ? `${announcements.length} new` : "All clear",
    },
  ];

  const quickActions = [
    {
      title: continueCourse ? "Continue learning" : "Browse courses",
      description: continueCourse
        ? `${continueCourse.materialName} is ${continueCourse.progressPercentage || 0}% complete.`
        : "Pick a course and restart your study flow.",
      icon: <PlayCircleRoundedIcon />,
      action: "Open courses",
      onClick: handleGoTOUserCourses,
    },
    {
      title: liveTestTask ? "Prepare for the next test" : "Check your class rhythm",
      description: liveTestTask
        ? `${liveTestTask.testName || "Live test"} is scheduled for ${new Date(
            `${liveTestTask.scheduleDate}T00:00:00`
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}.`
        : "Review upcoming sessions and stay ahead of deadlines.",
      icon: <QuizRoundedIcon />,
      action: liveTestTask ? "Open tests" : "View classes",
      onClick: liveTestTask ? handleLivetestPage : () => navigate('/userLandingPage', { state: { selectedBox: 'classes' } }),
    },
    {
      title: announcements.length ? "Catch important updates" : "Stay in the loop",
      description: announcements.length
        ? `${announcements[0]?.announcementTitle || "A new announcement"} is waiting for your attention.`
        : "Your inbox is quiet right now. Check webinars or explore a new learning path.",
      icon: <CampaignRoundedIcon />,
      action: announcements.length ? "Open notices" : "View webinars",
      onClick: announcements.length ? handleNotificationsPage : handleWebinarPage,
    },
  ];

  const scheduleTypeLabelMap = {
    HOLIDAY: "Holiday",
    WEBINAR: "Webinar",
    "LIVE TEST": "Live test",
  };
  const selectedDateAnnouncements = getAnnouncementsForDate(selectedDate);
  const monthlyHolidayHighlights = useMemo(() => {
    const holidayMap = new Map();

    Object.entries(monthlySchedules || {}).forEach(([dateKey, schedules]) => {
      (schedules || [])
        .filter((schedule) => schedule?.scheduleType === "HOLIDAY")
        .forEach((schedule, index) => {
          const uniqueKey = `${schedule.holidayId || `${dateKey}-${schedule.holidayName || index}`}`;
          if (!holidayMap.has(uniqueKey)) {
            holidayMap.set(uniqueKey, {
              ...schedule,
              scheduleDate: dateKey,
            });
          }
        });
    });

    return Array.from(holidayMap.values()).sort(
      (first, second) => new Date(`${first.scheduleDate}T00:00:00`) - new Date(`${second.scheduleDate}T00:00:00`)
    );
  }, [monthlySchedules]);

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const dateSchedules = monthlySchedules[formattedDate] || [];
    const hasHoliday = dateSchedules.some((schedule) => schedule.scheduleType === "HOLIDAY");
    const hasAnnouncement = getAnnouncementsForDate(date).length > 0;
    const hasClassEvent = dateSchedules.some(
      (schedule) => schedule.scheduleType === "WEBINAR" || schedule.scheduleType === "LIVE TEST"
    );

    if (hasHoliday) {
      return "dashboardCalendarTile dashboardCalendarTile--holiday";
    }

    if (hasAnnouncement) {
      return "dashboardCalendarTile dashboardCalendarTile--announcement";
    }

    if (hasClassEvent) {
      return "dashboardCalendarTile dashboardCalendarTile--class";
    }

    return "dashboardCalendarTile";
  };

  const renderProgramSection = (title, count, courses, emptyMessage, sectionKey = "default") => (
    <section className={`dashboardProgramsSection dashboardProgramsSection--${sectionKey}`}>
      <div className="dashboardProgramsHeader">
        <div>
          <div className="dashboardCollectionEyebrow">{sectionKey === "classroom" ? "Structured learning" : "Skill building"}</div>
          <div className="userHeaderTxt dashboardProgramsTitle">{title}</div>
        </div>
        <div className="dashboardProgramsMeta">
          <span className="dashboardProgramsCount">{count}</span>
          <button type="button" className="dashboardTextLink" onClick={handleGoTOUserCourses}>
            View all
          </button>
        </div>
      </div>

      <div className={`userCourseArea dashboardProgramsGrid dashboardProgramsGrid--${sectionKey}`}>
        {loading ? (
          <div className="UserDashboardloadingContainer">
            <BeatLoader color={"#219EBC"} loading={loading} size={15} />
          </div>
        ) : courses.length > 0 ? (
          courses.slice(0, 4).map((course, index) => (
            <article
              key={`${course?.materialId || course?.materialName || "course"}-${index}`}
              className={`userCourseBox dashboardCourseCard dashboardCourseCard--${sectionKey}`}
              onClick={handleGoTOUserCourses}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleGoTOUserCourses();
                }
              }}
            >
              <div className={`userCourseBoxPicture dashboardCourseCardMedia dashboardCourseCardMedia--${sectionKey}`}>
                <img src={CourseBoxPicture} alt={course?.materialName || "Course"} />
                <span className="dashboardCourseChip">
                  {sectionKey === "classroom" ? "Classroom" : "Skill"}
                </span>
              </div>
              <div className={`userCourseBoxTxtSection dashboardCourseCardBody dashboardCourseCardBody--${sectionKey}`}>
                <div className={`userCourseBoxTxtContainer dashboardCourseCardContent dashboardCourseCardContent--${sectionKey}`}>
                  <div className={`userCourseBoxHeader dashboardCourseCardTitle dashboardCourseCardTitle--${sectionKey}`}>
                    {course?.materialName}
                  </div>
                  <div className={`userCourseBoxSubHeader dashboardCourseCardSubtitle dashboardCourseCardSubtitle--${sectionKey}`}>
                    By {course?.tutorName || "Unknown Tutor"}
                  </div>
                  <div className={`progressContainer dashboardCourseCardProgress dashboardCourseCardProgress--${sectionKey}`}>
                    <div className="progressBar">
                      <div className="progress" style={{ width: getProgressPercentage(`${course?.progressPercentage}%`) }}></div>
                    </div>
                    <div className="progressText">{course?.progressPercentage}% complete</div>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="userDashboardClassroomDiv dashboardProgramsEmptyState">
            <div>
              <img src={EmptyImage} alt="Empty state" />
            </div>
            <div>{emptyMessage}</div>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="studentDashboardLayout">
      {loading && <LinearProgress />} {/* Display loading indicator */}
      <div className="studentDashboardMain">
        <section className="dashboardHero">
          <div className="dashboardHeroContent">
            <div className="dashboardEyebrow dashboardEyebrow--dark">Student dashboard</div>
            <h1>
              {greeting}, {learnerName}
            </h1>
            <p>
              A simpler view of your learning day, with your next steps, progress, and important updates in one place.
            </p>

            <div className="dashboardHeroMeta">
              {heroHighlights.map((item) => (
                <div key={item.label} className="dashboardHeroMetaCard">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="dashboardHeroActions">
              <button type="button" className="dashboardPrimaryButton" onClick={quickActions[0].onClick}>
                {quickActions[0].action}
                <ArrowOutwardRoundedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className="dashboardSecondaryButton"
                onClick={nextTask ? () => handleTaskNavigation(nextTask) : handleGoTOUserCourses}
              >
                {nextTask ? "Open next task" : "View my learning"}
              </button>
            </div>
          </div>

          <div className="dashboardHeroPanel">
            <div className="dashboardHeroPanelHeader">
              <span className="dashboardPanelLabel">Next milestone</span>
              <strong>{nextTask ? nextTask.testName || nextTask.webinarName || nextTask.scheduleType : "Nothing urgent queued"}</strong>
              <p>
                {nextTask
                  ? `${scheduleTypeLabelMap[nextTask.scheduleType] || nextTask.scheduleType} scheduled for ${nextTaskDate}.`
                  : "You are clear for now. Use this window to continue an active course or review your weakest topic."}
              </p>
            </div>

            <div className="dashboardHeroPanelStats">
              <div className="dashboardHeroPanelStat">
                <span>Streak</span>
                <strong>{summaryLoading ? "..." : liveLearningStreakLabel}</strong>
              </div>
              <div className="dashboardHeroPanelStat">
                <span>Completion</span>
                <strong>{summaryLoading ? "..." : `${liveCompletionRate}%`}</strong>
              </div>
              <div className="dashboardHeroPanelStat dashboardHeroPanelStat--branch">
                <span>Branch</span>
                <strong title={branchDisplayLabel}>{branchDisplayLabel}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboardSectionShell dashboardSummaryShell">
          <div className="dashboardSectionHeading">
            <div>
              <div className="dashboardEyebrow">Daily learning summary</div>
              <h2>Your momentum snapshot</h2>
              <p>Personalized from your active courses, branch schedules, and current progress.</p>
            </div>
            <div className="dashboardBranchBadge" title={branchDisplayLabel}>Branch linked: {branchDisplayLabel}</div>
          </div>
          <div className="dashboardSummaryGrid">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className={`dashboardSummaryCard ${card.accent}`}
                onClick={() => handleSummaryCardClick(card.title)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSummaryCardClick(card.title);
                  }
                }}
              >
                <div className="dashboardSummaryIcon">{card.icon}</div>
                <div className="dashboardSummaryBody">
                  <span>{card.title}</span>
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                </div>
                <div className="dashboardMiniProgress">
                  <div style={{ width: `${card.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboardMainGrid">
          <div className="dashboardMainColumn">
            <section className="dashboardSectionShell dashboardActionsShell">
              <div className="dashboardSectionHeading">
                <div>
                  <div className="dashboardEyebrow">What to do next</div>
                  <h2>Focused actions</h2>
                  <p>Shortcuts for the most important things on your dashboard.</p>
                </div>
              </div>

              <div className="dashboardActionGrid">
                {quickActions.map((item, index) => (
                  <article
                    key={item.title}
                    className={`dashboardActionCard ${index === 0 ? "featured" : ""}`}
                    onClick={item.onClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        item.onClick();
                      }
                    }}
                  >
                    <div className="dashboardActionIcon">{item.icon}</div>
                    <div className="dashboardActionContent">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <button type="button" className="dashboardGhostAction">
                      {item.action}
                      <ArrowOutwardRoundedIcon fontSize="small" />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboardSectionShell dashboardInsightsShell">
              <div className="dashboardSectionHeading">
                <div>
                  <div className="dashboardEyebrow">Momentum & guidance</div>
                  <h2>Study rhythm and AI suggestions</h2>
                  <p>See how your week is moving and where to focus next.</p>
                </div>
                <div className="dashboardChartChip">
                  <InsightsRoundedIcon fontSize="small" />
                  {summaryLoading ? "Loading..." : `${liveCompletionRate}% avg`}
                </div>
              </div>

              <div className="dashboardInsightsGrid">
                <div className="dashboardInsightsSuggestions">
                  <div className="dashboardSectionHeading compact dashboardSubSectionHeading">
                    <div>
                      <div className="dashboardEyebrow">AI guidance</div>
                      <h2>Recommended for today</h2>
                    </div>
                  </div>
                  <div className="dashboardAiGrid dashboardAiGrid--compact">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <article
                        key={suggestion.title}
                        className={`dashboardAiCard ${index === 0 ? "featured" : ""}`}
                        onClick={suggestion.onClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            suggestion.onClick();
                          }
                        }}
                      >
                        <div className="dashboardAiTopRow">
                          <div className="dashboardAiIcon">{suggestion.icon}</div>
                          <span className="dashboardAiTag">
                            <AutoAwesomeRoundedIcon fontSize="inherit" />
                            AI Pick
                          </span>
                        </div>
                        <div className="dashboardAiContent">
                          <h3>{suggestion.title}</h3>
                          <p>{suggestion.description}</p>
                        </div>
                        <button type="button" className="dashboardGhostAction">
                          {suggestion.action}
                          <ArrowOutwardRoundedIcon fontSize="small" />
                        </button>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="dashboardInsightsRhythm">
                  <div className="dashboardSectionHeading compact dashboardSubSectionHeading">
                    <div>
                      <div className="dashboardEyebrow">Weekly progress</div>
                      <h2>Study rhythm</h2>
                    </div>
                  </div>
                  <div className="dashboardWeeklyChart dashboardWeeklyChart--compact">
                    {weeklyProgress.map((item) => (
                      <div key={item.label} className={`dashboardWeeklyBar ${item.active ? "active" : ""}`}>
                        <span className="dashboardWeeklyValue">{item.value}%</span>
                        <div className="dashboardWeeklyTrackWrap">
                          <div className="dashboardWeeklyTrack">
                            <div style={{ height: `${item.value}%` }} />
                          </div>
                        </div>
                        <strong className="dashboardWeeklyLabel">{item.label}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {renderProgramSection(
              "My Classroom Programs",
              classroomMaterials?.length,
              filteredClassroomMaterials,
              "No classroom programs in progress",
              "classroom"
            )}

            {renderProgramSection(
              "My Skill Programs",
              certificationCourses?.length,
              filteredCertificationCourses,
              "No skill programs found",
              "skill"
            )}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="studentDashboardRail">
          <div className="dashboardSidePanel dashboardCalendarPanel">
            <div className="dashboardPanelHeader">
              <div>
                <div className="dashboardEyebrow">Schedule</div>
                <h2>Calendar</h2>
              </div>
              <div className="dashboardPanelBadge">{selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
            </div>

          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileContent={renderTileContent}
            tileClassName={getTileClassName}
            className="custom-calendar"
            onActiveStartDateChange={({ activeStartDate }) => {
              fetchMonthlyEvents(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1);
            }}
          />
          <div className="dashboardHolidayHighlights">
            <div className="dashboardMiniSectionHeader">
              <span className="dashboardMiniSectionTitle">Holidays & festivals</span>
              <span className="dashboardMiniSectionMeta">{monthlyHolidayHighlights.length}</span>
            </div>
            {monthlyHolidayHighlights.length > 0 ? (
              <div className="dashboardHolidayList">
                {monthlyHolidayHighlights.slice(0, 6).map((holiday, index) => (
                  <div
                    key={`${holiday.holidayId || holiday.scheduleDate}-${index}`}
                    className="dashboardHolidayListItem"
                  >
                    <div className="dashboardHolidayDate">
                      {new Date(`${holiday.scheduleDate}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="dashboardHolidayContent">
                      <strong>{holiday.holidayName || "Holiday"}</strong>
                      <span>{holiday.holidayType || "Festival / holiday"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboardMiniEmpty">No holidays or festivals this month.</div>
            )}
          </div>
          {isLoading ? (
            <div className="PulseLoaderContainer">
              <PulseLoader color={"#219EBC"} size={15} />
            </div>
          ) : (
            <div className="FetchedSchedulesContainer">
              <div className="currentDateDiv">{selectedDate.toDateString()}</div>
              {getSchedulesForSelectedDate().length > 0 || selectedDateAnnouncements.length > 0 ? (
                <>
                  {getSchedulesForSelectedDate().map((schedule, index) => (
                    <div
                      key={`${schedule.scheduleType}-${index}`}
                      className={`scheduleItem ${
                        schedule.scheduleType === "HOLIDAY"
                          ? "scheduleItem--holiday"
                          : schedule.scheduleType === "WEBINAR"
                          ? "scheduleItem--webinar"
                          : "scheduleItem--test"
                      }`}
                    >
                      {schedule.scheduleType === 'HOLIDAY' && (
                        <div className="calanderMainSection">
                          <div className="calendarSubSection">
                            <span className="holidayScheduleType">
                              {schedule?.holidayType ? `Festival / ${schedule.holidayType}` : "Holiday / Festival"}
                            </span>
                          </div>
                          <div className="holidayName">{schedule.holidayName}</div>
                          <div className="dateField">
                            {schedule?.holidayFromDate && schedule?.holidayToDate
                              ? `${new Date(schedule.holidayFromDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })} - ${new Date(schedule.holidayToDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}`
                              : "Holiday notice"}
                          </div>
                        </div>
                      )}
                      {schedule.scheduleType === 'WEBINAR' && (
                        <div
                          className="calanderMainSection scheduleInteractiveCard"
                          onClick={handleWebinarPage}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleWebinarPage();
                            }
                          }}
                        >
                          <div className="calendarSubSection">
                            <span className="webinarScheduleType">{scheduleTypeLabelMap[schedule.scheduleType]}</span>
                            <span className="dateField">{formatTimeRange(schedule.webinarStartDate, schedule.webinarEndDate)}</span>
                          </div>
                          <div className="webinarName">{schedule.webinarName}</div>
                          <div className="scheduleMetaRow">
                            {schedule.webinarSubject && <span className="webinarSubject">{schedule.webinarSubject}</span>}
                            {schedule.webinarSubject && schedule.webinarSpeaker && <span className="webinarSubject">|</span>}
                            <span className="webinarSpeakers">{schedule.webinarSpeaker || '-'}</span>
                          </div>
                        </div>
                      )}
                      {schedule.scheduleType === 'LIVE TEST' && (
                        <div
                          className="calanderMainSection scheduleInteractiveCard"
                          onClick={handleLivetestPage}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleLivetestPage();
                            }
                          }}
                        >
                          <div className="calendarSubSection">
                            <span className="testScheduleType">{scheduleTypeLabelMap[schedule.scheduleType]}</span>
                            <span className="dateField">{formatTimeRange(schedule.testStartDate, schedule.testEndDate)}</span>
                          </div>
                          <div className="webinarName">{schedule.testName}</div>
                          <div className="scheduleMetaRow">
                            <span className="webinarSubject">{schedule.tutorName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedDateAnnouncements.map((announcement, index) => (
                    <div
                      key={`${announcement.announcementId || announcement.creationTimeStamp}-${index}`}
                      className="scheduleItem scheduleItem--announcement"
                    >
                      <div className="calanderMainSection">
                        <div className="calendarSubSection">
                          <span className="announcementScheduleType">Teacher note</span>
                          <span className="dateField">
                            {new Date(announcement.creationTimeStamp).toLocaleTimeString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="webinarName">{announcement.announcementTitle}</div>
                        <div className="dashboardAnnouncementText">
                          {announcement.announcementMessage || "No message provided."}
                        </div>
                        <div className="scheduleMetaRow">
                          <span className="webinarSubject">
                            By {announcement.announcementByName || "Teacher"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="userDashboardClassroomDiv dashboardScheduleEmptyState">
                  <div>
                    <img src={NoSchedule} alt="Empty schedule" />
                  </div>
                  <div>No holidays, festivals, schedules, or teacher announcements for {selectedDate.toDateString()}</div>
                </div>
              )}
            </div>
          )}
          </div>

          <div className="dashboardSidePanel">
            <div className="dashboardSectionHeading compact">
              <div>
                <div className="dashboardEyebrow">Tasks & priorities</div>
                <h2>Pending work</h2>
              </div>
            </div>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => {
                const taskDate = new Date(`${task.scheduleDate}T00:00:00`);
                const dayDifference = Math.ceil((taskDate - new Date(`${todayKey}T00:00:00`)) / 86400000);
                const isUrgent = dayDifference <= 1;
                const isCompletedStyle = task.scheduleType === "WEBINAR";

                return (
                  <div
                    key={`${task.scheduleDate}-${index}`}
                    className={`dashboardTaskCard ${isUrgent ? "urgent" : ""}`}
                    onClick={() => handleTaskNavigation(task)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleTaskNavigation(task);
                      }
                    }}
                  >
                    <div className={`dashboardTaskIndicator ${isCompletedStyle ? "teal" : "orange"}`}>
                      {isUrgent ? <PriorityHighRoundedIcon fontSize="small" /> : <AssignmentRoundedIcon fontSize="small" />}
                    </div>
                    <div className="dashboardTaskBody">
                      <strong>{task.testName || task.webinarName || task.scheduleType}</strong>
                      <span>
                        {task.scheduleType} • {taskDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className={`dashboardTaskPriority ${isUrgent ? "urgent" : "normal"}`}>
                      {isUrgent ? "Due soon" : "Upcoming"}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dashboardEmptyState">
                <CheckCircleRoundedIcon />
                <p>No pending tasks right now.</p>
              </div>
            )}
          </div>

          <div className="AnnouncementsContainer dashboardSidePanel">
            <div className="dashboardSectionHeading compact">
              <div>
                <div className="dashboardEyebrow">Notifications</div>
                <h2>Recent announcements</h2>
              </div>
              <CampaignRoundedIcon className="dashboardSectionIcon" />
            </div>
            {announcements.length > 0 ? (
              announcements.slice(0, 5).map((announcement, index) => (
                <div
                  key={index}
                  className="dashboardAnnouncementCard"
                  onClick={handleNotificationsPage}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleNotificationsPage();
                    }
                  }}
                >
                  <div className="dashboardAnnouncementDate">
                    {new Date(announcement.creationTimeStamp).toLocaleDateString()}
                  </div>
                  <div className="dashboardAnnouncementTitle">
                    {announcement.announcementTitle}
                  </div>
                  <div className="dashboardAnnouncementText">
                    {announcement.announcementMessage?.length > 100 
                      ? `${announcement.announcementMessage.substring(0, 100)}...` 
                      : announcement.announcementMessage}
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboardEmptyMessage">
                No active announcements
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
