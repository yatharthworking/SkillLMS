import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HolidayMaster.css';
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import Edit from "../../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import fiEdit from "../../../../Assets/Images/fi_edit.svg";
import fiDelete from "../../../../Assets/Images/delete.svg";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import fiClose from "../../../../Assets/Images/fi_close.svg"
import ImportIcon from "../../../../Assets/Images/importIcon.svg"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { BACKEND_BASEURL } from "../../../helper";
import PulseLoader from 'react-spinners/PulseLoader';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import UploadIcon from '../../../../Assets/Images/UploadIcon.svg';
import CloseImport from '../../../../Assets/Images/closeImport.svg';
import HolidayTemplate from '../../../../Assets/ExcelTemplate/HolidayTemplate.xls';
import { getFromLocalStorageSafe } from '../../../helper';

const formatDateForApi = (dateString) => {
    if (!dateString) {
        return '';
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        return dateString;
    }

    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) {
        return '';
    }

    return `${day}-${month}-${year}`;
};

const formatDateForInputValue = (dateString) => {
    if (!dateString) {
        return '';
    }

    const [day, month, year] = dateString.split('-');
    if (!day || !month || !year) {
        return '';
    }

    return `${year}-${month}-${day}`;
};

export default function HolidayMaster() {
    const organizationId = process.env.REACT_APP_ORGANISATION_ID;
    const [searchQuery, setSearchQuery] = useState('');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [holidays, setHolidays] = useState([]);
    const [filteredHolidays, setFilteredHolidays] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('All');
    const [branchMasterList, setBranchMasterList] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const itemsPerPage = 10; // Number of items to display per page
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDelDialog, setShowDelDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const [selectedFile, setSelectedFile] = useState('');
    const [loadingImportHoliday, setLoadingImportHoliday] = useState(false);
        const token = localStorage.getItem("token"); 
        const adminDetail = getFromLocalStorageSafe('adminDetails');
        const adminLoginResponse = getFromLocalStorageSafe('AdminLoginResponse');
                const userDetailsId = adminDetail?.userDetailsId;

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const branchId = adminDetail?.organizationsDB?.orgId;
    const userName = adminDetail?.email || adminLoginResponse?.username || '';
    
    const [holidayToEdit, setHolidayToEdit] = useState({
        holidayId: null,
        holidayName: '',
        holidayType: '',
        holidayFromDate: '',
        holidayToDate: '',
        branchId: ''
        // Add other necessary properties
    });

    const effectiveBranchId = holidayToEdit.branchId || selectedBranchId || (branchId ? String(branchId) : '');
    

    const closeDialog = () => {
        setShowDialog(false);
        setHolidayToEdit({ // Reset holidayToEdit state
            holidayId: null,
            holidayName: '',
            holidayType: '',
            holidayFromDate: '',
            holidayToDate: '',
            branchId: selectedBranchId || (branchId ? String(branchId) : '')
        });
        setIsEditing(false); // Reset editing mode
    };

    const openDialog = () => {
        setHolidayToEdit({
            holidayId: null,
            holidayName: '',
            holidayType: '',
            holidayFromDate: '',
            holidayToDate: '',
            branchId: selectedBranchId || (branchId ? String(branchId) : '')
        });
        setShowDialog(true);
        setIsEditing(false); // Set to false when adding new holiday
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userName && effectiveBranchId) {
    
            // Prepare the payload based on holidayToEdit or new holiday data
            const payload = {
                holidayId: holidayToEdit ? holidayToEdit.holidayId : null, // Include holidayId for updating
                holidayName: holidayToEdit ? holidayToEdit.holidayName : '',
                holidayType: holidayToEdit ? holidayToEdit.holidayType : '',
                holidayFromDate: holidayToEdit ? formatDateForApi(holidayToEdit.holidayFromDate) : '',
                holidayToDate: holidayToEdit ? formatDateForApi(holidayToEdit.holidayToDate) : '',
                isActive: true, // Assuming isActive is always true for new or updated holidays
                userName: userName,
                organizationsDB: {
                    orgId: Number(effectiveBranchId),
                }
            };
    
            try {
                let response;
                setIsLoading(true);
                if (isEditing && holidayToEdit && holidayToEdit.holidayId) {
                    // Perform update logic
                    console.log('Updating holiday:', holidayToEdit);
                    response = await axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateHolidayMaster`, payload);
                    // Handle success response, if needed
                    toast.success('Holiday updated successfully!');
                } else {
                    // Perform add new holiday logic
                    console.log('Adding new holiday');
                    response = await axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateHolidayMaster`, payload);
                    // Handle success response, if needed
                    toast.success('Holiday created successfully!');
                }
    
                console.log('API Response:', response.data);
    
                closeDialog(); // Close dialog after successful submission
                    setSelectedBranchId(String(effectiveBranchId));
                // Optionally, you can fetch holidays again to refresh the list
                fetchHolidays();
            } catch (error) {
                console.error('Error submitting holiday:', error);
                toast.error(error?.response?.data?.message || 'Failed to submit holiday.');
            }finally {
                setIsLoading(false); // Set loading to false after API call completes
            }
        } else {
            toast.error('Admin branch details not found.');
        }
    };
    
    

    useEffect(() => {
        if (branchId && !selectedBranchId) {
            setSelectedBranchId(String(branchId));
        }
    }, [branchId, selectedBranchId]);

    useEffect(() => {
        if (!token || !userDetailsId || !organizationId) {
            return;
        }

        const fetchBranchMaster = async () => {
            try {
                const response = await axios.get(
                    `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${userDetailsId}`
                );

                const data = Array.isArray(response?.data?.data) ? response.data.data : [];
                setBranchMasterList(data);

                if (!selectedBranchId && data.length > 0) {
                    const defaultBranchId = branchId ? String(branchId) : String(data[0].orgId);
                    setSelectedBranchId(defaultBranchId);
                }
            } catch (error) {
                console.error('Error fetching branches:', error);
                setBranchMasterList([]);
            }
        };

        fetchBranchMaster();
    }, [token, userDetailsId, organizationId, branchId, selectedBranchId]);

    useEffect(() => {
        fetchHolidays();
    }, [page, selectedBranchId]);

    useEffect(() => {
        filterHolidays();
    }, [searchQuery, holidays, selectedYear]);

    const filterHolidays = () => {
        const filtered = holidays.filter(holiday => {
            const holidayName = holiday.holidayName || '';
            const holidayYear = holiday?.holidayFromDate?.split('-')?.[2] || '';
            const matchesYear = selectedYear === 'All' || holidayYear === selectedYear;
            return holidayName.toLowerCase().includes(searchQuery.toLowerCase()) && matchesYear;
        });
        setFilteredHolidays(filtered);
        // Calculate total pages based on filtered data
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };


    const fetchHolidays = async () => {
        try {
            setIsLoading(true); 
            if (!selectedBranchId) {
                setHolidays([]);
                setFilteredHolidays([]);
                setYears([]);
                return;
            }

            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchAllHolidays?branchId=${selectedBranchId}`);
            const holidaysData = Array.isArray(response?.data?.data) ? response.data.data : [];
            setHolidays(holidaysData);
    
            const uniqueYears = [...new Set(holidaysData.map(holiday => holiday?.holidayFromDate?.split('-')?.[2]).filter(Boolean))];
            setYears(uniqueYears.sort());
    
        } catch (error) {
            console.error('Error fetching holidays:', error);
            setHolidays([]);
            setFilteredHolidays([]);
            setYears([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1); // Reset to the first page when searching
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setPage(1); // Reset to the first page when changing year
    };

    const handleMenuOpen = (event, holidayId) => {
        setMenuAnchor(event.currentTarget);
        // Find the holiday object from holidays state based on holidayId
        const holidayToUpdate = holidays.find(holiday => holiday.holidayId === holidayId);
        if (holidayToUpdate) {
            setHolidayToEdit({
                ...holidayToUpdate,
                holidayFromDate: formatDateForInputValue(holidayToUpdate.holidayFromDate),
                holidayToDate: formatDateForInputValue(holidayToUpdate.holidayToDate),
                branchId: String(holidayToUpdate?.organizationsDB?.orgId || selectedBranchId || branchId || '')
            }); // Set holidayToEdit state for editing
        }
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleEditClick = () => {
        handleMenuClose();
        setIsEditing(true); // Set editing mode to true
        setShowDialog(true); // Open the dialog
    };

    const handleDeleteItem = () =>{
        handleMenuClose();
        setShowDelDialog(true);
    }

    const closeDeleteDialog = () => {
        setShowDelDialog(false);
    };

    const handleDeleteClick = async () => {
        if (userName && holidayToEdit?.branchId) {
    
            handleMenuClose();
    
            const payload = {
                holidayId: holidayToEdit.holidayId,
                holidayName: holidayToEdit.holidayName,
                holidayType: holidayToEdit.holidayType,
                holidayFromDate: formatDateForApi(holidayToEdit.holidayFromDate),
                holidayToDate: formatDateForApi(holidayToEdit.holidayToDate),
                isActive: false,
                userName: userName,
                organizationsDB: {
                    orgId: Number(holidayToEdit.branchId),
                }
            };
    
            try {
                await axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateHolidayMaster`, payload);
                toast.success('Holiday deleted successfully!');
                setSelectedBranchId(String(holidayToEdit.branchId));
                fetchHolidays();
                setShowDelDialog(false);
            } catch (error) {
                console.error('Error deleting holiday:', error);
                toast.error(error?.response?.data?.message || 'Failed to delete holiday.');
            }
        } else {
            toast.error('Admin branch details not found.');
        }
    };
    

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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

    function formatDateToReadable(dateString) {
        if (!dateString) {
            return '-';
        }

        const date = new Date(dateString.split('-').reverse().join('-'));
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
    
        // Add suffix for the day
        const suffixes = ["th", "st", "nd", "rd"];
        const daySuffix = (day % 10 <= 3 && (day < 10 || day > 20)) ? suffixes[day % 10] : "th";
    
        return `${day}${daySuffix} ${month} ${year}`;
    }
    
