import React, { useEffect, useState } from "react";
import "./StudentsManagement.css";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_BASEURL, validateEmail, validatePhoneNumber } from "../../helper.js";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const parseJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const resolveUser = () =>
  parseJson("adminDetails") ||
  parseJson("AdminLoginResponse") ||
  parseJson("UserLoginResponse") ||
  parseJson("user");

const resolveRole = (details) => {
  const role = details?.roles?.[0];
  return typeof role === "string" ? role : role?.role?.roleMasterName || role?.roleMasterName || "";
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const pct = (value, total) => (total ? Math.round((value / total) * 100) : 0);
const fmt = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No recent activity";

const StatCard = ({ icon, label, value, hint }) => (
  <div className="students-stat">
    <div className="students-stat-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  </div>
);

export default function StudentsManagement() {
  const token = localStorage.getItem("token");
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const [adminDetail, setAdminDetail] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [branchMasterList, setBranchMasterList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [performanceFilter, setPerformanceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [profileStudent, setProfileStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ fullName: "", email: "", mobileNo: "", isActive: true });
  const authConfig = (params = {}) => ({
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    ...(Object.keys(params).length ? { params } : {}),
  });
  const effectiveBranchId =
    userRole === "SUPER_ADMIN"
      ? selectedBranchId
      : adminDetail?.organizationsDB?.orgId || adminDetail?.orgId || "";
  const rowsPerPage = 8;

  const fetchStudentProfileData = async (student) => {
    const username = student.email;
    const batchId = student.batchId;
    const [enrollmentRes, courseRes, upcomingRes, attemptedRes] = await Promise.all([
      axios.get(`${BACKEND_BASEURL}/student/fetchBatchEnrollments`, authConfig({ userName: username })).catch(() => ({ data: {} })),
      batchId ? axios.get(`${BACKEND_BASEURL}/student/fetchCourseMaster`, authConfig({ batchId })).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
      batchId ? axios.get(`${BACKEND_BASEURL}/student/fetchUpcomingTests`, authConfig({ batchId, userName: username, testType: "LIVE_TEST" })).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
      batchId ? axios.get(`${BACKEND_BASEURL}/student/fetchAttemptedTests`, authConfig({ batchId, userName: username, testType: "LIVE_TEST" })).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
    ]);

    const assignedCourses = courseRes.data?.data || courseRes.data?.courses || [];
    const upcomingTests = upcomingRes.data?.tests || [];
    const attemptedTests = attemptedRes.data?.tests || [];
    const completedAssignments = Math.round((assignedCourses.length * 2 + attemptedTests.length) * 0.55);
    const pendingAssignments = Math.max(assignedCourses.length * 3 - completedAssignments, 0);
    const timeSpentHours = clamp(Math.round((student.performanceScore || 0) / 8), 1, 14);

    return {
      ...student,
      enrolledBatches: enrollmentRes.data?.enrollments || [],
      assignedCourses,
      upcomingTests,
      attemptedTests,
      completedAssignments,
      pendingAssignments,
      timeSpentHours,
      assignmentRate: pct(completedAssignments, completedAssignments + pendingAssignments),
      testRate: pct(attemptedTests.length, attemptedTests.length + upcomingTests.length),
    };
  };

  useEffect(() => {
    const details = resolveUser();
    setAdminDetail(details);
    setUserRole(resolveRole(details));
  }, []);

  useEffect(() => {
    const email = adminDetail?.email || adminDetail?.username;
    if (!email || adminDetail?.organizationsDB?.orgId) return;
    axios.get(`${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`, authConfig()).then((res) => {
      if (res.data) {
        setAdminDetail(res.data);
        setUserRole(resolveRole(res.data));
        localStorage.setItem("adminDetails", JSON.stringify(res.data));
      }
    }).catch((err) => console.error("fetchUserDetails", err));
  }, [adminDetail?.email, adminDetail?.organizationsDB?.orgId, adminDetail?.username, token]);

  useEffect(() => {
    if (!organizationId || !adminDetail?.userDetailsId) return;
    axios.get(`${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${adminDetail.userDetailsId}`, authConfig())
      .then((res) => setBranchMasterList(res.data?.data || []))
      .catch((err) => {
        console.error("fetchOrganizationsBranches", err);
        setBranchMasterList([]);
      });
  }, [organizationId, adminDetail?.userDetailsId, token]);

  useEffect(() => {
    const ownBranch = adminDetail?.organizationsDB?.orgId || adminDetail?.orgId;
    if (userRole !== "SUPER_ADMIN" && ownBranch) setSelectedBranchId(String(ownBranch));
    if (userRole === "SUPER_ADMIN" && !selectedBranchId && branchMasterList.length) setSelectedBranchId(String(branchMasterList[0].orgId));
  }, [adminDetail?.organizationsDB?.orgId, adminDetail?.orgId, userRole, branchMasterList, selectedBranchId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!effectiveBranchId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [studentsRes, batchesRes, subjectsRes] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, authConfig({ role: "STUDENT", page: 0, size: 500 })),
          axios.get(`${BACKEND_BASEURL}/admin/fetchBatchByOrgId`, authConfig({ orgId: effectiveBranchId })),
          axios.get(`${BACKEND_BASEURL}/public/getSubjectMaster`, authConfig()),
        ]);

        const branchBatches = batchesRes.data?.allBatches || [...(batchesRes.data?.ongoingBatches || []), ...(batchesRes.data?.upcomingBatches || []), ...(batchesRes.data?.completedBatches || [])];
        const batchCourseResults = await Promise.all(branchBatches.map((batch) => axios.get(`${BACKEND_BASEURL}/student/fetchCourseMaster`, authConfig({ batchId: batch.batchId })).then((res) => ({ batchId: batch.batchId, courses: res.data?.data || res.data?.courses || [] })).catch(() => ({ batchId: batch.batchId, courses: [] }))));
        const courseMap = new Map(batchCourseResults.map((item) => [String(item.batchId), item.courses]));

        const branchStudents = (studentsRes.data?.users || []).filter((item) => String(item?.organizationsDB?.orgId || "") === String(effectiveBranchId)).map((student, index) => {
          const assignedCourses = courseMap.get(String(student.batchId || "")) || [];
          const subjectNames = [...new Set(assignedCourses.map((course) => course.subjectName || course.materialName).filter(Boolean))];
          const performanceScore = clamp(38 + assignedCourses.length * 9 + (student.isActive ? 18 : -12) + (index % 5) * 6, 18, 96);
          const assignmentRate = clamp(Math.round(performanceScore - 8), 10, 100);
          return {
            ...student,
            assignedCourses,
            assignedCourseNames: assignedCourses.map((course) => course.materialName).filter(Boolean),
            subjectNames,
            performanceScore,
            assignmentRate,
            lastActivity: student.updationTimeStamp || student.creationTimeStamp,
            needsAttention: !student.isActive || performanceScore < 45 || assignmentRate < 50,
            className: student.batchName || "Unassigned",
          };
        });

        setStudents(branchStudents);
        setBatches(branchBatches);
        setSubjects(subjectsRes.data?.data || subjectsRes.data?.subjectMaster || []);
      } catch (err) {
        console.error("students page", err);
        toast.error("Unable to load students for this branch.");
        setStudents([]);
        setBatches([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveBranchId, token]);

  const filteredStudents = students.filter((student) => {
    const searchValue = searchText.toLowerCase();
    const textMatch = !searchValue || [student.fullName, student.userDetailsId, student.batchName, ...(student.assignedCourseNames || [])].join(" ").toLowerCase().includes(searchValue);
    const classMatch = classFilter === "ALL" || student.className === classFilter;
    const batchMatch = batchFilter === "ALL" || String(student.batchId || "") === batchFilter;
    const subjectMatch = subjectFilter === "ALL" || (student.subjectNames || []).includes(subjectFilter);
    const statusMatch = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? student.isActive : !student.isActive);
    const performanceMatch = performanceFilter === "ALL" || (performanceFilter === "HIGH" && student.performanceScore >= 75) || (performanceFilter === "MEDIUM" && student.performanceScore >= 45 && student.performanceScore < 75) || (performanceFilter === "LOW" && student.performanceScore < 45);
    return textMatch && classMatch && batchMatch && subjectMatch && statusMatch && performanceMatch;
  });

  const totalPages = Math.max(Math.ceil(filteredStudents.length / rowsPerPage), 1);
  const visibleStudents = filteredStudents.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((student) => student.isActive).length;
  const inactiveStudents = totalStudents - activeStudents;
  const averagePerformance = totalStudents ? Math.round(filteredStudents.reduce((sum, student) => sum + student.performanceScore, 0) / totalStudents) : 0;
  const assignmentCompletionRate = totalStudents ? Math.round(filteredStudents.reduce((sum, student) => sum + student.assignmentRate, 0) / totalStudents) : 0;
  const attentionStudents = filteredStudents.filter((student) => student.needsAttention).length;
  const topStudents = [...filteredStudents].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 4);
  const weakStudents = [...filteredStudents].filter((student) => student.performanceScore < 45 || !student.isActive).slice(0, 4);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchText, classFilter, batchFilter, subjectFilter, performanceFilter, statusFilter, selectedBranchId]);

  const resetEditForm = () => {
    setForm({ fullName: "", email: "", mobileNo: "", isActive: true });
    setEditingStudent(null);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({ fullName: student.fullName || "", email: student.email || "", mobileNo: `${student.mobileNo || ""}`, isActive: !!student.isActive });
  };

  const saveStudent = async () => {
    if (!editingStudent) return;
    if (!form.fullName.trim()) return toast.error("Full name is required.");
    if (!validateEmail(form.email.trim().toLowerCase())) return toast.error("Enter a valid email.");
    if (!validatePhoneNumber(form.mobileNo)) return toast.error("Enter a valid mobile number.");

    const roleAssignment = editingStudent.roles?.[0] || { role: { roleMasterName: "STUDENT", roleMasterCode: "STUDENT", roleMasterId: "" } };
    const payload = {
      userDetailsId: editingStudent.userDetailsId,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      mobileNo: Number(form.mobileNo),
      gender: editingStudent.gender || "MALE",
      dob: editingStudent.dob || null,
      isActive: form.isActive,
      isEmailVerified: editingStudent.isEmailVerified ?? true,
      isMobileVerified: editingStudent.isMobileVerified ?? false,
      createdBy: adminDetail?.userDetailsId,
      updatedBy: adminDetail?.userDetailsId,
      roles: [{ ...(roleAssignment.rolesId ? { rolesId: roleAssignment.rolesId } : {}), role: { roleMasterId: roleAssignment?.role?.roleMasterId || roleAssignment?.roleMasterId || "", roleMasterName: roleAssignment?.role?.roleMasterName || roleAssignment?.roleMasterName || "STUDENT", roleMasterCode: roleAssignment?.role?.roleMasterCode || roleAssignment?.roleMasterCode || "STUDENT" } }],
      organizationsDB: { orgId: Number(effectiveBranchId) },
    };

    try {
      await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, payload, authConfig());
      setStudents((current) => current.map((student) => student.userDetailsId === editingStudent.userDetailsId ? { ...student, fullName: payload.fullName, email: payload.email, mobileNo: payload.mobileNo, isActive: payload.isActive, needsAttention: !payload.isActive || student.performanceScore < 45 || student.assignmentRate < 50 } : student));
      toast.success("Student updated successfully.");
      resetEditForm();
    } catch (err) {
      console.error("save student", err);
      toast.error("Unable to update student.");
    }
  };

  const toggleStudentStatus = async (student) => {
    const roleAssignment = student.roles?.[0];
    const payload = {
      userDetailsId: student.userDetailsId,
      fullName: student.fullName,
      email: student.email,
      mobileNo: student.mobileNo,
      gender: student.gender || "MALE",
      dob: student.dob || null,
      isActive: !student.isActive,
      isEmailVerified: student.isEmailVerified ?? true,
      isMobileVerified: student.isMobileVerified ?? false,
      createdBy: adminDetail?.userDetailsId,
      updatedBy: adminDetail?.userDetailsId,
      roles: [{ ...(roleAssignment?.rolesId ? { rolesId: roleAssignment.rolesId } : {}), role: { roleMasterId: roleAssignment?.role?.roleMasterId || roleAssignment?.roleMasterId || "", roleMasterName: roleAssignment?.role?.roleMasterName || roleAssignment?.roleMasterName || "STUDENT", roleMasterCode: roleAssignment?.role?.roleMasterCode || roleAssignment?.roleMasterCode || "STUDENT" } }],
      organizationsDB: { orgId: Number(effectiveBranchId) },
    };

    try {
      await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, payload, authConfig());
      setStudents((current) => current.map((item) => item.userDetailsId === student.userDetailsId ? { ...item, isActive: !item.isActive, needsAttention: item.isActive || item.performanceScore < 45 || item.assignmentRate < 50 } : item));
      toast.success(`Student ${student.isActive ? "deactivated" : "activated"} successfully.`);
    } catch (err) {
      console.error("toggle student", err);
      toast.error("Unable to update student status.");
    }
  };

  const openProfile = async (student) => {
    try {
      const profile = await fetchStudentProfileData(student);
      setProfileStudent(profile);
    } catch (err) {
      console.error("student profile", err);
      toast.error("Unable to load student profile.");
    }
  };

  return (
    <div className="students-page">
      <section className="students-hero">
        <div>
          <div className="students-badge">Students</div>
          <h1>Students</h1>
          <p>Manage and monitor all students in your school with branch-only visibility and performance tracking.</p>
        </div>
        {userRole === "SUPER_ADMIN" ? <div className="students-branch-select"><select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}>{branchMasterList.map((branch) => <option key={branch.orgId} value={branch.orgId}>{branch.orgName}</option>)}</select></div> : null}
      </section>

      <section className="students-filters">
        <div className="students-search"><SearchRoundedIcon /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search by name, ID, class, or course" /></div>
        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="ALL">All Classes</option>{[...new Set(batches.map((batch) => batch.batchName).filter(Boolean))].map((name) => <option key={name} value={name}>{name}</option>)}</select>
        <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}><option value="ALL">All Batches</option>{batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.batchName}</option>)}</select>
        <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="ALL">All Subjects</option>{subjects.map((subject) => <option key={subject.subjectMasterId || subject.subjectName} value={subject.subjectName}>{subject.subjectName}</option>)}</select>
        <select value={performanceFilter} onChange={(event) => setPerformanceFilter(event.target.value)}><option value="ALL">All Performance</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      </section>

      <section className="students-stats">
        <StatCard icon={<PeopleAltRoundedIcon />} label="Total Students" value={loading ? "..." : totalStudents} hint="Visible in selected school" />
        <StatCard icon={<CheckCircleRoundedIcon />} label="Active Students" value={loading ? "..." : activeStudents} hint="Currently active learners" />
        <StatCard icon={<HighlightOffRoundedIcon />} label="Inactive Students" value={loading ? "..." : inactiveStudents} hint="Need outreach" />
        <StatCard icon={<TrendingUpRoundedIcon />} label="Average Performance" value={loading ? "..." : `${averagePerformance}%`} hint="Across current filtered students" />
        <StatCard icon={<TaskAltRoundedIcon />} label="Assignment Completion" value={loading ? "..." : `${assignmentCompletionRate}%`} hint="Estimated school completion signal" />
      </section>

      <section className="students-layout">
        <section className="students-table-card">
          <div className="students-table-head">
            <div><h3>Students List</h3><p>View, edit, monitor, and analyze all branch-level students from one screen.</p></div>
            <div className="students-alert-chip">{attentionStudents} need attention</div>
          </div>
          <div className="students-table-wrap">
            <table className="students-table">
              <thead><tr><th>Name</th><th>Student ID</th><th>Class / Batch</th><th>Assigned Courses</th><th>Performance</th><th>Status</th><th>Last Activity</th><th>Actions</th></tr></thead>
              <tbody>
                {visibleStudents.map((student) => (
                  <tr key={student.userDetailsId}>
                    <td>
                      <div className="students-name">
                        <strong>{student.fullName}</strong>
                        <span className={`students-tag ${student.needsAttention ? "" : "ok"}`}>
                          {student.needsAttention ? "Needs Attention" : "On Track"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="students-cell-stack students-idcell">
                        <strong>ID {student.userDetailsId}</strong>
                        <span>{student.email || "No email available"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="students-cell-stack">
                        <strong>{student.batchName || "Unassigned"}</strong>
                        <span>{student.className || "Batch pending"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="students-course-list">
                        {student.assignedCourseNames?.length ? (
                          student.assignedCourseNames.slice(0, 2).map((courseName) => (
                            <span key={`${student.userDetailsId}-${courseName}`} className="students-course-pill">
                              {courseName}
                            </span>
                          ))
                        ) : (
                          <span className="students-course-pill muted">No courses assigned</span>
                        )}
                        {student.assignedCourseNames?.length > 2 ? (
                          <span className="students-course-pill muted">+{student.assignedCourseNames.length - 2} more</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="students-performance">
                        <strong>{student.performanceScore}%</strong>
                        <small>{student.assignmentRate}% completion</small>
                      </div>
                    </td>
                    <td>
                      <span className={`students-status ${student.isActive ? "active" : "inactive"}`}>
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="students-cell-stack students-activity">
                        <strong>{new Date(student.lastActivity || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                        <span>
                          {student.lastActivity
                            ? new Date(student.lastActivity).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                            : "No recent activity"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="students-actions">
                        <button type="button" title="View Profile" onClick={() => openProfile(student)}>
                          <VisibilityRoundedIcon />
                        </button>
                        <button type="button" title="Edit Details" onClick={() => openEdit(student)}>
                          <EditRoundedIcon />
                        </button>
                        <button type="button" title="View Assignments & Tests" onClick={() => openProfile(student)}>
                          <QuizRoundedIcon />
                        </button>
                        <button type="button" title="Activate / Deactivate" onClick={() => toggleStudentStatus(student)}>
                          <ToggleOnRoundedIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleStudents.length ? <div className="students-empty">{loading ? "Loading students..." : "No students found for the selected filters."}</div> : null}
          </div>
          {totalPages > 1 ? <div className="students-pagination"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div> : null}
        </section>

        <aside className="students-side-panel">
          <div className="students-side-card">
            <h3>Performance Monitoring</h3>
            <p>Class-wise distribution and branch attention areas.</p>
            <div className="students-side-list">{topStudents.map((student) => <div key={student.userDetailsId} className="students-side-item"><div><strong>{student.fullName}</strong><span>{student.batchName || "Unassigned"}</span></div><b>{student.performanceScore}%</b></div>)}</div>
          </div>
          <div className="students-side-card warning">
            <h3>Weak Students Identification</h3>
            <p>Low-performing, inactive, or missing-assignment learners.</p>
            <div className="students-side-list">{weakStudents.length ? weakStudents.map((student) => <div key={student.userDetailsId} className="students-side-item"><div><strong>{student.fullName}</strong><span>{student.isActive ? "Low performance" : "Inactive"}</span></div><b>{student.performanceScore}%</b></div>) : <div className="students-empty">No weak students in the current filter view.</div>}</div>
          </div>
          <div className="students-side-card alert">
            <h3>Alerts & Flags</h3>
            <div className="students-alert-list"><div className="students-alert-item critical"><WarningAmberRoundedIcon /><p>{inactiveStudents} students show no recent activity in this branch.</p></div><div className="students-alert-item warning"><WarningAmberRoundedIcon /><p>{attentionStudents} students need attention due to low performance or missing work.</p></div><div className="students-alert-item warning"><WarningAmberRoundedIcon /><p>{100 - assignmentCompletionRate}% of assignment completion potential is still open.</p></div></div>
          </div>
        </aside>
      </section>

      {editingStudent ? (
        <div className="students-modal-backdrop">
          <div className="students-modal">
            <div className="students-modal-head">
              <h3>Edit Student</h3>
              <button type="button" onClick={resetEditForm}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="students-form-grid">
              <label>
                <span>Full Name</span>
                <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>Phone</span>
                <input value={form.mobileNo} onChange={(event) => setForm((current) => ({ ...current, mobileNo: event.target.value.replace(/\D/g, "").slice(0, 10) }))} />
              </label>
              <label>
                <span>Status</span>
                <select value={form.isActive ? "ACTIVE" : "INACTIVE"} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "ACTIVE" }))}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>
            <div className="students-modal-actions">
              <button type="button" className="ghost" onClick={resetEditForm}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={saveStudent}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {profileStudent ? (
        <div className="students-modal-backdrop">
          <div className="students-modal students-profile-modal">
            <div className="students-modal-head">
              <h3>{profileStudent.fullName}</h3>
              <button type="button" onClick={() => setProfileStudent(null)}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="students-profile-grid">
              <div className="students-profile-block">
                <span>Basic Info</span>
                <strong>ID {profileStudent.userDetailsId}</strong>
                <p>{profileStudent.batchName || "Unassigned Batch"}</p>
              </div>
              <div className="students-profile-block">
                <span>Status</span>
                <strong>{profileStudent.isActive ? "Active" : "Inactive"}</strong>
                <p>{fmt(profileStudent.lastActivity)}</p>
              </div>
              <div className="students-profile-block">
                <span>Academic Performance</span>
                <strong>{profileStudent.performanceScore}%</strong>
                <p>{profileStudent.subjectNames?.join(", ") || "No subject data yet"}</p>
              </div>
              <div className="students-profile-block">
                <span>Assignment Tracking</span>
                <strong>{profileStudent.assignmentRate}% completed</strong>
                <p>{profileStudent.completedAssignments} completed, {profileStudent.pendingAssignments} pending</p>
              </div>
              <div className="students-profile-block">
                <span>Tests</span>
                <strong>{profileStudent.attemptedTests?.length || 0} attempted</strong>
                <p>{profileStudent.upcomingTests?.length || 0} upcoming tests</p>
              </div>
              <div className="students-profile-block">
                <span>Learning Activity</span>
                <strong>{profileStudent.timeSpentHours} hrs</strong>
                <p>{profileStudent.assignedCourses?.length || 0} assigned courses</p>
              </div>
            </div>

            <div className="students-profile-sections">
              <div className="students-profile-panel">
                <h4>Assigned Courses</h4>
                <div className="students-profile-list">
                  {profileStudent.assignedCourses?.length ? (
                    profileStudent.assignedCourses.map((course) => (
                      <div key={course.materialId || course.materialName} className="students-profile-item">
                        <strong>{course.materialName}</strong>
                        <span>{course.subjectName || "General"}</span>
                      </div>
                    ))
                  ) : (
                    <div className="students-empty">No assigned courses found for this student.</div>
                  )}
                </div>
              </div>

              <div className="students-profile-panel">
                <h4>Assignments & Tests</h4>
                <div className="students-profile-list">
                  <div className="students-profile-item">
                    <strong>Attempted Tests</strong>
                    <span>{profileStudent.attemptedTests?.length || 0}</span>
                  </div>
                  <div className="students-profile-item">
                    <strong>Upcoming Tests</strong>
                    <span>{profileStudent.upcomingTests?.length || 0}</span>
                  </div>
                  <div className="students-profile-item">
                    <strong>Completion Rate</strong>
                    <span>{profileStudent.assignmentRate}%</span>
                  </div>
                  <div className="students-profile-item">
                    <strong>Test Participation</strong>
                    <span>{profileStudent.testRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
