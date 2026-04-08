import React, { useEffect, useState } from "react";
import "./PrincipalDashboard.css";
import axios from "axios";
import { BACKEND_BASEURL } from "../../helper.js";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import LayersIcon from "@mui/icons-material/Layers";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupsIcon from "@mui/icons-material/Groups";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

const KpiCard = ({ icon, title, value, color, onClick }) => (
  <div
    className="kpi-card"
    style={{ borderLeft: `4px solid ${color}` }}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        onClick?.();
      }
    }}
  >
    <div className="kpi-icon" style={{ backgroundColor: `${color}15`, color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <span className="kpi-title">{title}</span>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, actionLabel, onAction }) => (
  <div className="section-header">
    <h3>{title}</h3>
    {actionLabel && (
      <button className="text-btn" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

const parseLocalStorageJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error parsing localStorage key ${key}:`, error);
    return null;
  }
};

const resolveLoggedInUser = () =>
  parseLocalStorageJson("adminDetails") ||
  parseLocalStorageJson("AdminLoginResponse") ||
  parseLocalStorageJson("UserLoginResponse") ||
  parseLocalStorageJson("user");

const resolveRoleName = (details) => {
  if (!details?.roles?.length) {
    return "";
  }

  const primaryRole = details.roles[0];
  return typeof primaryRole === "string"
    ? primaryRole
    : primaryRole?.role?.roleMasterName || primaryRole?.roleMasterName || "";
};

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const token = localStorage.getItem("token");

  const [date] = useState(new Date());
  const [adminDetail, setAdminDetail] = useState(null);
  const [branchMasterList, setBranchMasterList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeCourses: 0,
    totalAssignments: 0,
    activeUsersToday: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLoggedInUser = () => {
      const details = resolveLoggedInUser();
      setAdminDetail(details);
      setUserRole(resolveRoleName(details));
    };

    syncLoggedInUser();
    window.addEventListener("profileUpdate", syncLoggedInUser);
    window.addEventListener("loginSuccess", syncLoggedInUser);

    return () => {
      window.removeEventListener("profileUpdate", syncLoggedInUser);
      window.removeEventListener("loginSuccess", syncLoggedInUser);
    };
  }, []);

  useEffect(() => {
    const email = adminDetail?.email || adminDetail?.username;

    if (!email || adminDetail?.organizationsDB?.orgId) {
      return;
    }

    const fetchAdminDetails = async () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`,
          { headers }
        );

        if (response.status === 200 && response.data) {
          setAdminDetail(response.data);
          setUserRole(resolveRoleName(response.data));
          localStorage.setItem("adminDetails", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
      }
    };

    fetchAdminDetails();
  }, [adminDetail?.email, adminDetail?.organizationsDB?.orgId, adminDetail?.username, token]);

  useEffect(() => {
    const baseBranchId = adminDetail?.organizationsDB?.orgId || adminDetail?.orgId;
    if (userRole !== "SUPER_ADMIN" && baseBranchId) {
      setSelectedBranchId(String(baseBranchId));
    }
  }, [adminDetail?.organizationsDB?.orgId, adminDetail?.orgId, userRole]);

  useEffect(() => {
    const fetchBranchMaster = async () => {
      if (!organizationId || !adminDetail?.userDetailsId) {
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${adminDetail.userDetailsId}`,
          { headers }
        );
        setBranchMasterList(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranchMasterList([]);
      }
    };

    fetchBranchMaster();
  }, [organizationId, adminDetail?.userDetailsId, token]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!adminDetail?.userDetailsId) {
        return;
      }

      setLoading(true);
      setDashboardError("");

      const effectiveBranchId =
        userRole === "SUPER_ADMIN"
          ? selectedBranchId
          : adminDetail?.organizationsDB?.orgId || adminDetail?.orgId || "";
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const summaryRes = await axios.get(`${BACKEND_BASEURL}/admin/dashboard/summary`, {
          headers,
          params: effectiveBranchId ? { branchId: effectiveBranchId } : {},
        });

        setMetrics({
          totalStudents: summaryRes.data?.totalStudents || 0,
          totalTeachers: summaryRes.data?.totalTeachers || 0,
          totalClasses: summaryRes.data?.totalBatches || 0,
          activeCourses: summaryRes.data?.totalCourses || 0,
          totalAssignments: summaryRes.data?.totalAssignments || 0,
          activeUsersToday: summaryRes.data?.activeUsersToday || 0,
        });

        if (effectiveBranchId) {
          const annRes = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllAnnouncements`, {
            headers,
            params: { branchId: effectiveBranchId },
          });

          setAnnouncements(
            (annRes.data?.data || [])
              .filter((item) => item?.isActive)
              .sort((a, b) => new Date(b.creationTimeStamp) - new Date(a.creationTimeStamp))
              .slice(0, 3)
          );
        } else {
          setAnnouncements([]);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setDashboardError("Unable to load the latest dashboard data right now.");
        setMetrics({
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          activeCourses: 0,
          totalAssignments: 0,
          activeUsersToday: 0,
        });
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [adminDetail?.userDetailsId, adminDetail?.organizationsDB?.orgId, adminDetail?.orgId, selectedBranchId, token, userRole]);

  const handleBranchChange = (event) => setSelectedBranchId(event.target.value);
  const handleNav = (id, subId = "") =>
    navigate("/adminLandingPage", { state: { selectedBox: id, selectedSubBox: subId } });

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const displayValue = (value) => (loading ? "..." : value);

  return (
    <div className="principal-dashboard">
      <header className="dashboard-top">
        <div className="header-names">
          <div className="org-name-badge">
            {adminDetail?.organizationsDB?.orgName ||
              adminDetail?.organizationsDB?.organizationName ||
              "LMS Platform"}
          </div>
          <h1>
            Welcome Back, {adminDetail?.firstName || adminDetail?.fullName || "Principal"} {"\uD83D\uDC4B"}
          </h1>
          <p className="subtitle">School Academic Control Center | {formattedDate}</p>
          {dashboardError && <p className="dashboard-inline-error">{dashboardError}</p>}
        </div>

        <div className="header-actions">
          {userRole === "SUPER_ADMIN" && (
            <div className="branch-selector">
              <select value={selectedBranchId} onChange={handleBranchChange}>
                <option value="">All Branches</option>
                {branchMasterList.map((branch) => (
                  <option key={branch.orgId} value={branch.orgId}>
                    {branch.orgName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Search data..." />
          </div>
        </div>
      </header>

      <div className="kpi-grid">
        <KpiCard
          icon={<PeopleIcon />}
          title="Total Students"
          value={displayValue(metrics.totalStudents)}
          color="#FF9933"
          onClick={() => handleNav("students")}
        />
        <KpiCard
          icon={<SchoolIcon />}
          title="Total Teachers"
          value={displayValue(metrics.totalTeachers)}
          color="#4338CA"
          onClick={() => handleNav("teachers")}
        />
        <KpiCard
          icon={<LayersIcon />}
          title="Classes & Batches"
          value={displayValue(metrics.totalClasses)}
          color="#166534"
          onClick={() => handleNav("classes")}
        />
        <KpiCard
          icon={<LibraryBooksIcon />}
          title="Active Courses"
          value={displayValue(metrics.activeCourses)}
          color="#9D174D"
          onClick={() => handleNav("courses")}
        />
        <KpiCard
          icon={<AssignmentIcon />}
          title="Assignments"
          value={displayValue(metrics.totalAssignments)}
          color="#92400E"
          onClick={() => handleNav("assignments")}
        />
        <KpiCard
          icon={<GroupsIcon />}
          title="Active Users Today"
          value={displayValue(metrics.activeUsersToday)}
          color="#065F46"
          onClick={() => {}}
        />
      </div>

      <div className="dashboard-grid">
        <section className="grid-item performance-section">
          <SectionHeader title="Academic Performance Overview" actionLabel="View Report" />
          <div className="chart-placeholder">
            <div className="bar-group">
              {[65, 80, 45, 90, 70, 85].map((height, index) => (
                <div key={index} className="chart-bar" style={{ height: `${height}%` }}>
                  <span className="bar-label">C{index + 5}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span>Class-wise performance (Weekly)</span>
            </div>
          </div>
        </section>

        <section className="grid-item activity-section">
          <SectionHeader title="Teacher Activity Panel" actionLabel="View All" />
          <div className="activity-list">
            {[
              { name: "Dr. Sharma", status: "Active", time: "Live Now" },
              { name: "Ms. Priyanka", status: "Active", time: "Finished: 10:30" },
              { name: "Mr. Khanna", status: "Inactive", time: "Absence" },
            ].map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-info">
                  <span className="name">{item.name}</span>
                  <span className="status-meta">{item.time}</span>
                </div>
                <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid-item engagement-section">
          <SectionHeader title="Student Engagement" />
          <div className="engagement-metrics">
            <div className="metric-box">
              <span className="label">Low Performers</span>
              <span className="val warn">12</span>
            </div>
            <div className="metric-box">
              <span className="label">Completion Rate</span>
              <span className="val">88%</span>
            </div>
          </div>
          <div className="highlight-box">
            <p>
              <strong>Alert:</strong> 5 students from Batch A-02 have missed 3+ assignments this week.
            </p>
          </div>
        </section>

        <section className="grid-item calendar-section">
          <SectionHeader title="Calendar & Schedule" />
          <div className="mini-calendar-wrapper">
            <Calendar value={date} className="custom-dashboard-calendar" />
          </div>
        </section>

        <section className="grid-item announcements-section">
          <SectionHeader title="Announcements" onAction={() => {}} />
          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={index} className="ann-item">
                  <span className="ann-title">{announcement.announcementTitle}</span>
                  <span className="ann-date">
                    {new Date(announcement.creationTimeStamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="ann-empty-state">
                {loading ? "Loading announcements..." : "No announcements found for this branch."}
              </div>
            )}
            <button className="quick-action-btn primary">
              <AddIcon /> Create Announcement
            </button>
          </div>
        </section>

        <section className="grid-item ai-section">
          <SectionHeader title="AI Insights & Alerts" />
          <div className="insights-list">
            <div className="insight-item critical">
              <ErrorOutlineIcon fontSize="small" />
              <p>3 teachers have not logged any activity today.</p>
            </div>
            <div className="insight-item suggestion">
              <PsychologyIcon fontSize="small" />
              <p>Class 8 is weak in Algebra. Consider extra sessions.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