const handleOpenImportDialog = () => {
    setShowImportDialog(true);
};

const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
};

   

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        console.log("Filee",file)
        if (file) {
            setSelectedFile(file);
        }
    };

    const clearSelectedFileName = () => {
        setSelectedFile(null);
    };

    const handleImportHoliday = async () => {

        if (!selectedFile)
        { 
            toast.error("Select file to upload!!")
            return;
        }

        setLoadingImportHoliday(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const importBranchId = selectedBranchId || (branchId ? String(branchId) : '');
            const url = `${BACKEND_BASEURL}/admin/bulk-upload?name=HOLIDAY_MASTER&branchId=${importBranchId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if(response.status === 200){
                toast.success("Holiday Imported Successfully!!", {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  fetchHolidays();
                handleCloseImportDialog(); // close dialog on success
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            // handle error response
        } finally {
            setLoadingImportHoliday(false);
        }
    };

    return (
        <div className='holidayMasterAdminMainPage'>
        <ToastContainer />
            <div className='holidayMaster_Section'>
                <div className='holidayMasterSubSection'>
                    <div className='holidayMasterHeaderText'>Holidays</div>
                    <div className="holidayMasterSearchBox">
                        <input
                            className="holidayMasterSearchInput"
                            placeholder="Search holiday"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                        />
                        <img src={SearchIcon} alt="Search" />
                    </div>
                    <div className='selectYaerDiv'>
                        <div className='calendarLabelText'>Calendar Year:</div>
                        <select className='yearSelectionDiv' value={selectedYear} onChange={handleYearChange}>
                            <option>All</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='importButtonGroup'>

                    <div className='importBtn' onClick={handleOpenImportDialog}>
                        <img src={ImportIcon} alt='' /><span>Import</span>
                    </div>

                    <div className='holidayMasterButtonDiv'  onClick={openDialog}>
                        <img src={Plus} alt="Add" />
                        <div className='webinarButton'>New Holiday</div>
                    </div>
                </div>
            </div>

            <div className='holidayMasterTableContainer'>
                <div className='holidayMasterMainSection'>
                    <table className="holidayMasterTable">
                        <thead>
                            <tr>
                                <th>Holiday Name</th>
                                <th>Holiday Type</th> 
                                <th>From Date</th>
                                <th>To Date</th> 
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {isLoading && ( // Render PulseLoader when isLoading is true
                            <div className="loader-container">
                                <PulseLoader color="#219EBC" size={15} margin={5} />
                            </div>
                            )}
                            {filteredHolidays.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((holiday) => (
                                <tr key={holiday.holidayId}>
                                    <td style={{fontWeight:'600',color:'#23252E'}}>{holiday.holidayName}</td>
                                    <td>{holiday.holidayType}</td>
                                    <td>{formatDateToReadable(holiday.holidayFromDate)}</td>
                                    <td>{formatDateToReadable(holiday.holidayToDate)}</td>
                                    <td>
                                        <img 
                                            src={Edit} 
                                            alt="Edit" 
                                            style={{cursor: 'pointer'}} 
                                            onClick={(event) => handleMenuOpen(event, holiday.holidayId)}
                                        />
                                        <Menu
                                            anchorEl={menuAnchor} 
                                            open={Boolean(menuAnchor)}
                                            onClose={handleMenuClose}
                                            MenuListProps={{ onMouseLeave: handleMenuClose }}
                                        >
                                            <MenuItem onClick={handleEditClick}>
                                                <ListItemIcon>
                                                    <img src={fiEdit} alt="Edit" />
                                                </ListItemIcon>
                                                Edit
                                            </MenuItem>
                                            <MenuItem onClick={handleDeleteItem}>
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
                <div className="holidayDialog-overlay">
                    <div className="holidayDialog-content">
                        <div className="holidayDialog-header">
                        <div className='holidayHeader'>{isEditing ? "Edit Holiday" : "Add New Holiday"}</div>
                            <span className="holidayDialog-close" onClick={closeDialog}><img src={fiClose} alt='' /></span>
                        </div>

                        <div className='border2'></div>
                        <div className='holidayDialogBox'>
                            <div className="holidayDialog-body">
                                <div className='inputFiled'>
                                    <label className='labelText'>Holiday Name<span className='mandatoryFiled'>*</span></label>
                                    <input
                                        type="text"
                                        className='holidayInputFieldText'
                                        placeholder='Enter Title' 
                                        value={holidayToEdit.holidayName? holidayToEdit.holidayName : ''}
                                        onChange={(e) => setHolidayToEdit({ ...holidayToEdit, holidayName: e.target.value })}
                                        required
                                    />
                                </div> 
                                <div className='inputFiled'>
                                    <label className='labelText'>Holiday Type<span className='mandatoryFiled'>*</span></label>
                                    <select
                                        className='selectOneMenuField' 
                                        value={holidayToEdit.holidayType ? holidayToEdit.holidayType : ''} 
                                        onChange={(e) => setHolidayToEdit({ ...holidayToEdit, holidayType: e.target.value })}
                                        required
                                    > 
                                    <option value="" disabled>Select</option>
                                    <option>National</option>
                                    <option>Religious</option>
                                    <option>Others</option>
                                    </select> 
                                </div> 
                            </div>
                            <div className="holidayDialog-body">
                                <div className='inputFiled'>
                                    <label className='labelText'>Branch<span className='mandatoryFiled'>*</span></label>
                                    <select
                                        className='selectOneMenuField'
                                        value={effectiveBranchId}
                                        onChange={(e) => setHolidayToEdit({ ...holidayToEdit, branchId: e.target.value })}
                                        required
                                    > 
                                    <option value="" disabled>Select</option>
                                    {branchMasterList.map((branch) => (
                                        <option key={branch.orgId} value={branch.orgId}>
                                            {branch.orgName}
                                        </option>
                                    ))}
                                    </select> 
                                </div>
                                <div className='inputFiled'>
                                    <label className='labelText'>Start Date<span className='mandatoryFiled'>*</span></label>
                                    <input
                                        type="date"
                                        className='dateInputFieldText'
                                        placeholder='Enter Title'
                                        value={holidayToEdit.holidayFromDate ? holidayToEdit.holidayFromDate : ''}
                                        onChange={(e) => setHolidayToEdit({ ...holidayToEdit, holidayFromDate: e.target.value })}
                                        required
                                    />

                                </div>
                                <div className='inputFiled'>
                                    <label className='labelText'>End Date<span className='mandatoryFiled'>*</span></label>
                                    <input
                                        type="date"
                                        className='dateInputFieldText'
                                        placeholder='Enter Title'
                                        value={holidayToEdit && holidayToEdit.holidayToDate ? holidayToEdit.holidayToDate: ''}
                                        onChange={(e) => setHolidayToEdit({ ...holidayToEdit, holidayToDate: e.target.value })}
                                        required
                                    />

                                </div> 
                            </div>
                        </div>
                        <div className="dialog-footer">
                            <button onClick={closeDialog} className='cancelHoliday'>Cancel</button>
                            <button type="submit" className='createHoliday' onClick={handleSubmit}>{isEditing ? "Update" : "Add"}</button>
                        </div>
                    </div>
                </div>
            )}

            {showDelDialog && (
                <div className="holidayDelDialog-overlay">
                    <div className="holidayDelHeader-content">
                        <div className="holidayDelHeader">
                            <div className='holidayHeader'>Delete Holiday</div>
                            <span className="holidayDialog-close" onClick={closeDeleteDialog}><img src={fiClose} alt='' /></span>
                        </div>
                        <div className="holidayDelBody">
                            <div className='textDiv'>
                                Are you sure you want to delete holiday “{holidayToEdit.holidayName}”?
                            </div>
                            <div className="dialog-footer">
                                <button onClick={closeDeleteDialog} className='cancelHoliday'>Cancel</button>
                                <button type="submit" className='createHoliday' onClick={handleDeleteClick}>Delete</button>
                            </div>
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
            
            {/* PopUp for import */}
            <Dialog open={showImportDialog} onClose={handleCloseImportDialog}>
                <DialogTitle>
                <div className='dialogChapterHeader'>
                    <span className="CertifyDialogTitleTxt">Import Holidays</span>
                    <button className="close-button" onClick={handleCloseImportDialog}>&#x2716;</button>
                </div>
                <div className="userHeaderHorizontalLine"></div>
                </DialogTitle> 

                <DialogContent>
                    <div className='importDialogBodyContainer'>
                        <div className='importDialogBody'>
                            <div className='importDialogSubHeader'>Step 1</div>
                            <div className='importDialogSTxt'>Download our pre-built (.xls or .xlsx) template.</div>
                            <a className='importDialogDownloadTempelate' href={HolidayTemplate} download="HolidayTemplate.xls">
                                Download Template
                            </a>

                        </div>

                        <div className='importDialogBody' style={{width:'300px'}}>
                            <div className='importDialogSubHeader'>Step 2</div>
                            <div className='importDialogSTxt'>Fill in data in the template and upload here.</div>
                            <label className='importDialogImportTempelate' htmlFor='fileInput'>
                                <span><img src={UploadIcon} alt='' /></span>
                                <span>Upload CSV File</span>
                                <input type='file'  id='fileInput' accept='.xls,.xlsx' style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                        </div>
                        {selectedFile &&(
                            <div className='importDialogBody' style={{width:'300px'}}>
                                <div className='selectedFileBox'>
                                    <span className='selectedFileBoxTxt'>{selectedFile.name}</span>
                                    <span style={{cursor:'pointer'}} onClick={clearSelectedFileName}><img src={CloseImport} alt='' /></span>
                                </div>
                            </div>
                        )}

                        <div className="userHeaderHorizontalLine" style={{margin:'0px'}}></div>
                    </div>
                    
                </DialogContent>
                <DialogActions>
                <div className='dialogActionBtn'>
                    <div className='closeBtn' onClick={handleCloseImportDialog}>Cancel</div>
                    <div className='addBtn' onClick={handleImportHoliday}>
                        {loadingImportHoliday? <CircularProgress size={20}  style={{color:'white'}}/> : 'Import'}
                    </div>
                </div>
                </DialogActions>
            </Dialog>

        </div>
    );
}
