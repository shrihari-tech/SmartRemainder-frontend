// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   const validateField = (name, value) => {
//     const usernameRegex = /^[a-zA-Z]+$/;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     // const phoneRegex = /^\d{10}$/;
//     // const phoneRegex = /^(?!.*e)[0-9]{10}$/;
//     const phoneRegex = /^[0-9]{10}$/;
//     const indianPhoneRegex = /^[6-9]\d{9}$/;


//     let error = null;

//     switch (name) {
//       case 'username':
//         if (!value.trim()) {
//           error = 'Name is required';
//         } else if (!usernameRegex.test(value)) {
//           error = 'Name should contain only alphabets';
//         }
//         break;
//       case 'email':
//         if (!value.trim()) {
//           error = 'Email is required';
//         } else if (!emailRegex.test(value)) {
//           error = 'Invalid Email address Format';
//         }
//         break;
//       case 'phone':
//         if (!value.trim()) {
//           error = 'Invalid Format ';
//         }
//         else if(!phoneRegex.test(value)){
//           error = 'Phone number should contain 10 digits';
//         }
//         else if(!indianPhoneRegex.test(value)){
//           error = 'Invalid Phone Number '
//         }
//         break;
//       case 'password':
//         if (!value.trim()) {
//           error = 'Password is required';
//         } else if (!passwordRegex.test(value)) {
//           error = 'Password should contain at least 8 characters, one uppercase, one lowercase, one number, and one special character';
//         }
//         break;
//       case 'confirmPassword':
//         if (!value.trim()) {
//           error = 'Please confirm your password';
//         } else if (value !== formData.password) {
//           error = 'Passwords do not match';
//         }
//         break;
//       default:
//         break;
//     }

//     return error;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if(name==="phone" && (isNaN(value) || value.length > 10)){
//       return;
//     }
    
//     // Update form data first
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
    
//     // Mark the field as touched
//     if (!touched[name]) {
//       setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
//     }
    
//     // Validate the field and update errors
//     const error = validateField(name, value);
    
//     setErrors((prevErrors) => {
//       if (error) {
//         return { ...prevErrors, [name]: error };
//       } else {
//         const { [name]: _, ...rest } = prevErrors;
//         return rest;
//       }
//     });
//   };

//   const validateForm = () => {
//     // Mark all fields as touched
//     const allTouched = {};
//     Object.keys(formData).forEach(key => {
//       allTouched[key] = true;
//     });
//     setTouched(allTouched);

//     // Validate all fields
//     const newErrors = {};
    
