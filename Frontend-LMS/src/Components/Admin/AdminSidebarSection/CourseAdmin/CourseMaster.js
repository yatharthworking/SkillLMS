import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CourseMaster.css";
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import ActionMenu from "../../../../Assets/Images/Edit.svg";
import CourseEdit from "../../../../Assets/Images/courseEdit.svg";
import Manage from "../../../../Assets/Images/manage.svg";
import Delete from "../../../../Assets/Images/courseTrash.svg";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import NewCourse from "./NewCourse.js";
import { BeatLoader } from "react-spinners";
import {
  BACKEND_BASEURL,
  // ADMIN_ENDPOINT,
  // TEACHER_ENDPOINT,
} from "../../../helper.js";
import certificationCourseImg from "../../../../Assets/Images/certificationCourseImg.svg";
import liveLearningCourseImg from "../../../../Assets/Images/liveLearningCourseImg.svg";
import ActivityIcon from "../../../../Assets/Images/history.svg";
import { ToastContainer, toast } from "react-toastify";

const normalizeCourse = (course) => ({
  ...course,
  tutorId:
    course?.userInfoDB?.userDetailsId || course?.assignedTeacherId || course?.tutorId || null,
  tutorName:
    course?.userInfoDB?.fullName || course?.assignedTeacher || course?.tutorName || "Not assigned",
  materialPrice: Number(course?.materialPrice || 0),
  creationDate: course?.creationTimeStamp
    ? new Date(course.creationTimeStamp).toLocaleDateString()
    : "-",
  lastModified: course?.updationTimeStamp
    ? new Date(course.updationTimeStamp).toLocaleDateString()
    : "-",
});

