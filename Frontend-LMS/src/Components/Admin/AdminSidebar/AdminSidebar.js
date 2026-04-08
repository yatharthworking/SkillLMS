import React, { useState, useEffect, memo } from 'react';
import './AdminSidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

// Admin SVGs
import DashboardIconBlack from '../../../Assets/Images/dashboardIconBlack.svg';
import masterIconBlack from '../../../Assets/Images/masterIconBlack.svg';
import DashboardIconWhite from '../../../Assets/Images/dashboardIconWhite.svg';
import masterIconWhite from '../../../Assets/Images/masterIconWhite.svg';
import UpArrowWhite from '../../../Assets/Images/upArrowWhite.svg';
import DownArrowBlack from '../../../Assets/Images/downArrowBlack.svg';
import WebinarImg from '../../../Assets/Images/webinarImg.svg';
import WebinarWhite from '../../../Assets/Images/webinarWhite.svg'
import CourseIconBlack from '../../../Assets/Images/courseIconBlack.svg';
import CourseIconWhite from '../../../Assets/Images/courseIconWhite.svg';
import AnnouncmentBlack from '../../../Assets/Images/announcmentBlack.svg';
import AnnouncmentWhite from '../../../Assets/Images/announcmentWhite.svg';
import HelpSupportBlackImg from '../../../Assets/Images/helpSupportBlack.svg';
import HelpSupportWhiteImg from '../../../Assets/Images/helpSupportWhite.svg';

// Teacher MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import DomainIcon from '@mui/icons-material/Domain';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import LayersIcon from '@mui/icons-material/Layers';
import BookIcon from '@mui/icons-material/Book';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';

const teacherNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/adminLandingPage' },
    { id: 'course', label: 'Courses', icon: <LibraryBooksIcon />, path: '/adminLandingPage' },
    { id: 'mybatches', label: 'Classes', icon: <SchoolIcon />, path: '/adminLandingPage' },
    { id: 'assignments', label: 'Assignments & Tests', icon: <AssignmentIcon />, path: '/adminLandingPage' },
    { id: 'aitools', label: 'AI Tools', icon: <AutoAwesomeIcon />, path: '/adminLandingPage' },
    { id: 'mystudents', label: 'My Students', icon: <PeopleIcon />, path: '/adminLandingPage' },
    { id: 'analytics', label: 'Analytics & Reports', icon: <AnalyticsIcon />, path: '/adminLandingPage' },
    { id: 'contentlibrary', label: 'Content Library', icon: <VideoLibraryIcon />, path: '/adminLandingPage' },
    { id: 'interactivetools', label: 'Interactive Tools', icon: <TouchAppIcon />, path: '/adminLandingPage' },
    { id: 'competitivelearning', label: 'Competitive Learning', icon: <EmojiEventsIcon />, path: '/adminLandingPage' },
    { id: 'announcment', label: 'Communication', icon: <CampaignIcon />, path: '/adminLandingPage' },
    { id: 'helpsupport', label: 'Help & Support', icon: <HelpOutlineIcon />, path: '/adminLandingPage' }
];

const principalNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'school-overview', label: 'School Overview', icon: <DomainIcon /> },
    { 
        group: '📊 Academic Management', 
        items: [
            { id: 'teachers', label: 'Teachers', icon: <SupervisedUserCircleIcon /> },
            { id: 'students', label: 'Students', icon: <PeopleIcon /> },
            { id: 'classes', label: 'Classes & Batches', icon: <LayersIcon /> },
            { id: 'courses', label: 'Courses & Content', icon: <BookIcon /> }
        ]
    },
    { 
        group: '🧠 Learning & Assessment', 
        items: [
            { id: 'assignments', label: 'Assignments & Assessments', icon: <AssignmentIcon /> },
            { id: 'pal', label: 'Adaptive Learning (PAL)', icon: <PsychologyIcon /> },
            { id: 'library', label: 'Content Library', icon: <VideoLibraryIcon /> }
        ]
    },
    { 
        group: '📈 Monitoring & Insights', 
        items: [
            { id: 'analytics', label: 'Analytics & Reports', icon: <AnalyticsIcon /> }
        ]
    },
    { 
        group: '📡 Communication & Planning', 
        items: [
            { id: 'communication', label: 'Communication', icon: <ChatIcon /> },
            { id: 'calendar', label: 'Calendar & Scheduling', icon: <EventIcon /> }
        ]
    },
    { 
        group: '⚙️ System', 
        items: [
            { id: 'helpsupport', label: 'Help & Support', icon: <HelpOutlineIcon /> },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon /> }
        ]
    }
];

