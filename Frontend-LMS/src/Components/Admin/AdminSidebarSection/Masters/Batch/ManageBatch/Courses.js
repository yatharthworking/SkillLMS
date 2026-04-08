import React, { useState, useEffect } from 'react';
import SearchIcon from "../../../../../../Assets/Images/searchIcon.svg";
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import { Switch } from '@mui/material';
import axios from 'axios';
import { BACKEND_BASEURL } from "../../../../../helper.js";
import { BeatLoader } from 'react-spinners';
import { PacmanLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to extract teachers from API response
const extractTeachersFromResponse = (responseData) => {
    // Handle different response formats
    let dataArray = responseData;
    
    // If responseData is an object with a 'teachers' property
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && responseData.teachers) {
        dataArray = responseData.teachers;
    }
    
    // If responseData is an object with a 'data' property
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && responseData.data) {
        dataArray = responseData.data;
    }
    
    if (!Array.isArray(dataArray)) {
        console.warn('Invalid teacher data format received:', responseData);
        return [];
    }

    const uniqueTeachers = new Map();

    dataArray.forEach((roleEntry) => {
        const users = Array.isArray(roleEntry?.userInfo) ? roleEntry.userInfo : [];

        users.forEach((user) => {
            const teacherId = user?.userDetailsId;
            if (!teacherId || uniqueTeachers.has(teacherId)) {
                return;
            }

            uniqueTeachers.set(teacherId, {
                teacherId,
                teacherName: user?.fullName || user?.email || `Teacher ${teacherId}`,
            });
        });
    });

    return Array.from(uniqueTeachers.values());
};

