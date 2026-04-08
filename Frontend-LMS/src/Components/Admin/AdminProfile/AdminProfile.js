import React,{useState} from 'react';
import './AdminProfile.css'
import Navbar from '../../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import LeftArrow from '../../../Assets/Images/leftArrow.svg';
import AdminProfileSidebar from './AdminProfileSidebar';
import AdminProfilePersonalDetails from './AdminProfilePersonalDetails';
import AdminProfileResetPassword from './AdminProfileResetPassword';

function AdminProfile() {
  const navigate= useNavigate();
  const [selectedTab, setSelectedTab] = useState('PersonalDetails');
  
  const handleGoToUserLandingPage = () => {
    navigate('/adminLandingPage', { state: { selectedBox: 'dashboard' } });
};

const renderContent = () => {
  switch (selectedTab) {
    case 'PersonalDetails':
      return <AdminProfilePersonalDetails />; 
    case 'ResetPassword':
      return <AdminProfileResetPassword />;
    default:
      return <AdminProfilePersonalDetails />;
  }
};

  return (
    <div className='adminProfilePage'>
        <div><Navbar /></div>

        <div className='adminProfileContainer'>
          <div className='adminProfileHeaderRow'>
              <button className='backButton' onClick={handleGoToUserLandingPage}><img src={LeftArrow} alt='' /></button>
              <div className='adminProfileHeaderTxt'>My Profile</div>
          </div>

          <div className='userProfileContentRow'> 
                <div className='userProfileSidebarSection'>
                    <AdminProfileSidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
                </div>
                <div className='userProfileContentSection'>
                    {renderContent()}
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default AdminProfile