const SidebarItem = memo(({ item, active, expanded, onClick }) => (
    <button
        className={`teacherSidebarItem ${active ? 'active' : ''} ${expanded ? 'expanded' : 'collapsed'}`}
        onClick={onClick}
        title={item.label}
        type="button"
    >
        <span className="sidebarIcon">{item.icon}</span>
        <span className="teacherSidebarLabel">{item.label}</span>
    </button>
));

export default function AdminSidebar({ selectedBox, setSelectedBox, selectedSubBox, setSelectedSubBox }) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMastersDropdownOpen, setIsMastersDropdownOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleParam = queryParams.get('role');

    useEffect(() => {
        try {
            // Check URL param first as an override for testing/convenience
            if (roleParam?.toLowerCase() === 'teacher') {
                setIsTeacher(true);
                return;
            }

            const userLoginResponse = localStorage.getItem('UserLoginResponse');
            let detail = null;
            if (userLoginResponse) {
                detail = JSON.parse(userLoginResponse);
            } else {
                const adminLoginResponse = localStorage.getItem('AdminLoginResponse');
                if (adminLoginResponse) {
                    detail = JSON.parse(adminLoginResponse);
                }
            }
            
            // Check if any role is TEACHER
            const hasTeacherRole = detail?.roles?.some(role => {
                const roleName = typeof role === 'string' ? role : (role.roleMasterName || role.role?.roleMasterName);
                return roleName?.toUpperCase() === 'TEACHER';
            });

            if (hasTeacherRole) {
                setIsTeacher(true);
            } else {
                setIsTeacher(false);
            }
        } catch (e) {
            console.error("Error parsing role", e);
            setIsTeacher(false);
        }
    }, [roleParam, location.search]);

    // Removed redundant teacherMenu array

    const handleBoxClick = (boxName, subBoxName = '') => {
        setSelectedBox(boxName);
        setSelectedSubBox(subBoxName);
    
        if (boxName === 'masters') {
            setIsMastersDropdownOpen(!isMastersDropdownOpen);
        } else {
            setIsMastersDropdownOpen(false);
        }
    
        if (window.innerWidth <= 768) {
            setIsMobileOpen(false);
            setIsExpanded(false);
        }

        navigate('/adminLandingPage', { state: { selectedBox: boxName, selectedSubBox: subBoxName } });
    };

    const handleMouseOver = () => {
        if (window.innerWidth > 768) {
            setIsExpanded(true);
        }
    };

    const handleMouseOut = () => {
        if (window.innerWidth > 768) {
            setIsExpanded(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileOpen((prev) => {
            const nextState = !prev;
            setIsExpanded(nextState);
            return nextState;
        });
    };

    return (
        <>
            <div className="mobileToggleBtn" onClick={toggleMobileMenu}>
                {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
            </div>

            {isMobileOpen && <div className="mobileOverlay" onClick={toggleMobileMenu}></div>}

            <div
                className={`adminSidebarContainer ${isExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'mobileOpen' : ''}`}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
                
                {isTeacher ? (
                    <div className={`teacherSidebarMenu ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        <div className="teacherSidebarHeader">
                            <div className="teacherSidebarTitle">Teacher Navigation</div>
                        </div>
                        <nav className={`teacherSidebarNav ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            {teacherNavItems.map((item) => (
                                <SidebarItem
                                    key={item.id}
                                    item={item}
                                    active={selectedBox === item.id}
                                    expanded={isExpanded}
                                    onClick={() => handleBoxClick(item.id)}
                                />
                            ))}
                        </nav>
                    </div>
                ) : (
                    <div className={`teacherSidebarMenu ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        <div className="teacherSidebarHeader">
                            <div className="teacherSidebarTitle">Principal Dashboard</div>
                        </div>
                        <nav className={`teacherSidebarNav ${isExpanded ? 'expanded' : 'collapsed'}`}>
                            {principalNavItems.map((item, idx) => (
                                item.group ? (
                                    <div key={idx} className="sidebarGroup">
                                        <div className="sidebarGroupLabel">{item.group}</div>
                                        {item.items.map((subItem) => (
                                            <SidebarItem
                                                key={subItem.id}
                                                item={subItem}
                                                active={selectedBox === subItem.id}
                                                expanded={isExpanded}
                                                onClick={() => handleBoxClick(subItem.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <SidebarItem
                                        key={item.id}
                                        item={item}
                                        active={selectedBox === item.id}
                                        expanded={isExpanded}
                                        onClick={() => handleBoxClick(item.id)}
                                    />
                                )
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </>
    );
}
