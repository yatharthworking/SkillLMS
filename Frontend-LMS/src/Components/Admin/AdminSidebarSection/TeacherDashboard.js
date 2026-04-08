import React, { useState, useEffect } from 'react';
import './TeacherDashboard.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8901/soul/teacher';

const TeacherDashboard = ({ setSelectedBox }) => {
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        activeClasses: 0,
        pendingAssignments: 0,
        upcomingClasses: 0
    });
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState(null);
    const [teacherName, setTeacherName] = useState('Teacher');

    useEffect(() => {
        // Retrieve teacher details from multiple possible localStorage keys
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const adminDetail = JSON.parse(localStorage.getItem('adminDetails'));
        const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse'));
        
        const details = adminDetail || userLoginResponse || storedUser;
        const id = details?.userDetailsId || 1;
        const name = details?.firstName || details?.name || 'Teacher';
        
        setTeacherId(id);
        setTeacherName(name);
        fetchDashboardData(id);
    }, []);

    const fetchDashboardData = async (id) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const [metricsRes, scheduleRes] = await Promise.all([
                axios.get(`${BASE_URL}/dashboard/metrics?teacherId=${id}`, { headers: authHeaders }),
                axios.get(`${BASE_URL}/dashboard/schedule?teacherId=${id}`, { headers: authHeaders })
            ]);

            if (metricsRes.data.status) {
                setMetrics(metricsRes.data);
            }
            if (scheduleRes.data.status) {
                setSchedule(scheduleRes.data.schedule);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="teacher-dashboard">
            <header className="dashboard-header">
                <h1>Welcome Back, {teacherName}!</h1>
                <p>Monitor your classes and student performance at a glance.</p>
            </header>

            {/* Section 1: Overview Cards */}
            <div className="metrics-grid">
                <MetricCard icon="👥" title="Total Students" value={metrics.totalStudents} color="#E0E7FF" textColor="#4338CA" />
                <MetricCard icon="🏫" title="Active Classes" value={metrics.activeClasses} color="#DCFCE7" textColor="#166534" />
                <MetricCard icon="📝" title="Pending Reviews" value={metrics.pendingAssignments} color="#FEF3C7" textColor="#92400E" />
                <MetricCard icon="📅" title="Upcoming Sessions" value={metrics.upcomingClasses} color="#FCE7F3" textColor="#9D174D" />
            </div>

            <div className="dashboard-content">
                <div className="main-col">
                    {/* Section 2: Today's Schedule */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Today's Live Sessions</h2>
                            <button className="text-btn">View All</button>
                        </div>
                        <div className="schedule-list">
                            {schedule.length > 0 ? schedule.map(item => (
                                <div key={item.id} className="schedule-item">
                                    <div className="schedule-time">{formatTime(item.time)}</div>
                                    <div className="schedule-details">
                                        <span className="subject">{item.subject}</span>
                                        <span className="batch">{item.batch}</span>
                                    </div>
                                    <button className="join-btn" onClick={() => window.open(item.joinUrl, '_blank')}>Join Now</button>
                                </div>
                            )) : (
                                <p className="empty-state">No sessions scheduled for today.</p>
                            )}
                        </div>
                    </section>

                    {/* Section 4: Assignments & Tests */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Recent Submissions</h2>
                        </div>
                        <div className="submissions-list">
                            <SubmissionItem name="Rahul Sharma" assignment="Mid-term Physics" time="2h ago" />
                            <SubmissionItem name="Priya Patel" assignment="Lab Report #4" time="5h ago" />
                            <SubmissionItem name="Amit Kumar" assignment="Python Basics Quiz" time="Yesterday" />
                        </div>
                    </section>
                </div>

                <div className="side-col">
                    {/* Section 3: Student Performance Snapshot */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Top Performers</h2>
                        </div>
                        <div className="performance-list">
                            <PerformanceItem name="Sneha Gupta" score="98%" level="high" />
                            <PerformanceItem name="Vikas Rai" score="95%" level="high" />
                            <PerformanceItem name="Ananya Singh" score="92%" level="high" />
                        </div>
                    </section>

                    {/* Section 5: AI Insights */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>AI Insights ✨</h2>
                        </div>
                        <div className="insight-card">
                            <p><strong>Heads up!</strong> Calculus attendance is down by 15% this week. Consider an interactive quiz to boost engagement.</p>
                        </div>
                        <div className="insight-card">
                            <p><strong>Great job!</strong> Batch A-02 has completed 90% of assignments on time. Reward them with a bonus credit?</p>
                        </div>
                    </section>

                    {/* Section 7: Quick Actions */}
                    <section className="dashboard-section">
                        <div className="section-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="actions-grid">
                            <button className="action-btn" onClick={() => setSelectedBox('assignments')}><i>➕</i><span>Create Test</span></button>
                            <button className="action-btn"><i>📤</i><span>Upload Material</span></button>
                            <button className="action-btn"><i>📢</i><span>Announcement</span></button>
                            <button className="action-btn"><i>📞</i><span>Live Class</span></button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ icon, title, value, color, textColor }) => (
    <div className="metric-card">
        <div className="metric-icon" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div className="metric-info">
            <h3>{title}</h3>
            <span className="value" style={{ color: textColor }}>{value}</span>
        </div>
    </div>
);

const PerformanceItem = ({ name, score, level }) => (
    <div className="performance-item">
        <div className="student-avatar" />
        <div className="student-info">
            <div className="student-name">{name}</div>
        </div>
        <div className={`score-badge score-${level}`}>{score}</div>
    </div>
);

const SubmissionItem = ({ name, assignment, time }) => (
    <div className="performance-item">
        <div className="student-info">
            <div className="student-name">{name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{assignment}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{time}</div>
    </div>
);

const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    // Logic for time formatting if needed
    return timeStr;
};

export default TeacherDashboard;
