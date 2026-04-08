import React from 'react';
import './AdditionalContent.css';
import Plus from '../../../../Assets/Images/plus.svg';
import Cancel from '../../../../Assets/Images/close.svg';

export default function AdditionalContent({
    takeawaysRows,
    attendRows,
    takeawayDraft,
    audienceDraft,
    onTakeawaysChange,
    onAttendChange,
    onTakeawayDraftChange,
    onAudienceDraftChange,
    onTakeawaysAdd,
    onAttendAdd,
    onTakeawaysRemove,
    onAttendRemove
}) {
    const handleTakeawaysChange = (e) => {
        const { name, value } = e.target;
        onTakeawayDraftChange({ ...takeawayDraft, [name]: value });
    };

    const handleAttendChange = (e) => {
        const { name, value } = e.target;
        onAudienceDraftChange({ ...audienceDraft, [name]: value });
    };

    const addNewTakeawayRow = () => {
        if (takeawayDraft.keyTakeaway) {
            const newTakeaway = { keyTakeaway: takeawayDraft.keyTakeaway };
            onTakeawaysAdd(newTakeaway); // Notify parent of new row
        }
    };

    const addNewAttendRow = () => {
        if (audienceDraft.audience) {
            onAttendAdd({ ...audienceDraft }); // Notify parent of new row
        }
    };

    const removeTakeawayRow = (index) => {
        onTakeawaysRemove(index); // Notify parent of row removal
    };

    const removeAttendRow = (index) => {
        onAttendRemove(index); // Notify parent of row removal
    };
    
    return (
        <div className='speakersMainSection'>
            <table className="webinarTable">
                <thead>
                    <tr>
                        <th>Key Takeaways</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input
                                style={{ width: '1300px' }}
                                type="text"
                                name="keyTakeaway"
                                placeholder="Enter Key Takeaways"
                                className='webinarField'
                                value={takeawayDraft.keyTakeaway}
                                onChange={handleTakeawaysChange}
                            />
                        </td>
                        <td>
                            <img src={Plus} alt='Add' className='addImg' onClick={addNewTakeawayRow} />
                        </td>
                    </tr>
                    {takeawaysRows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.keyTakeaway}</td>
                            <td>
                                <img src={Cancel} alt='Cancel' className='cancelImg' onClick={() => removeTakeawayRow(index)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <table className="webinarTable">
                <thead>
                    <tr>
                        <th>Who Should Attend</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input
                                style={{ width: '1300px' }}
                                type="text"
                                name="audience"
                                placeholder="Enter Who Should Attend"
                                className='webinarField'
                                value={audienceDraft.audience}
                                onChange={handleAttendChange}
                            />
                        </td>
                        <td>
                            <img src={Plus} alt='Add' className='addImg' onClick={addNewAttendRow} />
                        </td>
                    </tr>
                    {attendRows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.audience}</td>
                            <td>
                                <img src={Cancel} alt='Cancel' className='cancelImg' onClick={() => removeAttendRow(index)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
