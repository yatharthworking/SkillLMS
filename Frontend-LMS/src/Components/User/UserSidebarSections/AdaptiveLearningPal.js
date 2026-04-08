import React, { useEffect, useState } from "react";
import "./AdaptiveLearningPal.css";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BeatLoader from "react-spinners/BeatLoader";
import { BACKEND_BASEURL } from "../../helper";

const strengthToneMap = {
  Strong: "strong",
  Average: "average",
  Weak: "weak",
};

export default function AdaptiveLearningPal() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userLoginResponse = JSON.parse(localStorage.getItem("UserLoginResponse") || "null");
  const studentDetails = JSON.parse(localStorage.getItem("studentDetails") || "null");
  const username = userLoginResponse?.username;
  const studentBatchId = studentDetails?.batchId ?? userLoginResponse?.batchId ?? 1;

  const [recommendations, setRecommendations] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [nextBestAction, setNextBestAction] = useState(null);
  const [insights, setInsights] = useState([]);
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

    const fetchAdaptiveData = async () => {
      setLoading(true);
      try {
        const [recommendationResponse, weakTopicsResponse, learningPathResponse, performanceResponse] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/student/ai-recommendations`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/weak-topics`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/learning-path`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/performance`, {
            params: { batchId: studentBatchId, userName: username, testType: "LIVE_TEST" },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (!mounted) {
          return;
        }

        setRecommendations(recommendationResponse.data?.recommendations || []);
        setWeakTopics(weakTopicsResponse.data?.weakTopics || []);
        setLearningPath(learningPathResponse.data?.steps || []);
        setNextBestAction(learningPathResponse.data?.nextBestAction || null);
        setInsights(performanceResponse.data?.insights || []);
      } catch (error) {
        console.error("Error fetching adaptive learning data", error);
        if (mounted) {
          setRecommendations([]);
          setWeakTopics([]);
          setLearningPath([]);
          setNextBestAction(null);
          setInsights([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAdaptiveData();

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
      <div className="adaptiveLearningPage loadingState">
        <BeatLoader color="#219EBC" />
      </div>
    );
  }

  return (
    <div className="adaptiveLearningPage">
      <div className="adaptiveHeroCard">
        <div className="adaptiveHeroText">
          <span className="adaptiveEyebrow">AI Growth</span>
          <h1>Adaptive Learning (PAL)</h1>
          <p>
            Use AI-guided recommendations to resume learning, revise weak concepts, and follow a smarter
            revise-practice-retest cycle based on your recent performance.
          </p>
        </div>

        {nextBestAction && (
          <div className="adaptiveNextBestCard">
            <div className="adaptiveNextBestIcon">
              <FlagRoundedIcon fontSize="small" />
            </div>
            <div className="adaptiveNextBestBody">
              <span>Next Best Action</span>
              <strong>{nextBestAction.title}</strong>
              <p>{nextBestAction.description}</p>
              <button
                type="button"
                className="adaptivePrimaryAction"
                onClick={() => handleTargetNavigation(nextBestAction.actionTarget)}
              >
                {nextBestAction.actionLabel}
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="adaptiveSection">
        <div className="adaptiveSectionHeader">
          <div>
            <div className="adaptiveSectionTitle">AI-Based Recommendations</div>
            <p>Rule-based recommendations built from incomplete learning, weak scores, and recent test history.</p>
          </div>
        </div>

        <div className="adaptiveRecommendationGrid">
          {recommendations.length > 0 ? recommendations.map((recommendation) => (
            <div key={recommendation.id} className={`adaptiveRecommendationCard ${recommendation.priority}`}>
              <div className="adaptiveRecommendationTop">
                <div className="adaptiveRecommendationIcon">
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </div>
                <span className="adaptiveRecommendationTag">{recommendation.tag}</span>
              </div>

              <strong>{recommendation.title}</strong>
              <p>{recommendation.description}</p>

              <button
                type="button"
                className="adaptiveGhostAction"
                onClick={() => handleTargetNavigation(recommendation.actionTarget)}
              >
                {recommendation.actionLabel}
                <ArrowForwardRoundedIcon fontSize="small" />
              </button>
            </div>
          )) : (
            <div className="adaptiveEmptyState">Your personalised recommendations will appear here as you learn and attempt tests.</div>
          )}
        </div>
      </div>

      <div className="adaptiveAnalyticsGrid">
        <div className="adaptivePanelCard">
          <div className="adaptivePanelHeader">
            <div>
              <div className="adaptivePanelTitle">Weak Topic Identification</div>
              <p>These subjects and topic areas are derived from low scores, repeated mistakes, and recent attempts.</p>
            </div>
            <div className="adaptivePanelChip">
              <PsychologyRoundedIcon fontSize="small" />
              Confidence indicators
            </div>
          </div>

          <div className="adaptiveWeakTopicList">
            {weakTopics.length > 0 ? weakTopics.map((topic) => (
              <div key={`${topic.subject}-${topic.topicName}`} className={`adaptiveWeakTopicCard ${strengthToneMap[topic.confidenceLevel] || "average"}`}>
                <div className="adaptiveWeakTopicHeader">
                  <div>
                    <strong>{topic.topicName}</strong>
                    <span>{topic.subject}</span>
                  </div>
                  <div className={`adaptiveConfidenceBadge ${strengthToneMap[topic.confidenceLevel] || "average"}`}>
                    {topic.confidenceLevel}
                  </div>
                </div>
                <div className="adaptiveWeakTopicMeta">
                  <span>Average score: {topic.averageScore}%</span>
                  <span>Recent low-score tests: {topic.mistakeCount}</span>
                </div>
                <div className="adaptiveProgressTrack">
                  <div className="adaptiveProgressFill" style={{ width: `${topic.progressValue}%` }}></div>
                </div>
                <p>{topic.reason}</p>
              </div>
            )) : (
              <div className="adaptiveEmptyState compact">Weak topics will appear once you have enough performance history.</div>
            )}
          </div>
        </div>

        <div className="adaptivePanelCard">
          <div className="adaptivePanelHeader">
            <div>
              <div className="adaptivePanelTitle">Performance Insights</div>
              <p>Quick feedback comparing your recent performance trend with earlier attempts.</p>
            </div>
            <div className="adaptivePanelChip">
              <InsightsRoundedIcon fontSize="small" />
              Smart feedback
            </div>
          </div>

          <div className="adaptiveInsightList">
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={`${insight.title}-${index}`} className={`adaptiveInsightCard ${insight.type}`}>
                <strong>{insight.title}</strong>
                <p>{insight.message}</p>
              </div>
            )) : (
              <div className="adaptiveEmptyState compact">Insights will unlock after more quizzes and tests are completed.</div>
            )}
          </div>
        </div>
      </div>

      <div className="adaptiveSection">
        <div className="adaptiveSectionHeader">
          <div>
            <div className="adaptiveSectionTitle">Personalized Learning Path</div>
            <p>Follow a simple next-step flow that turns weak areas into focused improvement.</p>
          </div>
          <div className="adaptivePanelChip">
            <TimelineRoundedIcon fontSize="small" />
            Revise • Practice • Re-test
          </div>
        </div>

        <div className="adaptiveLearningPath">
          {learningPath.length > 0 ? learningPath.map((step) => (
            <div key={step.stepNumber} className="adaptivePathStep">
              <div className="adaptiveStepBadge">{step.stepNumber}</div>
              <div className="adaptiveStepBody">
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                <button
                  type="button"
                  className="adaptiveSecondaryAction"
                  onClick={() => handleTargetNavigation(step.actionTarget)}
                >
                  Open Step
                </button>
              </div>
            </div>
          )) : (
            <div className="adaptiveEmptyState">Your learning path will appear here once PAL has enough signals to personalise the journey.</div>
          )}
        </div>
      </div>

      <div className="adaptiveFooterActions">
        <button type="button" className="adaptivePrimaryAction" onClick={() => handleTargetNavigation("resultsPerformance")}>
          View Results & Performance
          <ArrowForwardRoundedIcon fontSize="small" />
        </button>
        <button type="button" className="adaptiveSecondaryAction large" onClick={() => handleTargetNavigation("myCourses")}>
          <PlayCircleRoundedIcon fontSize="small" />
          Continue Learning
        </button>
      </div>
    </div>
  );
}
