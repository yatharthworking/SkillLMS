import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WebinarAdmin.css';
import SearchIcon from '../../../../Assets/Images/searchIcon.svg';
import Plus from '../../../../Assets/Images/plus.svg';
import Edit from '../../../../Assets/Images/Edit.svg';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { BACKEND_BASEURL } from '../../../helper';
import { toast, ToastContainer } from 'react-toastify';

function parseDateTime(dateTimeValue) {
  if (!dateTimeValue) {
    return null;
  }

  if (dateTimeValue instanceof Date) {
    return Number.isNaN(dateTimeValue.getTime()) ? null : dateTimeValue;
  }

  const normalizedValue = String(dateTimeValue).trim();
  const nativeDate = new Date(normalizedValue);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const [datePart, timePart] = normalizedValue.split(' ');
  if (!datePart || !timePart) {
    return null;
  }

  const [day, month, year] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  if ([day, month, year, hour, minute].some(Number.isNaN)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute);
}

function parseDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const normalizedValue = String(dateValue).trim();
  const nativeDate = new Date(normalizedValue);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const [day, month, year] = normalizedValue.split('-').map(Number);
  if ([day, month, year].some(Number.isNaN)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateTime(dateTimeValue, showDateOnly = false) {
  const parsedDate = parseDateTime(dateTimeValue);
  if (!parsedDate) {
    return '-';
  }

  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = parsedDate.getFullYear();

  if (showDateOnly) {
    return `${day}-${month}-${year}`;
  }

  return parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

function getStatusText(webinar) {
  const now = new Date();
  const webinarDate = parseDate(webinar.webinarDate);
  const registrationStart = parseDateTime(webinar.webinarRegStartTime);
  const registrationEnd = parseDateTime(webinar.webinarRegEndTime);

  if (webinarDate && now >= webinarDate) {
    return { text: 'Expired', color: '#898FA7' };
  }

  if (registrationEnd && now >= registrationEnd) {
    return { text: 'Registration Closed', color: '#102E3C' };
  }

  if (registrationStart && registrationEnd && now >= registrationStart && now < registrationEnd) {
    return { text: 'Registration Open', color: '#16A42D' };
  }

  return { text: 'Upcoming', color: '#FE9946' };
}

export default function WebinarAdmin() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [webinarsData, setWebinarsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWebinarData(page - 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const fetchWebinarData = async (pageIndex, pageSize) => {
    setLoading(true);
    setFetchError('');

    try {
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchWebinarSchedules?page=${pageIndex}&size=${pageSize}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setWebinarsData(Array.isArray(response?.data?.data) ? response.data.data : []);
      setTotalPages(Number(response?.data?.totalPages ?? 0));
    } catch (error) {
      console.error('Error fetching webinar data:', error);
      setWebinarsData([]);
      setTotalPages(0);
      setFetchError(error?.response?.data?.Exception || error?.response?.data?.message || 'Failed to fetch webinars.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedWebinar(null);
  };

  const handleActionClick = (event, webinar) => {
    setMenuAnchor(event.currentTarget);
    setSelectedWebinar(webinar);
  };

  const handleCreateWebinar = () => {
    navigate('/createWebinar');
  };

  const handleEditWebinar = () => {
    if (!selectedWebinar) {
      return;
    }

    navigate('/createWebinar', { state: { webinar: selectedWebinar, isEdit: true } });
    handleMenuClose();
  };

  const handleDeleteWebinar = async () => {
    if (!selectedWebinar?.webinarInfoId) {
      return;
    }

    try {
      await axios.patch(`${BACKEND_BASEURL}/admin/toggleWebinarActiveStatus?webinarInfoId=${selectedWebinar.webinarInfoId}&status=false`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success('Webinar Successfully Deleted!');
      fetchWebinarData(page - 1, rowsPerPage);
    } catch (error) {
      console.error('Error deleting webinar:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete webinar.');
    } finally {
      handleMenuClose();
    }
  };

  const filteredWebinarData = webinarsData.filter((webinar) => {
    const webinarName = String(webinar?.webinarName || '').toLowerCase();
    const subjectName = String(webinar?.subjectName || webinar?.subject || '').toLowerCase();
    const speakerNames = Array.isArray(webinar?.speakers)
      ? webinar.speakers.map((speaker) => speaker?.name || '').join(', ').toLowerCase()
      : '';
    const normalizedSearch = searchQuery.toLowerCase();

    return (
      webinarName.includes(normalizedSearch) ||
      subjectName.includes(normalizedSearch) ||
      speakerNames.includes(normalizedSearch)
    );
  });

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
    <div className='WebinarAdminMainPage'>
      <ToastContainer />
      <div className='webinar_Section'>
        <div className='WebinarSubSection'>
          <div className='webinarHeaderText'>Webinars</div>
          <div className='webinarsSearchBox'>
            <input
              className='SearchInput'
              placeholder='Search a webinar or subject'
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <img src={SearchIcon} alt='Search' />
          </div>
        </div>
        <div className='buttonDiv'>
          <img src={Plus} alt='Add' />
          <div className='webinarButton' onClick={handleCreateWebinar}>Create Webinar</div>
        </div>
      </div>

      <div className='webinarTableContainer'>
        {loading ? (
          <div className='loadingContainer'>
            <BeatLoader color='#219EBC' />
          </div>
        ) : (
          <div className='webinarMainSection'>
            {fetchError && <div className='errorText' style={{ padding: '12px 0' }}>{fetchError}</div>}
            <table className='webinarTable'>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Created On</th>
                  <th>Subject</th>
                  <th>Speakers</th>
                  <th>Registration Type</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredWebinarData.length === 0 ? (
                  <tr>
                    <td colSpan='7' style={{ textAlign: 'center', padding: '24px' }}>
                      {fetchError ? 'Unable to load webinars.' : 'No webinars found.'}
                    </td>
                  </tr>
                ) : (
                  filteredWebinarData.map((webinar) => {
                    const speakerNames = Array.isArray(webinar?.speakers)
                      ? webinar.speakers.map((speaker) => speaker?.name || '').filter(Boolean).join(', ')
                      : '';
                    const status = getStatusText(webinar);

                    return (
                      <tr key={webinar.webinarInfoId || webinar.webinarId}>
                        <td>
                          <span className='webinarName'>{webinar.webinarName}</span>
                          <br />
                          {formatDateTime(webinar.webinarStartTime, true)}&nbsp;&nbsp;
                          {formatDateTime(webinar.webinarStartTime)} - {formatDateTime(webinar.webinarEndTime)}
                        </td>
                        <td>{formatDateTime(webinar.creationTimeStamp, true)}</td>
                        <td>{webinar.subjectName || webinar.subject || '-'}</td>
                        <td>
                          <Tooltip title={speakerNames}>
                            <span className='truncated-text'>{speakerNames || '-'}</span>
                          </Tooltip>
                        </td>
                        <td>{Number(webinar.webinarRegPrice) === 0 ? 'Free' : 'Paid'}</td>
                        <td style={{ color: status.color }}>{status.text}</td>
                        <td>
                          <img src={Edit} alt='Edit' style={{ cursor: 'pointer' }} onClick={(event) => handleActionClick(event, webinar)} />
                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor) && selectedWebinar?.webinarInfoId === webinar.webinarInfoId}
                            onClose={handleMenuClose}
                          >
                            <MenuItem style={{ fontSize: '14px', cursor: 'pointer' }} onClick={handleEditWebinar}>Edit</MenuItem>
                            <MenuItem style={{ fontSize: '14px', cursor: 'pointer' }} onClick={handleDeleteWebinar}>Delete</MenuItem>
                          </Menu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className='PaginationContainer'>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            variant='outlined'
            shape='circular'
            renderItem={(item) => {
              const shouldRender = renderPaginationItems(item);

              if (shouldRender === 'ellipsis') {
                return <PaginationItem key={item.page} {...item} type='start-ellipsis' shape='circular' />;
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
  );
}
