import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfileResetPassword.css';
import OpenEye from '../../../Assets/Images/openEye.svg';
import CloseEye from '../../../Assets/Images/closeEye.svg';
import Yes from '../../../Assets/Images/yes.svg';
import No from '../../../Assets/Images/no.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BACKEND_BASEURL, studentDetails } from '../../helper';
import { PulseLoader } from 'react-spinners';

export default function UserProfileResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [userName, setUserName] = useState(''); // Example username
  const [errorMessage, setErrorMessage] = useState('');

  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasNumericChar, setHasNumericChar] = useState(false);
  const [hasUppercaseChar, setHasUppercaseChar] = useState(false);
  const [hasLowerrcaseChar, sethasLowerrcaseChar] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handleConfirmPasswordChange = (e) => {
    const newPassword = e.target.value;
    setConfirmPassword(newPassword);
    setPasswordsMatch(newPassword === password || newPassword === '');
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsLengthValid(newPassword.length >= 8);
    setHasNumericChar(/\d/.test(newPassword));
    setHasUppercaseChar(/[A-Z]/.test(newPassword));
    sethasLowerrcaseChar(/[a-z]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword));
    if (
      !(
        newPassword.length >= 8 &&
        /\d/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)
      )
    ) {
      setConfirmPassword('');
    }
  };

  const handleOldPasswordChange = (e) => {
    setOldPassword(e.target.value);
  };

  //Commonly Setting the Bearer Token here so dont need to set header token in each API call.
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const handlePasswordReset = async () => {
    if (
      !isLengthValid ||
      !hasNumericChar ||
      !hasUppercaseChar ||
      !hasLowerrcaseChar ||
      !hasSpecialChar ||
      !passwordsMatch
    ) {
      setErrorMessage('Please ensure all password criteria are met and passwords match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const userName = JSON.parse(studentDetails).email;
      const payload = {
        userName: userName,
        oldPassword,
        newPassword: password,
      };

      const response = await axios.patch(`${BACKEND_BASEURL}/student/resetPassword`, payload, token);

      if (response.status !== 200) {
        throw new Error('Password reset failed.');
      }
      toast.success('Password reset successful!');
      setPassword('');
      setConfirmPassword('');
      setOldPassword('');
    } catch (error) {
      console.error(error);
      setErrorMessage('An error occurred while resetting the password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='userProfileResetPasswordPage'>
      <div className='resetPasswordHeading'>Reset Password</div>
      <div className='oldPasswordField'>
        <div className='resetPasswordHeaderText'>
          Old Password<span className='mandatoryField'>*</span>
        </div>
        <div className='passwordInputContainer'>
          <input
            className='resetNewPassword'
            type={showPassword ? 'text' : 'password'}
            placeholder='Old Password'
            value={oldPassword}
            onChange={handleOldPasswordChange}
          />
          <button className='eyeButton' onClick={togglePasswordVisibility}>
            <img src={showPassword ? OpenEye : CloseEye} alt='' className='eyeIcon' />
          </button>
        </div>
      </div>
      <div className='resetpasswordContainer'>
        <div className='ResetPasswordDiv'>
          <div className='resetPasswordText'>
            New Password<span className='mandatoryField'>*</span>
          </div>
          <div className='passwordInputContainer'>
            <input
              className='resetNewPassword'
              type={showPassword ? 'text' : 'password'}
              placeholder='New Password'
              value={password}
              onChange={handlePasswordChange}
            />
            <button className='eyeButton' onClick={togglePasswordVisibility}>
              <img src={showPassword ? OpenEye : CloseEye} alt='' className='eyeIcon' />
            </button>
          </div>
        </div>

        <div className='ResetPasswordDiv'>
          <div className='resetPasswordText'>
            Confirm Password<span className='mandatoryField'>*</span>
          </div>
          <div className='passwordInputContainer'>
            <input
              className='resetNewPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm Password'
              onChange={handleConfirmPasswordChange}
              value={confirmPassword}
              disabled={
                !isLengthValid ||
                !hasNumericChar ||
                !hasUppercaseChar ||
                !hasLowerrcaseChar ||
                !hasSpecialChar
              }
            />
            <button className='eyeButton' onClick={toggleConfirmPasswordVisibility}>
              <img src={showConfirmPassword ? OpenEye : CloseEye} alt='' className='eyeIcon' />
            </button>
          </div>
        </div>
      </div>

      <div className='resetpasswordcontainer'>
        <div className='resetpasswordSubcontainer'>
          <div className='passwordConditionHeader'>Your password must contain</div>
          <div className='resetpasswordText'>
            <img className='validation' src={hasUppercaseChar ? Yes : No} alt='Uppercase' />
            Contain at least one uppercase letter.
          </div>
          <div className='resetpasswordText'>
            <img className='validation' src={hasLowerrcaseChar ? Yes : No} alt='Uppercase' />
            Contain at least one lowercase letter.
          </div>
          <div className='resetpasswordText'>
            <img className='validation' src={hasNumericChar ? Yes : No} alt='Numeric' />
            Contain at least one numeric character.
          </div>
          <div className='resetpasswordText'>
            <img className='validation' src={hasSpecialChar ? Yes : No} alt='Special' />
            Contain at least one special character (such as !, @, #, $, %, etc...).
          </div>

          <div className='resetpasswordText'>
            <img className='validation' src={isLengthValid ? Yes : No} alt='Length' />
            Minimum 8 characters length.
          </div>
        </div>
      </div>

      {errorMessage && <div className='errorMessage'>{errorMessage}</div>}

      <div className='resetButtonDiv'>
        <button onClick={handlePasswordReset} disabled={loading}>
          {loading ? <PulseLoader size={10} color={'#fff'} /> : 'Reset'}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
