import React, { useState, useEffect } from 'react';
import './AnnouncementTable.css'
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import Edit from "../../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import fiEdit from "../../../../Assets/Images/fi_edit.svg";
import fiDelete from "../../../../Assets/Images/delete.svg";
import ListItemIcon from "@mui/material/ListItemIcon";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import fiClose from "../../../../Assets/Images/fi_close.svg"
import axios from 'axios';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../../helper";
import PulseLoader from 'react-spinners/PulseLoader';

const AnnouncementTable = () => {
    const adminDetail = getFromLocalStorageSafe('adminDetails');
    const adminLoginResponse = getFromLocalStorageSafe('AdminLoginResponse');
    const userRole = adminDetail?.roles?.[0]?.role?.roleMasterName;
    const orgId = adminDetail?.organizationsDB?.orgId || null;
    const currentUserName = adminLoginResponse?.username || adminDetail?.email || '';
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginatedAnnouncements, setPaginatedAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showReadMoreDialog, setShowReadMoreDialog] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');

    const handleCloseReadMoreDialog = () => {
        setShowReadMoreDialog(false);
        setSelectedMessage('');
    };

    const handleReadMoreClick = (message) => {
        setSelectedMessage(message);
        setShowReadMoreDialog(true);
    };


    const [formData, setFormData] = useState({
        batchId: "",
        batchName: "",
        announcementId:"",
        announcementTitle: "",
        announcementMessage: "",
    });

    const token = localStorage.getItem("token");
    const getRequestConfig = (params = {}) => {
        const config = {};
        if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
        }
        if (Object.keys(params).length > 0) {
            config.params = params;
        }
        return config;
    };

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                if (!token) {
                    return;
                }
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                if (userRole === 'SUPER_ADMIN') {
                    const response = await axios.get(`${BACKEND_BASEURL}/masters/fetchBatchMaster`, config);
                    setAvailableBatches(response.data.allBatches || response.data.batchMaster || []);
                } else if (userRole === 'ADMIN' && orgId) {
                    const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchBatchByOrgId`, {
                        ...config,
                        params: { orgId },
                    });
                    const allBranchBatches =
                        response.data.allBatches ||
                        [
                            ...(response.data.ongoingBatches || []),
                            ...(response.data.upcomingBatches || []),
                            ...(response.data.completedBatches || []),
                        ];
                    setAvailableBatches(allBranchBatches);
                }
            } catch (error) {
                console.error("Error fetching ongoing batches", error);
                setAvailableBatches([]);
            }
        };
        fetchBatches();
    }, [userRole, orgId, token]);
    

    //For Super Admin
    // useEffect(() => {
    //     const fetchOngoingBatches = async () => {
    //         try {
    //             const response = await axios.get(`${BACKEND_BASEURL}/masters/fetchBatchMaster`);
    //             setOngoingBatches(response.data.batchMaster); // Update state with batchMaster array
    //             console.log("setOngoingBatches",response.data.batchMaster)
    //         } catch (error) {
    //             console.error("Error fetching ongoing batches", error);
    //         }
    //     };  
    
    //     fetchOngoingBatches();
    // }, []);
     // Empty dependency array ensures it runs only once on component mount

     //For Admin
    //  useEffect(() => {
    //     const fetchOngoingBatchesForAdmin = async () => {
    //         try {
    //             const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchBatchByOrgId?orgId=1`);
    //             setOngoingAdminBatches(response.data.batchMaster); // Update state with batchMaster array
    //             console.log("setOngoingAdminBatches",response.data.batchMaster)
    //         } catch (error) {
    //             console.error("Error fetching ongoing batches", error);
    //         }
    //     };
    //     fetchOngoingBatchesForAdmin();
    //  },[]);

    useEffect(() => {
        const loadAnnouncements = async () => {
            try {
                if (!token) {
                    setAnnouncements([]);
                    setTotalPages(0);
                    return;
                }
                setIsLoading(true);
                const params = orgId ? { branchId: orgId } : {};
                const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllAnnouncements`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    ...(Object.keys(params).length > 0 ? { params } : {}),
                });
                const announcementData = Array.isArray(response?.data?.data) ? response.data.data : [];
                setAnnouncements(announcementData);
                setTotalPages(Math.ceil(announcementData.length / 10));
            } catch (error) {
                console.error("Error fetching announcements", error);
                setAnnouncements([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnnouncements();
    }, [orgId, token]);

    const fetchAnnouncements = async () => {
        try {
            if (!token) {
                setAnnouncements([]);
                setTotalPages(0);
                return;
            }
            setIsLoading(true); // Set loading state when fetching data
            const params = orgId ? { branchId: orgId } : {};
            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllAnnouncements`, getRequestConfig(params));
            const announcementData = Array.isArray(response?.data?.data) ? response.data.data : [];
            setAnnouncements(announcementData);
            setTotalPages(Math.ceil(announcementData.length / 10));
        } catch (error) {
            console.error("Error fetching announcements", error);
            setAnnouncements([]);
            setTotalPages(0);
        } finally {
            setIsLoading(false); // Always clear loading state after API call, whether success or failure
        }
    };


    const handleMenuOpen = (event, announcementId) => {
        setMenuAnchor(event.currentTarget);
        setSelectedAnnouncementId(announcementId);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedAnnouncementId(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleEditClick = (announcement) => { 
        console.log("announcement",announcement)
        setIsEditing(true);
        setSelectedAnnouncementId(announcement.announcementId);
        setFormData({
            batchId: announcement.batchId,
            batchName: announcement.batchName,
            announcementId: announcement.announcementId,
            announcementTitle: announcement.announcementTitle,
            announcementMessage: announcement.announcementMessage,
        });
        setShowDialog(true);
        handleMenuClose(); // Close the menu when editing
    };

    const handleDeleteClick = async (announcement) => {
        try {
            if (!token) {
                toast.error('Your session has expired. Please log in again.');
                return;
            }

            const response = await axios.post(`${BACKEND_BASEURL}/admin/editAnnouncementToBatch`, {
                batchId: announcement.batchId,
                announcements: [
                    {
                        announcementId: announcement.announcementId,
                        announcementTitle: announcement.announcementTitle,
                        announcementMessage: announcement.announcementMessage,
                        userName: currentUserName,
                        isActive: false
                    }
                ]
            }, getRequestConfig());

            if (response?.data?.status) {
                const updatedAnnouncements = announcements.filter(item => item.announcementId !== announcement.announcementId);
                setAnnouncements(updatedAnnouncements);
                setTotalPages(Math.ceil(updatedAnnouncements.length / 10));
                toast.success('Announcement deleted successfully!');
                return;
            }

            toast.error(response?.data?.message || 'Error deleting announcement.');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error(error?.response?.data?.Exception || error?.response?.data?.message || 'Error deleting announcement.');
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

    const openDialog = () => {
        setIsEditing(false);
        setFormData({
            batchId: "",
            batchName: "",
            announcementTitle: "",
            announcementMessage: "",
        });
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, "do MMM yyyy"); // Formats date as 1st Aug 2024
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
            batchName: name === 'batchId'
                ? availableBatches.find(batch => batch.batchId === parseInt(value, 10))?.batchName || ''
                : prevState.batchName
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!token) {
                toast.error('Your session has expired. Please log in again.');
                return;
            }

            if (!currentUserName) {
                toast.error('Admin details not found.');
                return;
            }

            setIsLoading(true); // Set loading state when submitting

            if (isEditing) {
                const response = await axios.post(`${BACKEND_BASEURL}/admin/editAnnouncementToBatch`, {
                    batchId: formData.batchId,
                    announcements: [
                        {
                            announcementId: formData.announcementId,
                            announcementTitle: formData.announcementTitle,
                            announcementMessage: formData.announcementMessage,
                            userName: currentUserName,
                            isActive: true
                        }
                    ]
                }, getRequestConfig());

                if (!response?.data?.status) {
                    throw new Error(response?.data?.message || 'Unable to update announcement.');
                }

                await fetchAnnouncements();
                toast.success('Announcement Successfully Updated!');
            } else {
                const response = await axios.post(`${BACKEND_BASEURL}/admin/addAnnouncementToBatch`, {
                    batchId: formData.batchId,
                    batchName: formData.batchName,
                    announcements: [
                        {
                            announcementTitle: formData.announcementTitle,
                            announcementMessage: formData.announcementMessage,
                            userName: currentUserName,
                            isActive: true
                        }
                    ]
                }, getRequestConfig());

                if (!response?.data?.status) {
                    throw new Error(response?.data?.message || 'Unable to create announcement.');
                }

                await fetchAnnouncements();
                toast.success('Announcement Successfully Created!');
            }

            closeDialog();
        } catch (error) {
            console.error('Error creating/editing announcement:', error);
            toast.error(error?.response?.data?.Exception || error?.response?.data?.message || error.message || 'Error creating/editing announcement.');
        } finally {
            setIsLoading(false); // Clear loading state after submission
        }
    };
    

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };
    
    const filteredAnnouncements = announcements.filter(announcement => {
        const announcementTitle = announcement.announcementTitle || '';
        const announcementMessage = announcement.announcementMessage || '';
        const batchName = announcement.batchName || '';
        const announcementByName = announcement.announcementByName || '';
    
        return (
            announcementTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcementMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            announcementByName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const paginateAnnouncements = (announcements, currentPage, pageSize) => {
        const startIndex = (currentPage - 1) * pageSize;
        return announcements.slice(startIndex, startIndex + pageSize);
    };

    useEffect(() => {
        // Filter and sort announcements as needed
    const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
        // Example sorting by creation timestamp (adjust as per your data structure)
        return new Date(b.creationTimeStamp) - new Date(a.creationTimeStamp);
    });

    // Paginate the sorted announcements
    setTotalPages(Math.ceil(sortedAnnouncements.length / 10));
    setPaginatedAnnouncements(paginateAnnouncements(sortedAnnouncements, page, 10));
    }, [filteredAnnouncements, page]);
    
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);
    
    

     
    
    return (
        <div className='announcementAdminMainPage'>
            <ToastContainer />
            {isLoading && ( // Render PulseLoader when isLoading is true
                <div className="loader-container">
                    <PulseLoader color="#219EBC" size={15} margin={5} />
                </div>
            )}
            <div className='announcement_Section'>
                <div className='announcementSubSection'>
                    <div className='announcementHeaderText'>Announcments</div>
                    <div className="announcmentSearchBox">
                        <input
                            className="announcementSearchInput"
                            placeholder="Search an announcement Batch"
                            value={searchQuery} // Bind input to search query state
                            onChange={handleSearchInputChange} // Update state on input change
                        />
                        <img src={SearchIcon} alt="Search" />
                    </div>
                </div>
                <div className='announcmentButtonDiv' onClick={openDialog}>
                    <img src={Plus} alt="Add" />
                    <div className='webinarButton' onClick={openDialog}>Create Announcment</div>
                </div>
            </div>

            <div className='announcmentTableContainer'>
                <div className='announcmentMainSection'>
                    <table className="announcmentTable">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Message</th> 
                                <th>Announcment To Batch</th>
                                <th>Created By</th> 
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAnnouncements.map((announcement) => (
                                <tr key={announcement.announcementId}>
                                    <td><span>{formatDate(announcement?.creationTimeStamp)}</span><br/><span className='announcmentName'>{announcement.announcementTitle}</span></td>
                                    
                                    <td>
                                        {announcement?.announcementMessage?.length > 100 ? (
                                            <>
                                                {announcement?.announcementMessage?.substring(0, 100)}...
                                                <span
                                                    className="readMoreLink"
                                                    onClick={() => handleReadMoreClick(announcement.announcementMessage)}
                                                >
                                                    Read More
                                                </span>
                                            </>
                                        ) : (
                                            announcement.announcementMessage
                                        )}
                                    </td>
                                    <td>{announcement?.batchName}</td>
                                    <td>{announcement?.announcementByName}</td>
                                    <td>
                                        <img src={Edit} alt="Edit" style={{cursor: 'pointer'}} onClick={(event) => handleMenuOpen(event, announcement.announcementId)}/>
                                        <Menu
                                            anchorEl={menuAnchor}
                                            open={Boolean(menuAnchor) && selectedAnnouncementId === announcement.announcementId}
                                            onClose={handleMenuClose}
                                            MenuListProps={{ onMouseLeave: handleMenuClose }}
                                        >
                                            <MenuItem onClick={() => handleEditClick(announcement)}>
                                                <ListItemIcon>
                                                    <img src={fiEdit} alt="Edit" />
                                                </ListItemIcon>
                                                Edit
                                            </MenuItem>
                                            <MenuItem onClick={()=> handleDeleteClick(announcement)}>
                                                <ListItemIcon>
                                                    <img src={fiDelete} alt="Delete" />
                                                </ListItemIcon>
                                                Delete
                                            </MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))}                        
                        </tbody>

                    </table>
                </div>
            </div>

            {showDialog && (
                <div className="dialog-overlay">
                    {isLoading && ( // Render PulseLoader when isLoading is true
                    <div className="loader-container">
                        <PulseLoader color="#219EBC" size={15} margin={5} />
                    </div>
                    )}
                    <div className="dialog-content">
                        <div className="dialog-header">
                        <div className='holidayHeader'>{isEditing ? "Edit Announcement" : "Create Announcement"}</div>
                            <span className="dialog-close" onClick={closeDialog}><img src={fiClose} alt='' /></span>
                        </div>

                        <div className='border2'></div>
                        <div className='dialogBox'>
                            <div className="dialog-body">
                            <div className='inputFiled'>
                                <label className='labelText'>Announcement Batch<span className='mandatoryFiled'>*</span></label>
                                <select
                                    className='selectOneMenuField'
                                    name="batchId"
                                    value={formData.batchId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing} // Disable select when editing
                                >
                                    <option value="" disabled>Select a batch</option>
                                        {availableBatches.map((batch) => (
                                            <option key={batch.batchId} value={batch.batchId}>
                                                {batch.batchName}
                                            </option>
                                        ))}
                                </select>

                            </div>


                                <div className='inputFiled'>
                                    <label className='labelText'>Title<span className='mandatoryFiled'>*</span></label>
                                    <input
                                        type="text"
                                        className='inputFieldText'
                                        placeholder='Enter Title'
                                        name="announcementTitle"
                                        value={formData.announcementTitle}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div> 
                            </div>

                            <div className='inputFiled'>
                                <label className='labelText'>Message</label>
                                <textarea
                                    type="text"
                                    placeholder='Enter Message'
                                    className='textArea'
                                    name="announcementMessage"
                                    value={formData.announcementMessage}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </div>
                        <div className="dialog-footer">
                            <button onClick={closeDialog} className='cancelAnnouncment'>Cancel</button>
                            <button type="submit" className='createAnnouncment' onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}

            {showReadMoreDialog && (
                <div className="announcment-popup-overlay">
                    <div className="announcmentpopup">
                        <div className="announcmentpopup-header">
                            Announcment Message
                            <span className="announcmentclose" onClick={handleCloseReadMoreDialog}>&times;</span>
                        </div>
                        <div className="announcmentpopup-content">
                            {selectedMessage}
                        </div>
                    </div>
                </div>
            )}

            <div className="PaginationContainer">
            <Stack spacing={2}>
                <Pagination
                    count={totalPages}
                    page={page}
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
        </div>
    )
}

export default AnnouncementTable;
