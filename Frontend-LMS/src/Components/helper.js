/**
 * Validate Email ID
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email is valid, otherwise false.
 */
export function validateEmail(email) {
    const emailRegex = /^[A-Za-z0-9]+(?:[._%+-](?![._%+-])[A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate Phone Number
   * @param {string} phoneNumber - The phone number to validate.
   * @returns {boolean} - Returns true if the phone number is valid, otherwise false.
   */
  export function validatePhoneNumber(phoneNumber) {
    const normalizedPhoneNumber = String(phoneNumber || '').replace(/\D/g, '');
    const phoneNumberRegex = /^[1-9]\d{9}$/;
    return phoneNumberRegex.test(normalizedPhoneNumber);
  }

  /**
   * Validate Password Strength
   * @param {string} password - The password to validate.
   * @returns {boolean} - Returns true if the password meets the minimum policy.
   */
  export function validatePasswordStrength(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
 * Helper function to create a delay
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} - Returns a promise that resolves after the specified delay.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Backend Base URL
 */
export const BACKEND_BASEURL =
  process.env.REACT_APP_LMS_BACKEND_BASE_URL || 'http://localhost:8901/soul';


/**
 * Admin endpoint
 */
// export const ADMIN_ENDPOINT = process.env.REACT_APP_LMS_ADMIN_ENDPOINT;

/**
 * Teacher endpoint
 */

// export const TEACHER_ENDPOINT = process.env.REACT_APP_LMS_TEACHER_ENDPOINT;

/**
 * Token
 */

// export const token = localStorage.getItem("token");
  


//To set Admin Details From Local Storage

// Fetching and parsing data from localStorage with error handling

const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving or parsing ${key}:`, error);
    return null;
  }
};

export const getFromLocalStorageSafe = getFromLocalStorage;

// To set Admin Details From Local Storage
export const adminDetails = getFromLocalStorage('adminDetails');
export const studentDetails = getFromLocalStorage('studentDetails');
export const roleWithPrivileges = getFromLocalStorage('roleWithPrivileges');
