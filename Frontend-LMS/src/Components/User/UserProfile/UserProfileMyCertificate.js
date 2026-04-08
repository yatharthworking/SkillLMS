import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BeatLoader } from "react-spinners";
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import "./UserProfileMyCertificate.css";
import SearchIcon from "../../../Assets/Images/searchIcon.svg";
import CertificateTemplate from "../../../Assets/Images/Certificate_Template.png";
import { BACKEND_BASEURL } from "../../helper";

export default function UserProfileMyCertificate() {
  const userLoginResponse = JSON.parse(
    localStorage.getItem("UserLoginResponse")
  );
  const username = userLoginResponse.username;
  const organisationName = process.env.REACT_APP_LMS_ORGANISATION_NAME;
  const [certificateList, setCertificateList] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificateFiller, setCertificateFiller] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BACKEND_BASEURL}/student/fetchCertificates?username=${username}`
        );
        if (response.status === 200) {
          console.log(response.data);
          setCertificateList(response.data.data);
          setUserInfo(response.data.userInfo);
        }
      } catch (error) {
        toast.error("Error Fetching Certificates!!!!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [username]);

  const generateCertificate = (certificate) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Context not found");
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = CertificateTemplate; // Use the uploaded image path

    img.onload = () => {
      console.log("Image loaded");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

    {/*  // Draw organization logo
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      logoImg.src = CompanyLogo; // Static logo image path
      logoImg.onload = () => {
        ctx.drawImage(logoImg, 640, 170, 150, 80); // Adjust position and size as needed
      };
      logoImg.onerror = () => {
        console.error("Error loading organization logo");
      };*/}

      if (certificate) {

        // ctx.textAlign = "center"; 


        ctx.font = "bold 44px Arial"; // Adjusted font size
        ctx.fillStyle = "black";
        const customerText = userInfo?.fullName;
        const customerNameX = (canvas.width - ctx.measureText(customerText).width) / 2; // Adjusted X position for name
        const customerNameY = 555; // Adjusted Y position for name
        ctx.fillText(customerText, customerNameX, customerNameY);

        ctx.font = " bold 30px Arial"; // Adjusted font size
        const courseText = certificate?.courseName;
        const courseNameX = 620; // Adjusted X position for course
        const courseNameY = 610; // Adjusted Y position for course
        ctx.fillText(courseText, courseNameX, courseNameY);

        ctx.font = "normal bold 30px Arial"; // Adjusted font size
        const dateText = organisationName;
        const dateX = 370; // Adjusted X position for date
        const dateY = 665; // Adjusted Y position for date
        ctx.fillText(dateText, dateX, dateY);

        ctx.font = "bold 30px Arial"; // Adjusted font size
        const certificateText = certificate.percentageSecured + "%";
        const certificateNumberX = 730; // Adjusted X position for certificate number
        const certificateNumberY = 720; // Adjusted Y position for certificate number
        ctx.fillText(certificateText, certificateNumberX, certificateNumberY);

        ctx.font = "bold 30px Arial"; // Adjusted font size
        const signatureText = certificate?.tutorName;
        const signatureNumberX = 1000; // Adjusted X position for certificate number
        const signatureNumberY = 800; // Adjusted Y position for certificate number
        ctx.fillText(signatureText, signatureNumberX, signatureNumberY);

        // Add the current date
        const currentDate = new Date();
        const formattedDate = 
          String(currentDate.getDate()).padStart(2, '0') + '-' +
          String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
          currentDate.getFullYear();
        
        ctx.font = "bold 30px Arial";
        const currentDateX = 300; // Adjusted X position for current date
        const currentDateY = 800; // Adjusted Y position for current date
        ctx.fillText(formattedDate, currentDateX, currentDateY);
      }
    };

    img.onerror = () => {
      console.error("Image load error");
    };
  };

  const handlePreview = (certificate) => {
    setCertificateFiller(certificate);
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (certificateFiller && previewOpen) {
      setTimeout(() => {
        generateCertificate(certificateFiller);
      }, 0); // Ensuring the canvas is rendered
    }
  }, [certificateFiller, previewOpen]);

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "Certificate.png";
    link.click();
  };

  const handleClose = () => {
    setPreviewOpen(false);
    setCertificateFiller(null);
  };

  const filteredCertificates = certificateList.filter(
    (certificate) =>
      certificate.courseName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      certificate.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="userProfileMyCertificatePage">
      <div className="certificateHeading">My Certificates</div>
      {loading ? (
        <div className="loadingContainer">
          <BeatLoader color={"#219EBC"} loading={loading} size={15} />
        </div>
      ) : (
        <>
          <div className="certificateSearch">
            <input
              className="courseSearchBox"
              placeholder="Search a courses or teacher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <img src={SearchIcon} alt="searchIcon" className="searchIcon" />
          </div>
          <div className="certificateSubContent">
            {filteredCertificates.map((certificate, index) => (
              <div key={index} className="smallBox">
                <div className="courseHeading">{certificate.courseName}</div>
                <div className="teacherName">By {certificate.tutorName}</div>
                <div className="grade">
                  Percentage Secured: {certificate.percentageSecured}%
                </div>
                <div style={{ paddingTop: "5%", display: "flex", gap: "5px" }}>
                  <button
                    className="certificateDownloadButton"
                    onClick={() => {
                      handlePreview(certificate);
                      setTimeout(() => downloadCertificate(), 500); // Delay to ensure canvas is ready
                    }}
                    startIcon={<DownloadIcon />}
                  >
                    Download Certificate
                  </button>
                  <button
                    className="certificatePreviewButton"
                    onClick={() => handlePreview(certificate)}
                  >
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{display:'flex',width:'100%'}}
                    >
                      <g clip-path="url(#clip0_2894_6159)">
                        <path
                          d="M1.16602 8C1.16602 8 3.83268 2.66666 8.49935 2.66666C13.166 2.66666 15.8327 8 15.8327 8C15.8327 8 13.166 13.3333 8.49935 13.3333C3.83268 13.3333 1.16602 8 1.16602 8Z"
                          stroke="#219EBC"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8.5 10C9.60457 10 10.5 9.10457 10.5 8C10.5 6.89543 9.60457 6 8.5 6C7.39543 6 6.5 6.89543 6.5 8C6.5 9.10457 7.39543 10 8.5 10Z"
                          stroke="#219EBC"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2894_6159">
                          <rect
                            width="16"
                            height="16"
                            fill="white"
                            transform="translate(0.5)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Dialog
            open={previewOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <div className="modal-title">
                <div>Preview Certificate</div>
                <button className="close-button" onClick={handleClose}>
                  &#x2716;
                </button>
              </div>
            </DialogTitle>
            <DialogContent>
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "auto",
                }}
              ></canvas>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
