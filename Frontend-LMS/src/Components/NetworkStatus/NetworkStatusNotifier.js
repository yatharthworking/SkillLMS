// src/components/NetworkStatusNotifier.js
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';

// Custom hook to detect online/offline status
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// NetworkStatusNotifier component
const NetworkStatusNotifier = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      toast.success('Connection established');
    } else {
      toast.error('No internet connection');
    }
  }, [isOnline]);

  return <ToastContainer />;
};

export default NetworkStatusNotifier;
