import React, { useState } from 'react';
import './SpeakersTab.css';
import Plus from '../../../../Assets/Images/plus.svg';
import Cancel from '../../../../Assets/Images/close.svg';

const INITIAL_SELECTED_VALUES = {
    name: '',
    designation: '',
    emailId:'',
    about: '',
};

export default function SpeakersTab({ onAddSpeaker, onRemoveSpeaker, speakersData, speakerDraft, onSpeakerDraftChange }) {
    const [validationErrors, setValidationErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onSpeakerDraftChange({ ...speakerDraft, [name]: value });
        setValidationErrors({ ...validationErrors, [name]: '' });
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const addNewRow = () => {
        let errors = {};

        if (!speakerDraft.name) {
            errors.name = 'Speaker Name is required.';
        } 
        if (!speakerDraft.emailId) {
            errors.emailId = 'Email is required.';
        } else if (!validateEmail(speakerDraft.emailId)) {
            errors.emailId = 'Please enter a valid email address.';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        onAddSpeaker({ ...speakerDraft });
        onSpeakerDraftChange({ ...INITIAL_SELECTED_VALUES });
        setValidationErrors({});
    };

    const removeRow = (index) => {
        onRemoveSpeaker(index);
    };

    return (
        <div className='speakersMainSection'>
            <table className="webinarTable">
                <thead>
                    <tr>
                        <th>Speaker Name<span className='mandatoryField'>*</span></th>
                        <th>Title/Position</th>
                        <th>Email<span className='mandatoryField'>*</span></th>
                        <th>Short Bio</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter Speakers Name"
                                className={`webinarField ${validationErrors.name ? 'error' : ''}`}
                                value={speakerDraft.name}
                                onChange={handleInputChange}
                            /></div>
                            {validationErrors.name && <span className='errorText'>{validationErrors.name}</span>}
                        </td>
                        <td>
                        <div>
                            <input
                                type="text"
                                name="designation"
                                placeholder="Enter designation Name"
                                className={`webinarField ${validationErrors.designation ? 'error' : ''}`}
                                value={speakerDraft.designation}
                                onChange={handleInputChange}
                            />
                            </div>
                            {validationErrors.designation && <span className='errorText'>{validationErrors.designation}</span>}
                        </td>
                        <td>
                        <div>
                        <input
                            type="text"
                            name="emailId"
                            placeholder="Enter Email"
                            className={`webinarField ${validationErrors.emailId ? 'error' : ''}`}
                            value={speakerDraft.emailId}
                            onChange={handleInputChange}
                        /></div>
                        {validationErrors.emailId && <span className='errorText'>{validationErrors.emailId}</span>}
                        </td>
                        <td>
                            <textarea
                                name="about"
                                placeholder="Enter Short Bio"
                                className='webinarTextField'
                                value={speakerDraft.about}
                                onChange={handleInputChange}
                            />
                        </td>
                        <td>
                            <img src={Plus} alt='Add' className='addImg' onClick={addNewRow} />
                        </td>
                    </tr>
                    {speakersData.map((row, index) => (
                        <tr key={index}>
                            <td>{row.name}</td>
                            <td>{row.designation}</td>
                            <td>{row.emailId}</td>
                            <td>{row.about}</td>
                            <td>
                                <img src={Cancel} alt='Cancel' className='cancelImg' onClick={() => removeRow(index)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
