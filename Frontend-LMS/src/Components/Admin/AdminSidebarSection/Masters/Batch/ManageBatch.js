import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManageBatch.css';
import Navbar from '../../../../Navbar/Navbar';
import AdminSidebar from '../../../AdminSidebar/AdminSidebar';
import LeftArrow from '../../../../../Assets/Images/leftArrow.svg';
import { format, parse } from 'date-fns';
import Courses from './ManageBatch/Courses';
import EnrolledStudent from './ManageBatch/EnrolledStudent';
import LiveTest from './ManageBatch/LiveTest';

function ManageBatch() {

    const navigate = useNavigate();
    const location = useLocation();
    const batchData  = location.state.selectedBatch;

    const [activeTab, setActiveTab] = useState('courses');

    const [selectedBox, setSelectedBox] = useState(() => {
        return location.state && location.state.selectedBox ? location.state.selectedBox : 'masters';
      });
    
      const [selectedSubBox, setSelectedSubBox] = useState(() => {
        return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : 'batch';
      });

      const formatDate = (dateString) => {
        const dateParts = dateString.split(' '); // Parse the date string based on its format
        const date = parse(dateParts[0], 'dd-MM-yyyy', new Date());
        return format(date, "dd MMM yyyy");
      };

      const handleGoTOUserCourses = () => {
        navigate(-1);
      };

    // console.log(batchData)

  return (
    <>
     <div className='Page'>
      <div><Navbar /></div>
       <div className='adminLandingPageContainer'>
        <div className='adminSidebarSection'>
            <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
        </div>
          
        <div className='PageContent'>
            <div className='webinarDetailHeaderSection'>
                <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
                <div className='webinarBreadcrumSection'>
                    <span className='webinarbreadcrumNotSelectedTxt'>Batches</span>
                    <span className='breadcrumSeperator'>/</span>
                    <span className='webinarbreadcrumSelectedTxt'>Manage Batch</span>
                </div>
            </div>
            <div className='borderLineBlue'></div>
            <div className='WhiteContainerBox'>
               <div className='HeaderText'>{batchData.batchName}</div>
               <div className='InfoBox'>
                    <div className='LeftInfoBox'>
                        <span>Branch : </span>
                        <span>Duration : </span>
                        <span>Enrolled students : </span>
                    </div>
                    <div className='RightInfoBox'>
                        <span> {batchData.branchName}</span>
                        <span>{formatDate(batchData.batchStartDateTime)} - {formatDate(batchData.batchEndDateTime)} </span>
                        <span>{batchData.totalEnrolledStudents}{batchData.batchCapacity !== 99999 && `/${batchData.batchCapacity}`}</span>
                    </div>
               </div>
               <div className='ComponentContainer'>
               <div className="tabContainer">
                  <div className="tabs">
                    <div className={`tabButton ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}>
                        Courses
                    </div>
                    <div className={`tabButton ${activeTab === 'student' ? 'active' : ''}`}
                        onClick={() => setActiveTab('student')} >
                        Enrolled Students
                    </div>
                    <div className={`tabButton ${activeTab === 'livetest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('livetest')} >
                        Live Test
                    </div>
                  </div>
                </div> 

                {activeTab === 'courses' && ( <div className="tabContent"> <Courses batchData={batchData} /> </div> )}
                {activeTab === 'student' && ( <div className="tabContent"> <EnrolledStudent batchData={batchData}/>  </div>)} 
                {activeTab === 'livetest'&& ( <div className="tabContent"> <LiveTest batchData={batchData}/>  </div>)} 

               </div>
               
            </div>


        </div>

       </div>
     </div>

    </>
  )
}

export default ManageBatch
