import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./Recording.css";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";
import { getSpeakerNames, getSubjectName, parseDate, parseDateTime } from "../webinarUtils";

const pad = (value) => `${value}`.padStart(2, "0");

const toDateKey = (inputDate) => {
  const date = new Date(inputDate);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatLongDate = (inputDate) => {
  const parsedDate = parseDateTime(inputDate) || parseDate(inputDate);
  if (!parsedDate) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatSeconds = (secondsValue) => {
  const totalSeconds = Math.max(0, Math.floor(secondsValue || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
};

const normalizeRecordedWebinar = (webinar) => {
  const speakerNames = webinar?.speakerNames || getSpeakerNames(webinar?.speakers) || "Faculty";
  const subject = getSubjectName(webinar) || "General";
  const topic =
    webinar?.keyTakeaways?.[0]?.keyTakeaway ||
    webinar?.webinarName ||
    "Recorded session";
  const webinarDate = parseDateTime(webinar?.webinarStartTime) || parseDate(webinar?.webinarDate) || new Date();
  const watchedSeconds = Number(webinar?.watchedSeconds || 0);
  const progressPercent = Math.min(100, Number(webinar?.progressPercent || 0));

  return {
    ...webinar,
    id: webinar?.webinarInfoId || `${webinar?.webinarName}-${webinar?.webinarDate}`,
    title: webinar?.webinarName || "Recorded Webinar",
    subject,
    topic,
    tutorName: speakerNames,
    date: webinar?.webinarDate || webinarDate.toISOString(),
    dateKey: toDateKey(webinarDate),
    durationMinutes: Number(webinar?.durationMinutes || 0),
    playbackUrl: webinar?.playbackUrl || "",
    playbackType: webinar?.playbackType || "video",
    speedOptions: [0.75, 1, 1.25, 1.5, 2],
    isNew: Boolean(webinar?.isNew),
    watchedSeconds,
    progressPercent,
    isCompleted: Boolean(webinar?.isCompleted) || progressPercent >= 95,
    isRecentlyWatched: watchedSeconds > 0,
    resumeLabel: webinar?.resumeLabel || (watchedSeconds > 0 ? `Resume from ${formatSeconds(watchedSeconds)}` : "Start from beginning"),
  };
};

export default function Recording({ selectedDateFilter = "", onClearSelectedDate, onSelectDateFilter }) {
  const currentStudent =
    getFromLocalStorageSafe("studentDetails") || getFromLocalStorageSafe("UserLoginResponse");
  const username = currentStudent?.email || currentStudent?.username || "";
  const token = localStorage.getItem("token");

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordingFilter, setRecordingFilter] = useState("all");
  const [expandedSubject, setExpandedSubject] = useState("");
  const [expandedTopic, setExpandedTopic] = useState("");
  const [activeRecording, setActiveRecording] = useState(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  const videoRef = useRef(null);
  const progressSyncRef = useRef(0);

  useEffect(() => {
    if (!username) {
      setRecordings([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchRecordedWebinars = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/webinar/recorded-webinars`, {
          params: { username },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) {
          return;
        }

        setRecordings((response?.data?.data || []).map(normalizeRecordedWebinar));
      } catch (error) {
        console.error("Error fetching recorded webinars:", error);
        if (mounted) {
          setRecordings([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRecordedWebinars();

    return () => {
      mounted = false;
    };
  }, [token, username]);

  useEffect(() => {
    if (selectedDateFilter) {
      setRecordingFilter("date");
    }
  }, [selectedDateFilter]);

  const filteredRecordings = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return recordings.filter((recording) => {
      const matchesSearch =
        !normalizedSearch ||
        recording.title.toLowerCase().includes(normalizedSearch) ||
        recording.subject.toLowerCase().includes(normalizedSearch) ||
        recording.topic.toLowerCase().includes(normalizedSearch) ||
        recording.tutorName.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (recordingFilter === "recent") {
        return recording.isRecentlyWatched;
      }

      if (recordingFilter === "pending") {
        return !recording.isCompleted;
      }

      if (recordingFilter === "date" && selectedDateFilter) {
        return recording.dateKey === selectedDateFilter;
      }

      return true;
    });
  }, [recordingFilter, recordings, searchQuery, selectedDateFilter]);

  const continueWatching = useMemo(
    () =>
      recordings
        .filter((recording) => recording.progressPercent > 0 && recording.progressPercent < 100)
        .sort((firstItem, secondItem) => secondItem.watchedSeconds - firstItem.watchedSeconds)
        .slice(0, 2),
    [recordings]
  );

  const groupedRecordings = useMemo(
    () =>
      filteredRecordings.reduce((accumulator, recording) => {
        if (!accumulator[recording.subject]) {
          accumulator[recording.subject] = {};
        }

        if (!accumulator[recording.subject][recording.topic]) {
          accumulator[recording.subject][recording.topic] = [];
        }

        accumulator[recording.subject][recording.topic].push(recording);
        return accumulator;
      }, {}),
    [filteredRecordings]
  );

  const syncProgress = useCallback(
    async (videoElement, forceCompleted = false) => {
      if (!videoElement || !activeRecording || activeRecording.playbackType !== "video" || !username) {
        return;
      }

      const watchedSeconds = videoElement.currentTime || 0;
      const totalDurationSeconds = videoElement.duration || activeRecording.totalDurationSeconds || 0;

      try {
        await axios.post(
          `${BACKEND_BASEURL}/webinar/progress`,
          {
            webinarInfoId: activeRecording.webinarInfoId,
            username,
            watchedSeconds,
            totalDurationSeconds,
            completed: forceCompleted || (totalDurationSeconds > 0 && watchedSeconds >= totalDurationSeconds * 0.95),
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setRecordings((previous) =>
          previous.map((recording) =>
            recording.webinarInfoId === activeRecording.webinarInfoId
              ? normalizeRecordedWebinar({
                  ...recording,
                  watchedSeconds,
                  totalDurationSeconds,
                  progressPercent:
                    totalDurationSeconds > 0
                      ? Math.min(100, Math.round((watchedSeconds / totalDurationSeconds) * 1000) / 10)
                      : 0,
                  isCompleted: forceCompleted || recording.isCompleted,
                  resumeLabel: watchedSeconds > 0 ? `Resume from ${formatSeconds(watchedSeconds)}` : "Start from beginning",
                })
              : recording
          )
        );
      } catch (error) {
        console.error("Error saving recording progress:", error);
      }
    },
    [activeRecording, token, username]
  );

  const handlePlayRecording = async (recording) => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/webinar/recorded-webinar/${recording.webinarInfoId}`, {
        params: { username },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const normalizedRecording = normalizeRecordedWebinar(response?.data?.data || recording);
      setActiveRecording(normalizedRecording);
      setSelectedSpeed(1);
      progressSyncRef.current = 0;
      setExpandedSubject(normalizedRecording.subject);
      setExpandedTopic(`${normalizedRecording.subject}-${normalizedRecording.topic}`);
    } catch (error) {
      console.error("Error fetching recorded webinar details:", error);
      setActiveRecording(normalizeRecordedWebinar(recording));
      setSelectedSpeed(1);
      progressSyncRef.current = 0;
      setExpandedSubject(recording.subject);
      setExpandedTopic(`${recording.subject}-${recording.topic}`);
    }
  };

  useEffect(() => {
    if (!activeRecording || activeRecording.playbackType !== "video" || !videoRef.current) {
      return;
    }

    const videoElement = videoRef.current;

    const handleLoadedMetadata = () => {
      if (Number(activeRecording?.watchedSeconds || 0) > 0) {
        videoElement.currentTime = Number(activeRecording.watchedSeconds);
      }
      videoElement.playbackRate = selectedSpeed;
    };

    const handleTimeUpdate = () => {
      if (Math.abs(videoElement.currentTime - progressSyncRef.current) >= 10) {
        progressSyncRef.current = videoElement.currentTime;
        syncProgress(videoElement);
      }
    };

    const handleEnded = () => {
      syncProgress(videoElement, true);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [activeRecording, selectedSpeed, syncProgress]);

  const handleClosePlayer = async () => {
    if (videoRef.current && activeRecording?.playbackType === "video") {
      await syncProgress(videoRef.current);
    }

    setActiveRecording(null);
  };

  const activeDatePill = selectedDateFilter ? (
    <div className="recordingDatePill">
      <span>Showing recordings for {formatLongDate(selectedDateFilter)}</span>
      <button type="button" onClick={onClearSelectedDate}>
        Clear
      </button>
    </div>
  ) : null;

  return (
    <div className="recordingPage">
      {continueWatching.length > 0 ? (
        <div className="recordingContinuePanel">
          <div>
            <div className="recordingEyebrow">Continue watching</div>
            <h2>Jump back into your recent lectures</h2>
          </div>
          <div className="recordingContinueGrid">
            {continueWatching.map((recording) => (
              <button key={recording.id} type="button" className="recordingContinueCard" onClick={() => handlePlayRecording(recording)}>
                <div className="recordingCardOverlay">
                  <span className="recordingPlayBadge">Play</span>
                  {recording.isNew ? <span className="recordingNewBadge">New</span> : null}
                </div>
                <div className="recordingContinueCopy">
                  <strong>{recording.title}</strong>
                  <span>{recording.subject} • {recording.topic}</span>
                  <div className="recordingProgressTrack">
                    <div style={{ width: `${recording.progressPercent}%` }}></div>
                  </div>
                  <small>{recording.resumeLabel}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="recordingToolbar">
        <div className="recordingToolbarLeft">
          <input
            className="recordingSearch"
            placeholder="Search recordings by title or subject"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {activeDatePill}
        </div>

        <div className="recordingFilters">
          <button type="button" className={recordingFilter === "all" ? "active" : ""} onClick={() => setRecordingFilter("all")}>
            All
          </button>
          <button type="button" className={recordingFilter === "recent" ? "active" : ""} onClick={() => setRecordingFilter("recent")}>
            Recently watched
          </button>
          <button type="button" className={recordingFilter === "pending" ? "active" : ""} onClick={() => setRecordingFilter("pending")}>
            Not completed
          </button>
          <button
            type="button"
            className={recordingFilter === "date" ? "active" : ""}
            onClick={() => setRecordingFilter(selectedDateFilter ? "date" : "all")}
          >
            Selected date
          </button>
        </div>
      </div>

      <div className="recordingContentLayout">
        <div className="recordingAccordionPanel">
          <div className="recordingSectionTitle">Subject → Topic → Lectures</div>

          {loading ? (
            <div className="recordingEmptyState">
              <strong>Loading recordings...</strong>
              <span>We’re fetching your recorded lectures from the backend.</span>
            </div>
          ) : Object.keys(groupedRecordings).length === 0 ? (
            <div className="recordingEmptyState">
              <strong>No recordings found</strong>
              <span>Try another date, clear a filter, or search for a different subject.</span>
            </div>
          ) : (
            Object.entries(groupedRecordings).map(([subjectName, topics]) => (
              <div key={subjectName} className={`recordingSubjectBlock ${expandedSubject === subjectName ? "open" : ""}`}>
                <button type="button" className="recordingSubjectHeader" onClick={() => setExpandedSubject(expandedSubject === subjectName ? "" : subjectName)}>
                  <div>
                    <strong>{subjectName}</strong>
                    <span>{Object.values(topics).flat().length} lectures available</span>
                  </div>
                  <span className="recordingChevron">{expandedSubject === subjectName ? "−" : "+"}</span>
                </button>

                <div className={`recordingSubjectTopics ${expandedSubject === subjectName ? "open" : ""}`}>
                  {Object.entries(topics).map(([topicName, topicRecordings]) => {
                    const topicKey = `${subjectName}-${topicName}`;
                    return (
                      <div key={topicKey} className="recordingTopicBlock">
                        <button
                          type="button"
                          className="recordingTopicHeader"
                          onClick={() => setExpandedTopic(expandedTopic === topicKey ? "" : topicKey)}
                        >
                          <span>{topicName}</span>
                          <small>{topicRecordings.length} videos</small>
                        </button>

                        <div className={`recordingTopicLectures ${expandedTopic === topicKey ? "open" : ""}`}>
                          {topicRecordings.map((recording) => (
                            <button key={recording.id} type="button" className="recordingLectureRow" onClick={() => handlePlayRecording(recording)}>
                              <div className="recordingLectureCopy">
                                <strong>{recording.title}</strong>
                                <span>{formatLongDate(recording.date)} • {recording.durationMinutes || 0} min</span>
                              </div>
                              <div className="recordingLectureStatus">
                                {recording.progressPercent > 0 ? recording.resumeLabel : "Play"}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="recordingCardsPanel">
          <div className="recordingSectionTitle">Recorded lectures</div>

          <div className="recordingCardsGrid">
            {filteredRecordings.map((recording) => (
              <div key={recording.id} className="recordingCard">
                <button type="button" className="recordingThumb" onClick={() => handlePlayRecording(recording)}>
                  <div className="recordingPlayOverlay">
                    <span>Play</span>
                  </div>
                  <div className="recordingThumbMeta">
                    <span>{recording.subject}</span>
                    {recording.isNew ? <span className="recordingNewBadge">New</span> : null}
                  </div>
                  <div className="recordingProgressTrack">
                    <div style={{ width: `${recording.progressPercent}%` }}></div>
                  </div>
                </button>

                <div className="recordingCardBody">
                  <div className="recordingCardTitle">{recording.title}</div>
                  <div className="recordingCardSubTitle">{recording.topic}</div>
                  <div className="recordingCardMetaRow">
                    <span>{formatLongDate(recording.date)}</span>
                    <span>{recording.durationMinutes || 0} min</span>
                  </div>
                  <div className="recordingCardResume">{recording.resumeLabel}</div>
                  <div className="recordingCardActions">
                    <button type="button" className="recordingGhostButton" onClick={() => onSelectDateFilter?.(recording.dateKey)}>
                      Match date
                    </button>
                    <button type="button" className="recordingPrimaryButton" onClick={() => handlePlayRecording(recording)}>
                      {recording.progressPercent > 0 ? "Resume" : "Play"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeRecording ? (
        <div className="recordingModalShell">
          <div className="recordingModalBackdrop" onClick={handleClosePlayer}></div>
          <div className="recordingModalCard">
            <div className="recordingModalHeader">
              <div>
                <div className="recordingEyebrow">Lecture playback</div>
                <h3>{activeRecording.title}</h3>
                <p>{activeRecording.subject} • {activeRecording.topic}</p>
              </div>
              <button type="button" className="recordingModalClose" onClick={handleClosePlayer}>
                Close
              </button>
            </div>

            {activeRecording.playbackType === "iframe" ? (
              <iframe
                className="recordingPlayer"
                src={activeRecording.playbackUrl}
                title={activeRecording.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                controls
                playsInline
                className="recordingPlayer"
              >
                <source src={activeRecording.playbackUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <div className="recordingPlayerFooter">
              <div className="recordingResumeLabel">
                {activeRecording.watchedSeconds
                  ? `Resume from ${formatSeconds(activeRecording.watchedSeconds)}`
                  : "Starting from the beginning"}
              </div>
              {activeRecording.playbackType === "video" ? (
                <div className="recordingSpeedControls">
                  {activeRecording.speedOptions.map((speedOption) => (
                    <button
                      key={speedOption}
                      type="button"
                      className={selectedSpeed === speedOption ? "active" : ""}
                      onClick={() => {
                        setSelectedSpeed(speedOption);
                        if (videoRef.current) {
                          videoRef.current.playbackRate = speedOption;
                        }
                      }}
                    >
                      {speedOption}x
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
