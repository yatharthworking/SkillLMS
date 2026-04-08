import React, { useEffect, useMemo, useState } from "react";
import "./UserSidebar.css";
import { useLocation, useNavigate } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

const SIDEBAR_SECTIONS = [
  {
    id: "core",
    title: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: HomeRoundedIcon },
    ],
  },
  {
    id: "learning",
    title: "Learning",
    items: [
      { id: "myCourses", label: "My Courses", icon: MenuBookRoundedIcon },
      { id: "classes", label: "Classes (Recordings)", icon: PlayCircleRoundedIcon },
      { id: "contentLibrary", label: "Content Library", icon: LocalLibraryRoundedIcon },
    ],
  },
  {
    id: "assessment",
    title: "Practice & Assessment",
    items: [
      { id: "assignmentsPractice", label: "Assignments & Practice", icon: AssignmentRoundedIcon, badgeKey: "assignments" },
      { id: "examsTests", label: "Exams & Tests", icon: QuizRoundedIcon },
      { id: "resultsPerformance", label: "Results & Performance", icon: BarChartRoundedIcon, badgeKey: "results" },
    ],
  },
  {
    id: "growth",
    title: "Growth",
    items: [
      { id: "adaptiveLearning", label: "Adaptive Learning (PAL)", icon: PsychologyRoundedIcon },
      { id: "competitiveLearning", label: "Competitive Learning", icon: TrackChangesRoundedIcon },
    ],
  },
  {
    id: "others",
    title: "Others",
    items: [
      { id: "webinars", label: "Webinars", icon: VideocamRoundedIcon },
      { id: "helpSupport", label: "Help & Support", icon: SupportAgentRoundedIcon },
      { id: "profile", label: "Profile", icon: PersonRoundedIcon },
    ],
  },
];

export default function UserSidebar({ selectedBox, setSelectedBox, setSelectedSubBox }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const badgeCounts = useMemo(
    () => ({
      assignments: 0,
      results: 0,
    }),
    []
  );

  const handleNavigation = (itemId) => {
    setSelectedSubBox?.("");

    if (itemId === "profile") {
      if (window.innerWidth <= 768) {
        setIsMobileOpen(false);
        setIsExpanded(false);
      }
      navigate("/userProfile");
      return;
    }

    setSelectedBox?.(itemId);
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
      setIsExpanded(false);
    }
    navigate("/userLandingPage", { state: { selectedBox: itemId, selectedSubBox: "" } });
  };

  const handleContinueLearning = () => {
    setSelectedBox?.("myCourses");
    setSelectedSubBox?.("");
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
      setIsExpanded(false);
    }
    navigate("/userLandingPage", { state: { selectedBox: "myCourses", selectedSubBox: "" } });
  };

  const isProfileRoute = location.pathname === "/userProfile";
  const isCollapsed = !isExpanded;

  const handleMouseOver = () => {
    if (window.innerWidth > 768) {
      setIsExpanded(true);
    }
  };

  const handleMouseOut = () => {
    if (window.innerWidth > 768) {
      setIsExpanded(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen((previous) => {
      const nextState = !previous;
      setIsExpanded(nextState);
      return nextState;
    });
  };

  return (
    <>
      <div className="studentMobileToggleBtn" onClick={toggleMobileMenu}>
        {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
      </div>

      {isMobileOpen && <div className="studentMobileOverlay" onClick={toggleMobileMenu}></div>}

      <aside
        className={`userSidebarShell ${isCollapsed ? "collapsed" : "expanded"} ${isMobileOpen ? "mobileOpen" : ""}`}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
      <div className="userSidebarNav">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.id} className="userSidebarGroup">
            {!isCollapsed && section.title && <div className="userSidebarGroupTitle">{section.title}</div>}

            <div className="userSidebarGroupItems">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === "profile" ? isProfileRoute : selectedBox === item.id;
                const badgeValue = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`userSidebarItem ${isActive ? "active" : ""}`}
                    onClick={() => handleNavigation(item.id)}
                    title={isCollapsed ? item.label : ""}
                  >
                    <span className="userSidebarItemIcon">
                      <Icon fontSize="small" />
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="userSidebarItemLabel">{item.label}</span>
                        {badgeValue > 0 && <span className="userSidebarItemBadge">{badgeValue}</span>}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="userSidebarFooter">
        <button
          type="button"
          className={`userSidebarContinue ${isCollapsed ? "iconOnly" : ""}`}
          onClick={handleContinueLearning}
          title={isCollapsed ? "Continue Learning" : ""}
        >
          <PlayArrowRoundedIcon fontSize="small" />
          {!isCollapsed && <span>Continue Learning</span>}
        </button>
      </div>
      </aside>
    </>
  );
}
