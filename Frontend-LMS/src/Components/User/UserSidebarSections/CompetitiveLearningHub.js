import React, { useEffect, useState } from "react";
import "./CompetitiveLearningHub.css";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BeatLoader from "react-spinners/BeatLoader";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASEURL } from "../../helper";

const statCards = [
  {
    key: "testsAttempted",
    label: "Tests Attempted",
    icon: FlagRoundedIcon,
    format: (value) => value ?? 0,
    accent: "teal",
  },
  {
    key: "accuracy",
    label: "Accuracy",
    icon: AutoGraphRoundedIcon,
    format: (value) => `${value ?? 0}%`,
    accent: "orange",
  },
  {
    key: "rankImprovement",
    label: "Rank Improvement",
    icon: TrendingUpRoundedIcon,
    format: (value) => `+${value ?? 0}`,
    accent: "blue",
  },
  {
    key: "topPercent",
    label: "Current Standing",
    icon: EmojiEventsRoundedIcon,
    format: (value) => `Top ${value ?? 0}%`,
    accent: "gold",
  },
];

export default function CompetitiveLearningHub() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userLoginResponse = JSON.parse(localStorage.getItem("UserLoginResponse") || "null");
  const studentDetails = JSON.parse(localStorage.getItem("studentDetails") || "null");
  const username = userLoginResponse?.username;
  const studentBatchId = studentDetails?.batchId ?? userLoginResponse?.batchId ?? 1;

  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({});
  const [insights, setInsights] = useState([]);
  const [skillContent, setSkillContent] = useState([]);
  const [skillSummary, setSkillSummary] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

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

    const fetchCompetitiveData = async () => {
      setLoading(true);
      try {
        const [modulesResponse, leaderboardResponse, rankResponse] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/student/competitive/modules`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/competitive/leaderboard`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/competitive/user-rank`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (!mounted) {
          return;
        }

        setModules(modulesResponse.data?.modules || []);
        setChallenges(modulesResponse.data?.challenges || []);
        setStats(modulesResponse.data?.stats || {});
        setInsights(modulesResponse.data?.insights || []);
        setSkillContent(modulesResponse.data?.skillContent || []);
        setSkillSummary(modulesResponse.data?.skillSummary || {});
        setLeaderboard(leaderboardResponse.data?.leaderboard || []);
        setUserRank(rankResponse.data?.userRank || null);
      } catch (error) {
        console.error("Error fetching competitive learning data", error);
        if (mounted) {
          setModules([]);
          setChallenges([]);
          setStats({});
          setInsights([]);
          setSkillContent([]);
          setSkillSummary({});
          setLeaderboard([]);
          setUserRank(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCompetitiveData();

    return () => {
      mounted = false;
    };
  }, [studentBatchId, token, username]);

  const handleTargetNavigation = (target) => {
    if (!target) {
      return;
    }

    navigate("/userLandingPage", {
      state: {
        selectedBox: target,
      },
    });
  };

  if (loading) {
    return (
      <div className="competitiveLearningPage loadingState">
        <BeatLoader color="#219EBC" />
      </div>
    );
  }

  return (
    <div className="competitiveLearningPage">
      <div className="competitiveHeroCard">
        <div className="competitiveHeroText">
          <span className="competitiveEyebrow">Challenge Mode</span>
          <h1>Competitive Learning</h1>
          <p>
            Prepare for high-stakes exams with structured modules, timed practice rounds, leaderboard
            motivation, and focused performance signals.
          </p>
        </div>

        {userRank && (
          <div className="competitiveUserRankCard">
            <div className="competitiveUserRankIcon">
              <MilitaryTechRoundedIcon fontSize="small" />
            </div>
            <div className="competitiveUserRankBody">
              <span>Your Competitive Rank</span>
              <strong>#{userRank.rank || 0}</strong>
              <p>
                Average score {userRank.scoreDisplay || "0%"} across {userRank.testsAttempted ?? 0} competitive
                attempts.
              </p>
              <button
                type="button"
                className="competitivePrimaryAction"
                onClick={() => handleTargetNavigation("examsTests")}
              >
                Attempt Next Test
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="competitiveStatsGrid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className={`competitiveStatCard ${card.accent}`}>
              <div className="competitiveStatIcon">
                <Icon fontSize="small" />
              </div>
              <div className="competitiveStatBody">
                <span>{card.label}</span>
                <strong>{card.format(stats[card.key])}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="competitiveSection">
        <div className="competitiveSectionHeader">
          <div>
            <div className="competitiveSectionTitle">Exam Preparation Modules</div>
            <p>Move through structured preparation tracks without leaving the current LMS workflow.</p>
          </div>
          <div className="competitivePanelChip">
            <BoltRoundedIcon fontSize="small" />
            Structured preparation
          </div>
        </div>

        <div className="competitiveModuleGrid">
          {modules.length > 0 ? modules.map((module) => (
            <div key={module.id} className={`competitiveModuleCard ${module.emphasis || "normal"}`}>
              <div className="competitiveModuleTop">
                <span className="competitiveModuleBadge">{module.difficulty}</span>
                <span className="competitiveModuleCount">{module.totalCount} sets</span>
              </div>
              <strong>{module.title}</strong>
              <p>{module.description}</p>
              <button
                type="button"
                className="competitiveGhostAction"
                onClick={() => handleTargetNavigation(module.actionTarget)}
              >
                {module.actionLabel}
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          )) : (
            <div className="competitiveEmptyState">Competitive modules will appear here after test data is available for your batch.</div>
          )}
        </div>
      </div>

      <div className="competitiveSection">
        <div className="competitiveSectionHeader">
          <div>
            <div className="competitiveSectionTitle">Skill Development Content</div>
            <p>Build aptitude, communication, and revision skills alongside your test practice.</p>
          </div>
          <div className="competitivePanelChip">
            <SchoolRoundedIcon fontSize="small" />
            Skill growth track
          </div>
        </div>

        <div className="competitiveSkillSummaryGrid">
          <div className="competitiveSkillSummaryCard">
            <span>Skill readiness</span>
            <strong>{skillSummary.readinessScore ?? 0}%</strong>
          </div>
          <div className="competitiveSkillSummaryCard">
            <span>Active tracks</span>
            <strong>{skillSummary.activeTracks ?? 0}</strong>
          </div>
          <div className="competitiveSkillSummaryCard focus">
            <span>Focus skill</span>
            <strong>{skillSummary.focusSkill || "Skill Development"}</strong>
          </div>
        </div>

        <div className="competitiveModuleGrid">
          {skillContent.length > 0 ? skillContent.map((item) => (
            <div key={item.id} className="competitiveModuleCard skillCard">
              <div className="competitiveChallengeTop">
                <strong>{item.title}</strong>
                <span className="competitiveChallengeBadge">{item.focusArea}</span>
              </div>
              <p>{item.description}</p>

              <div className="competitiveSkillMeta">
                <span>{item.status}</span>
                <span>{item.estimatedTime}</span>
                <span>{item.deliverable}</span>
              </div>

              <div className="competitiveProgressGroup">
                <div className="competitiveProgressLabel">
                  <span>Skill readiness</span>
                  <span>{item.progressValue}%</span>
                </div>
                <div className="competitiveProgressTrack">
                  <div className="competitiveProgressFill teal" style={{ width: `${item.progressValue}%` }}></div>
                </div>
              </div>

              <button
                type="button"
                className="competitiveGhostAction"
                onClick={() => handleTargetNavigation(item.actionTarget)}
              >
                {item.actionLabel}
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          )) : (
            <div className="competitiveEmptyState">Skill development recommendations will appear here once your course and test signals are available.</div>
          )}
        </div>
      </div>

      <div className="competitiveMidGrid">
        <div className="competitivePanelCard">
          <div className="competitivePanelHeader">
            <div>
              <div className="competitivePanelTitle">Competitive Practice</div>
              <p>Use quick, daily, and weekly challenge modes to improve exam readiness under pressure.</p>
            </div>
            <div className="competitivePanelChip">
              <TimerRoundedIcon fontSize="small" />
              Timed challenge formats
            </div>
          </div>

          <div className="competitiveChallengeList">
            {challenges.length > 0 ? challenges.map((challenge) => (
              <div key={challenge.id} className="competitiveChallengeCard">
                <div className="competitiveChallengeTop">
                  <strong>{challenge.title}</strong>
                  <span className="competitiveChallengeBadge">{challenge.badge}</span>
                </div>
                <p>{challenge.description}</p>
                <button
                  type="button"
                  className="competitiveSecondaryAction"
                  onClick={() => handleTargetNavigation(challenge.actionTarget)}
                >
                  {challenge.actionLabel}
                </button>
              </div>
            )) : (
              <div className="competitiveEmptyState compact">Challenge modes are being prepared for your upcoming tests.</div>
            )}
          </div>
        </div>

        <div className="competitivePanelCard">
          <div className="competitivePanelHeader">
            <div>
              <div className="competitivePanelTitle">Smart Insights</div>
              <p>Motivation cues based on your attempts, accuracy, and leaderboard standing.</p>
            </div>
            <div className="competitivePanelChip">
              <InsightsRoundedIcon fontSize="small" />
              Momentum signals
            </div>
          </div>

          <div className="competitiveInsightList">
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={`${insight.title}-${index}`} className={`competitiveInsightCard ${insight.type || "steady"}`}>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
              </div>
            )) : (
              <div className="competitiveEmptyState compact">Insights will become smarter as you attempt more competitive tests.</div>
            )}
          </div>
        </div>
      </div>

      <div className="competitiveBottomGrid">
        <div className="competitivePanelCard">
          <div className="competitivePanelHeader">
            <div>
              <div className="competitivePanelTitle">Leaderboard</div>
              <p>See the top performers in your batch and compare your momentum with active competitors.</p>
            </div>
            <div className="competitivePanelChip">
              <EmojiEventsRoundedIcon fontSize="small" />
              Batch ranking
            </div>
          </div>

          <div className="competitiveLeaderboardWrap">
            <table className="competitiveLeaderboardTable">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Average Score</th>
                  <th>Tests Attempted</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? leaderboard.map((entry) => (
                  <tr key={`${entry.userName}-${entry.rank}`} className={entry.isCurrentUser ? "currentUser" : ""}>
                    <td>#{entry.rank}</td>
                    <td>{entry.fullName || entry.userName}</td>
                    <td>{entry.scoreDisplay}</td>
                    <td>{entry.testsAttempted}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4">
                      <div className="competitiveEmptyState compact">Leaderboard data will appear once competitive attempts are recorded.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="competitivePanelCard">
          <div className="competitivePanelHeader">
            <div>
              <div className="competitivePanelTitle">Rank Snapshot</div>
              <p>Your current position, average score, and progress toward stronger exam performance.</p>
            </div>
          </div>

          {userRank ? (
            <div className="competitiveRankSnapshot">
              <div className="competitiveSnapshotRow">
                <span>Current rank</span>
                <strong>#{userRank.rank || 0}</strong>
              </div>
              <div className="competitiveSnapshotRow">
                <span>Average score</span>
                <strong>{userRank.scoreDisplay || "0%"}</strong>
              </div>
              <div className="competitiveSnapshotRow">
                <span>Tests attempted</span>
                <strong>{userRank.testsAttempted ?? 0}</strong>
              </div>

              <div className="competitiveProgressGroup">
                <div className="competitiveProgressLabel">
                  <span>Accuracy progress</span>
                  <span>{stats.accuracy ?? 0}%</span>
                </div>
                <div className="competitiveProgressTrack">
                  <div className="competitiveProgressFill teal" style={{ width: `${Math.min(stats.accuracy ?? 0, 100)}%` }}></div>
                </div>
              </div>

              <div className="competitiveProgressGroup">
                <div className="competitiveProgressLabel">
                  <span>Leaderboard standing</span>
                  <span>Top {stats.topPercent ?? 0}%</span>
                </div>
                <div className="competitiveProgressTrack">
                  <div className="competitiveProgressFill orange" style={{ width: `${Math.max(0, 100 - (stats.topPercent ?? 0))}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="competitiveEmptyState compact">Your competitive rank snapshot will appear after the first scored attempt.</div>
          )}
        </div>
      </div>

      <div className="competitiveFooterActions">
        <button type="button" className="competitivePrimaryAction" onClick={() => handleTargetNavigation("examsTests")}>
          Start Test Practice
          <ArrowForwardRoundedIcon fontSize="small" />
        </button>
        <button type="button" className="competitiveSecondaryAction large" onClick={() => handleTargetNavigation("resultsPerformance")}>
          Review Results
        </button>
      </div>
    </div>
  );
}
