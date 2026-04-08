import React, { useState } from 'react';
import './LiveTestSubjective.css';
import plus from '../../../../../../Assets/Images/plus.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from "react-toastify";

const LiveTestSubjective = () => {
  const [questions, setQuestions] = useState([]);

  const addNewQuestion = () => {
    // Check if all existing questions are filled out
    const isAllFilled = questions.every((q) => q.question && q.marks);

    if (isAllFilled || questions.length === 0) {
      setQuestions([
        ...questions,
        {
          id: questions.length + 1,
          question: '',
          marks: ''
        }
      ]);
    } else {
    //   alert('Please fill in all the existing questions before adding a new one.');
      toast.error("Complete all existing questions before adding a new one.");
    }
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleChange = (id, field, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  return (
    <div className='liveSubjectiveSection'>
    <ToastContainer />
      <div className='testConatinerDiv'>
        {questions.map((q, index) => (
          <div key={q.id} className='liveSubjectiveSubSection'>
            <div className='questionNumber'>
              <div>Question {index + 1}</div>
              <div style={{ color: 'red', cursor: 'pointer' }} onClick={() => deleteQuestion(q.id)}>
                <DeleteIcon />
              </div>
            </div>
            <div className='questionConatiner'>
              <div className='questionDiv1'>
                <div>
                  Question<span className='manadatoryField'>*</span>
                </div>
                <div>
                  <textarea
                    placeholder='Type Question'
                    className='inputTextField'
                    value={q.question}
                    onChange={(e) => handleChange(q.id, 'question', e.target.value)}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className='questionDiv1'>
                  <div>
                    Mark<span className='manadatoryField'>*</span>
                  </div>
                  <div>
                    <input
                      type='text'
                      placeholder='Type Marks'
                      className='marksInputField'
                      value={q.marks}
                      onChange={(e) => handleChange(q.id, 'marks', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <div className='testText' onClick={addNewQuestion}>
          <div>
            <img src={plus} alt='plus' />
          </div>
          <div>Add New Question</div>
        </div>
      </div>
    </div>
  );
};

export default LiveTestSubjective;
