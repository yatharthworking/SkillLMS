import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPInput from 'otp-input-react';
import Yes from '../../Assets/Images/yes.svg';
import No from '../../Assets/Images/no.svg'; 
import OpenEye from '../../Assets/Images/openEye.svg';
import CloseEye from '../../Assets/Images/closeEye.svg'; 
import Register from '../../Assets/Images/Register.svg';
import './RegisterStudent.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { delay,BACKEND_BASEURL } from '../helper';
// import { useMutation } from '@apollo/client';
// import { CREATE_USER_INFO, SEND_OTP, VERIFY_OTP } from '../../GraphQL/Mutations/StudentRegistration';

export default function RegisterStudent() {
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const navigate = useNavigate();
  const [loading,setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState(''); 
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasNumericChar, setHasNumericChar] = useState(false);
  const [hasUppercaseChar, setHasUppercaseChar] = useState(false);
  const [hasLowercaseChar, setHasLowercaseChar] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); //Setting 180 seconds as OTP expiry time is 3 minutes
  const [showResend, setShowResend] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [OTP, setOTP] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [branches, setBranches] = useState([]); // State for branches
  const [selectedBranch, setSelectedBranch] = useState('');

  // const [createUserInfo] = useMutation(CREATE_USER_INFO);
  // const [sendOTP] = useMutation(SEND_OTP);
  // const [verifyOTP] = useMutation(VERIFY_OTP);

  const handleConfirmPasswordChange = (e) => {
    const newPassword = e.target.value;
    setConfirmPassword(newPassword);
    setPasswordsMatch(newPassword === password || newPassword === '');
  }

  const toggleConfirmPasswordVisibility = () => {
    setshowConfirmPassword(!showConfirmPassword);
};

  const togglePasswordVisibility = () => {

    setShowPassword(!showPassword);

  };

  const handleResetCancel = () => { 
    navigate('/');
  };

  const handleCloseModal = () =>{

    setIsModalOpen(false);

    setTimeLeft(180);

    setShowResend(false);
  }

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/public/fetchOrganizationsBranches`, {
          params: {
            organizationMasterId: organizationId,
            userId: 0
          }
        });

        if (response.status === 200 && response.data.status) {
          setBranches(response.data.data);
        } else {
          toast.error('Failed to fetch branches.');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Error fetching branches.');
      }
    };

    fetchBranches();
  }, [organizationId]);

  const handleBranchChange = (e) => {
    const newValue = e.target.value;
  console.log("Selected Branch Value:", newValue);
    setSelectedBranch(Number(e.target.value)); // Ensure the value is a number if needed
  };
  

  const handleVerifyModal = async () => {
    try {
      const verifyOTPPostBody = {
        identifier: email,
        medium: 'EMAIL',
        otp: OTP
      };
  
      const verifyOTPResponse = await axios.post(`${BACKEND_BASEURL}/student/verify-otp`, verifyOTPPostBody);
      
      if (verifyOTPResponse.status === 200) {
        toast.success('OTP verified successfully!');
  
        // Find the selected branch details
        const selectedBranchData = branches.find(branch => branch.orgId === Number(selectedBranch));

       

        console.log("selectedBranchData",selectedBranchData)
        console.log("Branches Data:", branches);

        
        if (!selectedBranchData) {
          toast.error('Selected branch not found.');
          return;
        }
  
        const registerStudentPostBody = { 
          fullName: fullName,
          email: email,
          mobileNo: mobileNumber,
          userCredentialsDB: {
            password: password
          },
          roles: [
            {
              role: "STUDENT"
            }
          ],
          organizationsDB: {
            orgId: selectedBranchData.orgId,
            orgName: selectedBranchData.orgName,
            orgCode: selectedBranchData.orgCode,
            orgAddress: selectedBranchData.orgAddress,
            orgCity: selectedBranchData.orgCity,
            orgState: selectedBranchData.orgState,
            orgCountry: selectedBranchData.orgCountry,
            orgPincode: selectedBranchData.orgPincode,
            orgContactNo: selectedBranchData.orgContactNo,
            orgCurrency: selectedBranchData.orgCurrency,
            isActive: selectedBranchData.isActive,
            orgLongitude: selectedBranchData.orgLongitude,
            orgLatitude: selectedBranchData.orgLatitude

          }
        };
  
        const response = await axios.post(`${BACKEND_BASEURL}/student/create-user`, registerStudentPostBody);
  
        if (response.status === 200) {
          toast.success('Registration successful!');
          await delay(1000);
          navigate('/login');
        } else {
          toast.error('Registration failed. Please try again.');
        }
        
        setIsModalOpen(false);
        setTimeLeft(180);
        setShowResend(false);
        setOTP('');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('OTP verification failed. Please try again.');
    }
  };
  
  const handleResend = async () => {
    setOTP('');
    setTimeLeft(180);
    setShowResend(false);

    try {
      const sendOTPPostBody = {
        identifier: email,
        medium: 'EMAIL'
      };

      const otpResponse = await axios.post(`${BACKEND_BASEURL}/student/send-otp`, sendOTPPostBody);

      if (otpResponse.status === 200) {
        toast.success(`OTP resent successfully to ${email}!`);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const handlePasswordChange = (e) => {

    const newPassword = e.target.value;

    setPassword(newPassword);

    const lengthValid = newPassword.length >= 8;
    const numericChar = /\d/.test(newPassword);
    const uppercaseChar = /[A-Z]/.test(newPassword);
    const lowercaseChar = /[a-z]/.test(newPassword);
    const specialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

    setIsLengthValid(lengthValid);
    setHasNumericChar(numericChar);
    setHasUppercaseChar(uppercaseChar);
    setHasLowercaseChar(lowercaseChar);
    setHasSpecialChar(specialChar);

    if (lengthValid && numericChar && uppercaseChar && lowercaseChar && specialChar) {
      setPasswordError('');
    } else {
      setPasswordError(' ');
      // Password does not meet the criteria
    }

  };

  const validateEmail = (email) => {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

  };

  
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    if (validateEmail(emailValue)) {
      setEmailError('');
    } else {
      setEmailError('Invalid email address');
    }
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setMobileNumber(value);
      validateMobileNumber(value);
    } else {
      setMobileNumberError('Please enter only numeric values.');
    }
  };

  const validateMobileNumber = (number) => {
    const mobileNumberPattern = /^[0-9]{10}$/; // Assuming a 10-digit mobile number
    if (number.length === 0) {
      setMobileNumberError('Mobile number is required.');
    } else if (!mobileNumberPattern.test(number)) {
      setMobileNumberError('Please enter a valid 10-digit mobile number.');
    } else {
      setMobileNumberError('');
    }
  };

  const handleRegisterClick = async (event) => {
    setLoading(true);
    event.preventDefault();

    if (email.trim() === '') {
      toast.error('Please enter your email.');
      setLoading(false);
      return;
    } else if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      setLoading(false);
      return;
    }else if (selectedBranch === '') {
      toast.error('Please select a branch.');
      setLoading(false);
      return;
    }

    try {
      const sendOTPPostBody = {
        identifier: email,
        medium: 'EMAIL'
      };

      const otpResponse = await axios.post(`${BACKEND_BASEURL}/student/send-otp`, sendOTPPostBody);

      if (otpResponse.status === 200) {
        toast.success(`OTP sent successfully to ${email}`);
        setIsModalOpen(true);
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isModalOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowResend(true);
    }
    return () => clearInterval(timer);
  }, [isModalOpen, timeLeft]);

  // Determine if the register button should be enabled
  const isRegisterButtonEnabled = emailError === '' && passwordError === '' && isLengthValid && hasNumericChar && hasUppercaseChar && hasLowercaseChar && hasSpecialChar;


  return (

    <div className='registerContainer'>

      <ToastContainer />
      <div className='registerPageleftContainer'>
        <img src={Register} alt='Register' />
      </div>
      <div className='registerPagerightContainer'> 
        <div className='registerdHeader'>Student Registration</div>
        <div style={{display:'flex',gap:'12px',width:'100%'}}>
        <div className='studentNameSection'>
          <div className='studentNamesubHeaderText'>Full Name<span className='mandatory'>*</span></div>
          <input
            className='emailField'
            type='text'
            placeholder='Full Name'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className='studentNameSection'>
          <div className='studentNamesubHeaderText'>Branch<span className='mandatory'>*</span></div>
          <select className='branchField' value={selectedBranch} onChange={handleBranchChange}>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.orgId} value={branch.orgId}>
                  {branch.orgName}
                </option>
              ))}
            </select>
        </div>
        </div>

        <div className='emailPasswordField'>
          <div className='EmailContents'>
              <div>Email<span className='mandatory'>*</span></div>
              <input
                className='emailField'
                type='text'
                placeholder='example@gmail.com'
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <div className='errorText'>{emailError}</div>}
            </div>

            <div className='EmailContents'>
              <div>Mobile No.<span className='mandatory'>*</span></div>
              <input
                className='emailField'
                type='text'
                placeholder='00000 00000'
                value={mobileNumber}
                onChange={handleMobileNumberChange}
              />
              {mobileNumberError && <div className='errorText'>{mobileNumberError}</div>}
            </div>
        </div>
        <div className='emailPasswordField'>
          <div className='passwordContent'>
            <div className='passwordSubContent'>Password<span className='mandatory'>*</span></div>
            <div className='passwordInputContainer'>
              <input
                className='Password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter Password'
                value={password}
                onChange={handlePasswordChange}
              />
              <button className='eyeButton' onClick={togglePasswordVisibility}>
                <img src={showPassword ? OpenEye : CloseEye} alt='Toggle Password Visibility' className='eyeIcon'/>
              </button>
            </div>
            {passwordError && <div className='errorText'>{passwordError}</div>}
          </div>

          <div className='passwordContent'>
            <div className='passwordSubContent'>Confirm Password<span className='mandatory'>*</span></div>
            <div className='passwordInputContainer'>
                <input className='newPassword'  
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder='Confirm new password'  onChange={handleConfirmPasswordChange}
                    value={confirmPassword} disabled={!isLengthValid || !hasNumericChar || !hasUppercaseChar || !hasLowercaseChar || !hasSpecialChar}
                />
                {!passwordsMatch && confirmPassword && <div className="password-error">Confirm password does not match new password!</div>}
                <button className='eyeButton'onClick={toggleConfirmPasswordVisibility}>
                    <img src={showConfirmPassword ? OpenEye : CloseEye}alt='' className='eyeIcon'/>
                </button>
              </div> 
            {passwordError && <div className='errorText'>{passwordError}</div>}
          </div>
        </div>
        <div className='registerpasswordcond'>
          <div className='ConditionContentscontainer'>
            <div className='registerPasswordCondition'>Your password must contain</div>

            <div className='registerpasswordcontent'>
              <img className='validation' src={hasUppercaseChar ? Yes : No} alt="Uppercase" />
              Contain at least one uppercase letter.
            </div>

            <div className='registerpasswordcontent'>
              <img className='validation' src={hasLowercaseChar ? Yes : No} alt="Lowercase" />
              Contain at least one lowercase letter.
            </div>

            <div className='registerpasswordcontent'>
              <img className='validation' src={hasNumericChar ? Yes : No} alt="Numeric" />
              Contain at least one numeric character.
            </div>

            <div className='registerpasswordcontent'>
              <img className='validation' src={hasSpecialChar ? Yes : No} alt="Special" />
              Contain at least one special character (such as !, @, #, $, %, etc...).
            </div>

            <div className='registerpasswordcontent'>
              <img className='validation' src={isLengthValid ? Yes : No} alt="Length" />
              Minimum 8 characters length.
            </div>
            
          </div>
        </div>
        <div className='registerPasswordButton'>
          <button onClick={handleResetCancel} disabled = {loading} className='registerPasswordCloseButton'>Back to login</button>
          <button onClick={handleRegisterClick} disabled = {!isRegisterButtonEnabled || loading} className='registerPasswordVerifyButton'>Register</button>
        </div>
      </div>

      {isModalOpen && (
        <div className='registermodalBackdrop' onClick={handleCloseModal}>
          <div className='registermodal' onClick={e => e.stopPropagation()}>
            <div className='registerVerifyOtp'>
              <div className='registervertfyOtpHeader'>Verify it's you</div>
              <div className='registervertfyOtpSubHeader'>
                Enter the 6 digit OTP sent to {email || 'your registered email'}
              </div>

            </div>
            <div className='registerOtpFieldHeader'>
              <OTPInput
                value={OTP}
                onChange={setOTP}
                autoFocus
                OTPLength={6}
                otpType="number"
                disabled={false}
                separator={<span>-</span>}
                inputStyle={{ borderRadius: '5px' }}
              />
            </div>
            <div className='registertimer'>
              {showResend ? (
                <div onClick={handleResend} className='ResentOtpText'>Resend OTP</div>
              ) : (
                <span className='OtpTimer'>Resend in <span style={{color:'#6B728C',fontWeight:'bold',fontSize:'12px'}}>{timeLeft} sec</span></span>
              )}
            </div>
            <div className='forgotPasswordButton'>
              <button onClick={handleCloseModal} className='forgotPasswordCloseButton'>Close</button>
              <button onClick={handleVerifyModal} className='forgotPasswordVerifyButton'>Verify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
