import React, { useEffect, useMemo, useState } from "react";
import "./ClassesBatchesManagement.css";
import axios from "axios";
import { format, parse, addDays } from "date-fns";
import { toast } from "react-toastify";
import { BACKEND_BASEURL } from "../../helper.js";
import ClassRoundedIcon from "@mui/icons-material/ClassRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
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

const authConfigFactory = (token, params = {}) => ({
  ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  ...(Object.keys(params).length ? { params } : {}),
});

const parseBatchDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "string" && value.includes("T")) return new Date(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value);
  try {
    return parse(value, "dd-MM-yyyy HH:mm", new Date());
  } catch {
    return new Date(value);
  }
};

const fmtDateTime = (value) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateInput = (value) => {
  if (!value) return "";
  try {
    if (typeof value === "string" && value.includes("-") && value.length <= 10) return value;
    return format(parseBatchDate(value), "yyyy-MM-dd");
  } catch {
    return "";
  }
};

const batchStatus = (batch) => {
  const today = new Date();
  const start = parseBatchDate(batch.batchStartDateTime);
  const end = parseBatchDate(batch.batchEndDateTime);
  if (today < start) return "UPCOMING";
  if (today > end) return "COMPLETED";
  return "ONGOING";
};

const inferAcademicYear = (batch) => {
  try {
    const start = parseBatchDate(batch.batchStartDateTime);
    const end = parseBatchDate(batch.batchEndDateTime);
    return `${start.getFullYear()}-${String(end.getFullYear()).slice(-2)}`;
  } catch {
    return `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`;
  }
};

const parseBatchMeta = (description, batchName) => {
  let parsed = null;
  try {
    parsed = description ? JSON.parse(description) : null;
  } catch {
    parsed = null;
  }

  const separator = batchName?.includes(" - ") ? " - " : batchName?.includes(" | ") ? " | " : null;
  const classFromName = separator ? batchName.split(separator)[0] : batchName || "Unclassified";
  const displayBatchName = separator ? batchName.split(separator).slice(1).join(separator).trim() : batchName || "Unnamed Batch";

  return {
    className: parsed?.className || classFromName || "Unclassified",
    academicYear: parsed?.academicYear || "",
    classDescription: parsed?.classDescription || "",
    subjects: parsed?.subjects || [],
    displayBatchName: parsed?.displayBatchName || displayBatchName,
  };
};

const storageKey = (branchId) => `branch_class_blueprints_${branchId}`;
const loadBlueprints = (branchId) => parseJson(storageKey(branchId)) || [];
const saveBlueprints = (branchId, items) => localStorage.setItem(storageKey(branchId), JSON.stringify(items));

const StatCard = ({ icon, label, value, hint }) => (
  <div className="classes-stat">
    <div className="classes-stat-icon">{icon}</div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  </div>
);

const emptyBatchForm = () => ({
  batchId: null,
  className: "",
  batchName: "",
  academicYear: `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`,
  status: "ONGOING",
  batchStartDateTime: toDateInput(new Date()),
  batchEndDateTime: toDateInput(addDays(new Date(), 120)),
  batchCapacity: "99999",
  subjects: [],
  classDescription: "",
});

const emptyClassForm = () => ({
  className: "",
  academicYear: `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`,
  description: "",
  subjects: [],
});

