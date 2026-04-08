import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../../../../Navbar/Navbar';
import AdminSidebar from '../../../../AdminSidebar/AdminSidebar';
import { BACKEND_BASEURL } from "../../../../../helper.js";
import LeftArrow from '../../../../../../Assets/Images/leftArrow.svg';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LiveObjectiveTest() {

    const token = localStorage.getItem("token");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const adminLoginResponse = localStorage.getItem('AdminLoginResponse');
    const user = JSON.parse(adminLoginResponse);

    const navigate = useNavigate();
    const location = useLocation();
    const testDetails  = location.state.testDetails;
    const batchData  = location.state.batchData;

    const [selectedBox, setSelectedBox] = useState(() => {
        return location.state && location.state.selectedBox ? location.state.selectedBox : 'masters';
    });
    
    const [selectedSubBox, setSelectedSubBox] = useState(() => {
        return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : 'batch';
    });

    const handleGoTOUserCourses = () => {
        navigate(-1);
    };

    // State for questions and options
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
    const [questionMark, setQuestionMark] = useState('');

    // Handler to add an option
    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    // Handler to update option text
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // Handler to add a question
    const handleAddQuestion = () => {
        if (questionText && correctOptionIndex !== null && options[correctOptionIndex] && questionMark) {
            const newQuestion = {
                questionText,
                options,
                correctOptionIndex,
                questionMark: parseFloat(questionMark),
            };
            setQuestions([...questions, newQuestion]);
            setQuestionText('');
            setOptions(['']);
            setCorrectOptionIndex(null);
            setQuestionMark('');
        } else {
            alert('Please complete the question, select the correct option, and specify the mark.');
        }
    };

    // Handler to remove a question
    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    // Calculate total marks
    const totalMarks = questions.reduce((sum, question) => sum + question.questionMark, 0);

    // Handler to publish the test
    const handlePublish = async () => {
        const payload = {
            userName:user.username,
            testId: testDetails.testId,
            testName: testDetails.testName,
            testStartDate: testDetails.testStartDate,
            testEndDate: testDetails.testEndDate,
            description: testDetails.description,
            totalQuestions: questions.length,
            totalMarks: totalMarks,
            testType: testDetails.testType,
            testPattern: testDetails.testPattern,
            isPublished: true,
            isActive: true,
            subject: testDetails.subject,
            materialId: testDetails.materialId,
            batchId: testDetails.batchId,
            testQuestions: questions.map((question) => ({
                question: question.questionText,
                questionMark: question.questionMark,
                correctAnswer: {
                    testAnswersDB: {
                        answer: question.options[question.correctOptionIndex],
                        correctOption: true
                    }
                },
                testAnswers: question.options.map((option, index) => ({
                    answer: option,
                    correctOption: index === question.correctOptionIndex
                }))
            }))
        };

        try {
            await axios.post(`${BACKEND_BASEURL}/admin/updateTests`, payload);
            toast.success("Test published successfully!");
            setTimeout(() => {
                navigate(`/managebatch`, { state: { selectedBatch: location.state.batchData } });
            }, 3000); // 3-second delay
        } catch (error) {
            toast.error("Failed to publish the test.");
            console.error(error);
        }
    };

    return (
        <>
        <div className='Page'>
            <div><Navbar /></div>
            <div className='adminLandingPageContainer'>
            <div className='adminSidebarSection'>
                <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
            </div>
            <div className='PageContent'>
                <div className='webinarDetailHeaderSection'>
                    <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
                    <div className='webinarBreadcrumSection'>
                        <span className='webinarbreadcrumNotSelectedTxt'>Batches</span>
                        <span className='breadcrumSeperator'>/</span> <span className='webinarbreadcrumNotSelectedTxt'>Manage Batch</span>
                        <span className='breadcrumSeperator'>/</span>
                        <span className='webinarbreadcrumSelectedTxt'>Manage Live Test</span>
                    </div>
                </div>
                <div className='borderLineBlue'></div>
                <div className='TestDetailContainer'>
                <div className='HeadlineTest'>
                    <div className='HeaderText'>{testDetails.testName}</div>
                    <div className='RightText'>
                    <span>You will not be able to <br /> edit once published</span>
                    <div className='addButtonDiv'>
                        <div variant="contained" color="primary" onClick={handlePublish}>PUBLISH</div>
                    </div>
                    </div>
                </div>  
                <div className='SubHeadlineTextDetails'>
                    <div className='SubTestdetails'>
                    <div className='RowLine'><div className='RowText'>Teacher Name</div><div>{testDetails?.teacherName}</div></div>
                    <div className='RowLine'><div className='RowText'>Starts On</div><div>{new Date(testDetails?.testStartDate).toLocaleString()}</div></div>
                    <div className='RowLine'><div className='RowText'>Ends On</div><div>{new Date(testDetails?.testEndDate).toLocaleString()}</div></div>
                    <div className='RowLine'><div className='RowText'>Status</div><div style={{color:'orange'}}>Created</div></div> 
                    </div>
                    <div className='descBox'>
                        <div className='RowLine'><div className='RowText'>Description:</div><div> {testDetails.description}</div></div>
                    </div>
                    <div className='MarkBox'>
                        <div className='MarksContent'>
                            <div>Total Questions : <b>{questions.length}</b></div> 
                            <div>Total Marks : <b>{totalMarks}</b></div>
                        </div>
                    </div>
                </div>
                </div>
                <div className='QuestionPage'>
                <div>
                <Button variant="outlined" onClick={handleAddQuestion}>Add Question</Button>
                </div>
                <div className='Quesname'>
                    <label> Type Question Here :</label>
                    <textarea
                        style={{ width: '700px', height: '80px' }}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />
                    <div>
                    {options.map((option, index) => (
                        <div key={index}>
                            options:
                            <input
                                className='OptionText'
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                            />
                            <input
                                type="checkbox"
                                checked={correctOptionIndex === index}
                                onChange={() => setCorrectOptionIndex(index)}
                            /> {/* correct option will be checked */}
                        </div>
                    ))}
                    <button onClick={handleAddOption}>Add Option</button>
                    </div>
                    <div>
                      <label>Question Mark :</label>
                      <input
                        type="number"
                        className='smallInput'
                        value={questionMark}
                        onChange={(e) => setQuestionMark(e.target.value)}
                      />
                    </div>
                </div>
                </div>
                <div className='QuestionAddedPreview'>
                {questions.map((question, qIndex) => (
                    <div key={qIndex} className='QustionPart'>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            {question.questionText} (Mark: {question.questionMark})
                            <DeleteIcon
                                variant="outlined"
                                style={{ color: 'red', cursor: 'pointer', marginLeft: '10px' }}
                                onClick={() => handleRemoveQuestion(qIndex)}
                            />
                        </div>
                        <div className='ShowAddedOptions'>
                            {question.options.map((option, oIndex) => (
                                <div key={oIndex}>
                                    <span>{option}</span>
                                    <input type="checkbox" checked={question.correctOptionIndex === oIndex} readOnly />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                </div>
            </div>  
            </div>
        </div>
        <ToastContainer />
        </>
    )
}

export default LiveObjectiveTest;
