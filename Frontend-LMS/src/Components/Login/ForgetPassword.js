import React, { useState, useEffect } from 'react';
import './ForgetPassword.css';
import { useNavigate } from 'react-router-dom';
import OTPInput from 'otp-input-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgotpasswordImage from '../../Assets/Images/forgotpasswordimg.svg';
import Back from '../../Assets/Images/back.svg';
import axios from 'axios';
import PulseLoader from 'react-spinners/PulseLoader'; // Import PulseLoader from react-spinners
import { BACKEND_BASEURL } from "../helper";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('email');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [OTP, setOTP] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // Initial countdown time in seconds
  const [showResend, setShowResend] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [submitting, setSubmitting] = useState(false); // Loading state for submit button
  const [verifying, setVerifying] = useState(false); // Loading state for verify button

  useEffect(() => {
    let timerId;
    if (isModalOpen && timeLeft > 0) {
      timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setShowResend(true);
    }
    return () => clearTimeout(timerId);
  }, [timeLeft, isModalOpen]);

  const handleBackToLandingPage = () => {
    navigate('/');
  };

  const handleEmailChange = (event) => {
    const emailValue = event.target.value;
    setEmail(emailValue);
    if (!validateEmail(emailValue)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const handleMobileChange = (event) => {
    const mobileValue = event.target.value;
    const phoneNumberPattern = /^[0-9\b]+$/; // Allow only numbers and backspace

    if ((mobileValue === '' || phoneNumberPattern.test(mobileValue)) && mobileValue.length <= 10) {
      setMobile(mobileValue);
    } else {
      return;
    }

    if (mobileValue.length !== 10) {
      setMobileError('Mobile number must be 10 digits');
    } else {
      setMobileError('');
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async () => {
    if (selectedMethod === 'email') {
      if (email.trim() === '') {
        toast.error('Please enter your email.');
        return;
      }
      if (emailError) {
        toast.error('Please enter a valid email.');
        return;
      }
    }
    if (selectedMethod === 'mobile') {
      if (mobile.trim() === '') {
        toast.error('Please enter your mobile number.');
        return;
      }
      if (mobileError) {
        toast.error('Please enter a valid mobile number.');
        return;
      }
    }

    setSubmitting(true); // Set loading state for submit button

    const identifier = selectedMethod === 'email' ? email : mobile;
    const medium = selectedMethod === 'email' ? 'EMAIL' : 'MOBILE';

    try {
      const response = await axios.post(`${BACKEND_BASEURL}/student/send-otp?forgotPassword=true`, {
        identifier,
        medium,
      });

      if (response.data.status) {
        setIsModalOpen(true);
        setTimeLeft(60); // Reset the timer when opening the modal
        setShowResend(false); // Hide the "Resend OTP" button
        toast.success('OTP sent successfully.');
      } else {
        toast.error('Failed to send OTP.');
      }
    } catch (error) {
      toast.error('Please enter registered email.');
    } finally {
      setSubmitting(false); // Reset loading state for submit button
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResend = () => {
    setOTP('');
    setTimeLeft(60);
    setShowResend(false);
    // Add your resend OTP logic here
  };

  const handleVerifyOTP = async () => {
    const identifier = selectedMethod === 'email' ? email : mobile;
    const medium = selectedMethod === 'email' ? 'EMAIL' : 'MOBILE';

    setVerifying(true); // Set loading state for verify button

    try {
      const response = await axios.post(`${BACKEND_BASEURL}/student/verify-otp`, {
        identifier,
        otp: OTP,
        medium,
      });

      if (response.data.status) {
        toast.success('OTP verified successfully.');
        navigate('/resetPassword', { state: { identifier } }); // Navigate to reset password page
      } else {
        toast.error('Failed to verify OTP.');
      }
    } catch (error) {
      toast.error('Error verifying OTP. Please try again.');
    } finally {
      setVerifying(false); // Reset loading state for verify button
    }
  };

  return (
    <div className='forgotPasswordContainer'>
      <ToastContainer />
      <div className='forgotPasswordSubContainer'>
        <div className='forgotpasswordleftContainer'>
          <img src={ForgotpasswordImage} alt='Forgot Password' />
        </div>
        <div className='forgotpasswordrightContainer'>
          <div className='forgotpasswordHeader'>Forgot Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className='mobileNoText'>
              <input
                type="radio"
                id="email"
                name="resetMethod"
                value="email"
                checked={selectedMethod === 'email'}
                onChange={() => setSelectedMethod('email')}
              />
              <label htmlFor="email">Reset using email</label>
            </div>
            {/* <div className='mobileNoText'>
              <input
                type="radio"
                id="mobile"
                name="resetMethod"
                value="mobile"
                checked={selectedMethod === 'mobile'}
                onChange={() => setSelectedMethod('mobile')}
              />
              <label htmlFor="mobile">Reset using mobile number</label>
            </div> */}
          </div>
          {selectedMethod === 'email' && (
            <div className='inputField'>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                placeholder='Enter your email'
                value={email}
                onChange={handleEmailChange}
              />
              {emailError && <span className='errorText'>{emailError}</span>}
            </div>
          )}
          {selectedMethod === 'mobile' && (
            <div className='inputField'>
              <label htmlFor='mobile'>Mobile Number</label>
              <input
                type='tel'
                id='mobile'
                placeholder='Enter your mobile number'
                value={mobile}
                onChange={handleMobileChange}
              />
              {mobileError && <span className='errorText'>{mobileError}</span>}
            </div>
          )}
          <button onClick={handleSubmit} className='submitButton'>
            {submitting ? <PulseLoader color='#ffffff' size={8} margin={2} /> : 'Submit'}
          </button>
          <div className='backButtonImage'>
            <img src={Back} alt='Back' onClick={handleBackToLandingPage} />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className='modalBackdrop' onClick={handleCloseModal}>
          <div className='otpmodal' onClick={(e) => e.stopPropagation()}>
            <div className='VerifyOtp'>
              <div className='vertfyOtpHeader'>Verify it's you</div>
              <div className='vertfyOtpSubHeader'>
                Enter the 6 digit OTP sent to {selectedMethod === 'email' ? email : `XXXXXX ${mobile.slice(-4)}`}
              </div>
            </div>
            <div className='OtpFieldHeader'>
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
            <div className='timer'>
              {showResend ? (
                <div onClick={handleResend} className='ResentOtpText'>
                  Resend OTP
                </div>
              ) : (
                <div className='textLight'>
                  Resend OTP in <b>{timeLeft} seconds</b>
                </div>
              )}
            </div>
            <div className='forgotPasswordButton'>
              <button className='forgotPasswordCloseButton' onClick={handleCloseModal}>Close</button>
              <button onClick={handleVerifyOTP} className='forgotPasswordVerifyButton'>
                {verifying ? <PulseLoader color='#ffffff' size={8} margin={2} /> : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
