import React, { useState } from 'react';
import './AiTools.css';
import axios from 'axios';
import { BACKEND_BASEURL } from '../../helper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AiTools() {
  const [activeTool, setActiveTool] = useState(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  
  // Quiz State
  const [sourceContent, setSourceContent] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  // Concept Explainer State
  const [conceptTopic, setConceptTopic] = useState('');
  const [conceptExplanation, setConceptExplanation] = useState(null);

  // Chat Assistant State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'AI', text: 'Hello! I am your AI Teaching Assistant. How can I help you prepare today?' }
  ]);

  // Class Summary State
  const [classDate, setClassDate] = useState('');
  const [classNotes, setClassNotes] = useState('');
  const [classSummary, setClassSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState(null);

  const handleGenerateLessonPlan = async () => {
    if (!topic || !grade || !subject) {
      toast.error('Please fill in all fields (Topic, Grade, Subject)');
      return;
    }
    setLoading(true);
    setLessonPlan(null);
    
    // Mocking the backend response purely in the frontend
    setTimeout(() => {
      const mockPlan = {
        Engage: `Ask the class a challenging question about ${topic} to pique their interest.`,
        Explore: `Students will work in pairs to research basic concepts of ${topic}.`,
        Explain: `Teacher will present a detailed lecture on ${topic} connecting it to their research.`,
        Elaborate: `Students will apply what they learned about ${topic} to a real-world problem.`,
        Evaluate: `A short 5-question quiz to assess understanding of ${topic} in ${subject}.`
      };
      setLessonPlan(mockPlan);
      toast.success("Lesson plan generated successfully! (Mocked)");
      setLoading(false);
    }, 1500);
  };

  const handleGenerateQuiz = async () => {
    if (!sourceContent) {
      toast.error('Please provide source content to generate questions from.');
      return;
    }
    setLoading(true);
    setGeneratedQuiz(null);
    
    // Mocking the backend response purely in the frontend
    setTimeout(() => {
      const mockQuiz = [{
        question: `What is the main concept discussed in the provided text starting with: "${sourceContent.substring(0, 20)}..."?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option A"
      }];
      setGeneratedQuiz(mockQuiz);
      toast.success("Quiz generated successfully! (Mocked)");
      setLoading(false);
    }, 1500);
  };

  const handleGenerateConcept = () => {
    if (!conceptTopic) {
      toast.error('Please provide a concept to explain.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setConceptExplanation(`Here is a simple explanation for "${conceptTopic}" that you can share with your students: \n\n${conceptTopic} can be understood as... [Mocked AI generated explanation with analogies and key takeaways].`);
      toast.success("Concept explanation generated!");
      setLoading(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMessage = { sender: 'Teacher', text: chatMessage };
    setChatHistory([...chatHistory, newMessage]);
    setChatMessage('');
    setLoading(true);
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'AI', text: `I understand you are asking about "${newMessage.text}". Here are a few suggestions on how to approach this in your classroom... [Mocked AI response]` }]);
      setLoading(false);
    }, 1000);
  };

  const handleGenerateSummary = () => {
    if (!classDate || !classNotes) {
      toast.error('Please provide the class date and some rough notes to generate a summary.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setClassSummary(`Class Summary for ${classDate}:\n\n- Key Topics Covered: [Mocked]\n- Student Engagement: High\n- Follow-up Required: Review materials for next week.\n\nAI generated recap based on your notes.`);
      toast.success("Class summary generated!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className='aiToolsContainer' style={{ padding: '30px', width: '100%', height: '100%', overflowY: 'auto' }}>
      <h2>AI Tools (Beta)</h2>
      <p style={{ marginBottom: '30px', color: '#666' }}>Select an AI-powered tool to enhance your teaching workflow. (Backend capabilities coming soon!)</p>
      
      {!activeTool ? (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div 
            onClick={() => setActiveTool('lessonPlan')}
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', width: '320px', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>🌟 Lesson Plan Generator</h3>
            <span style={{ fontSize: '11px', backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>5E Model</span>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '16px', lineHeight: '1.5' }}>Generate structured lesson plans using the Engage, Explore, Explain, Elaborate, and Evaluate framework.</p>
          </div>

          <div 
            onClick={() => setActiveTool('quizGen')}
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', width: '320px', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>📝 AI Quiz Generator</h3>
            <span style={{ fontSize: '11px', backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Auto-Grade</span>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '16px', lineHeight: '1.5' }}>Automatically generate multiple-choice questions and quizzes from your course material.</p>
          </div>

          <div 
            onClick={() => setActiveTool('chatAsst')}
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', width: '320px', cursor: 'pointer', backgroundColor: '#f3e5f5', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#6a1b9a' }}>💬 AI Chat Assistant</h3>
            <span style={{ fontSize: '11px', backgroundColor: '#e1bee7', color: '#6a1b9a', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>24/7 Support</span>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '16px', lineHeight: '1.5' }}>Ask pedagogical questions, brainstorm activities, and get real-time advice from your AI co-teacher.</p>
          </div>

          <div 
            onClick={() => setActiveTool('conceptExp')}
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', width: '320px', cursor: 'pointer', backgroundColor: '#fff3e0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#e65100' }}>💡 Concept Explainer</h3>
            <span style={{ fontSize: '11px', backgroundColor: '#ffe0b2', color: '#e65100', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Simplify Topics</span>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '16px', lineHeight: '1.5' }}>Generate simple, analogy-based explanations for difficult concepts tailored to specific age groups.</p>
          </div>

          <div 
            onClick={() => setActiveTool('classSum')}
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', width: '320px', cursor: 'pointer', backgroundColor: '#e0f2f1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#00695c' }}>📊 Class Summary Gen.</h3>
            <span style={{ fontSize: '11px', backgroundColor: '#b2dfdb', color: '#00695c', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Post-Class</span>
            <p style={{ fontSize: '14px', color: '#555', marginTop: '16px', lineHeight: '1.5' }}>Turn your rough class notes into structured, shareable summaries and follow-up tasks.</p>
          </div>
        </div>
      ) : activeTool === 'lessonPlan' ? (
        <div className="toolWorkspace" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: '800px' }}>
          <button onClick={() => {setActiveTool(null); setLessonPlan(null);}} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', padding: 0 }}>&larr; Back to Tools</button>
          
          <h3 style={{ marginBottom: '20px' }}>Generate 5E Lesson Plan</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Grade / Class</label>
              <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g., 10th Grade" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Biology" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Topic</label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <button 
              onClick={handleGenerateLessonPlan} 
              disabled={loading}
              style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {loading ? 'Generating with AI...' : 'Generate Lesson Plan'}
            </button>
          </div>

          {lessonPlan && (
            <div className="lessonPlanResult" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4 style={{ color: '#2e7d32', marginBottom: '20px', fontSize: '18px' }}>Generated Plan</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#1565c0', fontSize: '16px', marginBottom: '8px' }}>1. Engage</h5>
                <p style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>{lessonPlan.Engage}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#1565c0', fontSize: '16px', marginBottom: '8px' }}>2. Explore</h5>
                <p style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>{lessonPlan.Explore}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#1565c0', fontSize: '16px', marginBottom: '8px' }}>3. Explain</h5>
                <p style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>{lessonPlan.Explain}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#1565c0', fontSize: '16px', marginBottom: '8px' }}>4. Elaborate</h5>
                <p style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>{lessonPlan.Elaborate}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ color: '#1565c0', fontSize: '16px', marginBottom: '8px' }}>5. Evaluate</h5>
                <p style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' }}>{lessonPlan.Evaluate}</p>
              </div>
            </div>
          )}
        </div>
      ) : activeTool === 'quizGen' ? (
        <div className="toolWorkspace" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: '800px' }}>
          <button onClick={() => {setActiveTool(null); setGeneratedQuiz(null);}} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', padding: 0 }}>&larr; Back to Tools</button>
          
          <h3 style={{ marginBottom: '20px' }}>Generate Interactive Quiz</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Source Content / Paragraph</label>
              <textarea 
                value={sourceContent} 
                onChange={e => setSourceContent(e.target.value)} 
                placeholder="Paste the chapter text, study material, or notes here..." 
                style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Number of Questions</label>
              <input type="number" value={questionCount} onChange={e => setQuestionCount(e.target.value)} min="1" max="20" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            
            <button 
              onClick={handleGenerateQuiz} 
              disabled={loading}
              style={{ backgroundColor: '#1976d2', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {loading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </div>

          {generatedQuiz && (
            <div className="quizResult" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ color: '#2e7d32', fontSize: '18px', margin: 0 }}>Generated Questions</h4>
                <button style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Save to Course</button>
              </div>
              
              {generatedQuiz.map((q, idx) => (
                <div key={idx} style={{ marginBottom: '25px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '15px', color: '#333' }}>Q{idx + 1}. {q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" disabled name={`q_${idx}`} id={`q_${idx}_opt_${optIdx}`} />
                        <label 
                          htmlFor={`q_${idx}_opt_${optIdx}`} 
                          style={{ 
                            fontSize: '14px', 
                            color: opt === q.answer ? '#2e7d32' : '#555',
                            fontWeight: opt === q.answer ? 'bold' : 'normal',
                            backgroundColor: opt === q.answer ? '#e8f5e9' : 'transparent',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                          {opt} {opt === q.answer && '✓ (Correct Answer)'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTool === 'conceptExp' ? (
        <div className="toolWorkspace" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: '800px' }}>
          <button onClick={() => {setActiveTool(null); setConceptExplanation(null);}} style={{ background: 'none', border: 'none', color: '#e65100', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', padding: 0 }}>&larr; Back to Tools</button>
          
          <h3 style={{ marginBottom: '20px', color: '#e65100' }}>Concept Explainer</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>What concept do you want to explain?</label>
              <input type="text" value={conceptTopic} onChange={e => setConceptTopic(e.target.value)} placeholder="e.g., Quantum Entanglement, Gravity, Democracy..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            
            <button 
              onClick={handleGenerateConcept} 
              disabled={loading}
              style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {loading ? 'Thinking...' : 'Generate Explanation'}
            </button>
          </div>

          {conceptExplanation && (
            <div className="resultArea" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4 style={{ color: '#e65100', marginBottom: '20px', fontSize: '18px' }}>Explanation</h4>
              <p style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', fontSize: '15px', lineHeight: '1.6', color: '#333' }}>{conceptExplanation}</p>
            </div>
          )}
        </div>
      ) : activeTool === 'chatAsst' ? (
        <div className="toolWorkspace" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div>
            <button onClick={() => {setActiveTool(null);}} style={{ background: 'none', border: 'none', color: '#6a1b9a', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', padding: 0 }}>&larr; Back to Tools</button>
            <h3 style={{ marginBottom: '20px', color: '#6a1b9a' }}>AI Chat Assistant</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'AI' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', textAlign: msg.sender === 'AI' ? 'left' : 'right' }}>{msg.sender}</div>
                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: msg.sender === 'AI' ? '#f3e5f5' : '#e3f2fd', color: '#333', fontSize: '14px', lineHeight: '1.5' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', color: '#888', fontStyle: 'italic', fontSize: '13px' }}>AI is typing...</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={chatMessage} 
              onChange={e => setChatMessage(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for teaching advice or activity ideas..." 
              style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #ccc', outline: 'none' }} 
            />
            <button 
              onClick={handleSendMessage} 
              disabled={loading || !chatMessage.trim()}
              style={{ backgroundColor: '#8e24aa', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '24px', cursor: (loading || !chatMessage) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              Send
            </button>
          </div>
        </div>
      ) : activeTool === 'classSum' ? (
        <div className="toolWorkspace" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0e0e0', maxWidth: '800px' }}>
          <button onClick={() => {setActiveTool(null); setClassSummary(null);}} style={{ background: 'none', border: 'none', color: '#00695c', cursor: 'pointer', marginBottom: '20px', fontSize: '14px', padding: 0 }}>&larr; Back to Tools</button>
          
          <h3 style={{ marginBottom: '20px', color: '#00695c' }}>Class Summary Generator</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Class Date / Title</label>
              <input type="text" value={classDate} onChange={e => setClassDate(e.target.value)} placeholder="e.g., Oct 24th - Advanced Physics" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Rough Notes</label>
              <textarea 
                value={classNotes} 
                onChange={e => setClassNotes(e.target.value)} 
                placeholder="Paste your unformatted, rough notes from the class here..." 
                style={{ width: '100%', height: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} 
              />
            </div>
            
            <button 
              onClick={handleGenerateSummary} 
              disabled={loading}
              style={{ backgroundColor: '#00897b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              {loading ? 'Synthesizing...' : 'Generate Summary'}
            </button>
          </div>

          {classSummary && (
            <div className="resultArea" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4 style={{ color: '#00695c', marginBottom: '20px', fontSize: '18px' }}>Structured Summary</h4>
              <pre style={{ backgroundColor: '#e0f2f1', padding: '20px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {classSummary}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
