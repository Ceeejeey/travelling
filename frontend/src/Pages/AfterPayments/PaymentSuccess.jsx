import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-green-100 p-8 rounded-xl shadow-md shadow-green-800 border border-green-200 max-w-sm w-full space-y-6 animate-fade-in">
        {/* Checkmark Icon */}
        <div className="flex justify-center">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {/* Success Message */}
        <h1 className="text-xl font-semibold text-gray-800 text-center">
          Payment Successful
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Your booking is confirmed! A confirmation email will be sent soon.
        </p>
        {/* Back to Home Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition text-sm font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;