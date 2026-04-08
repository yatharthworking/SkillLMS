import React, { useState, useEffect } from 'react';
import './CurriculumTab.css';
import axios from "axios";
import AddChapter from '../../../../Assets/Images/AddChapter.svg';
import PlusChapter from '../../../../Assets/Images/plusChapter.svg';
import Lesson from "../../../../Assets/Images/lesson.svg";
import Delete from "../../../../Assets/Images/courseTrash.svg";
import CourseEdit from "../../../../Assets/Images/courseEdit.svg";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Video from "../../../../Assets/Images/recordedVideo.svg";
import PdfFile from "../../../../Assets/Images/pdfFile.svg";
import QuizLogo from "../../../../Assets/Images/quizLogo.svg";
import ImportIcon from "../../../../Assets/Images/importIcon.svg"
import MaterialIcon from "../../../../Assets/Images/Material-Icon.svg";
import QuestionIcon from '../../../../Assets/Images/QuestionIcon.svg';
import UploadIcon from '../../../../Assets/Images/UploadIcon.svg';
import CorrectCheck from '../../../../Assets/Images/correctCheck.svg';
import { ToastContainer, toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';
import { BeatLoader } from "react-spinners";
import CloseImport from '../../../../Assets/Images/closeImport.svg';
import QuestionTemplate from '../../../../Assets/ExcelTemplate/QuestionTemplate.xlsx';
import {
  BACKEND_BASEURL,
  // ADMIN_ENDPOINT,
  // TEACHER_ENDPOINT,
  delay,
} from "../../../helper.js";

const CurriculumTab = (props) => {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [newChapterId, setNewChapterId] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterCode, setNewChapterCode] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editQuestion, setEditQuestion] = useState(false);
  const [editChapterIndex, setEditChapterIndex] = useState(null);
  const [deleteChapterIndex, setDeleteChapterIndex] = useState(null);
  const [material, setMaterial] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContentDialogOpen, setDeleteContentDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [questionId, setQuestionId] = useState();
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [answers, setAnswers] = useState(Array(4).fill(''));
  const [answersList, setAnswersList] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const [selectedBulkQuestionFile, setSelectedBulkQuestionFile] = useState('');
  const [selectedUploadMaterialFile, setSelectedUploadMaterialFile] = useState('');
  //Dialogs
  const [openBulkUploadQuestionDialog, setOpenBulkUploadQuestionDialog] = useState(false);  
  const [openUploadMaterialDialog, setOpenUploadMaterialDialog] = useState(false);  

  const [loadingFetchChapter, setLoadingFetchChapter] = useState(false);  
  const [loadingAddChapter, setLoadingAddChapter] = useState(false);  
  const [loadingAddQuestion, setLoadingAddQuestion] = useState(false);  
  const [loadingDeleteQuestion, setLoadingDeleteQuestion] = useState(false);
  const [loadingDeleteChapter, setLoadingDeleteChapter] = useState(false);  
  const [uploading, setUploading] = useState(false);
  const [uploadingContent, setUploadingContent] = useState(false);
  const [loadingDeleteContent, setLoadingDeleteContent] = useState(false);
  const role = localStorage.getItem("role");
  // const endpoint =
  //   role === "ADMIN"
  //     ? ADMIN_ENDPOINT
  //     : role === "TEACHER"
  //     ? TEACHER_ENDPOINT
  //     : "";

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewChapterName('');
    setNewChapterCode('');
    setEditMode(false);
    setEditChapterIndex(null);
  };

  const handleEditChapter = (chapter, index) => {
    setEditMode(true);
    setNewChapterId(chapter.chapterId);
    setNewChapterName(chapter.chapterName);
    setNewChapterCode(chapter.chapterCode);
    setEditChapterIndex(index);
    handleClickOpen();
  };

  const handleClickDelete = (chapter,index) => {
    setNewChapterId(chapter.chapterId);
    setNewChapterName(chapter.chapterName);
    setNewChapterCode(chapter.chapterCode);
    setDeleteChapterIndex(index);
    setDeleteOpen(true);
  };

  //Fetch Chapter Data
  async function fetchChaptersData() {
    try{
      setLoadingFetchChapter(true);
      const response = await axios.get(`${BACKEND_BASEURL}/admin/getChaptersList?materialId=${props.materialId}`);

      if(response.status === 200){

        const data = response?.data?.chaptersList;
        setChapters(data);

        // Update selected chapter if it exists, required this for after add or edit
        if (selectedChapter) {
          const updatedSelectedChapter = data.find(chapter => chapter.chapterId === selectedChapter.chapterId);
          setSelectedChapter(updatedSelectedChapter);
        }

      }

    }catch(error){
      toast.error('error while fetching courseData');
      console.error(error);
    }finally{
      setLoadingFetchChapter(false);
    }
  }


  //Fetch chapter data whenever updated
  useEffect(() => {
    fetchChaptersData();
  }, []);

  //Add chapter
  const handleAddChapter = async () => {
    setLoadingAddChapter(true);
    if (!newChapterName || !newChapterCode) {
      toast.error("Chapter Name and Chapter Code are required!");
      return;
    }

    const newChapterBody ={
      materialId:props.materialId,
      chapter:[
        {
          chapterName:newChapterName,
          chapterCode:newChapterCode,
          isActive:true,
        }
      ]
    }
    try {
      const response = await axios.post(`${BACKEND_BASEURL}/admin/addOrEditChapterInMaterial`,newChapterBody);
      if (response.status === 200) {
        toast.success("Chapter Added successfully");
        fetchChaptersData();
        handleClose();
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error Occured!!!");
    } finally {
      setLoadingAddChapter(false);
    }
  };

  //Edit chapter
  const handleUpdateChapter = async () => {
    setLoadingAddChapter(true);

    if (!newChapterName || !newChapterCode) {
      toast.error("Chapter Name and Chapter Code are required!");
      return;
    }

    const newChapterBody ={
      materialId:props.materialId,
      chapter:[
        {
          chapterId:newChapterId,
          chapterName:newChapterName,
          chapterCode:newChapterCode,
          isActive:true,
        }
      ]
    }
    try {
      const response = await axios.post(`${BACKEND_BASEURL}/admin/addOrEditChapterInMaterial`,newChapterBody);
      if (response.status === 200) {
        toast.success("Chapter Updated successfully");
        fetchChaptersData();
        setNewChapterId('');
        setNewChapterName('');
        setNewChapterCode('');
        handleClose();
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error Occured!!!");
    } finally {
      setLoadingAddChapter(false);
    }
  };

    //Delete chapter
    const handleDeleteChapter = async () => {

      const newChapterBody ={
        materialId:props.materialId,
        chapter:[
          {
            chapterId:newChapterId,
            chapterName:newChapterName,
            chapterCode:newChapterCode,
            isActive:false,
          }
        ]
      }
      try {
        setLoadingDeleteChapter(true);
        const response = await axios.post(`${BACKEND_BASEURL}/admin/addOrEditChapterInMaterial`,newChapterBody);
        if (response.status === 200) {
          toast.success("Chapter Deleted successfully");
          fetchChaptersData();
          setDeleteOpen(false);
          setNewChapterId('');
          setNewChapterName('');
          setNewChapterCode('');
          setSelectedChapter(null);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Error Occured!!!");
      } finally {
        setLoadingDeleteChapter(false);
      }
    };


  const handleClickChapter = (chapter) => {
    setSelectedChapter(chapter);
  };
  console.log("selectedChapter",selectedChapter)

  

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeleteChapterIndex(null);
  };

  const handleAddQuestionDialogOpen = () => {
    setEditQuestion(false);
    setQuestionType('MCQ');
    setQuestionDialogOpen(true);
  };

  const handleQuestionDialogClose = () => {
    setQuestionDialogOpen(false);
    setNewQuestion('');
    setAnswers({ });
    setCorrectAnswer('');
  };


  const handleQuestionTypeChange = (type) => {
    setQuestionType(type);
    setAnswers(type === 'MCQ' ? Array(4).fill('') : Array(2).fill(''));
    setCorrectAnswer('');
  };

  // const handleAnswerChange = (index, value) => {
  //   setAnswers((prevAnswers) => {
  //     const newAnswers = [...prevAnswers];
  //     newAnswers[index] = value;
  //     return newAnswers;
  //   });
  // };

  const handleAnswerChange = (index, value) => {
    setAnswers((prevAnswers) => {
      if (!Array.isArray(prevAnswers)) {
        // Initialize as an empty array if prevAnswers is not an array
        prevAnswers = ['', '', '', ''];
      }
      const newAnswers = [...prevAnswers];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  //Add Question
  const handleAddQuestion = async () => {
    setLoadingAddQuestion(true);

    if (!newQuestion || (questionType === 'MCQ'? answers.some(answer => !answer): '') || !correctAnswer) {
      toast.error("Please fill mandatory fields!!");
      setLoadingAddQuestion(false);
      return;
    }
    
    const answersObject = answers.map((answer, index) => ({
      answerOption: answer,
      isCorrect: correctAnswer === String.fromCharCode(65 + index),
    }));

    const newQuestionBody = {
      chapterId: selectedChapter.chapterId,
      quiz: {
        quizId: selectedChapter.quizDB?.quizId,
        quizQuestions: [{
          questionText: newQuestion,
          questionType: questionType,
          quizAnswers: questionType === 'MCQ' ? answersObject : [
            { answerOption: 'True', isCorrect: correctAnswer === 'A' },
            { answerOption: 'False', isCorrect: correctAnswer === 'B' },
          ],
        }]
      }
    };
    try {
      const response = await axios.post(`${BACKEND_BASEURL}/admin/addQuizInChapter`,newQuestionBody);
      if (response.status === 200) {
        toast.success("Question Added successfully");
        fetchChaptersData();
        setNewQuestion('');
        setAnswers({});
        setCorrectAnswer('');
        handleQuestionDialogClose();
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error Occured!!!");
    } finally {
      setLoadingAddQuestion(false);
    }
  };

  const handleEditQuestion = (questionDetails) => {
    setEditQuestion(true);
    setNewQuestion(questionDetails.questionText);
    setQuestionType(questionDetails.questionType);
    setQuestionId(questionDetails.quizQuestionId);
    setAnswers(questionDetails.quizAnswers.map(answer => answer.answerOption));


    setAnswersList(questionDetails.quizAnswers);
    const correctAnswerIndex = questionDetails.quizAnswers.findIndex(answer => answer.isCorrect);

    const indexToLetter = (index) => {
      const letters = ['A', 'B', 'C', 'D'];
      return letters[index] || '';
    };
    const correctAnswerLetter = indexToLetter(correctAnswerIndex);

    setCorrectAnswer(correctAnswerLetter);
    setQuestionDialogOpen(true);
  };

  //Update Question
  const handleUpdateQuestion = async () => {
    setLoadingAddQuestion(true);

      if (!newQuestion || (questionType === 'MCQ'? answers.some(answer => !answer): '')) {
        toast.error("Question and Options are required!");
        setLoadingAddQuestion(false);
        return;
      }
      const answersObject = answers.map((answer, index) => ({ 
        answerOption: answer,
        isCorrect: correctAnswer === String.fromCharCode(65 + index),
        quizAnswerId: answersList[index] ? answersList[index].quizAnswerId : undefined,
      }));

     const newQuestionBody = {
      quizQuestionId : questionId,
      questionText: newQuestion,
      questionType: questionType,
      quizAnswers: questionType === 'MCQ' ? answersObject : [
        { answerOption: 'True', isCorrect: correctAnswer === 'A', quizAnswerId:answersList[0].quizAnswerId},
        { answerOption: 'False', isCorrect: correctAnswer === 'B',quizAnswerId:answersList[1].quizAnswerId },
      ],
    };
    try {
      const response = await axios.patch(`${BACKEND_BASEURL}/admin/editQuestion`,newQuestionBody);
      if (response.status === 200) {
        toast.success("Question Updated successfully");
        fetchChaptersData();
        setNewQuestion('');
        setAnswers({});
        setCorrectAnswer('');
        handleQuestionDialogClose();
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error Occured!!!");
    } finally {
      setLoadingAddQuestion(false);
    }
  };


const handleDeleteQuestion = (questionDetails) => {
  setQuestionId(questionDetails.quizQuestionId);
  setDeleteDialogOpen(true);
};


const handleDeleteConfirm = async() => {
  try {
    setLoadingDeleteQuestion(true);
    const response = await axios.put(`${BACKEND_BASEURL}/admin/deleteQuestion?questionId=${questionId}`);
    if (response.status === 200) {
      toast.success("Question Deleted successfully");
      fetchChaptersData();
      setDeleteDialogOpen(false);
    }
  } catch (error) {
    console.error("Error while Delete:", error);
    toast.error("Error Occured!!!");
  } finally {
    setLoadingDeleteQuestion(false);
  }
};


//For  Upload Content

const handleOpenUploadContenDialog = () => {
  setOpenUploadMaterialDialog(true);
};

const handleCloseUploadContenDialog = () => {
  setOpenUploadMaterialDialog(false);
  setSelectedUploadMaterialFile(null);
};

const validateFileType = (file) => {
  const validTypes = ['application/pdf', 'video/mp4', 'video/avi', 'video/mov'];
  return validTypes.includes(file.type);
};

const handleImportContentFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && validateFileType(file)) {
      setSelectedUploadMaterialFile(file);
    } else {
      toast.error("Invalid file type. Only PDF and video files are allowed.");
    }
  };

const clearContentFileName = () => {
  setSelectedUploadMaterialFile(null);
};
const handleDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDragActive(true);
};

const handleDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDragActive(false);
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setDragActive(false);
  const file = event.dataTransfer.files[0];
  if (file && validateFileType(file)) {
    setSelectedUploadMaterialFile(file);
  } else {
    toast.error("Invalid file type. Only PDF and video files are allowed.");
  }
};

const handleUploadContent = async () => {
  if (!selectedUploadMaterialFile)
  { 
      toast.error("Select file to upload!!")
      return;
  }
  setUploadingContent(true);

  const formData = new FormData();
  formData.append('binaryFile', selectedUploadMaterialFile);

  try {
     const url = `${BACKEND_BASEURL}/admin/addOrEditContentInChapter?chapterId=${selectedChapter.chapterId}`;
      const response = await axios.post(url, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      if(response.status === 200){
          toast.success("Content Uploaded Successfully!!", {
              position: "top-right",
              autoClose: 800,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            handleCloseUploadContenDialog(); // close dialog on success
            fetchChaptersData();
      }
  } catch (error) {
      console.error('Error uploading file:', error);
      // handle error response
      toast.error("Failed to upload the file.");
  } finally {
    setUploadingContent(false);
  }
};

// For Delete Material
const handleOpenDeleteMaterialDialog = (file,Index) => {
  setSelectedMaterial(file);
  setDeleteContentDialogOpen(true);
};

const handleDeleteMaterialDialogClose = () => {
  setDeleteContentDialogOpen(false);
  setSelectedMaterial(null);
};

const handleDeleteMaterial = async() => {
  try {
    setLoadingDeleteContent(true);
    const response = await axios.put(`${BACKEND_BASEURL}/admin/deleteContent?contentId=${selectedMaterial.contentId}`);
    if (response.status === 200) {
      toast.success("Content Deleted successfully");
      fetchChaptersData();
      handleDeleteMaterialDialogClose();
    }
  } catch (error) {
    console.error("Error while Delete:", error);
    toast.error("Error Occured!!!");
  } finally {
    setLoadingDeleteContent(false);
  } 
};

  //to handle the display of the selected material.

const [selectedMaterial, setSelectedMaterial] = useState(null);
const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);


//functions to handle opening and closing the modal.

const handleOpenMaterialModal = async(file) => {
  const content = await fetchContent(file.contentId);

  console.log("content",content)
  if (content) {
    setSelectedMaterial(content);
    setIsMaterialModalOpen(true);
  }
  else{
    toast.error("Content not present");
  }
};

const fetchContent = async (contentId) => {
  try {
    const response = await axios.get(`${BACKEND_BASEURL}/studyMaterial/serveContentInChapter?contentId=${contentId}`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching content:', error);
  }
  return null;
};


const handleCloseMaterialModal = () => {
  setSelectedMaterial(null);
  setIsMaterialModalOpen(false);
};

//For Bulk Upload Section

const handleOpenBulkImportQuestionDialog = () => {
  setOpenBulkUploadQuestionDialog(true);
};

const handleCloseBulkImportQuestionDialog = () => {
  setOpenBulkUploadQuestionDialog(false);
  setSelectedBulkQuestionFile(null);
};

const handleBulkImportFileUpload = (event) => {
  const file = event.target.files[0];
  console.log("Filee",file)
  if (file) {
    setSelectedBulkQuestionFile(file);
  }
};

const clearSelectedBulkQuestionFileName = () => {
  setSelectedBulkQuestionFile(null);
};


const handleUploadQuestionExcel = async () => {

  if (!selectedBulkQuestionFile)
  { 
      toast.error("Select file to upload!!")
      return;
  }

  setLoadingAddQuestion(true);

  const queryParams = {
    chapterId: selectedChapter.chapterId,
    quizId: selectedChapter.quizDB ?  selectedChapter.quizDB.quizId :null
  };

  const formData = new FormData();
  formData.append('file', selectedBulkQuestionFile);

  try {
     const url = `${BACKEND_BASEURL}/admin/bulk-upload`;
      const response = await axios.post(url, formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          },
          params: queryParams
      });
      if(response.status === 200){
          toast.success("Question Imported Successfully!!", {
              position: "top-right",
              autoClose: 800,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            handleCloseBulkImportQuestionDialog(); // close dialog on success
            fetchChaptersData();
      }
  } catch (error) {
      console.error('Error uploading file:', error);
      // handle error response
      toast.error("Failed to upload the Excel file.");
  } finally {
    setLoadingAddQuestion(false);
  }
};
//Bulk upload section end

  return (
    <div className='curriculumMainSection'>
      <ToastContainer />
      <div className='chapterSection'>
        <div className='chapterHeaderSection'>
          <div className='chapter-header'>Chapters</div>
          <div className='add-chapter' onClick={handleClickOpen}>
            <img src={PlusChapter} alt='' /><span>Add Chapter</span>
          </div>
        </div>
        <div className='chapter-name-details'>
          { !loadingFetchChapter ?(
          chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <div
                key={index}
                className={`chapter-item ${selectedChapter === chapter ? 'selected' : ''}`}
                onClick={() => handleClickChapter(chapter)}
              >
                <div className="chapterIconAndText">
                  <span className="chapterIcon">
                    <img src={Lesson} alt="lesson" />
                  </span>
                  <span className="chapterName">
                    Chapter {index+1}
                  </span>
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px', display:'block' }}>{chapter.chapterName}</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{chapter.chapterCode}</span>
                <div className="chapterActions">
                  <img
                    src={CourseEdit}
                    alt="edit"
                    className="chapterActionIcon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditChapter(chapter, index);
                    }}
                  />
                  <img
                    src={Delete}
                    alt="delete"
                    className="chapterActionIcon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClickDelete(chapter,index);
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className='addChapterImage'><img src={AddChapter} alt='' /></div>
          ))
          :(
            <div style={{height:'100%',width:'100%',display:'flex',justifyContent:'center',alignItems:'center'}}>
              <BeatLoader color={"#219EBC"}  size={15} />
            </div>
          )
        }
        </div>
      </div>

      <div className='chapterContentSection'>
        { !loadingFetchChapter ?(
        selectedChapter ? (
          <div className='chapterContentDetails'>
            <div className="SectionsHeaderBox" style={{ justifyContent: 'space-between' }}>
              <div className="userCourseBoxSubHeader" style={{ borderLeft: '4px solid #FFB703', padding: '0 6px' }}>
                <span>Chapter</span>
                <span style={{ padding: "0 8px" }}>|</span>
                <span className="SectionsHeaderBoxTxt">{selectedChapter?.chapterName}</span>
              </div>

              <div className='UploadSection'>
                {/* <div className='add-chapter'>
                  <label htmlFor="fileUpload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <img src={UploadIcon} alt='' />
                    <span>Upload Material</span>
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".pdf, .mp4"
                    style={{ display: 'none' }}
                    onChange={handleUploadMaterial}
                  />
                </div> */}
                <div className='add-chapter' onClick={handleOpenUploadContenDialog}>
                <img src={UploadIcon} alt='' /><span>Upload Material</span>
                </div>
                <div className='add-chapter' onClick={handleAddQuestionDialogOpen}>
                  <img src={PlusChapter} alt='' /><span>Add Question</span>
                </div>
                {/* Bulk Upload Question */}
                <div className='add-chapter' onClick={handleOpenBulkImportQuestionDialog}>
                <img src={ImportIcon} alt='' /><span>Import Question</span>
                </div>
                
              </div>
            </div>

            {/* Material Section */}
            <div className="materialSection">
              {!uploading ?(
                selectedChapter.contentsDBList.length > 0 ? (
                selectedChapter.contentsDBList.map((file, index) => (
                  <div key={index} className="uploadedMaterial">
                    <div className="materialImageBox" onClick={() => handleOpenMaterialModal(file)}>
                     <img src={file.contentType === 'PDF' ? PdfFile : Video} alt='' />
                    </div>
                    <div className='chapterActions'>
                        <img
                          src={Delete}
                          alt="delete"
                          className="chapterActionIcon"
                          onClick={() => handleOpenDeleteMaterialDialog(file,index)}
                        />
                    </div>
                    <div style={{fontSize:'12px',wordWrap:'break-word'}}>
                      {file.contentName}
                    </div>
                  </div>
                ))
              ) : (
                <div className='UploadContentSection'><img src={MaterialIcon} alt='' /></div>
              )):
              (
                <div style={{width:'100%',height:'100px',display:'flex',justifyContent:'center',alignItems:'center'}}>
                  <CircularProgress  style={{color:'#219EBC'}}/>
                </div>
              )}
            </div>

            <div className="userHeaderHorizontalLine"></div>

            {/* Quiz Section */}
            <div className='quizSection'>
              {selectedChapter.quizDB?.quizQuestions && selectedChapter.quizDB.quizQuestions.length > 0 ? (
                selectedChapter.quizDB.quizQuestions.map((questionDetails, index) => (
                  <div key={index} className="chapter-item">
                    <div className='qtndetails'>
                      <span className="questionNumber">Q{index + 1}. </span>
                      <span className="questionText">{questionDetails.questionText}</span>
                    </div>
                    
                      <div className=''>
                        {questionDetails.quizAnswers.map((res,index) => (
                          <div key={index}  className="optionText">
                            <span>{index+1}. </span>
                            <span className=''>{res.answerOption}</span>
                            {res.isCorrect === true && <span className="questionText"><img src={CorrectCheck} alt=''/></span>}
                          </div>
                        ))}
                      </div>
                    
                    {/* {questionDetails.type === 'True/False' && (
                      <div className=''>
                        <div className="optionText">
                          <span>A. True</span>
                          {questionDetails.correctAnswer === 'A' && <span className="questionText"><img src={CorrectCheck} alt=''/></span>}
                        </div>
                        <div className="optionText">
                          <span>B. False</span>
                          {questionDetails.correctAnswer === 'B' && <span className="questionText"><img src={CorrectCheck} alt=''/></span>}
                        </div>
                      </div>
                    )} */}
                    <div className="chapterActions">
                    <img
                      src={CourseEdit}
                      alt="edit"
                      className="chapterActionIcon"
                      onClick={() => handleEditQuestion(questionDetails)}
                    />
                    <img
                      src={Delete}
                      alt="delete"
                      className="chapterActionIcon"
                      onClick={() => handleDeleteQuestion(questionDetails)}
                    />
                  </div>
                  </div>
                ))
              ) : (
                <div className='UploadContentSection'><img src={QuestionIcon} alt='' /></div>
              )}
            </div>
          </div>
        ) : (
          <div>Please select a chapter to see the content.</div>
        )):(
          <div style={{width:'100%',height:'100px',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <BeatLoader color={"#219EBC"}  size={15} />
          </div>
        )}
      </div>

      <Dialog open={open} onClose={(event, reason) => { if (reason === "backdropClick") { return; } }}>
        <DialogTitle>
          <div className='dialogChapterHeader'>
            <span className="CertifyDialogTitleTxt">{editMode ? 'Edit Chapter' : 'Add Chapter'}</span>
            <button className="close-button" onClick={handleClose}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle>

        <DialogContent>
          <div className='courseDetailsField'>
            <div className='inputHeaderText'>Chapter Name<span className='mandatoryField'>*</span></div>
            <input
              className='courseInputBox'
              style={{ width: '250px' }}
              placeholder='Chapter Name'
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
            />
             <div className='inputHeaderText'>Chapter Code<span className='mandatoryField'>*</span></div>
            <input
              className='courseInputBox'
              style={{ width: '250px' }}
              placeholder='Chapter Code'
              value={newChapterCode}
              onChange={(e) => setNewChapterCode(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={handleClose}>Cancel</div>
            <div className='addBtn' onClick={editMode ? handleUpdateChapter : handleAddChapter}>
              {loadingAddChapter ? <CircularProgress size={20}  style={{color:'white'}}/> :  (editMode ? 'Update' : 'Add')}
            </div>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={questionDialogOpen} maxWidth='md' fullWidth onClose={handleQuestionDialogClose}>
        <DialogTitle>
        <div className='dialogChapterHeader'>
          <span className="CertifyDialogTitleTxt">{editQuestion ? 'Edit Question' : 'Add Question'}</span>
          <button className="close-button" onClick={handleQuestionDialogClose}>&#x2716;</button>
        </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle>

        <DialogContent>
          <div className='courseDetailsField'>
            <div className='inputHeaderText'>Question<span className='mandatoryField'>*</span></div>
            <input
              className='courseInputBox'
              style={{ width: '98%', height: '40px' }}
              placeholder='Type Question'
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
          </div>

          <div className='courseDetailsField' style={{ marginTop: '12px' }}>

            <div className='inputHeaderText'>Question Type<span className='mandatoryField'>*</span></div>

            <div className='questionTypeContainer'>
              <div
                className={`questionTypeButton ${questionType === 'MCQ' ? 'selected' : ''}`}
                onClick={() => handleQuestionTypeChange('MCQ')}
              >
                <span className='questionTypeDesc'>MCQ</span>
                <span className='questionTypeDescription'>4 options with 1 correct answer</span>
              </div>
              <div
                className={`questionTypeButton ${questionType === 'True/False' ? 'selected' : ''}`}
                onClick={() => handleQuestionTypeChange('True/False')}
              >
                <span className='questionTypeDesc'>True/False</span>
                <span className='questionTypeDescription'>2 default options true & false</span>
              </div>
            </div>

            {questionType === 'MCQ' && (
              <div className='quizOptionDesc'>
                <div className='optionDesc'>
                  <div>
                    <span>A.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>
                      <input
                        className='courseInputBox'
                        style={{ width: '80%' }}
                        placeholder='Answer A'
                        value={answers[0]}
                        onChange={(e) => handleAnswerChange(0, e.target.value)}
                      />
                    </span>
                  </div>

                  <div>
                    <span>B.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>
                      <input
                        className='courseInputBox'
                        style={{ width: '80%' }}
                        placeholder='Answer B'
                        value={answers[1]}
                        onChange={(e) => handleAnswerChange(1, e.target.value)}
                      />
                    </span>
                  </div>

                  <div>
                    <span>C.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>
                      <input
                        className='courseInputBox'
                        style={{ width: '80%' }}
                        placeholder='Answer C'
                        value={answers[2]}
                        onChange={(e) => handleAnswerChange(2, e.target.value)}
                      />
                    </span>
                  </div>

                  <div>
                    <span>D.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>
                      <input
                        className='courseInputBox'
                        style={{ width: '80%' }}
                        placeholder='Answer D'
                        value={answers[3]}
                        onChange={(e) => handleAnswerChange(3, e.target.value)}
                      />
                    </span>
                  </div>
                </div>

                <div className='correctAnswerDesc'>
                  <div className='inputHeaderText'>Correct Answer<span className='mandatoryField'>*</span></div>
                  <select
                    className='courseInputBox'
                    style={{ width: '12vw', marginTop: '4px' }}
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  >
                    <option>Select</option>
                    <option value='A'>A</option>
                    <option value='B'>B</option>
                    <option value='C'>C</option>
                    <option value='D'>D</option>
                  </select>
                </div>
              </div>
            )}

            {questionType === 'True/False' && (
              <div className='quizOptionDesc'>
                <div className='optionDesc'>
                  <div>
                    <span>A.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>True</span>
                  </div>

                  <div>
                    <span>B.<span className='mandatoryField'>*</span></span>
                    <span className='inputAnswer'>False</span>
                  </div>
                </div>

                <div className='correctAnswerDesc'>
                  <div className='inputHeaderText'>Correct Answer<span className='mandatoryField'>*</span></div>
                  <select
                    className='courseInputBox'
                    style={{ width: '12vw', marginTop: '4px' }}
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  >
                    <option>Select</option>
                    <option value='A'>A</option>
                    <option value='B'>B</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>

          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={handleQuestionDialogClose}>Cancel</div>
            <div className='addBtn' onClick={editQuestion ? handleUpdateQuestion : handleAddQuestion}>
              {loadingAddQuestion ? <CircularProgress size={20}  style={{color:'white'}}/> :  (editQuestion ? 'Update' : 'Add')}
            </div>
          </div>

        </DialogActions>
      </Dialog>


      <Dialog open={deleteDialogOpen} maxWidth='sm' fullWidth onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <div className='dialogChapterHeader'>
            <span className="CertifyDialogTitleTxt">Delete Question</span>
            <button className="close-button" onClick={() => setDeleteDialogOpen(false)}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle>
        <DialogContent>
          <div>Do you want to delete this question?</div>
        </DialogContent>
        <DialogActions>
          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={() => setDeleteDialogOpen(false)}>Cancel</div>
            <div className='addBtn' onClick={handleDeleteConfirm}>
              {loadingDeleteQuestion ? <CircularProgress size={20}  style={{color:'white'}}/> : 'Delete' }
            </div>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>
          <div className='dialogChapterHeader'>
            <span className="CertifyDialogTitleTxt">Delete Chapter</span>
            <button className="close-button" onClick={handleDeleteClose}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle>

        <DialogContent>
          <p>Do you want to delete this chapter?</p>
        </DialogContent>
        <DialogActions>
          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={handleDeleteClose}>Cancel</div>
            <div className='addBtn' onClick={handleDeleteChapter}>
            {loadingDeleteChapter ? <CircularProgress size={20}  style={{color:'white'}}/> : 'Delete' }
            </div>
          </div>
        </DialogActions>
      </Dialog>

      {/* To Detlet Material */}
      <Dialog open={deleteContentDialogOpen} onClose={handleDeleteMaterialDialogClose}>
        <DialogTitle>
          <div className='dialogChapterHeader'>
            <span className="CertifyDialogTitleTxt">Delete Content</span>
            <button className="close-button" onClick={handleDeleteMaterialDialogClose}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle> 

        <DialogContent>
          <p>Do you want to delete this Content?</p>
        </DialogContent>
        <DialogActions>
          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={handleDeleteMaterialDialogClose}>Cancel</div>
            <div className='addBtn' onClick={handleDeleteMaterial}>
              {loadingDeleteContent? <CircularProgress size={20}  style={{color:'white'}}/> : 'Delete'}
            </div>
          </div>
        </DialogActions>
      </Dialog>

      {/*Upload Material DIALOG BOX */}

      <Dialog open={isMaterialModalOpen}  maxWidth='lg' fullWidth onClose={(event, reason) => { if (reason === "backdropClick") { return; } }}>
        <DialogTitle>
            <div className='dialogChapterHeader'>
                <span className="CertifyDialogTitleTxt">View Material</span>
                <button className="close-button" onClick={handleCloseMaterialModal}>&#x2716;</button>
            </div>
        </DialogTitle>
        <DialogContent>
          {selectedMaterial && selectedMaterial.contentType === 'PDF' && (
            <iframe
              src={`data:application/pdf;base64,${selectedMaterial.content}`}
              title="PDF Viewer"
              width="100%"
              height="600px"
              className="hide-download"
            />
          )}
          {selectedMaterial && selectedMaterial.type === 'video/mp4' && (
            <video controls controlsList="nodownload" width="100%">
              <source src={URL.createObjectURL(selectedMaterial)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
        <DialogActions>
          {/*<button onClick={handleCloseMaterialModal}>Close</button>*/}
        </DialogActions>
      </Dialog>

      {/* PopUp for import */}
      <Dialog open={openBulkUploadQuestionDialog} onClose={handleCloseBulkImportQuestionDialog}>
          <DialogTitle>
          <div className='dialogChapterHeader'>
              <span className="CertifyDialogTitleTxt">Import Questions</span>
              <button className="close-button" onClick={handleCloseBulkImportQuestionDialog}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
          </DialogTitle> 

          <DialogContent>
              <div className='importDialogBodyContainer'>
                  <div className='importDialogBody'>
                      <div className='importDialogSubHeader'>Step 1</div>
                      <div className='importDialogSTxt'>Download our pre-built (.xls or .xlsx) template.</div>
                      <a className='importDialogDownloadTempelate' href={QuestionTemplate} download="QuestionTemplate.xls">
                          Download Template
                      </a>

                  </div>

                  <div className='importDialogBody' style={{width:'300px'}}>
                      <div className='importDialogSubHeader'>Step 2</div>
                      <div className='importDialogSTxt'>Fill in data in the template and upload here.</div>
                      <label className='importDialogImportTempelate' htmlFor='fileInput'>
                          <span><img src={UploadIcon} alt='' /></span>
                          <span>Upload CSV File</span>
                          <input type='file'  id='fileInput' accept='.xls,.xlsx' style={{ display: 'none' }} onChange={handleBulkImportFileUpload} />
                      </label>
                  </div>
                  {selectedBulkQuestionFile &&(
                      <div className='importDialogBody' style={{width:'300px'}}>
                          <div className='selectedFileBox'>
                              <span className='selectedFileBoxTxt'>{selectedBulkQuestionFile.name}</span>
                              <span style={{cursor:'pointer'}} onClick={clearSelectedBulkQuestionFileName}><img src={CloseImport} alt='' /></span>
                          </div>
                      </div>
                  )}

                  <div className="userHeaderHorizontalLine" style={{margin:'0px'}}></div>
              </div>
              
          </DialogContent>
          <DialogActions>
          <div className='dialogActionBtn'>
              <div className='closeBtn' onClick={handleCloseBulkImportQuestionDialog}>Cancel</div>
              <div className='addBtn' onClick={handleUploadQuestionExcel}>
                  {loadingAddQuestion? <CircularProgress size={20}  style={{color:'white'}}/> : 'Import'}
              </div>
          </div>
          </DialogActions>
      </Dialog>


      {/* PopUp for Content Upload */}
      <Dialog open={openUploadMaterialDialog} onClose={handleCloseUploadContenDialog}>
          <DialogTitle>
          <div className='dialogChapterHeader'>
              <span className="CertifyDialogTitleTxt">Upload Material</span>
              <button className="close-button" onClick={handleCloseUploadContenDialog}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine" style={{margin:'8px 0px 0px 0px'}}></div>
          </DialogTitle> 

          <DialogContent>
            <div className='importDialogBodyContainer'>
              <div   className={`uploadFileBody ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                <div className='uploadFileContainer'>
                  <div><img src={UploadIcon} alt=''/></div>
                  <div className='uploadDragTxt'>Drag & drop a file here</div>
                  <div className='uploadFileOrTxt'>or</div>
                  <div className='uploadFileSelectBtn'>
                  <label htmlFor="fileInput" style={{cursor:'pointer'}}>Select File</label>
                    <input type="file" id="fileInput" accept=".pdf" style={{ display: 'none' }} onChange={handleImportContentFileUpload} />
                  </div>
                </div>

                <div className='uploadFileDesc'>*upload pdf or video files only</div>

              </div>

              {selectedUploadMaterialFile &&(
                <div className='importDialogBody' style={{width:'300px'}}>
                  <div className='selectedFileBox'>
                      <span className='selectedFileBoxTxt'>{selectedUploadMaterialFile.name}</span>
                      <span style={{cursor:'pointer'}} onClick={clearContentFileName}><img src={CloseImport} alt='' /></span>
                  </div>
                </div>
              )}

              <div className="userHeaderHorizontalLine" style={{margin:'0px'}}></div>
            </div>
              
          </DialogContent>
          <DialogActions>
          <div className='dialogActionBtn'>
              <div className='closeBtn' onClick={handleCloseUploadContenDialog}>Cancel</div>
              <div className='addBtn' onClick={handleUploadContent}>
                  {uploadingContent? <CircularProgress size={20}  style={{color:'white'}}/> : 'Upload'}
              </div>
          </div>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default CurriculumTab;
