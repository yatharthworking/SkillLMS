import React, {useState,useEffect} from 'react';
import './AdminProfileSidebar.css'
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DefaultProfile from '../../../Assets/Images/profileImg.svg'
import ProfileEdit from '../../../Assets/Images/profileEdit.svg' 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; 
import axios from 'axios'; // Import Axios
import close from '../../../Assets/Images/close.svg';
import { BACKEND_BASEURL, adminDetails } from "../../helper";
import CircularProgress from '@mui/material/CircularProgress';


const AdminProfileSidebar = ({ selectedTab, setSelectedTab }) => {
  const navigate= useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { logout } = useAuth(); // Use the logout function from AuthContext
  const adminDetail = JSON.parse(localStorage.getItem('adminDetails'));
  const adminLoginResponse = JSON.parse(localStorage.getItem('AdminLoginResponse'));

  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(DefaultProfile);
  const [isRemoveImg, setIsRemoveImg] = useState(false);
  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const [showDelDialog, setShowDelDialog] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    fetchAdminDetails();
  }, []);

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


const handleProfileImageClick = () => {
    document.getElementById('fileInput').click();
};


const handleRemoveImage = () => {
  setIsRemoveImg(true);
  setProfileImage();
  setShowCloseIcon(false); 
};


const closeDeleteDialog = () => {
  setShowDelDialog(false);
  setIsRemoveImg(false);
};


const fetchAdminDetails = async () => {
  const emailToFetch = adminDetail?.email || adminLoginResponse?.sub || adminLoginResponse?.email;
  if (!emailToFetch) return;

  try {
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchUserDetails?email=${emailToFetch}`);
      
      if(response.status === 200){
          const data = response.data; 
          console.log("response.data",response.data)
          setUserDetails(data);

          setProfileImage(data.userImage);
          localStorage.setItem('adminDetails', JSON.stringify(data));
          window.dispatchEvent(new Event('profileUpdate'));
      }

  } catch (error) {
      console.error('Error fetching user details:', error);
  }
};


const updateAdminDetails = async () => {
    try {
        setLoadingUpdate(true);
        const updatedUserDetails = { ...userDetails, userImage: profileImage };

      const response = await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, updatedUserDetails);
      if(response.status == 200){
        toast.success('Profile updated successfully!');
        fetchAdminDetails();
        window.dispatchEvent(new Event('profileUpdate'));
        closeDeleteDialog();
        console.log('User details updated successfully:', response.data);
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
    <div className='adminProfileSidebarPage'>
      <div className='adminProfileSidebarImageSection'>
        <div className='adminProfileImgDiv'>
          <img src={userDetails?.userImage ? `data:image/png;base64,${userDetails.userImage}` : DefaultProfile}  className='adminProfileImage'/> 
          <div className='admineditIconContainer'>
            <img src={ProfileEdit} alt='Edit' className='admineditIcon' onClick={handleUploadItem}/>
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

      <div className='adminProfileSidebarNameSection'>
          <div className='adminProfileSidebarNameTxt'>{adminDetail?.fullName || adminLoginResponse?.fullName || 'User'}</div>
          {adminDetail?.roles?.[0]?.role?.roleMasterName && (
            <div className='adminProfileSidebarRoleTxt'>{adminDetail.roles[0].role.roleMasterName}</div>
          )}
          {adminDetail?.organizationsDB?.orgName &&(
            <div className='adminProfileSidebarEmailTxt'>Branch: <span className='branchName'>{adminDetail?.organizationsDB?.orgName}</span></div>
          )}
      </div>

      <div className='adminProfileSidebarLineRow'></div>

      <div className='adminProfileSidebarTabSection'>
          <div className={`adminProfileSidebarTabMenu ${selectedTab === 'PersonalDetails' ? 'selectedAdminProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('PersonalDetails')}>Personal Details</div> 
          <div className={`adminProfileSidebarTabMenu ${selectedTab === 'ResetPassword' ? 'selectedAdminProfileSidebarTabMenu' : ''}`} onClick={() => handleUserProfileSidebarTabClick('ResetPassword')}>Reset Passwords</div>
          <div className='adminProfileSidebarTabMenuLogout' onClick={() => handleUserProfileSidebarTabClick('logout')}>Logout</div>
      </div>

      {showLogoutPopup && (
        <div className='adminLogoutModel' onClick={handleCancelLogout}>
          <div className='adminModalSection' onClick={e => e.stopPropagation()}>
            <div className='adminLogoutHeaderSection'>
              <div className='adminLogoutHeaderRowTxt'>Logout ?</div>
              <div className='adminLogoutSubHeaderRowTxt'>
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
                  <div className="holidayDelBody">
                      <div className="upload-footer">
                          <button onClick={closeDeleteDialog} className='cancelUpload'>Cancel</button>
                          <button type="submit" className='createUpload' onClick={updateAdminDetails}>
                            {loadingUpdate ? <CircularProgress size={20} style={{ color: 'white' }}  />  : 'Update'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  )
}

export default AdminProfileSidebar
