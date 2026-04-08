import React,{useState,useEffect} from 'react';
import '../CourseDetailPage/CourseDetail.css';
import Navbar from '../../Navbar/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import UserSidebar from '../UserSideBar/UserSidebar';
import LeftArrow from '../../../Assets/Images/leftArrow.svg';
import CourseBoxPicture from '../../../Assets/Images/courseBoxPicture.svg';
import EnrolledStudent from '../../../Assets/Images/enrolledStudent.svg';
import Chapter from '../../../Assets/Images/chapters.svg';
import Assignment from '../../../Assets/Images/assignments.svg';
import Downloadable from '../../../Assets/Images/downloadable.svg';
import HourClock from '../../../Assets/Images/hoursClock.svg';
import EarnCertificate from '../../../Assets/Images/earnCertificate.svg';
import { renderStars } from '../UserSidebarSections/UserStarRating'; 
import { BACKEND_BASEURL } from '../../helper';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CourseDetail() {
    const [selectedBox, setSelectedBox] = useState('course');
    const [selectedSubBox, setSelectedSubBox] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const course = location.state?.course;
    const [lessons, setLessons] = useState([]);
    const [otherCoursesByTutor,setOtherCoursesByTutor] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [studentBatchId, setStudentBatchId] = useState(null);

    useEffect(() => {
        console.log("materialPrice", course?.materialPrice);
    }, [course]);

    useEffect(() => {
      const userLoginResponse = localStorage.getItem('UserLoginResponse');
      const studentDetails = localStorage.getItem('studentDetails');

      if (userLoginResponse) {
        const parsedUser = JSON.parse(userLoginResponse);
        setUserEmail(parsedUser?.username || '');
        setStudentBatchId(parsedUser?.batchId ?? null);
      }

      if (studentDetails) {
        const parsedStudent = JSON.parse(studentDetails);
        setUserEmail((currentEmail) => currentEmail || parsedStudent?.email || '');
        setStudentBatchId((currentBatchId) => currentBatchId ?? parsedStudent?.batchId ?? null);
      }
    }, []);

  const handleGoTOUserCourses = () => {
    navigate('/userLandingPage', { state: { selectedBox: 'myCourses' } });
  };


  const handleGoToCourseDetailPage = (course) => {
    navigate("/courseDetail", { state: { course } });
  };
 
  const handleEnrollNow = async (course) => {
    if (!course?.materialId || !userEmail) {
      toast.error("Unable to enroll in this course right now.");
      return;
    }

    const enrollPayload = {
      username: userEmail,
      materialId: course.materialId,
      paymentStatus: "SUCCESS",
    };

    try {
      const token = localStorage.getItem("token");
      let response;

      try {
        response = await axios.post(
          `${BACKEND_BASEURL}/student/courses/enroll`,
          enrollPayload,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            params: {
              userName: userEmail,
              ...(studentBatchId != null ? { batchId: studentBatchId } : {}),
            },
          }
        );
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        response = await axios.post(
          `${BACKEND_BASEURL}/studyMaterial/purchaseMaterial`,
          enrollPayload,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      }

      if (response?.status === 200) {
        toast.success(response?.data?.message === "ALREADY_ENROLLED" ? "Course already enrolled." : "Course enrolled successfully.");
        navigate('/userLandingPage', { state: { selectedBox: 'myCourses' } });
      }
    } catch (error) {
      console.error("Error enrolling course:", error);
      toast.error(error?.response?.data?.message || "Failed to enroll in course");
    }
  };


  //Fetching other courses by tutor
  useEffect(() => {

    axios
      .get(
        `${BACKEND_BASEURL}/studyMaterial/fetchOtherMaterialsByTutor?tutorId=${course?.tutorId}&materialId=${course?.materialId}&username=${course?.userEmail}`)

      .then((response) => {

        if (response.data && response.status === 200) {

          setOtherCoursesByTutor(response.data.data);

        }
      })
      .catch((error) => {

        console.error("Error fetching data:", error);

      });

  }, [BACKEND_BASEURL]);

   // Function to split course brief into points
    const getCourseBriefPoints = (courseBrief) => {
        return courseBrief ? courseBrief.split('.').filter(point => point.trim() !== '') : [];
    };


  return (
    <div className='courseDetailPage'>
        <div><Navbar /></div>

        <div className='courseDetailPageContainer'>

        <div className='UserSidebarSection'>
                <UserSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox}/>
            </div>

            <div className='courseHomeSection'>

                <div className='courseHomeSectionContainer'>

                    <div className='courseDetailHeaderSection'>
                        <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
                        <div className='breadcrumSection'>
                            <span className='breadcrumNotSelectedTxt' onClick={handleGoTOUserCourses} style={{cursor:'pointer'}}>Courses </span>
                            <span className='breadcrumSeperator'>/</span>
                            <span className='breadcrumSelectedTxt'>Details</span>

                        </div>
                    </div> 

                    <div className='courseDetailContentSection'>
                        <div className='contentHeaderSection'>
                            <div className='contentHeaderBox'>
                                <div className='contentHeaderPicture'>
                                    <img src={CourseBoxPicture} alt='' />
                                </div>
                                <div className='contentHeaderDetails'>
                                    <div className='contentHeaderDetailsBox'>
                                        <div  className='contentHeaderDetailsBoxRow'> 
                                        <div className='headerCourseTitleTxt'>{course?.materialName}</div>
                                            <div className='headerCourseTeacherDetailRow'>
                                                <span>By {course?.tutorName || "Unknown Tutor"}</span>
                                                {/* <span>|</span>
                                                <span>{course?.tutorBio}</span> */}
                                                
                                            </div>
                                            <div className='userCourseBoxRatingSection'> 
                                                <span className='ratingNumberSection'>{course?.rating || "N/A"}</span>
                                                <span className='ratingstarSection'>{renderStars(course.rating || 0)}</span>
                                                <span className='ratingCountSection'>({course?.totalRatings})</span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='contentHeaderPriceSection'>
                                        <div className='userCourseBoxPriceSection'>
                                            <span className="discountedPriceSection">
                                                {course?.discountedPrice ? `₹ ${course.discountedPrice}` : "Free"}
                                            </span>
                                            {course?.discountPercentage > 0 &&
                                                    <span className="actualPriceSection">
                                                        {course?.materialPrice ? `₹ ${course.materialPrice}` : ""}
                                                    </span>
                                            }                                        
                                        </div>
                                        <button className='userDetailEnrollBtn' onClick={() => handleEnrollNow(course)}>Enroll</button>
                                    </div>
                                </div>
                            </div>
                            {/* Course Details - enrolled, chapters... */}
                            <div className='contentComponentDetailSection'>

                                <div className='componentDetailBox'>
                                    <div><img src={EnrolledStudent} alt='' /></div>
                                    <div className='componentDetailBoxTextSection'>
                                        <div className='componentDetailBoxNumberTxt'>{course?.materialDescription?.numberOfEnrolledStudents || "-"}</div>
                                        <div className='componentDetailBoxContentTxt'>Enrolled Students</div>
                                    </div>
                                </div>

                                <div className='horizontal-line'></div>

                                <div className='componentDetailBox'>
                                    <div><img src={Chapter} alt='' /></div>
                                    <div className='componentDetailBoxTextSection'>
                                        <div className='componentDetailBoxNumberTxt'>{course?.materialDescription?.numberOfChapters}</div>
                                        <div className='componentDetailBoxContentTxt'>Chapters</div>
                                    </div>
                                </div>

                                <div className='horizontal-line'></div>

                                <div className='componentDetailBox'>
                                    <div><img src={Assignment} alt='' /></div>
                                    <div className='componentDetailBoxTextSection'>
                                        <div className='componentDetailBoxNumberTxt'>{course?.materialDescription?.numberOfAssignments}</div>
                                        <div className='componentDetailBoxContentTxt'>Assignments</div>
                                    </div>
                                </div>

                                <div className='horizontal-line'></div>

                                <div className='componentDetailBox'>
                                    <div><img src={Downloadable} alt='' /></div>
                                    <div className='componentDetailBoxTextSection'>
                                        <div className='componentDetailBoxNumberTxt'>{course?.materialDescription?.downloadableResources}</div>
                                        <div className='componentDetailBoxContentTxt'>Downloadable Resources</div>
                                    </div>
                                </div>

                                <div className='horizontal-line'></div>

                                <div className='componentDetailBox'>
                                    <div><img src={HourClock} alt='' /></div>
                                    <div className='componentDetailBoxTextSection'>
                                        <div className='componentDetailBoxNumberTxt'>{course?.materialDescription?.materialDuration} hours</div>
                                        <div className='componentDetailBoxContentTxt'>Course Duration (approx)</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        {/* Course Brief Section */}
                        <div className='courseBriefSection'>
                            <div className='courseBriefContainer'>
                                <div className='SectionsHeaderBox'>
                                    <div className='SectionsHeaderBoxLeftLine'> </div>
                                    <div className='SectionsHeaderBoxTxt'>Course Brief</div>  
                                </div>
                                <div className='SectionContentTxt'>
                               { <ul>
                                            {getCourseBriefPoints(course?.materialDescription?.materialBrief).map((point, index) => (
                                                <li key={index}>{point.trim()}</li>
                                            ))}
                                        </ul>}

                                        { /*<p>{course?.courseDesc?.courseBrief}</p>*/}

                               </div>

                            </div>
                            <div className='earnCertificateContainer'>
                                <img src={EarnCertificate} alt=''/>
                            </div>
                        </div>

                        {/* Chapters Section */}
                        <div className='chaptersSection'>
                            <div className='SectionsHeaderBox'>
                                <div className='SectionsHeaderBoxLeftLine'> </div>
                                <div className='SectionsHeaderBoxTxt'>Chapters</div>  
                            </div>


                        {course?.chaptersDBList?.map((lesson,index) =>(
                            <div key={lesson.chapterId} className='chapterNameSection'>
                                        <span className='chapterNameTxt'>{index + 1}.</span>
                                        <span className='chapterNameTxt'>{lesson?.chapterName}</span>
                                    </div>
                        ))}

                        </div>

                        {/* other courses */}
                        <div className='otherCoursesSection'> 

                            <div className='SectionsHeaderBox'>
                                <div className='SectionsHeaderBoxLeftLine'> </div>
                                <div className='SectionsHeaderBoxTxt'>Other Courses Offered by Same Teacher Name</div>  
                            </div>

                            {/* Course Area wrap start here */}
                            <div className="userCourseArea">
             
                                {otherCoursesByTutor.map(course => (
                                <div key={course.materialId} className="userCourseBox">
                                    <div className="userCourseBoxPicture">
                                    <img src={CourseBoxPicture} alt="" />
                                    </div>

                                    <div className="userCourseBoxTxtSection">
                                    <div className="userCourseBoxTxtContainer">
                                        <div className="userCourseBoxHeader">{course?.courseName}</div>
                                        <div className="userCourseBoxSubHeader">
                                        By {course?.tutorName || "Unknown Tutor"}
                                        </div>
                                    </div>

                                    <div className="userCourseBoxTxtContainer">
                                        <div className="userCourseBoxRatingSection">
                                        <span className="ratingNumberSection">{course?.rating || "N/A"}</span>
                                        <span className="ratingstarSection">
                                            {renderStars(course.rating || 0)}
                                        </span>
                                        <span className="ratingCountSection">({course?.totalRatings})</span>
                                        </div>

                                        <div className="userCourseBoxPriceSection">
                                        <span className="discountedPriceSection">
                                            {course?.discountedPrice ? `₹ ${course.discountedPrice}` : "Free"}
                                        </span>
                                        <span className="actualPriceSection">
                                            {course?.materialPrice ? `₹ ${course.materialPrice}` : ""}
                                        </span>
                                        </div>
                                    </div>
                                    </div>

                                    <div className="userCourseBoxBtnSection">
                                    <button
                                        className="viewDetailBtn"
                                        onClick={() => handleGoToCourseDetailPage(course)}
                                    >
                                        View Details
                                    </button>
                                    <button className="enrollBtn" onClick={() => handleEnrollNow(course)}>
                                        Enroll
                                    </button>

                                    </div>
                                </div>
                                ))}
                                </div>
                            {/* Course Area wrap end here */}
                        </div>

                        {/* other courses end here */}

                    </div> 

                </div>
                
            </div>

        </div>
    </div>
  )
}
