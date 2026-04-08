import React, { useState } from 'react';
import '../Batch.css';
import Action from "../../../../../Assets/Images/Edit.svg";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { format, parse } from 'date-fns';

function UpcomingBatch({ batches,onEdit, onDelete }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  const handleActionClick = (event, batch) => {
    setSelectedBatch(batch);
    setMenuAnchor(event.currentTarget);
  };

  const formatDate = (dateString) => {
    const dateParts = dateString.split(' '); // Parse the date string based on its format 
    const date = parse(dateParts[0], 'dd-MM-yyyy', new Date());
    // const time = dateParts[1];
    return format(date, "dd MMM yyyy");  //  from "12-06-2024 08:00" to 12 Jun 2024
};

const handleEditClick = () => {
  handleMenuClose();
  onEdit(selectedBatch);
};

const handleDeleteClick = () => {
  handleMenuClose();
  onDelete(selectedBatch);
};

  return (
    <>
    {batches.length === 0 ? (
        <div className="no-batches-message">No Upcoming Batches are there</div>
      ) : (
      <table className="Table">
        <thead>
          <tr>
            <th>Batch Name</th>
            <th>Duration</th>
            <th>Teachers</th>
            <th>Courses</th>
            <th>Enrolled Students</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {batches.map(batch => (
            <tr key={batch.batchId}>
              <td><span>{batch.batchName}</span> <br /> {batch.branchName}</td>
              <td>{formatDate(batch.batchStartDateTime)} - {formatDate(batch.batchEndDateTime)}</td>
              <td>{batch.totalEnrolledTutors}</td>
              <td>{batch.totalEnrolledCourses}</td>
              <td><span>{batch.totalEnrolledStudents}</span> {batch.batchCapacity !== 99999 && `/${batch.batchCapacity}`}</td>
              <td>
                <img src={Action} alt="Action" style={{ cursor: 'pointer' }} onClick={(event) => handleActionClick(event, batch)} />
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                  <MenuItem className='MenuItem' onClick={handleEditClick}><EditOutlinedIcon />Edit</MenuItem>
                  <MenuItem className='MenuItem'><SettingsOutlinedIcon />Manage</MenuItem>
                  <MenuItem style={{ color: 'red' }} className='MenuItem' onClick={handleDeleteClick}><DeleteOutlinedIcon />Delete</MenuItem>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </>
  );
}

export default UpcomingBatch;
