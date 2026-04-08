import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CoursePayment.css';
import CompanyLogo from '../../../Assets/Images/companyLogo.svg';
import PaymentDialog from './PaymentDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { BACKEND_BASEURL } from '../../helper';
import countryList from 'react-select-country-list';
import { delay } from "../../helper";

export default function CoursePayment() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  const { materialPrice, discountPercentage, discountedPrice, materialId, paymentStatus } = location.state || { materialPrice: 0, discountPercentage: 0, discountedPrice: 0, materialId: 0, username: '', paymentStatus: 'SUCCESS' };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const handleCancel = () => navigate(-1);

  const token = localStorage.getItem("token");

  //Commonly Setting the Bearer Token here so dont need to set header token in each API call.
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const handleProceedToPay = () => {
    if (!selectedCountry) {
      toast.error('Country is mandatory', {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    // if (!selectedState) {
    //   toast.error('State is mandatory', {
    //     position: 'top-right',
    //     autoClose: 1000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //   });
    //   return;
    // }
    if (!totalAmount || totalAmount === 0) {
      // Free course bypass
      handlePaymentProceed();
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => setIsDialogOpen(false);

  const totalAmount = discountedPrice;
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    try {
      const userLoginResponse = localStorage.getItem('UserLoginResponse');
      const studentDetails = localStorage.getItem('studentDetails');
      
      const parsedUser = userLoginResponse ? JSON.parse(userLoginResponse) : null;
      const parsedStudent = studentDetails ? JSON.parse(studentDetails) : null;
      
      const resolvedEmail = parsedStudent?.email || parsedUser?.username || '';
      
      if (resolvedEmail) {
        setUserEmail(resolvedEmail);
        setUserName(resolvedEmail.split('@')[0]);
      }
    } catch (e) {
      console.error("Error parsing user details from local storage", e);
    }
    
    setCountries(countryList().getData());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchStates = (countryCode) => {
    // Optional: Keep existing logic if some countries magically had states 
    // const selectedCountry = countries.find((c) => c.value === countryCode);
    
    // Explicitly add Indian States if user selects India ('IN')
    if (countryCode === 'IN') {
      const indianStates = [
        { name: 'Andaman and Nicobar Islands', code: 'AN' },
        { name: 'Andhra Pradesh', code: 'AP' },
        { name: 'Arunachal Pradesh', code: 'AR' },
        { name: 'Assam', code: 'AS' },
        { name: 'Bihar', code: 'BR' },
        { name: 'Chandigarh', code: 'CH' },
        { name: 'Chhattisgarh', code: 'CG' },
        { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
        { name: 'Delhi', code: 'DL' },
        { name: 'Goa', code: 'GA' },
        { name: 'Gujarat', code: 'GJ' },
        { name: 'Haryana', code: 'HR' },
        { name: 'Himachal Pradesh', code: 'HP' },
        { name: 'Jammu and Kashmir', code: 'JK' },
        { name: 'Jharkhand', code: 'JH' },
        { name: 'Karnataka', code: 'KA' },
        { name: 'Kerala', code: 'KL' },
        { name: 'Ladakh', code: 'LA' },
        { name: 'Lakshadweep', code: 'LD' },
        { name: 'Madhya Pradesh', code: 'MP' },
        { name: 'Maharashtra', code: 'MH' },
        { name: 'Manipur', code: 'MN' },
        { name: 'Meghalaya', code: 'ML' },
        { name: 'Mizoram', code: 'MZ' },
        { name: 'Nagaland', code: 'NL' },
        { name: 'Odisha', code: 'OR' },
        { name: 'Puducherry', code: 'PY' },
        { name: 'Punjab', code: 'PB' },
        { name: 'Rajasthan', code: 'RJ' },
        { name: 'Sikkim', code: 'SK' },
        { name: 'Tamil Nadu', code: 'TN' },
        { name: 'Telangana', code: 'TG' },
        { name: 'Tripura', code: 'TR' },
        { name: 'Uttar Pradesh', code: 'UP' },
        { name: 'Uttarakhand', code: 'UK' },
        { name: 'West Bengal', code: 'WB' },
      ];
      setStates(indianStates);
    } else {
      setStates([]);
    }
  };
  
  const handleCountryChange = (e) => {
    const countryValue = e.target.value;
    setSelectedCountry(countryValue);
    setSelectedState(''); // Reset state selection
    fetchStates(countryValue);
  };
  
  

  const handlePaymentProceed = async () => {
    try {
      const payload = {
        username: userEmail,
        materialId: materialId,
        paymentStatus: 'SUCCESS'
      };
      console.log('Purchasing with Payload:', payload);
      
      const response = await axios.post(`${BACKEND_BASEURL}/studyMaterial/purchaseMaterial`, payload);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
      if (response.status === 200) {
        toast.success('Payment Successful', {
          position: 'top-right',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        await delay(1500);
        navigate('/userLandingPage');
      } else {
        toast.error('Payment Failed', {
          position: 'top-right',
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error('Payment Failed', {
        position: 'top-right',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className='coursePaymentPage'>
      <ToastContainer />
      <div className='coursePaymentContainer'>
        <div className='paymentHeader'>
          <div className='purchaseCourseHeader'>Purchase Course</div>
          <div><img src={CompanyLogo} alt='logo' style={{ height: '42px', width: '80px' }} /></div>
        </div>

        <div className='summaryAndBillingContainer'>
          <div className='summarySection'>
            <div className='summaryTitle'>Summary</div>
            <div className='summaryItem'>
              <div>Course Fee:</div>
              {materialPrice ? <div>&#8377; {materialPrice}</div> : <div>-</div>}
            </div>
            <div className='summaryItem'>
              <div>Discount:</div>
              {discountPercentage ? <div>{discountPercentage}%</div> : <div>-</div>}
            </div>
            <div className='summaryItem total'>
              <div>Total:</div>
              {totalAmount ? <div>&#8377; {totalAmount}</div> : <div>-</div>}
            </div>
          </div>
          <div className='billingSection'>
            <div className='billingTitle'>Billing Address</div>
            <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
              <div className='billingItem'>
                <label>Country <span style={{ color: 'red' }}>*</span></label>
                <select value={selectedCountry} onChange={handleCountryChange}>
                  <option value=''>Select Country</option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
              </div>
              <div className='billingItem'>
                <label>State <span style={{ color: 'red' }}></span></label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                  <option value=''>Select State</option>
                  {states.map((state) => (
                    <option key={state.code} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='billingItem'>
              <label>Address</label>
              <input type='text' placeholder='Address' />
            </div>
          </div>
        </div>
        <div className='buttonContainer'>
          <button className='cancelBtn' onClick={handleCancel}>Cancel</button>
          <button className='proceedToPayBtn' onClick={handleProceedToPay}>
            {(!totalAmount || totalAmount === 0) ? "Complete Registration" : "Proceed to Pay"}
          </button>
        </div>
      </div>

      <PaymentDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        totalAmount={totalAmount}
        handlePaymentProceed={handlePaymentProceed}
      />
    </div>
  );
}
