import React, {useState, useEffect } from 'react';
import './AdminLandingPage.css';
import Navbar from '../../Navbar/Navbar';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminDashboard from '../AdminSidebarSection/AdminDashboard';
import { useLocation } from 'react-router-dom';
import Organisation from '../AdminSidebarSection/Masters/Organisation';
import Batch from '../AdminSidebarSection/Masters/Batch';
import WebinarAdmin from '../AdminSidebarSection/WebinarAdmin/WebinarAdmin';
import CourseMaster from '../AdminSidebarSection/CourseAdmin/CourseMaster';
import AnnouncementTable from '../AdminSidebarSection/AnnouncementAdmin/AnnouncementTable';
import HolidayMaster from '../AdminSidebarSection/HolidayMasterAdmin/HolidayMaster';
import AdminHelpSupport from '../AdminSidebarSection/AdminHelpSupport/AdminHelpSupport';
import UserMaster from '../AdminSidebarSection/Masters/UserMaster';
import Subject from '../AdminSidebarSection/Masters/Subject';
import RoleMaster from '../AdminSidebarSection/Masters/RoleMaster';
import AiTools from '../AdminSidebarSection/AiTools';
import WorkInProgress from '../../../WorkInProgress';
import TeacherDashboard from '../AdminSidebarSection/TeacherDashboard';
import PrincipalDashboard from '../AdminSidebarSection/PrincipalDashboard';
import AssignmentsTests from '../AdminSidebarSection/AssignmentsTests';
import SchoolOverview from '../AdminSidebarSection/SchoolOverview';
import TeachersManagement from '../AdminSidebarSection/TeachersManagement';
import StudentsManagement from '../AdminSidebarSection/StudentsManagement';
import ClassesBatchesManagement from '../AdminSidebarSection/ClassesBatchesManagement';

export default function AdminLandingPage() {
    const location = useLocation();
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const roleParam = queryParams.get('role');
        
        const userLoginResponse = localStorage.getItem('UserLoginResponse');
        const adminLoginResponse = localStorage.getItem('AdminLoginResponse');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        let hasTeacherRole = false;

        if (roleParam === 'teacher') {
            localStorage.setItem('forcedRole', 'teacher');
            hasTeacherRole = true;
        } else {
            const forcedRole = localStorage.getItem('forcedRole');
            if (forcedRole === 'teacher') hasTeacherRole = true;
        }

        if (!hasTeacherRole) {
            const detail = userLoginResponse ? JSON.parse(userLoginResponse) : (adminLoginResponse ? JSON.parse(adminLoginResponse) : null);
            hasTeacherRole = detail?.roles?.some(role => {
                const roleName = typeof role === 'string' ? role : (role.roleMasterName || role.role?.roleMasterName);
                return roleName?.toUpperCase() === 'TEACHER';
            }) || (storedUser && (storedUser.role === 'TEACHER' || storedUser.roles?.includes('TEACHER')));
        }
        
        console.log("AdminLandingPage: roleParam=", roleParam, "isTeacher=", hasTeacherRole);
        setIsTeacher(hasTeacherRole);
    }, [location]);

    const [selectedBox, setSelectedBox] = useState(() => {
        return location.state && location.state.selectedBox ? location.state.selectedBox : 'dashboard';
    });

    const [selectedSubBox, setSelectedSubBox] = useState(() => {
        return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : '';
    });

    useEffect(() => {
        if (location.state) {
            if (location.state.selectedBox) {
                setSelectedBox(location.state.selectedBox);
            }
            if (location.state.selectedSubBox) {
                setSelectedSubBox(location.state.selectedSubBox);
            }
        }
    }, [location]);



  return (
    <div className='adminLandingPage'>
        <div><Navbar /></div>

        <div className='adminLandingPageContainer'>

            <div className='adminSidebarSection'>
                {/* <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox}/> */}
                <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox}/>
            </div>

            <div className='adminHomeSection'>

                <div className='adminSelectedHomeSection'>
                    {selectedBox === 'dashboard' && (isTeacher ? <TeacherDashboard setSelectedBox={setSelectedBox} /> : <PrincipalDashboard />)}
                    {selectedBox === 'school-overview' && <SchoolOverview/>}
                    {selectedBox === 'teachers' && <TeachersManagement/>}
                    {selectedBox === 'students' && <StudentsManagement/>}
                    {selectedBox === 'classes' && <ClassesBatchesManagement/>}
                    {selectedBox === 'courses' && <CourseMaster/>}
                    {selectedBox === 'assignments' && <AssignmentsTests/>}
                    {selectedBox === 'pal' && <WorkInProgress/>}
                    {selectedBox === 'library' && <WorkInProgress/>}
                    {selectedBox === 'analytics' && <WorkInProgress/>}
                    {selectedBox === 'communication' && <AnnouncementTable/>}
                    {selectedBox === 'calendar' && <WorkInProgress/>}
                    {selectedBox === 'helpsupport' && <AdminHelpSupport/>}
                    {selectedBox === 'settings' && <WorkInProgress/>}

                    {/* Keep legacy mappings for some time or cleanup */}
                    {selectedBox === 'masters' && selectedSubBox === 'organisation' && <Organisation/>}
                    {selectedBox === 'masters' && selectedSubBox === 'batch' && <Batch/>}
                    {selectedBox === 'masters' && selectedSubBox === 'holidaymaster' && <HolidayMaster/>}
                    {selectedBox === 'masters' && selectedSubBox === 'usermaster' && <UserMaster/>}
                    {selectedBox === 'masters' && selectedSubBox === 'rolemaster' && <RoleMaster/>}
                    {selectedBox === 'masters' && selectedSubBox === 'subject' && <Subject/>}
                    
                    {/* Teacher specific or shared legacy */}
                    {selectedBox === 'mybatches' && <Batch/>}
                    {selectedBox === 'aitools' && <AiTools/>}
                    {selectedBox === 'webinar' && <WebinarAdmin />}
                    {selectedBox === 'course' && <CourseMaster/>}
                    {selectedBox === 'announcment' && <AnnouncementTable/>}
                    {selectedBox === 'mystudents' && <WorkInProgress/>}
                    {selectedBox === 'interactivetools' && <WorkInProgress/>}
                    {selectedBox === 'competitivelearning' && <WorkInProgress/>}
                </div>
            </div>

        </div>

    </div>
  )
}
