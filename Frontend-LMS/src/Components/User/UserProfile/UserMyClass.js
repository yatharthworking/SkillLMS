import React, { useEffect, useState } from "react";
import './UserMyClass.css';
import { BACKEND_BASEURL } from "../../helper";
import axios from "axios";
import { BeatLoader } from "react-spinners";

export default function UserMyClass() {
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const userLoginResponse = JSON.parse(localStorage.getItem("UserLoginResponse"));
  const username = userLoginResponse.username;

  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userDetailsResponse = await axios.get(`${BACKEND_BASEURL}/student/fetchUserDetails?email=${username}`);
        const userDetailsData = userDetailsResponse.data;
        const studentId = userDetailsData.userDetailsId || null;
        setStudentId(studentId);

        if (studentId) {
          const batchInfoResponse = await axios.get(
            `${BACKEND_BASEURL}/student/getBatchInfo?studentId=${studentId}&organizationId=${organizationId}`
          );

          if (batchInfoResponse.status === 200) {
            setBatchInfo(batchInfoResponse.data.batchDetails);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, organizationId]);

  return (
    <div className='userMyClassPage'>
      <div className='userClassHeading'>My Class/Batch</div>
      {loading ? (
        <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BeatLoader color={"#219EBC"} size={15} />
        </div>
      ) : batchInfo ? (
        <div className='userClassContainer'>
          <div className="classContainer">
            <div className='courseName'>{batchInfo.batchName}</div>
            <div className='courseDate'>
              <span className='date'>Start Date: {batchInfo.batchStartDateTime}</span>
              <span className='date'>End Date: {batchInfo.batchEndDateTime}</span>
            </div>
            <div className='instituteName'>{batchInfo.organizationMasterName}</div>
          </div>
        </div>
      ) : (
        <div className='noBatchInfoContainer'>
          <div>No batch information available.</div>
        </div>
      )}
    </div>
  );
}

