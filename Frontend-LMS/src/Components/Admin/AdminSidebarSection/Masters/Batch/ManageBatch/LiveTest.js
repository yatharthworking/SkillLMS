import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../ManageBatch.css';
import SearchIcon from "../../../../../../Assets/Images/searchIcon.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Action from "../../../../../../Assets/Images/Edit.svg";
import fiClose from "../../../../../../Assets/Images/fi_close.svg";
import { useNavigate } from 'react-router-dom';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BACKEND_BASEURL } from "../../../../../helper.js";
import Select from 'react-select';
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import { BeatLoader } from 'react-spinners';
import { PacmanLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

function LiveTest({ batchData }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const adminLoginResponse = localStorage.getItem('AdminLoginResponse');
      const user = JSON.parse(adminLoginResponse);
      


  const [tests, setTests] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [startDateTime, setStartDateTime] = useState(null);
  const [duration, setDuration] = useState('');
  const [endDateTime, setEndDateTime] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formattedDuration, setFormattedDuration] = useState('00 hour 00 minutes');
  const [isEditing, setIsEditing] = useState(false); // New state for editing
  const [currentTest, setCurrentTest] = useState(null); // New state for the current test being edited
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // New state for delete confirmation dialog
  const [deleting, setDeleting] = useState(false); // New state for delete action
  const [seletedRowTest, setSeletedRowTest] = useState();

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchBatchTest?batchId=${batchData.batchId}&testType=LIVE_TEST`);
      if (response.data.status) {
        setTests(response.data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [batchData.batchId]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchCoursesOfBatch?batchId=${batchData.batchId}`);
      if (response.data.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleActionClick = (event,test) => {
    setSeletedRowTest(test);
    setMenuAnchor(event.currentTarget);
  };

  const handleEditClick = (test) => {
    setCurrentTest(test); // Set the current test for editing
    setStartDateTime(moment(test.testStartDate));
    setDuration(moment(test.testEndDate).diff(moment(test.testStartDate), 'hours') + ':' + moment(test.testEndDate).diff(moment(test.testStartDate), 'minutes') % 60);
    setEndDateTime(moment(test.testEndDate));
    // setSelectedCourse(courses.find(course => course.value === test.materialId));
    setSelectedCourse({
      value: test.materialId,
      label: test.materialName,
      assignedTeacher: test.teacherName
    });
    setSelectedTestType(testTypeOptions.find(type => type.value === test.testPattern));
    setIsEditing(true);
    openDialog();
    handleMenuClose();
  };

  const handleDeleteClick = (test) => {
    setCurrentTest(test); // Set the current test to be deleted
    setShowConfirmDialog(true); // Show the delete confirmation dialog
    handleMenuClose();
  };

  const openDialog = () => {
    fetchCourses();
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setStartDateTime(null);
    setDuration('');
    setEndDateTime(null);
    setSelectedCourse(null);
    setSelectedTestType(null);
    setIsEditing(false);
    setCurrentTest(null);
  };

  const handleManageClick = (test) => {
    handleMenuClose();
    // navigate('/QuestionGenerator/LiveObjectiveTest',{ state: { testDetails: test, batchData :batchData } });
    navigate('/QuestionGenerator/LiveObjectiveTestNew',{ state: { testDetails: test, batchData :batchData } });
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setCurrentTest(null);
  };

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filteredTests = tests.filter((test) =>
    test.testName.toLowerCase().includes(searchInput.toLowerCase()) ||
    (test.assignteacher && test.assignteacher.toLowerCase().includes(searchInput.toLowerCase())) ||
    test.testPattern.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleStartDateTimeChange = (value) => {
    setStartDateTime(value);
    if (duration) {
      calculateEndDateTime(value, duration);
    }
  };

  const handleDurationChange = (event) => {
    const value = event.target.value;
    setDuration(value);
    updateFormattedDuration(value);
    if (startDateTime) {
      calculateEndDateTime(startDateTime, value);
    }
  };

  const calculateEndDateTime = (start, duration) => {
    const [hours, minutes] = duration.split(':').map(Number);
    const end = moment(start).add(hours, 'hours').add(minutes, 'minutes');
    setEndDateTime(end);
  };

  const updateFormattedDuration = (duration) => {
    const [hours, minutes] = duration.split(':').map(Number);
    setFormattedDuration(`${hours || 0} hour${hours === 1 ? '' : 's'} ${minutes || 0} minute${minutes === 1 ? '' : 's'}`);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedTestType || !startDateTime || !duration) {
      toast.error('All fields are mandatory');
      return;
    }

    const testName = document.querySelector('input[name="testName"]').value;
    const description = document.querySelector('textarea[name="desc"]').value;

    if (!testName || !description) {
      toast.error('All fields are mandatory');
      return;
    }

    const testData = {
      userName:user.username,
      testName,
      testStartDate: moment(startDateTime).format('YYYY-MM-DDTHH:mm:ss'),
      testEndDate: moment(endDateTime).format('YYYY-MM-DDTHH:mm:ss'),
      description,
      testType: 'LIVE_TEST',
      testPattern: selectedTestType.value,
      teacherName: selectedCourse.assignedTeacher,
      subject: selectedCourse.label,
      materialId: selectedCourse.value,
      batchId: batchData.batchId
    };

    setCreating(true);

    try {
      let response;
      if (isEditing) {
        testData.testId = currentTest.testId;
        response = await axios.post(`${BACKEND_BASEURL}/admin/updateTests`, testData);
      } else {
        response = await axios.post(`${BACKEND_BASEURL}/admin/addTestMaster`, testData);
      }

      if (response.data.status) {
        toast.success(`Test ${isEditing ? 'updated' : 'created'} successfully`);
        fetchTests();
        closeDialog();
      } else {
        toast.error(`Error ${isEditing ? 'updating' : 'creating'} test`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} test:`, error);
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} test`);
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteTest = async () => {
    setDeleting(true);

    try {
      const response = await axios.post(`${BACKEND_BASEURL}/admin/removeBatchTests`, null, {
        params: {
          batchId: batchData.batchId,
          testId: currentTest.testId,
          courseId: currentTest.materialId
        }
      });

      if (response.data.status) {
        toast.success('Test deleted successfully');
        fetchTests();
        closeConfirmDialog();
      } else {
        toast.error('Error deleting test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Error deleting test');
    } finally {
      setDeleting(false);
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.materialId,
    label: course.materialName,
    assignedTeacher:course.assignedTeacher
  }));

  const testTypeOptions = [
    { value: 'OBJECTIVE', label: 'Objective' },
    // { value: 'SUBJECTIVE', label: 'Subjective' }
  ];

  return (
    <>
      <div className='WholeTab'>
        <div className='SearchbuttonSection'>
          <div className='SerachInputbox'>
            <div className="batchsSearchBox">
              <input
                className="batchSearchInput"
                placeholder="Search Tests"
                value={searchInput}
                onChange={handleSearchChange}
              />
              <img src={SearchIcon} alt="Search" />
            </div>
          </div>
          <div className='addButtonDiv'>
            <div onClick={openDialog} className='webinarButton'>Create Test</div>
          </div>
        </div>
        <div className="table-container">
          <table className='Table'>
            <thead>
              <tr>
                <th>Test Name and Teacher</th>
                <th>Test Type</th>
                <th>Starts on</th>
                <th>Ends on</th>
                <th>Status</th>
                <th>Total Questions</th>
                <th>Total Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test.testId}>
                  <td>
                    <b>{test.testName}</b> <br />{test.teacherName || 'N/A'}
                  </td>
                  <td>{test.testPattern}</td>
                  <td>{new Date(test.testStartDate).toLocaleString()}</td>
                  <td>{new Date(test.testEndDate).toLocaleString()}</td>
                  <td style={{ color: test.isPublished ? '#16A42D' : '#E28B00' }}>
                    {test.isPublished ? 'Published' : 'Created'}
                  </td>
                  <td>{test.totalQuestions !== undefined ? test.totalQuestions : 'N/A'}</td>
                  <td>{test.totalMarks !== undefined ? test.totalMarks : 'N/A'}</td>
                  <td>
                    <img src={Action} alt="Edit" style={{ cursor: 'pointer' }}  onClick={(e) => handleActionClick(e,test)}/>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                      <MenuItem className='MenuItem' onClick={() => handleEditClick(seletedRowTest)}><EditOutlinedIcon />Edit</MenuItem>
                      <MenuItem className='MenuItem' onClick={() => handleManageClick(seletedRowTest)}><SettingsOutlinedIcon />Manage</MenuItem>
                      <MenuItem style={{ color: 'red' }} className='MenuItem' onClick={() => handleDeleteClick(seletedRowTest)}><DeleteOutlinedIcon />Delete</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className='loader'>
              <BeatLoader color='#123abc' />
            </div>
          )}
          {!loading && tests.length === 0 && (
            <div className='no-data-message'>No Test is created Yet</div>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-contentLong">
            <div className="dialog-header">
              <div className='announcmentHeader'>{isEditing ? 'Edit Test' : 'Create Test'}</div>
              <span className="dialog-close" onClick={closeDialog}><img src={fiClose} alt='' /></span>
            </div>
            <div className='border2'></div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputFiled'>
                  <label className='labelText'>Test Name<span className='mandatoryFiled'>*</span></label>
                  <input
                    className='inputFieldText1'
                    name="testName"
                    placeholder="Enter Test Name"
                    defaultValue={isEditing ? currentTest.testName : ''}
                  />
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>Course Name<span className='mandatoryFiled'>*</span></label>
                  <Select
                    className='searchDropDownField'
                    name="courseName"
                    isClearable
                    placeholder="Search a Course"
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                  />
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>Test Type<span className='mandatoryFiled'>*</span></label>
                  <Select
                    type="text"
                    className='searchDropDownFieldshort'
                    placeholder='Select Type'
                    name="batchName"
                    options={testTypeOptions}
                    value={selectedTestType}
                    onChange={setSelectedTestType}
                  />
                </div>
              </div>
            </div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputFiled'>
                  <label className='labelText'>Starts On<span className='mandatoryFiled'>*</span></label>
                  <DateTime
                    className='inputFieldText1 custom-datetime-input'
                    value={startDateTime}
                    onChange={handleStartDateTimeChange}
                    dateFormat="DD-MM-YYYY"
                    timeFormat="HH:mm"
                    inputProps={{ placeholder: 'Select Start Date and Time', style: { border: 'none' } }}
                  />
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>Duration<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='inputFieldText1'
                    placeholder='HH:MM'
                    name="duration"
                    value={duration}
                    onChange={handleDurationChange}
                  />
                  <span style={{ color: 'red', fontSize: '10px' }}>{formattedDuration}</span>
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>Ends On<span className='mandatoryFiled'>*</span></label>
                  <DateTime
                    className='inputFieldTextDisabled custom-datetime-input'
                    value={endDateTime}
                    dateFormat="DD-MM-YYYY"
                    timeFormat="HH:mm"
                    inputProps={{ placeholder: 'End Date and Time', disabled: true }}
                    isValidDate={() => false} // Disable calendar
                  />
                </div>
              </div>
            </div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputFiled'>
                  <label className='labelText'>Description<span className='mandatoryFiled'>*</span></label>
                  <textarea
                    type="text"
                    className='inputFieldTextTitleLong'
                    placeholder='What the Exam is all about...'
                    name="desc"
                    defaultValue={isEditing ? currentTest.description : ''}
                  />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button onClick={closeDialog} className='cancelAnnouncment'>Cancel</button>
              <button onClick={handleSubmit} className='createAnnouncment' disabled={creating}>
                {creating ? 'Creating...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <div className='announcmentHeader'>Confirm Delete</div>
              <span className="dialog-close" onClick={closeConfirmDialog}><CloseIcon /></span>
            </div>
            <div className='border2'></div>
            <div className='dialogBox'>
              <div className="dialog-body">
                <p>Are you sure to remove this Live Test <b>"{currentTest.testName}"</b>?</p>
              </div>
              <div className="dialog-footer">
                <button onClick={closeConfirmDialog} className='cancelAnnouncment'>Cancel</button>
                <button onClick={confirmDeleteTest} className='createAnnouncment'>
                  {deleting ? <PacmanLoader color={'#fff'} size={10} loading={deleting} /> : 'Delete'}
                </button>
              </div>
            </div>



            {/* <div className="confirmDialogFooter">
              <button onClick={confirmDeleteTest} disabled={deleting}>
                {deleting ? (
                  <BeatLoader color="#ffffff" loading={deleting} size={10} />
                ) : (
                  'Delete'
                )}
              </button>
              <button onClick={closeConfirmDialog} disabled={deleting}>Cancel</button>
            </div> */}
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default LiveTest;