export default function ClassesBatchesManagement() {
  const token = localStorage.getItem("token");
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const [adminDetail, setAdminDetail] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [branchMasterList, setBranchMasterList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState({});
  const [showClassModal, setShowClassModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [classForm, setClassForm] = useState(emptyClassForm());
  const [batchForm, setBatchForm] = useState(emptyBatchForm());
  const [activeBatchContext, setActiveBatchContext] = useState(null);
  const [selectedStudentEmails, setSelectedStudentEmails] = useState([]);
  const [selectedTeacherEmails, setSelectedTeacherEmails] = useState([]);

  const effectiveBranchId =
    userRole === "SUPER_ADMIN"
      ? selectedBranchId
      : adminDetail?.organizationsDB?.orgId || adminDetail?.orgId || "";

  useEffect(() => {
    const details = resolveUser();
    setAdminDetail(details);
    setUserRole(resolveRole(details));
  }, []);

  useEffect(() => {
    const email = adminDetail?.email || adminDetail?.username;
    if (!email || adminDetail?.organizationsDB?.orgId) return;
    axios
      .get(`${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`, authConfigFactory(token))
      .then((res) => {
        if (res.data) {
          setAdminDetail(res.data);
          setUserRole(resolveRole(res.data));
          localStorage.setItem("adminDetails", JSON.stringify(res.data));
        }
      })
      .catch((err) => console.error("fetchUserDetails", err));
  }, [adminDetail?.email, adminDetail?.organizationsDB?.orgId, adminDetail?.username, token]);

  useEffect(() => {
    if (!organizationId || !adminDetail?.userDetailsId) return;
    axios
      .get(
        `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${adminDetail.userDetailsId}`,
        authConfigFactory(token)
      )
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
    if (!effectiveBranchId) return;
    setBlueprints(loadBlueprints(effectiveBranchId));
  }, [effectiveBranchId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!effectiveBranchId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [batchRes, studentRes, teacherRes, subjectRes] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/admin/fetchBatchByOrgId`, authConfigFactory(token, { orgId: effectiveBranchId })),
          axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, authConfigFactory(token, { role: "STUDENT", page: 0, size: 500 })),
          axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, authConfigFactory(token, { role: "TEACHER", page: 0, size: 300 })),
          axios.get(`${BACKEND_BASEURL}/public/getSubjectMaster`, authConfigFactory(token)),
        ]);

        const branchBatches =
          batchRes.data?.allBatches || [
            ...(batchRes.data?.ongoingBatches || []),
            ...(batchRes.data?.upcomingBatches || []),
            ...(batchRes.data?.completedBatches || []),
          ];
        const branchStudents = (studentRes.data?.users || []).filter(
          (item) => String(item?.organizationsDB?.orgId || "") === String(effectiveBranchId)
        );
        const branchTeachers = (teacherRes.data?.users || []).filter(
          (item) => String(item?.organizationsDB?.orgId || "") === String(effectiveBranchId)
        );

        const teacherBatchResults = await Promise.all(
          branchTeachers.map((teacher) =>
            axios
              .get(
                `${BACKEND_BASEURL}/teacher/dashboard/batches`,
                authConfigFactory(token, { teacherId: teacher.userDetailsId })
              )
              .then((res) => ({ teacher, batches: res.data?.batches || [] }))
              .catch(() => ({ teacher, batches: [] }))
          )
        );

        const teacherBatchMap = new Map();
        teacherBatchResults.forEach(({ teacher, batches: teacherBatches }) => {
          teacherBatches.forEach((item) => {
            const batchId = String(item.id || item.batchId);
            const current = teacherBatchMap.get(batchId) || [];
            teacherBatchMap.set(batchId, [...current, teacher]);
          });
        });

        const batchExtraResults = await Promise.all(
          branchBatches.map(async (batch) => {
            const [enrolledRes, coursesRes] = await Promise.all([
              axios
                .get(
                  `${BACKEND_BASEURL}/admin/fetchBatchEnrolledStudents`,
                  authConfigFactory(token, { batchId: batch.batchId })
                )
                .catch(() => ({ data: { enrolledStudents: [] } })),
              axios
                .get(`${BACKEND_BASEURL}/admin/fetchCoursesOfBatch`, authConfigFactory(token, { batchId: batch.batchId }))
                .catch(() => ({ data: { courses: [] } })),
            ]);
            return {
              batchId: batch.batchId,
              enrolledStudents: enrolledRes.data?.enrolledStudents || [],
              linkedCourses: coursesRes.data?.courses || [],
            };
          })
        );

        const extraMap = new Map(batchExtraResults.map((item) => [String(item.batchId), item]));
        const enriched = branchBatches.map((batch) => {
          const meta = parseBatchMeta(batch.batchDescription, batch.batchName);
          const extra = extraMap.get(String(batch.batchId)) || { enrolledStudents: [], linkedCourses: [] };
          const assignedTeachers = teacherBatchMap.get(String(batch.batchId)) || [];
          const courseSubjects = extra.linkedCourses
            .map((course) => course.subjectName || course.materialName)
            .filter(Boolean);
          return {
            ...batch,
            meta,
            className: meta.className,
            displayBatchName: meta.displayBatchName,
            academicYear: meta.academicYear || inferAcademicYear(batch),
            status: batchStatus(batch),
            enrolledStudents: extra.enrolledStudents,
            linkedCourses: extra.linkedCourses,
            assignedTeachers,
            subjectsMapped: [...new Set([...(meta.subjects || []), ...courseSubjects])],
          };
        });

        setBatches(enriched);
        setStudents(branchStudents);
        setTeachers(branchTeachers);
        setSubjects(subjectRes.data?.data || subjectRes.data?.subjectMaster || []);
      } catch (err) {
        console.error("classes page", err);
        toast.error("Unable to load classes and batches for this branch.");
        setBatches([]);
        setStudents([]);
        setTeachers([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveBranchId, token]);

  const classGroups = useMemo(() => {
    const map = new Map();
    blueprints.forEach((blueprint) => {
      const key = `${blueprint.className}__${blueprint.academicYear}`;
      map.set(key, {
        key,
        className: blueprint.className,
        academicYear: blueprint.academicYear,
        description: blueprint.description || "",
        subjects: blueprint.subjects || [],
        batches: [],
        blueprintId: blueprint.id,
      });
    });

    batches.forEach((batch) => {
      const key = `${batch.className}__${batch.academicYear}`;
      const existing = map.get(key) || {
        key,
        className: batch.className,
        academicYear: batch.academicYear,
        description: batch.meta.classDescription || "",
        subjects: batch.subjectsMapped || [],
        batches: [],
        blueprintId: null,
      };
      existing.batches.push(batch);
      existing.description = existing.description || batch.meta.classDescription || "";
      existing.subjects = [...new Set([...(existing.subjects || []), ...(batch.subjectsMapped || [])])];
      map.set(key, existing);
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        totalStudents: item.batches.reduce((sum, batch) => sum + (batch.enrolledStudents?.length || batch.totalEnrolledStudents || 0), 0),
        totalTeachers: item.batches.reduce((sum, batch) => sum + (batch.assignedTeachers?.length || 0), 0),
        batchCount: item.batches.length,
      }))
      .sort((a, b) => a.className.localeCompare(b.className));
  }, [blueprints, batches]);

  const classOptions = ["ALL", ...new Set(classGroups.map((item) => item.className).filter(Boolean))];
  const yearOptions = ["ALL", ...new Set(classGroups.map((item) => item.academicYear).filter(Boolean))];

  const filteredClassGroups = classGroups
    .map((group) => {
      let scopedBatches = [...group.batches];
      if (statusFilter !== "ALL") scopedBatches = scopedBatches.filter((batch) => batch.status === statusFilter);
      const text = searchText.toLowerCase();
      const searchMatch =
        !text ||
        [group.className, group.academicYear, ...scopedBatches.map((batch) => `${batch.displayBatchName} ${batch.batchName}`)]
          .join(" ")
          .toLowerCase()
          .includes(text);
      const classMatch = classFilter === "ALL" || group.className === classFilter;
      const yearMatch = yearFilter === "ALL" || group.academicYear === yearFilter;
      return searchMatch && classMatch && yearMatch ? { ...group, batches: scopedBatches } : null;
    })
    .filter((item) => item && (item.batches.length || item.blueprintId));

  const totalClasses = classGroups.length;
  const totalBatches = batches.length;
  const activeBatches = batches.filter((batch) => batch.status === "ONGOING").length;
  const studentsAssigned = batches.reduce((sum, batch) => sum + (batch.enrolledStudents?.length || 0), 0);
  const teachersAssigned = batches.reduce((sum, batch) => sum + (batch.assignedTeachers?.length || 0), 0);

  const resetClassModal = () => {
    setEditingClass(null);
    setClassForm(emptyClassForm());
    setShowClassModal(false);
  };

  const resetBatchModal = () => {
    setEditingBatch(null);
    setBatchForm(emptyBatchForm());
    setShowBatchModal(false);
  };

  const openCreateClass = () => {
    setEditingClass(null);
    setClassForm(emptyClassForm());
    setShowClassModal(true);
  };

  const openEditClass = (group) => {
    setEditingClass(group);
    setClassForm({
      className: group.className,
      academicYear: group.academicYear,
      description: group.description || "",
      subjects: group.subjects || [],
    });
    setShowClassModal(true);
  };

  const saveClass = async () => {
    if (!effectiveBranchId) return;
    if (!classForm.className.trim()) return toast.error("Class name is required.");
    if (!classForm.academicYear.trim()) return toast.error("Academic year is required.");

    if (editingClass?.batches?.length) {
      try {
        await Promise.all(
          editingClass.batches.map((batch) =>
            axios.post(
              `${BACKEND_BASEURL}/admin/saveOrUpdateBatches`,
              {
                batchId: batch.batchId,
                batchName: `${classForm.className.trim()} - ${batch.displayBatchName}`,
                batchCapacity: Number(batch.batchCapacity || 99999),
                batchStartDateTime: format(parseBatchDate(batch.batchStartDateTime), "dd-MM-yyyy HH:mm"),
                batchEndDateTime: format(parseBatchDate(batch.batchEndDateTime), "dd-MM-yyyy HH:mm"),
                isActive: batch.isActive,
                branchId: Number(effectiveBranchId),
                batchDescription: JSON.stringify({
                  className: classForm.className.trim(),
                  academicYear: classForm.academicYear.trim(),
                  classDescription: classForm.description.trim(),
                  subjects: classForm.subjects,
                  displayBatchName: batch.displayBatchName,
                }),
              },
              authConfigFactory(token)
            )
          )
        );
      } catch (err) {
        console.error("save class update", err);
        return toast.error("Unable to update class metadata.");
      }
    }

    const currentBlueprints = loadBlueprints(effectiveBranchId);
    const nextBlueprints = [
      ...currentBlueprints.filter((item) => item.id !== editingClass?.blueprintId),
      {
        id: editingClass?.blueprintId || `${Date.now()}`,
        className: classForm.className.trim(),
        academicYear: classForm.academicYear.trim(),
        description: classForm.description.trim(),
        subjects: classForm.subjects,
      },
    ];
    saveBlueprints(effectiveBranchId, nextBlueprints);
    setBlueprints(nextBlueprints);
    setShowClassModal(false);
    toast.success(editingClass ? "Class updated successfully." : "Class created successfully.");
    setTimeout(() => window.dispatchEvent(new Event("storage")), 50);
  };

  const deleteClass = (group) => {
    if (group.batches.length) {
      toast.error("This class has live batches. Edit the class or archive batches instead.");
      return;
    }
    const next = blueprints.filter((item) => item.id !== group.blueprintId);
    saveBlueprints(effectiveBranchId, next);
    setBlueprints(next);
    toast.success("Class removed.");
  };

  const openCreateBatch = (group = null) => {
    setEditingBatch(null);
    setBatchForm({
      ...emptyBatchForm(),
      className: group?.className || classGroups[0]?.className || "",
      academicYear: group?.academicYear || emptyBatchForm().academicYear,
      subjects: group?.subjects || [],
      classDescription: group?.description || "",
    });
    setShowBatchModal(true);
  };

  const openEditBatch = (batch) => {
    setEditingBatch(batch);
    setBatchForm({
      batchId: batch.batchId,
      className: batch.className,
      batchName: batch.displayBatchName,
      academicYear: batch.academicYear,
      status: batch.status,
      batchStartDateTime: toDateInput(batch.batchStartDateTime),
      batchEndDateTime: toDateInput(batch.batchEndDateTime),
      batchCapacity: `${batch.batchCapacity || 99999}`,
      subjects: batch.subjectsMapped || [],
      classDescription: batch.meta.classDescription || "",
    });
    setShowBatchModal(true);
  };

  const saveBatch = async () => {
    if (!effectiveBranchId) return;
    if (!batchForm.className.trim()) return toast.error("Select or create a class for this batch.");
    if (!batchForm.batchName.trim()) return toast.error("Batch name is required.");
    if (!batchForm.batchStartDateTime || !batchForm.batchEndDateTime) return toast.error("Start and end dates are required.");

    const payload = {
      ...(editingBatch?.batchId ? { batchId: editingBatch.batchId } : {}),
      batchName: `${batchForm.className.trim()} - ${batchForm.batchName.trim()}`,
      batchCapacity: Number(batchForm.batchCapacity || 99999),
      batchStartDateTime: format(new Date(batchForm.batchStartDateTime), "dd-MM-yyyy HH:mm"),
      batchEndDateTime: format(new Date(batchForm.batchEndDateTime), "dd-MM-yyyy HH:mm"),
      isActive: true,
      branchId: Number(effectiveBranchId),
      batchDescription: JSON.stringify({
        className: batchForm.className.trim(),
        academicYear: batchForm.academicYear.trim(),
        classDescription: batchForm.classDescription.trim(),
        subjects: batchForm.subjects,
        displayBatchName: batchForm.batchName.trim(),
      }),
    };

    try {
      await axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateBatches`, payload, authConfigFactory(token));
      toast.success(editingBatch ? "Batch updated successfully." : "Batch created successfully.");
      resetBatchModal();
      setLoading(true);
      window.dispatchEvent(new Event("profileUpdate"));
      setSelectedBranchId((value) => `${value}`);
    } catch (err) {
      console.error("save batch", err);
      toast.error("Unable to save batch.");
    } finally {
      setLoading(false);
    }
  };

  const openStudentAssignment = (batch) => {
    setActiveBatchContext(batch);
    setSelectedStudentEmails((batch.enrolledStudents || []).map((student) => student.email));
    setShowStudentModal(true);
  };

  const saveStudentAssignments = async () => {
    if (!activeBatchContext) return;
    const currentEmails = new Set((activeBatchContext.enrolledStudents || []).map((student) => student.email));
    const toAdd = selectedStudentEmails.filter((email) => !currentEmails.has(email));
    const toRemove = [...currentEmails].filter((email) => !selectedStudentEmails.includes(email));

    try {
      if (toAdd.length) {
        await axios.post(
          `${BACKEND_BASEURL}/admin/enrollStudentToBatch`,
          { userName: toAdd, batchId: activeBatchContext.batchId },
          authConfigFactory(token)
        );
      }
      if (toRemove.length) {
        await Promise.all(
          toRemove.map((email) => {
            const student = activeBatchContext.enrolledStudents.find((item) => item.email === email);
            return student
              ? axios.post(
                  `${BACKEND_BASEURL}/admin/removeStudentFromBatch?studentId=${student.userDetailsId}&batchId=${activeBatchContext.batchId}`,
                  {},
                  authConfigFactory(token)
                )
              : Promise.resolve();
          })
        );
      }
      toast.success("Student assignments updated.");
      setShowStudentModal(false);
      setSelectedBranchId((value) => `${value}`);
    } catch (err) {
      console.error("save student assignments", err);
      toast.error("Unable to update student assignments.");
    }
  };

  const openTeacherAssignment = (batch) => {
    setActiveBatchContext(batch);
    setSelectedTeacherEmails((batch.assignedTeachers || []).map((teacher) => teacher.email));
    setShowTeacherModal(true);
  };

  const saveTeacherAssignments = async () => {
    if (!activeBatchContext) return;
    const currentEmails = new Set((activeBatchContext.assignedTeachers || []).map((teacher) => teacher.email));
    const toAdd = selectedTeacherEmails.filter((email) => !currentEmails.has(email));
    if (!toAdd.length) {
      toast.info("No new teacher assignment selected.");
      setShowTeacherModal(false);
      return;
    }

    try {
      await axios.post(
        `${BACKEND_BASEURL}/admin/enrollTutorToBatch`,
        { userName: toAdd, batchId: activeBatchContext.batchId },
        authConfigFactory(token)
      );
      toast.success("Teachers assigned to batch.");
      setShowTeacherModal(false);
      setSelectedBranchId((value) => `${value}`);
    } catch (err) {
      console.error("save teacher assignments", err);
      toast.error("Unable to assign teachers. Existing teacher removal is not supported by the current API.");
    }
  };

  const toggleExpand = (key) => {
    setExpandedClasses((current) => ({ ...current, [key]: !current[key] }));
  };

  const branchName =
    branchMasterList.find((item) => String(item.orgId) === String(effectiveBranchId))?.orgName ||
    adminDetail?.organizationsDB?.orgName ||
    "Current Branch";

  return (
    <div className="classes-page">
      <section className="classes-hero">
        <div>
          <div className="classes-badge">Classes & Batches</div>
          <h1>Classes & Batches</h1>
          <p>Manage classes, batches, students, teachers, and subject mapping for your school branch only.</p>
        </div>
        <div className="classes-toolbar">
          {userRole === "SUPER_ADMIN" ? (
            <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}>
              {branchMasterList.map((branch) => (
                <option key={branch.orgId} value={branch.orgId}>
                  {branch.orgName}
                </option>
              ))}
            </select>
          ) : (
            <div className="classes-branch-chip">{branchName}</div>
          )}
          <button type="button" className="classes-primary-btn" onClick={openCreateClass}>
            <AddRoundedIcon /> Create Class
          </button>
          <button type="button" className="classes-primary-btn light" onClick={() => openCreateBatch()}>
            <AddRoundedIcon /> Create Batch
          </button>
        </div>
      </section>

      <section className="classes-filters">
        <div className="classes-search">
          <SearchRoundedIcon />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by class or batch name"
          />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="ALL">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
          {classOptions.map((option) => (
            <option key={option} value={option}>
              {option === "ALL" ? "All Classes" : option}
            </option>
          ))}
        </select>
        <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option === "ALL" ? "All Academic Years" : option}
            </option>
          ))}
        </select>
      </section>

      <section className="classes-stats">
        <StatCard icon={<ClassRoundedIcon />} label="Total Classes" value={loading ? "..." : totalClasses} hint="In this branch" />
        <StatCard icon={<LayersRoundedIcon />} label="Total Batches" value={loading ? "..." : totalBatches} hint="Across all classes" />
        <StatCard icon={<CheckCircleRoundedIcon />} label="Active Batches" value={loading ? "..." : activeBatches} hint="Currently ongoing" />
        <StatCard icon={<GroupsRoundedIcon />} label="Students Assigned" value={loading ? "..." : studentsAssigned} hint="Batch enrollments" />
        <StatCard icon={<SchoolRoundedIcon />} label="Teachers Assigned" value={loading ? "..." : teachersAssigned} hint="Additive teacher mapping" />
      </section>

      <section className="classes-grid">
        <section className="classes-list-card">
          <div className="classes-card-head">
            <div>
              <h3>Class Structure</h3>
              <p>Expandable class hierarchy with batch-level assignments and subject mapping.</p>
            </div>
            <div className="classes-chip">{filteredClassGroups.length} classes visible</div>
          </div>

          <div className="classes-list">
            {filteredClassGroups.map((group) => {
              const expanded = expandedClasses[group.key] ?? true;
              return (
                <article key={group.key} className="classes-class-card">
                  <div className="classes-class-head">
                    <button type="button" className="classes-expand-btn" onClick={() => toggleExpand(group.key)}>
                      {expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    </button>
                    <div className="classes-class-main">
                      <div>
                        <h4>{group.className}</h4>
                        <p>{group.academicYear} • {group.description || "Academic structure and sections managed for this school."}</p>
                      </div>
                      <div className="classes-mini-stats">
                        <span>{group.batchCount} Batches</span>
                        <span>{group.totalStudents} Students</span>
                        <span>{group.totalTeachers} Teachers</span>
                        <span>{group.subjects.length} Subjects</span>
                      </div>
                    </div>
                    <div className="classes-row-actions">
                      <button type="button" title="View Details" onClick={() => setDetailTarget({ type: "class", data: group })}>
                        <VisibilityRoundedIcon />
                      </button>
                      <button type="button" title="Edit Class" onClick={() => openEditClass(group)}>
                        <EditRoundedIcon />
                      </button>
                      <button type="button" title="Delete Class" onClick={() => deleteClass(group)}>
                        <DeleteOutlineRoundedIcon />
                      </button>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="classes-batches">
                      {group.batches.length ? (
                        group.batches.map((batch) => (
                          <div key={batch.batchId} className="classes-batch-row">
                            <div className="classes-batch-main">
                              <strong>{batch.displayBatchName}</strong>
                              <div className="classes-batch-meta">
                                <span className={`classes-status ${batch.status.toLowerCase()}`}>{batch.status}</span>
                                <span>{batch.assignedTeachers?.length || 0} Teachers</span>
                                <span>{batch.enrolledStudents?.length || 0} Students</span>
                                <span>{batch.subjectsMapped?.length || 0} Subjects</span>
                                <span>{fmtDateTime(batch.batchStartDateTime)} to {fmtDateTime(batch.batchEndDateTime)}</span>
                              </div>
                              <div className="classes-pill-row">
                                {(batch.subjectsMapped || []).slice(0, 4).map((subject) => (
                                  <span key={`${batch.batchId}-${subject}`} className="classes-pill">
                                    {subject}
                                  </span>
                                ))}
                                {batch.subjectsMapped?.length > 4 ? <span className="classes-pill muted">+{batch.subjectsMapped.length - 4} more</span> : null}
                              </div>
                            </div>
                            <div className="classes-row-actions">
                              <button type="button" title="View Batch Details" onClick={() => setDetailTarget({ type: "batch", data: batch })}>
                                <VisibilityRoundedIcon />
                              </button>
                              <button type="button" title="Edit Batch" onClick={() => openEditBatch(batch)}>
                                <EditRoundedIcon />
                              </button>
                              <button type="button" title="Assign Students" onClick={() => openStudentAssignment(batch)}>
                                <PeopleAltRoundedIcon />
                              </button>
                              <button type="button" title="Assign Teachers" onClick={() => openTeacherAssignment(batch)}>
                                <PersonAddAlt1RoundedIcon />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="classes-empty-state">
                          No batches created yet for this class. Create a batch to start assigning students and teachers.
                        </div>
                      )}

                      <button type="button" className="classes-inline-add" onClick={() => openCreateBatch(group)}>
                        <AddRoundedIcon /> Create Batch Under {group.className}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}

            {!filteredClassGroups.length ? (
              <div className="classes-empty-state">
                {loading ? "Loading branch structure..." : "No classes or batches found for the selected filters."}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="classes-side-panel">
          <div className="classes-side-card">
            <h3>Branch Notes</h3>
            <div className="classes-info-list">
              <div><strong>Role Scope</strong><span>All actions stay limited to the selected school branch.</span></div>
              <div><strong>Teacher Assignment</strong><span>Teachers can be added to batches; the current API does not expose direct unassign support.</span></div>
              <div><strong>Subject Mapping</strong><span>Subjects are stored at batch metadata level and combined with linked course subjects.</span></div>
            </div>
          </div>

          <div className="classes-side-card warning">
            <h3>Attention Needed</h3>
            <div className="classes-alert-row">
              <WarningAmberRoundedIcon />
              <p>{batches.filter((batch) => !batch.assignedTeachers?.length).length} batches do not have any teacher assigned.</p>
            </div>
            <div className="classes-alert-row">
              <WarningAmberRoundedIcon />
              <p>{batches.filter((batch) => !batch.enrolledStudents?.length).length} batches have no students enrolled yet.</p>
            </div>
            <div className="classes-alert-row">
              <WarningAmberRoundedIcon />
              <p>{batches.filter((batch) => !batch.subjectsMapped?.length).length} batches need subject mapping.</p>
            </div>
          </div>
        </aside>
      </section>

      {showClassModal ? (
        <div className="classes-modal-backdrop">
          <div className="classes-modal">
            <div className="classes-modal-head">
              <h3>{editingClass ? "Edit Class" : "Create Class"}</h3>
              <button type="button" onClick={resetClassModal}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="classes-form-grid">
              <label>
                <span>Class Name</span>
                <input value={classForm.className} onChange={(event) => setClassForm((current) => ({ ...current, className: event.target.value }))} />
              </label>
              <label>
                <span>Academic Year</span>
                <input value={classForm.academicYear} onChange={(event) => setClassForm((current) => ({ ...current, academicYear: event.target.value }))} />
              </label>
              <label className="span-2">
                <span>Description</span>
                <textarea value={classForm.description} onChange={(event) => setClassForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <label className="span-2">
                <span>Subjects</span>
                <div className="classes-check-grid">
                  {subjects.map((subject) => {
                    const value = subject.subjectName;
                    const checked = classForm.subjects.includes(value);
                    return (
                      <label key={value} className="classes-check-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setClassForm((current) => ({
                              ...current,
                              subjects: checked ? current.subjects.filter((item) => item !== value) : [...current.subjects, value],
                            }))
                          }
                        />
                        <span>{value}</span>
                      </label>
                    );
                  })}
                </div>
              </label>
            </div>
            <div className="classes-modal-actions">
              <button type="button" className="ghost" onClick={resetClassModal}>Cancel</button>
              <button type="button" className="primary" onClick={saveClass}>{editingClass ? "Save Class" : "Create Class"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {showBatchModal ? (
        <div className="classes-modal-backdrop">
          <div className="classes-modal classes-modal-wide">
            <div className="classes-modal-head">
              <h3>{editingBatch ? "Edit Batch" : "Create Batch"}</h3>
              <button type="button" onClick={resetBatchModal}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="classes-form-grid">
              <label>
                <span>Class</span>
                <input value={batchForm.className} onChange={(event) => setBatchForm((current) => ({ ...current, className: event.target.value }))} list="classes-list" />
                <datalist id="classes-list">
                  {classGroups.map((group) => (
                    <option key={group.key} value={group.className} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>Batch Name</span>
                <input value={batchForm.batchName} onChange={(event) => setBatchForm((current) => ({ ...current, batchName: event.target.value }))} />
              </label>
              <label>
                <span>Status</span>
                <select value={batchForm.status} onChange={(event) => setBatchForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
              <label>
                <span>Academic Year</span>
                <input value={batchForm.academicYear} onChange={(event) => setBatchForm((current) => ({ ...current, academicYear: event.target.value }))} />
              </label>
              <label>
                <span>Start Date</span>
                <input type="date" value={batchForm.batchStartDateTime} onChange={(event) => setBatchForm((current) => ({ ...current, batchStartDateTime: event.target.value }))} />
              </label>
              <label>
                <span>End Date</span>
                <input type="date" value={batchForm.batchEndDateTime} onChange={(event) => setBatchForm((current) => ({ ...current, batchEndDateTime: event.target.value }))} />
              </label>
              <label>
                <span>Student Capacity</span>
                <input value={batchForm.batchCapacity} onChange={(event) => setBatchForm((current) => ({ ...current, batchCapacity: event.target.value.replace(/\D/g, "") || "0" }))} />
              </label>
              <label className="span-2">
                <span>Class / Batch Notes</span>
                <textarea value={batchForm.classDescription} onChange={(event) => setBatchForm((current) => ({ ...current, classDescription: event.target.value }))} />
              </label>
              <label className="span-2">
                <span>Subjects</span>
                <div className="classes-check-grid">
                  {subjects.map((subject) => {
                    const value = subject.subjectName;
                    const checked = batchForm.subjects.includes(value);
                    return (
                      <label key={value} className="classes-check-row">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setBatchForm((current) => ({
                              ...current,
                              subjects: checked ? current.subjects.filter((item) => item !== value) : [...current.subjects, value],
                            }))
                          }
                        />
                        <span>{value}</span>
                      </label>
                    );
                  })}
                </div>
              </label>
            </div>
            <div className="classes-modal-actions">
              <button type="button" className="ghost" onClick={resetBatchModal}>Cancel</button>
              <button type="button" className="primary" onClick={saveBatch}>{editingBatch ? "Save Batch" : "Create Batch"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {showStudentModal && activeBatchContext ? (
        <div className="classes-modal-backdrop">
          <div className="classes-modal classes-modal-wide">
            <div className="classes-modal-head">
              <h3>Assign Students to {activeBatchContext.displayBatchName}</h3>
              <button type="button" onClick={() => setShowStudentModal(false)}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="classes-assignment-list">
              {students.map((student) => (
                <label key={student.userDetailsId} className="classes-assignment-row">
                  <input
                    type="checkbox"
                    checked={selectedStudentEmails.includes(student.email)}
                    onChange={() =>
                      setSelectedStudentEmails((current) =>
                        current.includes(student.email)
                          ? current.filter((item) => item !== student.email)
                          : [...current, student.email]
                      )
                    }
                  />
                  <div>
                    <strong>{student.fullName}</strong>
                    <span>{student.email}</span>
                  </div>
                  <small>{student.batchName || "Unassigned"}</small>
                </label>
              ))}
            </div>
            <div className="classes-modal-actions">
              <button type="button" className="ghost" onClick={() => setShowStudentModal(false)}>Close</button>
              <button type="button" className="primary" onClick={saveStudentAssignments}>Save Student Assignments</button>
            </div>
          </div>
        </div>
      ) : null}

      {showTeacherModal && activeBatchContext ? (
        <div className="classes-modal-backdrop">
          <div className="classes-modal classes-modal-wide">
            <div className="classes-modal-head">
              <h3>Assign Teachers to {activeBatchContext.displayBatchName}</h3>
              <button type="button" onClick={() => setShowTeacherModal(false)}>
                <CloseRoundedIcon />
              </button>
            </div>
            <div className="classes-note-banner">
              Teacher assignment currently supports adding teachers to a batch. Direct unassign is not available from the current backend API.
            </div>
            <div className="classes-assignment-list">
              {teachers.map((teacher) => (
                <label key={teacher.userDetailsId} className="classes-assignment-row">
                  <input
                    type="checkbox"
                    checked={selectedTeacherEmails.includes(teacher.email)}
                    onChange={() =>
                      setSelectedTeacherEmails((current) =>
                        current.includes(teacher.email)
                          ? current.filter((item) => item !== teacher.email)
                          : [...current, teacher.email]
                      )
                    }
                  />
                  <div>
                    <strong>{teacher.fullName}</strong>
                    <span>{teacher.email}</span>
                  </div>
                  <small>{selectedTeacherEmails.includes(teacher.email) ? "Selected" : "Available"}</small>
                </label>
              ))}
            </div>
            <div className="classes-modal-actions">
              <button type="button" className="ghost" onClick={() => setShowTeacherModal(false)}>Close</button>
              <button type="button" className="primary" onClick={saveTeacherAssignments}>Assign Teachers</button>
            </div>
          </div>
        </div>
      ) : null}

      {detailTarget ? (
        <div className="classes-modal-backdrop">
          <div className="classes-modal classes-modal-wide">
            <div className="classes-modal-head">
              <h3>{detailTarget.type === "class" ? detailTarget.data.className : `${detailTarget.data.className} • ${detailTarget.data.displayBatchName}`}</h3>
              <button type="button" onClick={() => setDetailTarget(null)}>
                <CloseRoundedIcon />
              </button>
            </div>
            {detailTarget.type === "class" ? (
              <div className="classes-detail-grid">
                <div className="classes-detail-block"><span>Academic Year</span><strong>{detailTarget.data.academicYear}</strong></div>
                <div className="classes-detail-block"><span>Total Batches</span><strong>{detailTarget.data.batchCount}</strong></div>
                <div className="classes-detail-block"><span>Total Students</span><strong>{detailTarget.data.totalStudents}</strong></div>
                <div className="classes-detail-block"><span>Assigned Teachers</span><strong>{detailTarget.data.totalTeachers}</strong></div>
                <div className="classes-detail-block span-2"><span>Subjects Mapped</span><strong>{detailTarget.data.subjects.join(", ") || "No subject mapping yet"}</strong></div>
                <div className="classes-detail-block span-2"><span>Description</span><strong>{detailTarget.data.description || "No class description added yet."}</strong></div>
              </div>
            ) : (
              <div className="classes-detail-grid">
                <div className="classes-detail-block"><span>Status</span><strong>{detailTarget.data.status}</strong></div>
                <div className="classes-detail-block"><span>Students</span><strong>{detailTarget.data.enrolledStudents?.length || 0}</strong></div>
                <div className="classes-detail-block"><span>Teachers</span><strong>{detailTarget.data.assignedTeachers?.length || 0}</strong></div>
                <div className="classes-detail-block"><span>Courses Linked</span><strong>{detailTarget.data.linkedCourses?.length || 0}</strong></div>
                <div className="classes-detail-block span-2"><span>Subjects</span><strong>{detailTarget.data.subjectsMapped?.join(", ") || "No subject mapping yet"}</strong></div>
                <div className="classes-detail-block span-2"><span>Teachers Assigned</span><strong>{detailTarget.data.assignedTeachers?.map((teacher) => teacher.fullName).join(", ") || "No teachers assigned yet"}</strong></div>
                <div className="classes-detail-block span-2"><span>Students Assigned</span><strong>{detailTarget.data.enrolledStudents?.map((student) => student.fullName).join(", ") || "No students assigned yet"}</strong></div>
                <div className="classes-detail-block span-2"><span>Courses Linked</span><strong>{detailTarget.data.linkedCourses?.map((course) => course.materialName).join(", ") || "No courses linked yet"}</strong></div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
