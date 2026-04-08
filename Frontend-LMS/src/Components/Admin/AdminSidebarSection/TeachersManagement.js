import React, { useEffect, useState } from "react";
import "./TeachersManagement.css";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_BASEURL, validateEmail, validatePasswordStrength, validatePhoneNumber } from "../../helper.js";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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
const fmt = (value) => (value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No recent activity");

const StatCard = ({ icon, label, value, hint }) => (
  <div className="teachers-stat">
    <div className="teachers-stat-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  </div>
);

export default function TeachersManagement() {
  const token = localStorage.getItem("token");
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const [adminDetail, setAdminDetail] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [branchMasterList, setBranchMasterList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherRole, setTeacherRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [profileTeacher, setProfileTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", mobileNo: "", password: "", isActive: true });
  const authConfig = (params = {}) => ({ ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}), ...(Object.keys(params).length ? { params } : {}) });
  const effectiveBranchId = userRole === "SUPER_ADMIN" ? selectedBranchId : adminDetail?.organizationsDB?.orgId || adminDetail?.orgId || "";
  const rowsPerPage = 8;

  const hydrateTeacher = async (teacher, branchBatches, teacherTests) => {
    const [batchesRes, metricsRes] = await Promise.all([
      axios.get(`${BACKEND_BASEURL}/teacher/dashboard/batches`, authConfig({ teacherId: teacher.userDetailsId })).catch(() => ({ data: { batches: [] } })),
      axios.get(`${BACKEND_BASEURL}/teacher/dashboard/metrics`, authConfig({ teacherId: teacher.userDetailsId })).catch(() => ({ data: {} })),
    ]);

    const assignedBatches = batchesRes.data?.batches || [];
    const assignedSubjects = [...new Set(teacherTests.filter((item) => (item.teacherName || "").toLowerCase() === (teacher.fullName || "").toLowerCase()).map((item) => item.subjectName).filter(Boolean))];
    const activeClasses = metricsRes.data?.activeClasses || 0;
    const classesAssigned = assignedBatches.length;
    const activityScore = clamp(42 + activeClasses * 12 + classesAssigned * 10 + (teacher.isActive ? 12 : -16), 0, 100);

    return {
      ...teacher,
      assignedBatches,
      assignedBatchIds: assignedBatches.map((item) => String(item.id)),
      assignedSubjects,
      activeClasses,
      totalStudents: metricsRes.data?.totalStudents || 0,
      pendingAssignments: metricsRes.data?.pendingAssignments || 0,
      classesAssigned,
      activityScore,
      lastActivity: teacher.updationTimeStamp || teacher.creationTimeStamp,
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
        const [teachersRes, batchesRes, subjectsRes, rolesRes] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, authConfig({ role: "TEACHER", page: 0, size: 300 })),
          axios.get(`${BACKEND_BASEURL}/admin/fetchBatchByOrgId`, authConfig({ orgId: effectiveBranchId })),
          axios.get(`${BACKEND_BASEURL}/public/getSubjectMaster`, authConfig()),
          axios.get(`${BACKEND_BASEURL}/admin/fetchRoleMaster`, authConfig()),
        ]);

        const teacherList = (teachersRes.data?.users || []).filter((item) => String(item?.organizationsDB?.orgId || "") === String(effectiveBranchId));
        const branchBatches = batchesRes.data?.allBatches || [...(batchesRes.data?.ongoingBatches || []), ...(batchesRes.data?.upcomingBatches || []), ...(batchesRes.data?.completedBatches || [])];
        const teacherTests = (await Promise.all(branchBatches.map((batch) => axios.get(`${BACKEND_BASEURL}/admin/fetchBatchTest`, authConfig({ batchId: batch.batchId, testType: "LIVE_TEST" })).then((res) => (res.data?.tests || []).map((test) => ({ ...test, subjectName: test.subject || test.materialName || "General", batchName: batch.batchName }))).catch(() => [])))).flat();
        const enrichedTeachers = await Promise.all(teacherList.map((teacher) => hydrateTeacher(teacher, branchBatches, teacherTests)));

        setTeachers(enrichedTeachers);
        setBatches(branchBatches);
        setSubjects(subjectsRes.data?.data || subjectsRes.data?.subjectMaster || []);
        setTeacherRole((rolesRes.data?.data || []).find((role) => (role.roleMasterName || "").toUpperCase() === "TEACHER") || null);
      } catch (err) {
        console.error("teachers page", err);
        toast.error("Unable to load teachers for this branch.");
        setTeachers([]);
        setBatches([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [effectiveBranchId, token]);

  const filteredTeachers = teachers.filter((teacher) => {
    const searchValue = searchText.toLowerCase();
    const textMatch = !searchValue || [teacher.fullName, teacher.email, ...(teacher.assignedSubjects || [])].join(" ").toLowerCase().includes(searchValue);
    const subjectMatch = subjectFilter === "ALL" || teacher.assignedSubjects?.includes(subjectFilter);
    const batchMatch = batchFilter === "ALL" || teacher.assignedBatchIds?.includes(batchFilter);
    const statusMatch = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? teacher.isActive : !teacher.isActive);
    return textMatch && subjectMatch && batchMatch && statusMatch;
  });

  const totalPages = Math.max(Math.ceil(filteredTeachers.length / rowsPerPage), 1);
  const visibleTeachers = filteredTeachers.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalTeachers = filteredTeachers.length;
  const activeTeachers = filteredTeachers.filter((teacher) => teacher.isActive).length;
  const inactiveTeachers = totalTeachers - activeTeachers;
  const classesAssigned = filteredTeachers.reduce((sum, teacher) => sum + (teacher.classesAssigned || 0), 0);
  const avgActivity = totalTeachers ? Math.round(filteredTeachers.reduce((sum, teacher) => sum + (teacher.activityScore || 0), 0) / totalTeachers) : 0;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const resetForm = () => {
    setForm({ fullName: "", email: "", mobileNo: "", password: "", isActive: true });
    setEditingTeacher(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (teacher) => {
    setEditingTeacher(teacher);
    setForm({ fullName: teacher.fullName || "", email: teacher.email || "", mobileNo: `${teacher.mobileNo || ""}`, password: "", isActive: !!teacher.isActive });
    setShowForm(true);
  };

  const saveTeacher = async () => {
    if (!teacherRole?.roleMasterId) {
      toast.error("Teacher role is not available.");
      return;
    }
    if (!form.fullName.trim()) return toast.error("Full name is required.");
    if (!validateEmail(form.email.trim().toLowerCase())) return toast.error("Enter a valid email.");
    if (!validatePhoneNumber(form.mobileNo)) return toast.error("Enter a valid mobile number.");
    if (!editingTeacher && !validatePasswordStrength(form.password.trim())) return toast.error("Password must be strong.");
    if (editingTeacher && form.password.trim() && !validatePasswordStrength(form.password.trim())) return toast.error("Updated password must be strong.");

    const payload = {
      ...(editingTeacher ? { userDetailsId: editingTeacher.userDetailsId } : {}),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      mobileNo: Number(form.mobileNo),
      gender: editingTeacher?.gender || "MALE",
      dob: editingTeacher?.dob || null,
      isActive: form.isActive,
      isEmailVerified: true,
      isMobileVerified: false,
      createdBy: adminDetail?.userDetailsId,
      updatedBy: adminDetail?.userDetailsId,
      roles: [{ ...(editingTeacher?.roles?.[0]?.rolesId ? { rolesId: editingTeacher.roles[0].rolesId } : {}), role: { roleMasterId: teacherRole.roleMasterId, roleMasterName: teacherRole.roleMasterName, roleMasterCode: teacherRole.roleMasterCode } }],
      organizationsDB: { orgId: Number(effectiveBranchId) },
    };
    if (form.password.trim()) payload.userCredentialsDB = { username: payload.email, password: form.password.trim() };

    try {
      await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, payload, authConfig());
      toast.success(editingTeacher ? "Teacher updated successfully." : "Teacher created successfully.");
      setShowForm(false);
      resetForm();
      setSelectedBranchId((value) => `${value}`);
      setLoading(true);
      const event = new Event("profileUpdate");
      window.dispatchEvent(event);
      const refreshed = await axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, authConfig({ role: "TEACHER", page: 0, size: 300 }));
      const branchTeachers = (refreshed.data?.users || []).filter((item) => String(item?.organizationsDB?.orgId || "") === String(effectiveBranchId));
      setTeachers((current) => branchTeachers.map((teacher) => current.find((item) => item.userDetailsId === teacher.userDetailsId) || teacher));
    } catch (err) {
      console.error("save teacher", err);
      toast.error(err?.response?.data?.message || "Unable to save teacher.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacherStatus = async (teacher) => {
    const payload = {
      userDetailsId: teacher.userDetailsId,
      fullName: teacher.fullName,
      email: teacher.email,
      mobileNo: teacher.mobileNo,
      gender: teacher.gender || "MALE",
      dob: teacher.dob || null,
      isActive: !teacher.isActive,
      isEmailVerified: teacher.isEmailVerified ?? true,
      isMobileVerified: teacher.isMobileVerified ?? false,
      createdBy: adminDetail?.userDetailsId,
      updatedBy: adminDetail?.userDetailsId,
      roles: [{ ...(teacher.roles?.[0]?.rolesId ? { rolesId: teacher.roles[0].rolesId } : {}), role: { roleMasterId: teacherRole.roleMasterId, roleMasterName: teacherRole.roleMasterName, roleMasterCode: teacherRole.roleMasterCode } }],
      organizationsDB: { orgId: Number(effectiveBranchId) },
    };
    try {
      await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, payload, authConfig());
      setTeachers((current) => current.map((item) => (item.userDetailsId === teacher.userDetailsId ? { ...item, isActive: !item.isActive } : item)));
      toast.success(`Teacher ${teacher.isActive ? "deactivated" : "activated"} successfully.`);
    } catch (err) {
      console.error("toggle teacher", err);
      toast.error("Unable to update teacher status.");
    }
  };

  const openAssign = (teacher) => {
    setEditingTeacher(teacher);
    setSelectedBatchIds(teacher.assignedBatchIds || []);
    setShowAssign(true);
  };

  const saveAssignments = async () => {
    if (!editingTeacher) return;
    const newBatchIds = selectedBatchIds.filter((batchId) => !(editingTeacher.assignedBatchIds || []).includes(batchId));
    if (!newBatchIds.length) {
      toast.info("No new class assignment selected.");
      setShowAssign(false);
      return;
    }
    try {
      await Promise.all(newBatchIds.map((batchId) => axios.post(`${BACKEND_BASEURL}/admin/enrollTutorToBatch`, { batchId: Number(batchId), userName: [editingTeacher.email] }, authConfig())));
      toast.success("Teacher assigned to selected classes.");
      setTeachers((current) => current.map((item) => item.userDetailsId === editingTeacher.userDetailsId ? { ...item, assignedBatchIds: [...new Set([...(item.assignedBatchIds || []), ...newBatchIds])], assignedBatches: [...(item.assignedBatches || []), ...batches.filter((batch) => newBatchIds.includes(String(batch.batchId))).map((batch) => ({ id: batch.batchId, name: batch.batchName }))], classesAssigned: [...new Set([...(item.assignedBatchIds || []), ...newBatchIds])].length } : item));
      setShowAssign(false);
    } catch (err) {
      console.error("assign teacher", err);
      toast.error("Unable to assign teacher to selected classes.");
    }
  };

  return (
    <div className="teachers-page">
      <section className="teachers-hero">
        <div>
          <div className="teachers-badge">Teachers</div>
          <h1>Teachers</h1>
          <p>Manage and monitor all teachers in your school with branch-limited visibility and assignment tracking.</p>
        </div>
        <div className="teachers-toolbar">
          {userRole === "SUPER_ADMIN" ? <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}>{branchMasterList.map((branch) => <option key={branch.orgId} value={branch.orgId}>{branch.orgName}</option>)}</select> : null}
          <button type="button" className="teachers-primary-btn" onClick={openCreate}><AddRoundedIcon /> Add Teacher</button>
        </div>
      </section>

      <section className="teachers-filters">
        <div className="teachers-search"><SearchRoundedIcon /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search by name, email, or subject" /></div>
        <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="ALL">All Subjects</option>{subjects.map((subject) => <option key={subject.subjectMasterId || subject.subjectName} value={subject.subjectName}>{subject.subjectName}</option>)}</select>
        <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}><option value="ALL">All Classes / Batches</option>{batches.map((batch) => <option key={batch.batchId} value={batch.batchId}>{batch.batchName}</option>)}</select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      </section>

      <section className="teachers-stats">
        <StatCard icon={<PeopleAltRoundedIcon />} label="Total Teachers" value={loading ? "..." : totalTeachers} hint="Visible in selected school" />
        <StatCard icon={<CheckCircleRoundedIcon />} label="Active Teachers" value={loading ? "..." : activeTeachers} hint="Currently active" />
        <StatCard icon={<HighlightOffRoundedIcon />} label="Inactive Teachers" value={loading ? "..." : inactiveTeachers} hint="Need attention" />
        <StatCard icon={<LayersRoundedIcon />} label="Classes Assigned" value={loading ? "..." : classesAssigned} hint="Across filtered teachers" />
        <StatCard icon={<InsightsRoundedIcon />} label="Avg. Activity Score" value={loading ? "..." : `${avgActivity}/100`} hint="Derived from usage and class activity" />
      </section>

      <section className="teachers-table-card">
        <div className="teachers-table-head"><div><h3>Teachers List</h3><p>Branch-scoped teacher management with profile, edit, assignment, and monitoring actions.</p></div><div className="teachers-alert-chip">{inactiveTeachers} inactive this view</div></div>
        <div className="teachers-table-wrap">
          <table className="teachers-table">
            <thead><tr><th>Name</th><th>Email / ID</th><th>Subjects</th><th>Classes / Batches</th><th>Status</th><th>Last Activity</th><th>Actions</th></tr></thead>
            <tbody>
              {visibleTeachers.map((teacher) => (
                <tr key={teacher.userDetailsId}>
                  <td><div className="teachers-name"><strong>{teacher.fullName}</strong><span>Score {teacher.activityScore}/100</span></div></td>
                  <td><div className="teachers-name"><strong>{teacher.email}</strong><span>ID {teacher.userDetailsId}</span></div></td>
                  <td>{teacher.assignedSubjects?.length ? teacher.assignedSubjects.join(", ") : "No subject signal yet"}</td>
                  <td>{teacher.assignedBatches?.length ? teacher.assignedBatches.map((item) => item.name).join(", ") : "No classes assigned"}</td>
                  <td><span className={`teachers-status ${teacher.isActive ? "active" : "inactive"}`}>{teacher.isActive ? "Active" : "Inactive"}</span></td>
                  <td>{fmt(teacher.lastActivity)}</td>
                  <td><div className="teachers-actions"><button type="button" title="View Profile" onClick={() => setProfileTeacher(teacher)}><VisibilityRoundedIcon /></button><button type="button" title="Edit Teacher" onClick={() => openEdit(teacher)}><EditRoundedIcon /></button><button type="button" title="Assign Classes" onClick={() => openAssign(teacher)}><AssignmentIndRoundedIcon /></button><button type="button" title="Activate / Deactivate" onClick={() => toggleTeacherStatus(teacher)}><ToggleOnRoundedIcon /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleTeachers.length ? <div className="teachers-empty">{loading ? "Loading teachers..." : "No teachers found for the selected branch and filters."}</div> : null}
        </div>
        {totalPages > 1 ? <div className="teachers-pagination"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div> : null}
      </section>

      {showForm ? (
        <div className="teachers-modal-backdrop">
          <div className="teachers-modal">
            <div className="teachers-modal-head"><h3>{editingTeacher ? "Edit Teacher" : "Add Teacher"}</h3><button type="button" onClick={() => { setShowForm(false); resetForm(); }}><CloseRoundedIcon /></button></div>
            <div className="teachers-form-grid">
              <label><span>Full Name</span><input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></label>
              <label><span>Email / Username</span><input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              <label><span>Phone</span><input value={form.mobileNo} onChange={(event) => setForm((current) => ({ ...current, mobileNo: event.target.value.replace(/\D/g, "").slice(0, 10) }))} /></label>
              <label><span>Role</span><input value="Teacher" disabled /></label>
              <label><span>School</span><input value={branchMasterList.find((item) => String(item.orgId) === String(effectiveBranchId))?.orgName || adminDetail?.organizationsDB?.orgName || "Current Branch"} disabled /></label>
              <label><span>Status</span><select value={form.isActive ? "ACTIVE" : "INACTIVE"} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value === "ACTIVE" }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
              <label className="teachers-form-span"><span>Password {editingTeacher ? "(optional)" : ""}</span><input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label>
            </div>
            <div className="teachers-modal-actions"><button type="button" className="ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button><button type="button" className="primary" onClick={saveTeacher}>{editingTeacher ? "Save Changes" : "Create Teacher"}</button></div>
          </div>
        </div>
      ) : null}

      {showAssign && editingTeacher ? (
        <div className="teachers-modal-backdrop">
          <div className="teachers-modal">
            <div className="teachers-modal-head"><h3>Assign Classes / Batches</h3><button type="button" onClick={() => setShowAssign(false)}><CloseRoundedIcon /></button></div>
            <p className="teachers-modal-subtitle">Assign {editingTeacher.fullName} to one or more branch batches.</p>
            <div className="teachers-batch-list">{batches.map((batch) => <label key={batch.batchId} className="teachers-check-row"><input type="checkbox" checked={selectedBatchIds.includes(String(batch.batchId))} onChange={(event) => setSelectedBatchIds((current) => event.target.checked ? [...new Set([...current, String(batch.batchId)])] : current.filter((item) => item !== String(batch.batchId)))} /><span>{batch.batchName}</span></label>)}</div>
            <div className="teachers-modal-actions"><button type="button" className="ghost" onClick={() => setShowAssign(false)}>Close</button><button type="button" className="primary" onClick={saveAssignments}>Save Assignments</button></div>
          </div>
        </div>
      ) : null}

      {profileTeacher ? (
        <div className="teachers-modal-backdrop">
          <div className="teachers-modal teachers-profile-modal">
            <div className="teachers-modal-head"><h3>{profileTeacher.fullName}</h3><button type="button" onClick={() => setProfileTeacher(null)}><CloseRoundedIcon /></button></div>
            <div className="teachers-profile-grid">
              <div className="teachers-profile-block"><span>Email</span><strong>{profileTeacher.email}</strong></div>
              <div className="teachers-profile-block"><span>Status</span><strong>{profileTeacher.isActive ? "Active" : "Inactive"}</strong></div>
              <div className="teachers-profile-block"><span>Assigned Classes</span><strong>{profileTeacher.assignedBatches?.map((item) => item.name).join(", ") || "No classes assigned"}</strong></div>
              <div className="teachers-profile-block"><span>Assigned Subjects</span><strong>{profileTeacher.assignedSubjects?.join(", ") || "No subject signal yet"}</strong></div>
              <div className="teachers-profile-block"><span>Classes Conducted</span><strong>{profileTeacher.activeClasses}</strong></div>
              <div className="teachers-profile-block"><span>Pending Assignments</span><strong>{profileTeacher.pendingAssignments}</strong></div>
              <div className="teachers-profile-block"><span>Students Covered</span><strong>{profileTeacher.totalStudents}</strong></div>
              <div className="teachers-profile-block"><span>Last Activity</span><strong>{fmt(profileTeacher.lastActivity)}</strong></div>
            </div>
            <div className="teachers-profile-insight"><InsightsRoundedIcon /><p>{profileTeacher.classesAssigned === 0 ? "This teacher has no classes assigned yet." : profileTeacher.activityScore < 55 ? "This teacher needs support to improve class activity and learner engagement." : "This teacher is tracking well based on current branch activity signals."}</p></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
