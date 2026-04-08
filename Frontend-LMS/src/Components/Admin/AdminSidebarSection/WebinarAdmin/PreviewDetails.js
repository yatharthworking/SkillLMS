import React, { useState, useEffect } from 'react';
import './PreviewDetails.css';
import Navbar from '../../../Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../../AdminSidebar/AdminSidebar';
import SpaceImg from '../../../../Assets/Images/webinarSpaceImg.svg';
import UploadImg from '../../../../Assets/Images/WebinarUploadImg.svg';
import { useNavigate } from 'react-router-dom';

const PreviewDetails = () => {
    const navigate = useNavigate();
    const [selectedBox, setSelectedBox] = useState('webinar');
    const [selectedSubBox, setSelectedSubBox] = useState('');

    const location = useLocation();
    const { webinarDetails } = location.state || {};

    useEffect(() => {
        console.log('Webinar Details:', webinarDetails);
        if (webinarDetails) {
            console.log('Speakers:', webinarDetails.speakers);
            console.log('Key Takeaways:', webinarDetails.keyTakeaways);
            console.log('Audiences:', webinarDetails.audiences);
            console.log('Audiences:', webinarDetails.webinarImage);
        }
    }, [webinarDetails]);

    const handleBack = () =>{
        navigate('/createWebinar', { state: { webinarDetails } });
    }

    return (
        <div className='previewDetailPage'>
            <div><Navbar /></div>
            <div className='previewDetailPageContainer'>
                <div className='UserSidebarSection'>
                    <AdminSidebar selectedBox={selectedBox} setSelectedBox={setSelectedBox} selectedSubBox={selectedSubBox} setSelectedSubBox={setSelectedSubBox} />
                </div>

                <div className='previewWebinarHomeSection'>
                    <div className='previewWebinarHomeSectionContainer'>
                        <div className='previewWebinarDetailContentSection'>
                            <div className='previewWebinarcontentHeaderSection'>
                                <div className='previewWebinarcontentHeaderBox'>
                                <div className='previewWebinarcontentHeaderPicture'>
                                    <img src={webinarDetails?.webinarImage ? webinarDetails.webinarImage : UploadImg} alt='Webinar' />
                                </div>


                                    <div className='previewWebinarcontentHeaderDetails'>
                                        <div className='previewWebinarcontentHeaderDetailsBox'>
                                            <div className='previewWebinarcontentHeaderDetailsBoxRow'>
                                                <div className='dateTimeDiv'>
                                                    <div className='dateDiv'>{webinarDetails?.webinarStartDate}</div> <span className='border'>|</span>
                                                    <div className='dateDiv'>{webinarDetails?.webinarStartTime} - {webinarDetails?.webinarEndTime}</div>
                                                </div> 
                                                <div className='topicName'>{webinarDetails?.webinarTitle}</div>
                                                <div className='subject'>Subject: {webinarDetails?.subject}</div>
                                                {webinarDetails?.recordingUrl && <div className='subject'>Recording URL: {webinarDetails?.recordingUrl}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='previewWebinarSpreakerDiv'>
                                    <div className='previewWebinarDescriptionSection'>
                                        <div className='previewWebinarDescriptionHeader'>Speakers</div>
                                        {webinarDetails?.speakers?.map((speaker, index) => (
                                            <div key={index} className='previewSpeakerDetailsDiv'>
                                                <div className='previewSpeckerDetailsDescription'>
                                                    <div className='previewSpeakersDetails' style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                        <span>{index + 1}.</span>
                                                        <div>{speaker.name}</div>
                                                    </div>
                                                    <div className='previewSpeakerName'>{speaker.designation}</div>
                                                    <div className='previewSpeakerName'>{speaker.about}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='previewWebinarSpreakerDiv'>
                                    <div className='previewWebinarDescriptionSection'>
                                        <div className='previewWebinarDescriptionHeader'>Key Takeaways</div>
                                        {webinarDetails?.keyTakeaways?.map((takeaway, index) => (
                                            <div key={index} className='previewChapterNameSection'>
                                                <span className='previewWebinarKeys'>{index + 1}.</span>
                                                <span className='previewWebinarKeys'>{takeaway.keyTakeaway}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='previewWebinarSpreakerDiv'>
                                    <div className='previewWebinarDescriptionSection'>
                                        <div className='previewWebinarDescriptionHeader'>Who Should Attend</div>
                                        {webinarDetails?.audiences?.map((audience, index) => (
                                            <div key={index} className='previewJoinSectionText'>
                                                <span className='previewWebinarKeys'>{index + 1}.</span>
                                                <span className='previewWebinarKeys'>{audience.audience}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='backButtomMainDiv'>
                            <div className='backButtonDiv' onClick={handleBack}>Back</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PreviewDetails;
