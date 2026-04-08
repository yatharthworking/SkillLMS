import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './UserProfilePersonalDetail.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PulseLoader from 'react-spinners/PulseLoader';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultProfile from '../../../Assets/Images/profileImg.svg';
import { BACKEND_BASEURL, validateEmail, validatePhoneNumber } from '../../helper';

const emptyHistory = {
  summary: {
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    testsAttempted: 0,
    timeSpentLearning: '0 mins',
  },
  performanceSnapshot: {
    averageScore: 0,
    totalCompletedCourses: 0,
    learningStreak: 0,
  },
  courses: [],
  timeline: [],
};

export default function UserProfilePersonalDetail() {
  const token = localStorage.getItem('token');
  const storedLogin = JSON.parse(localStorage.getItem('UserLoginResponse') || 'null');
  const storedStudent = JSON.parse(localStorage.getItem('studentDetails') || 'null');
  const resolvedEmail = storedStudent?.email || storedLogin?.username || '';
  const resolvedBatchId = storedStudent?.batchId ?? storedLogin?.batchId ?? null;

  axios.defaults.headers.common.Authorization = `Bearer ${token}`;

  const [profileData, setProfileData] = useState(null);
  const [learningHistory, setLearningHistory] = useState(emptyHistory);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const profilePreview = useMemo(() => {
    if (!profileImage) {
      return DefaultProfile;
    }
    if (profileImage.startsWith('data:')) {
      return profileImage;
    }
    return `data:image/png;base64,${profileImage}`;
  }, [profileImage]);

  const hydrateProfile = (data) => {
    setProfileData(data);
    setFullName(data?.fullName || '');
    setEmail(data?.email || '');
    setPhoneNumber(data?.mobileNo ? String(data.mobileNo) : '');
    setDateOfBirth(data?.dob ? String(data.dob).split('T')[0] : '');
    setSelectedGender(data?.gender || '');
    setProfileImage(data?.userImage || '');
    setIsModified(false);
    localStorage.setItem('studentDetails', JSON.stringify(data));
    window.dispatchEvent(new Event('profileUpdate'));
  };

  const fetchProfile = useCallback(async () => {
    const response = await axios.get(`${BACKEND_BASEURL}/student/profile?email=${encodeURIComponent(resolvedEmail)}`);
    hydrateProfile(response.data);
  }, [resolvedEmail]);

  const fetchLearningHistory = useCallback(async () => {
    const response = await axios.get(`${BACKEND_BASEURL}/student/learning-history`, {
      params: {
        userName: resolvedEmail,
        batchId: resolvedBatchId,
      },
    });
    setLearningHistory({
      ...emptyHistory,
      ...response?.data,
    });
  }, [resolvedBatchId, resolvedEmail]);

  useEffect(() => {
    const loadData = async () => {
      if (!resolvedEmail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchLearningHistory()]);
      } catch (error) {
        console.error('Error loading profile details:', error);
        toast.error('Unable to load profile details right now.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchLearningHistory, fetchProfile, resolvedEmail]);

  const handleFieldChange = (setter) => (event) => {
    setter(event.target.value);
    setIsModified(true);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setIsModified(true);

    if (!value) {
      setEmailError('');
      return;
    }

    setEmailError(validateEmail(value) ? '' : 'Invalid email address');
  };

  const handlePhoneNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    setIsModified(true);

    if (!value) {
      setPhoneError('');
      return;
    }

    setPhoneError(validatePhoneNumber(value) ? '' : 'Invalid phone number');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProfileImage(result.includes(',') ? result.split(',')[1] : result);
      setIsModified(true);
    };
    reader.readAsDataURL(file);
  };

  const updateUserDetails = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }

    if (emailError || phoneError) {
      toast.error('Please fix validation errors before updating.');
      return;
    }

    setLoadingUpdate(true);
    try {
      const payload = {
        ...profileData,
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNo: phoneNumber ? Number(phoneNumber) : null,
        dob: dateOfBirth || null,
        gender: selectedGender,
        userImage: profileImage || null,
      };

      const response = await axios.put(`${BACKEND_BASEURL}/student/profile`, payload);
      if (response.status === 200) {
        toast.success('Profile updated successfully.');
        await fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Unable to update profile right now.');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="userProfilePersonalDetailPage">
      <ToastContainer />
      {isLoading ? (
        <div className="profileLoaderContainer">
          <PulseLoader color="#219EBC" size={15} />
        </div>
      ) : (
        <>
          <div className="profileHeroSection">
            <div>
              <div className="personalDetailsHeading">Personal Details</div>
              <div className="profileHeroCopy">
                Keep your learner profile up to date and review your recent progress without leaving the existing profile layout.
              </div>
            </div>

            <div className="profileAvatarCard">
              <img src={profilePreview} alt="Profile" className="profileHeroImage" />
              <label className="profileImageButton">
                Upload / Edit
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            </div>
          </div>

          <div className="profileSnapshotGrid">
            <div className="profileSnapshotCard">
              <span className="profileSnapshotValue">{learningHistory?.performanceSnapshot?.averageScore || 0}%</span>
              <span className="profileSnapshotLabel">Average Score</span>
            </div>
            <div className="profileSnapshotCard">
              <span className="profileSnapshotValue">{learningHistory?.performanceSnapshot?.totalCompletedCourses || 0}</span>
              <span className="profileSnapshotLabel">Completed Courses</span>
            </div>
            <div className="profileSnapshotCard">
              <span className="profileSnapshotValue">{learningHistory?.performanceSnapshot?.learningStreak || 0} days</span>
              <span className="profileSnapshotLabel">Learning Streak</span>
            </div>
          </div>

          <div className="profileMainGrid">
            <div className="profileSectionCard">
              <div className="profileSectionTitle">Update Personal Information</div>
              <div className="personalDetailsContainer">
                <div className="personalDetailsNameField personalDetailsWideField">
                  <div className="profileinputHeaderText">Full Name<span className="mandatoryField">*</span></div>
                  <input className="nameinputBox" value={fullName} onChange={handleFieldChange(setFullName)} placeholder="Enter full name" />
                </div>

                <div className="personalDetailsNameField">
                  <div className="profileinputHeaderText">Email<span className="mandatoryField">*</span></div>
                  <input className="nameinputBox" value={email} onChange={handleEmailChange} placeholder="Enter email" />
                  {emailError && <div className="errorText">{emailError}</div>}
                </div>

                <div className="personalDetailsNameField">
                  <div className="profileinputHeaderText">Phone Number<span className="mandatoryField">*</span></div>
                  <div className="phoneInputContainer">
                    <span className="countryCodeBadge">+91</span>
                    <input className="phoneInputBox" value={phoneNumber} onChange={handlePhoneNumberChange} placeholder="0000000000" />
                  </div>
                  {phoneError && <div className="errorText">{phoneError}</div>}
                </div>

                <div className="personalDetailsNameField">
                  <div className="profileinputHeaderText">Date of Birth</div>
                  <div className="calendarField">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={handleFieldChange(setDateOfBirth)}
                      className="calendarinputBox"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="personalDetailsNameField">
                  <div className="profileinputHeaderText">Gender</div>
                  <div className="genderField">
                    {['Male', 'Female', 'Others'].map((gender) => (
                      <label className="genderChip" key={gender}>
                        <input
                          className="radioButton"
                          type="radio"
                          value={gender}
                          checked={selectedGender === gender}
                          onChange={handleFieldChange(setSelectedGender)}
                        />
                        <span>{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="updateButtonDiv">
                <button onClick={updateUserDetails} disabled={!isModified || loadingUpdate}>
                  {loadingUpdate ? <CircularProgress size={18} style={{ color: 'white' }} /> : 'Update Profile'}
                </button>
              </div>
            </div>

            <div className="profileSectionCard">
              <div className="profileSectionTitle">Learning Overview</div>
              <div className="learningOverviewGrid">
                <div className="learningMetricCard">
                  <span className="learningMetricValue">{learningHistory?.summary?.coursesEnrolled || 0}</span>
                  <span className="learningMetricLabel">Courses Enrolled</span>
                </div>
                <div className="learningMetricCard">
                  <span className="learningMetricValue">{learningHistory?.summary?.lessonsCompleted || 0}</span>
                  <span className="learningMetricLabel">Lessons Completed</span>
                </div>
                <div className="learningMetricCard">
                  <span className="learningMetricValue">{learningHistory?.summary?.testsAttempted || 0}</span>
                  <span className="learningMetricLabel">Tests Attempted</span>
                </div>
                <div className="learningMetricCard">
                  <span className="learningMetricValue">{learningHistory?.summary?.timeSpentLearning || '0 mins'}</span>
                  <span className="learningMetricLabel">Time Spent Learning</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profileHistoryGrid">
            <div className="profileSectionCard">
              <div className="profileSectionTitle">Learning History</div>
              <div className="courseHistoryList">
                {learningHistory?.courses?.length ? (
                  learningHistory.courses.map((course) => (
                    <div className="courseHistoryCard" key={`${course.courseName}-${course.lastUpdated}`}>
                      <div className="courseHistoryHeader">
                        <div>
                          <div className="courseHistoryTitle">{course.courseName}</div>
                          <div className="courseHistoryMeta">{course.subject} • {course.status}</div>
                        </div>
                        <div className="courseHistoryProgress">{course.progressPercent}%</div>
                      </div>
                      <div className="courseHistoryBar">
                        <span style={{ width: `${course.progressPercent}%` }} />
                      </div>
                      <div className="courseHistoryFooter">
                        <span>{course.completedLessons}/{course.totalLessons} lessons completed</span>
                        <span>Updated {course.lastUpdated}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="emptyHistoryState">Learning activity will appear here once you start courses and complete lessons.</div>
                )}
              </div>
            </div>

            <div className="profileSectionCard">
              <div className="profileSectionTitle">Activity Timeline</div>
              <div className="activityTimelineList">
                {learningHistory?.timeline?.length ? (
                  learningHistory.timeline.map((item, index) => (
                    <div className="activityTimelineItem" key={`${item.type}-${item.title}-${index}`}>
                      <div className="timelineDot" />
                      <div className="timelineContent">
                        <div className="timelineType">{item.type}</div>
                        <div className="timelineTitle">{item.title}</div>
                        <div className="timelineMeta">{item.subject} • {item.dateLabel}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="emptyHistoryState">No recent activity yet. Your completed lessons, tests, and webinar views will show here.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
