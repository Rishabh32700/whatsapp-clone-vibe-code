import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

type RateLimitAlertProps = {
  isVisible: boolean;
  onClose: () => void;
  retryAfter?: number;
};

const RateLimitAlert = ({ isVisible, onClose, retryAfter }: RateLimitAlertProps) => {
  const [countdown, setCountdown] = useState(retryAfter || 0);

  useEffect(() => {
    if (isVisible && retryAfter) {
      setCountdown(retryAfter);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, retryAfter, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Too Many Requests
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                You've made too many requests. Please wait a moment before trying again.
                {countdown > 0 && (
                  <span className="block mt-1 font-medium">
                    Retry in {countdown} seconds...
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitAlert;
