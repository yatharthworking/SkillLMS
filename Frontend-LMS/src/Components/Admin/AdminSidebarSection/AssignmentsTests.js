import React, { useState, useEffect } from 'react';
import './AssignmentsTests.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8901/soul/teacher';

const AssignmentsTests = () => {
    const [activeTab, setActiveTab] = useState('my-assessments');
    const [teacherId, setTeacherId] = useState(null);
    const [batches, setBatches] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ batchId: '', type: '', status: '' });

    // Assessment Form State
    const [form, setForm] = useState({
        testName: '',
        description: '',
        testType: 'QUIZ',
        testPattern: 'OBJECTIVE',
        batchId: '',
        testStartDate: '',
        testEndDate: '',
        timeLimit: '',
        totalMarks: '',
        passingMarks: '',
        questions: []
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const adminDetail = JSON.parse(localStorage.getItem('adminDetails'));
        const userLoginResponse = JSON.parse(localStorage.getItem('UserLoginResponse'));
        const details = adminDetail || userLoginResponse || storedUser;
        const id = details?.userDetailsId || 1;
        setTeacherId(id);
        
        fetchBatches(id);
        fetchAssessments(id);
    }, []);

    const fetchBatches = async (id) => {
        try {
            const res = await axios.get(`${BASE_URL}/dashboard/batches?teacherId=${id}`);
            if (res.data.status) setBatches(res.data.batches);
        } catch (err) {
            console.error("Error fetching batches:", err);
        }
    };

    const fetchAssessments = async (id, batchId = '') => {
        setLoading(true);
        try {
            const url = `${BASE_URL}/assessment/list?teacherId=${id}${batchId ? `&batchId=${batchId}` : ''}`;
            const res = await axios.get(url);
            if (res.data.status) setAssessments(res.data.assessments);
        } catch (err) {
            console.error("Error fetching assessments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssessment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                testQuestions: form.questions.map(q => ({
                    question: q.text,
                    questionType: q.type,
                    questionMark: q.marks,
                    correctAnswer: { answer: q.correctAnswer },
                    testAnswers: q.options.map(o => ({ answer: o }))
                }))
            };
            const res = await axios.post(`${BASE_URL}/assessment/create?teacherId=${teacherId}`, payload);
            if (res.data.status) {
                alert("Assessment created successfully!");
                setActiveTab('my-assessments');
                fetchAssessments(teacherId);
            }
        } catch (err) {
            alert("Error creating assessment: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setForm({
            ...form,
            questions: [...form.questions, { text: '', type: 'MCQ', marks: 1, options: ['', '', '', ''], correctAnswer: '' }]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...form.questions];
        newQuestions[index][field] = value;
        setForm({ ...form, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...form.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setForm({ ...form, questions: newQuestions });
    };

    return (
        <div className="assignments-tests">
            <header className="module-header">
                <div>
                    <h1>Assignments & Tests</h1>
                    <p>Create and manage continuous assessments for your batches.</p>
                </div>
                <div className="tab-navigation">
                    <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Create New</button>
                    <button className={activeTab === 'my-assessments' ? 'active' : ''} onClick={() => setActiveTab('my-assessments')}>My Assessments</button>
                    <button className={activeTab === 'submissions' ? 'active' : ''} onClick={() => setActiveTab('submissions')}>Submissions</button>
                    <button className={activeTab === 'results' ? 'active' : ''} onClick={() => setActiveTab('results')}>Results & Analytics</button>
                </div>
            </header>

            <div className="module-content">
                {activeTab === 'create' && (
                    <section className="create-assessment">
                        <form onSubmit={handleCreateAssessment} className="assessment-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input type="text" value={form.testName} onChange={e => setForm({...form, testName: e.target.value})} required placeholder="e.g. Mid-term Quiz" />
                                </div>
                                <div className="form-group">
                                    <label>Batch</label>
                                    <select value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})} required>
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={form.testType} onChange={e => setForm({...form, testType: e.target.value})}>
                                        <option value="QUIZ">Quiz</option>
                                        <option value="ASSIGNMENT">Assignment</option>
                                        <option value="EXAM">Exam</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pattern</label>
                                    <select value={form.testPattern} onChange={e => setForm({...form, testPattern: e.target.value})}>
                                        <option value="OBJECTIVE">Objective (MCQ)</option>
                                        <option value="SUBJECTIVE">Subjective</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Start Date & Time</label>
                                    <input type="datetime-local" value={form.testStartDate} onChange={e => setForm({...form, testStartDate: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>End Date & Time</label>
                                    <input type="datetime-local" value={form.testEndDate} onChange={e => setForm({...form, testEndDate: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Time Limit (Minutes)</label>
                                    <input type="number" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Total Marks</label>
                                    <input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} required />
                                </div>
                            </div>

                            <div className="questions-section">
                                <h3>Questions</h3>
                                {form.questions.map((q, idx) => (
                                    <div key={idx} className="question-card">
                                        <div className="q-header">
                                            <span>Question {idx + 1}</span>
                                            <button type="button" onClick={() => {
                                                const nq = [...form.questions];
                                                nq.splice(idx, 1);
                                                setForm({...form, questions: nq});
                                            }} className="delete-btn">Remove</button>
                                        </div>
                                        <textarea value={q.text} onChange={e => updateQuestion(idx, 'text', e.target.value)} placeholder="Enter question text..." required />
                                        {form.testPattern === 'OBJECTIVE' && (
                                            <div className="options-grid">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="option-group">
                                                        <input type="radio" name={`correct-${idx}`} checked={q.correctAnswer === opt} onChange={() => updateQuestion(idx, 'correctAnswer', opt)} />
                                                        <input type="text" value={opt} onChange={e => updateOption(idx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} required />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addQuestion} className="add-q-btn">+ Add Question</button>
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading} className="submit-btn">{loading ? 'Publishing...' : 'Publish Assessment'}</button>
                            </div>
                        </form>
                    </section>
                )}

                {activeTab === 'my-assessments' && (
                    <section className="my-assessments">
                        <div className="filters-bar">
                            <select onChange={e => fetchAssessments(teacherId, e.target.value)}>
                                <option value="">All Batches</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="assessments-grid">
                            {assessments.length > 0 ? assessments.map(item => (
                                <div key={item.testId} className="assessment-card">
                                    <div className="card-badge">{item.testType}</div>
                                    <h3>{item.testName}</h3>
                                    <div className="card-info">
                                        <span>📅 {new Date(item.testStartDate).toLocaleDateString()}</span>
                                        <span>⏰ {item.timeLimit} mins</span>
                                        <span>📊 {item.totalMarks} Marks</span>
                                    </div>
                                    <div className="card-footer">
                                        <span className={`status-dot ${item.isPublished ? 'published' : 'draft'}`}></span>
                                        <span>{item.isPublished ? 'Published' : 'Draft'}</span>
                                        <button className="view-btn">View Details</button>
                                    </div>
                                </div>
                            )) : <p className="empty-state">No assessments found. Create one to get started!</p>}
                        </div>
                    </section>
                )}

                {activeTab === 'submissions' && (
                    <section className="submissions">
                        <div className="submissions-table-container">
                             <table className="submissions-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Assessment</th>
                                        <th>Submitted On</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Rahul Sharma</td>
                                        <td>Physics Unit 1</td>
                                        <td>23 Mar, 10:15 AM</td>
                                        <td><span className="status-pending">Needs Review</span></td>
                                        <td><button className="grade-btn">Grade</button></td>
                                    </tr>
                                    <tr>
                                        <td>Priya Patel</td>
                                        <td>Physics Unit 1</td>
                                        <td>23 Mar, 11:20 AM</td>
                                        <td><span className="status-completed">Graded</span></td>
                                        <td><button className="view-btn">View</button></td>
                                    </tr>
                                </tbody>
                             </table>
                        </div>
                    </section>
                )}

                {activeTab === 'results' && (
                    <section className="results">
                        <div className="analytics-placeholder">
                             <h2>Class Performance Overview</h2>
                             <div className="mock-chart">
                                <div className="bar" style={{height: '60%'}}><span>Batch A</span></div>
                                <div className="bar" style={{height: '85%'}}><span>Batch B</span></div>
                                <div className="bar" style={{height: '45%'}}><span>Batch C</span></div>
                                <div className="bar" style={{height: '70%'}}><span>Batch D</span></div>
                             </div>
                             <p>Visual analytics will appear here as students complete assessments.</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default AssignmentsTests;
