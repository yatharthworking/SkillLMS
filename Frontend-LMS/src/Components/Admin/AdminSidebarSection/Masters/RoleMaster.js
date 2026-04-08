import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "../Masters/RoleMaster.css";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../../helper.js";
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Action from "../../../../Assets/Images/Edit.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import { ToastContainer, toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const EMPTY_ROLE_FORM = {
    roleMasterId: null,
    roleMasterName: "",
    roleMasterCode: "",
};

const SYSTEM_ROLE_NAMES = new Set(["ADMIN", "SUPER_ADMIN", "TEACHER", "STUDENT"]);

const normalizeRoleValue = (value) =>
    String(value || "")
        .trim()
        .toUpperCase();

const generateRoleCode = (roleName) => {
    const normalizedName = normalizeRoleValue(roleName)
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

    return normalizedName ? `${normalizedName}_MASTER_ROLE_1` : "";
};

const formatBackendMessage = (message) => {
    if (!message) {
        return "Unable to save role.";
    }

    return String(message)
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ");
};

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function RoleMaster() {
    const token = localStorage.getItem("token");
    const adminDetails = getFromLocalStorageSafe("adminDetails");
    const adminLoginResponse = getFromLocalStorageSafe("AdminLoginResponse");
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasManualCodeEdit, setHasManualCodeEdit] = useState(false);
    const [roleData, setRoleData] = useState(EMPTY_ROLE_FORM);

    const currentUserName = adminLoginResponse?.username || adminDetails?.email || "";
    const isProtectedRole = SYSTEM_ROLE_NAMES.has(normalizeRoleValue(roleData.roleMasterName));

    const fetchRoles = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchRoleMaster`, authHeaders);
            setRoles(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch (error) {
            setRoles([]);
            toast.error("Failed to fetch roles.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleActionClick = (event, role) => {
        setSelectedRole(role);
        setMenuAnchor(event.currentTarget);
    };

    const resetDialog = () => {
        setRoleData(EMPTY_ROLE_FORM);
        setIsEditing(false);
        setHasManualCodeEdit(false);
        setSelectedRole(null);
    };

    const handleOpenRoleDialog = () => {
        resetDialog();
        setRoleDialogOpen(true);
    };

    const handleCloseRoleDialog = () => {
        setRoleDialogOpen(false);
        resetDialog();
    };

    const handleEditRole = () => {
        if (!selectedRole) {
            return;
        }

        setRoleData({
            roleMasterId: selectedRole.roleMasterId,
            roleMasterName: selectedRole.roleMasterName || "",
            roleMasterCode: selectedRole.roleMasterCode || "",
        });
        setIsEditing(true);
        setHasManualCodeEdit(Boolean(selectedRole.roleMasterCode));
        setRoleDialogOpen(true);
        handleMenuClose();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        if (name === "roleMasterName") {
            setRoleData((previousRoleData) => ({
                ...previousRoleData,
                roleMasterName: value,
                roleMasterCode: hasManualCodeEdit ? previousRoleData.roleMasterCode : generateRoleCode(value),
            }));
            return;
        }

        if (name === "roleMasterCode") {
            setHasManualCodeEdit(true);
            setRoleData((previousRoleData) => ({
                ...previousRoleData,
                roleMasterCode: value.toUpperCase(),
            }));
            return;
        }

        setRoleData((previousRoleData) => ({
            ...previousRoleData,
            [name]: value,
        }));
    };

    const handleSaveRole = async () => {
        if (!roleData.roleMasterName.trim()) {
            toast.error("Role name is required.");
            return;
        }

        if (!currentUserName) {
            toast.error("Unable to resolve current admin details.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                roleMasterId: roleData.roleMasterId,
                roleMasterName: roleData.roleMasterName,
                roleMasterCode: roleData.roleMasterCode,
                userName: currentUserName,
            };

            const response = await axios.post(
                `${BACKEND_BASEURL}/admin/saveOrUpdateRoleMaster`,
                payload,
                authHeaders
            );

            if (response.status === 200) {
                toast.success(isEditing ? "Role updated successfully." : "Role created successfully.");
                handleCloseRoleDialog();
                fetchRoles();
            }
        } catch (error) {
            toast.error(formatBackendMessage(error.response?.data?.message));
        } finally {
            setSaving(false);
        }
    };

    const filteredRoles = roles.filter((role) => {
        const searchableValue = `${role?.roleMasterName || ""} ${role?.roleMasterCode || ""}`.toLowerCase();
        return searchableValue.includes(searchInput.toLowerCase());
    });

    return (
        <div className="PageMainContain">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="userSection">
                <div className="PageHeadlineBar">
                    <div className="HeadLineSearchCombo">
                        <div className="Headline">Roles</div>
                        <div className="userSearchBox">
                            <input
                                className="userSearchInput"
                                placeholder="Search roles"
                                value={searchInput}
                                onChange={handleSearchChange}
                            />
                            <img src={SearchIcon} alt="Search" />
                        </div>
                    </div>
                    <div className="addButtonDiv" onClick={handleOpenRoleDialog}>
                        <img src={Plus} alt="Add" />
                        <div className="userButton">New Role</div>
                    </div>
                </div>
            </div>

            <div className="borderLineBlue"></div>

            <div style={{ height: "72vh", overflowY: "auto" }} className="TableWhiteContainer">
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <table className="Table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Code</th>
                                <th>Users</th>
                                <th>Updated</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length ? (
                                filteredRoles.map((role) => {
                                    const protectedRole = SYSTEM_ROLE_NAMES.has(normalizeRoleValue(role?.roleMasterName));

                                    return (
                                        <tr key={role.roleMasterId}>
                                            <td>{role.roleMasterName || "-"}</td>
                                            <td>{role.roleMasterCode || "-"}</td>
                                            <td>{role.userCount ?? 0}</td>
                                            <td>{formatDateTime(role.updationTimeStamp || role.creationTimeStamp)}</td>
                                            <td>
                                                <img
                                                    src={Action}
                                                    alt="Action"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(event) => handleActionClick(event, role)}
                                                />
                                                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor) && selectedRole?.roleMasterId === role.roleMasterId} onClose={handleMenuClose}>
                                                    <MenuItem className="MenuItem" onClick={handleEditRole}>
                                                        <EditOutlinedIcon fontSize="small" style={{ marginRight: "8px" }} />
                                                        {protectedRole ? "View" : "Edit"}
                                                    </MenuItem>
                                                </Menu>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#6B7280" }}>
                                        No roles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog open={roleDialogOpen} onClose={handleCloseRoleDialog}>
                <DialogTitle>
                    <div className="dialogChapterHeader">
                        <span className="CertifyDialogTitleTxt">
                            {isEditing ? (isProtectedRole ? "View Role" : "Edit Role") : "Create New Role"}
                        </span>
                        <button className="close-button" onClick={handleCloseRoleDialog}>
                            &#x2716;
                        </button>
                    </div>
                    <div className="userHeaderHorizontalLine"></div>
                </DialogTitle>

                <DialogContent>
                    <div className="roleDialogContent">
                        <div className="roleDialogRow">
                            <div className="roleDialogNameBox">
                                <div className="roleDialogLabel">
                                    Role Name<span className="mandatory">*</span>
                                </div>
                                <input
                                    className="roleDialogInput"
                                    placeholder="Role Name"
                                    name="roleMasterName"
                                    value={roleData.roleMasterName}
                                    onChange={handleInputChange}
                                    disabled={isEditing && isProtectedRole}
                                />
                            </div>

                            <div className="roleDialogNameBox">
                                <div className="roleDialogLabel">Role Code</div>
                                <input
                                    className="roleDialogInput"
                                    placeholder="ROLE_MASTER_CODE"
                                    name="roleMasterCode"
                                    value={roleData.roleMasterCode}
                                    onChange={handleInputChange}
                                    disabled={isEditing && isProtectedRole}
                                />
                            </div>
                        </div>

                        <div className="roleDialogRow">
                            <div className="roleDialogDescBox">
                                <div className="roleDialogLabel">Assigned Users</div>
                                <input
                                    className="roleDialogInput"
                                    value={selectedRole?.userCount ?? roleData.userCount ?? 0}
                                    disabled
                                />
                            </div>
                        </div>

                        {isProtectedRole ? (
                            <div className="roleDialogLabel" style={{ color: "#B45309" }}>
                                System roles are read-only because changing them would break authority mapping.
                            </div>
                        ) : null}
                    </div>
                    <div className="userHeaderHorizontalLine" style={{ margin: "12px 0px 0px 0px" }}></div>
                </DialogContent>

                <DialogActions>
                    <div className="dialogActionBtn">
                        <div className="closeBtn" onClick={handleCloseRoleDialog}>Cancel</div>
                        {!(isEditing && isProtectedRole) ? (
                            <div style={{ width: "auto", opacity: saving ? 0.7 : 1 }} className="addBtn" onClick={saving ? undefined : handleSaveRole}>
                                {saving ? "Saving..." : isEditing ? "Update Role" : "Create Role"}
                            </div>
                        ) : null}
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    );
}
