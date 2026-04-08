import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./UserWebinars.css";
import axios from "axios";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import BeatLoader from "react-spinners/BeatLoader";
import defaultWebinarImg from "../../../Assets/Images/webinardefaultImg.svg";
import {
  formatDate,
  getSpeakerNames,
  getSubjectName,
  getWebinarImageSrc,
  parseDate,
} from "../webinarUtils";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";

const tabs = [
  { id: "all", label: "All Webinars", icon: VideoLibraryRoundedIcon },
  { id: "recent", label: "Recently Watched", icon: HistoryRoundedIcon },
  { id: "popular", label: "Popular", icon: LocalFireDepartmentRoundedIcon },
];

const formatWatchTime = (totalSeconds = 0) => {
  const normalized = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const seconds = normalized % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const normalizeSearchValue = (value) => String(value || "").trim().toLowerCase();

export default function UserWebinars() {
  const token = localStorage.getItem("token");
  const currentStudent =
    getFromLocalStorageSafe("studentDetails") || getFromLocalStorageSafe("UserLoginResponse");
  const username = currentStudent?.username;

  const [recordedWebinars, setRecordedWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState(null);

  const playerRef = useRef(null);
  const progressSyncRef = useRef(0);

  useEffect(() => {
    if (!token) {
      delete axios.defaults.headers.common.Authorization;
      return;
    }
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    if (!username) {
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

        setRecordedWebinars(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching recorded webinars", error);
        if (mounted) {
          setRecordedWebinars([]);
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

  const subjectOptions = useMemo(
    () => Array.from(new Set(recordedWebinars.map((webinar) => getSubjectName(webinar)).filter(Boolean))),
    [recordedWebinars]
  );

  const speakerOptions = useMemo(
    () => Array.from(new Set(recordedWebinars.flatMap((webinar) => getSpeakerNames(webinar?.speakers).split(",").map((name) => name.trim()).filter(Boolean)))),
    [recordedWebinars]
  );

  const filteredRecordedWebinars = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchQuery);

    let webinarList = recordedWebinars.filter((webinar) => {
      const subjectName = getSubjectName(webinar);
      const speakerNames = getSpeakerNames(webinar?.speakers);
      const webinarDate = parseDate(webinar?.webinarDate);
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearchValue(webinar?.webinarName).includes(normalizedSearch) ||
        normalizeSearchValue(subjectName).includes(normalizedSearch) ||
        normalizeSearchValue(speakerNames).includes(normalizedSearch);
      const matchesSubject = !selectedSubject || subjectName === selectedSubject;
      const matchesSpeaker = !selectedSpeaker || speakerNames.includes(selectedSpeaker);
      const matchesMonth =
        !selectedMonth ||
        (webinarDate &&
          `${webinarDate.getFullYear()}-${String(webinarDate.getMonth() + 1).padStart(2, "0")}` === selectedMonth);

      return matchesSearch && matchesSubject && matchesSpeaker && matchesMonth;
    });

    if (activeTab === "recent") {
      webinarList = webinarList
        .filter((webinar) => Number(webinar?.watchedSeconds || 0) > 0)
        .sort((first, second) => Number(second?.watchedSeconds || 0) - Number(first?.watchedSeconds || 0));
    } else if (activeTab === "popular") {
      webinarList = [...webinarList].sort(
        (first, second) => Number(second?.popularityScore || 0) - Number(first?.popularityScore || 0)
      );
    }

    return webinarList;
  }, [activeTab, recordedWebinars, searchQuery, selectedMonth, selectedSpeaker, selectedSubject]);

  const summary = useMemo(() => {
    const watchedWebinars = recordedWebinars.filter((webinar) => Number(webinar?.watchedSeconds || 0) > 0).length;
    const completedWebinars = recordedWebinars.filter((webinar) => webinar?.isCompleted).length;
    const averageProgress =
      recordedWebinars.length === 0
        ? 0
        : Math.round(
            (recordedWebinars.reduce((total, webinar) => total + Number(webinar?.progressPercent || 0), 0) /
              recordedWebinars.length) *
              10
          ) / 10;

    return {
      total: recordedWebinars.length,
      watched: watchedWebinars,
      completed: completedWebinars,
      averageProgress,
    };
  }, [recordedWebinars]);

  const syncProgress = useCallback(async (videoElement, forceCompleted = false) => {
    if (!videoElement || !selectedWebinar || selectedWebinar.playbackType !== "video" || !username) {
      return;
    }

    const watchedSeconds = videoElement.currentTime || 0;
    const totalDurationSeconds = videoElement.duration || selectedWebinar.totalDurationSeconds || 0;

    try {
      await axios.post(
        `${BACKEND_BASEURL}/webinar/progress`,
        {
          webinarInfoId: selectedWebinar.webinarInfoId,
          username,
          watchedSeconds,
          totalDurationSeconds,
          completed: forceCompleted || (totalDurationSeconds > 0 && watchedSeconds >= totalDurationSeconds * 0.95),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setRecordedWebinars((previous) =>
        previous.map((webinar) =>
          webinar.webinarInfoId === selectedWebinar.webinarInfoId
            ? {
                ...webinar,
                watchedSeconds,
                totalDurationSeconds,
                progressPercent:
                  totalDurationSeconds > 0 ? Math.min(100, Math.round((watchedSeconds / totalDurationSeconds) * 1000) / 10) : 0,
                resumeLabel: watchedSeconds > 0 ? `Resume from ${formatWatchTime(watchedSeconds)}` : "Start from beginning",
                isCompleted: forceCompleted || webinar.isCompleted,
              }
            : webinar
        )
      );
    } catch (error) {
      console.error("Error saving webinar progress", error);
    }
  }, [selectedWebinar, token, username]);

  const handleWatchNow = async (webinar) => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/webinar/recorded-webinar/${webinar.webinarInfoId}`, {
        params: { username },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSelectedWebinar(response.data?.data || webinar);
      progressSyncRef.current = 0;
      setPlayerOpen(true);
    } catch (error) {
      console.error("Error fetching webinar details", error);
      setSelectedWebinar(webinar);
      progressSyncRef.current = 0;
      setPlayerOpen(true);
    }
  };

  useEffect(() => {
    if (!playerOpen || !selectedWebinar || selectedWebinar.playbackType !== "video") {
      return;
    }

    const videoElement = playerRef.current;
    if (!videoElement) {
      return;
    }

    const handleLoadedMetadata = () => {
      if (Number(selectedWebinar?.watchedSeconds || 0) > 0) {
        videoElement.currentTime = Number(selectedWebinar.watchedSeconds);
      }
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
  }, [playerOpen, selectedWebinar, syncProgress]);

  const handleClosePlayer = async () => {
    if (playerRef.current && selectedWebinar?.playbackType === "video") {
      await syncProgress(playerRef.current);
    }

    setPlayerOpen(false);
    setSelectedWebinar(null);
  };

  const renderCardActionLabel = (webinar) => {
    if (webinar?.isCompleted) {
      return "Watch Again";
    }

    return Number(webinar?.watchedSeconds || 0) > 0 ? "Resume Watching" : "Watch Now";
  };

  return (
    <div className="recordedWebinarPage">
      <div className="recordedWebinarHero">
        <div className="recordedWebinarHeroText">
          <span className="recordedWebinarEyebrow">Recorded Sessions</span>
          <h1>Webinars</h1>
          <p>
            Watch recorded webinars on demand, resume from where you stopped, and revisit important
            sessions with fast search and smart filters.
          </p>
        </div>

        <div className="recordedWebinarSummaryGrid">
          <div className="recordedWebinarSummaryCard">
            <span>Total Webinars</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="recordedWebinarSummaryCard">
            <span>Recently Watched</span>
            <strong>{summary.watched}</strong>
          </div>
          <div className="recordedWebinarSummaryCard">
            <span>Completed</span>
            <strong>{summary.completed}</strong>
          </div>
          <div className="recordedWebinarSummaryCard focus">
            <span>Average Progress</span>
            <strong>{summary.averageProgress}%</strong>
          </div>
        </div>
      </div>

      <div className="recordedWebinarToolbar">
        <div className="recordedWebinarTabRow">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`recordedWebinarTab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon fontSize="small" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="recordedWebinarFilters">
          <label className="recordedWebinarFilterField">
            <span>Subject</span>
            <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
              <option value="">All Subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="recordedWebinarFilterField">
            <span>Speaker</span>
            <select value={selectedSpeaker} onChange={(event) => setSelectedSpeaker(event.target.value)}>
              <option value="">All Speakers</option>
              {speakerOptions.map((speaker) => (
                <option key={speaker} value={speaker}>
                  {speaker}
                </option>
              ))}
            </select>
          </label>

          <label className="recordedWebinarFilterField">
            <span>Date</span>
            <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
          </label>

          <label className="recordedWebinarSearchField">
            <SearchRoundedIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search by title, speaker or topic"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="recordedWebinarLoadingState">
          <BeatLoader color="#219EBC" />
        </div>
      ) : filteredRecordedWebinars.length > 0 ? (
        <div className="recordedWebinarGrid">
          {filteredRecordedWebinars.map((webinar) => (
            <div key={webinar.webinarInfoId} className="recordedWebinarCard">
              <div className="recordedWebinarThumbnailWrap" onClick={() => handleWatchNow(webinar)}>
                <img
                  src={getWebinarImageSrc(webinar?.webinarImage || webinar?.webinarImageDB, defaultWebinarImg)}
                  alt={webinar?.webinarName || "Recorded webinar"}
                  className="recordedWebinarThumbnail"
                />
                <div className="recordedWebinarThumbnailOverlay">
                  <PlayCircleRoundedIcon fontSize="large" />
                </div>
                <div className="recordedWebinarBadgeRow">
                  {webinar?.isNew && <span className="recordedBadge new">New</span>}
                  {webinar?.isTrending && <span className="recordedBadge trending">Trending</span>}
                </div>
              </div>

              <div className="recordedWebinarCardBody">
                <div className="recordedWebinarMetaRow">
                  <span>
                    <CalendarMonthRoundedIcon fontSize="inherit" />
                    {formatDate(webinar?.webinarDate)}
                  </span>
                  <span>
                    <AccessTimeRoundedIcon fontSize="inherit" />
                    {webinar?.durationLabel}
                  </span>
                </div>

                <h3>{webinar?.webinarName}</h3>

                <div className="recordedWebinarInfoLine">
                  <PersonRoundedIcon fontSize="small" />
                  <span>{webinar?.speakerNames || getSpeakerNames(webinar?.speakers) || "-"}</span>
                </div>

                <div className="recordedWebinarInfoLine">
                  <BookmarkAddedRoundedIcon fontSize="small" />
                  <span>{getSubjectName(webinar)}</span>
                </div>

                <div className="recordedWebinarProgressBlock">
                  <div className="recordedWebinarProgressMeta">
                    <span>{webinar?.resumeLabel || "Start from beginning"}</span>
                    <strong>{webinar?.progressPercent || 0}%</strong>
                  </div>
                  <div className="recordedWebinarProgressTrack">
                    <div
                      className="recordedWebinarProgressFill"
                      style={{ width: `${Math.min(Number(webinar?.progressPercent || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="recordedWebinarActionRow">
                  <button type="button" className="recordedPrimaryAction" onClick={() => handleWatchNow(webinar)}>
                    {renderCardActionLabel(webinar)}
                  </button>
                  <button type="button" className="recordedSecondaryAction" onClick={() => handleWatchNow(webinar)}>
                    {Number(webinar?.watchedSeconds || 0) > 0 ? webinar.resumeLabel : "Open Player"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="recordedWebinarEmptyState">
          No recorded webinars match your current filters.
        </div>
      )}

      <Dialog open={playerOpen} maxWidth="lg" fullWidth onClose={handleClosePlayer}>
        <DialogTitle>{selectedWebinar?.webinarName || "Recorded Webinar"}</DialogTitle>
        <DialogContent>
          {selectedWebinar && (
            <div className="recordedPlayerLayout">
              <div className="recordedPlayerWrap">
                {selectedWebinar.playbackType === "iframe" ? (
                  <iframe
                    className="recordedPlayerFrame"
                    src={selectedWebinar.playbackUrl}
                    title={selectedWebinar.webinarName}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    ref={playerRef}
                    className="recordedPlayerVideo"
                    src={selectedWebinar.playbackUrl}
                    controls
                    playsInline
                  />
                )}
              </div>

              <div className="recordedPlayerDetails">
                <div className="recordedPlayerDetailCard">
                  <strong>{selectedWebinar.webinarName}</strong>
                  <p>{getSubjectName(selectedWebinar)} with {selectedWebinar.speakerNames || "-"}</p>
                </div>
                <div className="recordedPlayerInsight">
                  <TrendingUpRoundedIcon fontSize="small" />
                  <span>{selectedWebinar.resumeLabel}</span>
                </div>
                <div className="recordedPlayerInsight">
                  <AccessTimeRoundedIcon fontSize="small" />
                  <span>Duration: {selectedWebinar.durationLabel}</span>
                </div>
                <div className="recordedPlayerInsight">
                  <VideoLibraryRoundedIcon fontSize="small" />
                  <span>Progress: {selectedWebinar.progressPercent || 0}%</span>
                </div>
                {Array.isArray(selectedWebinar.keyTakeaways) && selectedWebinar.keyTakeaways.length > 0 && (
                  <div className="recordedTakeawayCard">
                    <strong>Key Takeaways</strong>
                    <div className="recordedTakeawayList">
                      {selectedWebinar.keyTakeaways.slice(0, 4).map((takeaway, index) => (
                        <span key={`${takeaway.keytakeawayId || index}-${index}`}>
                          {takeaway.keyTakeaway}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
