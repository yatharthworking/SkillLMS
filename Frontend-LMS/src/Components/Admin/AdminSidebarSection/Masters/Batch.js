import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parse } from 'date-fns';
import { BeatLoader } from 'react-spinners';
import './Batch.css';
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Plus from "../../../../Assets/Images/plus.svg";
import fiClose from "../../../../Assets/Images/fi_close.svg";
import UpcomingBatch from './Batch/UpcomingBatch';
import OngoingBatch from './Batch/OngoingBatch';
import CompletedBatch from './Batch/CompletedBatch';
import Select from 'react-select';
import { BACKEND_BASEURL, adminDetails } from "../../../helper.js";

function Batch() {
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const token = localStorage.getItem("token");
  const userId = adminDetails?.userDetailsId;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const [activeTab, setActiveTab] = useState('ongoing');
  const [upcomingBatches, setUpcomingBatches] = useState([]);
  const [ongoingBatches, setOngoingBatches] = useState([]);
  const [completedBatches, setCompletedBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [batchDetails, setBatchDetails] = useState({
    batchId: null,
    batchName: '',
    batchCapacity: '',
    batchStartDateTime: '',
    batchEndDateTime: '',
    isActive: true,
    branchId: ''
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=${userId}`)
      .then(response => {
        const data = response.data;
        if (data.status) {
          setOrganizations(data.data);
          if (data.data?.length > 0) {
            setSelectedBranchId(data.data[0].orgId);
            setSelectedBranchName(data.data[0].orgName);
          }
        }
      })
      .catch(error => {
        console.error("There was an error fetching the organizations!", error);
      });
  }, [organizationId]);

  const handleBranchChangeMaster = (e) => {
    const branchName  = e.target.value;
    const selectedOrganization = organizations.find(
      (org) => org.orgName === branchName
    );

    console.log("selectedOrganization",selectedOrganization)
    if (selectedOrganization) {
      setSelectedBranchId(selectedOrganization.orgId);
      setSelectedBranchName(selectedOrganization.orgName);
    }
    setUpcomingBatches([]);
    setOngoingBatches([]);
    setCompletedBatches([]);
  };

  useEffect(() => {
    if (selectedBranchId) {
      fetchBatches();
    } else {
      setUpcomingBatches([]);
      setOngoingBatches([]);
      setCompletedBatches([]);
    }
  }, [selectedBranchId]);

  const fetchBatches = () => {
    if (!selectedBranchId) {
      return;
    }

    setLoading(true);
    const fetchOngoingBatches = axios.get(`${BACKEND_BASEURL}/admin/batch/fetchAllOngoingBatches?orgId=${selectedBranchId}`);
    const fetchUpcomingBatches = axios.get(`${BACKEND_BASEURL}/admin/batch/fetchAllUpcomingBatches?orgId=${selectedBranchId}`);
    const fetchCompletedBatches = axios.get(`${BACKEND_BASEURL}/admin/batch/fetchAllCompletedBatches?orgId=${selectedBranchId}`);

    Promise.all([fetchOngoingBatches, fetchUpcomingBatches, fetchCompletedBatches])
      .then(responses => {
        const ongoingData = responses[0].data;
        const upcomingData = responses[1].data;
        const completedData = responses[2].data;

        if (ongoingData.status) {
          setOngoingBatches(ongoingData.ongoingBatches);
        } else {
          setOngoingBatches([]);
        }

        if (upcomingData.status) {
          setUpcomingBatches(upcomingData.upcomingBatches);
        } else {
          setUpcomingBatches([]);
        }

        if (completedData.status) {
          setCompletedBatches(completedData.completedBatches);
        } else {
          setCompletedBatches([]);
        }
      })
      .catch(error => {
        console.error("There was an error fetching the batches!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filterBatches = (batches) => {
    return batches.filter(batch =>
      batch.batchName.toLowerCase().includes(searchInput.toLowerCase()) ||
      batch.branchName.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const handleEdit = (batch) => {
    setIsEditing(true);
    setBatchDetails({
      batchId: batch.batchId,
      batchName: batch.batchName,
      batchCapacity: batch.batchCapacity,
      batchStartDateTime: format(parse(batch.batchStartDateTime, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd'),
      batchEndDateTime: format(parse(batch.batchEndDateTime, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd'),
      isActive: batch.isActive,
      branchId: batch.branchId
    });
    setShowDialog(true);
  };

  const handleDelete = (batch) => {
    setBatchToDelete(batch);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (batchToDelete) {
      axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateBatches`, {
        ...batchToDelete,
        isActive: false
      })
        .then(response => {
          if (response.data.status) {
            fetchBatches();
            setShowConfirmDialog(false);
          }
        })
        .catch(error => {
          console.error("There was an error deleting the batch!", error);
        });
    }
  };

  const handleSubmit = () => {
    const postData = {
      ...batchDetails,
      batchCapacity: parseInt(batchDetails.batchCapacity) || 99999,
      batchStartDateTime: format(new Date(batchDetails.batchStartDateTime), 'dd-MM-yyyy HH:mm'),
      batchEndDateTime: format(new Date(batchDetails.batchEndDateTime), 'dd-MM-yyyy HH:mm'),
      branchId: parseInt(batchDetails.branchId)
    };

    axios.post(`${BACKEND_BASEURL}/admin/saveOrUpdateBatches`, postData)
      .then(response => {
        if (response.data.status) {
          fetchBatches();
          setShowDialog(false);
        }
      })
      .catch(error => {
        console.error("There was an error saving the batch!", error);
      });
  };

  const openDialog = () => {
    setIsEditing(false);
    setBatchDetails({
      batchId: null,
      batchName: '',
      batchCapacity: '',
      batchStartDateTime: '',
      batchEndDateTime: '',
      isActive: true,
      branchId: ''
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleRadioChange = (event) => {
    setBatchDetails({
      ...batchDetails,
      batchCapacity: event.target.value === 'limited' ? '' : 99999
    });
  };

  const handleLimitInputChange = (event) => {
    setBatchDetails({
      ...batchDetails,
      batchCapacity: event.target.value
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBatchDetails({
      ...batchDetails,
      [name]: value
    });
  };

  const handleBranchChange = (selectedOption) => {
    setBatchDetails({
      ...batchDetails,
      branchId: selectedOption ? selectedOption.value : ''
    });
  };

  const branchOptions = organizations.map(org => ({
    value: org.orgId,
    label: org.orgName
  }));

  return (
    <>
      <div className='PageMainContain'>
        <div className='webinar_Section'>
          <div className="PageHeadlineBar">
            <div className='HeadLineSearchCombo'>
              <div className='Headline'>Batch</div>

              {/* Dropdown for Branches */}
              <div >
                <select
                  className='selectedBranchDD'
                  name="selectedBranchName"
                  value={selectedBranchName}
                  onChange={handleBranchChangeMaster}
                >
                  <option value="" disabled>Select Branch</option>
                  {organizations?.map((item, index) => (
                    <option value={item.orgName} key={index}>{item.orgName}</option>
                  ))}
                </select>
              </div>

              <div className="batchsSearchBox">
                <input
                  className="batchSearchInput"
                  placeholder="Search batch"
                  value={searchInput}
                  onChange={handleSearchChange}
                />
                <img src={SearchIcon} alt="Search" />
              </div>
            </div>
            <div onClick={openDialog} className='addButtonDiv'>
            <img src={Plus} alt="Add" />
            <div className='webinarButton'>Add Batch</div>
          </div>

          </div>

        </div>

        <div className="borderLineBlue"></div>

        <div style={{ height: '65vh' }} className='TableWhiteContainer'>
          <div className="tabContainer">
            <div className="tabs">
              <div
                className={`tabButton ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({filterBatches(upcomingBatches).length})
              </div>
              <div
                className={`tabButton ${activeTab === 'ongoing' ? 'active' : ''}`}
                onClick={() => setActiveTab('ongoing')}
              >
                Ongoing ({filterBatches(ongoingBatches).length})
              </div>
              <div
                className={`tabButton ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({filterBatches(completedBatches).length})
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loaderContainer" >
              <BeatLoader color="#123abc" loading={loading} size={15} />
            </div>
          ) : (
            <>
              {activeTab === 'upcoming' && <UpcomingBatch batches={filterBatches(upcomingBatches)} onEdit={handleEdit} onDelete={handleDelete} />}
              {activeTab === 'ongoing' && <OngoingBatch batches={filterBatches(ongoingBatches)} onEdit={handleEdit} onDelete={handleDelete} />}
              {activeTab === 'completed' && <CompletedBatch batches={filterBatches(completedBatches)} onEdit={handleEdit} onDelete={handleDelete} />}
            </>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <div className='announcmentHeader'>{isEditing ? 'Edit Batch' : 'Create New Batch'}</div>
              <span className="dialog-close" onClick={closeDialog}><img src={fiClose} alt='' /></span>
            </div>
            <div className='border2'></div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputFiled'>
                  <label className='labelText'>Branch<span className='mandatoryFiled'>*</span></label>
                  <Select
                    className='searchDropDownField'
                    name="branchId"
                    value={branchOptions.find(option => option.value === batchDetails.branchId)}
                    onChange={handleBranchChange}
                    options={branchOptions}
                    isClearable
                    placeholder="Select a Branch"
                  />
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>Batch Name<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='inputFieldTextTitle'
                    placeholder='Enter Batch Name'
                    name="batchName"
                    value={batchDetails.batchName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputFiled'>
                  <label className='labelText'>Start Date<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="date"
                    className='inputFieldText1'
                    name="batchStartDateTime"
                    value={batchDetails.batchStartDateTime}
                    onChange={handleInputChange}
                  />
                </div>

                <div className='inputFiled'>
                  <label className='labelText'>End Date<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="date"
                    className='inputFieldText1'
                    name="batchEndDateTime"
                    value={batchDetails.batchEndDateTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className='dialogBox'>
              <div className="dialog-body">
                <div className='inputField'>
                  <label className='labelText'>
                    Student Limit
                    <span className='mandatoryField'>*</span>
                  </label>
                  <div className='limitOptions'>
                    <label>
                      <input
                        type="radio"
                        value="noLimit"
                        checked={batchDetails.batchCapacity === 99999}
                        onChange={handleRadioChange}
                      /> No Limit
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="limited"
                        checked={batchDetails.batchCapacity !== 99999}
                        onChange={handleRadioChange}
                      /> Limited
                    </label>
                    {batchDetails.batchCapacity !== 99999 && (
                      <div className='limitedInput'>
                        <input
                          type="text"
                          className='inputFieldText1'
                          placeholder='Enter limit'
                          value={batchDetails.batchCapacity}
                          onChange={handleLimitInputChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button onClick={closeDialog} className='cancelAnnouncment'>Cancel</button>
              <button onClick={handleSubmit} className='createAnnouncment'>{isEditing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <div className='announcmentHeader'>Confirm Delete</div>
              <span className="dialog-close" onClick={closeConfirmDialog}><img src={fiClose} alt='' /></span>
            </div>
            <div className='border2'></div>
            <div className='dialogBox'>
              <div className="dialog-body">
                <p>Are you sure to delete?</p>
              </div>
              <div className="dialog-footer">
                <button onClick={closeConfirmDialog} className='cancelButton'>Cancel</button>
                <button onClick={confirmDelete} className='submitButton'>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Batch;
