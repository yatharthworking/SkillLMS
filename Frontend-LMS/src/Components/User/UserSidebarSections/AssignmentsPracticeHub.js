import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssignmentsPracticeHub.css";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const ASSIGNMENT_STORAGE_KEY = "student-assignment-submissions";

const MOCK_ASSIGNMENTS = [
  { id: "a1", title: "Newton's Laws Worksheet", subject: "Physics", dueDate: "2026-03-28", description: "Solve the applied force and friction problems from chapter 3." },
  { id: "a2", title: "Periodic Trends Practice", subject: "Chemistry", dueDate: "2026-03-26", description: "Submit the completed periodic trends and valency sheet." },
  { id: "a3", title: "Algebra Revision Set", subject: "Mathematics", dueDate: "2026-03-24", description: "Complete the factorization and quadratic equation practice set." },
];

const MOCK_QUIZZES = [
  {
    id: "q1",
    title: "Physics Motion Checkpoint",
    questionsCount: 3,
    difficulty: "Medium",
    questions: [
      {
        id: "q1-1",
        prompt: "Which quantity changes when velocity changes with time?",
        options: ["Distance", "Acceleration", "Mass", "Density"],
        correctAnswer: "Acceleration",
        explanation: "Acceleration describes the rate of change of velocity with respect to time.",
      },
      {
        id: "q1-2",
        prompt: "The SI unit of force is:",
        options: ["Joule", "Newton", "Pascal", "Watt"],
        correctAnswer: "Newton",
        explanation: "Force is measured in Newtons in the SI system.",
      },
      {
        id: "q1-3",
        prompt: "A body at rest continues to remain at rest due to:",
        options: ["Momentum", "Inertia", "Power", "Velocity"],
        correctAnswer: "Inertia",
        explanation: "Inertia is the property that resists change in the state of motion.",
      },
    ],
  },
  {
    id: "q2",
    title: "Chemistry Bonding Drill",
    questionsCount: 2,
    difficulty: "Easy",
    questions: [
      {
        id: "q2-1",
        prompt: "Ionic bonding happens because of:",
        options: ["Electron sharing", "Electron transfer", "Proton exchange", "Heat absorption"],
        correctAnswer: "Electron transfer",
        explanation: "Ionic compounds are formed when electrons transfer from one atom to another.",
      },
      {
        id: "q2-2",
        prompt: "Which bond is strongest in diamond?",
        options: ["Hydrogen bond", "Ionic bond", "Covalent bond", "Metallic bond"],
        correctAnswer: "Covalent bond",
        explanation: "Diamond is a giant covalent structure with strong carbon-carbon bonds.",
      },
    ],
  },
];

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));

const formatTimestamp = (dateValue) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));

