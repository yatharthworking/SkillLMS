import React,{useEffect, useState} from 'react';
import './UserProfile.css';
import Navbar from '../../Navbar/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import LeftArrow from '../../../Assets/Images/leftArrow.svg';
import UserProfileSidebar from './UserProfileSidebar';
import UserProfilePersonalDetail from './UserProfilePersonalDetail';
import UserProfileMyCertificate from './UserProfileMyCertificate';
import UserProfileManagePayment from './UserProfileManagePayment';
import UserProfileResetPassword from './UserProfileResetPassword';
import UserMyClass from './UserMyClass';

export default function UserProfile() {
    const navigate= useNavigate();
    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState('PersonalDetails');

    useEffect(() => {
        if (location.state?.selectedTab) {
            setSelectedTab(location.state.selectedTab);
        }
    }, [location.state]);

    const handleGoToUserLandingPage = () => {
        navigate('/userLandingPage', { state: { selectedBox: 'dashboard' } });
    };

    const renderContent = () => {
        switch (selectedTab) {
          case 'PersonalDetails':
            return <UserProfilePersonalDetail />;
          case 'MyClass':
            return <UserMyClass />;
          case 'MyCertificate':
            return <UserProfileMyCertificate />;
          case 'ManagePayment':
            return <UserProfileManagePayment />;
          case 'ResetPassword':
            return <UserProfileResetPassword />;
          default:
            return <UserProfilePersonalDetail />;
        }
    };

  return (
    <div className='userProfilePage'>

        <div><Navbar /></div>

        <div className='userProfileContainer'>

            <div className='userProfileHeaderRow'>
                <button className='backButton' onClick={handleGoToUserLandingPage}><img src={LeftArrow} alt='' /></button>
                <div className='userProfileHeaderTxt'>My Profile</div>
            </div>

            <div className='userProfileContentRow'> 
                <div className='userProfileSidebarSection'>
                    <UserProfileSidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab}/>
                </div>
                <div className='userProfileContentSection'>
                    {renderContent()}
                </div>
                
            </div>

        </div>

    </div>
  )
}
