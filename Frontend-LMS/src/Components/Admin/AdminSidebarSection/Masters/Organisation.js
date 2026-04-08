import React, { useState, useEffect } from 'react';
import './Organisation.css';
import './Masters.css';
import orgDefault from '../../../../Assets/Images/org.svg';
import Plus from "../../../../Assets/Images/plus.svg";
import SearchIcon from "../../../../Assets/Images/searchIcon.svg";
import Action from "../../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import axios from 'axios';
import editIcon from '../../../../Assets/Images/fi_edit.svg';
import { BACKEND_BASEURL, 
  // ADMIN_ENDPOINT, TEACHER_ENDPOINT, 
  getFromLocalStorageSafe } from '../../../helper.js';
import fiClose from "../../../../Assets/Images/fi_close.svg";
import { ToastContainer, toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function Organisation() {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [branches, setBranches] = useState([]);
  const [orgImage, setOrgImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingSaveBranch, setLoadingSaveBranch] = useState(false);
  const [loadingUpdateOrg, setLoadingUpdateOrg] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [orgData, setOrgData] = useState({
    organizationName: '',
    contact: '',
    organizationImage: null,
  });
 
  const organizationId = process.env.REACT_APP_ORGANISATION_ID;
  const [branchData, setBranchData] = useState({
    orgName: '',
    orgCode: '',
    orgAddress: '',
    orgCity: '',
    orgState: '',
    orgCountry:'',
    orgPincode: '',
    orgContactNo: '',
    orgLatitude: '',
    orgLongitude: '',
    orgCurrency: '',
    isActive: '',
  });

  // const endpoint = role === 'ADMIN' ? ADMIN_ENDPOINT : role === 'TEACHER' ? TEACHER_ENDPOINT : '';
  const token = localStorage.getItem('token');
  const adminLoginResponse = getFromLocalStorageSafe('AdminLoginResponse');
  const storedAdminDetails = getFromLocalStorageSafe('adminDetails');
  const userName = adminLoginResponse?.username || '';
  const actorUserId = storedAdminDetails?.userDetailsId ?? null;
  const authConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

  const toNullableNumber = (value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  };

  const buildBranchRequestPayload = (isBranchActive) => ({
    orgId: branchData?.orgId ?? null,
    orgName: branchData?.orgName,
    orgCode: branchData?.orgCode,
    orgAddress: branchData?.orgAddress,
    orgCity: branchData?.orgCity,
    orgState: branchData?.orgState,
    orgCountry: branchData?.orgCountry,
    orgPincode: branchData?.orgPincode,
    orgContactNo: branchData?.orgContactNo,
    orgLatitude: toNullableNumber(branchData?.orgLatitude),
    orgLongitude: toNullableNumber(branchData?.orgLongitude),
    orgCurrency: branchData?.orgCurrency,
    isActive: isBranchActive,
  });

  const buildOrganizationRequestBody = (organizationGroups = [], auditFields = {}) => ([
    {
      organizationId: orgData?.organizationId,
      organizationName: orgData?.organizationName,
      organizationCode: orgData?.organizationCode,
      isActive: orgData?.isActive,
      contact: orgData?.contact,
      organizationImage: orgData?.organizationImage,
      organizationGroups,
      ...auditFields,
    },
  ]);
  
  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrganizationData();
    fetchBranches();
  }, [organizationId, token]);

  const fetchOrganizationData = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_BASEURL}/admin/fetchOrganizationMaster?organizationMasterId=${organizationId}`,
        authConfig
      );
      const data = response.data.data;
      setOrgData(data);
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const fetchBranches = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_BASEURL}/admin/fetchOrganizationsBranches?organizationMasterId=${organizationId}&userId=0`,
        authConfig
      );
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) { 
      setOrgImage(URL.createObjectURL(file));
    }
  };

  const handleInputBranchChange = (event) => {
    const { name, value } = event.target;
    setBranchData({
      ...branchData,
      [name]: value,
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setOrgData({
      ...orgData,
      [name]: value,
    });
  };

  const handleClearBranchData = () => {
    setBranchData({
      orgName: '',
      orgCode: '',
      orgAddress: '',
      orgCity: '',
      orgState: '',
      orgCountry:'',
      orgPincode: '',
      orgContactNo: '',
      orgLatitude: '',
      orgLongitude: '',
      orgCurrency: '',
      isActive: '',
    });
  }

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleActionClick = (event, branch) => {
    setMenuAnchor(event.currentTarget);
    setBranchData(branch);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowDialog(true);
    setMenuAnchor(null);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    handleClearBranchData();
    setShowDialog(false);
  };

  const filteredBranches = branches.filter(branch =>
    branch.orgName.toLowerCase().includes(searchQuery.toLowerCase())||
    branch.orgAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Save New Branch
  const handleSaveNewBranch = async () => {
    if (!token) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    if (!branchData.orgName || !branchData.orgCode || !branchData.orgAddress || !branchData.orgCity ||
      !branchData.orgState || !branchData.orgCountry || !branchData.orgPincode || !branchData.orgContactNo ||!branchData.orgCurrency) {
      toast.error("Please Fill required Details!");
      return;
    }

    setLoadingSaveBranch(true);
    
    const requestBody = buildOrganizationRequestBody(
      [
        {
          ...buildBranchRequestPayload(true),
          orgId: isEditing ? branchData?.orgId : null,
        },
      ],
      isEditing ? { updatedBy: actorUserId } : { createdBy: actorUserId }
    );

    try {
      const response = await axios.post(
        `${BACKEND_BASEURL}/admin/saveOrUpdateOrganization`,
        requestBody,
        authConfig
      );
      if (response.status === 200) {
        if(isEditing === true){
          toast.success("Branch Updated successfully");
        }
        else{
          toast.success("New Branch Created successfully");
        }
        fetchBranches();
        handleClearBranchData();
        handleDialogClose();
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      toast.error(error?.response?.status === 401 ? "Unauthorized. Please log in again." : "Unable to save branch.");
    } finally {
      setLoadingSaveBranch(false);
    }
  };

    //Delete New Branch
    const handleDeleteBranch = async () => {  
      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      setLoadingSaveBranch(true);
      
      const requestBody = buildOrganizationRequestBody(
        [
          {
            ...buildBranchRequestPayload(false),
            orgId: branchData?.orgId,
          },
        ],
        { updatedBy: actorUserId }
      );
  
      try {
        const response = await axios.post(
          `${BACKEND_BASEURL}/admin/saveOrUpdateOrganization`,
          requestBody,
          authConfig
        );
        if (response.status === 200) {
          toast.success("Branch Deleted successfully");
          fetchBranches();
          handleClearBranchData();
          handleDeleteClose();
        }
      } catch (error) {
        console.error("Error deleting branch:", error);
        toast.error(error?.response?.status === 401 ? "Unauthorized. Please log in again." : "Unable to delete branch.");
      } finally {
        setLoadingSaveBranch(false);
      }
    };
  


  //Update Organization
  const handleUpdateOrganization= async () => {
    if (!token) {
      toast.error("Your session has expired. Please log in again.");
      return;
    }

    if (!orgData.organizationName || !orgData.organizationId) {
      toast.error("Please Fill required Details!");
      return;
    }

    setLoadingUpdateOrg(true);
    const requestBody = buildOrganizationRequestBody([], {
      updatedBy: actorUserId,
      userName,
    });

    try {
      const response = await axios.post(
        `${BACKEND_BASEURL}/admin/saveOrUpdateOrganization`,
        requestBody,
        authConfig
      );
      if (response.status === 200) {
        toast.success("Organization Updated successfully");
        fetchOrganizationData();
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error(error?.response?.status === 401 ? "Unauthorized. Please log in again." : "Unable to update organization.");
    } finally {
      setLoadingUpdateOrg(false);
    }
  };


  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setMenuAnchor(null);
  };


  return (
    <>
      <div className='PageMainContain'>
      <ToastContainer />
        <div className="PageHeadlineBar">
          <div className='Headline'>Organisation</div>
        </div>
        <div className="borderLineBlue"></div>

        <div className='ContentContainerOrg'>
          <div className="OrgImageContainer">
            <label htmlFor="imageUpload">
              <img
                style={{ height: 'auto', width: '120px', cursor: 'pointer' }}
                src={orgData.organizationImage ? `data:image/jpeg;base64,${orgData.organizationImage}` : orgDefault}
                alt="LOGO"
              />
              <img className="EditIcon" src={editIcon} alt="Edit" />
            </label>
            <input type="file" id="imageUpload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>
          <div className='OrgNameBox'>
            <div className='OrgNameText'>Organization Name</div>
            <input
              type="text"
              name="organizationName"
              placeholder="Organisation Name"
              className="InputOrgName"
              value={orgData.organizationName}
              onChange={handleInputChange}
            />
          </div>
          <div className='OrgContactBox'>
            <div className='OrgNameText'>Contact Number</div>
            <input
              type="text"
              name="contact"
              placeholder="Contact Number"
              className="InputOrgName"
              value={orgData.contact}
              onChange={handleInputChange}
            />
          </div>
          <div style={{ paddingTop: '24px' }}>
            <div className='UpdateBtn' onClick={handleUpdateOrganization}>
              {loadingUpdateOrg ? <CircularProgress size={20}  style={{color:'#219EBC'}}/> : 'Update'}
            </div>
          </div>
        </div>

        <div className='SearchSection'>
          <div className='HeaderAndSearchSection'>
            <div className='HeaderText'>Branches</div>
            <div className="SearchBox">
              <input
                className="SearchInputBox"
                placeholder="Search Branch Name / Location"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <img src={SearchIcon} alt="Search" />
            </div>
          </div>
          <div className='BtnSection' onClick={handleAddClick}>
            <img src={Plus} alt="Add" />
            <div className='webinarButton'>Add Branch</div>
          </div>
        </div>

        <div style={{ height: '40vh' }} className='TableWhiteContainer'>
          <table className='Table'>
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Contact Number</th>
                <th>Currency</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => (
                <tr key={branch.orgId}>
                  <td>{branch.orgName}</td>
                  <td>{branch.orgAddress}, {branch.orgCity}, {branch.orgState} - {branch.orgPincode}</td>
                  <td>{branch.orgContactNo}</td>
                  <td>{branch.orgCurrency}</td>
                  <td style={{ color: branch.isActive ? '#16A42D' : '#E72755' }}>{branch.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <img src={Action} alt="Action" style={{ cursor: 'pointer' }} onClick={(e) => handleActionClick(e,branch)} />
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem style={{ fontSize: '14px', cursor: 'pointer' }} onClick={() => handleEditClick()}>Edit</MenuItem>
                      {/* <MenuItem style={{ fontSize: '14px', cursor: 'pointer' }} onClick={handleMenuClose}>View Details</MenuItem> */}
                      <MenuItem style={{ fontSize: '14px', cursor: 'pointer' }}  onClick={() => setDeleteOpen(true)}>Delete</MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDialog && (
          <div className="branchDialog-overlay">
            <div className="branchDialog-content">
              <div className="brancgDialog-header">
                <div>{isEditing ? "Edit Branch" : "Create New Branch"}</div>
                <img src={fiClose} alt="Close" onClick={handleDialogClose} style={{ cursor: 'pointer' }} />
              </div>
              <div className='border2'></div>
              <div className="branchDialog-body">
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Branch Name<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='branchInputFieldText'
                    placeholder='Branch Name'
                    name="orgName"
                    value={branchData.orgName}
                    onChange={handleInputBranchChange}
                    required
                  />
                </div>

                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Branch Code<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='branchInputField'
                    placeholder='Branch Code'
                    name="orgCode"
                    value={branchData.orgCode}
                    onChange={handleInputBranchChange}
                    required
                  />
                </div>

                
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Contact Number<span className='mandatoryFiled'>*</span></label>
                  <div className='branchContactBox'>
                    <select
                      className='branchContactSelectOneMenuField'
                      // name="orgContactNo"
                      // value={}
                      onChange={handleInputBranchChange}
                      required
                    >
                      <option value="" disabled>Select a batch</option>
                      <option value="IND">IND</option>
                    </select>
                    <input
                      type="text"
                      className='branchContactInputField'
                      placeholder='00000 00000'
                      name="orgContactNo"
                      value={branchData.orgContactNo}
                      onChange={handleInputBranchChange}
                      required
                    />
                  </div>
                </div>
                
              </div>
              <div className="branchDialog-body">
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Address<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='branchInputFieldText'
                    placeholder='Address'
                    name="orgAddress"
                    value={branchData.orgAddress}
                    onChange={handleInputBranchChange}
                    required
                  />
                </div>
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>City<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='branchInputField'
                    placeholder='City'
                    name="orgCity"
                    value={branchData.orgCity}
                    onChange={handleInputBranchChange}
                    required
                  />
                </div>
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>PIN/ZIP Code<span className='mandatoryFiled'>*</span></label>
                  <input
                    type="text"
                    className='branchInputField'
                    placeholder='PIN/ZIP Code'
                    name="orgPincode"
                    value={branchData.orgPincode}
                    onChange={handleInputBranchChange}
                    required
                  />
                </div>
              </div>
              <div className="branchDialog-body">
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Country<span className='mandatoryFiled'>*</span></label>
                  <select
                    className='branchSelectOneMenuField'
                    name="orgCountry"
                    value={branchData.orgCountry}
                    onChange={handleInputBranchChange}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <div className='branchInputFiled'>
                  <label className='branchLabelText'>State<span className='mandatoryFiled'>*</span></label>
                  <select
                    className='branchSelectOneMenuField'
                    name="orgState"
                    value={branchData.orgState}
                    onChange={handleInputBranchChange}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="Odisha" >Odisha</option>
                    <option value="Uttar Pradesh" >Uttar Pradesh</option>
                    
                  </select>
                </div>

                <div className='branchInputFiled'>
                  <label className='branchLabelText'>Currency<span className='mandatoryFiled'>*</span></label>
                  <select
                    className='branchSelectOneMenuField'
                    name="orgCurrency"
                    value={branchData.orgCurrency}
                    onChange={handleInputBranchChange}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="INR" >INR</option>
                    <option value="USD" >USD</option>
                  </select>
                </div>
              </div>
              <div className='border2'></div>
              <div className="branchDialog-footer">
                <button onClick={handleDialogClose} className='cancelBranch'>Cancel</button>
                <button type="submit" className='createBranch' onClick={handleSaveNewBranch}>
                  {loadingSaveBranch ? <CircularProgress size={20}  style={{color:'white'}}/> : (isEditing ? "Update" : "Add")}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Delete Dialog Prompt */}
        <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>
          <div className='dialogChapterHeader'>
            <span className="CertifyDialogTitleTxt">Delete Branch</span>
            <button className="close-button" onClick={handleDeleteClose}>&#x2716;</button>
          </div>
          <div className="userHeaderHorizontalLine"></div>
        </DialogTitle>

        <DialogContent>
          <p>Do you want to delete this Branch?</p>
        </DialogContent>
        <DialogActions>
          <div className='dialogActionBtn'>
            <div className='closeBtn' onClick={handleDeleteClose}>Cancel</div>
            <div className='addBtn' onClick={handleDeleteBranch}>
              {loadingSaveBranch ? <CircularProgress size={20}  style={{color:'white'}}/> : 'Delete'}
            </div>
          </div>
        </DialogActions>
      </Dialog>
      </div>
    </>
  );
}

export default Organisation;
