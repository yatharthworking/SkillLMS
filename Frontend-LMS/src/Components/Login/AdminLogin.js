import React, { useState } from 'react'
import './Login.css';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '../../Assets/Images/googleIcon.svg';
import LeftArrow from '../../Assets/Images/leftArrow.svg';
import OpenEye from '../../Assets/Images/openEye.svg';
import CloseEye from '../../Assets/Images/closeEye.svg';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import axios from 'axios';
import { useAuth } from '../AuthContext'; // Import the useAuth hook
import { delay,BACKEND_BASEURL } from '../helper';


export default function AdminLogin() {

    const navigate= useNavigate();

    const { loginAdmin } = useAuth(); // Use the loginAdmin function from AuthContext

    const [showPassword, setShowPassword] = useState(false);

    const [loading,setLoading] = useState(false);

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoToForgetPassword = () => {
        navigate('/forgetPassword');
    };

    const handleBackToLandingPage = () => {
        navigate('/');
    };

    const handleGoToAdminPage = async () => {
        
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

            const response = await axios.post(`${BACKEND_BASEURL}/auth/login`,loginRequestBody);

            if (response?.status === 200) {
                const token = response.data.token;
                const decodedToken = jwtDecode(token);

                if (decodedToken.roles && (decodedToken.roles.includes("TEACHER") || decodedToken.roles.includes("ADMIN"))) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('AdminLoginResponse', JSON.stringify(decodedToken));

                    // Store role for role-based API calling
                    localStorage.setItem('role', decodedToken.roles[0].toUpperCase());

                    toast.success('Login Successful', {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    await fetchAdminDetails(username, token);

                    loginAdmin(token); // Call the loginAdmin function from AuthContext

                    await delay(2000);  // Delay for 2 seconds for showing toaster

                    // Resetting username and password here after successful login
                    setUsername("");
                    setPassword("");

                    navigate('/adminLandingPage');
                } else {
                    toast.error('Login failed: Not authorized for Admin Login.', {
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

            
            if(e.response?.status === 500){

            // Handling the Bad Credentials here
             toast.error("Bad Credentials!!!!.", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            }else if (e.response?.data.message === "INVALID USERNAME OR PASSWORD"){

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
    
                }else{

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
        setLoading(false);
     }
     
    };

    const fetchAdminDetails = async (email, token) => {
        try {
            const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem('adminDetails', JSON.stringify(data));

                const allPrivileges = (data.roles || []).reduce((accumulator, roleEntry) => {
                    if (roleEntry.privileges && Array.isArray(roleEntry.privileges)) {
                        return [...accumulator, ...roleEntry.privileges];
                    }
                    return accumulator;
                }, []);

                const uniquePrivileges = [
                    ...new Map(allPrivileges.map((item) => [item.privilegesName, item])).values(),
                ];

                localStorage.setItem('roleWithPrivileges', JSON.stringify(uniquePrivileges));
            }
        } catch (error) {
            console.error('Error fetching admin details:', error);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleGoToAdminPage();
        }
    };

  return (
    <div className='adminLoginSection'>
    <ToastContainer/>
    {loading && (
            <Box className="login-top-loader">
                <LinearProgress sx={{ backgroundColor: 'red', '& .MuiLinearProgress-bar': { backgroundColor: 'white' } }} />
            </Box>
        )}

      <div className='loginContainer'>
            <div className='loginContainerHeaderTxt'>Admin/Teacher Login</div>
            <div className='loginContainerBox'>
                <div className='loginInputSection'>
                    <div className='loginInputSectionBox'>
                        <div className='inputHeaderText'>Email/Username</div>

                        <input className='inputBox' placeholder='Enter Email/ Username'
                        value={username} onChange={(e) => setUsername(e.target.value)}/>

                    </div>

                    <div className='loginInputSectionBox'>
                        <div className='inputHeaderText'>Password</div>
                        <div className='passwordInputContainer'>

                            <input className='inputBox'   
                                type={showPassword ? 'text' : 'password'} 
                                placeholder='Enter Password'
                                value={password} onChange={(e)=> setPassword(e.target.value)} onKeyPress={handleKeyPress}/>

                            <button className='eyeButton'onClick={togglePasswordVisibility}>
                                <img src={showPassword ? OpenEye : CloseEye}alt='' className='eyeIcon'/>
                            </button>
                        </div>
                    </div>
                </div>
                <button className='loginBtn' disabled={loading} onClick={handleGoToAdminPage}> Login </button>
                <div className='forgetPasswordBox' onClick={handleGoToForgetPassword}>Forgot password?</div>


            </div>
            <div className='backButtonSection'>
                <button className='backButton' onClick={handleBackToLandingPage}> <img src={LeftArrow} alt=''/></button>
            </div>
            
      </div>
    </div>
  )
}
