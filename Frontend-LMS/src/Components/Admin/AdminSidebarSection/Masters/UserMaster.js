  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { Dialog, DialogContent, DialogTitle } from "@mui/material";
  import { BeatLoader } from "react-spinners";
  import {
    BACKEND_BASEURL,
    validateEmail,
    validatePasswordStrength,
    validatePhoneNumber,
  } from "../../../helper.js";
  import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
  import Plus from "../../../../Assets/Images/plus.svg";
  import CourseEdit from "../../../../Assets/Images/courseEdit.svg";
  import Profile from "../../../../Assets/Images/profileImg.svg";
  import "./UserMaster.css";
  import { toast } from "react-toastify";
  import Tooltip from "@mui/material/Tooltip";
  import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
  import Pagination from "@mui/material/Pagination";
  import PaginationItem from "@mui/material/PaginationItem";
  import Stack from "@mui/material/Stack";

  const EMPTY_ROLE = {
    roleMasterId: "",
    roleMasterCode: "",
    roleMasterName: "",
  };

  const TAB_ROLE_MAP = {
    students: "STUDENT",
    teachers: "TEACHER",
    admins: "ADMIN",
  };

  const getStoredJson = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Unable to parse ${key} from local storage`, error);
      return null;
    }
  };

  const normalizeRoleName = (value) => (value || "").trim().toUpperCase();

  const getAssignmentRoleMaster = (roleAssignment) => roleAssignment?.roleMaster || roleAssignment?.role || null;

  const mapRoleMaster = (roleMaster) => ({
    roleMasterId: roleMaster?.roleMasterId || "",
    roleMasterCode: roleMaster?.roleMasterCode || "",
    roleMasterName: roleMaster?.roleMasterName || "",
  });

  const mapOrganization = (organization) => {
    if (!organization?.orgId) {
      return null;
    }

    return {
      orgId: organization.orgId,
    };
  };

  const formatBackendMessage = (message) => {
    if (!message) {
      return "Unable to save user details.";
    }

    return message
      .split("_")
      .filter(Boolean)
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ");
  };

  const normalizeMobileNumber = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

  function UserMaster() {
    const token = localStorage.getItem("token");
    const adminLoginResponse = getStoredJson("AdminLoginResponse");
    const [activeTab, setActiveTab] = useState("students");
    const [searchInput, setSearchInput] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [roleAssignmentId, setRoleAssignmentId] = useState(null);
    const [userName, setUserName] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [branchId, setBranchId] = useState("");
    const [branches, setBranches] = useState([]);
    const [mobileNumber, setMobileNumber] = useState("");
    const [emailID, setEmailID] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("Active");
    const [profileImage, setProfileImage] = useState(Profile);
    const [userImageData, setUserImageData] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [roles, setRoles] = useState([]);
    const [adminDetail, setAdminDetail] = useState(() => getStoredJson("adminDetails"));
    const [userType, setUserType] = useState(EMPTY_ROLE);

    const userDetailsId = adminDetail?.userDetailsId;
    const orgId = adminDetail?.organizationsDB?.orgId;
    const currentRoleName = TAB_ROLE_MAP[activeTab];
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const availableRoles = roles.filter(
      (roleItem) => normalizeRoleName(roleItem.roleMasterName) === currentRoleName
    );

    const getDefaultRoleForTab = () => {
      const defaultRole = availableRoles[0];
      return defaultRole ? mapRoleMaster(defaultRole) : EMPTY_ROLE;
    };

    const fetchUsers = async (roleName, currentPage, size) => {
      setLoading(true);

      try {
        const response = await axios.get(`${BACKEND_BASEURL}/admin/getUserMaster`, {
          ...authHeaders,
          params: {
            role: roleName,
            page: currentPage,
            size,
          },
        });

        if (response.status === 200) {
          setUsers(Array.isArray(response.data.users) ? response.data.users : []);
          setTotalPages(Math.max(response.data.totalPages || 1, 1));
          setRowsPerPage(size);
        }
      } catch (error) {
        console.error("There was an error fetching the users", error);
        setUsers([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (dialogOpen || isEditing || userType.roleMasterId) {
        return;
      }

      setUserType(getDefaultRoleForTab());
    }, [activeTab, availableRoles, dialogOpen, isEditing, userType.roleMasterId]);

    useEffect(() => {
      if (token && !adminDetail && adminLoginResponse?.username) {
        const fetchAdminDetails = async () => {
          try {
            const response = await axios.get(
              `${BACKEND_BASEURL}/admin/fetchUserDetails?email=${encodeURIComponent(adminLoginResponse.username)}`,
              authHeaders
            );

            if (response.status === 200 && response.data) {
              localStorage.setItem("adminDetails", JSON.stringify(response.data));
              setAdminDetail(response.data);
            }
          } catch (error) {
            console.error("Failed to hydrate admin details", error);
          }
        };

        fetchAdminDetails();
      }
    }, [adminDetail, adminLoginResponse?.username, token]);

    useEffect(() => {
      fetchUsers(TAB_ROLE_MAP[activeTab], page - 1, rowsPerPage);
    }, [activeTab, page, rowsPerPage]);

    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchRoleMaster`, authHeaders);
          if (response.status === 200) {
            setRoles(Array.isArray(response.data.data) ? response.data.data : []);
          }
        } catch (error) {
          console.error("Error fetching roles", error);
        }
      };

      fetchRoles();
    }, []);

    useEffect(() => {
      if (!orgId || !userDetailsId) {
        return;
      }

      const fetchBranches = async () => {
        try {
          const response = await axios.get(
            `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${orgId}&userId=${userDetailsId}`,
            authHeaders
          );

          if (response.data.status) {
            setBranches(response.data.data);
          } else {
            console.error("Failed to fetch branches");
          }
        } catch (error) {
          console.error("Error fetching branches", error);
        }
      };

      fetchBranches();
    }, [orgId, userDetailsId]);

    const filteredUsers = users.filter((user) => {
      const fullName = user.fullName || "";
      return fullName.toLowerCase().includes(searchInput.toLowerCase());
    });

    const handleSearchChange = (event) => {
      setSearchInput(event.target.value);
    };

    const resetFields = (nextRole = EMPTY_ROLE) => {
      setUserName("");
      setGender("");
      setDateOfBirth("");
      setUserType(nextRole);
      setRoleAssignmentId(null);
      setBranchId("");
      setMobileNumber("");
      setEmailID("");
      setPassword("");
      setStatus("Active");
      setProfileImage(Profile);
      setUserImageData("");
      setCurrentUserId(null);
      setIsEditing(false);
    };

    const handleOpenDialog = () => {
      resetFields(getDefaultRoleForTab());
      setDialogOpen(true);
    };

    const handleCloseDialog = () => {
      setDialogOpen(false);
      resetFields(getDefaultRoleForTab());
    };

    const handleAddUser = async () => {
      const trimmedUserName = userName.trim();
      const trimmedEmail = emailID.trim().toLowerCase();
      const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
      const editingUserRecord = isEditing
        ? users.find(
            (user) =>
              String(user?.userDetailsId || "") === String(currentUserId || "") ||
              (user?.email || "").trim().toLowerCase() === trimmedEmail
          )
        : null;
      const fallbackRoleAssignment = editingUserRecord?.roles?.find(
        (roleItem) => normalizeRoleName(getAssignmentRoleMaster(roleItem)?.roleMasterName) === currentRoleName
      ) || editingUserRecord?.roles?.[0];
      const resolvedUserId = isEditing ? currentUserId || editingUserRecord?.userDetailsId || null : null;
      const resolvedRoleAssignmentId = roleAssignmentId || fallbackRoleAssignment?.rolesId || null;
      const selectedBranch =
        branches.find((branch) => String(branch.orgId) === String(branchId)) ||
        editingUserRecord?.organizationsDB ||
        null;
      const organizationPayload = mapOrganization(selectedBranch);

      if (!trimmedUserName) {
        toast.error("User name is required.");
        return;
      }

      if (!gender) {
        toast.error("Select gender.");
        return;
      }

      if (!userType.roleMasterId) {
        toast.error("A valid role is required.");
        return;
      }

      if (!organizationPayload) {
        toast.error("Select a valid branch.");
        return;
      }

      if (!validatePhoneNumber(normalizedMobileNumber)) {
        toast.error("Enter Valid Mobile No.");
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        toast.error("Enter Valid Email.");
        return;
      }

      if (isEditing && !resolvedUserId) {
        toast.error("Unable to determine which user should be updated. Reload the list and try again.");
        return;
      }

      if (!isEditing && !validatePasswordStrength(password.trim())) {
        toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
        return;
      }

      if (isEditing && password.trim() && !validatePasswordStrength(password.trim())) {
        toast.error("Updated password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
        return;
      }

      const userData = {
        ...(isEditing ? { userDetailsId: resolvedUserId } : {}),
        fullName: trimmedUserName,
        email: trimmedEmail,
        mobileNo: Number(normalizedMobileNumber),
        gender,
        dob: dateOfBirth ? parseDate(dateOfBirth) : null,
        isActive: status === "Active",
        isEmailVerified: true,
        isMobileVerified: false,
        createdBy: userDetailsId,
        updatedBy: userDetailsId,
        roles: [
          {
            ...(resolvedRoleAssignmentId ? { rolesId: resolvedRoleAssignmentId } : {}),
            role: {
              roleMasterId: userType.roleMasterId,
              roleMasterName: userType.roleMasterName,
              roleMasterCode: userType.roleMasterCode,
            },
          },
        ],
        organizationsDB: organizationPayload,
        userImage: userImageData || null,
      };

      if (password.trim()) {
        userData.userCredentialsDB = {
          username: trimmedEmail,
          password: password.trim(),
        };
      }

      setLoading(true);

      try {
        const response = await axios.patch(
          `${BACKEND_BASEURL}/admin/save-updateUserDetails`,
          userData,
          authHeaders
        );

        if (response.status === 200) {
          toast.success(isEditing ? "User details updated successfully!" : "User created successfully!");
          await fetchUsers(TAB_ROLE_MAP[activeTab], page - 1, rowsPerPage);
          handleCloseDialog();
        }
      } catch (error) {
        console.error(isEditing ? "Error updating user details" : "Error creating user", error);
        console.error("User save error response", error?.response?.data);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.Exception ||
          error?.response?.data?.exception;
        toast.error(
          formatBackendMessage(errorMessage) ||
            (isEditing ? "Error updating user details" : "Error creating user")
        );
      } finally {
        setLoading(false);
      }
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const base64String = e.target.result.split(",")[1];
          setProfileImage(e.target.result);
          setUserImageData(base64String);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleProfileImageClick = () => {
      document.getElementById("profileImageInput").click();
    };

    const handleRemoveImage = () => {
      setProfileImage(Profile);
      setUserImageData("");
    };

    const handleEditUser = (user) => {
      const matchingRole = user?.roles?.find(
        (roleItem) => normalizeRoleName(getAssignmentRoleMaster(roleItem)?.roleMasterName) === currentRoleName
      ) || user?.roles?.[0];

      setIsEditing(true);
      setCurrentUserId(user?.userDetailsId || null);
      setUserName(user.fullName || "");
      setGender(user.gender || "");
      setDateOfBirth(user.dob ? formatDate(new Date(user.dob)) : "");
      setUserType(mapRoleMaster(getAssignmentRoleMaster(matchingRole)));
      setRoleAssignmentId(matchingRole?.rolesId || null);
      setBranchId(user?.organizationsDB?.orgId || "");
      setMobileNumber(normalizeMobileNumber(user.mobileNo));
      setEmailID(user.email || "");
      setStatus(user.isActive ? "Active" : "Inactive");
      setPassword("");
      setDialogOpen(true);
      setProfileImage(user.userImage ? `data:image/jpeg;base64,${user.userImage}` : Profile);
      setUserImageData(user.userImage || "");
    };

    const buildUserPayload = ({
      user,
      nextStatus,
      nextRole,
      nextRoleAssignmentId,
      nextBranch,
    }) => ({
      userDetailsId: user.userDetailsId,
      fullName: (user.fullName || "").trim(),
      email: (user.email || "").trim().toLowerCase(),
      mobileNo: user.mobileNo,
      gender: user.gender || "",
      dob: user.dob || null,
      isActive: nextStatus,
      isEmailVerified: user.isEmailVerified ?? true,
      isMobileVerified: user.isMobileVerified ?? false,
      createdBy: userDetailsId,
      updatedBy: userDetailsId,
      roles: nextRole?.roleMasterId
        ? [
            {
              ...(nextRoleAssignmentId ? { rolesId: nextRoleAssignmentId } : {}),
              role: {
                roleMasterId: nextRole.roleMasterId,
                roleMasterName: nextRole.roleMasterName,
                roleMasterCode: nextRole.roleMasterCode,
              },
            },
          ]
        : [],
      organizationsDB: mapOrganization(nextBranch),
      userImage: user.userImage || null,
    });

    const handleDeleteUser = async (user) => {
      const matchingRole = user?.roles?.find(
        (roleItem) => normalizeRoleName(getAssignmentRoleMaster(roleItem)?.roleMasterName) === currentRoleName
      ) || user?.roles?.[0];
      const selectedBranch = branches.find(
        (branch) => String(branch.orgId) === String(user?.organizationsDB?.orgId)
      ) || user?.organizationsDB || null;

      if (!matchingRole) {
        toast.error("User role is missing. Unable to delete this user.");
        return;
      }

      const shouldDelete = window.confirm(`Delete ${user?.fullName || "this user"}? This will mark the user inactive.`);
      if (!shouldDelete) {
        return;
      }

      setLoading(true);

      try {
        await axios.patch(
          `${BACKEND_BASEURL}/admin/save-updateUserDetails`,
          buildUserPayload({
            user,
            nextStatus: false,
            nextRole: mapRoleMaster(getAssignmentRoleMaster(matchingRole)),
            nextRoleAssignmentId: matchingRole?.rolesId || null,
            nextBranch: selectedBranch,
          }),
          authHeaders
        );

        toast.success("User deleted successfully.");
        await fetchUsers(TAB_ROLE_MAP[activeTab], page - 1, rowsPerPage);
      } catch (error) {
        console.error("Error deleting user", error);
        const errorMessage = error?.response?.data?.message || error?.response?.data?.exception;
        toast.error(errorMessage || "Error deleting user");
      } finally {
        setLoading(false);
      }
    };

    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const renderPaginationItems = (item) => {
      if (totalPages <= 5) {
        return true;
      }

      if (
        item.page === 1 ||
        item.page === totalPages ||
        item.page === page ||
        item.page === page - 1 ||
        item.page === page + 1
      ) {
        return true;
      }

      if ((item.page === page - 2 && page > 3) || (item.page === page + 2 && page < totalPages - 2)) {
        return "ellipsis";
      }

      if ((item.page === 2 && page > 3) || (item.page === totalPages - 1 && page < totalPages - 2)) {
        return "hidden";
      }

      return false;
    };

    const formatDate = (date) => {
      const parsedDate = new Date(date);
      const day = String(parsedDate.getDate()).padStart(2, "0");
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const year = parsedDate.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const parseDate = (dateString) => {
      if (typeof dateString !== "string") {
        console.error("Invalid date format", dateString);
        return "";
      }

      const [day, month, year] = dateString.split("-");
      if (!day || !month || !year) {
        console.error("Date string does not have the expected format", dateString);
        return "";
      }

      return `${year}-${month}-${day}`;
    };

    const handleUserTypeChange = (event) => {
      const selectedRoleId = Number(event.target.value);
      const selectedRole = availableRoles.find((role) => role.roleMasterId === selectedRoleId);
      setUserType(selectedRole ? mapRoleMaster(selectedRole) : EMPTY_ROLE);
    };

    const handleTabChange = (tabName) => {
      setActiveTab(tabName);
      setPage(1);
    };

    return (
      <div className="PageMainContain">
        <div className="userSection">
          <div className="PageHeadlineBar">
            <div className="HeadLineSearchCombo">
              <div className="Headline">Users</div>
              <div className="userSearchBox">
                <input
                  className="userSearchInput"
                  placeholder="Search user"
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                <img src={SearchIcon} alt="Search" />
              </div>
            </div>
            <div className="addButtonDiv" onClick={handleOpenDialog}>
              <img src={Plus} alt="Add" />
              <div className="userButton">New User</div>
            </div>
          </div>
        </div>

        <div className="borderLineBlue"></div>
      
        <div className="userTableContainer">
      
        <div className="tabContainer">
        <div className="tabs">
          <div
            className={`tabButton ${
              activeTab === "students" ? "active" : ""
            }`}
            onClick={() => handleTabChange("students")}
          >
            Students {activeTab === "students" && !loading && `(${users?.length})`}
          </div>
          <div
            className={`tabButton ${
              activeTab === "teachers" ? "active" : ""
            }`}
            onClick={() => handleTabChange("teachers")}
          >
            Teachers {activeTab === "teachers" && !loading && `(${users?.length})`}
          </div>
          <div
            className={`tabButton ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => handleTabChange("admins")}
          >
            Admins {activeTab === "admins" && !loading && `(${users?.length})`}
          </div>
        </div>
        </div>

  {loading ? (
          <div className="loadingContainer">
            <BeatLoader color={"#219EBC"} loading={loading} size={15} />
          </div>
        ) : (
          <div className="courseMainSection">
            <table className="courseTable">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Contacts</th>
                  <th>Branch</th>
                  {/* <th>Allocated Batch</th> */}
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={index}>
                  <td>{user?.fullName}
                  <span style={{display:'flex', width:'fit-content',margin:'0'}} className={`Gender ${user.gender === 'Female' ? 'Female' : ''}`}>
                            {user?.gender}
                          </span>
                  </td>
                  <td>{user?.mobileNo}
                  <span style={{display:'flex', width:'fit-content'}}>{user?.email}</span>
                  </td>
                  <td>{user?.organizationsDB?.orgName || '-'}</td>
                  {/* <td>{user?.batchName || '-'}</td> */}
                    <td
                      style={{
                        color: user?.isActive ? "#16A42D" : "#E72755",
                        fontWeight: "600",
                      }}
                    >
                      {user?.isActive ? 'Active' : 'Inactive'}

                    </td>
                    <td>
                      <div className="userActionsCell">
                        <Tooltip title="Edit User">
                          <img
                            src={CourseEdit}
                            alt="CourseEditIcon"
                            className="userActionIcon"
                            onClick={() => handleEditUser(user)}
                          />
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <DeleteOutlinedIcon
                            className="userDeleteIcon"
                            onClick={() => handleDeleteUser(user)}
                          />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        <div className="PaginationContainer">
          <Stack spacing={2}> 
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              variant="outlined"
              shape="circular"
              renderItem={(item) => {
                const shouldRender = renderPaginationItems(item);

                if (shouldRender === 'ellipsis') {
                  return <PaginationItem key={item.page} {...item} type="start-ellipsis" shape="circular" />;
                }

                if (shouldRender === 'hidden') {
                  return null;
                }

                return (
                  <PaginationItem
                    key={item.page}
                    {...item}
                    sx={{
                      backgroundColor: 'white',  
                      border: '1px solid #EDEDF1',
                      color: '#333333',
                      fontWeight: 600,
                      padding: '10px',
                      '&.Mui-selected': {
                        backgroundColor: '#219EBC',  
                        color: 'white',  
                        border: 'none',  
                        padding: '10px',  
                      },
                      '&:hover': {
                        backgroundColor: 'white',  
                        border: '1px solid #EDEDF1',  
                        color: '#333333', 
                      },
                    }}
                  />
                );
              }}
            />
          </Stack>
        </div>



        <Dialog
          open={dialogOpen}
          
          onClose={(event, reason) => {
            if (reason === "backdropClick") {
              return;
            }
          }}
        >
          <DialogTitle>
            <div className="dialogChapterHeader">
              <span className="CertifyDialogTitleTxt">{isEditing ? "Edit User" : "Create New User"}</span>
              <button className="close-button" onClick={handleCloseDialog}>
                &#x2716;
              </button>
            </div>
            

          </DialogTitle>
          <div
          className="userHeaderHorizontalLine" style={{width:'auto',margin:'0'}}        
        ></div>
          <DialogContent>
            <div className="userHeaderData">
              <div className="adminProfileImgDiv" onClick={handleProfileImageClick}>
              <Tooltip title="Upload user image" arrow>
                <img src={profileImage} alt="Profile" className="adminProfileImage" />
              </Tooltip>
                {Boolean(userImageData) && (
                      <div className="removeImageIcon" onClick={handleRemoveImage}>
                      &#x2716;
                    </div>
                )}
                <input
                  type="file"
                  id="profileImageInput"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </div>
              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  User Name<span className="mandatoryField">*</span>
                </div>
                <input
                  className="courseInputBox"
                  style={{ width: "235px" }}
                  placeholder="User Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Gender<span className="mandatoryField">*</span>
                </div>
                <select
                  className="courseInputBox"
                  style={{ width: "160px" }}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="userContentDetailsFields">

            <div className='courseDetailsField'style={{ width: "173px" }}>
                <div className='inputHeaderText'>Date Of Birth</div>
                <div className='calendarField1'>
                <input
                  type="date"
                  value={dateOfBirth ? parseDate(dateOfBirth) : ""}
                  onChange={(e) => setDateOfBirth(formatDate(e.target.value))}
                  className="calendarinputBox1"
                  max={new Date().toISOString().split("T")[0]} // Disable dates after today
                />
                  {/* <img src={Calendar} alt='calendar' className='calendarImg' onClick={() => document.querySelector('.calendarinputBox').focus()} /> */}
                </div>
              </div>

              <div className="courseDetailsField">
              <div className="inputHeaderText">
                User Type<span className="mandatoryField">*</span>
              </div>
              <select
                className="courseInputBox"
                style={{ width: "173px" }}
                value={userType.roleMasterId || ""}
                onChange={handleUserTypeChange}
                disabled={availableRoles.length <= 1}
              >
                <option value="">Select User Type</option>
                {availableRoles.map((role) => (
                  <option key={role.roleMasterId} value={role.roleMasterId}>
                    {role.roleMasterName}
                  </option>
                ))}
              </select>
            </div>


              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Branch
                </div>
                <select
                  className="courseInputBox"
                  style={{ width: "173px" }}
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  <option value="">Select</option>
                    {branches.map((branch) => (
                      <option key={branch.orgId} value={branch.orgId}>
                        {branch.orgName}
                      </option>
                    ))}
                </select>
              </div>
            
              {/* <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Batch
                </div>
                <select
                  className="courseInputBox"
                  style={{ width: "173px" }}
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                >
                  <option>Select</option>
                  <option>Batch A</option>
                  <option>Batch B</option>
                </select>
              </div> */}
            

            <div className="courseDetailsField">
              <div className="inputHeaderText">
                Mobile Number<span className="mandatoryField">*</span>
              </div>
              <input
                className="courseInputBox"
                style={{ width: "150px" }}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(normalizeMobileNumber(e.target.value))}
              />
            </div>

          


            <div className="courseDetailsField">
              <div className="inputHeaderText">
                Email ID<span className="mandatoryField">*</span>
              </div>
              <input
                className="courseInputBox"
                style={{ width: "150px" }}
                placeholder="Email ID"
                value={emailID}
                onChange={(e) => setEmailID(e.target.value)}
              />
            </div>

            <div className="courseDetailsField">
              <div className="inputHeaderText">
                Password
              </div>
              <input
                className="courseInputBox"
                style={{ width: "150px" }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div
              className="courseDetailsField"
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <div className="inputHeaderText">Status:</div>
              <label className="switch">
              <input
                type="checkbox"
                checked={status === "Active"} // Convert status to boolean for checkbox
                onChange={() => setStatus(status === "Active" ? "Inactive" : "Active")} // Toggle status
              />
                <span className="slider round"></span>
              </label>
              <span className="statusText" style={{ color: status === "Active" ? '#16A42D' : '#E72755' }}>{status === "Active" ? 'Active' : 'Inactive'}</span>
            </div>

          
          </div>
          </DialogContent>
          <div
            className="userHeaderHorizontalLine"
            style={{ width: "auto"}}
          ></div>

          <div className="form-actions" style={{marginBottom:'10px'}}>
            <button className="cancel-button" onClick={() => resetFields(getDefaultRoleForTab())}>
              Clear
            </button>
            <button className="create-button" onClick={handleAddUser} disabled={loading} >
              {isEditing ? "Update User" : "Add User"}
            </button>
          </div>
        </Dialog>
      </div>
    );
  }

  export default UserMaster;
