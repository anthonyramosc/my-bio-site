import React from 'react';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { NotificationProps } from './Notification.types';

const Notification = ({ type, message, onClose, duration = 3000 }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (type && message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [type, message, onClose, duration]);
  
  if (!isVisible || !type || !message) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex justify-end">
      <div className={`
        p-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md animate-fade-in
        ${type === 'success' ? 'bg-green-500 text-white' : ''}
        ${type === 'error' ? 'bg-red-500 text-white' : ''}
      `}>
        {type === 'success' && <CheckCircle size={20} />}
        {type === 'error' && <AlertTriangle size={20} />}
        <span>{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-white hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