//     Object.entries(formData).forEach(([name, value]) => {
//       const error = validateField(name, value);
//       if (error) {
//         newErrors[name] = error;
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     if (validateForm()) {
//       try {
//         const response = await axios.post('http://localhost:3000/user/register', formData);
//         console.log('User registered successfully:', response.data);
//         navigate('/'); // Only navigate on successful validation and registration
//       } catch (error) {
//         console.error('Error registering user:', error.response?.data || error.message);
//         setIsSubmitting(false);
//       }
//     } else {
//       // Add shake animation for all fields with errors
//       const fieldsWithErrors = document.querySelectorAll('.field-error');
//       fieldsWithErrors.forEach(field => {
//         field.classList.add('animate-shake');
//         setTimeout(() => {
//           field.classList.remove('animate-shake');
//         }, 600);
//       });
      
//       setTimeout(() => {
//         setIsSubmitting(false);
//       }, 500);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <style jsx="true">{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
//           20%, 40%, 60%, 80% { transform: translateX(5px); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-shake { animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
//         .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
//       `}</style>
//       <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
//         <div className="text-center">
//           <img src="/smr.png" alt="SuperRemainder" className="w-44 h-36 mx-auto" />
//           <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
//           <p className="text-gray-600">Join SuperRemainder and start managing your tasks</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
//                   touched.username && errors.username
//                     ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
//                     : touched.username && !errors.username
//                     ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
//                     : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
//                 }`}
//                 placeholder="Enter your Name"
//               />
//               {touched.username && !errors.username && (
//                 <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
//                   ✓
//                 </span>
//               )}
//             </div>
//             {touched.username && errors.username && (
//               <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
//                 {errors.username}
//               </p>
//             )}
//           </div>
          
//           <div className="mb-4">
//             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <div className="relative">
//               <input
//                 type="number"
//                 id="phone"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
//                   touched.phone && errors.phone
//                     ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
//                     : touched.phone && !errors.phone
//                     ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
//                     : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
//                 }appearance-none`}
//                 placeholder="Enter your Phone Number"
//               />
//               {touched.phone && !errors.phone && (
//                 <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
//                   ✓
//                 </span>
//               )}
//             </div>
//             {touched.phone && errors.phone && (
//               <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
//                 {errors.phone}
//               </p>
//             )}
//           </div>
          
//           <div className="mb-4">
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <div className="relative">
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
//                   touched.email && errors.email
//                     ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
//                     : touched.email && !errors.email
//                     ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
//                     : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
//                 }`}
//                 placeholder="Enter your email"
//               />
//               {touched.email && !errors.email && (
//                 <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
//                   ✓
//                 </span>
//               )}
//             </div>
//             {touched.email && errors.email && (
//               <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
//                 {errors.email}
//               </p>
//             )}
//           </div>
          
//           <div className="mb-4">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
//                   touched.password && errors.password
//                     ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
//                     : touched.password && !errors.password
//                     ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
//                     : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
//                 }`}
//                 placeholder="Enter your password"
//               />
//               {touched.password && !errors.password && (
//                 <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
//                   ✓
//                 </span>
//               )}
//             </div>
//             {touched.password && errors.password && (
//               <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
//                 {errors.password}
//               </p>
//             )}
//           </div>
          
//           <div className="mb-6">
//             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//               Confirm Password
//             </label>
//             <div className="relative">
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
//                   touched.confirmPassword && errors.confirmPassword
//                     ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
//                     : touched.confirmPassword && !errors.confirmPassword
//                     ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
//                     : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
//                 }`}
//                 placeholder="Confirm your password"
//               />
//               {touched.confirmPassword && !errors.confirmPassword && (
//                 <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
//                   ✓
//                 </span>
//               )}
//             </div>
//             {touched.confirmPassword && errors.confirmPassword && (
//               <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
//                 {errors.confirmPassword}
//               </p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#CA3177] focus:ring-offset-2 transition-all duration-300 ${
//               isSubmitting 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-[#FF5D4B] hover:bg-[#FF5D4B]/90'
//             }`}
//           >
//             {isSubmitting ? 'Signing up...' : 'Sign up'}
//           </button>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-600">
//             Already have an account?{' '}
//             <a href="/" className="text-[#FF5D4B] hover:underline">
//               Sign in
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [api,contextHolder] = notification.useNotification();

  const validateField = (name, value) => {
    const usernameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // const phoneRegex = /^\d{10}$/;
    // const phoneRegex = /^(?!.*e)[0-9]{10}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const indianPhoneRegex = /^[6-9]\d{9}$/;


    let error = null;

    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (!usernameRegex.test(value)) {
          error = 'Name should contain only alphabets';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Invalid Email address Format';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Invalid Format ';
        }
        else if(!phoneRegex.test(value)){
          error = 'Phone number should contain 10 digits';
        }
        else if(!indianPhoneRegex.test(value)){
          error = 'Invalid Phone Number '
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (!passwordRegex.test(value)) {
          error = 'Password should contain at least 8 characters, one uppercase, one lowercase, one number, and one special character';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if(name==="phone" && (isNaN(value) || value.length > 10)){
      return;
    }
    
    // Update form data first
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    
    // Mark the field as touched
    if (!touched[name]) {
      setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    }
    
    // Validate the field and update errors
    const error = validateField(name, value);
    
    setErrors((prevErrors) => {
      if (error) {
        return { ...prevErrors, [name]: error };
      } else {
        const { [name]: _, ...rest } = prevErrors;
        return rest;
      }
    });
  };

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        const response = await axios.post('https://smart-remainder-backend.vercel.app/user/register', formData);
        console.log('User registered successfully:', response.data);
        navigate('/'); // Only navigate on successful validation and registration
      } catch (error) {
        console.error('Error registering user:', error.response?.data || error.message);
        setIsSubmitting(false);
      }
    } else {
      // Add shake animation for all fields with errors
      const fieldsWithErrors = document.querySelectorAll('.field-error');
      fieldsWithErrors.forEach(field => {
        field.classList.add('animate-shake');
        setTimeout(() => {
          field.classList.remove('animate-shake');
        }, 600);
      });

      api.error({
        message: 'Validation Error',
        description: 'Please fix the highlighted errors before submitting.',
        showProgress: true,
        pauseOnHover: true,
      });
      
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {contextHolder}
      <style jsx="true">{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake { animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center">
          <img src="/smr.png" alt="SuperRemainder" className="w-44 h-36 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
          <p className="text-gray-600">Join SuperRemainder and start managing your tasks</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                  touched.username && errors.username
                    ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
                    : touched.username && !errors.username
                    ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
                }`}
                placeholder="Enter your Name"
              />
              {touched.username && !errors.username && (
                <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
                  ✓
                </span>
              )}
            </div>
            {touched.username && errors.username && (
              <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
                {errors.username}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <div className="relative">
              <input
                type="number"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                  touched.phone && errors.phone
                    ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
                    : touched.phone && !errors.phone
                    ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
                }appearance-none`}
                placeholder="Enter your Phone Number"
              />
              {touched.phone && !errors.phone && (
                <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
                  ✓
                </span>
              )}
            </div>
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
                {errors.phone}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                  touched.email && errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
                    : touched.email && !errors.email
                    ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
                }`}
                placeholder="Enter your email"
              />
              {touched.email && !errors.email && (
                <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
                  ✓
                </span>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                  touched.password && errors.password
                    ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
                    : touched.password && !errors.password
                    ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
                }`}
                placeholder="Enter your password"
              />
              {touched.password && !errors.password && (
                <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
                  ✓
                </span>
              )}
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
                {errors.password}
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-transparent field-error'
                    : touched.confirmPassword && !errors.confirmPassword
                    ? 'border-green-500 focus:ring-[#FF5D4B] focus:border-transparent'
                    : 'border-gray-300 focus:ring-[#FF5D4B] focus:border-transparent'
                }`}
                placeholder="Confirm your password"
              />
              {touched.confirmPassword && !errors.confirmPassword && (
                <span className="absolute right-3 top-3 text-green-500 transition-opacity duration-300 opacity-100">
                  ✓
                </span>
              )}
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 transition-all duration-300 animate-fadeIn">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#CA3177] focus:ring-offset-2 transition-all duration-300 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#FF5D4B] hover:bg-[#FF5D4B]/90'
            }`}
          >
            {isSubmitting ? 'Signing up...' : 'Sign up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/" className="text-[#FF5D4B] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;