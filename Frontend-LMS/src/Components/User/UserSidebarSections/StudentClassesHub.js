import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentClassesHub.css";
import UserClasses from "./UserClasses";
import Recording from "./Recording";

const TABS = [
  { id: "schedule", label: "Lecture Calendar" },
  { id: "recordings", label: "Recordings" },
];

export default function StudentClassesHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  const handleOpenRecordingsForDate = (dateKey) => {
    setSelectedDateFilter(dateKey);
    setActiveTab("recordings");
  };

  const handleClearSelectedDate = () => {
    setSelectedDateFilter("");
  };

  return (
    <div className="studentClassesHub">
      <div className="studentClassesHubHeader">
        <div>
          <button
            type="button"
            className="studentClassesHubBackButton"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <span className="studentClassesHubEyebrow">Learning Flow</span>
          <h1>Classes (Recordings)</h1>
          <p>Browse recorded lectures by date, subject, and topic, then continue watching from where you left off.</p>
        </div>

        <div className="studentClassesHubTabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`studentClassesHubTab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="studentClassesHubBody">
        {activeTab === "schedule" ? (
          <UserClasses
            selectedDateFilter={selectedDateFilter}
            onOpenRecordingsForDate={handleOpenRecordingsForDate}
          />
        ) : (
          <Recording
            selectedDateFilter={selectedDateFilter}
            onClearSelectedDate={handleClearSelectedDate}
            onSelectDateFilter={setSelectedDateFilter}
          />
        )}
      </div>
    </div>
  );
}
