import React, { useState } from 'react'
import './Login.css';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../../Assets/Images/googleIcon.svg';
import LeftArrow from '../../Assets/Images/leftArrow.svg';
import OpenEye from '../../Assets/Images/openEye.svg';
import CloseEye from '../../Assets/Images/closeEye.svg';
// import { useMutation } from '@apollo/client';
// import { LOGIN_USER } from '../../GraphQL/Mutations/LoginMutations';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Import the useAuth hook
import { delay,BACKEND_BASEURL } from '../helper';

export default function UserLogin() {

    const GOOGLE_LOGIN_URL = `${BACKEND_BASEURL}/auth/google/signing`;

    const navigate= useNavigate();

    const { login } = useAuth(); // Use the login function from AuthContext

    const [showPassword, setShowPassword] = useState(false);

    const [loading,setLoading] = useState(false);

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");

        // Creating a function `loginAdminUser` to be used for passing `username` and `password` to the mutation query.
        // The `useMutation` hook from Apollo Client is used to handle the mutation.
        // `LOGIN_USER` is the mutation query defined elsewhere.
        // `loginAdminUser` is a function that triggers the mutation when called.
        // `{ loading, error }` are destructured from the mutation's result object and provide the current state of the mutation:
        //   - `loading` is a boolean indicating whether the mutation is currently in progress.
        //   - `error` contains any error that occurred during the mutation.
        //const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleBackToLandingPage = () => {
        navigate('/');
    };

    const handleGoToForgetPassword = () => {
        navigate('/forgetPassword');
    };

    const handleGoToRegisterNow = () => {
        navigate('/registerStudent');
    };

    const handleGoToUserLandingPage = async () => {
    
        if(username === '' || password === "") {
            toast.info('Please enter Email and Password to Login.', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return; 
        }
        setLoading(true);

        try {

            const loginRequestBody = {
                username:username,
                password:password
            };

            //const response = await loginUser({ variables: { username, password } });
            const response = await axios.post(`${BACKEND_BASEURL}/auth/login`,loginRequestBody);

            if (response?.status === 200) {
                const token = response.data.token;
                const decodedToken = jwtDecode(token);

                if (decodedToken.roles && decodedToken.roles.includes("STUDENT")) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('UserLoginResponse', JSON.stringify(decodedToken));

                    // Store role for role-based API calling
                    localStorage.setItem('role', decodedToken.roles[0].toUpperCase());

                    toast.success('Login Successful', {
                        position: "top-right",
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    login(token); // Call the login function from AuthContext

                    await delay(2000);  // Delay for 2 seconds for showing toaster

                    // Resetting username and password here after successful login
                    setUsername("");
                    setPassword("");

                    navigate('/userLandingPage');
                } else {
                    toast.error('Login failed: Not authorized for Student Login.', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            }
        } catch (e) {

            console.error('Login failed',e);

            if(e.response?.status === 400){

             // Handling the Bad Credentials here
             toast.error("Bad Credentials!!!!", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            }else if (e.response?.data.message === "Bad credentials"){

            // Handling the Bad Credentials here
             toast.error("Bad Credentials!!!!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });

            }
            else{

                toast.error('Connection to Server Failed!!!!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
         }
     }finally{
        setLoading(false)
     }
       
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleGoToUserLandingPage();
        }
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        window.location.href = GOOGLE_LOGIN_URL;
      };

  return (
    <div className='adminLoginSection'>
        <ToastContainer/>
      <div className='loginContainer'>
            <div className='loginContainerHeaderTxt'>Student Login</div>
            <div className='loginContainerBox'>
                <div className='loginInputSection'>
                    <div className='loginInputSectionBox'>
                        <div className='inputHeaderText'>Email</div>
                        <input className='inputBox' placeholder='Enter Email' 
                        value={username} onChange={(e)=> setUsername(e.target.value)}/>

                    </div>

                    <div className='loginInputSectionBox'>
                        <div className='inputHeaderText'>Password</div>
                        <div className='passwordInputContainer'>
                            <input className='inputBox'   
                                type={showPassword ? 'text' : 'password'} 
                                placeholder='Enter Password'
                            value={password} onChange={(e)=> setPassword(e.target.value)} onKeyDown={handleKeyPress}/>

                            <button className='eyeButton'onClick={togglePasswordVisibility}>
                                <img src={showPassword ? OpenEye : CloseEye}alt='' className='eyeIcon'/>
                            </button>
                        </div>
                    </div>
                </div>
                <button className='loginBtn' disabled={loading} onClick={handleGoToUserLandingPage}> Login </button>
                <div className='forgetPasswordBox' onClick={handleGoToForgetPassword}>Forgot password?</div>
                <div className='orSection'>
                    <span className='orSectionMidLine'></span>
                    <span className='orSectionTxt'>or</span>
                    <span className='orSectionMidLine'></span>
                </div>

                <button className='googleLoginBtn' onClick={handleGoogleLogin} disabled={loading}>
                    <span><img src={GoogleIcon} alt=''/></span>
                    <span className='googleLoginBtnTxt'> Login with Google</span>
                </button>

                <div className='registerNowSection'>
                    <span className='registerNowPrimary'>Not Registered Yet?</span>
                    <span className='registerNowSecondary' onClick={handleGoToRegisterNow}>Register Now</span>
                </div>

            </div>

            <div className='backButtonSection'>
                <button className='backButton' onClick={handleBackToLandingPage}> <img src={LeftArrow} alt=''/></button>
            </div>
      </div>
    </div>
  )
}
