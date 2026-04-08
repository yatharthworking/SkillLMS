import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './Subject.css';
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import ImportIcon from "../../../../Assets/Images/importIcon.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SubjectTemplate from '../../../../Assets/ExcelTemplate/SubjectTemplate.csv';
import UploadIcon from '../../../../Assets/Images/UploadIcon.svg';
import CloseImport from '../../../../Assets/Images/closeImport.svg';
import Edit from "../../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import fiEdit from "../../../../Assets/Images/fi_edit.svg";
import fiDelete from "../../../../Assets/Images/delete.svg";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import fiClose from "../../../../Assets/Images/fi_close.svg";
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_BASEURL, getFromLocalStorageSafe } from '../../../helper';

const Subject = () => {
    const token = localStorage.getItem('token');
    const adminDetail = getFromLocalStorageSafe('adminDetails');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [subjectForm, setSubjectForm] = useState({
        subjectMasterId: null,
        subjectName: '',
    });
    const [activeSubject, setActiveSubject] = useState(null);
    const itemsPerPage = 10;
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const currentUserId = adminDetail?.userDetailsId || null;
    const isEditing = Boolean(subjectForm.subjectMasterId);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get(`${BACKEND_BASEURL}/public/getSubjectMaster`, authHeaders);
            setSubjects(Array.isArray(response?.data?.subjects) ? response.data.subjects : []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
            toast.error('Failed to fetch subjects.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const filteredSubjects = useMemo(() => {
        return subjects.filter((subject) => {
            const subjectName = String(subject?.subjectName || '').toLowerCase();
            return subjectName.includes(searchQuery.toLowerCase());
        });
    }, [searchQuery, subjects]);

    const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));

    const paginatedSubjects = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        return filteredSubjects.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSubjects, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1);
    };

    const handleOpenImportDialog = () => {
        setShowImportDialog(true);
    };

    const handleCloseImportDialog = () => {
        setShowImportDialog(false);
        setSelectedFile(null);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const clearSelectedFileName = () => {
        setSelectedFile(null);
    };
    
    const openDialog = () => {
        setSubjectForm({
            subjectMasterId: null,
            subjectName: '',
        });
        setActiveSubject(null);
        setShowAddDialog(true);
    };

    const handleMenuOpen = (event, subject) => {
        setMenuAnchor(event.currentTarget);
        setActiveSubject(subject);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleEditClick = () => {
        if (!activeSubject) {
            return;
        }

        setSubjectForm({
            subjectMasterId: activeSubject.subjectMasterId,
            subjectName: activeSubject.subjectName || '',
        });
        handleMenuClose();
        setShowAddDialog(true);
    };

    const handleDeleteItem = () => {
        handleMenuClose();
        setShowDeleteDialog(true);
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

    const closeDeleteDialog = () => {
        setSubjectForm({
            subjectMasterId: null,
            subjectName: '',
        });
        setActiveSubject(null);
        setShowAddDialog(false);
        setShowDeleteDialog(false);
    };

    const handleSubjectInputChange = (event) => {
        const { value } = event.target;
        setSubjectForm((previousSubjectForm) => ({
            ...previousSubjectForm,
            subjectName: value,
        }));
    };

    const handleSaveSubject = async (event) => {
        event.preventDefault();

        const subjectName = subjectForm.subjectName.trim();

        if (!subjectName) {
            toast.error('Subject name is required.');
            return;
        }

        if (!currentUserId) {
            toast.error('Admin details not found.');
            return;
        }

        const payload = {
            subjectMasterId: subjectForm.subjectMasterId,
            subjectName,
            isActive: true,
            ...(subjectForm.subjectMasterId
                ? { updatedBy: currentUserId }
                : { createdBy: currentUserId }),
        };

        try {
            setSaving(true);
            const response = await axios.post(`${BACKEND_BASEURL}/admin/addSubjectMaster`, payload, authHeaders);

            if (response?.data?.status) {
                toast.success(subjectForm.subjectMasterId ? 'Subject updated successfully!' : 'Subject created successfully!');
                closeDeleteDialog();
                fetchSubjects();
            } else {
                toast.error(response?.data?.message || 'Failed to save subject.');
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            toast.error(error?.response?.data?.message || 'Failed to save subject.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!activeSubject?.subjectMasterId || !currentUserId) {
            toast.error('Subject details not found.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                subjectMasterId: activeSubject.subjectMasterId,
                subjectName: activeSubject.subjectName,
                isActive: false,
                updatedBy: currentUserId,
            };

            const response = await axios.post(`${BACKEND_BASEURL}/admin/addSubjectMaster`, payload, authHeaders);

            if (response?.data?.status) {
                toast.success('Subject deleted successfully!');
                closeDeleteDialog();
                fetchSubjects();
            } else {
                toast.error(response?.data?.message || 'Failed to delete subject.');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            toast.error(error?.response?.data?.message || 'Failed to delete subject.');
        } finally {
            setSaving(false);
        }
    };

    const handleImportSubjects = async () => {
        if (!selectedFile) {
            toast.error('Select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setImporting(true);
            const response = await axios.post(
                `${BACKEND_BASEURL}/admin/bulk-upload?name=SUBJECT_MASTER`,
                formData,
                {
                    headers: {
                        ...authHeaders.headers,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response?.data?.status) {
                toast.success('Subjects imported successfully!');
                handleCloseImportDialog();
                fetchSubjects();
            } else {
                toast.error(response?.data?.message || 'Failed to import subjects.');
            }
        } catch (error) {
            console.error('Error importing subjects:', error);
            toast.error(error?.response?.data?.message || 'Failed to import subjects.');
        } finally {
            setImporting(false);
        }
    };

  return (
    <div className='subjectMasterAdminMainPage'>
        <ToastContainer position='top-right' autoClose={3000} />

        <div className='subjectMaster_Section'>
            <div className='subjectMasterSubSection'>
                <div className='subjectMasterHeaderText'>Subjects</div>
                <div className="subjectMasterSearchBox">
                    <input
                        className="subjectMasterSearchInput"
                        placeholder="Search subject"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                    />
                    <img src={SearchIcon} alt="Search" />
                </div>
            </div>
            <div className='importSubjectButtonGroup'>
                <div className='importSubjectBtn' onClick={handleOpenImportDialog}>
                    <img src={ImportIcon} alt='' /><span>Import</span>
                </div>

                <div className='subjectMasterButtonDiv'  onClick={openDialog}>
                    <img src={Plus} alt="Add" />
                    <div className='webinarButton'>New Subject</div>
                </div>
            </div>
        </div>

        <div className='subjectMasterTableContainer'>
            <div className='subjectMasterMainSection'>
                {loading ? (
                    <div className='subjectEmptyState'>
                        <CircularProgress size={28} />
                    </div>
                ) : (
                    <table className="subjectMasterTable">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Classroom Program Courses</th>
                                <th>Skill Program Courses</th>
                                <th>Webinars</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSubjects.length ? paginatedSubjects.map((subject) => (
                                <tr key={subject.subjectMasterId}>
                                    <td>{subject.subjectName || '-'}</td>
                                    <td>{subject.totalClassroomCourses ?? 0}</td>
                                    <td>{subject.totalCertificationCourses ?? 0}</td>
                                    <td>{subject.totalWebinars ?? 0}</td>
                                    <td>
                                        <img
                                            src={Edit}
                                            alt="Edit"
                                            style={{ cursor: 'pointer' }}
                                            onClick={(event) => handleMenuOpen(event, subject)}
                                        />
                                        <Menu
                                            anchorEl={menuAnchor}
                                            open={Boolean(menuAnchor) && activeSubject?.subjectMasterId === subject.subjectMasterId}
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
                            )) : (
                                <tr>
                                    <td colSpan={5} className='subjectEmptyState'>No subjects found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {filteredSubjects.length > itemsPerPage ? (
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
        ) : null}

        {showAddDialog && (
            <div className="subjectDialog-overlay">
                <div className="subjectHeader-content">
                    <div className="subjectHeader">
                        <div>{isEditing ? 'Edit Subject' : 'Add New Subject'}</div>
                        <span className="holidayDialog-close" onClick={closeDeleteDialog}><img src={fiClose} alt='' /></span>
                    </div>
                    <form className="subjectBody" onSubmit={handleSaveSubject}>
                        <div className='subjectTextDiv'>
                                <div className='subjectName'>Subject Name <span className='mandatoryField'>*</span></div>
                                <input
                                    type='text'
                                    placeholder='Subject Name'
                                    className='subjectInputFiled'
                                    value={subjectForm.subjectName}
                                    onChange={handleSubjectInputChange}
                                    disabled={saving}
                                />
                        </div>
                        <div className="subjectMetaNote">Deleting a subject uses soft delete. Existing linked courses and webinars are preserved.</div>
                        <div className="subjectDialogActions">
                            <button type='button' onClick={closeDeleteDialog} className='subjectDialogButtonSecondary'>Cancel</button>
                            <button type="submit" className='subjectDialogButtonPrimary' disabled={saving}>{saving ? 'Saving...' : (isEditing ? 'Update' : 'Add')}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {showDeleteDialog && (
            <div className="subjectDialog-overlay">
                <div className="subjectHeader-content">
                    <div className="subjectHeader">
                        <div>Delete Subject</div>
                        <span className="holidayDialog-close" onClick={closeDeleteDialog}><img src={fiClose} alt='' /></span>
                    </div>
                    <div className='subjectDeleteText'>Delete {activeSubject?.subjectName || 'this subject'}?</div>
                    <div className="subjectMetaNote">This only marks the subject as inactive and removes it from the admin list.</div>
                    <div className="subjectDialogActions">
                        <button type='button' onClick={closeDeleteDialog} className='subjectDialogButtonSecondary'>Cancel</button>
                        <button type='button' onClick={handleConfirmDelete} className='subjectDialogButtonPrimary' disabled={saving}>{saving ? 'Deleting...' : 'Delete'}</button>
                    </div>
                </div>
            </div>
        )}


        <Dialog open={showImportDialog} onClose={handleCloseImportDialog}>
            <DialogTitle>
            <div className='dialogChapterHeader'>
                <span className="CertifyDialogTitleTxt">Import Subjects</span>
                <button className="close-button" onClick={handleCloseImportDialog}>&#x2716;</button>
            </div>
            <div className="userHeaderHorizontalLine"></div>
            </DialogTitle> 

            <DialogContent>
                <div className='importDialogBodyContainer'>
                    <div className='importDialogBody'>
                        <div className='importDialogSubHeader'>Step 1</div>
                        <div className='importDialogSTxt'>Download our pre-built subject template.</div>
                        <a className='importDialogDownloadTempelate' href={SubjectTemplate} download="SubjectTemplate.csv">
                            Download Template
                        </a>

                    </div>

                    <div className='importDialogBody' style={{width:'300px'}}>
                        <div className='importDialogSubHeader'>Step 2</div>
                        <div className='importDialogSTxt'>Fill in data in the template and upload here.</div>
                        <label className='importDialogImportTempelate' htmlFor='fileInput'>
                            <span><img src={UploadIcon} alt='' /></span>
                            <span>Upload File</span>
                            <input type='file'  id='fileInput' accept='.csv,.xls,.xlsx' style={{ display: 'none' }} onChange={handleFileUpload} />
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
                <div className='addBtn' onClick={importing ? undefined : handleImportSubjects}>{importing ? 'Uploading...' : 'Import'}</div>
            </div>
            </DialogActions>
        </Dialog>
    </div>
  )
}

export default Subject
