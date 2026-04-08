import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import BeatLoader from 'react-spinners/BeatLoader';
import jsPDF from 'jspdf';
import './UserResults.css';
import { BACKEND_BASEURL } from '../../helper';

const chartPalette = ['#219EBC', '#FF9933', '#2A9D8F', '#577590', '#E9C46A', '#3CB9D4'];

const summaryCards = [
  {
    key: 'totalTestsAttempted',
    label: 'Total Tests Attempted',
    icon: FactCheckRoundedIcon,
    accent: 'teal',
    format: (value) => value ?? 0,
  },
  {
    key: 'averageScore',
    label: 'Average Score',
    icon: TrendingUpRoundedIcon,
    accent: 'orange',
    format: (value) => `${value ?? 0}%`,
  },
  {
    key: 'highestScore',
    label: 'Highest Score',
    icon: EmojiEventsRoundedIcon,
    accent: 'blue',
    format: (value) => value || '0/0',
  },
  {
    key: 'weakestSubject',
    label: 'Weakest Subject',
    icon: ScienceRoundedIcon,
    accent: 'gold',
    format: (value) => value || 'N/A',
  },
];

const sortOptions = {
  date_desc: (a, b) => new Date(b.dateAttempted || 0) - new Date(a.dateAttempted || 0),
  date_asc: (a, b) => new Date(a.dateAttempted || 0) - new Date(b.dateAttempted || 0),
  score_desc: (a, b) => b.percentage - a.percentage,
  score_asc: (a, b) => a.percentage - b.percentage,
};

const strengthEmoji = {
  Strong: 'Strong',
  Average: 'Average',
  Weak: 'Weak',
};

const getStatusClass = (status) => (status || '').toLowerCase();

const buildLineChartPath = (points, width, height) => {
  if (!points.length) {
    return '';
  }

  const maxValue = Math.max(...points.map((point) => point.percentage), 100);
  const stepX = points.length === 1 ? 0 : width / (points.length - 1);

  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.percentage / maxValue) * height;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');
};

