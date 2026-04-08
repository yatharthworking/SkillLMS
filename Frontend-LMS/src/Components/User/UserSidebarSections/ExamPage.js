import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ExamPage.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BeatLoader from 'react-spinners/BeatLoader';
import { toast } from 'react-toastify';
import { BACKEND_BASEURL } from '../../helper';

const EXAM_DRAFT_PREFIX = 'exam-session';
const LOW_TIME_SECONDS = 5 * 60;

const getDraftKey = (username, testId) => `${EXAM_DRAFT_PREFIX}-${username}-${testId}`;

const readDraft = (username, testId) => {
  try {
    const raw = localStorage.getItem(getDraftKey(username, testId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const saveDraft = (username, testId, draft) => {
  localStorage.setItem(getDraftKey(username, testId), JSON.stringify(draft));
};

const clearDraft = (username, testId) => {
  localStorage.removeItem(getDraftKey(username, testId));
};

const formatTimer = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getDurationSeconds = (test) => {
  if (test?.timeLimit) {
    return Number(test.timeLimit) * 60;
  }

  if (test?.testStartDate && test?.testEndDate) {
    const diff = Math.floor((new Date(test.testEndDate).getTime() - new Date(test.testStartDate).getTime()) / 1000);
    return diff > 0 ? diff : 30 * 60;
  }

  return 30 * 60;
};

function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedExam = location.state?.exam;

  const token = localStorage.getItem('token');
  const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse') || 'null');
  const username = userLoginResponse?.username;

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLowTimeWarningShown, setHasLowTimeWarningShown] = useState(false);

  const questionsPanelRef = useRef(null);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (!token) {
      delete axios.defaults.headers.common.Authorization;
      return;
    }
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    if (!passedExam?.testId) {
      navigate('/userLandingPage');
      return;
    }

    let mounted = true;

    const fetchTest = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/student/test/${passedExam.testId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) {
          return;
        }

        const fetchedTest = response.data?.test;
        const draft = readDraft(username, passedExam.testId);
        const durationSeconds = getDurationSeconds(fetchedTest);
        const now = Date.now();

        let startedAt = draft?.startedAt || now;
        let expiresAt = draft?.expiresAt || (startedAt + durationSeconds * 1000);

        if (draft?.submittedAt) {
          clearDraft(username, passedExam.testId);
          startedAt = now;
          expiresAt = now + durationSeconds * 1000;
        }

        const initialRemainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

        setTest(fetchedTest);
        setAnswers(draft?.answers || {});
        setReviewFlags(draft?.reviewFlags || {});
        setCurrentQuestionIndex(draft?.currentQuestionIndex || 0);
        setRemainingSeconds(initialRemainingSeconds);

        saveDraft(username, passedExam.testId, {
          answers: draft?.answers || {},
          reviewFlags: draft?.reviewFlags || {},
          currentQuestionIndex: draft?.currentQuestionIndex || 0,
          startedAt,
          expiresAt,
        });
      } catch (error) {
        console.error('Error fetching test details:', error);
        toast.error('Unable to load the test right now.');
        navigate('/userLandingPage');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTest();

    return () => {
      mounted = false;
    };
  }, [navigate, passedExam?.testId, token, username]);

  useEffect(() => {
    if (!test || remainingSeconds === null || !username) {
      return undefined;
    }

    if (remainingSeconds <= 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleSubmit(true);
      return undefined;
    }

    const timerId = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous === null) {
          return previous;
        }
        return previous > 0 ? previous - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [remainingSeconds, test, username]);

  useEffect(() => {
    if (!test || !username) {
      return;
    }

    const draft = readDraft(username, test.testId);
    if (!draft) {
      return;
    }

    saveDraft(username, test.testId, {
      ...draft,
      answers,
      reviewFlags,
      currentQuestionIndex,
    });
  }, [answers, currentQuestionIndex, reviewFlags, test, username]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds <= LOW_TIME_SECONDS && !hasLowTimeWarningShown) {
      setHasLowTimeWarningShown(true);
      toast.warn('Only 5 minutes left. Your test will auto-submit when time runs out.');
    }
  }, [hasLowTimeWarningShown, remainingSeconds]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const reviewCount = useMemo(() => Object.values(reviewFlags).filter(Boolean).length, [reviewFlags]);
  const progressPercentage = test?.questions?.length
    ? Math.round((answeredCount / test.questions.length) * 100)
    : 0;

  const currentQuestion = test?.questions?.[currentQuestionIndex];

  const handleOptionChange = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const toggleReviewFlag = (questionId) => {
    setReviewFlags((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    if (questionsPanelRef.current) {
      questionsPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!test || !username || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const submissionData = test.questions.map((question) => ({
      courseId: passedExam?.materialId || test.materialId,
      testId: test.testId,
      questionId: question.questionId,
      submittedAnswerId: answers[question.questionId] || null,
      userName: username,
    }));

    try {
      await axios.post(`${BACKEND_BASEURL}/student/submit`, submissionData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      saveDraft(username, test.testId, {
        ...(readDraft(username, test.testId) || {}),
        submittedAt: new Date().toISOString(),
      });
      clearDraft(username, test.testId);

      if (isAutoSubmit) {
        toast.info('Time is up. Your test was submitted automatically.');
      } else {
        toast.success('Your test has been submitted.');
      }

      navigate('/ExamConfirmation', {
        state: {
          testId: test.testId,
          testName: test.testName,
          testPattern: test.testPattern || 'OBJECTIVE',
        },
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      hasAutoSubmitted.current = false;
      toast.error('We could not submit the test. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsSubmitDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className='ExamPageLoader'>
        <BeatLoader color="#219EBC" />
      </div>
    );
  }

  if (!test || !currentQuestion) {
    return null;
  }

  return (
    <>
      <div className='ExamPage'>
        <div className='HeadlineSection'>
          <div className='ExamHeadlineGroup'>
            <div className='ExamName'>{test.testName}</div>
            <div className='ExamMetaLine'>
              <span>{test.subject || 'General'}</span>
              <span>{test.totalQuestions} questions</span>
              <span>{test.durationLabel}</span>
            </div>
          </div>

          <div className='TimeandSubmitDiv'>
            <div className={`RemainingTime ${remainingSeconds <= LOW_TIME_SECONDS ? 'warning' : ''}`}>
              Time Left
              <span>{formatTimer(remainingSeconds || 0)}</span>
            </div>
            <button type='button' className='SubmitBtn' onClick={() => setIsSubmitDialogOpen(true)} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>

        <div className='ExamProgressCard'>
          <div className='ExamProgressHeader'>
            <div>
              <strong>{progressPercentage}% completed</strong>
              <p>{answeredCount} of {test.questions.length} questions answered</p>
            </div>
            <div className='ProgressLegend'>
              <span>Review: {reviewCount}</span>
              <span>Unanswered: {test.questions.length - answeredCount}</span>
            </div>
          </div>
          <div className='ExamProgressTrack'>
            <div className='ExamProgressFill' style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className='ExamPaperSection'>
          <div className='ExamPaper' ref={questionsPanelRef}>
            <div className='QuestionTopBar'>
              <div className='QuestionNumber'>Question {currentQuestionIndex + 1}</div>
              <button
                type='button'
                className={`ReviewToggle ${reviewFlags[currentQuestion.questionId] ? 'active' : ''}`}
                onClick={() => toggleReviewFlag(currentQuestion.questionId)}
              >
                {reviewFlags[currentQuestion.questionId] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            <div className='QuestionMarks'>(Marks: {currentQuestion.questionMark || 1})</div>
            <div className='QuestionDesc'>{currentQuestion.question}</div>

            <div className='OptionSection'>
              {currentQuestion.options.map((answer) => (
                <label
                  key={answer.answerId}
                  className={`OptionBox ${answers[currentQuestion.questionId] === answer.answerId ? 'selected' : ''}`}
                >
                  <input
                    type='radio'
                    name={`question-${currentQuestion.questionId}`}
                    value={answer.answerId}
                    checked={answers[currentQuestion.questionId] === answer.answerId}
                    onChange={() => handleOptionChange(currentQuestion.questionId, answer.answerId)}
                  />
                  <span>{answer.answer}</span>
                </label>
              ))}
            </div>

            <div className='QuestionControls'>
              <button
                type='button'
                className='SecondaryActionBtn'
                disabled={currentQuestionIndex === 0}
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
              >
                Previous
              </button>
              <button
                type='button'
                className='PrimaryActionBtn'
                onClick={() => {
                  if (currentQuestionIndex === test.questions.length - 1) {
                    setIsSubmitDialogOpen(true);
                  } else {
                    goToQuestion(currentQuestionIndex + 1);
                  }
                }}
              >
                {currentQuestionIndex === test.questions.length - 1 ? 'Review & Submit' : 'Next'}
              </button>
            </div>
          </div>

          <div className='QuestionNoSection'>
            <div className='LiveExamSection'>
              <div className='SummaryStatsGrid'>
                <div className='summaryStatCard'>
                  <div className='NoDiv summary answered'>{answeredCount}</div>
                  <div className='textDiv'>Answered</div>
                </div>
                <div className='summaryStatCard'>
                  <div className='NoDiv summary review'>{reviewCount}</div>
                  <div className='textDiv'>Review</div>
                </div>
                <div className='summaryStatCard'>
                  <div className='NoDiv summary notAnswered'>{test.questions.length - answeredCount}</div>
                  <div className='textDiv'>Not Answered</div>
                </div>
              </div>

              <div className='testBorder'></div>
              <div className='questionHeading'>Question Navigator</div>

              <div className='questionsDiv'>
                {test.questions.map((question, index) => {
                  const isAnswered = Boolean(answers[question.questionId]);
                  const isReview = Boolean(reviewFlags[question.questionId]);
                  return (
                    <button
                      type='button'
                      key={question.questionId}
                      className={`QuestionNavButton ${isAnswered ? 'answered' : ''} ${isReview ? 'review' : ''} ${currentQuestionIndex === index ? 'active' : ''}`}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSubmitDialogOpen && (
        <div className='DialogBackdrop'>
          <div className='Dialog'>
            <div className='DialogHead'>Submit Test?</div>
            <p>
              Answered: {answeredCount}/{test.questions.length}
              <br />
              Review marked: {reviewCount}
            </p>
            <div className='DialogActions'>
              <button className='DialogButtonCancel' onClick={() => setIsSubmitDialogOpen(false)} disabled={isSubmitting}>Go Back</button>
              <button className='DialogButtonSubmit' onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ExamPage;
