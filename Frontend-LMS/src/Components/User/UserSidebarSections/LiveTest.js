import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
import './LiveTest.css';
import downloadImg from '../../../Assets/Images/DownloadImg.svg';
import { BACKEND_BASEURL } from '../../helper';

const EXAM_DRAFT_PREFIX = 'exam-session';

const getDraftKey = (username, testId) => `${EXAM_DRAFT_PREFIX}-${username}-${testId}`;

const getExamDraft = (username, testId) => {
  try {
    const saved = localStorage.getItem(getDraftKey(username, testId));
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

const normalizeStatus = (test, username) => {
  const draft = getExamDraft(username, test.testId);
  if (test.status === 'COMPLETED') {
    return 'Completed';
  }
  if (draft?.submittedAt) {
    return 'Completed';
  }
  if (draft && draft.answers && Object.keys(draft.answers).length > 0) {
    return 'In Progress';
  }
  return 'Not Started';
};

const getActionLabel = (status) => {
  if (status === 'Completed') {
    return 'View Result';
  }
  if (status === 'In Progress') {
    return 'Resume Test';
  }
  return 'Start Test';
};

const downloadExamSnapshot = (tests, selectedDate) => {
  const printable = tests
    .filter((test) => isSameDay(new Date(test.testStartDate), selectedDate))
    .map((test) => [
      test.testName,
      test.subject,
      test.durationLabel,
      test.difficulty,
      format(new Date(test.testStartDate), 'hh:mm a'),
    ].join(' | '))
    .join('\n');

  if (!printable) {
    return;
  }

  const blob = new Blob([`Exams & Tests Schedule\n${format(selectedDate, 'dd MMM yyyy')}\n\n${printable}`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exams-tests-${format(selectedDate, 'dd-MMM-yyyy')}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function LiveTest() {
  const token = localStorage.getItem('token');
  const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse') || 'null');
  const studentDetails = JSON.parse(localStorage.getItem('studentDetails') || 'null');
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const username = userLoginResponse?.username;
  const studentBatchId = studentDetails?.batchId ?? userLoginResponse?.batchId ?? 1;

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

    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/student/tests`, {
          params: {
            batchId: studentBatchId,
            userName: username,
            testType: 'LIVE_TEST',
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) {
          return;
        }

        const testCards = (response.data?.tests || []).map((test) => ({
          ...test,
          displayStatus: normalizeStatus(test, username),
        }));
        setTests(testCards);
      } catch (error) {
        console.error('Error fetching exam data', error);
        if (mounted) {
          setTests([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTests();
    window.addEventListener('focus', fetchTests);

    return () => {
      mounted = false;
      window.removeEventListener('focus', fetchTests);
    };
  }, [studentBatchId, token, username]);

  const selectedDateEvents = useMemo(
    () => tests.filter((test) => test.testStartDate && isSameDay(new Date(test.testStartDate), selectedDate)),
    [selectedDate, tests]
  );

  const tileContent = ({ date, view }) => {
    if (view !== 'month') {
      return null;
    }
    const hasEvent = tests.some((test) => test.testStartDate && isSameDay(new Date(test.testStartDate), date));
    return hasEvent ? <div className="event-dot"></div> : null;
  };

  const handlePrimaryAction = (test) => {
    if (test.displayStatus === 'Completed') {
      navigate('/ExamConfirmation', {
        state: {
          testId: test.testId,
          testName: test.testName,
          testPattern: test.testPattern || 'OBJECTIVE',
        },
      });
      return;
    }

    navigate('/ExamPaper', {
      state: {
        exam: test,
      },
    });
  };

  return (
    <div className='LiveExamDetailPage'>
      <div className='LiveXamHeaderSection'>Exams & Tests</div>
      <div className='BorderLine'></div>

      <div className='LiveTestCombineSection'>
        <div className='UpcomingSectionLeft'>
          <div className='upcomingHeaderContainer'>
            <div className='upcomingTestHeader'>Available Tests</div>
            <div className='liveTestSummaryPills'>
              <div className='summaryPill'>
                <strong>{tests.length}</strong>
                <span>Total</span>
              </div>
              <div className='summaryPill warning'>
                <strong>{tests.filter((test) => test.displayStatus === 'In Progress').length}</strong>
                <span>In Progress</span>
              </div>
              <div className='summaryPill success'>
                <strong>{tests.filter((test) => test.displayStatus === 'Completed').length}</strong>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loader-container">
              <BeatLoader color="#219EBC" />
            </div>
          ) : tests.length === 0 ? (
            <div className='emptyExamState'>
              <div className='emptyExamTitle'>No tests available right now</div>
              <div className='emptyExamText'>Your upcoming and attempted exams will appear here as soon as your batch schedule is published.</div>
            </div>
          ) : (
            <div className='examCardGrid'>
              {tests.map((test) => (
                <div key={test.testId} className='EventBox examCardShell'>
                  <div className='TestDetailBox examEnhancedCard'>
                    <div className='liveXamTimingDiv'>
                      <div className='XamTiming'>
                        <div className='liveTest'>{test.displayStatus}</div>
                        <div className="schedule-time">
                          {test.testStartDate ? format(new Date(test.testStartDate), 'dd MMM yyyy, hh:mm a') : 'Schedule pending'}
                        </div>
                      </div>
                      <button type="button" className='joinClassActiveButton' onClick={() => handlePrimaryAction(test)}>
                        {getActionLabel(test.displayStatus)}
                      </button>
                    </div>

                    <div className='ExamNameHeader'>{test.testName}</div>

                    <div className='examMetaGrid'>
                      <div className='examMetaTile'>
                        <span>Subject</span>
                        <strong>{test.subject || 'General'}</strong>
                      </div>
                      <div className='examMetaTile'>
                        <span>Questions</span>
                        <strong>{test.totalQuestions || 0}</strong>
                      </div>
                      <div className='examMetaTile'>
                        <span>Duration</span>
                        <strong>{test.durationLabel}</strong>
                      </div>
                      <div className='examMetaTile'>
                        <span>Difficulty</span>
                        <strong>{test.difficulty}</strong>
                      </div>
                    </div>

                    <div className='TestCouseBox'>
                      <div className='TestDetailsDiv'>
                        <div className="test-detail">By {test.teacherName || 'Faculty'}</div>
                        <div className="test-detail">{test.testPattern || 'OBJECTIVE'}</div>
                      </div>
                      <div className='QuestionDetailsDiv'>
                        <div className="test-detail">Total Marks: <span>{test.totalMarks || 0}</span></div>
                        <div className="test-detail">Passing Marks: <span>{test.passingMarks || 0}</span></div>
                      </div>
                      <div className='AdditionalDetails'>
                        {test.description || 'Timed assessment with auto-submit, progress tracking, and instant result review.'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='CalenderSectionRight'>
          <div className='upcomingHeaderContainerRight'>
            <div className='upcomingTestHeaderRight'>Schedule</div>
            <img
              src={downloadImg}
              alt="Download"
              onClick={() => downloadExamSnapshot(tests, selectedDate)}
            />
          </div>

          <div className='CalanderView'>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              tileContent={tileContent}
            />
          </div>

          <div className='BorderLine'></div>

          <div className='TodayEventsList'>
            <div className='TodayDate'>{format(selectedDate, 'dd MMM yyyy')}</div>
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div key={event.testId} className='EventListItem'>
                  <div className='LiveEventBox'>
                    <div className='BlueBox'>{event.displayStatus}</div>
                    <div className='EventListTime'>
                      {event.testStartDate ? format(new Date(event.testStartDate), 'hh:mm a') : '--'}
                    </div>
                  </div>
                  <div className='TestName-event'>{event.testName}</div>
                  <div className='TeacherSubjectEventBox'>
                    <div className="test-detail-event">{event.subject || 'General'}</div>
                    <div className="test-detail-event">{event.durationLabel}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className='noScheduleText'>No tests scheduled for this date.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
