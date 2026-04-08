import React from 'react'
import WorkProgress from "./Assets/Images/WorkInProgress.svg";
import BackIcon from './Assets/Images/back.svg';
 

export default function WorkInProgress({onNavigateBack}) {
  return (
    <div>
      {/* <div><Navbar WorkInProgressIsCalled={true}/></div> */}
        <div style={{height:'80vh'}}>
        <div className='BackArrow'><button onClick={onNavigateBack} style={{cursor: 'pointer', border: 'none', background: 'none'}} title='Back To Main Screen'><img src={BackIcon} alt=''/></button></div>
            <div style={{width:'100%', height:'100%',display:'flex',justifyContent:'center'}}>
            <img style={{width:'100%'}} src={WorkProgress} alt=" " />
            </div>
        </div>
    </div>
  )
}
