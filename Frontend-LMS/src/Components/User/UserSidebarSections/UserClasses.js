import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./UserClasses.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Download from "../../../Assets/Images/download.svg";
import * as XLSX from "xlsx";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";
import { getSpeakerNames, getSubjectName, parseDate, parseDateTime } from "../webinarUtils";

const pad = (value) => `${value}`.padStart(2, "0");

const toDateKey = (inputDate) => {
  const date = new Date(inputDate);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatCalendarLabel = (dateKey) => {
  const parsedDate = parseDate(dateKey);
  if (!parsedDate) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const formatLongDate = (inputDate) => {
  const parsedDate = parseDateTime(inputDate) || parseDate(inputDate);
  if (!parsedDate) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatTime = (inputDate) => {
  const parsedDate = parseDateTime(inputDate);
  if (!parsedDate) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
};

const normalizeRecordedLectures = (webinars = []) =>
  webinars.map((webinar) => {
    const startDateTime = webinar?.webinarStartTime || webinar?.webinarDate;
    const endDateTime = webinar?.webinarEndTime || webinar?.webinarDate;
    const parsedBaseDate = parseDateTime(startDateTime) || parseDate(webinar?.webinarDate) || new Date();
    const topicName =
      webinar?.keyTakeaways?.[0]?.keyTakeaway ||
      webinar?.webinarName ||
      "Recorded Lecture";

    return {
      id: webinar?.webinarInfoId || `${webinar?.webinarName}-${webinar?.webinarDate}`,
      title: webinar?.webinarName || "Recorded Lecture",
      tutorName: webinar?.speakerNames || getSpeakerNames(webinar?.speakers) || "Faculty",
      courseName: webinar?.subjectName || getSubjectName(webinar) || "Recorded Session",
      subjectName: getSubjectName(webinar) || "General",
      topicName,
      startDateTime,
      endDateTime,
      webinarInfoId: webinar?.webinarInfoId,
      dateKey: toDateKey(parsedBaseDate),
      progressPercent: Number(webinar?.progressPercent || 0),
      resumeLabel: webinar?.resumeLabel || "Start from beginning",
    };
  });

export default function UserClasses({ selectedDateFilter = "", onOpenRecordingsForDate }) {
  const [value, setValue] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(selectedDateFilter || "");
  const [showSelectedDateOnly, setShowSelectedDateOnly] = useState(false);
  const [recordedLectures, setRecordedLectures] = useState([]);

  const currentStudent =
    getFromLocalStorageSafe("studentDetails") || getFromLocalStorageSafe("UserLoginResponse");
  const username = currentStudent?.email || currentStudent?.username || "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!username) {
      setRecordedLectures([]);
      return;
    }

    let mounted = true;

    const fetchRecordedLectures = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/webinar/recorded-webinars`, {
          params: { username },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) {
          return;
        }

        setRecordedLectures(normalizeRecordedLectures(response?.data?.data || []));
      } catch (error) {
        console.error("Error fetching recorded lectures:", error);
        if (mounted) {
          setRecordedLectures([]);
        }
      }
    };

    fetchRecordedLectures();

    return () => {
      mounted = false;
    };
  }, [token, username]);

  useEffect(() => {
    if (selectedDateFilter) {
      setSelectedDateKey(selectedDateFilter);
      setValue(parseDate(selectedDateFilter) || new Date(selectedDateFilter));
      setShowSelectedDateOnly(true);
    }
  }, [selectedDateFilter]);

  const classesByDate = useMemo(
    () =>
      recordedLectures.reduce((accumulator, lecture) => {
        if (!accumulator[lecture.dateKey]) {
          accumulator[lecture.dateKey] = [];
        }
        accumulator[lecture.dateKey].push(lecture);
        return accumulator;
      }, {}),
    [recordedLectures]
  );

  const selectedDateClasses = selectedDateKey ? classesByDate[selectedDateKey] || [] : [];

  const upcomingClasses = useMemo(() => {
    const sortedClasses = [...recordedLectures].sort(
      (firstClass, secondClass) =>
        (parseDateTime(secondClass.startDateTime)?.getTime() || 0) -
        (parseDateTime(firstClass.startDateTime)?.getTime() || 0)
    );

    if (showSelectedDateOnly && selectedDateKey) {
      return sortedClasses.filter((classItem) => classItem.dateKey === selectedDateKey);
    }

    return sortedClasses;
  }, [recordedLectures, selectedDateKey, showSelectedDateOnly]);

  const renderTileContent = ({ date, view }) => {
    const dateKey = toDateKey(date);

    if (view === "month" && classesByDate[dateKey]) {
      return (
        <div className="dots">
          {classesByDate[dateKey].slice(0, 3).map((schedule, index) => (
            <div key={`${schedule.id}-${index}`} className="dot"></div>
          ))}
        </div>
      );
    }

    return null;
  };

  const handleDateClick = (date) => {
    const dateKey = toDateKey(date);
    setSelectedDateKey(dateKey);
    setShowSelectedDateOnly(true);
  };

  const handleDownload = () => {
    const exportDateKey = selectedDateKey || Object.keys(classesByDate)[0];
    if (!exportDateKey || !classesByDate[exportDateKey]) return;

    const data = [["Date", "Time", "Lecture", "Speaker", "Subject", "Resume"]];
    classesByDate[exportDateKey].forEach((classItem) => {
      data.push([
        formatLongDate(classItem.startDateTime),
        `${formatTime(classItem.startDateTime)} - ${formatTime(classItem.endDateTime)}`,
        classItem.title,
        classItem.tutorName,
        classItem.subjectName,
        classItem.resumeLabel,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    XLSX.writeFile(workbook, `Recorded_Lectures_${exportDateKey}.xlsx`);
  };

  return (
    <div className="liveClassHomeSectionContainer">
      <div className="classOverviewStrip">
        <div className="classOverviewCard">
          <span>Recorded lectures</span>
          <strong>{recordedLectures.length}</strong>
          <small>Available across your recorded lecture calendar</small>
        </div>
        <div className="classOverviewCard">
          <span>Selected date</span>
          <strong>{selectedDateKey ? formatCalendarLabel(selectedDateKey) : "Today"}</strong>
          <small>{selectedDateClasses.length} lecture{selectedDateClasses.length === 1 ? "" : "s"} on this day</small>
        </div>
      </div>

      <div className="classEventsDivDSection">
        <div className="liveClassEventSection">
          <div className="sectionHeaderRow">
            <div className="upcomingClassHeading">Lecture Calendar</div>
            <div className="scheduleFilterBar">
              <button
                type="button"
                className={`scheduleFilterButton ${showSelectedDateOnly ? "active" : ""}`}
                onClick={() => setShowSelectedDateOnly((currentValue) => !currentValue)}
              >
                {showSelectedDateOnly ? "Showing selected date" : "Show selected date only"}
              </button>
              {selectedDateKey ? (
                <button
                  type="button"
                  className="scheduleFilterButton secondary"
                  onClick={() => onOpenRecordingsForDate?.(selectedDateKey)}
                >
                  Show recordings for {formatCalendarLabel(selectedDateKey)}
                </button>
              ) : null}
            </div>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="classEmptyState">
              <div className="classEmptyTitle">No recordings available</div>
              <div className="classEmptySubTitle">Pick another date from the calendar or switch off the date filter to view more recorded lectures.</div>
            </div>
          ) : (
            upcomingClasses.map((classInfo) => {
              const isToday = classInfo.dateKey === toDateKey(new Date());

              return (
                <div key={classInfo.id} className="classSheduleSection">
                  <div className="liveClassDetailsSection">
                    <div className="liveClassTimingDiv">
                      <button type="button" className="liveClassButton">
                        {isToday ? "Today" : "Recorded"}
                      </button>
                      <div className="schedule-time">
                        {formatTime(classInfo.startDateTime)} - {formatTime(classInfo.endDateTime)}
                      </div>
                    </div>
                    <div className="joinClassTimeDiv">
                      <button type="button" className="joinClassButton" onClick={() => onOpenRecordingsForDate?.(classInfo.dateKey)}>
                        {classInfo.progressPercent > 0 ? "Resume Recording" : "Open Recording"}
                      </button>
                    </div>
                  </div>

                  <div className="LiveClassDetailsDiv">
                    <div className="eventDate">
                      {formatLongDate(classInfo.startDateTime)} {isToday && <span className="eventDay">TODAY</span>}
                    </div>
                    <div className="subjectNameHeader">{classInfo.title}</div>
                    <div className="scheduleDetailsDiv">
                      <div className="schedule-detail">By {classInfo.tutorName}</div>
                      <span>|</span>
                      <div className="schedule-detail">{classInfo.subjectName}</div>
                      <span>|</span>
                      <div className="schedule-detail">{classInfo.topicName}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="CalendarEventSection">
          <div className="calendarDiv">
            <div className="upcomingClassHeading">Schedule</div>
            <img src={Download} alt="download" onClick={handleDownload} className="downloadImg" />
          </div>

          <Calendar onChange={setValue} value={value} onClickDay={handleDateClick} tileContent={renderTileContent} />

          <div className="schedule-container">
            <div className="schedule-date">
              {selectedDateKey ? `Lectures for ${formatCalendarLabel(selectedDateKey)}` : "Select a date to view recordings"}
            </div>

            {selectedDateKey ? (
              selectedDateClasses.length > 0 ? (
                selectedDateClasses.map((classInfo) => (
                  <div key={`selected-${classInfo.id}`} className="schedule-item">
                    <div className="scheduleItemTopRow">
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button type="button" className="liveClassButton">
                          Recorded
                        </button>
                        <div className="schedule-time">
                          {formatTime(classInfo.startDateTime)} - {formatTime(classInfo.endDateTime)}
                        </div>
                      </div>
                      <button type="button" className="miniActionButton" onClick={() => onOpenRecordingsForDate?.(selectedDateKey)}>
                        {classInfo.progressPercent > 0 ? "Resume" : "Recordings"}
                      </button>
                    </div>

                    <div className="schedule-title">{classInfo.title}</div>
                    <div className="scheduleDetailsDiv">
                      <div className="schedule-detail">By {classInfo.tutorName}</div>
                      <span>|</span>
                      <div className="schedule-detail">{classInfo.subjectName}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="classEmptyState compact">
                  <div className="classEmptyTitle">No recordings on this date</div>
                  <div className="classEmptySubTitle">Use the recordings tab to review previous sessions for the same day.</div>
                </div>
              )
            ) : (
              <div className="classEmptyState compact">
                <div className="classEmptyTitle">Calendar connected</div>
                <div className="classEmptySubTitle">Click a highlighted date to see recorded lectures and open matching recordings.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
