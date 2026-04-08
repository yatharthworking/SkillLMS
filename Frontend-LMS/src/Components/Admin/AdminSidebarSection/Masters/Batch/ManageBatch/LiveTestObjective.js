    import React, { useState } from 'react';
    import './LiveTestObjective.css';
    import DeleteIcon from '@mui/icons-material/Delete';
    import plus from '../../../../../../Assets/Images/plus.svg';
    import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
    import CheckCircleIcon from '@mui/icons-material/CheckCircle';
    import { ToastContainer, toast } from "react-toastify";

    const LiveTestObjective = () => {
        const [questions, setQuestions] = useState([]);

        const addNewQuestion = () => {
            const isAllFilled = questions.every((q) => q.questionText && q.marks);
            if (isAllFilled || questions.length === 0) {
                setQuestions([...questions, {
                    questionType: 'MCQ',
                    questionText: '',
                    marks: '',
                    answers: Array(4).fill(''),
                    correctAnswer: ''
                }]);
            } else {
                toast.error("Complete all existing questions before adding a new one.");
            }
        };

        const handleQuestionTypeChange = (index, type) => {
            const newQuestions = [...questions];
            newQuestions[index].questionType = type;
            newQuestions[index].answers = type === 'MCQ' ? Array(4).fill('') : Array(2).fill('');
            newQuestions[index].correctAnswer = '';
            setQuestions(newQuestions);
        };

        const handleAnswerChange = (qIndex, aIndex, value) => {
            const newQuestions = [...questions];
            newQuestions[qIndex].answers[aIndex] = value;
            setQuestions(newQuestions);
        };

        const handleCorrectAnswerChange = (qIndex, aIndex) => {
            const newQuestions = [...questions];
            newQuestions[qIndex].correctAnswer = aIndex;
            setQuestions(newQuestions);
        };

        const handleDeleteQuestion = (index) => {
            const newQuestions = questions.filter((_, qIndex) => qIndex !== index);
            setQuestions(newQuestions);
        };

        const deleteQuestion = (id) => {
            setQuestions(questions.filter((q) => q.id !== id));
          };

        return (
            <div className='liveObjectiveSection'>
            <ToastContainer />
                <div className='testObjConatinerDiv'>
                    {questions.map((question, qIndex) => (
                        <div className='liveObjectiveSubSection' key={qIndex}>
                            <div className='questionNumber'>
                                <div>Question {qIndex + 1}</div>
                                <div style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDeleteQuestion(qIndex)}>
                                    <DeleteIcon onClick={() => deleteQuestion(question.id)} />
                                </div>
                            </div>
                            <div className='fullConatiner'>
                                <div className='objQuestionConatiner'>
                                    <div className='objQuestionDiv1'>
                                        <div>
                                            Question<span className='manadatoryField'>*</span>
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder='Type Question'
                                                className='objInputTextField'
                                                value={question.questionText}
                                                onChange={(e) => {
                                                    const newQuestions = [...questions];
                                                    newQuestions[qIndex].questionText = e.target.value;
                                                    setQuestions(newQuestions);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ width: '20%' }}>
                                        <div className='objQuestionDiv1'>
                                            <div>
                                                Mark<span className='manadatoryField'>*</span>
                                            </div>
                                            <div>
                                                <input
                                                    type='text'
                                                    placeholder='Type Marks'
                                                    className='marksInputField'
                                                    value={question.marks}
                                                    onChange={(e) => {
                                                        const newQuestions = [...questions];
                                                        newQuestions[qIndex].marks = e.target.value;
                                                        setQuestions(newQuestions);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div>
                                        Question Type<span className='manadatoryField'>*</span>
                                    </div>
                                    <div className='objQuestionTypeContainer'>
                                        <div
                                            className={`objQuestionTypeButton ${question.questionType === 'MCQ' ? 'selected' : ''}`}
                                            onClick={() => handleQuestionTypeChange(qIndex, 'MCQ')}
                                        >
                                            <span className='objQuestionTypeDesc'>MCQ</span>
                                            <span className='objQuestionTypeDescription'>4 options with 1 correct answer</span>
                                        </div>
                                        <div
                                            className={`objQuestionTypeButton ${question.questionType === 'True/False' ? 'selected' : ''}`}
                                            onClick={() => handleQuestionTypeChange(qIndex, 'True/False')}
                                        >
                                            <span className='objQuestionTypeDesc'>True/False</span>
                                            <span className='objQuestionTypeDescription'>2 default options true & false</span>
                                        </div>
                                    </div>

                                    {question.questionType === 'MCQ' && (
                                        <div className='objQuizOptionDesc'>
                                            <div className='objOptionDesc'>
                                                {['A', 'B', 'C', 'D'].map((label, aIndex) => (
                                                    <div className='objcorrectAnswerDiv' key={aIndex}>
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
                                                            <span>{label}.<span className='mandatoryField'>*</span></span>
                                                            <span className='objInputAnswer'>
                                                                <input
                                                                    className='courseInputBox'
                                                                    style={{ width: '90%' }}
                                                                    placeholder={`Answer ${label}`}
                                                                    value={question.answers[aIndex]}
                                                                    onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                                                />
                                                            </span>
                                                        </div>
                                                        <div onClick={() => handleCorrectAnswerChange(qIndex, aIndex)} style={{ cursor: 'pointer' }}>
                                                            {question.correctAnswer === aIndex ? <CheckCircleIcon style={{ color: '#219EBC' }} /> : <RadioButtonUncheckedIcon style={{ color: 'grey' }} />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {question.questionType === 'True/False' && (
                                        <div className='objQuizOptionDesc'>
                                            <div className='objOptionDesc'>
                                                {['True', 'False'].map((label, aIndex) => (
                                                    <div className='objcorrectAnswerDiv' key={aIndex}>
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
                                                            <span>{aIndex === 0 ? 'A' : 'B'}.<span className='mandatoryField'>*</span></span>
                                                            <span className='inputAnswer'>{label}</span>
                                                        </div>
                                                        <div onClick={() => handleCorrectAnswerChange(qIndex, aIndex)} style={{ cursor: 'pointer' }}>
                                                            {question.correctAnswer === aIndex ? <CheckCircleIcon style={{ color: '#219EBC' }} /> : <RadioButtonUncheckedIcon style={{ color: 'grey' }} />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <div className='testText' onClick={addNewQuestion} style={{ cursor: 'pointer' }}>
                        <div>
                            <img src={plus} alt='plus' />
                        </div>
                        <div>Add New Question</div>
                    </div>
                </div>
            </div>
        );
    }

    export default LiveTestObjective;
