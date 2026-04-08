import React, { useRef, useState, useEffect } from "react";
import "./NewCourse.css";
import axios from "axios";
import Classroom from "../../../../Assets/Images/classroom.svg";
import Skill from "../../../../Assets/Images/skill.svg";
import UploadImg from "../../../../Assets/Images/WebinarUploadImg.svg";
import trashIcon from "../../../../Assets/Images/trashIcon.svg";
import {
  BACKEND_BASEURL,
  // ADMIN_ENDPOINT,
  // TEACHER_ENDPOINT,
  delay,
} from "../../../helper.js";
import { ToastContainer, toast } from "react-toastify";

const extractTeachers = (payload) => {
  // Handle different response formats
  let dataArray = payload;
  
  // If payload is an object with a 'teachers' property
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.teachers) {
    dataArray = payload.teachers;
  }
  
  // If payload is an object with a 'data' property
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.data) {
    dataArray = payload.data;
  }
  
  if (!Array.isArray(dataArray)) {
    console.warn('Invalid teacher data format received:', payload);
    return [];
  }

  const uniqueTeachers = new Map();

  dataArray.forEach((roleEntry) => {
    const users = Array.isArray(roleEntry?.userInfo) ? roleEntry.userInfo : [];

    users.forEach((user) => {
      const teacherId = user?.userDetailsId;
      if (!teacherId || uniqueTeachers.has(teacherId)) {
        return;
      }

      uniqueTeachers.set(teacherId, {
        teacherId,
        teacherName: user?.fullName || user?.email || `Teacher ${teacherId}`,
      });
    });
  });

  const teachers = Array.from(uniqueTeachers.values());
  console.log('Extracted teachers:', teachers);
  return teachers;
};

const extractCourseTeacherId = (course) =>
  course?.userInfoDB?.userDetailsId || course?.assignedTeacherId || course?.tutorId || "";

const extractCourseTeacherName = (course) =>
  course?.userInfoDB?.fullName || course?.assignedTeacher || course?.tutorName || "";