function Courses({ batchData }) {
    const token = localStorage.getItem("token");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const [showDialog, setShowDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [courseCode, setCourseCode] = useState(null);
    const [courseName, setCourseName] = useState(null);
    const [price, setPrice] = useState('');
    const [teacher, setTeacher] = useState(null);
    const [defaultAssignment, setDefaultAssignment] = useState(false);
    const [teacherOptions, setTeacherOptions] = useState([]);
    const [batchCourses, setBatchCourses] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [courseNameOptions, setCourseNameOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTeachers();
        fetchBatchCourses(batchData.batchId);
        fetchCourses(batchData.batchId);
    }, [batchData]);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/admin/getTutorMaster`);
            console.log('getTutorMaster API response:', response.data);
            const teachers = extractTeachersFromResponse(response.data);
            console.log('Extracted teachers:', teachers);
            const options = teachers.map(teacher => ({
                value: teacher.teacherId,
                label: teacher.teacherName
            }));
            setTeacherOptions(options);
            if (teachers.length === 0) {
                console.warn('No teachers found in response');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to fetch teachers');
        }
    };

    const fetchBatchCourses = async (batchId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchCoursesOfBatch?batchId=${batchId}`);
            const { courses } = response.data;
            setBatchCourses(courses);
        } catch (error) {
            console.error('Error fetching batch courses:', error);
            toast.error('Failed to fetch batch courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (batchId) => {
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/student/fetchCourseMaster?batchId=${batchId}`);
            const { courses } = response.data;
            const courseOpts = courses.map(course => ({
                value: course.courseId,
                label: course.courseCode,
                courseName: course.courseName,
                price: course.coursePrice || 0
            }));
            const courseNameOpts = courses.map(course => ({
                value: course.courseId,
                label: course.courseName,
                courseCode: course.courseCode,
                price: course.coursePrice || 0
            }));
            setCourseOptions(courseOpts);
            setCourseNameOptions(courseNameOpts);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to fetch courses');
        }
    };

    const handleCourseCodeChange = (selectedOption) => {
        setCourseCode(selectedOption);
        if (selectedOption) {
            const selectedCourse = courseOptions.find(course => course.value === selectedOption.value);
            const courseName = selectedCourse ? selectedCourse.courseName : '';
            const price = selectedCourse ? selectedCourse.price : 0;
            setCourseName({ value: selectedCourse.value, label: courseName });
            setPrice(price);
        } else {
            setCourseName(null);
            setPrice('');
        }
    };

    const handleCourseNameChange = (selectedOption) => {
        setCourseName(selectedOption);
        if (selectedOption) {
            const selectedCourse = courseNameOptions.find(course => course.value === selectedOption.value);
            const courseCode = selectedCourse ? selectedCourse.courseCode : '';
            const price = selectedCourse ? selectedCourse.price : 0;
            setCourseCode({ value: selectedCourse.value, label: courseCode });
            setPrice(price);
        } else {
            setCourseCode(null);
            setPrice('');
        }
    };

    const handleTeacherChange = (selectedOption) => {
        setTeacher(selectedOption);
    };

    const handlePriceChange = (event) => {
        setPrice(event.target.value);
    };

    const handleDefaultAssignmentChange = (event) => {
        setDefaultAssignment(event.target.checked);
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setCourseCode(null);
        setCourseName(null);
        setPrice('');
        setTeacher(null);
        setDefaultAssignment(false);
    };

    const handleAssignCourse = async () => {
        setAssigning(true);

        const courseId = courseCode.value;
        const tutorId = teacher.value;
        const batchId = batchData.batchId;

        try {
            await axios.post(`${BACKEND_BASEURL}/admin/addCourseToBatch`, {
                batchId,
                courseId,
                tutorId,
                isDefault: defaultAssignment
            });

            await fetchBatchCourses(batchId);
            await fetchCourses(batchId);
            toast.success('Course assigned successfully');
        } catch (error) {
            console.error('Error assigning course:', error);
            toast.error('Failed to assign course');
        } finally {
            setAssigning(false);
        }

        handleDialogClose();
    };

    const openConfirmDialog = (course) => {
        setCourseToDelete(course);
        setShowConfirmDialog(true);
    };

    const closeConfirmDialog = () => {
        setShowConfirmDialog(false);
        setCourseToDelete(null);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;

        const { materialId } = courseToDelete;
        const { batchId } = batchData;
        const { assignedTeacherId } = courseToDelete;

        try {
            setDeleting(true);

            await axios.post(`${BACKEND_BASEURL}/admin/removeBatchCourses?batchId=${batchId}&courseId=${materialId}&assignedTutorId=${assignedTeacherId}`);

            await fetchBatchCourses(batchId);
            await fetchCourses(batchId);
            toast.success('Course deleted successfully');
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
        } finally {
            setDeleting(false);
        }

        closeConfirmDialog();
    };

    return (
        <>
            <div className='WholeTab'>
                <div className='SearchbuttonSection'>
                    <div className='SerachInputbox'>
                        <div className="batchsSearchBox">
                            <input
                                className="batchSearchInput"
                                placeholder="Search Course"
                            />
                            <img src={SearchIcon} alt="Search" />
                        </div>
                    </div>
                    <div className='addButtonDiv' onClick={() => setShowDialog(true)}>
                        <div className='webinarButton'>Assign Course</div>
                    </div>
                </div>
                <div>
                    {loading ? (
                        <div className="loader">
                            <BeatLoader color={'#123abc'} loading={loading} size={15} />
                        </div>
                    ) : (
                        <table className='Table'>
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Created by</th>
                                    <th>Assign Teacher</th>
                                    <th>Price</th>
                                    <th>Purchased by students</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchCourses?.map(course => (
                                    <tr key={course.materialId}>
                                        <td>
                                            {course.materialName}
                                            {course.isDefault && <span className='Default' title='Students can access this course by default without any pay'> Default</span>}
                                            <br />
                                            {course.materialCode}
                                        </td>
                                        <td>{course.tutorName}</td>
                                        <td>{course.assignedTeacher}</td>
                                        <td>₹ {course.materialPrice}</td>
                                        <td>{course.totalEnrolledStudents}</td>
                                        <td style={{ color: 'red', cursor: 'pointer' }} title='Remove Course' onClick={() => openConfirmDialog(course)}><CloseIcon /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ToastContainer />

            {showDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <div className="dialog-header">
                            <div className='announcmentHeader'>Assign Course</div>
                            <span className="dialog-close" onClick={handleDialogClose}><CloseIcon /></span>
                        </div>
                        <div className='border2'></div>
                        <div className='dialogBox'>
                            <div className="dialog-body">
                                <div className='inputFiled'>
                                    <label className='labelText'>Course Code<span className='mandatoryFiled'>*</span></label>
                                    <Select
                                        className='searchDropDownFieldshort'
                                        name="courseCode"
                                        value={courseCode}
                                        onChange={handleCourseCodeChange}
                                        options={courseOptions}
                                        isClearable
                                        placeholder="Select Course Code"
                                    />
                                </div>

                                <div className='inputFiled'>
                                    <label className='labelText'>Course Name<span className='mandatoryFiled'>*</span></label>
                                    <Select
                                        className='searchDropDownFieldlong'
                                        name="courseName"
                                        value={courseName}
                                        onChange={handleCourseNameChange}
                                        options={courseNameOptions}
                                        isClearable
                                        placeholder="Select a Course Name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='dialogBox'>
                            <div className="dialog-body">
                                <div className='inputFiled'>
                                    <label className='labelText'>Price<span className='mandatoryFiled'>*</span></label>
                                    <input
                                        type="text"
                                        className='inputFieldText1'
                                        name="price"
                                        value={price}
                                        onChange={handlePriceChange}
                                        placeholder='Enter Price'
                                    />
                                </div>

                                <div className='inputFiled'>
                                    <label className='labelText'>Assign Teacher<span className='mandatoryFiled'>*</span></label>
                                    <Select
                                        className='searchDropDownFieldlong'
                                        name="teacher"
                                        value={teacher}
                                        onChange={handleTeacherChange}
                                        options={teacherOptions}
                                        isClearable
                                        placeholder="Select a Teacher"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='dialogBox'>
                            <div className="dialog-body">
                                <div className='inputFiledToggle'>
                                    <label className='labelText'>
                                        Assign to Batch by default: <br />
                                        <span className='RightInfoBox'>Students can access this course by default.</span>
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Switch
                                            checked={defaultAssignment}
                                            onChange={handleDefaultAssignmentChange}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'default assignment switch' }}
                                        />
                                        <span>{defaultAssignment ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dialog-footer">
                            <button onClick={handleDialogClose} className='cancelAnnouncment'>Cancel</button>
                            <button onClick={handleAssignCourse} className='createAnnouncment'>
                                {assigning ? <BeatLoader color={'#fff'} size={8} /> : 'Assign'}
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
                                <p>Are you sure to remove this course <b>{courseToDelete.materialName}</b> from this batch <b>{batchData.batchName}</b></p>
                            </div>
                            <div className="dialog-footer">
                                <button onClick={closeConfirmDialog} className='cancelAnnouncment'>Cancel</button>
                                <button onClick={confirmDelete} className='createAnnouncment'>
                                    {deleting ? <PacmanLoader color={'#fff'} size={10} /> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Courses;
