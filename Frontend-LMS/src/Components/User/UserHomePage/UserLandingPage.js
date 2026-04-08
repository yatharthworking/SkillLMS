import React, { useEffect, useMemo, useState } from "react";
import "./UserLandingPage.css";
import Navbar from "../../Navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import UserSidebar from "../UserSideBar/UserSidebar";
import UserDashboard from "../UserSidebarSections/UserDashboard";
import UserCourses from "../UserSidebarSections/UserCourses";
import LiveTest from "../UserSidebarSections/LiveTest";
import UserWebinars from "../UserSidebarSections/UserWebinars";
import UserResults from "../UserSidebarSections/UserResults";
import { jwtDecode } from "jwt-decode";
import UserHelpSupport from "../UserSidebarSections/UserHelpSupport";
import AdaptiveLearningPal from "../UserSidebarSections/AdaptiveLearningPal";
import CompetitiveLearningHub from "../UserSidebarSections/CompetitiveLearningHub";
import StudentClassesHub from "../UserSidebarSections/StudentClassesHub";
import AssignmentsPracticeHub from "../UserSidebarSections/AssignmentsPracticeHub";
import ContentLibraryHub from "../UserSidebarSections/ContentLibraryHub";

const normalizeSelection = (selectedBox, selectedSubBox = "") => {
  if (selectedBox === "course") {
    return { selectedBox: "myCourses", selectedSubBox: "" };
  }

  if (selectedBox === "liveLearning") {
    return { selectedBox: "classes", selectedSubBox };
  }

  if (selectedBox === "exams") {
    return { selectedBox: "examsTests", selectedSubBox };
  }

  if (selectedBox === "results") {
    return { selectedBox: "resultsPerformance", selectedSubBox: "" };
  }

  if (selectedBox === "helpsupport") {
    return { selectedBox: "helpSupport", selectedSubBox: "" };
  }

  return {
    selectedBox: selectedBox || "dashboard",
    selectedSubBox: selectedSubBox || "",
  };
};

export default function UserLandingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialSelection = normalizeSelection(
    location.state?.selectedBox || "dashboard",
    location.state?.selectedSubBox || ""
  );

  const [selectedBox, setSelectedBox] = useState(initialSelection.selectedBox);
  const [selectedSubBox, setSelectedSubBox] = useState(initialSelection.selectedSubBox);

  useEffect(() => {
    const normalized = normalizeSelection(
      location.state?.selectedBox || "dashboard",
      location.state?.selectedSubBox || ""
    );
    setSelectedBox(normalized.selectedBox);
    setSelectedSubBox(normalized.selectedSubBox);
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const accessToken = params.get("access_token");

    if (token) {
      localStorage.setItem("token", token);
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      try {
        const decodedToken = jwtDecode(token);
        localStorage.setItem("UserLoginResponse", JSON.stringify(decodedToken));
      } catch (error) {
        console.error("Token decoding failed", error);
      }
    }
  }, []);

  const renderSelectedView = useMemo(() => {
    switch (selectedBox) {
      case "dashboard":
        return <UserDashboard />;
      case "myCourses":
        return <UserCourses />;
      case "classes":
        return <StudentClassesHub />;
      case "assignmentsPractice":
        return <AssignmentsPracticeHub />;
      case "examsTests":
        return <LiveTest />;
      case "resultsPerformance":
        return <UserResults />;
      case "adaptiveLearning":
        return <AdaptiveLearningPal />;
      case "contentLibrary":
        return <ContentLibraryHub />;
      case "competitiveLearning":
        return <CompetitiveLearningHub />;
      case "webinars":
        return <UserWebinars />;
      case "helpSupport":
        return <UserHelpSupport />;
      default:
        return <UserDashboard />;
    }
  }, [navigate, selectedBox]);

  return (
    <div className="userLandingPage">
      <div>
        <Navbar />
      </div>

      <div className="userLandingPageContainer">
        <div className="UserSidebarSection">
          <UserSidebar
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
            selectedSubBox={selectedSubBox}
            setSelectedSubBox={setSelectedSubBox}
          />
        </div>

        <div className="UserHomeSection">
          <div className="UserSelectedHomeSection">{renderSelectedView}</div>
        </div>
      </div>
    </div>
  );
}