const exportPerformanceReport = (summary, results, subjects) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text('Results & Performance Report', 14, y);
  y += 12;

  doc.setFontSize(12);
  doc.text(`Total Tests Attempted: ${summary.totalTestsAttempted || 0}`, 14, y);
  y += 8;
  doc.text(`Average Score: ${summary.averageScore || 0}%`, 14, y);
  y += 8;
  doc.text(`Highest Score: ${summary.highestScore || '0/0'}`, 14, y);
  y += 8;
  doc.text(`Weakest Subject: ${summary.weakestSubject || 'N/A'}`, 14, y);
  y += 12;

  doc.setFontSize(14);
  doc.text('Recent Results', 14, y);
  y += 8;
  doc.setFontSize(11);

  results.slice(0, 8).forEach((result) => {
    doc.text(`${result.testName} | ${result.subject} | ${result.scoreDisplay} | ${result.percentage}% | ${result.status}`, 14, y);
    y += 7;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text('Subject Performance', 14, y);
  y += 8;
  doc.setFontSize(11);

  subjects.forEach((subject) => {
    doc.text(`${subject.subject} | Avg ${subject.averageScore}% | ${subject.totalTestsAttempted} tests | ${subject.strength}`, 14, y);
    y += 7;
  });

  doc.save('results-performance-report.pdf');
};

export default function UserResults() {
  const token = localStorage.getItem('token');
  const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse') || 'null');
  const studentDetails = JSON.parse(localStorage.getItem('studentDetails') || 'null');
  const username = userLoginResponse?.username;
  const studentBatchId = studentDetails?.batchId ?? userLoginResponse?.batchId ?? 1;

  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({});
  const [scoreTrend, setScoreTrend] = useState([]);
  const [insights, setInsights] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

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

    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const [resultsResponse, performanceResponse, subjectsResponse] = await Promise.all([
          axios.get(`${BACKEND_BASEURL}/student/results`, {
            params: { batchId: studentBatchId, userName: username, testType: 'LIVE_TEST' },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/performance`, {
            params: { batchId: studentBatchId, userName: username, testType: 'LIVE_TEST' },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          axios.get(`${BACKEND_BASEURL}/student/subjects-performance`, {
            params: { batchId: studentBatchId, userName: username, testType: 'LIVE_TEST' },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (!mounted) {
          return;
        }

        setResults(resultsResponse.data?.results || []);
        setSummary(performanceResponse.data?.summary || {});
        setScoreTrend(performanceResponse.data?.scoreTrend || []);
        setInsights(performanceResponse.data?.insights || []);
        setSubjects(subjectsResponse.data?.subjects || []);
      } catch (error) {
        console.error('Error fetching performance data', error);
        if (mounted) {
          setResults([]);
          setSummary({});
          setScoreTrend([]);
          setInsights([]);
          setSubjects([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPerformanceData();

    return () => {
      mounted = false;
    };
  }, [studentBatchId, token, username]);

  const subjectOptions = useMemo(
    () => ['ALL', ...new Set(results.map((result) => result.subject).filter(Boolean))],
    [results]
  );

  const filteredResults = useMemo(() => {
    const filtered = results.filter((result) => {
      const subjectMatches = subjectFilter === 'ALL' || result.subject === subjectFilter;
      const statusMatches = statusFilter === 'ALL' || result.status === statusFilter;
      return subjectMatches && statusMatches;
    });

    return [...filtered].sort(sortOptions[sortBy]);
  }, [results, sortBy, statusFilter, subjectFilter]);

  const linePath = useMemo(() => buildLineChartPath(scoreTrend, 520, 180), [scoreTrend]);
  const linePoints = useMemo(() => {
    if (!scoreTrend.length) {
      return [];
    }

    const width = 520;
    const height = 180;
    const maxValue = Math.max(...scoreTrend.map((point) => point.percentage), 100);
    const stepX = scoreTrend.length === 1 ? 0 : width / (scoreTrend.length - 1);

    return scoreTrend.map((point, index) => ({
      ...point,
      x: index * stepX,
      y: height - (point.percentage / maxValue) * height,
    }));
  }, [scoreTrend]);

  if (loading) {
    return (
      <div className='resultsPerformancePage loadingState'>
        <BeatLoader color="#219EBC" />
      </div>
    );
  }

  return (
    <div className='resultsPerformancePage'>
      <div className='resultsHeroCard'>
        <div>
          <div className='resultsEyebrow'>Performance Insights</div>
          <h1>Results & Performance</h1>
          <p>Track test scores, spot subject trends, and understand where your performance is rising or needs more attention.</p>
        </div>

        <button
          type='button'
          className='resultsDownloadButton'
          onClick={() => exportPerformanceReport(summary, filteredResults, subjects)}
        >
          <DownloadRoundedIcon fontSize='small' />
          Download Report
        </button>
      </div>

      <div className='resultsSummaryGrid'>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className={`resultsSummaryCard ${card.accent}`}>
              <div className='resultsSummaryIcon'>
                <Icon fontSize='small' />
              </div>
              <div className='resultsSummaryBody'>
                <span>{card.label}</span>
                <strong>{card.format(summary[card.key])}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className='resultsAnalyticsGrid'>
        <div className='resultsPanelCard'>
          <div className='resultsPanelHeader'>
            <div>
              <div className='resultsPanelTitle'>Score Trend Over Time</div>
              <p>Watch improvement patterns across your recent attempts.</p>
            </div>
            <div className='resultsPanelChip'>
              <TimelineRoundedIcon fontSize='small' />
              Weekly / Monthly trend
            </div>
          </div>

          <div className='trendChartWrap'>
            {scoreTrend.length > 0 ? (
              <svg viewBox='0 0 520 220' className='trendChartSvg' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='scoreTrendStroke' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop offset='0%' stopColor='#219EBC' />
                    <stop offset='100%' stopColor='#FF9933' />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((line) => (
                  <line key={line} x1='0' y1={20 + line * 40} x2='520' y2={20 + line * 40} className='trendGridLine' />
                ))}
                <path d={linePath} className='trendLinePath' />
                {linePoints.map((point) => (
                  <g key={`${point.testName}-${point.label}`}>
                    <circle cx={point.x} cy={point.y} r='5.5' className='trendPoint' />
                    <text x={point.x} y='210' textAnchor='middle' className='trendAxisLabel'>{point.label}</text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className='resultsEmptyState'>Attempt a few tests to see your score trend here.</div>
            )}
          </div>
        </div>

        <div className='resultsPanelCard'>
          <div className='resultsPanelHeader'>
            <div>
              <div className='resultsPanelTitle'>Subject-wise Performance</div>
              <p>Compare your average percentage across subjects.</p>
            </div>
            <div className='resultsPanelChip'>
              <AutoGraphRoundedIcon fontSize='small' />
              Strongest to weakest
            </div>
          </div>

          <div className='subjectBarsList'>
            {subjects.length > 0 ? subjects.map((subject, index) => (
              <div key={subject.subject} className='subjectBarRow'>
                <div className='subjectBarLabels'>
                  <strong>{subject.subject}</strong>
                  <span>{subject.averageScore}%</span>
                </div>
                <div className='subjectBarTrack'>
                  <div
                    className='subjectBarFill'
                    style={{
                      width: `${subject.progressValue}%`,
                      background: `linear-gradient(90deg, ${chartPalette[index % chartPalette.length]} 0%, #FFB366 100%)`,
                    }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className='resultsEmptyState'>Subject analytics will appear after your first scored attempts.</div>
            )}
          </div>
        </div>
      </div>

      <div className='resultsLowerGrid'>
        <div className='resultsPanelCard'>
          <div className='resultsPanelHeader'>
            <div>
              <div className='resultsPanelTitle'>Detailed Results</div>
              <p>Sort and filter your attempt history by score, date, subject, or outcome.</p>
            </div>
          </div>

          <div className='resultsFiltersRow'>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'ALL' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value='ALL'>All Status</option>
              <option value='PASS'>Pass</option>
              <option value='FAIL'>Fail</option>
            </select>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value='date_desc'>Latest First</option>
              <option value='date_asc'>Oldest First</option>
              <option value='score_desc'>Highest Score</option>
              <option value='score_asc'>Lowest Score</option>
            </select>
          </div>

          <div className='resultsTableWrap'>
            <table className='resultsTable'>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Subject</th>
                  <th>Date Attempted</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? filteredResults.map((result) => (
                  <tr key={`${result.testId}-${result.dateAttempted || result.testName}`}>
                    <td>{result.testName}</td>
                    <td>{result.subject}</td>
                    <td>{result.dateLabel}</td>
                    <td>{result.scoreDisplay}</td>
                    <td>{result.percentage}%</td>
                    <td>
                      <span className={`resultsStatusBadge ${getStatusClass(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan='6'>
                      <div className='resultsEmptyState compact'>No result rows match your current filters.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='resultsRightRail'>
          <div className='resultsPanelCard'>
            <div className='resultsPanelHeader'>
              <div>
                <div className='resultsPanelTitle'>Subject Analysis</div>
                <p>See where you are strong and where you need more revision.</p>
              </div>
            </div>

            <div className='subjectAnalysisList'>
              {subjects.length > 0 ? subjects.map((subject) => (
                <div key={subject.subject} className='subjectAnalysisCard'>
                  <div className='subjectAnalysisTop'>
                    <strong>{subject.subject}</strong>
                    <span className={`subjectStrengthBadge ${subject.strength.toLowerCase()}`}>{strengthEmoji[subject.strength]}</span>
                  </div>
                  <div className='subjectAnalysisMeta'>
                    <span>Average score: {subject.averageScore}%</span>
                    <span>Tests attempted: {subject.totalTestsAttempted}</span>
                  </div>
                  <div className='subjectBarTrack slim'>
                    <div className='subjectBarFill' style={{ width: `${subject.progressValue}%` }}></div>
                  </div>
                </div>
              )) : (
                <div className='resultsEmptyState compact'>Subject analysis is empty until attempted tests are available.</div>
              )}
            </div>
          </div>

          <div className='resultsPanelCard'>
            <div className='resultsPanelHeader'>
              <div>
                <div className='resultsPanelTitle'>Insights & Feedback</div>
                <p>Simple smart suggestions based on your latest performance trend.</p>
              </div>
              <div className='resultsPanelChip'>
                <InsightsRoundedIcon fontSize='small' />
                Smart logic
              </div>
            </div>

            <div className='insightList'>
              {insights.length > 0 ? insights.map((insight, index) => (
                <div key={`${insight.title}-${index}`} className={`insightCard ${insight.type}`}>
                  <strong>{insight.title}</strong>
                  <p>{insight.message}</p>
                </div>
              )) : (
                <div className='resultsEmptyState compact'>Insights will appear after we have enough recent tests to compare.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
