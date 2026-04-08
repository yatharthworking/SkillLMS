import React, { useState, useEffect } from 'react';
import './AdminProfilePersonalDetails.css';
import { validateEmail, validatePhoneNumber } from '../../helper';
import Calendar from '../../../Assets/Images/calendar.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_BASEURL, adminDetails } from '../../helper';
import axios from 'axios';
import { PulseLoader } from 'react-spinners'; // Import PulseLoader
import CircularProgress from '@mui/material/CircularProgress';

const AdminProfilePersonalDetails = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [selectedGender, setSelectedGender] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [loadingUpdate, setLoadingUpdate] = useState(false); 

  const token = localStorage.getItem('token');
  const adminDetail = JSON.parse(localStorage.getItem('adminDetails'));
  const adminLoginResponse = JSON.parse(localStorage.getItem('AdminLoginResponse'));
  
  // Set Bearer Token globally
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const fetchUserDetails = async () => {
    const emailToFetch = adminDetail?.email || adminLoginResponse?.sub || adminLoginResponse?.email;
    if(!emailToFetch) return;

    setLoading(true); // Start loading indicator
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails?email=${emailToFetch}`);
      const data = response.data;
      if(response.status === 200){
        setUserDetails(data);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setSelectedGender(data.gender || '');
        setPhoneNumber(data.mobileNo ? data.mobileNo.toString() : '');
        setDateOfBirth(data.dob ? new Date(data.dob) : null);

        localStorage.setItem('adminDetails', JSON.stringify(data));
        // Dispatch event to update Navbar
        window.dispatchEvent(new Event('profileUpdate'));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleEmailChange = (event) => {
    const emailValue = event.target.value;
    setEmail(emailValue);
    if (emailValue === '') {
      setEmailError('');
    } else if (!validateEmail(emailValue)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneNumberChange = (event) => {
    const phoneValue = event.target.value;
    const phoneNumberPattern = /^[0-9\b]+$/; // Allow only numbers and backspace

    if ((phoneValue === '' || phoneNumberPattern.test(phoneValue)) && phoneValue.length <= 10) {
      setPhoneNumber(phoneValue);
    } else {
      return;
    }

    if (phoneValue === '') {
      setPhoneError('');
    } else if (!validatePhoneNumber(phoneValue)) {
      setPhoneError('Invalid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };



  const updateUserDetails = async () => {
    setLoadingUpdate(true);
    try {
      const updateData = {...userDetails,
        fullName :fullName,
        email: email || adminLoginResponse?.sub || adminLoginResponse?.email,
        mobileNo: phoneNumber,
        dob: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
        gender: selectedGender,
        roles: userDetails?.roles || adminLoginResponse?.roles?.map(r => ({ roleMaster: { roleMasterName: r } }))
      };
      const response = await axios.patch(`${BACKEND_BASEURL}/admin/save-updateUserDetails`, updateData);
      if(response.status === 200){
       toast.success('Profile updated successfully!');
       fetchUserDetails();
       // Notify Navbar/Other components
       window.dispatchEvent(new Event('profileUpdate'));
      }
    } catch (error) {
      toast.error('Error updating user details');
      console.error('Error updating user details:', error);
    }finally{
      setLoadingUpdate(false);
    }
  };

  return (
    <div className='userProfilePersonalDetailPage'>
      <div className='adminPersonalDetailsHeading'>Personal Details</div>
      <ToastContainer/>
        {loading ? (
          <div className='loader-container'>
            <PulseLoader color='#123abc' size={15} />
          </div>
        ) : (
          <>
            <div className='adminPersonalDetailsContainer'>
            <div className='personalDetailsNameField1'>
              <div className='adminprofileinputHeaderText'>
                Full Name<span className='mandatoryField'>*</span>
              </div>
              <input
                className='adminNameinputBox'
                placeholder='Enter Name'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className='adminpersonalDetailsNameField'>
              <div className='adminprofileinputHeaderText'>
                Email<span className='mandatoryField'>*</span>
              </div>
              <input
                className='adminNameinputBox'
                placeholder='Enter Email'
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <span className='errorText'>{emailError} ❌</span>}
            </div>

            <div className='adminpersonalDetailsNameField'>
              <div className='adminprofileinputHeaderText'>
                Phone Number<span className='mandatoryField'>*</span>
              </div>
              <div className='adminPhoneInputContainer'>
                <select className='adminCountryCodeSelect'>
                  <option value='+91'>IND</option>
                  <option value='+92'>PAK</option>
                  <option value='+61'>AUS</option>
                  {/* Add more country codes as needed */}
                </select>

                <input
                  className='adminPhoneInputBox'
                  type='text'
                  placeholder='00000 00000'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                />
              </div>
              {phoneError && <div className='errorText'>{phoneError} ❌</div>}
            </div>

            <div className='adminpersonalDetailsNameField'>
              <div className='adminprofileinputHeaderText'>Date Of Birth</div>
              <div className=''>
                <input
                  type='date'
                  value={dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateOfBirth(new Date(e.target.value))}
                  dateFormat='dd/MM/yyyy'
                  placeholderText='dd/mm/yyyy'
                  className='admincalendarinputBox'
                  max={new Date().toISOString().split('T')[0]} // Disable dates after today
                />
              </div>
            </div>

            <div className='adminpersonalDetailsNameField'>
              <div className='adminprofileinputHeaderText'>Gender</div>
              <div className='admingenderField'>
                <input
                  className='adminradioButton'
                  type='radio'
                  value='Male'
                  checked={selectedGender === 'Male'}
                  onChange={handleGenderChange}
                />
                <label className='radioLabel'>Male</label>

                <input
                  className='adminradioButton'
                  type='radio'
                  value='Female'
                  checked={selectedGender === 'Female'}
                  onChange={handleGenderChange}
                />
                <label className='radioLabel'>Female</label>

                <input
                  className='adminradioButton'
                  type='radio'
                  value='Others'
                  checked={selectedGender === 'Others'}
                  onChange={handleGenderChange}
                />
                <label className='radioLabel'>Others</label>
              </div>
            </div>
            </div>
        <div className='adminUpdateButtonDiv'>
          <button onClick={updateUserDetails}>
            {loadingUpdate ? <CircularProgress size={20} style={{ color: 'white' }}  />  : 'Update'}
          </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProfilePersonalDetails;
