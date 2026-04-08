import { Routes, Route,Navigate } from 'react-router-dom';
//import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import './App.css';
import { ToastContainer} from 'react-toastify';
import '@fontsource/plus-jakarta-sans';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Components/Login/Login';
import LandingPage from './Components/Login/LandingPage';
import ForgetPassword from './Components/Login/ForgetPassword';
import ResetPassword from './Components/Login/ResetPassword';
import RegisterStudent from './Components/Login/RegisterStudent';
import UserLandingPage from './Components/User/UserHomePage/UserLandingPage';
import AdminLandingPage from './Components/Admin/AdminLandingPage/AdminLandingPage';
import CourseDetail from './Components/User/CourseDetailPage/CourseDetail';
import CoursePayment from './Components/User/CoursePaymentPage/CoursePayment';
import UserProfile from './Components/User/UserProfile/UserProfile';
import UserLogin from './Components/Login/UserLogin';
import { useAuth, AuthProvider } from './Components/AuthContext';
import AdminLogin from './Components/Login/AdminLogin';
import ExamPage from './Components/User/UserSidebarSections/ExamPage';
import ExamConfirmation from './Components/User/UserSidebarSections/ExamConfirmation';
import ProgressDetail from './Components/User/InprogressCourse/InprogressDetails';
import WebinarDetail from './Components/User/WebinarDetails/WebinarDetail';
import AdminProfile from './Components/Admin/AdminProfile/AdminProfile';
import CreateWebinar from './Components/Admin/AdminSidebarSection/WebinarAdmin/CreateWebinar';
import PreviewDetails from './Components/Admin/AdminSidebarSection/WebinarAdmin/PreviewDetails';
import ManageCourse from './Components/Admin/AdminSidebarSection/CourseAdmin/ManageCourse';
import UserNotification from './Components/User/Notification/UserNotification';
import ManageBatch from './Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch';
import LiveObjectiveTest from './Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/LiveObjectiveTest';
import NetworkStatusNotifier from './Components/NetworkStatus/NetworkStatusNotifier';
import PublicContact from './Components/PublicAccess/PublicContact';
import PublicCourse from './Components/PublicAccess/PublicCourse';
import PublicWebinar from './Components/PublicAccess/PublicWebinar';
import LiveQuestionGenerator from './Components/Admin/AdminSidebarSection/Masters/Batch/ManageBatch/LiveQuestionGenerator';



const App = () => {
  return (
    <AuthProvider>
      <div>
          {/* <NetworkStatusNotifier /> */}
          <Routes>

            <Route path="*" element={<Navigate to="/" />} />    {/* Catch-all route to handle undefined paths and redirect to the login page */}

            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/userlogin" element={<UserLogin/>} />
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/registerStudent" element={<RegisterStudent />} />

            {/* For demo commenting out protected route. Later on will change it ---Ruturaj Swain */}
            {/* <Route path="/userProfile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/userLandingPage" element={<ProtectedRoute><UserLandingPage /></ProtectedRoute>} />
            <Route path="/adminLandingPage" element={<ProtectedRoute><AdminLandingPage /></ProtectedRoute>} />
            <Route path="/courseDetail" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} /> */}

            <Route path="/userProfile" element={<UserProfile />}/>
            <Route path="/adminProfile" element={<AdminProfile/>}/>
            <Route path="/userLandingPage" element={<UserLandingPage />} />
            <Route path="/adminLandingPage" element={<AdminLandingPage />} />

            <Route path="/courseDetail" element={<CourseDetail />}/>
            <Route path='/coursePayment' element={<CoursePayment />}/>
            <Route path='/manageCourse' element={<ManageCourse/>}/>

            <Route path='/ExamPaper' element={<ExamPage/>}/>
            <Route path='/ExamConfirmation' element={<ExamConfirmation/>}/>

            <Route path="/progressDetail" element={<ProgressDetail />}/>

            <Route path="/webinarDetail" element={<WebinarDetail />}/>
            <Route path="/createWebinar" element={<CreateWebinar/>}/>
            <Route path="/previewDetails" element={<PreviewDetails/>}/>
            <Route path="/userNotification" element={<UserNotification/>}/>

            <Route path="/managebatch" element={<ManageBatch/>}/>
            {/* <Route path="/QuestionGenerator/LiveObjectiveTest" element={<LiveObjectiveTest/>}/> */}
            <Route path="/QuestionGenerator/LiveObjectiveTestNew" element={<LiveQuestionGenerator/>}/>

            {/*FOR PUBLIC ACCESS */}
            <Route path="/courses" element={<PublicCourse />}/>
            <Route path="/webinars" element={<PublicWebinar/>}/>
            <Route path="/contacts" element={<PublicContact/>}/>

          </Routes>

      </div>
      </AuthProvider>
  );
}

export default App;
