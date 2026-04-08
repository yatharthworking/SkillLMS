import React, { useState, useEffect } from "react";
import "./ManageCourse.css";
import axios from "axios";
import Navbar from "../../../Navbar/Navbar";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../../AdminSidebar/AdminSidebar";
import { useNavigate } from "react-router-dom";
import LeftArrow from "../../../../Assets/Images/leftArrow.svg";
import UploadImg from "../../../../Assets/Images/WebinarUploadImg.svg";
import CurriculumTab from "./CurriculumTab";
import { BeatLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import {
  BACKEND_BASEURL,
  // ADMIN_ENDPOINT,
  // TEACHER_ENDPOINT,
} from "../../../helper.js";

const normalizeCourseData = (payload) => {
  const data = payload?.value || payload || {};

  return {
    ...data,
    tutorName:
      data?.tutorName ||
      data?.assignedTeacher ||
      data?.userInfoDB?.fullName ||
      "Not assigned",
  };
};

const ManageCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("curriculum");
  const materialId = location?.state?.materialId;
  const [courseData,setCourseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [courseDescription, setCourseDescription] = useState("");
  const [disablePublishButton, setDisablePublishButton] = useState(false);


  const token = localStorage.getItem("token");

  // Set Bearer Token globally
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  // const endpoint =
  //   role === "ADMIN"
  //     ? ADMIN_ENDPOINT
  //     : role === "TEACHER"
  //     ? TEACHER_ENDPOINT
  //     : "";

  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  async function fetchCourseData() {
    setLoading (true)
    try{
      const response = await axios.get(`${BACKEND_BASEURL}/admin/getCourseMaterialById?materialId=${materialId}`);

      if(response.status === 200){

        const data = normalizeCourseData(response?.data?.data);
        setCourseData(data);

        //disabling publish button if material is already published to student
        setDisablePublishButton(data?.isPublished);
        setCourseDescription(data?.materialDescription?.materialBrief || "");
      }

    }catch(error){
      toast.error('error while fetching courseData');
      console.error(error);
    }finally{
      setLoading (false);
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, []);

  const [selectedBox, setSelectedBox] = useState(() => {
    return location.state && location.state.selectedBox
      ? location.state.selectedBox
      : "course";
  });

  const [selectedSubBox, setSelectedSubBox] = useState(() => {
    return location.state && location.state.selectedSubBox
      ? location.state.selectedSubBox
      : "";
  });

  const handleGoTOAdmin = () => {
    navigate("/adminLandingPage", { state: { selectedBox: "course" } });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };


  const handlePublishCourse = async() =>{
    if (!courseData?.chaptersDBList?.length || !courseData?.materialDescription?.materialBrief?.trim()) {
      toast.error("Add Chapter and Course Brief to Publish!!!");
      return;
    }

    try{
      const response = await axios.patch(`${BACKEND_BASEURL}/admin/publishCourseToStudents?materialId=${materialId}`);

      if(response.status === 200){
        toast.success(response.data.message);
        setDisablePublishButton(true);
      }
      
    }catch(error){
      toast.error(error?.response?.data?.message || "error while publishing course");
      console.error(error); 
    }

  }

  const handleClearClick = () => {
    setCourseDescription("");
  };

  const handleUpdateCourseBrief = async () => {
    setLoading(true);

    const tutorId = courseData?.userInfoDB?.userDetailsId || courseData?.assignedTeacherId;

    if (!tutorId) {
      toast.error("Assigned teacher is missing for this course.");
      setLoading(false);
      return;
    }

    const updateCourseBriefRequestBody = {
      materialId:materialId,
      userInfoDB:{
        userDetailsId:tutorId,
      },
      materialDescription:{
        materialBrief:courseDescription
      }
    };

    try{

      const response = await axios.post(`${BACKEND_BASEURL}/admin/addOrEditMaterialInLibrary`, updateCourseBriefRequestBody);

      if(response.status === 200){
        toast.success(response.data.message);

        //after successfull saving of material refreshing page.
        fetchCourseData();
      }

    }catch(error){
      toast.error(error?.response?.data?.message || "error while updating course brief");
      console.log(error);
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="manageDetailPage">
      <div>
        <Navbar />
      </div>
      <div className="adminLandingPageContainer">
        <div className="adminSidebarSection">
          <AdminSidebar
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
            selectedSubBox={selectedSubBox}
            setSelectedSubBox={setSelectedSubBox}
          />
        </div>

        <div className="courseHomeSection">
          <ToastContainer />

          <div className="courseHomeSectionContainer">
            <div className="courseDetailHeaderSection">
              <button className="backButton" onClick={handleGoTOAdmin}>
                <img src={LeftArrow} alt="" />
              </button>
              <div className="breadcrumSection">
                <span
                  className="breadcrumNotSelectedTxt"
                  onClick={handleGoTOAdmin}
                  style={{ cursor: "pointer" }}
                >
                  Courses
                </span>
                <span className="breadcrumSeperator">/</span>
                <span className="breadcrumSelectedTxt">Manage Course</span>
              </div>
            </div>
            <div className="userHeaderHorizontalLine"></div>

            {loading ? (
              <div className="loadingContainer">
               <BeatLoader color={"#219EBC"} loading={loading} size={15} />
              </div>
            ) : (
            <div className="manageDetailContentSection">
              <div className="manageDetailsDiv">
                <div className="uploadImageDiv">
                  <img
                    src={courseData?.materialImageDB ? `data:image/png;base64,${courseData?.materialImageDB}` : UploadImg} 
                    alt="upload"
                    className="uploadImage"
                    // onClick={handleUploadClick}
                  />
                  {/* <img
                    src={UploadEdit}
                    alt="edit"
                    className="editImage"
                    onClick={handleUploadClick}
                  /> */}
                  {/* <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  /> */}
                </div>
                <div className="manageHeaderDetail">
                  <div className="manageHeaderDetailTitle">
                   {courseData?.materialName}
                    <span className="EditButton">
                      {/* <img src={EditButton} alt="" /> */}
                    </span>
                  </div>
                  <div className="manageDetails">
                    <div className="manageDesc">
                      <div className="manageDetailsTitle">Course Code:</div>
                      <div className="manageDetailsValue">{courseData?.materialCode}</div>
                    </div>
                    <div className="manageDesc">
                      <div className="manageDetailsTitle">Created By:</div>
                      <div className="manageDetailsValue">
                      {courseData?.tutorName}
                      </div>
                    </div>
                    <div className="manageDesc">
                      <div className="manageDetailsTitle">Price:</div>
                      <div className="manageDetailsValue">&#8377;{courseData?.materialPrice}</div>
                    </div>
                    <div className="manageDesc">
                      <div className="manageDetailsTitle">Course Type:</div>
                      <div className="manageDetailsValue">
                       {courseData?.isCertificationRequired ? 'Skill Enhancement Program' : 'Classroom Program'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="publishBtnContainer" onClick={handlePublishCourse}>
                  <button className="publishBtn" disabled={disablePublishButton}>
                    <div style={{ fontSize: "14px" }}>Publish</div>
                    <div>to students</div>
                  </button>
                </div>
              </div>

              <div className="tabContainer">
                <div className="tabs">
                  <div
                    className={`tabButton ${
                      activeTab === "curriculum" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("curriculum")}
                  >
                    Curriculum
                  </div>
                  <div
                    className={`tabButton ${
                      activeTab === "courseBrief" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("courseBrief")}
                  >
                    Course Brief
                  </div>
                </div>
                {activeTab === "curriculum" && (
                  <div className="tabContent">
                    <CurriculumTab materialId={materialId}/>
                  </div>
                )}
                {activeTab === "courseBrief" && (
                  <div className="tabContent">

                  <div className="courseDetailsField" style={{marginTop:'10px'}}>
                    <div className="inputHeaderText">
                      Course Description<span className="mandatoryField">*</span>
                    </div>
                    <div>
                    <textarea
                      className="courseInputBox"
                      style={{ width: "98%",height:'150px' }}
                      placeholder="Enter Course Description in brief"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}        
                    />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="cancel-button" onClick={handleClearClick}>
                      Clear
                    </button>
                    <button className="create-button" disabled={loading} onClick={handleUpdateCourseBrief}>
                     Save
                    </button>
                  </div>

                  </div>
                )}
              </div>
            </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourse;
