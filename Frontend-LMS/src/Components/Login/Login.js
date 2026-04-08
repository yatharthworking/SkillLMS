import React from 'react';
import './Login.css';
import LoginImage from '../../Assets/Images/loginImage.svg';
import CompanyLogo from '../../Assets/Images/companyLogo.svg';
import AdminLogin from './AdminLogin';
import {useLocation } from 'react-router-dom';
import UserLogin from './UserLogin';

export default function Login() {
    const location = useLocation();

    const isAdmin = location.state?.isAdmin;

  return (

    <div id='root'>
      
        <div className='loginPage'>
            <div className='loginPageLeftBox'>
                <img className='loginImage' src={LoginImage} alt=''/>
                <img src={CompanyLogo} alt='Logo' className='logoBox'/>
            </div>

            <div className='loginPageRightBox'>
            {isAdmin ? <AdminLogin /> : <UserLogin />}
            </div>
        
        </div>
    </div>
  )
}