export default function CourseMaster() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [materialId, setMaterialId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseMasterList, setCourseMasterList] = useState([]);
  const [courseToEdit, setCourseToEdit] = useState(null); // State to hold the course to be edited

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenEditCourse = () => {
    setIsEditCourseOpen(true);
  };

  const handleCloseEditCourse = () => {
    setIsEditCourseOpen(false);
  };

  const handleManageCourse = () => {
    navigate("/manageCourse", {state: {materialId:materialId}});
  };

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

  //fetching course master
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_BASEURL}/admin/fetchAllCourses?page=${
          page - 1
        }&size=${rowsPerPage}`
      );
      const data = Array.isArray(response?.data?.data)
        ? response.data.data.map(normalizeCourse)
        : [];
      setCourseMasterList(data);
      setTotalPages(response?.data?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseMasterList([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage]);

  // Function to handle course creation(callback function to call fetchCourses upon successfull course creation)
  const handleCourseCreated = () => {
    fetchCourses();
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const filteredCourseData = courseMasterList.filter((course) => {
    return (
      course.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = (event, materialId,course) => {
    setCourseToEdit(course);
    setMenuAnchor(event.currentTarget);
    setMaterialId(materialId);
  };

  const renderPaginationItems = (item) => {
    if (filteredCourseData.length <= 5) {
      return true;
    }

    if (
      item.page === 1 ||
      item.page === filteredCourseData.length ||
      item.page === page ||
      item.page === page - 1 ||
      item.page === page + 1
    ) {
      return true;
    }

    if (
      (item.page === page - 2 && page > 3) ||
      (item.page === page + 2 && page < filteredCourseData.length - 2)
    ) {
      return "ellipsis";
    }

    if (
      (item.page === 2 && page > 3) ||
      (item.page === filteredCourseData.length - 1 &&
        page < filteredCourseData.length - 2)
    ) {
      return "hidden";
    }

    return false;
  };

  const handleDeleteCourse = async () =>{

    setLoading(true);
    try{

      const response = await axios.patch(`${BACKEND_BASEURL}/admin/toggleMaterialActiveStatus?materialId=${materialId}&status=false`)

      if(response.status === 200) {
        toast.success("material deleted successfully");

        fetchCourses();
      }  
      
    }catch(error){
      toast.error(error?.response?.data?.message || "error while deleting material");
      console.log("error in toggling material:", error);

    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="CourseMasterMainPage">
      <ToastContainer />
      <div className="course_Section">
        <div className="CourseSubSection">
          <div className="courseHeaderText">Courses</div>
          <div className="coursesSearchBox">
            <input
              className="SearchInput"
              placeholder="Search course/teacher"
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <img src={SearchIcon} alt="Search" />
          </div>
        </div>
        <div className="buttonDiv" onClick={handleOpenModal}>
          <img src={Plus} alt="Add" />
          <div className="courseButton">Create Course</div>
        </div>
        <NewCourse
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCourseCreated={handleCourseCreated}
        />
      </div>
      <div className="courseTableContainer">
        <div className="courseMainSection">
          {loading ? (
            <div className="loadingContainer">
              <BeatLoader color={"#219EBC"} loading={loading} size={15} />
            </div>
          ) : (
            <table className="courseTable">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Price</th>
                  {/* <th>Students</th>   commenting out as of now we are storing number of enrolled student in Batch */}
                  <th>Status</th>
                  <th>Activity Log</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourseData.map((course, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {course?.materialName}({course?.materialCode})
                        <Tooltip
                          title={
                            course?.isCertificationRequired
                              ? "Skill Enhancement Program"
                              : "Classroom Program"
                          }
                          arrow
                        >
                          <img
                            src={
                              course?.isCertificationRequired
                                ? certificationCourseImg
                                : liveLearningCourseImg
                            }
                            alt={
                              course?.isCertificationRequired
                                ? "Skill Enhancement Program"
                                : "Classroom Program"
                            }
                            style={{ marginLeft: "10px" }}
                          />
                        </Tooltip>
                      </div>
                    </td>
                    <td>{course?.tutorName}</td>
                    <td>&#8377;{course?.materialPrice.toFixed(2)}</td>
                    {/* <td>
											{course?.studentsEnrolled} / {course.totalSeats}    commenting out as of now we are storing number of enrolled student in Batch
										</td> */}
                    <td
                      style={{
                        color:
                          course?.isActive === true ? "#16A42D" : "#898FA7",
                      }}
                    >
                      {course?.isActive === true ? "Active" : "Inactive"}
                    </td>
                    <td>
                      <Tooltip
                        title={`Created On: ${course.creationDate}\nLast Modified: ${course.lastModified}`}
                        arrow
                      >
                        <div className="activity-log">
                          <img
                            src={ActivityIcon}
                            alt="Activity"
                            style={{ marginRight: "4px" }}
                          />
                          <span>
                            Created On- {course?.creationDate}
                            <br />
                            Last Modified- {course?.lastModified}
                          </span>
                        </div>
                      </Tooltip>
                    </td>
                    <td>
                      <img
                        src={ActionMenu}
                        alt="ActionMenuImg"
                        style={{
                          cursor: course?.isActive ? "pointer" : "not-allowed",
                          opacity: course?.isActive ? 1 : 0.5,
                        }}
                        onClick={(event) =>
                          course?.isActive
                            ? handleEditClick(event, course?.materialId, course)
                            : null
                        }
                      />
                      <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem
                          style={{ fontSize: "14px", cursor: "pointer" }}
                          onClick={() => {
                            handleMenuClose();
                            handleOpenEditCourse(course);
                          }}
                        >
                          <img
                            src={CourseEdit}
                            alt="CourseEditIcon"
                            style={{ marginRight: "8px" }}
                          />
                          Edit
                        </MenuItem>
                        <MenuItem
                          style={{ fontSize: "14px", cursor: "pointer" }}
                          onClick={handleManageCourse}
                        >
                          <img
                            src={Manage}
                            alt="ManageCourseIcon"
                            style={{ marginRight: "8px" }}
                          />{" "}
                          Manage
                        </MenuItem>
                        <MenuItem
                          style={{ fontSize: "14px", cursor: "pointer" }}
                         onClick={() => { handleMenuClose(); handleDeleteCourse(); }}
                        >
                          <img
                            src={Delete}
                            alt="DeleteCourseIcon"
                            style={{ marginRight: "8px" }}
                          />{" "}
                          Delete
                        </MenuItem>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="PaginationContainer">
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="circular"
            renderItem={(item) => {
              const shouldRender = renderPaginationItems(item);

              if (shouldRender === "ellipsis") {
                return (
                  <PaginationItem
                    key={item.page}
                    {...item}
                    type="start-ellipsis"
                    shape="circular"
                  />
                );
              }

              if (shouldRender === "hidden") {
                return null;
              }

              return (
                <PaginationItem
                  key={item.page}
                  {...item}
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #EDEDF1",
                    color: "#333333",
                    fontWeight: 600,
                    padding: "10px",
                    "&.Mui-selected": {
                      backgroundColor: "#219EBC",
                      color: "white",
                      border: "none",
                      padding: "10px",
                    },
                    "&:hover": {
                      backgroundColor: "white",
                      border: "1px solid #EDEDF1",
                      color: "#333333",
                    },
                  }}
                />
              );
            }}
          />
        </Stack>
      </div>
      <NewCourse
        isOpen={isEditCourseOpen}
        onClose={handleCloseEditCourse}
        onCourseCreated={handleCourseCreated}
        course={courseToEdit}
        isEdit={true}
      />
    </div>
  );
}
