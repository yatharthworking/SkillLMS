import React, { useState, useEffect } from 'react';
import '../ManageBatch.css'
import SearchIcon from "../../../../../../Assets/Images/searchIcon.svg";
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { BACKEND_BASEURL } from "../../../../../helper.js";
import { BeatLoader } from 'react-spinners';
import { FadeLoader } from 'react-spinners';
import { PacmanLoader } from 'react-spinners';

function EnrolledStudent({ batchData }) {
  const token = localStorage.getItem("token");
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unenrolledStudents, setUnenrolledStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [unenrolledLoading, setUnenrolledLoading] = useState(false);
  const [enrollingStudents, setEnrollingStudents] = useState(false);
  const [removingStudent, setRemovingStudent] = useState(null); // State to hold student to remove
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State to control confirm dialog
  const [deleting, setDeleting] = useState(false); // State to manage delete operation

  // Fetch enrolled students function
  const fetchEnrolledStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchBatchEnrolledStudents?batchId=${batchData.batchId}`);
      setStudents(response.data.enrolledStudents);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledStudents(); // Initial fetch when batchData changes
  }, [batchData.batchId]);

  const fetchUnenrolledStudents = async () => {
    try {
      setUnenrolledLoading(true); // Set loading state to true before fetching
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchUnEnrolledStudents`);
      setUnenrolledStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching unenrolled students:', error);
    } finally {
      setUnenrolledLoading(false); // Set loading state to false after fetching
    }
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    fetchUnenrolledStudents();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectAll(false);
    setSelectedStudents([]);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedStudents(unenrolledStudents.map(student => student.email));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (email) => {
    if (selectedStudents.includes(email)) {
      setSelectedStudents(selectedStudents.filter(id => id !== email));
    } else {
      setSelectedStudents([...selectedStudents, email]);
    }
  };

  const enrollSelectedStudents = async () => {
    try {
      setEnrollingStudents(true); // Set enrolling state to true before API call
      const response = await axios.post(`${BACKEND_BASEURL}/admin/enrollStudentToBatch`, {
        userName: selectedStudents,
        batchId: batchData.batchId
      });
      console.log('Enrollment response:', response.data); // Log or handle response as needed
      // After successful enrollment, fetch updated enrolled students
      fetchEnrolledStudents();
    } catch (error) {
      console.error('Error enrolling students:', error);
    } finally {
      setEnrollingStudents(false); // Set enrolling state to false after API call
      closeDialog(); // Close the dialog after enrollment
    }
  };

  const confirmRemoveStudent = async () => {
    try {
      setDeleting(true); // Set deleting state to true before API call
      const response = await axios.post(`${BACKEND_BASEURL}/admin/removeStudentFromBatch?studentId=${removingStudent.userDetailsId}&batchId=${batchData.batchId}`);
      console.log('Remove student response:', response.data); // Log or handle response as needed
      // After successful removal, fetch updated enrolled students
      fetchEnrolledStudents();
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setRemovingStudent(null); // Clear removing student state
      setDeleting(false); // Set deleting state to false after API call
      setShowConfirmDialog(false); // Close confirm dialog after deletion
    }
  };

  const openRemoveConfirmation = (student) => {
    setRemovingStudent(student);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setRemovingStudent(null);
  };

  return (
    <>
      <div className='WholeTab'>
        <div className='SearchbuttonSection'>
          <div className='SerachInputbox'>
            <div className="batchsSearchBox">
              <input
                className="batchSearchInput"
                placeholder="Search Student"
                // value={searchInput}
                // onChange={handleSearchChange}
              />
              <img src={SearchIcon} alt="Search" />
            </div>
          </div>
          <div className='addButtonDiv'>
            <div className='webinarButton' onClick={openDialog}>Enroll Student</div>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="loader">
              <BeatLoader size={15} color={"#123abc"} loading={loading} />
            </div>
          ) : (
            <table className='Table'>
              <thead>
                <tr>
                  <th>Students</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course Purchased/Assigned</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(student => (
                    <tr key={student.userDetailsId}>
                      <td>
                        {student.fullName}
                        <span className={`Gender ${student.gender === 'Female' ? 'Female' : ''}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.mobileNo || '-'}</td>
                      <td>{student.coursesEnrolled}</td>
                      <td style={{ color: 'red', cursor: 'pointer' }} title={`Remove ${student.fullName}`} onClick={() => openRemoveConfirmation(student)}><CloseIcon /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No students enrolled in this batch yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <div className='announcmentHeader'>Enroll Students</div>
              <span className="dialog-close" onClick={closeDialog}><CloseIcon /></span>
            </div>
            <div className='border2'></div>
            <div className='dialogBox'>
              <div className="dialog-body2">
                {unenrolledLoading ? ( // Show loader while fetching unenrolled students
                  <div className="loader">
                    <FadeLoader size={15} color={"#123abc"} loading={unenrolledLoading} />
                  </div>
                ) : (
                  <table className='Table'>
                    <thead>
                      <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>User ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unenrolledStudents?.length > 0 ? (
                        unenrolledStudents?.map(student => (
                          <tr key={student.userDetailsId}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.email)}
                                onChange={() => handleSelectStudent(student.email)}
                              />
                            </td>
                            <td>{student.userDetailsId}</td>
                            <td>{student.fullName}</td>
                            <td>{student.email}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center' }}>No unenrolled students available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="dialog-footer">
                <button onClick={closeDialog} className='cancelAnnouncment'>Cancel</button>
                <button className='createAnnouncment' onClick={enrollSelectedStudents} disabled={selectedStudents.length === 0 || enrollingStudents}>
                  {enrollingStudents ? 'Enrolling...' : 'Enroll Selected'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && removingStudent && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <div className='announcmentHeader'>Confirm Delete</div>
              <span className="dialog-close" onClick={closeConfirmDialog}><CloseIcon /></span>
            </div>
            <div className='border2'></div>
            <div className='dialogBox'>
              <div className="dialog-body">
                <p>Are you sure to remove this student <b>{removingStudent.fullName}</b>?</p>
              </div>
              <div className="dialog-footer">
                <button onClick={closeConfirmDialog} className='cancelAnnouncment'>Cancel</button>
                <button onClick={confirmRemoveStudent} className='createAnnouncment'>
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

export default EnrolledStudent;
