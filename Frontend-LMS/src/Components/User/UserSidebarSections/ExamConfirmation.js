import React, { useEffect, useState } from 'react';
import './ExamConfirmation.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BeatLoader from 'react-spinners/BeatLoader';
import { toast } from 'react-toastify';
import Congrats from '../../../Assets/Images/CongratsPage.svg';
import { BACKEND_BASEURL } from '../../helper';

function ExamConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse') || 'null');

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);

  const testId = location.state?.testId;
  const testPattern = location.state?.testPattern || 'OBJECTIVE';
  const username = userLoginResponse?.username;

  useEffect(() => {
    if (!token) {
      delete axios.defaults.headers.common.Authorization;
      return;
    }
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  useEffect(() => {
    if (result || !testId || !username) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchResult = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_BASEURL}/student/result/${testId}`, {
          params: {
            userName: username,
            testPattern,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (mounted) {
          setResult(response.data?.result || null);
        }
      } catch (error) {
        console.error('Error fetching test result:', error);
        toast.error('Unable to load the test result right now.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      mounted = false;
    };
  }, [result, testId, testPattern, token, username]);

  if (loading) {
    return (
      <div className='ConfirmationPage loadingState'>
        <BeatLoader color="#219EBC" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className='ConfirmationPage'>
        <div className='resultShell empty'>
          <div className='resultTitle'>Result unavailable</div>
          <p>We could not find a submitted result for this test yet.</p>
          <button className='SubmitBtn' onClick={() => navigate('/userLandingPage')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className='ConfirmationPage'>
      <div className='resultShell'>
        <div className='resultHero'>
          <img className='resultIllustration' src={Congrats} alt="Result" />
          <div className='resultHeroContent'>
            <div className='resultTag'>Result Published</div>
            <div className='resultTitle'>{result.testName}</div>
            <div className='resultSubtitle'>{result.subject || 'General'} • {result.totalQuestions} questions reviewed</div>
          </div>
        </div>

        <div className='scoreGrid'>
          <div className='scoreCard primary'>
            <span>Score</span>
            <strong>{result.score}/{result.totalMarks}</strong>
          </div>
          <div className='scoreCard'>
            <span>Percentage</span>
            <strong>{Number(result.percentage || 0).toFixed(1)}%</strong>
          </div>
          <div className='scoreCard success'>
            <span>Correct</span>
            <strong>{result.correctAnswers}</strong>
          </div>
          <div className='scoreCard danger'>
            <span>Incorrect</span>
            <strong>{result.incorrectAnswers}</strong>
          </div>
        </div>

        <div className='resultReviewSection'>
          <div className='sectionHeading'>Answer Review</div>
          <div className='resultQuestionList'>
            {result.questions.map((question) => (
              <div
                key={question.questionId}
                className={`resultQuestionCard ${question.isCorrect ? 'correct' : (question.isAnswered ? 'incorrect' : 'unanswered')}`}
              >
                <div className='resultQuestionHeader'>
                  <strong>Q{question.questionNumber}. {question.question}</strong>
                  <span>{question.isCorrect ? 'Correct' : (question.isAnswered ? 'Incorrect' : 'Unanswered')}</span>
                </div>

                <div className='resultOptions'>
                  {question.options.map((option) => (
                    <div
                      key={option.answerId}
                      className={`resultOption ${option.isCorrect ? 'correct' : ''} ${option.isSelected ? 'selected' : ''}`}
                    >
                      <span>{option.answer}</span>
                      <div className='optionState'>
                        {option.isCorrect ? 'Correct answer' : ''}
                        {option.isSelected && !option.isCorrect ? 'Your answer' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='resultActions'>
          <button className='SecondaryButton' onClick={() => navigate('/userLandingPage')}>Back to Dashboard</button>
          <button className='SubmitBtn' onClick={() => navigate('/userLandingPage')}>View All Tests</button>
        </div>
      </div>
    </div>
  );
}

export default ExamConfirmation;
