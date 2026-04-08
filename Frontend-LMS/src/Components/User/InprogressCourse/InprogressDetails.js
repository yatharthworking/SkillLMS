import React, { useState, useEffect } from "react";
import "../InprogressCourse/InprogressDetails.css";
import Navbar from "../../Navbar/Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import UserSidebar from "../UserSideBar/UserSidebar";
import LeftArrow from "../../../Assets/Images/leftArrow.svg";
import Lesson from "../../../Assets/Images/lesson.svg";
import Video from "../../../Assets/Images/recordedVideo.svg";
import PdfFile from "../../../Assets/Images/pdfFile.svg";
import QuizLogo from "../../../Assets/Images/quizLogo.svg";
import axios from "axios";
import { BACKEND_BASEURL } from '../../helper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Modal component for displaying content
const Modal = ({ contentType, content, onClose }) => {
  console.log("content",content)
  let displayedContent;
  if (contentType === "video") {
    displayedContent = (
      <video controls controlsList="nodownload" style={{ width: "100%" }}>
        <source src={content.content} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else if (contentType === "PDF") {
    displayedContent = (
      <iframe
       src={`data:application/pdf;base64,${content.content}`}
        title="pdf-document"
        width="100%"
        height="600px"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  } else {
    displayedContent = <p>No content to display.</p>;
  }
  console.log('displayedContent:', displayedContent);

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        {displayedContent}
      </div>
    </div>
  );
};

  const token = localStorage.getItem("token");

  //Commonly Setting the Bearer Token here so dont need to set header token in each API call.
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;



export default function InprogressDetails() {
  const [selectedBox, setSelectedBox] = useState("course");
  const [selectedSubBox, setSelectedSubBox] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;
  const [quizQuestionIdsList,setQuizQuestionIdsList] = useState([]);
  // const [selectedAnswersIdsList,setSelectedAnswersIdsList] = useState([]);
  const [correctAnswersIdsList,setCorrectAnswersIdsList] = useState([]);

  const [modalContent, setModalContent] = useState(null); // State for modal content
  const [modalContentType, setModalContentType] = useState(""); // State for modal content type
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility


  // Function to open modal with content
  const openModal = (contentType, content) => {
    setModalContentType(contentType);
    setModalContent(content);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setModalContent(null);
    setModalContentType("");
    setIsModalOpen(false);
  };

  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userLoginResponse = localStorage.getItem('UserLoginResponse');
    if (userLoginResponse) {
      const user = JSON.parse(userLoginResponse);
      setUserEmail(user.username);
      const extractedUserName = user.username.split('@')[0];
      setUserName(extractedUserName);
    }
  }, []);

  useEffect(() => {
    const quizQuestionIds = [];
    course?.chaptersDBList?.forEach(chapter => {
      chapter.quizDB?.forEach(quiz => {
        quiz?.quizQuestions?.forEach(question => {
          quizQuestionIds.push(question.quizQuestionId);
        });
      });
    });
    setQuizQuestionIdsList(quizQuestionIds);
  }, [course]);

  const defaultCompleted = course?.enrolledChaptersDBList
    ?.filter(chapter => chapter.isCompleted)
    ?.map(chapter => chapter.enrolledChapterId) || [];
    
  const [completedChapters, setCompletedChapters] = useState(defaultCompleted);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctAnswerMessages, setCorrectAnswerMessages] = useState({});
  // const [results, setResults] = useState({});

  // const correctAnswers = Object.entries(answers).map(([quizQuestionId, quizAnswerId]) => ({
  //   quizQuestionId,
  //   quizAnswerId,
  // }));

  const handleSelect = (question, answer) => {
    setAnswers({ ...answers, [question]: answer });
  };

  const handleGoTOUserCourses = () => {
    navigate("/userLandingPage", { state: { selectedBox: "course" } });
  };

  const [progress, setProgress] = useState("0%");

  const calculateProgress = (newCompletedCount) => {
    const totalChapters = course?.enrolledChaptersDBList?.length || 0;
    if (totalChapters === 0) return "0%";
    const completedCount = newCompletedCount !== undefined ? newCompletedCount : completedChapters.length;
    return `${Math.floor((completedCount / totalChapters) * 100)}%`;
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [completedChapters]);

  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [chapterContents, setChapterContents] = useState([]); // State to hold chapter contents


  // const fetchChapterContents = async (chapterId) => {
  //   try {
  //     const response = await axios.get(`${BACKEND_BASEURL}/studyMaterial/fetchContentsInChapter?chapterId=${chapterId}`, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
  //     if (response.status === 200) {
  //       setChapterContents(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching chapter contents:', error);
  //   }
  // };


  const handleChapterClick = (index) => {
    setSelectedChapterIndex(index);
    // const chapterId = course.chaptersDBList[index]?.chapterId;
    // fetchChapterContents(chapterId);
  };

  const handleMarkAsComplete = async () => {
    const chapterId = course?.enrolledChaptersDBList[selectedChapterIndex]?.enrolledChapterId;
    if (chapterId && !completedChapters?.includes(chapterId)) {
      const newCompletedState = [...completedChapters, chapterId];
      setCompletedChapters(newCompletedState);

      try {
        const response = await axios.patch(`${BACKEND_BASEURL}/studyMaterial/markAsComplete`, {
          enrolledChapterId: chapterId,
          chapterId: course.enrolledChaptersDBList[selectedChapterIndex].chapterId,
          username: userEmail, 
          isActive: true,
          isCompleted: true,
        });

        if (response.status === 200) {
          console.log('Chapter marked as complete');
          
          const nextChapterProgress = calculateProgress(newCompletedState.length);
          setProgress(nextChapterProgress);
          
          if (nextChapterProgress === "100%") {
             await axios.patch(`${BACKEND_BASEURL}/studyMaterial/update-material-enrollment`, {
                materialEnrollmentId: course.materialEnrollmentId,
                materialId: course.materialId,
                materialName: course.materialName,
                tutorName: course.tutorName,
                username: userEmail,
                isCompleted: true,
                isActive: true
             });
             console.log("Course fully completed.");
          }

          const nextChapterIndex = selectedChapterIndex + 1;
          if (course?.chaptersDBList && nextChapterIndex < course?.enrolledChaptersDBList?.length) {
            setSelectedChapterIndex(nextChapterIndex);
          } else {
            console.log("No more chapters available");
          }
        }
      } catch (error) {
        // Rollback state if the completely failed
        setCompletedChapters(completedChapters); 
        console.error('Error marking chapter as complete:', error);
      }
    }
  };

  const fetchContent = async (contentId) => {
    try {
      const response = await axios.get(`${BACKEND_BASEURL}/studyMaterial/serveContentInChapter?contentId=${contentId}`,);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
    return null;
  };


  const handleContentClick = async (contentId, contentType) => {
    const content = await fetchContent(contentId);
    if (content) {
      setModalContentType(contentType);
      setModalContent(content);
      setIsModalOpen(true);
    }
  };  




  // Check if all chapters are completed
  const allChaptersCompleted = course?.enrolledChaptersDBList?.length === completedChapters?.length;

  // Add a state variable to track whether the form has been submitted
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showToaster, setShowToaster] = useState(false); // Add a state variable for the toaster


  // State variable for storing correct answers