export default function AssignmentsPracticeHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [assignmentUploads, setAssignmentUploads] = useState({});
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFeedback, setSubmissionFeedback] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizTimer, setQuizTimer] = useState(0);
  const fileInputRefs = useRef({});

  useEffect(() => {
    try {
      const storedSubmissions = JSON.parse(localStorage.getItem(ASSIGNMENT_STORAGE_KEY) || "{}");
      setAssignmentUploads(storedSubmissions);
    } catch (error) {
      setAssignmentUploads({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignmentUploads));
  }, [assignmentUploads]);

  useEffect(() => {
    if (!submissionFeedback) return undefined;

    const timeoutId = window.setTimeout(() => setSubmissionFeedback(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [submissionFeedback]);

  useEffect(() => {
    if (!activeQuiz || quizResult) return undefined;

    const timerId = window.setInterval(() => {
      setQuizTimer((currentValue) => currentValue + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeQuiz, quizResult]);

  const enrichedAssignments = useMemo(
    () =>
      MOCK_ASSIGNMENTS.map((assignment) => {
        const submission = assignmentUploads[assignment.id];
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        let status = "Pending";

        if (submission?.submittedAt) {
          status = new Date(submission.submittedAt) > dueDate ? "Late" : "Submitted";
        } else if (now > dueDate) {
          status = "Late";
        }

        return {
          ...assignment,
          status,
          submission,
        };
      }),
    [assignmentUploads]
  );

  const filteredAssignments = enrichedAssignments.filter((assignment) => {
    if (assignmentFilter === "all") return true;
    return assignment.status.toLowerCase() === assignmentFilter;
  });

  const assignmentStats = {
    pending: enrichedAssignments.filter((assignment) => assignment.status === "Pending").length,
    submitted: enrichedAssignments.filter((assignment) => assignment.status === "Submitted").length,
    late: enrichedAssignments.filter((assignment) => assignment.status === "Late").length,
  };

  const handleFileSelection = (assignmentId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAssignmentUploads((currentValue) => ({
      ...currentValue,
      [assignmentId]: {
        ...(currentValue[assignmentId] || {}),
        stagedFileName: file.name,
        stagedFileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      },
    }));
  };

  const handleSubmitAssignment = (assignment) => {
    const stagedSubmission = assignmentUploads[assignment.id];
    if (!stagedSubmission?.stagedFileName) return;

    const submittedAt = new Date().toISOString();
    setAssignmentUploads((currentValue) => ({
      ...currentValue,
      [assignment.id]: {
        fileName: stagedSubmission.stagedFileName,
        fileSize: stagedSubmission.stagedFileSize,
        submittedAt,
      },
    }));
    setSubmissionFeedback(`${assignment.title} submitted successfully.`);
    if (selectedAssignment?.id === assignment.id) {
      setSelectedAssignment({
        ...assignment,
        submission: {
          fileName: stagedSubmission.stagedFileName,
          fileSize: stagedSubmission.stagedFileSize,
          submittedAt,
        },
      });
    }
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizTimer(0);
    setActiveTab("quiz");
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    const results = activeQuiz.questions.map((question) => {
      const selectedAnswer = quizAnswers[question.id];
      const isCorrect = selectedAnswer === question.correctAnswer;
      return {
        ...question,
        selectedAnswer,
        isCorrect,
      };
    });

    const score = results.filter((result) => result.isCorrect).length;
    setQuizResult({ score, total: activeQuiz.questions.length, results, completedAt: new Date().toISOString() });
  };

  const answeredQuestionsCount = activeQuiz
    ? activeQuiz.questions.filter((question) => Boolean(quizAnswers[question.id])).length
    : 0;

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="assignmentsPracticeHub">
      <div className="assignmentsHero">
        <button type="button" className="assignmentsBackButton" onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon fontSize="small" />
          <span>Back</span>
        </button>
        <span className="assignmentsEyebrow">Practice Zone</span>
        <h1>Assignments & Practice</h1>
        <p>Manage submissions, keep track of due work, and practice with quick quizzes that give you instant feedback.</p>
      </div>

      <div className="assignmentsOverviewGrid">
        <button type="button" className="assignmentsOverviewCard interactiveCard" onClick={() => {
          setActiveTab("assignments");
          setAssignmentFilter("pending");
        }}>
          <AssignmentRoundedIcon fontSize="small" />
          <strong>{assignmentStats.pending}</strong>
          <span>Pending assignments</span>
        </button>
        <button type="button" className="assignmentsOverviewCard interactiveCard" onClick={() => {
          setActiveTab("assignments");
          setAssignmentFilter("submitted");
        }}>
          <UploadFileRoundedIcon fontSize="small" />
          <strong>{assignmentStats.submitted}</strong>
          <span>Submitted work</span>
        </button>
        <button type="button" className="assignmentsOverviewCard interactiveCard" onClick={() => {
          setActiveTab("quiz");
          setQuizResult(null);
        }}>
          <QuizRoundedIcon fontSize="small" />
          <strong>{MOCK_QUIZZES.length}</strong>
          <span>Practice quizzes</span>
        </button>
        <button type="button" className="assignmentsOverviewCard interactiveCard" onClick={() => {
          setActiveTab("quiz");
        }}>
          <InsightsRoundedIcon fontSize="small" />
          <strong>{quizResult ? `${quizResult.score}/${quizResult.total}` : "Ready"}</strong>
          <span>Latest quiz result</span>
        </button>
      </div>

      <div className="assignmentsTabs">
        <button type="button" className={activeTab === "assignments" ? "active" : ""} onClick={() => setActiveTab("assignments")}>
          Assignments
        </button>
        <button type="button" className={activeTab === "quiz" ? "active" : ""} onClick={() => setActiveTab("quiz")}>
          Practice Quiz
        </button>
      </div>

      {activeTab === "assignments" ? (
        <>
          <div className="assignmentsFilters">
            {["all", "pending", "submitted", "late"].map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                className={assignmentFilter === filterKey ? "active" : ""}
                onClick={() => setAssignmentFilter(filterKey)}
              >
                {filterKey === "all" ? "All" : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
              </button>
            ))}
          </div>

          {submissionFeedback ? <div className="assignmentFeedbackBar">{submissionFeedback}</div> : null}

          <div className="assignmentsGrid">
            {filteredAssignments.length === 0 ? (
              <div className="assignmentsEmptyState">No assignments available for this filter.</div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="assignmentCard">
                  <div className="assignmentCardHeader">
                    <div>
                      <div className="assignmentTitle">{assignment.title}</div>
                      <div className="assignmentMeta">{assignment.subject} • Due {formatDate(assignment.dueDate)}</div>
                    </div>
                    <span className={`assignmentStatus ${assignment.status.toLowerCase()}`}>{assignment.status}</span>
                  </div>

                  <div className="assignmentDescription">{assignment.description}</div>

                  {assignment.submission?.submittedAt ? (
                    <div className="assignmentSubmissionMeta">
                      Submitted on {formatTimestamp(assignment.submission.submittedAt)} • {assignment.submission.fileName}
                    </div>
                  ) : assignment.submission?.stagedFileName ? (
                    <div className="assignmentSubmissionMeta">
                      Ready to submit: {assignment.submission.stagedFileName} ({assignment.submission.stagedFileSize})
                    </div>
                  ) : null}

                  <div className="assignmentActions">
                    <button type="button" className="assignmentGhostButton" onClick={() => setSelectedAssignment(assignment)}>
                      View Assignment
                    </button>

                    <input
                      ref={(element) => {
                        fileInputRefs.current[assignment.id] = element;
                      }}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="assignmentFileInput"
                      onChange={(event) => handleFileSelection(assignment.id, event)}
                    />

                    <button
                      type="button"
                      className="assignmentSecondaryButton"
                      onClick={() => fileInputRefs.current[assignment.id]?.click()}
                    >
                      {assignment.submission?.submittedAt ? "Re-upload" : "Upload"}
                    </button>

                    <button
                      type="button"
                      className="assignmentPrimaryButton"
                      onClick={() => handleSubmitAssignment(assignment)}
                      disabled={!assignmentUploads[assignment.id]?.stagedFileName}
                    >
                      Submit Assignment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="quizSectionShell">
          <div className="quizListPanel">
            <div className="quizSectionTitle">Available practice quizzes</div>
            <div className="quizCards">
              {MOCK_QUIZZES.map((quiz) => (
                <div key={quiz.id} className="quizCard">
                  <div className="quizTitle">{quiz.title}</div>
                  <div className="quizMeta">{quiz.questionsCount} questions • {quiz.difficulty}</div>
                  <button type="button" className="assignmentPrimaryButton" onClick={() => handleStartQuiz(quiz)}>
                    {activeQuiz?.id === quiz.id ? "Continue Quiz" : "Start Quiz"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="quizWorkspace">
            {activeQuiz ? (
              <>
                <div className="quizWorkspaceHeader">
                  <div>
                    <div className="quizSectionTitle">{activeQuiz.title}</div>
                    <div className="quizMeta">{activeQuiz.questions.length} questions • Instant feedback enabled</div>
                  </div>
                  <div className="quizHeaderActions">
                    <div className="quizTimerBadge">Time {formatTimer(quizTimer)}</div>
                    <div className="quizProgressBadge">{answeredQuestionsCount}/{activeQuiz.questions.length} answered</div>
                    <button type="button" className="assignmentGhostButton" onClick={() => handleStartQuiz(activeQuiz)}>
                      Retry Quiz
                    </button>
                  </div>
                </div>

                <div className="quizQuestions">
                  {activeQuiz.questions.map((question, index) => (
                    <div key={question.id} className="quizQuestionCard">
                      <div className="quizQuestionPrompt">{index + 1}. {question.prompt}</div>
                      <div className="quizOptions">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className={`quizOption ${quizAnswers[question.id] === option ? "selected" : ""} ${
                              quizResult
                                ? option === question.correctAnswer
                                  ? "correct"
                                  : quizAnswers[question.id] === option
                                  ? "incorrect"
                                  : ""
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              checked={quizAnswers[question.id] === option}
                              disabled={Boolean(quizResult)}
                              onChange={() => setQuizAnswers((currentValue) => ({ ...currentValue, [question.id]: option }))}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="quizActions">
                  <button
                    type="button"
                    className="assignmentPrimaryButton"
                    onClick={handleSubmitQuiz}
                    disabled={answeredQuestionsCount === 0 || Boolean(quizResult)}
                  >
                    Submit Quiz
                  </button>
                </div>

                {quizResult ? (
                  <div className="quizResultPanel">
                    <div className="quizScoreBanner">Score: {quizResult.score}/{quizResult.total}</div>
                    {quizResult.results.map((result) => (
                      <div key={result.id} className={`quizFeedbackCard ${result.isCorrect ? "correct" : "incorrect"}`}>
                        <div className="quizFeedbackTitle">
                          <span>{result.isCorrect ? "Correct" : "Incorrect"}</span>
                          <strong>{result.prompt}</strong>
                        </div>
                        <div className="quizFeedbackMeta">
                          Your answer: {result.selectedAnswer || "Not answered"} • Correct answer: {result.correctAnswer}
                        </div>
                        <div className="quizFeedbackExplanation">{result.explanation}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="assignmentsEmptyState">Start a quiz to practice concepts and get instant feedback here.</div>
            )}
          </div>
        </div>
      )}

      {selectedAssignment ? (
        <div className="assignmentModalShell">
          <div className="assignmentModalBackdrop" onClick={() => setSelectedAssignment(null)}></div>
          <div className="assignmentModalCard">
            <div className="assignmentModalHeader">
              <div>
                <div className="assignmentTitle">{selectedAssignment.title}</div>
                <div className="assignmentMeta">{selectedAssignment.subject} • Due {formatDate(selectedAssignment.dueDate)}</div>
              </div>
              <button type="button" className="assignmentGhostButton" onClick={() => setSelectedAssignment(null)}>
                Close
              </button>
            </div>
            <div className="assignmentDescription">{selectedAssignment.description}</div>
            <div className="assignmentModalMeta">
              Status: <span className={`assignmentStatus ${selectedAssignment.status?.toLowerCase() || "pending"}`}>{selectedAssignment.status || "Pending"}</span>
            </div>
            {selectedAssignment.submission?.submittedAt ? (
              <div className="assignmentSubmissionMeta">
                Submitted on {formatTimestamp(selectedAssignment.submission.submittedAt)} • {selectedAssignment.submission.fileName}
              </div>
            ) : assignmentUploads[selectedAssignment.id]?.stagedFileName ? (
              <div className="assignmentSubmissionMeta">
                Ready to submit: {assignmentUploads[selectedAssignment.id].stagedFileName} ({assignmentUploads[selectedAssignment.id].stagedFileSize})
              </div>
            ) : null}
            <div className="assignmentActions">
              <button
                type="button"
                className="assignmentSecondaryButton"
                onClick={() => fileInputRefs.current[selectedAssignment.id]?.click()}
              >
                {selectedAssignment.submission?.submittedAt ? "Re-upload" : "Upload"}
              </button>
              <button
                type="button"
                className="assignmentPrimaryButton"
                onClick={() => handleSubmitAssignment(selectedAssignment)}
                disabled={!assignmentUploads[selectedAssignment.id]?.stagedFileName}
              >
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
