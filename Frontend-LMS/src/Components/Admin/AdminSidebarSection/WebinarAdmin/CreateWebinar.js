import React, { useCallback, useRef, useState, useEffect } from 'react';
import './CreateWebinar.css';
import axios from 'axios';
import Navbar from '../../../Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../../AdminSidebar/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import LeftArrow from '../../../../Assets/Images/leftArrow.svg';
import UploadImg from '../../../../Assets/Images/WebinarUploadImg.svg';
import UploadEdit from '../../../../Assets/Images/profileEdit.svg';
import Calendar from '../../../../Assets/Images/calendar.svg';
import SpeakersTab from './SpeakersTab';
import AdditionalContent from './AdditionalContent';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parseISO } from 'date-fns';
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../../helper";
import Close from '../../../../Assets/Images/close-small.svg'
import { PulseLoader } from 'react-spinners';
import defaultWebinarImg from '../../../../Assets/Images/webinardefaultImg.svg'

const EMPTY_SPEAKER_DRAFT = {
  name: '',
  designation: '',
  emailId: '',
  about: '',
};
const EMPTY_TAKEAWAY_DRAFT = {
  keyTakeaway: '',
};
const EMPTY_AUDIENCE_DRAFT = {
  audience: '',
};



export default function CreateWebinar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { webinarDetails} = location.state || {};
  const adminDetail = getFromLocalStorageSafe('adminDetails');


  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [activeTab, setActiveTab] = useState('speakers');

  const [isEdit, setIsEdit] = useState(false);
  const [webinarTitle, setWebinarTitle] = useState('');
  const [webinarInfoId, setWebinarInfoId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [registrationType, setRegistrationType] = useState('');
  const [webinarRegPrice, setWebinarRegPrice] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [webinarStartDate, setWebinarStartDate] = useState('');
  const [webinarStartTime, setWebinarStartTime] = useState('');
  const [webinarEndDate, setWebinarEndDate] = useState('');
  const [webinarEndTime, setWebinarEndTime] = useState('');
  const [registrationStartDate, setRegistrationStartDate] = useState('');
  const [registrationStartTime, setRegistrationStartTime] = useState('');
  const [registrationEndDate, setRegistrationEndDate] = useState('');
  const [registrationEndTime, setRegistrationEndTime] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [postImage, setPostImage] = useState(null); 
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

 

  

  const handleGenerateLinkClick = () => {
    // Assuming webinarStartDate and webinarEndDate are in the format "dd-MM-yyyy" and webinarStartTime and webinarEndTime are in the format "HH:mm"
    const from = formatDateForMeetingLink(webinarStartDate, webinarStartTime);
    const to = formatDateForMeetingLink(webinarEndDate, webinarEndTime);
    const eventName = encodeURIComponent(webinarTitle);  // URL encode the event name

    const url = `${BACKEND_BASEURL}/google/createEventConference?from=${from}&to=${to}&eventName=${eventName}`;

    //Redirect to new page for authentication and redirection back to this page with token in params
    window.open(url, '_blank');
  };


//Added this code to fetch meeting link from params
  useEffect(() => {
 
    const params = new URLSearchParams(window.location.search);
    setMeetingLink(params.get('meetingLink'));

}, []);

  // State variables for dynamic fields
  const [keyTakeaways, setKeyTakeaways] = useState([
    { keyTakeaway: '' },
    { keyTakeaway: '' },
  ]);

  const [audiences, setAudiences] = useState([
    { audience: '' },
    { audience: '' },
  ]);

  const currentUserId = adminDetail?.userDetailsId || null;

  const token = localStorage.getItem("token");
  const authConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  const getImagePreviewSrc = (imageValue) => {
    if (!imageValue) {
      return null;
    }

    const normalizedValue = String(imageValue);
    if (normalizedValue.startsWith('data:')) {
      return normalizedValue;
    }

    return `data:image/png;base64,${normalizedValue}`;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setImageSrc(imageDataUrl); // Preview image
        setSelectedImage(file); // Selected image for upload
      };
      
      reader.readAsDataURL(file);
      const base64Image = await convertFileToBase64(file);
      setPostImage(base64Image);
      
    }
  };
  
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const fileContents = String(reader.result || '');
        const base64Content = fileContents.includes(',') ? fileContents.split(',')[1] : fileContents;
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    setPostImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  

  const [selectedBox, setSelectedBox] = useState(() => {
    return location.state && location.state.selectedBox ? location.state.selectedBox : 'webinar';
  });

  const [selectedSubBox, setSelectedSubBox] = useState(() => {
    return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : '';
  });

  const handleGoTOUserCourses = () => {
    navigate('/adminLandingPage', { state: { selectedBox: "webinar" } });
  };

  const handlePreview = () => {
    const webinarDetails = {
      webinarTitle,
      subjectId,
      subjectName: subjectOptions.find((subjectOption) => String(subjectOption.subjectMasterId) === String(subjectId))?.subjectName || '',
      registrationType,
      webinarRegPrice,
      currency,
      webinarStartDate: formatDate(webinarStartDate),
      webinarStartTime,
      webinarEndDate: formatDate(webinarEndDate),
      webinarEndTime,
      registrationStartDate: formatDate(registrationStartDate),
      registrationStartTime,
      registrationEndDate: formatDate(registrationEndDate),
      registrationEndTime,
      webinarImage: postImage,
      recordingUrl,
      keyTakeaways:takeawaysRows? takeawaysRows :[],
      audiences:attendRows ? attendRows : [],
      speakers: speakersData,
      // Add any other data you want to pass
    };
  
    navigate('/previewDetails', { state: { webinarDetails } });
  };
  


  // Validation state variables
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};

    if (!webinarTitle.trim()) errors.webinarTitle = 'Webinar Title is required';
    if (!String(subjectId).trim()) errors.subject = 'Subject is required';
    // if (!registrationType.trim()) errors.registrationType = 'Registration Type is required';
    if (!webinarStartDate.trim()) errors.webinarStartDate = 'Webinar Start Date is required';
    if (!webinarStartTime.trim()) errors.webinarStartTime = 'Webinar Start Time is required';
    if (!webinarEndDate.trim()) errors.webinarEndDate = 'Webinar End Date is required';
    if (!webinarEndTime.trim()) errors.webinarEndTime = 'Webinar End Time is required';
    if (!registrationStartDate.trim()) errors.registrationStartDate = 'Registration Start Date is required';
    if (!registrationStartTime.trim()) errors.registrationStartTime = 'Registration Start Time is required';
    if (!registrationEndDate.trim()) errors.registrationEndDate = 'Registration End Date is required';
    if (!registrationEndTime.trim()) errors.registrationEndTime = 'Registration End Time is required';

    if (registrationStartDate > webinarStartDate) {
      errors.registrationStartDate = 'Registration Start Date should not be after Webinar Start Date';
    }
  
    // if (registrationEndDate <= webinarEndDate) {
    //   errors.registrationEndDate = 'Registration End Date should not be greater than Webinar End Date';
    // }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleCreateWebinar = async () => {
    // const formData = new FormData(); 

  if (!validateFields()) {
    // toast.error('Please fill in all required fields.');
    return;
  }

  const normalizedTakeaways = [
    ...takeawaysRows,
    takeawayDraft,
  ].filter((item) => item?.keyTakeaway?.trim());
  const normalizedAudiences = [
    ...attendRows,
    audienceDraft,
  ].filter((item) => item?.audience?.trim());
  const normalizedSpeakers = [
    ...speakersData,
    speakerDraft,
  ].filter((speaker) => speaker?.name?.trim());

  if (normalizedTakeaways.length === 0) {
    toast.error('At least one key takeaway is required.');
    return;
  }

  if (normalizedAudiences.length === 0) {
    toast.error('At least one audience entry is required.');
    return;
  }

  if (normalizedSpeakers.length === 0) {
    toast.error('Speaker is a required field.');
    return;
  }

  if (!currentUserId) {
    toast.error('Admin details not found.');
    return;
  }

  if (!token) {
    toast.error('Your session has expired. Please log in again.');
    return;
  }
 
    const webinarData = {
      webinarDate: formatDate(webinarStartDate),
      webinarId: webinarDetails?.webinarId || location.state?.webinar?.webinarId || null,
      userId: currentUserId,
      webinarInfo: [
        {
          webinarName: webinarTitle,
          webinarInfoId: webinarInfoId,
          webinarStartTime: `${formatDate(webinarStartDate)} ${webinarStartTime}`,
          webinarEndTime: `${formatDate(webinarEndDate)} ${webinarEndTime}`,
          webinarRegStartTime: `${formatDate(registrationStartDate)} ${registrationStartTime}`,
          webinarRegEndTime: `${formatDate(registrationEndDate)} ${registrationEndTime}`,
          webinarRegPrice: Number(webinarRegPrice || 0),
          registrationType: registrationType,
          currency: currency,
          webinarImage: postImage ? postImage :'',
          meetingLink: meetingLink,
          recordingUrl: recordingUrl,
          keyTakeaways: normalizedTakeaways,
          audiences: normalizedAudiences,
          speakers: normalizedSpeakers,
          subjectMasterDB: {
            subjectMasterId: Number(subjectId),
          },
        },
      ],
    }; 

    setLoading(true);
 
    try {
      const response = await axios.post(`${BACKEND_BASEURL}/admin/addOrEditWebinarDetails`, webinarData, authConfig);
      toast.success(isEdit ? 'Webinar successfully updated!' : 'Webinar successfully created!');
      // Delay navigation to ensure toast is visible
      setTimeout(() => {
        navigate("/adminLandingPage", { state: { selectedBox: "webinar" } });
      }, 1000); // Adjust the delay as needed
      console.log('Webinar created successfully:', response.data); 

       // Reset all the state variables to their initial values
    setWebinarTitle('');
    setSubjectId('');
    setRegistrationType('');
    setWebinarRegPrice('');
    setCurrency('INR');
    setWebinarStartDate('');
    setWebinarStartTime('');
    setWebinarEndDate('');
    setWebinarEndTime('');
    setRegistrationStartDate('');
    setRegistrationStartTime('');
    setRegistrationEndDate('');
    setRegistrationEndTime('');
    setSelectedImage(null);
    setFile(null);
    setPostImage(null);
    setTakeawaysRows([]);
    setAttendRows([]);
    setTakeawayDraft(EMPTY_TAKEAWAY_DRAFT);
    setAudienceDraft(EMPTY_AUDIENCE_DRAFT);
    setSpeakersData([]);
    setSpeakerDraft(EMPTY_SPEAKER_DRAFT);
    setImageSrc(null);
    setValidationErrors({});
    setRecordingUrl('');

    } catch (error) {
      console.error('There was an error creating the webinar:', error); 
      toast.error(error?.response?.data?.Exception || error?.response?.data?.message || 'Unable to save webinar.');
    }finally {
      setLoading(false);
    }
  };

    const [takeawaysRows, setTakeawaysRows] = useState([]);
    const [attendRows, setAttendRows] = useState([]);
    const [takeawayDraft, setTakeawayDraft] = useState(EMPTY_TAKEAWAY_DRAFT);
    const [audienceDraft, setAudienceDraft] = useState(EMPTY_AUDIENCE_DRAFT);

    const handleTakeawaysChange = (changedRow) => {
        // Update specific row in takeawaysRows state
        const updatedRows = takeawaysRows.map((row, index) =>
            index === takeawaysRows.length - 1 ? changedRow : row
        );
        setTakeawaysRows(updatedRows);
    };

    const handleAttendChange = (changedRow) => {
        // Update specific row in attendRows state
        const updatedRows = attendRows.map((row, index) =>
            index === attendRows.length - 1 ? changedRow : row
        );
        setAttendRows(updatedRows);
    };

    const handleTakeawaysAdd = (newRow) => {
        // Add new row to takeawaysRows state
        setTakeawaysRows([...takeawaysRows, newRow]);
      setTakeawayDraft(EMPTY_TAKEAWAY_DRAFT);
    };

    const handleAttendAdd = (newRow) => {
        // Add new row to attendRows state
        setAttendRows([...attendRows, newRow]);
      setAudienceDraft(EMPTY_AUDIENCE_DRAFT);
    };

    const handleTakeawaysRemove = (index) => {
        // Remove row from takeawaysRows state
        const updatedRows = takeawaysRows.filter((row, rowIndex) => rowIndex !== index);
        setTakeawaysRows(updatedRows);
    };

    const handleAttendRemove = (index) => {
        // Remove row from attendRows state
        const updatedRows = attendRows.filter((row, rowIndex) => rowIndex !== index);
        setAttendRows(updatedRows);
    };

    const [speakersData, setSpeakersData] = useState([]);
    const [speakerDraft, setSpeakerDraft] = useState(EMPTY_SPEAKER_DRAFT);

    const handleAddSpeaker = (newSpeaker) => {
      setSpeakersData((previousSpeakers) => [...previousSpeakers, newSpeaker]);
      setSpeakerDraft(EMPTY_SPEAKER_DRAFT);
    };

    const handleRemoveSpeaker = (index) => {
        const updatedSpeakers = [...speakersData];
        updatedSpeakers.splice(index, 1);
        setSpeakersData(updatedSpeakers);
    }; 
    

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
      };

      const formatReverseDate = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      };

      const formatDateForMeetingLink = (date, time) => {
        const dateString = `${date}T${time}`;
        return format(parseISO(dateString), 'dd-MM-yyyy HH:mm');
      };

      
      const hydrateWebinarForm = useCallback((webinar) => {
        if (!webinar) {
          return;
        }

        setIsEdit(true);
        setWebinarTitle(webinar.webinarName || webinar.webinarTitle || '');
        setWebinarInfoId(webinar.webinarInfoId || webinarDetails?.webinarInfoId || '');
        setSubjectId(String(webinar.subjectId || webinar.subjectMasterDB?.subjectMasterId || webinarDetails?.subjectId || ''));
        setRegistrationType(webinar.registrationType || '');
        setWebinarRegPrice(webinar.webinarRegPrice ?? '');
        setCurrency(webinar.currency || 'INR');

        if (webinar.webinarStartTime) {
            const [startDate, startTime] = webinar.webinarStartTime.split(' ');
            setWebinarStartDate(formatDate(startDate));
            setWebinarStartTime(startTime);
        }

        if (webinar.webinarEndTime) {
            const [endDate, endTime] = webinar.webinarEndTime.split(' ');
            setWebinarEndDate(formatDate(endDate));
            setWebinarEndTime(endTime);
        }

        if (webinar.webinarRegStartTime) {
            const [regStartDate, regStartTime] = webinar.webinarRegStartTime.split(' ');
            setRegistrationStartDate(formatDate(regStartDate));
            setRegistrationStartTime(regStartTime);
        }

        if (webinar.webinarRegEndTime) {
            const [regEndDate, regEndTime] = webinar.webinarRegEndTime.split(' ');
            setRegistrationEndDate(formatDate(regEndDate));
            setRegistrationEndTime(regEndTime);
        }

        setMeetingLink(webinar.meetingLink || '');
        setRecordingUrl(webinar.recordingUrl || '');
        const existingImage = webinar.webinarImageDB || webinar.webinarImage || null;
        setImageSrc(getImagePreviewSrc(existingImage));
        setPostImage(existingImage);
        setTakeawaysRows(Array.isArray(webinar.keyTakeaways) ? webinar.keyTakeaways : []);
        setAttendRows(Array.isArray(webinar.audiences) ? webinar.audiences : []);
        setTakeawayDraft(EMPTY_TAKEAWAY_DRAFT);
        setAudienceDraft(EMPTY_AUDIENCE_DRAFT);
        setSpeakersData(Array.isArray(webinar.speakers) ? webinar.speakers : []);
        setSpeakerDraft(EMPTY_SPEAKER_DRAFT);
      }, [webinarDetails?.subjectId, webinarDetails?.webinarInfoId]);

      useEffect(() => {
        const fetchSubjects = async () => {
          try {
            const response = await axios.get(`${BACKEND_BASEURL}/public/getSubjectMaster`);
            setSubjectOptions(Array.isArray(response?.data?.subjects) ? response.data.subjects : []);
          } catch (error) {
            console.error('Error fetching subject options:', error);
          }
        };

        fetchSubjects();
      }, []);

      useEffect(() => {
        if (location.state?.webinar) {
          hydrateWebinarForm(location.state.webinar);
          return;
        }

        if (webinarDetails) {
          hydrateWebinarForm(webinarDetails);
        }
      }, [hydrateWebinarForm, location.state, webinarDetails]);

    const handleCancel = () => {
      navigate("/adminLandingPage", { state: { selectedBox: "webinar" } });
    };
    
    useEffect(() => {
      if (registrationType === 'Free') {
        setWebinarRegPrice('0.00');
      }
    }, [registrationType]);
      

  return (
    <div className='createWebinaPage'>
      <div><Navbar /></div>
      <div className='adminLandingPageContainer'>
        <div className='adminSidebarSection'>
          <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
        </div>

        <div className='webinarHomeSection'>
        <ToastContainer />
        {loading ? (
          <div className='loaderWrapper'>
            <PulseLoader color='#36D7B7' loading={loading} size={15} margin={2} />
          </div>
        ) : (
          <div className='webinarHomeSectionContainer'>
            <div className='webinarDetailHeaderSection'>
              <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
              <div className='webinarBreadcrumSection'>
                <span className='webinarbreadcrumNotSelectedTxt'>Webinar</span>
                <span className='breadcrumSeperator'>/</span>
                <span className='webinarbreadcrumSelectedTxt'> {isEdit ? 'Edit Webinar' : 'Create Webinar'}</span>

              </div>
            </div>
            <div className='border'></div>
            <div className='webinarDetailContentSection'>
              <div className='webinarDetailsDiv'>
                <div className='uploadImageDiv'>
                  <img
                    src={imageSrc || UploadImg}
                    alt='upload'
                    className='uploadImage'
                    onClick={handleUploadClick}
                  />
                  {imageSrc && (
                    <img
                      src={Close}
                      alt='remove'
                      className='editImage'
                      onClick={handleRemoveImage}
                    />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className='webinarFieldDiv'>
                    <div className='inputField'>
                      <label className="webinarTitle">Webinar Title<span className='mandatoryField'>*</span></label>
                      <input type="text" name="webinarTitle" placeholder="Enter webinar title" value={webinarTitle} onChange={(e) => setWebinarTitle(e.target.value)} className={`webinarNameField ${validationErrors.webinarTitle ? 'error' : ''}`} />
                      {validationErrors.webinarTitle && <span className='errorText'>{validationErrors.webinarTitle}</span>}
                    </div>

                    <div className='inputField'>
                      <label className="webinarTitle">Subject<span className='mandatoryField'>*</span></label>
                      <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={`selectOneMenuBox ${validationErrors.subject ? 'error' : ''}`}>
                        <option value="">Select Subject</option>
                        {subjectOptions.map((subjectOption) => (
                          <option key={subjectOption.subjectMasterId} value={subjectOption.subjectMasterId}>
                            {subjectOption.subjectName}
                          </option>
                        ))}
                      </select>
                      {validationErrors.subject && <span className='errorText'>{validationErrors.subject}</span>}
                    </div>
                    <div className='inputField'>
        <label className="webinarTitle">
          Registration Type<span className='mandatoryField'>*</span>
        </label>
        <select
          className={`selectOneMenuBox ${validationErrors.registrationType ? 'error' : ''}`}
          value={registrationType}
          onChange={(e) => setRegistrationType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="Paid">Paid</option>
          <option value="Free">Free</option>
        </select>
        {/* {validationErrors.registrationType && <span className='errorText'>{validationErrors.registrationType}</span>} */}
      </div>
      <div className="inputField">
        <label className="webinarTitle">
          Fees 
        </label>
        <div className="feesContainer">
          <input
            type="text"
            className="feetextFiled"
            placeholder='0.00'
            value={webinarRegPrice}
            onChange={(e) => setWebinarRegPrice(e.target.value)}
            disabled={registrationType === 'Free'}
          />
          <select
            className="selectMenuBox"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
                  </div>
                  <div className='border1'></div>
                  <div className='webinarFieldDiv'>
                    <div className='inputField'>
                      <label className="webinarTitle">Webinar Schedule<span className='mandatoryField'>*</span></label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="inputContainer">
                          <div className="inputWrapper">
                            <input type="date" name="webinarTitle" placeholder="dd-mm-yyyy" className={`webinarField ${validationErrors.webinarStartDate ? 'error' : ''}`} value={webinarStartDate} onChange={(e) => setWebinarStartDate(e.target.value)} />
                            {/* <img src={Calendar} className="calendarIcon" alt="Calendar Icon" /> */}
                            {validationErrors.webinarStartDate && <span className='errorText'>{validationErrors.webinarStartDate}</span>}
                          </div>
                        </div>
                        <div>
                          <div className="feesContainer">
                            <input type="time" className='textField' placeholder='hh:mm' value={webinarStartTime} onChange={(e) => setWebinarStartTime(e.target.value)} /> 
                          </div>
                          {validationErrors.webinarStartTime && <span className='errorText'>{validationErrors.webinarStartTime}</span>}
                        </div>
                        <div>to</div>
                        <div>
                          <div className="feesContainer">
                            <input type="time" className="textField" placeholder='hh:mm' value={webinarEndTime} onChange={(e) => setWebinarEndTime(e.target.value)} />
                            
                          </div>
                          {validationErrors.webinarEndTime && <span className='errorText'>{validationErrors.webinarEndTime}</span>}
                        </div>
                        <div className="inputContainer">
                          <div className="inputWrapper">
                            <input type="date" name="webinarTitle" placeholder="dd-mm-yyyy" className={`webinarField ${validationErrors.webinarEndDate ? 'error' : ''}`} value={webinarEndDate} onChange={(e) => setWebinarEndDate(e.target.value)} />
                            {/* <img src={Calendar} className="calendarIcon" alt="Calendar Icon" /> */}
                            {validationErrors.webinarEndDate && <span className='errorText'>{validationErrors.webinarEndDate}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='border1'></div>
                  <div className='webinarFieldDiv'>
                    <div className='inputField'>
                      <label className="webinarTitle">Registration Starts On<span className='mandatoryField'>*</span></label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="inputContainer">
                        <div className="inputWrapper"> 
                            <input type="date" name="webinarTitle" placeholder="dd-mm-yyyy" className={`webinarField ${validationErrors.registrationStartDate ? 'error' : ''}`} value={registrationStartDate} onChange={(e) => setRegistrationStartDate(e.target.value)} />
                            {/* <img src={Calendar} className="calendarIcon" alt="Calendar Icon" /> */}
                          {validationErrors.registrationStartDate && <span className='errorText'>{validationErrors.registrationStartDate}</span>}
                          </div>
                        </div>
                        <div>
                          <div className="feesContainer">
                            <input type="time" className="textField" placeholder='hh:mm' value={registrationStartTime} onChange={(e) => setRegistrationStartTime(e.target.value)} />
                             
                          </div>
                          {validationErrors.registrationStartTime && <span className='errorText'>{validationErrors.registrationStartTime}</span>}
                        </div>
                      </div>
                    </div>

                    <div className='inputField'>
                      <label className="webinarTitle">Registration Ends On<span className='mandatoryField'>*</span></label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="inputContainer">
                        <div className="inputWrapper">
                            <input 
                            type="date" 
                            name="registrationEndDate" 
                            placeholder="dd-mm-yyyy" 
                            className={`webinarField ${validationErrors.registrationEndDate ? 'error' : ''}`} 
                            value={registrationEndDate} 
                            onChange={(e) => setRegistrationEndDate(e.target.value)} 
                            />
                            {/* <img src={Calendar} className="calendarIcon" alt="Calendar Icon" /> */}
                            {validationErrors.registrationEndDate && <span className='errorText'>{validationErrors.registrationEndDate}</span>}
                        </div>
                        </div>
                        <div>
                          <div className="feesContainer">
                            <input type="time" className="textField" placeholder='hh:mm' value={registrationEndTime} onChange={(e) => setRegistrationEndTime(e.target.value)} />
                             
                          </div>
                          {validationErrors.registrationEndTime && <span className='errorText'>{validationErrors.registrationEndTime}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='border1'></div>
                <div className='webinarFieldDiv'>
                  {!isInputVisible ? (
                    <div className='meetlinkDiv' onClick={handleGenerateLinkClick}>Generate Meeting Link</div>
                  ) : (
                    <div className='inputContainer'>
                      <label className='webinarTitle'>Meeting Link<span className='mandatoryFiled'>*</span></label>
                      <input
                        type="text"
                        className='webinarNameField'
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className='webinarFieldDiv'>
                  <div className='inputField' style={{ width: '100%' }}>
                    <label className='webinarTitle'>Recording URL</label>
                    <input
                      type="text"
                      className='webinarNameField'
                      placeholder='Paste MP4, YouTube, Vimeo, or recording link'
                      value={recordingUrl}
                      onChange={(e) => setRecordingUrl(e.target.value)}
                    />
                  </div>
                </div>

                </div>
              </div>

              <div className="tabContainer">
                <div className="tabs">
                  <div 
                    className={`tabButton ${activeTab === 'speakers' ? 'active' : ''}`}
                    onClick={() => handleTabClick('speakers')}
                  >
                    Speakers 
                  </div>
                  <div
                    className={`tabButton ${activeTab === 'additionalContents' ? 'active' : ''}`}
                    onClick={() => handleTabClick('additionalContents')}
                  >
                    Additional Contents
                  </div>
                </div>
                {activeTab === 'speakers' && (
                  <div className="tabContent">
                  <SpeakersTab
                    speakersData={speakersData}
                    speakerDraft={speakerDraft}
                    onSpeakerDraftChange={setSpeakerDraft}
                    onAddSpeaker={handleAddSpeaker}
                    onRemoveSpeaker={handleRemoveSpeaker}
                />
                  </div>
                )}
                {activeTab === 'additionalContents' && (
                <div className="tabContent">
                    <AdditionalContent
                        takeawaysRows={takeawaysRows}
                        attendRows={attendRows}
                      takeawayDraft={takeawayDraft}
                      audienceDraft={audienceDraft}
                        onTakeawaysChange={handleTakeawaysChange}
                        onAttendChange={handleAttendChange}
                      onTakeawayDraftChange={setTakeawayDraft}
                      onAudienceDraftChange={setAudienceDraft}
                        onTakeawaysAdd={handleTakeawaysAdd}
                        onAttendAdd={handleAttendAdd}
                        onTakeawaysRemove={handleTakeawaysRemove}
                        onAttendRemove={handleAttendRemove}
                    />
                </div>
            )}
              </div>
            </div>

            <div className='webinarButtonDiv'>
              <div className='webinarCancelButton' onClick={handleCancel}>Cancel</div>
              {/* <div className='webinarPreviewButton' onClick={handlePreview}>Preview</div> */}
              <div className='webinarCreateButton' onClick={handleCreateWebinar}>{isEdit ? 'Update' : 'Create'}</div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
