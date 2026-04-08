import React, { useState } from "react";
import SearchIcon from "../../Assets/Images/searchIcon.svg";
import { useNavigate } from "react-router-dom";
import defaultWebinarImg from "../../Assets/Images/webinardefaultImg.svg";
import "./PublicWebinar.css";
import axios from "axios";
import { BACKEND_BASEURL } from "../helper.js";
import { toast } from "react-toastify";
import LoginDialog from "../Login/LoginDialog.js";
import CheckIcon from '@mui/icons-material/Check';
import TermsDialog from '../PublicAccess/TermsDialog.js';
import PrivacyPolicyDialog from '../PublicAccess/PrivacyPolicyDialog.js';

const SoulLogo = `${process.env.PUBLIC_URL}/logo192.png`;

export default function PublicWebinar() {
  const navigate = useNavigate();

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [selectedSection, setSelectedSection] = useState("Skill");
  const organisationName = process.env.REACT_APP_LMS_ORGANISATION_NAME;
  const [selectedSubject, setSelectedSubject] = useState(null); 

  const handleSelection = (section) => {
    setSelectedSection(section);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true); // Open the dialog
  };

  const handleHomeClick = () => {
    navigate("/"); //Navigate  to home
  };

  const handleCourseClick = () => {
    navigate("/courses"); //Navigate  to course
  };

  const handleWebinarClick = () => {
    navigate("/webinars"); //Navigate  to webinar
  };

  const handleContactClick = () => {
    navigate("/contacts"); //Navigate  to contact
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  function handleUrlClick(url) {
    window.open(url, "_blank");
  }
  

  const handleSearchInputChange = (event) => {
    const searchQuery = event.target.value.toLowerCase();
    // const filtered = courses.filter(
    //   (course) =>
    //     course?.materialName.toLowerCase().includes(searchQuery) ||
    //     course?.tutorName.toLowerCase().includes(searchQuery)
    // );
    //setFilteredCourses(filtered);
  };

      //FOR PRIVACY POLICY AND TERMS CONDITION DIALOG

      const [isTermsOpen, setTermsOpen] = useState(false);
      const [isPrivacyOpen, setPrivacyOpen] = useState(false);
    
      const handleTermsOpen = () => {
        setTermsOpen(true);
      };
    
      const handleTermsClose = () => {
        setTermsOpen(false);
      };
    
      const handlePrivacyOpen = () => {
        setPrivacyOpen(true);
      };
    
      const handlePrivacyClose = () => {
        setPrivacyOpen(false);
      };
    
  

  return (
    <div className="coursePageView">
      <header className="landingPageHeader">
        <div className="logo">
          <img src={SoulLogo} alt="Logo" onClick={handleHomeClick} />
        </div>
        <div className="landingPageNav">
          <div className="navPointer" onClick={handleCourseClick}>
            Courses
          </div>
          <div className="navPointer" onClick={handleWebinarClick} style={{color:'#FFB703'}}>
            Webinars
          </div>
          <div className="navPointer" onClick={handleContactClick}>
            Contact Us
          </div>
          <div className="navLoginButton" onClick={handleLoginClick}>Login</div>
        </div>
      </header>
      <div className="fullWebinarsDetail">
      <div className="backgroundImageHeader">
        <div className="landingCourseHeaderSecondary">Webinars</div>
      </div>
      <div className="landingWebinarPageSection">
        <div className="courseSubHeaderSection" style={{ padding: "0" }}>
          {/*SEARCH SECTION */}
          <div className="userHeaderSection">
            <div className="userHeaderBox">
              <div className="userHeaderFilterSection">
                <div className="userSearchBox">
                  <input
                    className="userSearchInput"
                    placeholder="Search a webinars or speakers..."
                    onChange={handleSearchInputChange}
                  />
                  <img src={SearchIcon} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="userHeaderHorizontalLine"></div>

        <div className="publicCourseDetails">
          <div className="courseSubjectList">
            <div className='courseSubjectHeaderDetails'>
              <div className="subjectHeaderName">SUBJECTS</div>
              <div className='clearAll' onClick={() => setSelectedSubject('')}>Clear</div>
            </div>
            <div className="userHeaderHorizontalLine"></div>
            <div className="subjectListDetails">
            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
              <div
                key={subject}
                className={`subjectItem ${selectedSubject === subject ? 'selected' : ''}`}
                onClick={() => handleSubjectClick(subject)}
              >
                {subject}
                {selectedSubject === subject && <CheckIcon className="tickIcon" />}
              </div>
            ))}
          </div>
          </div>

          
          <div className="courseMaterialList">

            {/*WEBINAR CARDS DISPLAY */}
            <div className="webinarSection" style={{ width: "auto",height:'fit-content' }}>
              <div className="userCourseBoxPicture">
                <div>
                  <img
                    className="webinarImage"
                    src={defaultWebinarImg}
                    alt="Webinar"
                  />
                </div>
                <div className="webinarContent">
                  <div className="dateTimeDiv">
                    <div className="dateDiv">WEBINAR DATE</div>{" "}
                    <span className="border">|</span>
                    <div className="dateDiv">DATE FORMAT</div>
                  </div>
                  <div className="topicName">WEBINAR TEST</div>
                  <div className="subject">Subject: TEST</div>
                  <div className="subject">Speakers:TEST</div>
                  <div className="registrationTypeDiv">
                    <div className="freeRegText">Free Registration</div>
                    <div className="closeRegText">DATE</div>
                  </div>
                  <div className="registerRiv">
                    <div className="viewDetailsText">View Details</div>
                    <button className="registerButton">Register</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="webinarSection" style={{ width: "auto",height:'fit-content' }}>
              <div className="userCourseBoxPicture">
                <div>
                  <img
                    className="webinarImage"
                    src={defaultWebinarImg}
                    alt="Webinar"
                  />
                </div>
                <div className="webinarContent">
                  <div className="dateTimeDiv">
                    <div className="dateDiv">WEBINAR DATE</div>{" "}
                    <span className="border">|</span>
                    <div className="dateDiv">DATE FORMAT</div>
                  </div>
                  <div className="topicName">WEBINAR TEST</div>
                  <div className="subject">Subject: TEST</div>
                  <div className="subject">Speakers:TEST</div>
                  <div className="registrationTypeDiv">
                    <div className="freeRegText">Free Registration</div>
                    <div className="closeRegText">DATE</div>
                  </div>
                  <div className="registerRiv">
                    <div className="viewDetailsText">View Details</div>
                    <button className="registerButton">Register</button>
                  </div>
                </div>
              </div>
            </div>

            {/*WEBINAR CARDS END HERE */}

            
          </div>
        </div>
      </div>
      {/*FOOTER DETAILS */}

      <div className="footerDetails">
        <div className="OrgLogoDetails">
          <div>
            <img src={SoulLogo} alt="" />
          </div>
          <div>
            SkillLMS is created for creating, managing, and delivering online
            courses, enhancing interactive and personalized learning.
          </div>
        </div>
        <div className="navFooterDetails">
          <div onClick={handleHomeClick}>Home</div>
          <div onClick={handleCourseClick}>Courses</div>
          <div onClick={handleWebinarClick}>Webinars</div>
        </div>

        <div className="navFooterDetails">
          <div onClick={handleContactClick}>Contact Us</div>
          <div onClick={handlePrivacyOpen}>Privacy Policy</div>
          <div onClick={handleTermsOpen}>Terms & Conditions</div>
        </div>
        <TermsDialog open={isTermsOpen} onClose={handleTermsClose} />
        <PrivacyPolicyDialog open={isPrivacyOpen} onClose={handlePrivacyClose} />
      </div>

      {/*FOOTER  */}
      <div className="landingPageFooter">
        <div className="footerContent">
          <div className="footerNav footerMeta">
            <div className="footerItem footerLocale">
              <svg
                width="19"
                height="20"
                viewBox="0 0 19 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  alignItems: "center",
                  float: "left",
                  marginRight: "5px",
                }}
              >
                <path
                  d="M9.48901 0.567627C9.14844 0.567627 8.80811 0.585936 8.46948 0.622434C8.1591 0.654137 7.85253 0.70613 7.55008 0.76922C7.49155 0.781465 7.43298 0.794384 7.37445 0.807898C5.59245 1.21362 3.96529 2.12473 2.68809 3.43197C2.56932 3.55371 2.45305 3.67906 2.33935 3.80797C-1.11075 7.76881 -0.696703 13.7766 3.26417 17.2267C7.05619 20.5297 12.7641 20.3099 16.291 16.7251C16.41 16.6034 16.5262 16.478 16.6397 16.3491C18.1623 14.6152 19.0013 12.3861 19 10.0785C19 4.82576 14.7418 0.567587 9.48901 0.567627ZM3.11069 3.90752C3.16078 3.85553 3.21277 3.80575 3.26382 3.75534C3.32278 3.69733 3.38143 3.63899 3.44167 3.58288C3.49461 3.53342 3.54914 3.48587 3.60336 3.43768C3.66454 3.38346 3.72541 3.32925 3.78819 3.27694C3.84335 3.23034 3.9001 3.18564 3.95653 3.14062C4.01994 3.08989 4.08334 3.03917 4.14865 2.99035C4.20635 2.94691 4.265 2.90475 4.32397 2.86353C4.3896 2.81661 4.45554 2.76842 4.52243 2.72467C4.58235 2.68409 4.6429 2.64478 4.70377 2.60579C4.77162 2.56235 4.83978 2.51955 4.90858 2.47897C4.97052 2.442 5.03285 2.40562 5.09562 2.36991C5.16581 2.32997 5.23627 2.29097 5.30709 2.25293C5.37049 2.21913 5.4339 2.18604 5.4973 2.1537C5.56959 2.11724 5.6425 2.08205 5.71574 2.04749C5.77915 2.01737 5.84509 1.98726 5.9104 1.95872C5.9849 1.92702 6.06035 1.89532 6.13581 1.86361C6.20143 1.83667 6.26674 1.81035 6.333 1.78499C6.40972 1.75582 6.48739 1.72856 6.56507 1.70129C6.63133 1.67815 6.69759 1.65501 6.7648 1.63313C6.84374 1.60777 6.92331 1.58431 7.0032 1.56117C7.0701 1.54183 7.13636 1.52185 7.20357 1.50378C7.22925 1.49712 7.25493 1.49174 7.28061 1.48508C6.34219 2.39627 5.64579 3.52712 5.25446 4.77523C4.50198 4.57677 3.77352 4.29644 3.08216 3.93922C3.09262 3.92813 3.1015 3.91703 3.11069 3.90752ZM2.6548 4.41794C3.41635 4.83056 4.22391 5.15195 5.06075 5.37538C4.65051 6.80186 4.43517 8.27729 4.42066 9.76151H0.619454C0.688528 7.80428 1.40427 5.92515 2.6548 4.41794ZM2.6548 15.7391C1.40435 14.2319 0.688607 12.3528 0.619454 10.3956H4.42066C4.43517 11.8798 4.65047 13.3552 5.06075 14.7817C4.22395 15.0052 3.41639 15.3266 2.6548 15.7391ZM7.20167 18.6546C7.13763 18.6384 7.07137 18.6175 7.00542 18.5981C6.92521 18.5747 6.84469 18.5512 6.76543 18.5255C6.69854 18.504 6.6326 18.4808 6.56665 18.4577C6.48866 18.4307 6.41067 18.4032 6.33363 18.3737C6.26769 18.3486 6.2027 18.3223 6.13739 18.2957C6.06162 18.264 5.98585 18.2323 5.91071 18.2006C5.84604 18.1721 5.78168 18.1427 5.71764 18.1124C5.64377 18.0776 5.57022 18.0421 5.49572 18.0053C5.43231 17.9736 5.36891 17.9419 5.3055 17.9073C5.23385 17.869 5.16284 17.8297 5.09182 17.7891C5.02841 17.7539 4.96818 17.7177 4.90699 17.681C4.83724 17.6391 4.76877 17.596 4.70029 17.5519C4.64005 17.5136 4.57981 17.4746 4.52053 17.4346C4.453 17.389 4.38611 17.3414 4.31985 17.2939C4.26183 17.2523 4.20381 17.2108 4.14675 17.1671C4.08112 17.1176 4.01677 17.0666 3.95273 17.0152C3.89661 16.9705 3.84081 16.9261 3.78597 16.8801C3.72256 16.8275 3.66137 16.7727 3.59987 16.7181C3.54597 16.6703 3.49176 16.623 3.43913 16.5742C3.37858 16.5178 3.31993 16.4591 3.26096 16.4011C3.20992 16.3507 3.15793 16.3009 3.10784 16.2493C3.09864 16.2394 3.08977 16.2293 3.08057 16.2198C3.7719 15.8624 4.50036 15.5819 5.25287 15.3834C5.64429 16.6315 6.34065 17.7623 7.27902 18.6736C7.25334 18.6669 7.22735 18.6615 7.20167 18.6546ZM9.17202 18.9304C7.81544 18.7376 6.62625 17.3218 5.87806 15.2309C6.95977 14.9887 8.06364 14.8588 9.17202 14.8432V18.9304ZM9.17202 14.2092C7.99623 14.2246 6.82539 14.3643 5.67896 14.6257C5.28089 13.2503 5.0709 11.8273 5.05473 10.3956H9.17202V14.2092ZM9.17202 9.76151H5.05473C5.07086 8.32976 5.28085 6.90676 5.67896 5.53136C6.82539 5.79279 7.99627 5.93244 9.17202 5.94794V9.76151ZM9.17202 5.31387C8.0636 5.29842 6.95977 5.16847 5.87806 4.92614C6.62625 2.83532 7.81544 1.41945 9.17202 1.2267V5.31387ZM16.3233 4.41794C17.5738 5.92519 18.2895 7.80432 18.3586 9.76151H14.5574C14.5429 8.27729 14.3276 6.80186 13.9174 5.37538C14.7542 5.15183 15.5617 4.83048 16.3233 4.41794ZM11.7739 1.5022C11.8405 1.51868 11.9067 1.53961 11.9727 1.55895C12.0529 1.58241 12.1334 1.60587 12.2127 1.63155C12.2796 1.6531 12.3455 1.67625 12.4114 1.69939C12.4894 1.72634 12.5674 1.75392 12.6445 1.7834C12.7104 1.80845 12.7754 1.83476 12.8407 1.86139C12.9165 1.8931 12.9923 1.9248 13.0674 1.9565C13.1321 1.98504 13.1964 2.0144 13.2605 2.04464C13.3343 2.07951 13.4079 2.11502 13.4824 2.1518C13.5458 2.1835 13.6092 2.2152 13.6726 2.24976C13.7443 2.28812 13.8153 2.32743 13.8863 2.36801C13.9497 2.4032 14.0099 2.43934 14.0711 2.47612C14.1409 2.51797 14.2093 2.56108 14.2778 2.60515C14.3381 2.64351 14.3983 2.68251 14.4576 2.72245C14.5251 2.76811 14.5917 2.81534 14.6579 2.8629C14.7163 2.90443 14.7743 2.94628 14.8317 2.98971C14.897 3.03885 14.961 3.08989 15.0254 3.14125C15.0812 3.18564 15.1373 3.23002 15.1921 3.27631C15.2555 3.32894 15.3167 3.38378 15.3782 3.43831C15.4321 3.48618 15.4863 3.53342 15.539 3.58224C15.5995 3.63868 15.6582 3.69733 15.7171 3.75534C15.7682 3.80575 15.8202 3.85553 15.8703 3.9072C15.8795 3.91703 15.8883 3.92717 15.8975 3.93669C15.2062 4.29406 14.4777 4.57451 13.7252 4.77302C13.3331 3.52478 12.6358 2.39405 11.6965 1.48318C11.7222 1.48983 11.7482 1.49522 11.7739 1.5022ZM9.80608 1.2267C11.1627 1.41945 12.3518 2.83532 13.1 4.92614C12.0183 5.16835 10.9145 5.2983 9.80608 5.31387V1.2267ZM9.80608 5.94794C10.9819 5.93248 12.1527 5.79283 13.2991 5.53136C13.6972 6.90676 13.9072 8.32976 13.9234 9.76151H9.80608V5.94794ZM9.80608 10.3956H13.9234C13.9072 11.8273 13.6973 13.2503 13.2991 14.6257C12.1527 14.3643 10.9819 14.2246 9.80608 14.2092V10.3956ZM9.80608 18.9304V14.8432C10.9145 14.8587 12.0183 14.9886 13.1 15.2309C12.3518 17.3218 11.1627 18.7376 9.80608 18.9304ZM15.8674 16.2496C15.8173 16.3012 15.7656 16.351 15.7146 16.4014C15.6556 16.4594 15.5967 16.5181 15.5361 16.5745C15.4835 16.6237 15.4293 16.6696 15.3754 16.7188C15.3139 16.7733 15.2527 16.8278 15.1899 16.8805C15.1344 16.9268 15.078 16.9715 15.0216 17.0165C14.9582 17.0672 14.8948 17.1179 14.8295 17.1667C14.7718 17.2102 14.7131 17.2523 14.6541 17.2936C14.5885 17.3405 14.5226 17.3887 14.4557 17.4324C14.3958 17.473 14.3352 17.5123 14.2743 17.551C14.2065 17.5947 14.1381 17.637 14.0692 17.6778C14.0058 17.7149 13.9452 17.751 13.8828 17.7869C13.8126 17.8268 13.742 17.8658 13.671 17.9038C13.6076 17.9376 13.5442 17.9707 13.4808 18.0031C13.4085 18.0395 13.3356 18.0747 13.2624 18.1093C13.199 18.1394 13.133 18.1695 13.0677 18.198C12.9932 18.2298 12.9177 18.2615 12.8423 18.2932C12.7767 18.3198 12.7114 18.3464 12.6454 18.3715C12.5681 18.4009 12.4904 18.4285 12.4124 18.4555C12.3465 18.4786 12.2805 18.5018 12.2136 18.5233C12.1344 18.549 12.0551 18.5725 11.9743 18.5956C11.908 18.6153 11.8414 18.6349 11.7745 18.653C11.7489 18.6596 11.7232 18.665 11.6975 18.6717C12.6359 17.7605 13.3323 16.6297 13.7236 15.3815C14.4761 15.58 15.2046 15.8603 15.8959 16.2176C15.8855 16.229 15.8766 16.2401 15.8674 16.2496ZM16.3233 15.7391C15.5618 15.3265 14.7542 15.0051 13.9174 14.7817C14.3276 13.3552 14.5429 11.8798 14.5574 10.3956H18.3586C18.2896 12.3528 17.5738 14.2319 16.3233 15.7391Z"
                  fill="white"
                />
              </svg>
              English
            </div>

            <div className="footerItem urlNav">support@skilllms.com</div>
            <div className="footerItem urlNav">+91 7077769335</div>
            <div className="footerItem footerCopyright">&copy; 2026 SkillLMS.in</div>
          </div>
          <div className="footerNav footerSocial">
            <div className="socialIconWrap">
              <svg
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => handleUrlClick("https://www.facebook.com/SOUL.Limited/")}
              >
                <path
                  d="M3.03437 10.142C2.97172 10.142 1.59353 10.142 0.96708 10.142C0.632973 10.142 0.528564 10.0167 0.528564 9.70348C0.528564 8.86822 0.528564 8.01207 0.528564 7.1768C0.528564 6.8427 0.653855 6.73829 0.96708 6.73829H3.03437C3.03437 6.67564 3.03437 5.4645 3.03437 4.9007C3.03437 4.06543 3.18054 3.27193 3.59817 2.54107C4.03668 1.78933 4.66314 1.28817 5.45664 0.995827C5.97868 0.807892 6.50072 0.724365 7.06453 0.724365H9.11093C9.40327 0.724365 9.52856 0.849655 9.52856 1.142V3.52251C9.52856 3.81485 9.40327 3.94014 9.11093 3.94014C8.54713 3.94014 7.98332 3.94014 7.41952 3.96102C6.85571 3.96102 6.56337 4.23249 6.56337 4.81717C6.54249 5.44362 6.56337 6.04919 6.56337 6.69652H8.98564C9.31975 6.69652 9.44504 6.82181 9.44504 7.15592V9.6826C9.44504 10.0167 9.34063 10.1211 8.98564 10.1211C8.2339 10.1211 6.62601 10.1211 6.56337 10.1211V16.9285C6.56337 17.2835 6.45896 17.4088 6.08309 17.4088C5.20606 17.4088 4.34991 17.4088 3.47288 17.4088C3.15966 17.4088 3.03437 17.2835 3.03437 16.9703C3.03437 14.7777 3.03437 10.2046 3.03437 10.142Z"
                  fill="#F7F7EE"
                />
              </svg>
            </div>
            <div className="socialIconWrap">
              {" "}
              <svg
                width="18"
                height="14"
                viewBox="0 0 18 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => handleUrlClick("https://x.com/soul_limited ")}
              >
                <path
                  d="M17.5286 1.79559C16.8964 2.0729 16.2228 2.25671 15.5204 2.34596C16.2429 1.91459 16.7944 1.23671 17.0536 0.41965C16.38 0.821275 15.6363 1.10496 14.8436 1.26328C14.204 0.582213 13.2924 0.1604 12.2979 0.1604C10.3684 0.1604 8.815 1.72653 8.815 3.64646C8.815 3.92271 8.83838 4.18834 8.89575 4.44121C5.99831 4.2999 3.4345 2.91121 1.71219 0.795775C1.4115 1.31746 1.23513 1.91459 1.23513 2.5574C1.23513 3.7644 1.85669 4.83434 2.78319 5.45378C2.22325 5.44315 1.67394 5.28059 1.20856 5.02453C1.20856 5.03515 1.20856 5.04896 1.20856 5.06278C1.20856 6.7564 2.41663 8.16315 4.00081 8.48721C3.71713 8.56478 3.40794 8.60196 3.08706 8.60196C2.86394 8.60196 2.63869 8.58921 2.42725 8.54246C2.87881 9.92265 4.16019 10.9373 5.68381 10.9703C4.49806 11.8978 2.9925 12.4567 1.36263 12.4567C1.07681 12.4567 0.802689 12.444 0.528564 12.4089C2.07238 13.4045 3.902 13.9729 5.87506 13.9729C12.2883 13.9729 15.7946 8.6604 15.7946 4.05553C15.7946 3.90146 15.7893 3.75271 15.7818 3.60503C16.4735 3.11415 17.0547 2.50109 17.5286 1.79559Z"
                  fill="#F7F7EE"
                />
              </svg>
            </div>
            <div className="socialIconWrap">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => handleUrlClick("https://www.linkedin.com/company/soullimited/")}
              >
                <path
                  d="M15.5248 15.5666V15.5659H15.5285V10.0474C15.5285 7.3477 14.9531 5.26807 11.8288 5.26807C10.3268 5.26807 9.3189 6.10067 8.90741 6.89002H8.86396V5.52011H5.90161V15.5659H8.98623V10.5916C8.98623 9.28189 9.23201 8.01542 10.8376 8.01542C12.4197 8.01542 12.4432 9.5101 12.4432 10.6756V15.5666H15.5248Z"
                  fill="#F7F7EE"
                />
                <path
                  d="M0.752441 5.49219H3.88677V15.3429H0.752441V5.49219Z"
                  fill="#F7F7EE"
                />
                <path
                  d="M2.31961 0.56665C1.33087 0.56665 0.528564 1.36521 0.528564 2.34934C0.528564 3.33348 1.33087 4.14874 2.31961 4.14874C3.30835 4.14874 4.11065 3.33348 4.11065 2.34934C4.11003 1.36521 3.30773 0.56665 2.31961 0.56665V0.56665Z"
                  fill="#F7F7EE"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      </div>

      <LoginDialog
      open={isLoginOpen}
      onClose={() => setIsLoginOpen(false)}
    />
    </div>
  );
}
