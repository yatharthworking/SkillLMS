import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginDialog.css";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import { delay, BACKEND_BASEURL } from "../helper";
import OpenEye from "../../Assets/Images/openEye.svg";
import CloseEye from "../../Assets/Images/closeEye.svg";
import GoogleIcon from "../../Assets/Images/googleIcon.svg";
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const LoginDialog = ({ open, onClose}) => {
  const navigate = useNavigate();

  const { login, loginAdmin } = useAuth(); // Use the login function from AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const GOOGLE_LOGIN_URL = `${BACKEND_BASEURL}/auth/google/signing`;

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Student');

  const handleSelection = (section) => {
    setSelectedSection(section);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBackToLandingPage = () => {
    navigate("/");
  };

  const handleGoToForgetPassword = () => {
    navigate("/forgetPassword");
  };

  const handleGoToRegisterNow = () => {
    navigate("/registerStudent");
  };

  const handleLogin= async () => {
    if (username === "" || password === "") {
      toast.info("Please enter Email and Password to Login.", {
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
        username: username,
        password: password,
      };

      //const response = await loginUser({ variables: { username, password } });
      const response = await axios.post(`${BACKEND_BASEURL}/auth/login`,loginRequestBody);

      if (response?.status === 200) {
        const token = response.data.token;
        const decodedToken = jwtDecode(token);

        if (selectedSection === 'Student' && decodedToken.roles && decodedToken.roles.includes("STUDENT")) {
          localStorage.setItem("token", token);
          localStorage.setItem("UserLoginResponse",JSON.stringify(decodedToken));

          // Store role for role-based API calling
          localStorage.setItem("role", decodedToken.roles[0].toUpperCase());

          // Notify Navbar/Other components
          window.dispatchEvent(new Event('loginSuccess'));

          // Extract unique privileges from roles
          const allPrivileges = decodedToken.roles.reduce((acc, role) => {
            if (role.privileges && Array.isArray(role.privileges)) {
                return [...acc, ...role.privileges];
            }
            return acc;
        }, []);
        const uniquePrivileges = [...new Set(allPrivileges)];

          toast.success("Login Successful", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          login(token); // Call the login function from AuthContext
          await fetchStudentBranchId(username,token);
          await delay(2000); // Delay for 2 seconds for showing toaster

          // Resetting username and password here after successful login
          setUsername("");
          setPassword("");

          navigate("/userLandingPage");
        }
          else if (selectedSection === 'Admin/Teacher' && decodedToken.roles && (decodedToken.roles.includes("SUPER_ADMIN") || decodedToken.roles.includes("TEACHER") || decodedToken.roles.includes("ADMIN"))) {
            localStorage.setItem('token', token);
            localStorage.setItem('AdminLoginResponse', JSON.stringify(decodedToken));

            // Store role for role-based API calling
            localStorage.setItem('role', decodedToken.roles[0].toUpperCase());

            // Notify Navbar/Other components
            window.dispatchEvent(new Event('loginSuccess'));

            toast.success('Login Successful', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            loginAdmin(token); // Call the loginAdmin function from AuthContext

            await delay(2000);  // Delay for 2 seconds for showing toaster
            await fetchAdminBranchId(username,token);
            // Resetting username and password here after successful login
            setUsername("");
            setPassword("");

            navigate('/adminLandingPage');
        }
         else {
          toast.error("Login failed: You are not authorized for this login.", {
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
      console.error("Login failed", e);

      if (e.response?.status === 400) {
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
      } else if (e.response?.data.message === "Bad credentials") {
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
      } else {
        toast.error("Connection to Server Failed!!!!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = GOOGLE_LOGIN_URL;
  };
  if (!open) return null;


  async function fetchAdminBranchId(email,token) {
    try{
      const response = await axios.get(`${BACKEND_BASEURL}/admin/fetchUserDetails?email=${email}`,
      {
        headers: { Authorization: `Bearer ${token}`}
      }
      );
      if(response.status === 200){
        const data = response?.data;
        localStorage.setItem('adminDetails', JSON.stringify(data));

        // Extract unique privileges from roles
        const allPrivileges = data.roles.reduce((acc, role) => {
          if (role.privileges && Array.isArray(role.privileges)) {
              return [...acc, ...role.privileges];
          }
          return acc;
        }, []);

        const uniquePrivileges = [
          ...new Map(allPrivileges.map(item => [item.privilegesName, item])).values()
        ];

        localStorage.setItem('roleWithPrivileges', JSON.stringify(uniquePrivileges));

      }
    }catch(error){
      toast.error('Error while fetching branchId');
      console.error(error);
    }
  }

  async function fetchStudentBranchId(email,token) {
    try{
      const response = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails?email=${email}`,
      {
        headers: { Authorization: `Bearer ${token}`}
      }
      );

      if(response.status === 200){

        const data = response?.data;
        localStorage.setItem('studentDetails', JSON.stringify(data));

         // Extract unique privileges from roles
         const allPrivileges = data.roles.reduce((acc, role) => {
          if (role.privileges && Array.isArray(role.privileges)) {
              return [...acc, ...role.privileges];
          }
          return acc;
        }, []);

        const uniquePrivileges = [
          ...new Map(allPrivileges.map(item => [item.privilegesName, item])).values()
        ];

        localStorage.setItem('roleWithPrivileges', JSON.stringify(uniquePrivileges));

      }
    }catch(error){
      toast.error('Error while fetching branchId');
      console.error(error);
    }
  }

  return (
    <div>
      <ToastContainer/>
      <Dialog open={open} onClose={onClose}>
          <DialogTitle>
            <div className='loginHeader'>
                <div className="loginHeaderTxt">Login to Continue</div>
            </div>
          </DialogTitle> 

          <DialogContent>
            <div className='loginDialogContentBody'>

              {/* Toggle Section */}
              <div className='loginDialogToggleSection'>
                <div className={`toggleSectionBox ${selectedSection === 'Student' ? 'selected' : ''}`} onClick={() => handleSelection('Student')}>
                  Student
                </div>
                <div className={`toggleSectionBox ${selectedSection === 'Admin/Teacher' ? 'selected' : ''}`} onClick={() => handleSelection('Admin/Teacher')}>
                  Admin/Teacher
                </div>
              </div>
              
              {/* Form Section */}
              <div className='loginDialogFormSection'>

                <div className="loginFormSectionInputGroup">

                  <div className="loginDialogInputSectionBox">
                    <div className="loginDialogInputLabel">Email/Username<span className="loginMandatoryLabel">*</span></div>
                    <input className="loginDialogInputBox" placeholder="Enter Email/Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>

                  <div className="loginDialogInputSectionBox">
                    <div className="loginDialogInputLabel">Password<span className="loginMandatoryLabel">*</span></div>
                    <div className="passwordInputContainer">
                      <input
                        className="loginDialogInputBox"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />

                      <button className="eyeButtonDilog" onClick={togglePasswordVisibility}>
                        <img
                          src={showPassword ? OpenEye : CloseEye}
                          alt=""
                          className="eyeIconDialog"
                        />
                      </button>
                    </div>
                  </div>

                </div>

                <button className="loginDialogBtn" onClick={handleLogin} disabled={loading}>
                  {loading ? ( <CircularProgress size={20} style={{ color: 'white' }}  /> ) : ('Login')}
                </button>

                <div className="loginDialogForgotPsd" onClick={handleGoToForgetPassword}>Forgot Password?</div>

                {selectedSection === 'Student' &&(
                  <div className='loginDialogFormSection'>

                    <div className="loginDialogOrSection">
                      <span className="orSectionMidLineDialog"></span>
                      <span className="orSectionTxtDialog">or</span>
                      <span className="orSectionMidLineDialog"></span>
                    </div>
                    <div className="loginDialogGoogleBtn"  onClick={handleGoogleLogin} disabled={loading}>
                      <span> <img src={GoogleIcon} alt="" /></span>
                      <span className="googleLoginBtnTxtDialog"> Login with Google</span>
                    </div>
                    <div className="loginDialogRegisterSection">
                      <span className="registerNowPrimaryDialog">Not Registered Yet?</span>
                      <span className="registerNowSecondaryDialog" onClick={handleGoToRegisterNow}> Register Now </span>
                    </div>

                  </div>
                )}

              </div>  
            

            </div> 
          </DialogContent>
          {/* <DialogActions>
          </DialogActions> */}
      </Dialog>

    </div>
  );
};

export default LoginDialog;
