import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminHelpSupport.css';
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Alarm from '../../../../Assets/Images/Alarm.svg';
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PulseLoader } from 'react-spinners';
import { BACKEND_BASEURL, adminDetails } from "../../../helper";
import resolvedIcon from '../../../../Assets/Images/markasraed.svg';
import Tooltip from '@mui/material/Tooltip';

const AdminHelpSupport = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [data, setData] = useState([]);
    const location = useLocation();
    const [statusFilter, setStatusFilter] = useState(location.state?.initialStatus || 'unresolved');
    const [showReadMoreDialog, setShowReadMoreDialog] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [adminReply, setAdminReply] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const branchId = adminDetails?.organizationsDB?.orgId;

    useEffect(() => {
        fetchHelpAndSupportData();
    }, [page, searchQuery, statusFilter]);

    const fetchHelpAndSupportData = async () => {
        try {
            setLoading(true);
            
            const isResolved = statusFilter === 'resolved';
            const queryParams = branchId ? `?isResolved=${isResolved}&branchId=${branchId}` : `?isResolved=${isResolved}`;
            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllHelpAndSupport${queryParams}`);
            const filteredData = response.data.data.filter(item =>
                item.complainantName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setData(filteredData);
            setTotalPages(Math.ceil(filteredData.length / 10));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    const handleReadMoreClick = (message) => {
        setSelectedMessage(message);
        setShowReadMoreDialog(true);
    };

    const handleCloseReadMoreDialog = () => {
        setShowReadMoreDialog(false);
        setSelectedMessage('');
    };

    const handleOpenResolveDialog = (item) => {
        setSelectedItem(item);
        setShowResolveDialog(true);
    };

    const handleCloseResolveDialog = () => {
        setShowResolveDialog(false);
        setSelectedItem(null);
        setAdminReply('');
    };

    const handleMarkAsResolved = async () => {
        if (!adminReply.trim()) {
            toast.warning('Please provide a resolution message.');
            return;
        }

        try {
            setLoading(true);

            const adminLoginResponse = localStorage.getItem('AdminLoginResponse');
            if (adminLoginResponse) {
                const user = JSON.parse(adminLoginResponse);
                const userName = user.username;

                const { grievanceId, complaintMessage, complainantId, complainantName } = selectedItem;
                const payload = {
                    grievanceId,
                    complaintMessage,
                    isResolved: true,
                    complainantId,
                    complainantName,
                    userName,
                    adminReply
                };

                await axios.post(`${BACKEND_BASEURL}/admin/resolveHelpAndSupport`, payload);
                toast.success('Issue marked as resolved!');
                handleCloseResolveDialog();
                fetchHelpAndSupportData();
            }

            setLoading(false);
        } catch (error) {
            console.error('Error marking as resolved:', error);
            setLoading(false);
        }
    };

    const handleDeleteHelpAndSupport = async (grievanceId) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                setLoading(true);
                await axios.delete(`${BACKEND_BASEURL}/admin/deleteHelpAndSupport?grievanceId=${grievanceId}`);
                toast.success('Ticket deleted successfully!');
                fetchHelpAndSupportData();
                setLoading(false);
            } catch (error) {
                console.error('Error deleting ticket:', error);
                toast.error('Failed to delete ticket.');
                setLoading(false);
            }
        }
    };

    const renderPaginationItems = (item) => {
        if (totalPages <= 5) {
            return true;
        }

        if (item.page === 1 || item.page === totalPages || item.page === page || item.page === page - 1 || item.page === page + 1) {
            return true;
        }

        if ((item.page === page - 2 && page > 3) || (item.page === page + 2 && page < totalPages - 2)) {
            return 'ellipsis';
        }

        if ((item.page === 2 && page > 3) || (item.page === totalPages - 1 && page < totalPages - 2)) {
            return 'hidden';
        }

        return false;
    };

    return (
        <div className='helpSupportAdminMainPage'>
            <ToastContainer />
            <div className='helpSupport_Section'>
                <div className='helpSupportSubSection'>
                    <div className='helpSupportHeaderText'>Support Portal</div>
                    <div className="helpSupportSearchBox">
                        <input
                            className="helpSupportSearchInput"
                            placeholder="Search name"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                        <img src={SearchIcon} alt="Search" />
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loader-overlay">
                    <PulseLoader size={15} color="#219EBC" loading={loading} />
                </div>
            )}

            <div className='helpSupportTableContainer'>
                <div className='helpSupportMainSection'>
                    <div className='statusFilter'> 
                        <div 
                            onClick={() => handleStatusChange('resolved')} 
                            className={`resolvedButton ${statusFilter === 'resolved' ? 'selected' : ''}`}
                        >
                            Resolved
                        </div>
                        <div 
                            onClick={() => handleStatusChange('unresolved')} 
                            className={`resolvedButton ${statusFilter === 'unresolved' ? 'selected' : ''}`}
                        >
                            Unresolved
                        </div>
                    </div>
                    <table className="helpSupportMasterTable">
                        <thead>
                            <tr>
                                <th>Issue Raised By</th>
                                <th>Description of Issue</th> 
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice((page - 1) * 10, page * 10).map((item) => (
                                <tr key={item.grievanceId}>
                                    <td style={{width:'200px'}}>
                                        <div className='supportSection'>
                                            <span className='helpSupportName'>{item.complainantName}</span>
                                            <div className='supportSubSection'>
                                                <img src={Alarm} alt='' />
                                                <span className='helpSupportDate'>{new Date(item.creationTimeStamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                        {item.complaintMessage?.length > 200 ? (
                                            <>
                                                {item.complaintMessage?.substring(0, 200)}...
                                                <span
                                                    className="readMoreLink"
                                                    onClick={() => handleReadMoreClick(item.complaintMessage)}
                                                >
                                                    Read More
                                                </span>
                                            </>
                                        ) : (
                                            item.complaintMessage
                                        )}
                                    </td>
                                    <td>
                                        <div className="actionButtons">
                                            {!item.isResolved && (
                                                <Tooltip title="Mark as Resolved">
                                                    <div 
                                                        className='markAsResolveDiv' 
                                                        onClick={() => handleOpenResolveDialog(item)}
                                                    >
                                                        <img src={resolvedIcon} alt="Mark as Resolved" />
                                                    </div>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Delete Ticket">
                                                <div 
                                                    className='deleteIconDiv' 
                                                    onClick={() => handleDeleteHelpAndSupport(item.grievanceId)}
                                                >
                                                    <span className="deleteText">&times;</span>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="PaginationContainer">
                <Stack spacing={2}>
                    <Pagination 
                        page={page}
                        count={totalPages}
                        onChange={handleChangePage}
                        renderItem={(item) => {
                            const shouldRender = renderPaginationItems(item);

                            if (shouldRender === 'ellipsis') {
                                return <PaginationItem key={item.page} {...item} type="start-ellipsis" shape="circular" />;
                            }

                            if (shouldRender === 'hidden') {
                                return null;
                            }

                            return (
                                <PaginationItem
                                    key={item.page}
                                    {...item}
                                    sx={{
                                        backgroundColor: 'white',  
                                        border: '1px solid #EDEDF1',
                                        color: '#333333',
                                        fontWeight: 600,
                                        padding: '10px',
                                        '&.Mui-selected': {
                                            backgroundColor: '#219EBC',  
                                            color: 'white',  
                                            border: 'none',  
                                            padding: '10px',  
                                        },
                                        '&:hover': {
                                            backgroundColor: 'white',  
                                            border: '1px solid #EDEDF1',  
                                            color: '#333333', 
                                        },
                                    }}
                                />
                            );
                        }}
                    />
                </Stack>
            </div>
            {showReadMoreDialog && (
                <div className="popup-overlay">
                    <div className="popup">
                        <div className="popup-header">
                            Description
                            <span className="close" onClick={handleCloseReadMoreDialog}>&times;</span>
                        </div>
                        <div className="popup-content">
                            {selectedMessage}
                        </div>
                    </div>
                </div>
            )}
            {showResolveDialog && (
                <div className="popup-overlay">
                    <div className="popup">
                        <div className="popup-header">
                            Resolve Issue
                            <span className="close" onClick={handleCloseResolveDialog}>&times;</span>
                        </div>
                        <div className="popup-content">
                            <div className="resolve-details">
                                <p><strong>Issue:</strong> {selectedItem?.complaintMessage}</p>
                                <textarea
                                    className="resolve-textarea"
                                    placeholder="Enter resolution message..."
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                />
                                <button className="resolve-submit-btn" onClick={handleMarkAsResolved}>
                                    Mark as Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHelpSupport;
