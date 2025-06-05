// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     setEmail(e.target.value);
//     setMessage('');
//     setIsError(false);
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setMessage('');
//     setIsError(false);

//     try {
//       const response = await axios.post('http://localhost:3000/user/forget-password', { email });
//       setMessage(response.data.message);
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       setIsError(true);
//       setMessage('Failed to reset password. Please check your email and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = () => {
//     navigate("/");
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Enter your email and we'll send you instructions to reset your password.
//           </p>
//         </div>
//         <form onSubmit={handleFormSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <input
//                 type="email"
//                 name="email"
//                 value={email}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="your@email.com"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c2560c]/50 focus:border-[#c2560c] transition-all shadow-sm"
//               />
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 px-4 bg-[#c2560c] text-white font-medium rounded-lg shadow-md hover:bg-[#c2560c]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2560c] transition-all"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Sending Link...
//               </span>
//             ) : (
//               'Reset Password'
//             )}
//           </button>
//         </form>
//         {message && (
//           <div className={`mt-4 p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//             <p className="text-center text-sm">
//               {message}
//             </p>
//           </div>
//         )}
//         <div className="mt-6 text-center">
//           <button 
//             onClick={handleLogin}
//             className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
    setIsError(false);
    setShowValidationError(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email.trim()) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/user/forget-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error resetting password:', error);
      setIsError(true);
      setMessage('Failed to reset password. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full p-3 border rounded-lg shadow-sm transition-all duration-300 ease-in-out focus:ring-2 ${
                  showValidationError
                    ? 'border-red-500 focus:ring-red-300 animate-shake'
                    : 'border-gray-300 focus:ring-[#c2560c]/50 focus:border-[#c2560c]'
                }`}
              />
            </div>
            {showValidationError && (
              <p className="text-red-600 text-sm mt-1 animate-fade-in">Email field is required</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#c2560c] text-white font-medium rounded-lg shadow-md hover:bg-[#c2560c]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c2560c] transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending Link...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            <p className="text-center text-sm">{message}</p>
          </div>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
