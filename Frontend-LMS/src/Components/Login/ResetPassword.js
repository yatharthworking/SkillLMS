import React, { useState, useEffect } from 'react';
import './ResetPassword.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests
import Yes from '../../Assets/Images/yes.svg';
import No from '../../Assets/Images/no.svg';
import OpenEye from '../../Assets/Images/openEye.svg';
import CloseEye from '../../Assets/Images/closeEye.svg';
import ForgotpasswordImage from '../../Assets/Images/forgotpasswordimg.svg';
import { toast, ToastContainer } from 'react-toastify';
import PulseLoader from 'react-spinners/PulseLoader';
import { BACKEND_BASEURL } from "../helper";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identifier } = location.state || {}; // Destructure identifier from location.state

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasNumericChar, setHasNumericChar] = useState(false);
  const [hasUppercaseChar, setHasUppercaseChar] = useState(false);
  const [hasLowerrcaseChar, sethasLowerrcaseChar] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setshowConfirmPassword(!showConfirmPassword);
  };

  const handleResetCancel = () => {
    navigate('/Login');
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsLengthValid(newPassword.length >= 8);
    setHasNumericChar(/\d/.test(newPassword));
    setHasUppercaseChar(/[A-Z]/.test(newPassword));
    sethasLowerrcaseChar(/[a-z]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword));
    if (!(newPassword.length >= 6 && /\d/.test(newPassword) && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword))) {
      setConfirmPassword('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newPassword = e.target.value;
    setConfirmPassword(newPassword);
    setPasswordsMatch(newPassword === password || newPassword === '');
  };

  const handleResetPassword = async () => {
    setIsLoading(true); // Set loading state to true when starting API call
    try {
      const response = await axios.post(`${BACKEND_BASEURL}/student/forgot-password`, {
        userName: identifier,
        newPassword: password,
      });
  
      if (response.data.status) {
        // Handle success scenario, e.g., show a success message or navigate to another page
        toast.success('Password reset successfully.');
        navigate('/Login'); // Navigate to login page after successful reset
      } else {
        // Handle failure scenario
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      // Handle API call errors
      toast.error('Error resetting password. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure
    }
  };
  

  return (
    <div className='resetpasswordBody'>
      <ToastContainer/>
      <div className='resetpasswordleftContainer'>
        <img src={ForgotpasswordImage} alt='Forgot Password' />
      </div>
      <div className='resetpasswordrightContainer'>
        <div className='resetpasswordHeader'>Reset Password</div>
        <div className='resetPassword'>
          <div style={{ width: '48%' }}>
            <div className='subHeaderText'>New Password</div>
            <div className='passwordInputContainer'>
              <input
                className='newPassword'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter Password'
                onChange={handlePasswordChange}
              />
              <button className='eyeButton' onClick={togglePasswordVisibility}>
                <img src={showPassword ? OpenEye : CloseEye} alt='' className='eyeIcon' />
              </button>
            </div>
          </div>

          <div style={{ width: '48%' }}>
            <div className='subHeaderText'>Confirm New Password</div>
            <div className='passwordInputContainer'>
              <input
                className='newPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm new password'
                onChange={handleConfirmPasswordChange}
                value={confirmPassword}
                disabled={!isLengthValid || !hasNumericChar || !hasUppercaseChar || !hasLowerrcaseChar || !hasSpecialChar}
              />
              {!passwordsMatch && confirmPassword && (
                <div className='password-error'>Confirm password does not match new password!</div>
              )}
              <button className='eyeButton' onClick={toggleConfirmPasswordVisibility}>
                <img src={showConfirmPassword ? OpenEye : CloseEye} alt='' className='eyeIcon' />
              </button>
            </div>
          </div>
        </div>
        <div className='resetpasswordcond'>
          <div className='containerAboveButtons'>
            <div className='passwordCondition'>Your password must contain</div>
            <div className='resetpasswordcontent'>
              <img className='validation' src={hasUppercaseChar ? Yes : No} alt='Uppercase' />
              Contain at least one uppercase letter.
            </div>

            <div className='resetpasswordcontent'>
              <img className='validation' src={hasLowerrcaseChar ? Yes : No} alt='Uppercase' />
              Contain at least one lowercase letter.
            </div>
            <div className='resetpasswordcontent'>
              <img className='validation' src={hasNumericChar ? Yes : No} alt='Numeric' />
              Contain at least one numeric character.
            </div>

            <div className='resetpasswordcontent'>
              <img className='validation' src={hasSpecialChar ? Yes : No} alt='Special' />
              Contain at least one special character (such as !, @, #, $, %, etc...).
            </div>
            <div className='resetpasswordcontent'>
              <img className='validation' src={isLengthValid ? Yes : No} alt='Length' />
              Minimum 8 characters length.
            </div>
          </div>
        </div>
        <div className='resetPasswordButton'>
          <button onClick={handleResetCancel} className='resetPasswordCloseButton'>
            Cancel
          </button>
          <button onClick={handleResetPassword} className='resetPasswordVerifyButton' disabled={isLoading}>
            {isLoading ? <PulseLoader color="#ffffff" size={8} margin={2} /> : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
}
