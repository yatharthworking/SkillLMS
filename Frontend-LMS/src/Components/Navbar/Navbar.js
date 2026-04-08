import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import DefaultAvatar from '../../Assets/Images/userAvtar.svg';
import NotificationIcon from '../../Assets/Images/notificationIcon.svg'; 
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../helper";

export default function Navbar() {
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();
    const [role, setRoles] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0); 
    const userLoginResponse = getFromLocalStorageSafe('UserLoginResponse');
    const adminLoginResponse = getFromLocalStorageSafe('AdminLoginResponse');
    const organisationName = process.env.REACT_APP_LMS_ORGANISATION_NAME;
    const companyLogo = `${process.env.PUBLIC_URL}/logo192.png`;
    const token = localStorage.getItem('token');

    const adminDetail = getFromLocalStorageSafe('adminDetails');
    const studentDetail = getFromLocalStorageSafe('studentDetails');
    
    // Base derivation strictly on the active router context to prevent localStorage cache-bleed
    const isUserRoute = window.location.pathname.toLowerCase().startsWith('/user');
    const isAdminRoute = window.location.pathname.toLowerCase().startsWith('/admin');
    
    const activeDetail = isAdminRoute ? adminDetail : (isUserRoute ? studentDetail : (adminDetail || studentDetail));
    const activeLoginResponse = isAdminRoute ? adminLoginResponse : (isUserRoute ? userLoginResponse : (adminLoginResponse || userLoginResponse));
    
    const currentUserName = activeLoginResponse?.username || activeDetail?.email || '';
    
    const activeFullName = activeDetail?.fullName;
    const activeEmail = activeDetail?.email;
    const activeImage = activeDetail?.userImage;
    const activeBranchName = activeDetail?.organizationsDB?.orgName || activeDetail?.organizationsDB?.organizationName;

    const fetchNotifications = async () => {
        try {
            if (!token || !currentUserName) {
                setNotificationCount(0);
                return;
            }

            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchAnnouncements`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    userName: currentUserName,
                    markAsRead: false
                }
            });
            if (response.data.status && response.data.data) {
                setNotificationCount(response.data.data.length);
            } else {
                setNotificationCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotificationCount(0);
        }
    };

    const fetchUserProfile = async (emailToFetch) => {
        if (!emailToFetch || !token) return;
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails?email=${emailToFetch}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.status === 200 && response.data) {
                const storageKey = isAdminRoute ? 'adminDetails' : 'studentDetails';
                localStorage.setItem(storageKey, JSON.stringify(response.data));
                setUpdateTrigger(prev => prev + 1); // Trigger re-render to pick up new data
                
                // Notify other components (like AdminDashboard) that profile data is now available
                window.dispatchEvent(new Event('profileUpdate'));
            }
        } catch (error) {
            console.error('Error auto-fetching user profile:', error);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const roleParam = queryParams.get('role');

        if (roleParam?.toLowerCase() === 'teacher') {
            setRoles('TEACHER');
        } else if (activeDetail) {
            setRoles(activeDetail?.roles?.[0]?.role?.roleMasterName || activeDetail?.roles?.[0]);
        } else if (currentUserName && token) {
            // Auto-fetch profile if missing
            fetchUserProfile(currentUserName);
        }

        if (activeLoginResponse) {
            fetchNotifications();
        }
    }, [currentUserName, token, activeDetail, updateTrigger, window.location.search]);

    const handleGoToProfile = () => {
        if (userLoginResponse) {
            navigate('/userProfile');
        } else if (adminLoginResponse) {
            navigate('/adminProfile');
        } else {
            console.error('No login response found in local storage.');
        }
    };

    const handleLandingPageRedirect = () => {
        if (userLoginResponse) {
            navigate('/userLandingPage');
        } else if (adminLoginResponse) {
            navigate('/adminLandingPage');
        } else {
            console.error('No login response found in local storage.');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
        window.location.reload(); // Ensure all states are reset
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.navbarAvatarSection')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // Handle profile and login update events
    useEffect(() => {
        const handleUpdate = () => {
            setUpdateTrigger(prev => prev + 1);
        };
        window.addEventListener('profileUpdate', handleUpdate);
        window.addEventListener('loginSuccess', handleUpdate);
        window.addEventListener('storage', handleUpdate); // Also listen for cross-tab storage changes
        return () => {
            window.removeEventListener('profileUpdate', handleUpdate);
            window.removeEventListener('loginSuccess', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const handleNotification = () =>{
        navigate('/userNotification');
    }

    return (
        <div>
            <div className='navContainer'>
                <div className='navBrandSection' onClick={handleLandingPageRedirect}>
                    <img className='navbarLogo' src={companyLogo} alt={organisationName} />
                    <div className='navbarBrandText'>
                        <div className='navbarOrgName'>{organisationName || 'SkillLMS'}</div>
                        <div className='roleAndBranchSection'>
                            {role && <div className='userAdminRole'>{role}</div>}
                            {activeBranchName && (
                                <div className='leftBranchName'>
                                    Branch: {activeBranchName}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='navbarActions'>
                    {(userLoginResponse || adminLoginResponse) && (
                        <div className='notificationWrapper' onClick={handleNotification}>
                            <img className='notificationIcon' src={NotificationIcon} alt='notifications' />
                            {notificationCount > 0 && (
                                <div className='notificationCount'>{notificationCount > 9 ? '9+' : notificationCount}</div>
                            )}
                        </div>
                    )}

                    <div className='navbarHaedingSection'>
                        {activeLoginResponse && (
                            <>
                                <div className='userFullName'>{activeFullName}</div>
                                <div className='userEmail'>{activeEmail}</div>
                            </>
                        )}
                    </div>

                    <div className='navbarAvatarSection'>
                        {activeLoginResponse && (
                            <div className='avatarWrapper' onClick={toggleDropdown}>
                                <img
                                    src={activeImage ? `data:image/png;base64,${activeImage}` : DefaultAvatar}
                                    alt="user"
                                    className='navbarAvatar'
                                />
                                {isDropdownOpen && (
                                    <div className='profileDropdown'>
                                        <div className='dropdownHeader'>
                                            <div className='dropdownName'>{activeFullName}</div>
                                            <div className='dropdownEmail'>{activeEmail}</div>
                                        </div>
                                        <div className='dropdownDivider'></div>
                                        <div className='dropdownItem' onClick={handleGoToProfile}>
                                            My Profile
                                        </div>
                                        <div className='dropdownItem logoutItem' onClick={handleLogout}>
                                            Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
