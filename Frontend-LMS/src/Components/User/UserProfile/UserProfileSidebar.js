import React, { useState, useEffect } from 'react';
import './UserProfileSidebar.css';
import { useNavigate } from 'react-router-dom';
import DefaultProfile from '../../../Assets/Images/profileImg.svg';
import ProfileEdit from '../../../Assets/Images/profileEdit.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../AuthContext'; // Import the useAuth hook
import axios from 'axios'; // Import Axios
import close from '../../../Assets/Images/close.svg';
import { BACKEND_BASEURL, studentDetails } from "../../helper";
import CircularProgress from '@mui/material/CircularProgress';

export default function UserProfileSidebar({ selectedTab, setSelectedTab }) {
    const navigate = useNavigate();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const { logout } = useAuth(); // Use the logout function from AuthContext

    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(DefaultProfile);
    const [isRemoveImg, setIsRemoveImg] = useState(false);
    const [showCloseIcon, setShowCloseIcon] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
         // Fetch user details
        fetchUserDetails();

        const handleProfileUpdate = () => {
            fetchUserDetails();
        };

        window.addEventListener('profileUpdate', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdate', handleProfileUpdate);
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails?email=${studentDetails.email}`);
            
            if(response.status === 200){
                const data = response.data; 
                console.log("response.data",response.data)
                setUserDetails(data);

                setProfileImage(data.userImage);
                localStorage.setItem('studentDetails', JSON.stringify(data));
            }

        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // Helper function to create a delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleUserProfileSidebarTabClick = (tab) => {
        if (tab === 'logout') {
            setShowLogoutPopup(true);
        } else {
            setSelectedTab(tab);
        }
    };

    const handleConfirmLogout = async () => {
        setShowLogoutPopup(false);

        toast.success('Logout Successful', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

        await delay(2000);
        navigate('/');

        logout(); // Call the logout function from AuthContext

        localStorage.clear();
    };

    const handleCancelLogout = () => {
        setShowLogoutPopup(false);
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const res=(reader.result.split(',')[1]);
              setProfileImage(res);
              setShowCloseIcon(true); // Show close icon when image is uploaded
              event.target.value = null; // Reset input value after handling the file upload
          };
          reader.readAsDataURL(file);
          setIsRemoveImg(false);
      }
  };
  

    const handleRemoveImage = () => {
        setIsRemoveImg(true);
        setProfileImage();
        setShowCloseIcon(false); 
    };
  

    const handleProfileImageClick = () => {
        document.getElementById('fileInput').click();
    };

    const closeDeleteDialog = () => {
        setShowDelDialog(false);
        setIsRemoveImg(false);
    };

    const updateUserDetails = async () => {
        try {
            setLoadingUpdate(true);
            const updatedUserDetails = { ...userDetails, userImage: profileImage };
    
          const response = await axios.patch(`${BACKEND_BASEURL}/student/save-updateUserDetails`, updatedUserDetails);
          if(response.status == 200){
            toast.success('User Profile updated successfully!');
            fetchUserDetails();
            closeDeleteDialog();
          }
        } catch (error) {
          console.error('Error updating user details:', error);
        }finally{
            setLoadingUpdate(false);
        }
      };

    const handleUploadItem = () => {
        setShowDelDialog(true);
        setShowCloseIcon(true);
    };

    return (
        <div className='userProfileSidebarPage'>
            <div className='userProfileSidebarImageSection'>
                <div className='profileImgDiv'>
                    <img src={userDetails?.userImage ? `data:image/png;base64,${userDetails.userImage}` : DefaultProfile} alt='Profile' className='profileImage' />
                    <div className='editIconContainer'>
                        <img src={ProfileEdit} alt='Edit' className='editIcon' onClick={handleUploadItem} />
                    </div>
                </div>
                <input
                    type='file'
                    id='fileInput'
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    accept='image/*'
                />
            </div>

            <div className='userProfileSidebarNameSection'>
                <div className='userProfileSidebarNameTxt'>{userDetails?.roles[0]?.role?.roleMasterName}</div>
                <div className='userProfileSidebarEmailTxt'>Branch: <span className='branchName'>{userDetails?.organizationsDB?.orgName}</span></div>
            </div>

            <div className='userProfileSidebarLineRow'></div>

            <div className='userProfileSidebarTabSection'>
                <div className={`userProfileSidebarTabMenu ${selectedTab === 'PersonalDetails' ? 'selectedUserProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('PersonalDetails')}>Personal Details</div>
                <div className={`userProfileSidebarTabMenu ${selectedTab === 'MyClass' ? 'selectedUserProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('MyClass')}>My Class/Batch</div>
                <div className={`userProfileSidebarTabMenu ${selectedTab === 'MyCertificate' ? 'selectedUserProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('MyCertificate')}>My Certificates</div>
                <div className={`userProfileSidebarTabMenu ${selectedTab === 'ManagePayment' ? 'selectedUserProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('ManagePayment')}>Manage Payments</div>
                <div className={`userProfileSidebarTabMenu ${selectedTab === 'ResetPassword' ? 'selectedUserProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('ResetPassword')}>Reset Passwords</div>

                <div className='userProfileSidebarTabMenuLogout' onClick={() => handleUserProfileSidebarTabClick('logout')}>Logout</div>
            </div>

            {showLogoutPopup && (
                <div className='logoutModel' onClick={handleCancelLogout}>
                    <div className='modalSection' onClick={e => e.stopPropagation()}>
                        <div className='logoutHeaderSection'>
                            <div className='logoutHeaderRowTxt'>Logout ?</div>
                            <div className='logoutSubHeaderRowTxt'>
                                Are you sure you want to logout?
                            </div>
                        </div>
                        <div className='forgotPasswordButton'>
                            <button onClick={handleCancelLogout} className='forgotPasswordCloseButton'>Cancel</button>
                            <button onClick={handleConfirmLogout} className='forgotPasswordVerifyButton'>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {showDelDialog && (
                <div className="uploadDialog-overlay">
                    <div className="upload-content">
                        <div className="uploadHeader">
                            <div className='profileImageContainer'>
                                <img src={!isRemoveImg ? (profileImage ? `data:image/png;base64,${profileImage}` : DefaultProfile): DefaultProfile} alt='Profile' className='profileImage' onClick={handleProfileImageClick} />
                                {showCloseIcon && (
                                    <div className='admineditIconContainer'>
                                        <img src={close} alt='Close' className='admineditIcon' onClick={handleRemoveImage} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="upload-footer">
                            <button className="cancelUpload" onClick={closeDeleteDialog}>Cancel</button>
                            <button className="createUpload" onClick={updateUserDetails}>
                                {loadingUpdate ? <CircularProgress size={20} style={{ color: 'white' }}  />  : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
