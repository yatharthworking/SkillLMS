import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserNotification.css';
import Navbar from '../../Navbar/Navbar';
import UserSidebar from '../UserSideBar/UserSidebar';
import AdminSidebar from '../../Admin/AdminSidebar/AdminSidebar';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import LeftArrow from '../../../Assets/Images/leftArrow.svg';
import Ellipse from '../../../Assets/Images/Ellipse.svg';
import { format } from 'date-fns';
import { BACKEND_BASEURL} from '../../helper.js';   
import PulseLoader from 'react-spinners/PulseLoader';
import { ToastContainer, toast } from "react-toastify";

const UserNotification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); 

    const token = localStorage.getItem("token");
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const isAdminRoute = window.location.pathname.toLowerCase().includes('admin') || !!localStorage.getItem('AdminLoginResponse');
    const user = JSON.parse(localStorage.getItem('UserLoginResponse')) || JSON.parse(localStorage.getItem('AdminLoginResponse'));
    const userName = user?.username || user?.sub || user?.email || '';

    const [selectedBox, setSelectedBox] = useState(() => {
        return location.state && location.state.selectedBox ? location.state.selectedBox : ' ';
    });

    const [selectedSubBox, setSelectedSubBox] = useState(() => {
        return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : '';
    });

    const [announcements, setAnnouncements] = useState([]);
    const [markReadAnnouncements, setMarkReadAnnouncements] = useState([]);
    const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
    const [groupedAnnouncements, setGroupedAnnouncements] = useState([]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, "do MMM yyyy"); // Formats date as 1st Aug 2024
    };



    const handleGoTOUserCourses = () => {
        if (localStorage.getItem('AdminLoginResponse')) {
            navigate('/adminLandingPage');
        } else {
            navigate('/userLandingPage');
        }
    };

    // useEffect(() => {
    //     fetchAnnouncements();
    //     fetchMarkAsReadAnnouncements();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await fetchAnnouncements();
            await fetchMarkAsReadAnnouncements();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const fetchAnnouncements = async () => {
        // setIsLoading(true);
        try {
            
            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchAnnouncements`, {
                params: {
                    userName: userName,
                    markAsRead: false
                }
            });
            if(response.status === 200){
                setAnnouncements(response.data.data);
            }
            else{
                setAnnouncements([]);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setAnnouncements([]);
        } finally {
            // setIsLoading(false);
        }
    };

    const fetchMarkAsReadAnnouncements = async () => {
        // setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchAnnouncements`, {
                params: {
                    userName: userName,
                    markAsRead: true
                }
            });
            if(response.status === 200){
                
                setMarkReadAnnouncements(response.data.data);
            }
            else{
                setMarkReadAnnouncements([]); 
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            setMarkReadAnnouncements([]); 
        }finally {
            // setIsLoading(false);
        }
    };

    const markAsRead = async (announcementId = null) => {
        let groupedAnnouncementId;
        if (announcementId) {
            groupedAnnouncementId = announcementId;
        } else {
            groupedAnnouncementId = announcements.map(announcement => announcement.announcementId).join(',');
        }
        console.log("groupedAnnouncementId",groupedAnnouncementId)
       
        try {
            const response = await axios.post(`${BACKEND_BASEURL}/student/markAnnouncementsAsRead`, null,{
                params: {
                    userName: userName,
                    announcementId: groupedAnnouncementId
                }
            });

            if (response.status === 200 ) {
                toast.success("Read All Notification Successfully!!", {
                    position: "top-right",
                    autoClose: 800,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                fetchAnnouncements();
                fetchMarkAsReadAnnouncements();
            } else {
                console.error('Error marking announcement as read:', response.data.message);
                toast.error("Error Occured!!", {
                    position: "top-right",
                    autoClose: 800,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
            }
        } catch (error) {
            console.error('Error marking announcement as read:', error);
        }
    };

    const handleMarkAsReadClick = (announcementId) => {
        markAsRead(announcementId);
    };

    // Function to expand announcement title
    const handleExpandTitle = (announcementId) => {
        setExpandedAnnouncements(prevState => {
            if (prevState.includes(announcementId)) {
                return prevState.filter(id => id !== announcementId);
            } else {
                return [...prevState, announcementId];
            }
        });
    };


    return (
        <div className='notificationMainPage'>
            <Navbar />
            <div className='notificationPageContainer'>
                <div className='adminSidebarSection'>
                    {localStorage.getItem('AdminLoginResponse') ? (
                        <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
                    ) : (
                        <UserSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
                    )}
                </div>

                <div className='notificationHomeSection'>
                    <div className='webinarHomeSectionContainer'>
                        <div className='notificationDetailHeaderSection'>
                            <div style={{display:'flex',justifyContent:'space-between'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
                                <div className='webinarBreadcrumSection'>
                                    <span className='webinarbreadcrumSelectedTxt'>Notifications</span>
                                </div>
                            </div>
                            <div className='markAllAsRead' onClick={() => markAsRead()}>Mark all as read</div>
                            </div>
                        </div>

                        {!isLoading ?(
                        <div className='webinarDetailContentSection'>
                            <div className='notificationSection'>
                                    <div className='notificationSubSextion'> 
                                        {Array.isArray(announcements) && announcements?.map((announcement) => ( 
                                            <div className= 'addMarkasRead' onClick={() => handleMarkAsReadClick(announcement.announcementId)}>
                                                <div className='notificationSection1'>
                                                    <div className='notificationDate'>{formatDate(announcement?.creationTimeStamp)}</div>
                                                    <div className='notificationTitle'>{announcement?.announcementTitle}</div>
                                                    <div className='notificationMessage'>
                                                        {expandedAnnouncements?.includes(announcement?.announcementId)
                                                            ? announcement?.announcementMessage // Show full title if expanded
                                                            : announcement?.announcementMessage?.length > 200
                                                                ? `${announcement?.announcementMessage?.substring(0, 200)}...` // Show truncated title with "Read more"
                                                                : announcement?.announcementMessage // Show full title if not truncated
                                                        }
                                                        {announcement?.announcementMessage?.length > 200 && (
                                                            <span className='readMore' onClick={() => handleExpandTitle(announcement?.announcementId)}>
                                                                {expandedAnnouncements.includes(announcement?.announcementId) ? ' Read Less' : ' Read More'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <img
                                                        src={Ellipse}
                                                        alt='' 
                                                    /> 
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>

                            <div className='notificationSection'>
                
                                    <div className='notificationSubSextion'> 
                                        { Array.isArray(markReadAnnouncements) && markReadAnnouncements?.map((announcement,index) => (
                                            <div className= 'addMarkasRead1'>
                                                <div className='notificationSection1'>
                                                    <div className='notificationDate'>{formatDate(announcement?.creationTimeStamp)}</div>
                                                    <div className='notificationTitle'>{announcement?.announcementTitle}</div>
                                                    <div className='notificationMessage'>
                                                        {expandedAnnouncements.includes(announcement?.announcementId)
                                                            ? announcement?.announcementMessage // Show full title if expanded
                                                            : announcement?.announcementMessage?.length > 200
                                                                ? `${announcement?.announcementMessage?.substring(0, 200)}...` // Show truncated title with "Read more"
                                                                : announcement?.announcementMessage // Show full title if not truncated
                                                        }
                                                        {announcement?.announcementMessage?.length > 200 && (
                                                            <span className='readMore' onClick={() => handleExpandTitle(announcement?.announcementId)}>
                                                                {expandedAnnouncements.includes(announcement?.announcementId) ? ' Read Less' : ' Read More'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>

                            {/* <div className='loadMoreDiv'>Load More</div> */}
                        </div>
                        ):(
                            <div className="loader-container">
                                <PulseLoader color="#219EBC" size={15} margin={5} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserNotification;