const NewCourse = ({ isOpen, onClose, onCourseCreated, course, isEdit }) => {
  const fileInputRef = useRef(null);
  const [materialId, setMaterialId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [courseType, setCourseType] = useState("classroom");
  const [price, setPrice] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [tutorMasterList, setTutorMasterList] = useState([]);
  const [passingPercentage, setPassingPercentage] = useState("");
  const [loading,setLoading] = useState(false);
  // const endpoint =
  //   role === "ADMIN"
  //     ? ADMIN_ENDPOINT
  //     : role === "TEACHER"
  //     ? TEACHER_ENDPOINT
  //     : "";

  // Populate the form fields with course data when in edit mode
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEdit && course) {
      setCourseType(
        course?.isCertificationRequired ? "skill-enhancement" : "classroom"
      );
      setMaterialId(course?.materialId || "");
      setPrice(course?.materialPrice ?? "");
      setCourseName(course?.materialName || "");
      setCourseCode(course?.materialCode || "");
      setCreatedById(extractCourseTeacherId(course));
      setPassingPercentage(course?.passingPercentage ?? "");

      const imageData = course?.materialImageDB
        ? `data:image/png;base64,${course?.materialImageDB}`
        : null;

      setSelectedImage(imageData);
      setImageSrc(imageData);
    } else {
      resetFields();
    }
  }, [isEdit, course, isOpen]);

  // Fetching tutorMaster only when the dialog is open
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${BACKEND_BASEURL}/admin/getTutorMaster`)
        .then((response) => {
          console.log('getTutorMaster API response received:', response);
          const teachers = extractTeachers(response.data);
          console.log('Teachers extracted from response:', teachers);
          setTutorMasterList(teachers);
          if (teachers.length === 0) {
            console.warn('No teachers found in the response. Response data:', response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching teachers:", error);
          console.error("Error details:", error.response?.data || error.message);
          setTutorMasterList([]);
          toast.error("Failed to load teachers list");
        });
    }
  }, [isOpen]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1]; // Extract the base64 string
        setImageSrc(e.target.result); // Set preview image for display
        setSelectedImage(base64String); // Set base64 string for upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseNameChange = (event) => {
    setCourseName(event.target.value);
  };

  const handleCourseCodeChange = (event) => {
    setCourseCode(event.target.value);
  };

  const handleCreatedByChange = (event) => {
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];
    setCreatedById(selectedOption.value);
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
  };

  const handlePassingPercentageChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value <= 100) {
      setPassingPercentage(value);
    }
  };

  const resetFields = () => {
    setMaterialId("");
    setCourseName("");
    setCourseCode("");
    setCreatedById("");
    setPrice("");
    setCourseType("classroom");
    setImageSrc(null);
    setSelectedImage(null);
    setPassingPercentage("");
  };

  const handleCreate = async () => {
    setLoading(true)
    // Validate mandatory fields
    if (
      !courseName ||
      !courseCode ||
      !createdById ||
      !price ||
      !passingPercentage
    ) {
      toast.error("Please fill all the mandatory fields.");
      setLoading(false);
      return;
    }

    let materialImageToSend = selectedImage;
    if (
      isEdit &&
      materialImageToSend &&
      materialImageToSend.startsWith("data:image/png;base64,")
    ) {
      materialImageToSend = materialImageToSend.replace(
        "data:image/png;base64,",
        ""
      );
    }

    const createCourseRequestBody = {
      materialName: courseName,
      materialCode: courseCode,
      userInfoDB: {
        userDetailsId: Number(createdById),
      },
      materialImage: materialImageToSend,
      materialPrice: Number(price),
      isCertificationRequired:
        courseType === "skill-enhancement" ? true : false,
      isPublished:
        courseType === "skill-enhancement" ? true : undefined,
      passingPercentage: Number(passingPercentage),
    };

    if (isEdit) {
      createCourseRequestBody.materialId = materialId; // Add materialId for editing
    }

    try {
      const response = await axios.post(
        `${BACKEND_BASEURL}/admin/addOrEditMaterialInLibrary`,
        createCourseRequestBody
      );

      if (response.status === 200) {
        if (isEdit) {
          toast.success("Course Edited successfully");
        } else {
          toast.success("Course Added successfully");
        }

        await delay(1000);
        resetFields();
        onClose();
        onCourseCreated(); //callback function to refresh courses table on successfull creation of course
      }
    } catch (error) {
      if (isEdit) {
        toast.error("error while editing course");
      } else {
        toast.error("error while creating course");
      }

      console.log(error);
    }finally{
      setLoading(false)
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <ToastContainer />
      <div className="modal-content">
        <div className="modal-title">
          <div>{isEdit ? "Edit Course" : "Create Course"}</div>
          <button className="close-button" onClick={onClose}>
            &#x2716;
          </button>
        </div>
        <div className="userHeaderHorizontalLine"></div>
        <div className="modal-form">
          <div className="uploadImageDiv">
            <img
              src={imageSrc || UploadImg}
              alt="upload"
              className="uploadImage"
              style={{ height: "auto" }}
              onClick={handleUploadClick}
            />
            {imageSrc && (
              <img
                src={trashIcon}
                alt="deleteIcon"
                className="deleteImage"
                onClick={() => {
                  setSelectedImage(null);
                  setImageSrc(null);
                }}
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="rightContentCourse">
            <div className="courseName">
              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Course Name<span className="mandatoryField">*</span>
                </div>
                <input
                  className="courseInputBox"
                  style={{ width: "300px" }}
                  placeholder="Course Name"
                  value={courseName}
                  onChange={handleCourseNameChange}
                />
              </div>
              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Course Code<span className="mandatoryField">*</span>
                </div>
                <input
                  className="courseInputBox"
                  style={{ width: "250px" }}
                  placeholder="Course Code"
                  value={courseCode}
                  onChange={handleCourseCodeChange}
                />
              </div>
            </div>

            <div className="createdBy">
              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Teacher<span className="mandatoryField">*</span>
                </div>
                <select
                  className="courseInputBox"
                  style={{ width: "160px" }}
                  value={createdById}
                  onChange={handleCreatedByChange}
                >
                  <option value="">Select</option>
                  {tutorMasterList.map((teacher) => (
                    <option key={teacher.teacherId} value={teacher.teacherId}>
                      {teacher.teacherName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Price<span className="mandatoryField">*</span>
                </div>
                <div className="priceField">
                  <input
                    className="courseInputBox"
                    style={{ width: "50px", borderRadius: "6px 0px 0px 6px" }}
                    type="text"
                    placeholder="0.00"
                    value={price}
                    onChange={handlePriceChange}
                  />
                  <select
                    className="courseInputBox"
                    style={{ borderRadius: "0px 6px 6px 0px" }}
                  >
                    <option>INR</option>
                    <option>USD</option>
                    {/* Add more currency options if needed */}
                  </select>
                </div>
              </div>

              <div className="courseDetailsField">
                <div className="inputHeaderText">
                  Passing Percentage(%)<span className="mandatoryField">*</span>
                </div>
                <div className="priceField">
                  <input
                    className="courseInputBox"
                    style={{ width: "250px" }}
                    type="text"
                    placeholder="0.0"
                    value={passingPercentage}
                    onChange={handlePassingPercentageChange}
                  />
                </div>
              </div>

              {/*  commenting out the status as of now in couse creation status is active by default*/}
              {/* <div className="courseDetailsField" style={{ flexDirection: 'row', alignItems: 'center' }}>
								<div className="inputHeaderText">Status:</div>
								<label className="switch">
									<input type="checkbox" checked={status} onChange={() => setStatus(!status)} />
									<span className="slider round"></span>
								</label>
							</div> */}
            </div>

            <div
              className="courseDetailsField"
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <div className="inputHeaderText">Course Type:</div>
              <div className="course-type-options">
                <div
                  className={`courseTypeLabel ${
                    courseType === "classroom" ? "selectedCourseType" : ""
                  }`}
                  style={{ padding: "10px" }}
                  onClick={() => setCourseType("classroom")}
                >
                  <img src={Classroom} alt="Classroom Program" />
                  <div className="courseTypeDetails">
                    <div className="courseTypeText">Classroom Program</div>
                    <div className="courseTypeDesc">
                      Live study program to attend live classes and tests
                    </div>
                  </div>
                </div>
                <div
                  className={`courseTypeLabel ${
                    courseType === "skill-enhancement"
                      ? "selectedCourseType"
                      : ""
                  }`}
                  style={{ padding: "10px" }}
                  onClick={() => setCourseType("skill-enhancement")}
                >
                  <img src={Skill} alt="Skill Enhancement Program" />
                  <div className="courseTypeDetails">
                    <div className="courseTypeText">
                      Skill Enhancement Program
                    </div>
                    <div className="courseTypeDesc">
                      Self-study program for skill enhancement & certification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="userHeaderHorizontalLine"></div>
        <div className="form-actions">
          <button className="cancel-button" onClick={resetFields}>
            Clear
          </button>
          <button className="create-button" onClick={handleCreate} disabled={loading}>
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCourse;
