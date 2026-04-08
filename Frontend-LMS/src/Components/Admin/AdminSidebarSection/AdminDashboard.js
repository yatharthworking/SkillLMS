import React, { useState, useEffect } from "react";
import StudentCard from "../../../Assets/Images/StudentCard.svg";
import TeacherCard from "../../../Assets/Images/TeacherCard.svg";
import AdminCard from "../../../Assets/Images/AdminCard.svg";
import UpcomingCard from "../../../Assets/Images/UpcomingCard.svg";
import InprogressCard from "../../../Assets/Images/InprogressCard.svg";
import CompletedCard from "../../../Assets/Images/CompletedCard.svg";
import ResolvedCard from "../../../Assets/Images/ResolvedCard.svg";
import UnresolvedCard from "../../../Assets/Images/UnresolvedCard.svg";
import ClassroomCard from "../../../Assets/Images/ClassroomCard.svg";
import SkillCard from "../../../Assets/Images/SkillCard.svg";
import NavigateRight from "../../../Assets/Images/navigateRight.svg";
import {
  BACKEND_BASEURL,
  getFromLocalStorageSafe,
} from "../../helper.js";
import "../AdminSidebarSection/AdminDashboard.css";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import Download from "../../../Assets/Images/download.svg";
import Calendar from "react-calendar";

