import React, { useRef, useState, useEffect } from 'react';
import './LiveQuestionGenerator.css'
import Navbar from '../../../../../Navbar/Navbar'
// import AdminSidebar from '../../../';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../../AdminSidebar/AdminSidebar';
import LeftArrow from '../../../../../../Assets/Images/leftArrow.svg';
import Edit from '../../../../../../Assets/Images/fi_edit-3.svg'
import LiveTestObjective from './LiveTestObjective';
import LiveTestSubjective from './LiveTestSubjective';

const LiveQuestionGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const testPattern = "Objective";

    const [selectedBox, setSelectedBox] = useState(() => {
        return location.state && location.state.selectedBox ? location.state.selectedBox : 'batch';
      });
    
      const [selectedSubBox, setSelectedSubBox] = useState(() => {
        return location.state && location.state.selectedSubBox ? location.state.selectedSubBox : '';
      });
    
      const handleGoTOUserCourses = () => {
        navigate('/adminLandingPage', { state: { selectedBox: "batch" } });
      };

  return (
    <div className='questionGeneratorPage'>
    <div><Navbar /></div>
    <div className='adminLandingPageContainer'>
        <div className='adminSidebarSection'>
          <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
        </div>

        <div className='questionGeneratorHomeSection'>
            <div className='questionGeneratorHomeSectionContainer'>
                <div className='webinarDetailHeaderSection'>
                    <button className='backButton' onClick={handleGoTOUserCourses}><img src={LeftArrow} alt='' /></button>
                    <div className='webinarBreadcrumSection'>
                        <span className='webinarbreadcrumNotSelectedTxt'>Batches</span>
                        <span className='breadcrumSeperator'>/</span>
                        <span className='webinarbreadcrumNotSelectedTxt'>Manage Batch</span>
                        <span className='breadcrumSeperator'>/</span>
                        <span className='webinarbreadcrumSelectedTxt'>Manage Live Test</span>
                    </div>
                </div>
                <div className='testborder'></div>
            </div>

            <div className='liveTestDetailContentSection'>
                <div className='liveTestGeneratorSection'>
                    <div className='liveTestGeneratorSubSection'>
                        <div className='liveTestSubheader'>
                            <div className='liveTestHeneratorHeaderSection'>
                                <div className='liveTestHeader'>Data Privacy and Protection (Sem I)</div>
                                <div className='testTypeSection'>Objective</div>
                                <div className='EditDiv'>
                                    <div><img src={Edit} alt='edit' /></div>
                                    <div className='editText'>Edit</div>
                                </div>
                            </div>
                            <div className='liveTestSubSectionDiv'>
                                <div className='liveTestDivSec'>
                                    <div className='batchDiv'>
                                        <div className='batchHeader'>Batch: </div>
                                        <div className='subHeaderText'>Science 1st Year (Section A)</div>
                                    </div>
                                    <div className='batchDiv'>
                                        <div className='batchHeader'>Duration: </div>
                                        <div className='subHeaderText'>3 Hours</div>
                                    </div>
                                    <div className='batchDiv'>
                                        <div className='batchHeader'>Starts On:  </div>
                                        <div className='subHeaderText'>12 Aug 2023, 10:00</div>
                                    </div>
                                    <div className='batchDiv'>
                                        <div className='batchHeader'>Starts On:  </div>
                                        <div className='subHeaderText'>12 Aug 2023, 10:00</div>
                                    </div>
                                    <div className='batchDiv'>
                                        <div className='batchHeader'>Status:    </div>
                                        <div className='subHeaderText'>Created</div>
                                    </div>
                                </div>
                                <div className='rightSideSubDiv'>  
                                    <div className='batchDiv'>
                                        <div className='batchHeader' style={{width:'52%'}}>Description:  </div>
                                        <div className='batchsubHeader'>Here teacher can add a brief description about the exam, what the exam is all about. For example, the chapters included in the exam.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='rightSideDiv'>
                            <div className='liveTestHeneratorHeaderSection'>
                                <div className='publishHeaderText'>You will not be able to <br/>edit once published</div>
                                <div className='publishSubText'>
                                        <div className='publishText'>Publish</div>
                                        <div className='publishText1'>to students</div>
                                </div>
                                <div className='saveAsDraftButton'>Save as Draft</div>
                           </div>
                            <div className='questionDiv'>
                                <div className='qusetionShowDivSection'>
                                        <div className='questionDiv1'>
                                            <div className='questionCount'>TOTAL QUESTIONS</div>
                                            <div className='questionsCounts'>50</div>
                                        </div>
                                        <div>
                                            <div className='border'></div>
                                        </div>
                                        <div className='questionDiv1'>
                                            <div className='questionCount'>TOTAL MARKS</div>
                                            <div className='questionsCounts'>50</div>
                                        </div>
                                </div>
                           </div>
                        </div>
                    </div>
                    <div className='testborder'></div>

                    <div style={{height:'50vh'}}>
                        {testPattern === "Objective" ? <LiveTestObjective /> : <LiveTestSubjective />}
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default LiveQuestionGenerator