const [correctAnswers, setCorrectAnswers] = useState({});

const handleSubmitQuiz = async () => {
  if (Object.keys(answers).length === 0) {
    setShowToaster(true);
    setTimeout(() => setShowToaster(false), 3000); // Hide toaster after 3 seconds
    return;
  }

  setIsSubmitted(true);
  try {
    // Extract question IDs from answers
    const quizQuestionIdsList = Object.keys(answers).map(questionId => parseInt(questionId));

    // Post question IDs to the server
    const response = await axios.post(`${BACKEND_BASEURL}/studyMaterial/submitQuiz`, quizQuestionIdsList);

    if (response.status === 200) {
      toast.success("Quiz submitted successfully");

      // Extract correct answer IDs from the response
      const correctAnswerIds = response.data.correctAnswerIds;

      // Determine the correct and incorrect answers
      const newCorrectAnswerMessages = {};
      const newCorrectAnswers = {};

      quizQuestionIdsList.forEach((questionId, index) => {
        const correctAnswerId = correctAnswerIds[index];
        const selectedAnswerId = answers[questionId];

        // Find the correct answer's option label (A, B, C, or D)
        let correctOptionLabel = "";
        let selectedOptionLabel = "";

        chapters[selectedChapterIndex]?.quizDB?.quizQuestions.forEach(question => {
          if (question.quizQuestionId === questionId) {
            question.quizAnswers.forEach((answer, idx) => {
              const optionLabel = String.fromCharCode(65 + idx); // Convert index to letter (A, B, C, D)
              if (answer.quizAnswerId === correctAnswerId) {
                correctOptionLabel = optionLabel;
              }
              if (answer.quizAnswerId === selectedAnswerId) {
                selectedOptionLabel = optionLabel;
              }
            });
          }
        });

        if (selectedAnswerId === correctAnswerId) {
          newCorrectAnswers[questionId] = correctAnswerId; // Store the correct answer ID
          newCorrectAnswerMessages[questionId] = ""; // Display "Correct"
        } else {
          newCorrectAnswers[questionId] = correctAnswerId; // Store the correct answer ID
          newCorrectAnswerMessages[questionId] = `Wrong. Correct Answer: ${correctOptionLabel}`; // Display correct option
        }
      });

      setCorrectAnswers(newCorrectAnswers); // Store correct answers to highlight in the UI
      setCorrectAnswerMessages(newCorrectAnswerMessages); // Store messages to display below questions
      setFormSubmitted(true);
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
  }
};



  const handleClearAll = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCorrectAnswerMessages({});
    setFormSubmitted(false);
  };


  //testing

  const enrolledChapters = course?.enrolledChaptersDBList;
  const chapters = course?.chapterList?.chaptersDBList;

  return (
    <div className="courseDetailPage">
      <div>
        <Navbar />
      </div>

      <div className="courseDetailPageContainer">
        <div className="UserSidebarSection">
          <UserSidebar
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
            selectedSubBox={selectedSubBox}
            setSelectedSubBox={setSelectedSubBox}
          />
        </div>

        <div className="courseHomeSection">
          <div className="courseHomeSectionContainer">
            <div className="courseDetailHeaderSection">
              <button className="backButton" onClick={handleGoTOUserCourses}>
                <img src={LeftArrow} alt="" />
              </button>
              <div className="breadcrumSection">
                <span className="breadcrumNotSelectedTxt" onClick={handleGoTOUserCourses} style={{cursor:'pointer'}}>Courses </span>
                <span className="breadcrumSeperator">/</span>
                <span className="breadcrumSelectedTxt">
                  {course?.materialName}
                </span>
              </div>
            </div>

            <div className="progressSection">
              <div className="lessonSection" style={{overflowX:'hidden'}}>
                <div className="SectionsHeaderBoxTxt">{course?.materialName}</div>
                <div className="userCourseBoxSubHeader">
                  <span>{course?.materialName}</span>
                  <span style={{ padding: "0 4px" }}>|</span>
                  <span>By {course?.tutorName}</span>
                </div>
                <div className="progressContainer">
                  <div className="progressBar" style={{ width: "100%" }}>
                    <div
                      className="progress"
                      style={{ width: progress }}
                    ></div>
                  </div>
                  <div className="progressText">
                  {progress} COMPLETE
                  </div>
                </div>
                <div className="userHeaderHorizontalLine"></div>

                <div className="chapterList">
                    {chapters?.map((chapter, index) => (
                      <div
                        key={index}
                        className={`chapterItem ${
                          completedChapters.includes(chapter?.chapterId) ? "completed" : ""
                        }`}
                        onClick={() => handleChapterClick(index, chapter?.chapterName)}
                      >
                        <div className="checkboxWrapper">
                          <div
                            className={`verticalLine ${
                              completedChapters.includes(chapter.chapterId)
                                ? "completedLine"
                                : ""
                            }`}
                          ></div>
                          {completedChapters?.includes(chapter?.chapterId) ? (
                            <span className="chapterCheckbox completed">
                              &#x2713;
                            </span>
                          ) : (
                            <span className="chapterCheckbox"></span>
                          )}
                        </div>
                        <div
                          className={`chapterContent ${
                            completedChapters.includes(chapter?.chapterId)
                              ? "completed"
                              : ""
                          } ${selectedChapterIndex === index ? "selectedChapter" : ""}`}
                          style={{
                            backgroundColor: completedChapters.includes(chapter?.chapterId)
                              ? "#B0E7F1"
                              : ""
                          }}
                        >
                          <div className="chapterIconAndText">
                            <span className="chapterIcon">
                              <img src={Lesson} alt="lesson" />
                            </span>
                            <span className="chapterName">
                              Chapter {index + 1}
                            </span>
                          </div>
                          <span>{chapter.chapterName}</span>
                        </div>
                      </div>
                    ))}
                  </div>

              </div>

              <div className="contentDetailSection" style={{overflowX:'hidden'}}>
                <div className="SectionsHeaderBox">
                  <div className="courseBriefSection" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div className="courseBriefContainer" style={{ flex: 1 }}>
                      <div className="SectionsHeaderBox" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="SectionsHeaderBoxLeftLine"></div>
                        <div className="userCourseBoxSubHeader" style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ whiteSpace: 'nowrap' }}>Chapter {selectedChapterIndex + 1 }</span>
                          <span style={{ padding: "0 8px" }}>|</span>
                        </div>
                        <div className="SectionsHeaderBoxTxt" style={{ wordBreak: 'break-word' }}>
                        {chapters?.[selectedChapterIndex]?.chapterName || 'No Chapter Name Available'}
                        </div>
                      </div>
                    </div>
                    <div className="courseStatusContainer" style={{ flexShrink: 0, marginLeft: '16px' }}>
                      <button style={{border:'none'}}
                          className={`markAsCompleteButton ${allChaptersCompleted ? 'completed' : ''}`}
                          onClick={handleMarkAsComplete}
                          disabled={allChaptersCompleted} // Disable button if all chapters are completed
                      >
                        {allChaptersCompleted ? "Completed" : "Mark as Complete"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="assignmentSection">
          
                   <div className="courseFolder">
                      {chapters && chapters?.[selectedChapterIndex]?.contentsDBList.map((content, index) => (
                        <div key={index} className="courseHover">
                          {content?.contentType === 'VIDEO' && (
                            <div
                              className="videoContent"
                              onClick={() => handleContentClick(content.contentId, 'VIDEO')}
                            >
                              <img src={Video} alt="video" />
                              <span style={{display:'flex',width:'180px',fontSize:'12px',wordWrap:'break-word'}}>{content.contentName}</span>
                            </div>
                          )}
                          {content?.contentType === 'PDF' && (
                            <div
                              className="pdfContent"
                              onClick={() => handleContentClick(content.contentId, 'PDF')}
                            >
                              <img src={PdfFile} alt="pdf" />
                              <span style={{display:'flex',width:'180px',fontSize:'12px',wordWrap:'break-word'}}>{content.contentName}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>


               

                <div className="userHeaderHorizontalLine" style={{marginTop:'10px'}}></div>
              
               {/* Conditionally render the quiz container */}
                {chapters && (
                  <div className="quiz-container">
                    {chapters[selectedChapterIndex]?.quizDB && (
                      <>
                        <div className="quizLogoHeader">
                          <div>
                            <img src={QuizLogo} alt="Qlogo" />
                          </div>
                          <div>
                            <div className="quizHeader">Quiz</div>
                            <div className="userCourseBoxSubHeader">
                              Answer all the questions to complete the chapter
                            </div>
                          </div>
                        </div>

                      {chapters[selectedChapterIndex]?.quizDB?.quizQuestions.map(
  ({ quizQuestionId, questionText, quizAnswers }, questionNo) => (
    <div className="question" key={quizQuestionId}>
      <div className="question-no">
        {questionNo + 1}. {questionText}
      </div>
      <div className="options">
        {quizAnswers?.map(({ quizAnswerId, answerOption }, index) => {
          const optionLabel = String.fromCharCode(65 + index); // Convert index to letter (A, B, C, D)
          const isCorrect = correctAnswers[quizQuestionId] === quizAnswerId;
          const isSelected = answers[quizQuestionId] === quizAnswerId;
          const isWrong = isSubmitted && isSelected && !isCorrect;

          return (
            <div
              key={quizAnswerId}
              className={`optionValue ${isSelected ? "selected" : ""}`}
              style={{
                backgroundColor: isCorrect && isSubmitted
                  ? "#5AED71" // Green for correct answers when submitted
                  : isWrong
                  ? "#F1839E" // Pink for wrong answers when submitted
                  : isSelected
                  ? "#3CB9D4" // Blue for selected answers that are neither correct nor wrong
                  : "",
              }}
              onClick={() => handleSelect(quizQuestionId, quizAnswerId)}
            >
              {isSubmitted && isSelected ? (
                isCorrect ? (
                  <span className="optionCheckbox completed">&#x2713;</span> // Correct check mark
                ) : (
                  <span className="optionCheckbox wrong">&#x2717;</span> // Wrong cross mark
                )
              ) : (
                <span className="optionCheckbox">{optionLabel}</span>
              )}
              <label className="questionLabel">{answerOption}</label>
            </div>
          );
        })}
      </div>
      {isSubmitted && correctAnswerMessages[quizQuestionId] && (
        <div className="correct-answer-message">
          {correctAnswerMessages[quizQuestionId]}
        </div>
      )}
    </div>
  )
)}


                        <div className="actionButton">
                          {!formSubmitted && (
                            <>
                              <div className="clearButton" onClick={handleClearAll}>
                                Clear All
                              </div>
                              <div className="submitButton" onClick={handleSubmitQuiz}>
                                Submit
                              </div>
                            </>
                          )}
                        </div>
                        {showToaster && <div className="toaster">Please select an option</div>}
                      </>
                    )}
                  </div>
                )}

              </div>
              
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <Modal
          contentType={modalContentType}
          content={modalContent}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
