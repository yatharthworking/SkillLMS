import React, { useEffect, useState } from "react";
import "./WebinarDetail.css";
import Navbar from "../../Navbar/Navbar";
import UserSidebar from "../UserSideBar/UserSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import LeftArrow from "../../../Assets/Images/leftArrow.svg";
import registerIcon from "../../../Assets/Images/registeredIcon.svg";
import axios from "axios";
import { BACKEND_BASEURL, getFromLocalStorageSafe } from "../../helper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultWebinarImg from "../../../Assets/Images/webinardefaultImg.svg";
import {
  formatDate,
  formatTimeRange,
  getJoinButtonLabel,
  getRegistrationFeeLabel,
  getRegistrationStatus,
  getSubjectName,
  getWebinarImageSrc,
  isJoinDisabled,
} from "../webinarUtils";

function WebinarDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const webinar = location.state?.webinarResponse;
  const tab = location.state?.activeTab || "all";

  const [selectedBox, setSelectedBox] = useState("webinars");
  const [selectedSubBox, setSelectedSubBox] = useState("");
  const [isRegistered, setIsRegistered] = useState(tab === "Registered" || tab === "Attended");

  const token = localStorage.getItem("token");
  const registrationStatus = getRegistrationStatus(webinar);
  const joinButtonLabel = getJoinButtonLabel(webinar?.webinarStartTime, webinar?.webinarEndTime);
  const showJoinAction = tab !== "Attended" && (tab === "Registered" || (tab === "all" && isRegistered));

  const getAuthConfig = () =>
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};

  const getCurrentUser = () => {
    const user = getFromLocalStorageSafe("UserLoginResponse");
    return user?.username ? user : null;
  };

  useEffect(() => {
    if (!webinar) {
      navigate("/userLandingPage", {
        state: {
          selectedBox: "webinars",
          activeTab: tab,
        },
      });
    }
  }, [navigate, tab, webinar]);

  const handleGoToUserWebinars = () => {
    navigate("/userLandingPage", {
      state: {
        selectedBox: "webinars",
        activeTab: tab,
      },
    });
  };

  const handleRegisterClick = async () => {
    const user = getCurrentUser();

    if (!user?.username || !webinar?.webinarInfoId) {
      toast.error("Unable to register for this webinar.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_BASEURL}/webinar/registerForWebinar`,
        {
          webinarId: webinar?.webinarId,
          webinarInfoId: webinar?.webinarInfoId,
          username: user.username,
        },
        getAuthConfig()
      );

      if (response.status === 200) {
        setIsRegistered(true);
        toast.success("Successfully registered!");
      }
    } catch (error) {
      console.error("There was an error registering for the webinar", error);
      toast.error(error?.response?.data?.message || "Failed to register.");
    }
  };

  const handleJoinWebinar = async () => {
    const user = getCurrentUser();

    if (!user?.username || !webinar?.webinarInfoId) {
      toast.error("Unable to join this webinar.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_BASEURL}/webinar/joinWebinar`,
        {
          webinarId: webinar?.webinarId,
          webinarInfoId: webinar?.webinarInfoId,
          username: user.username,
        },
        getAuthConfig()
      );

      if (response.status === 200) {
        const meetingLink = webinar?.meetingLink || response?.data?.meetingLink;

        toast.success("Successfully joined!");

        if (meetingLink) {
          window.open(meetingLink, "_blank", "noopener,noreferrer");
        } else {
          toast.info("Meeting link is not available yet.");
        }
      }
    } catch (error) {
      console.error("There was an error joining the webinar", error);
      toast.error(error?.response?.data?.message || "Failed to join.");
    }
  };

  if (!webinar) {
    return null;
  }

  return (
    <div className="webinarDetailPage">
      <div>
        <Navbar />
      </div>

      <div className="webinarDetailPageContainer">
        <div className="UserSidebarSection">
          <UserSidebar
            selectedBox={selectedBox}
            setSelectedBox={setSelectedBox}
            selectedSubBox={selectedSubBox}
            setSelectedSubBox={setSelectedSubBox}
          />
        </div>

        <div className="webinarHomeSection">
          <ToastContainer />

          <div className="webinarHomeSectionContainer">
            <div className="webinarDetailHeaderSection">
              <button className="backButton" onClick={handleGoToUserWebinars}>
                <img src={LeftArrow} alt="" />
              </button>

              <div className="webinarBreadcrumSection">
                <span className="webinarbreadcrumNotSelectedTxt">Webinar</span>
                <span className="breadcrumSeperator">/</span>
                <span className="webinarbreadcrumSelectedTxt">{webinar?.webinarName}</span>
              </div>
            </div>

            <div className="webinarDetailContentSection">
              <div className="webinarcontentHeaderSection">
                <div className="webinarcontentHeaderBox">
                  <div className="webinarcontentHeaderPicture">
                    <img
                      src={getWebinarImageSrc(webinar?.webinarImage || webinar?.webinarImageDB, defaultWebinarImg)}
                      alt="Webinar"
                    />
                  </div>

                  <div className="webinarcontentHeaderDetails">
                    <div className="webinarcontentHeaderDetailsBox">
                      <div className="webinarcontentHeaderDetailsBoxRow">
                        <div className="dateTimeDiv">
                          <div className="dateDiv">{formatDate(webinar?.webinarDate)}</div>
                          <span className="border">|</span>
                          <div className="dateDiv">{formatTimeRange(webinar?.webinarStartTime, webinar?.webinarEndTime)}</div>
                        </div>

                        <div className="topicName">{webinar?.webinarName}</div>
                        <div className="subject">Subject: {getSubjectName(webinar)}</div>
                        <div className="registeredDiv">
                          <img src={registerIcon} alt="registered" />

                          <div className="registersubDiv">
                            <div className="registerNo">{webinar?.webinarRegistrations ?? 0}</div>
                            <div className="subject">Registered</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="webinarRegistrationTypeSection">
                      <div className="registrationTypeSection">
                        <div className="freeRegText">{getRegistrationFeeLabel(webinar)}</div>

                        {tab === "all" && !isRegistered && (
                          <div className="registationCloseTime">({registrationStatus.label})</div>
                        )}
                      </div>

                      {tab === "all" && !isRegistered && registrationStatus.canRegister && (
                        <button className="registerButtonDiv" onClick={handleRegisterClick}>
                          Register
                        </button>
                      )}

                      {tab === "all" && !isRegistered && !registrationStatus.canRegister && (
                        <div className="expiredTextCentered">{registrationStatus.label}</div>
                      )}

                      {showJoinAction && joinButtonLabel !== "Expired" && (
                        <button
                          className="registerButtonDiv"
                          disabled={isJoinDisabled(webinar?.webinarStartTime)}
                          onClick={handleJoinWebinar}
                        >
                          {joinButtonLabel}
                        </button>
                      )}

                      {showJoinAction && joinButtonLabel === "Expired" && (
                        <div className="expiredTextCentered">Expired</div>
                      )}

                      {tab === "Attended" && <div className="freeRegText">Attended</div>}
                    </div>
                  </div>
                </div>

                <div className="webinarSpreakerDiv">
                  <div className="webinarDescriptionSection">
                    <div className="webinarDescriptionHeader">Speakers</div>

                    <div className="speakerDetailsDiv">
                      {Array.isArray(webinar?.speakers) && webinar.speakers.length > 0 ? (
                        webinar.speakers.map((speaker, index) => (
                          <div key={speaker?.speakerId || `${speaker?.name}-${index}`} className="speckerDetailsDescription">
                            <div className="speakersDetails" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <span>{index + 1}.</span>
                              <div>{speaker?.name}</div>
                            </div>
                            <div className="speakerName">[{speaker?.designation || "-"}]</div>
                            <div className="speakerName">{speaker?.about || "-"}</div>
                          </div>
                        ))
                      ) : (
                        <div className="speakerName">No speakers added.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="webinarSpreakerDiv">
                  <div className="webinarDescriptionSection">
                    <div className="webinarDescriptionHeader">Key Takeaways</div>

                    {Array.isArray(webinar?.keyTakeaways) && webinar.keyTakeaways.length > 0 ? (
                      webinar.keyTakeaways.map((takeaway, index) => (
                        <div key={takeaway?.keytakeawayId || `${takeaway?.keyTakeaway}-${index}`} className="chapterNameSection">
                          <span className="webinarKeys">{index + 1}.</span>
                          <span className="webinarKeys">{takeaway?.keyTakeaway}</span>
                        </div>
                      ))
                    ) : (
                      <div className="speakerName">No key takeaways added.</div>
                    )}
                  </div>
                </div>

                <div className="webinarSpreakerDiv">
                  <div className="webinarDescriptionSection">
                    <div className="webinarDescriptionHeader">Who Should Attend</div>

                    {Array.isArray(webinar?.audiences) && webinar.audiences.length > 0 ? (
                      webinar.audiences.map((audience, index) => (
                        <div key={audience?.audienceId || `${audience?.audience}-${index}`} className="joinSectionText">
                          <span className="webinarKeys">{index + 1}.</span>
                          <span className="webinarKeys">{audience?.audience}</span>
                        </div>
                      ))
                    ) : (
                      <div className="speakerName">No audience details added.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebinarDetail;