export default function AdminDashboard() {
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const navigate = useNavigate();
  const [value, setValue] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [branchMasterList, setBranchMasterList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [organizationMasterName, setOrganizationMasterName] = useState("");
  const [adminDetail, setAdminDetail] = useState(() => {
    try {
      const storedAdminDetails = localStorage.getItem("adminDetails");
      return storedAdminDetails ? JSON.parse(storedAdminDetails) : null;
    } catch (error) {
      console.error("Error parsing admin details:", error);
      return null;
    }
  });

  const [monthlySchedules, setMonthlySchedules] = useState({});
  const [announcements, setAnnouncements] = useState([]);




  const handleDateClick = (date) => {
    const formattedDate = date.toLocaleDateString('en-CA');
    setSelectedDate(formattedDate);
  };

  const renderTileContent = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toLocaleDateString('en-CA');
      if (monthlySchedules[formattedDate] && monthlySchedules[formattedDate].length > 0) {
        return (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "2px" }}>
            <div style={{
              height: "6px", width: "6px", backgroundColor: "#FFB703", borderRadius: "50%"
            }}></div>
          </div>
        );
      }
    }
    return null;
  };

  const getSchedulesForSelectedDate = () => {
    if (!selectedDate || !monthlySchedules[selectedDate]) return [];
    return monthlySchedules[selectedDate];
  };

  const handleDownload = () => {
    // Handle download logic
    alert("Download clicked");
  };

  const token = localStorage.getItem("token");
  const adminLoginResponse = localStorage.getItem("AdminLoginResponse");
  const adminLoginUser = adminLoginResponse ? JSON.parse(adminLoginResponse) : null;
  const userRole = adminDetail?.roles?.[0]?.role?.roleMasterName || adminLoginUser?.roles?.[0] || "";
  const userDetailsId = adminDetail?.userDetailsId;
  const baseBranchId = adminDetail?.organizationsDB?.orgId;
  const effectiveBranchId = userRole === "SUPER_ADMIN" ? selectedBranchId : baseBranchId;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};


  //TOTAL USERS API DETAILS

  const [totalUsers, setTotalUsers] = useState({
    total: 0,
    students: 0,
    teachers: 0,
    admins: 0,
  });


   //TOTAL COURSES API DETAILS
  const [totalCourses, setTotalCourses] = useState({
    total: 0,
    skillPrograms: 0,
    classroomPrograms: 0,
  });


   //TOTAL BATCHES API DETAILS

  const [totalBatches, setTotalBatches] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    upcoming: 0,
  });


   //TOTAL CONCERNS API DETAILS

  const [totalConcerns, setTotalConcerns] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
  });

  // Effect to handle profile updates and login success events
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const storedAdminDetails = localStorage.getItem("adminDetails");
        if (storedAdminDetails) {
          const parsedDetails = JSON.parse(storedAdminDetails);
          setAdminDetail(parsedDetails);
        }
      } catch (error) {
        console.error("Error updating admin details from event:", error);
      }
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);
    window.addEventListener('loginSuccess', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
      window.removeEventListener('loginSuccess', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const email = adminDetail?.email || adminLoginUser?.username;

    if (!email || (adminDetail?.email && adminDetail?.organizationsDB)) {
      return;
    }

    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`,
          {
            headers: authHeaders,
          }
        );

        if (response.status === 200) {
          setAdminDetail(response.data);
          localStorage.setItem("adminDetails", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
      }
    };

    fetchAdminDetails();
  }, [adminDetail?.email, adminLoginUser?.username, BACKEND_BASEURL, token]);

  useEffect(() => {
    if (userRole !== "SUPER_ADMIN" && baseBranchId) {
      setSelectedBranchId(String(baseBranchId));
    }
  }, [userRole, baseBranchId]);

  useEffect(() => {
    if (!token || !userDetailsId) {
      return;
    }

    const branchQuery = effectiveBranchId ? `?branchId=${effectiveBranchId}` : "";

    const resetDashboardCounters = () => {
      setTotalUsers({ total: 0, students: 0, teachers: 0, admins: 0 });
      setTotalCourses({ total: 0, skillPrograms: 0, classroomPrograms: 0 });
      setTotalBatches({ total: 0, ongoing: 0, completed: 0, upcoming: 0 });
      setTotalConcerns({ total: 0, resolved: 0, unresolved: 0 });
    };

    const fetchBranchMaster = async () => {
      if (!organizationId || !userDetailsId) return;
      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${userDetailsId}`,
          {
            headers: authHeaders,
          }
        );
        const data = response.data?.data || [];

        if (data.length > 0) {
          setOrganizationMasterName(data[0]?.organizationMasterName || "");
          setBranchMasterList(data);
        } else {
          setBranchMasterList([]);
          setOrganizationMasterName("");
        }
      } catch (error) {
        console.error("Error fetching branch master list:", error);
        setBranchMasterList([]);
      }
    };

    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/dashboard/totalUsers${branchQuery}`, {
          headers: authHeaders,
        });
        const data = response.data;
        setTotalUsers({
          total: data.totalUsers || 0,
          students: data.totalStudents || 0,
          teachers: data.totalTeachers || 0,
          admins: data.totalAdmins || 0,
        });
      } catch (error) {
        setTotalUsers({ total: 0, students: 0, teachers: 0, admins: 0 });
        console.error("Error fetching total users:", error);
      }
    };
    
    const fetchTotalCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/dashboard/totalCourses${branchQuery}`, {
          headers: authHeaders,
        });
        const data = response.data;
        setTotalCourses({
          total: data.totalCourses || 0,
          skillPrograms: data.totalCourses || 0,
          classroomPrograms: 0,
        });
      } catch (error) {
        setTotalCourses({ total: 0, skillPrograms: 0, classroomPrograms: 0 });
        console.error("Error fetching total courses:", error);
      }
    };

    const fetchTotalBatches = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/dashboard/totalBatches${branchQuery}`, {
          headers: authHeaders,
        });
        const data = response.data;
        setTotalBatches({
          total: data.totalBatches || 0,
          ongoing: data.ongoingBatches || 0,
          completed: data.completedBatches || 0,
          upcoming: data.upcomingBatches || 0,
        });
      } catch (error) {
        setTotalBatches({ total: 0, ongoing: 0, completed: 0, upcoming: 0 });
        console.error("Error fetching total batches:", error);
      }
    };

    const fetchTotalConcerns = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/dashboard/totalConcerns${branchQuery}`, {
          headers: authHeaders,
        });
        const data = response.data;
        setTotalConcerns({
          total: data.totalConcerns || 0,
          resolved: data.resolvedConcerns || 0,
          unresolved: data.unResolvedConcerns || 0,
        });
      } catch (error) {
        setTotalConcerns({ total: 0, resolved: 0, unresolved: 0 });
        console.error("Error fetching total concerns:", error);
      }
    };

    const fetchMonthlyEvents = async (year, month, branchId) => {
      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/admin/getMonthlyAdminSchedules`,
          {
            headers: authHeaders,
            params: { year, month, branchId }
          }
        );
        if (response.status === 200) {
          setMonthlySchedules(response.data.schedules || {});
        }
      } catch (error) {
        console.error("Failed to fetch admin schedules:", error);
      }
    };

    const fetchAnnouncements = async (bid) => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllAnnouncements`, {
          headers: authHeaders,
          params: { branchId: bid }
        });
        if (response.status === 200) {
          const activeAnnouncements = (response.data.data || []).filter(a => a.isActive);
          activeAnnouncements.sort((a, b) => new Date(b.creationTimeStamp) - new Date(a.creationTimeStamp));
          setAnnouncements(activeAnnouncements);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    resetDashboardCounters();
    fetchBranchMaster();
    fetchTotalUsers();
    fetchTotalCourses();
    fetchTotalBatches();
    fetchTotalConcerns();
    if (effectiveBranchId) {
      const now = value;
      fetchMonthlyEvents(now.getFullYear(), now.getMonth() + 1, effectiveBranchId);
      fetchAnnouncements(effectiveBranchId);
    }
  }, [token, userDetailsId, organizationId, effectiveBranchId, value, adminDetail]);

  const handleBranchChange = (event) => {
    setSelectedBranchId(event.target.value);
  };

  const handleNavigateCourse = () => {
    navigate("/adminLandingPage", { state: { selectedBox: "course" } });
  };

  const handleNavigateUser = () => {
    navigate("/adminLandingPage", { state: { selectedBox:'masters', selectedSubBox: "usermaster" } });
  };

  const handleNavigateConcern = (status) => {
    navigate("/adminLandingPage", { state: { selectedBox: "helpsupport", initialStatus: status } });
  };

  const handleNavigateBatch = () => {
    navigate("/adminLandingPage", { state: {selectedBox:'masters', selectedSubBox: "batch" } });
  };


  return (
    <div className="adminDashboardContainer">
      <div className="dashboardDetailsView">
        <div className="dashboardDetailsViewTitle">Dashboard</div>

        {/*BRANCH DETAILS */}
        <div className="dashboardDetailsViewHeader">
          <div className="headerAdmin">
            {organizationMasterName}
          </div>

          <div className="branchSelectHeader">
            <div className="inputHeaderText" style={{ color: "#fff" }}>
              Branch :
            </div>

            <div>
              {userRole === "SUPER_ADMIN" ? (
                <select
                  className="selectHeaderBranch"
                  onChange={handleBranchChange}
                  value={selectedBranchId}
                >
                  <option value="">All</option>
                  {branchMasterList.map((branch) => (
                    <option key={branch.orgId} value={branch.orgId}>
                      {branch.orgName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="branchNameDisplay" style={{ color: "#fff", fontWeight: "600", fontSize: "1.1rem" }}>
                  {adminDetail?.organizationsDB?.orgName || adminDetail?.organizationsDB?.organizationName || "N/A"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/*CARD DETAILS */}
        <div className="cardDetailsSection">


            {/* USERS */}
          <div className="infoCard">
            <div className="cardTitle">Total Users</div>
            <div className="cardValue">{totalUsers.total}</div>

            <div className="cardSubItems">

                <div className="StudentcardSubItem">
                  <div className="StudentsubItemTitle">
                    <div><img src={StudentCard} alt=''/></div>
                    <div>Students</div>
                  </div>
                  <div className="subItemValue">{totalUsers.students}</div>
                </div>

                <div className="TeachercardSubItem">
                  <div className="TeachersubItemTitle">
                    <div><img src={TeacherCard} alt=''/></div>
                    <div>Teachers</div>
                  </div>
                  <div className="subItemValue">{totalUsers.teachers}</div>
                </div>

                <div className="AdmincardSubItem">
                <div className="AdminsubItemTitle">
                  <div><img src={AdminCard} alt=''/></div>
                  <div>Admins</div>
                </div>
                <div className="subItemValue">{totalUsers.admins}</div>
              </div>


            </div>
            <div className="navigateRight"><img src={NavigateRight} alt='' onClick={handleNavigateUser}/></div>
          </div>


            {/* BATCHES */}
          <div className="infoCard">
            <div className="cardTitle">Total Batches</div>
            <div className="cardValue">{totalBatches.total}</div>

            <div className="cardSubItems">

                <div className="UpcomingcardSubItem">
                  <div className="UpcomingsubItemTitle">
                    <div><img src={UpcomingCard} alt=''/></div>
                    <div>Upcoming</div>
                  </div>
                  <div className="subItemValue">{totalBatches.upcoming}</div>
                </div>

                <div className="InprogresscardSubItem">
                  <div className="InprogresssubItemTitle">
                    <div><img src={InprogressCard} alt=''/></div>
                    <div>Inprogress</div>
                  </div>
                  <div className="subItemValue">{totalBatches.ongoing}</div>
                </div>

                <div className="CompletedcardSubItem">
                <div className="CompletedsubItemTitle">
                  <div><img src={CompletedCard} alt=''/></div>
                  <div>Completed</div>
                </div>
                <div className="subItemValue">{totalBatches.completed}</div>
              </div>


            </div>
            <div className="navigateRight"><img src={NavigateRight} alt='' onClick={handleNavigateBatch}/></div>
          </div>
          

          {/* COURSES */}
          <div className="infoCard">
            <div className="cardTitle">Total Courses</div>
            <div className="cardValue">{totalCourses.total}</div>

            <div className="cardSubItems">

                <div className="ClassroomcardSubItem">
                  <div className="ClassroomsubItemTitle">
                    <div><img src={ClassroomCard} alt=''/></div>
                    <div>Classroom Program</div>
                  </div>
                  <div className="subItemValue">{totalCourses.classroomPrograms}</div>
                </div>

                <div className="SkillcardSubItem">
                  <div className="SkillsubItemTitle">
                    <div><img src={SkillCard} alt=''/></div>
                    <div>Skill Program</div>
                  </div>
                  <div className="subItemValue">{totalCourses.skillPrograms}</div>
                </div>
            </div>
            <div className="navigateRight"><img src={NavigateRight} alt=''  onClick={handleNavigateCourse}/></div>
          </div>

          {/* ISSUES AND CONCERN */}
          <div className="infoCard">
            <div className="cardTitle">Student Issues & concerns </div>
            <div className="cardValue">{totalConcerns.total}</div>

            <div className="cardSubItems">

                <div className="ResolvedcardSubItem" onClick={() => handleNavigateConcern('resolved')} style={{ cursor: 'pointer' }}>
                  <div className="ResolvedsubItemTitle">
                    <div><img src={ResolvedCard} alt=''/></div>
                    <div>Resolved</div>
                  </div>
                  <div className="subItemValue">{totalConcerns.resolved}</div>
                </div>

                <div className="UnresolvedcardSubItem" onClick={() => handleNavigateConcern('unresolved')} style={{ cursor: 'pointer' }}>
                  <div className="UnresolvedsubItemTitle">
                    <div><img src={UnresolvedCard} alt=''/></div>
                    <div>Unresolved</div>
                  </div>
                  <div className="subItemValue">{totalConcerns.unresolved}</div>
                </div>

                


            </div>
            <div className="navigateRight"><img src={NavigateRight} alt=''  onClick={() => handleNavigateConcern('unresolved')}/></div>
          </div>
        </div>
      </div>

      {/*CALENDAR VIEW */}

      <div
        className="CalendarEventSection"
        style={{ margin: "16px", height: "80vh", overflowY: "auto" }}
      >
        <div className="calendarDiv">
          <div className="upcomingClassHeading">Schedule</div>
          <img
            src={Download}
            alt="download"
            onClick={handleDownload}
            className="downloadImg"
          />
        </div>
        <Calendar
          onChange={setValue}
          value={value}
          onClickDay={handleDateClick}
          tileContent={renderTileContent}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (effectiveBranchId) {
              // Re-fetch using the standalone logic
              axios.get(`${BACKEND_BASEURL}/admin/getMonthlyAdminSchedules`, {
                headers: authHeaders,
                params: { year: activeStartDate.getFullYear(), month: activeStartDate.getMonth() + 1, branchId: effectiveBranchId }
              }).then(res => setMonthlySchedules(res.data.schedules || {}))
                .catch(err => console.error(err));
            }
          }}
        />

        <div className="FetchedSchedulesContainer" style={{ marginTop: '20px' }}>
          {selectedDate && (
            <div className="schedule-container" style={{ border: '1px solid #EDEDF1', borderRadius: '8px', padding: '16px' }}>
              <div className="schedule-date" style={{ fontWeight: '500', marginBottom: '12px', fontSize: '14px' }}>
                Schedule for {selectedDate}:
              </div>
              
              {getSchedulesForSelectedDate().length > 0 ? (
                getSchedulesForSelectedDate().map((schedule, index) => (
                  <div key={index} className="schedule-item" style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button className="liveClassButton" style={{ padding: '2px 8px', fontSize: '10px' }}>
                        {schedule.type}
                      </button>
                      <div className="schedule-time" style={{ fontSize: '12px', color: '#666' }}>All Day</div>
                    </div>
                    <div>
                      <div className="schedule-title" style={{ fontSize: '13px', fontWeight: '500' }}>{schedule.title}</div>
                      {schedule.description && (
                        <div style={{ color: "#6b728c", fontSize: "12px", marginTop: "2px" }}>
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '13px', color: '#6b728c' }}>
                  You have no schedule for today
                </div>
              )}
            </div>
          )}

          {/* Announcements Section */}
          <div className="AnnouncementsContainer" style={{ marginTop: '20px' }}>
            <div className="currentDateDiv" style={{ fontWeight: '600', marginBottom: '10px' }}>Announcements</div>
            {announcements.length > 0 ? (
              announcements.slice(0, 5).map((announcement, index) => (
                <div key={index} className="scheduleItem" style={{ border: '1px solid #EDEDF1', borderRadius: '6px', margin: '5px 5px 5px 0.5px', padding: '10px', backgroundColor: '#fff' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(announcement.creationTimeStamp).toLocaleDateString()}
                  </div>
                  <div style={{ fontWeight: '500', color: '#1B233A', marginTop: '4px' }}>
                    {announcement.announcementTitle}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    {announcement.announcementMessage?.length > 100 
                      ? `${announcement.announcementMessage.substring(0, 100)}...` 
                      : announcement.announcementMessage}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                    By {announcement.announcementByName}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', color: '#666', fontSize: '14px' }}>
                No active announcements
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
