import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {ProfileContext} from './ProfileContext';
import { notification } from 'antd';
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { fetchProfile } = useContext(ProfileContext);
  const [api, contextHolder] = notification.useNotification();
  // Clear field errors after 3 seconds
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = true;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = true;
      errors.emailFormat = true;
    }

    if (!formData.password) {
      errors.password = true;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleForgetPassword = () => {
    navigate('/forgot-password');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user/login', formData);
      const userId = response.data.user._id;
      sessionStorage.setItem('user', userId);
      await fetchProfile(userId);
      navigate('/dashboard');
    } catch (error) {
      api.error({
          message: 'Login Failed',
          description: error.response?.data?.message || error.message || 'Something went wrong.',
          showProgress: true,
          pauseOnHover: true,
        });
      setFieldErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'Login failed. Please check your credentials and try again.'
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {contextHolder}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/smr.png" alt="SuperRemainder" className="w-44 h-36 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Login to Your Account</h2>
          <p className="text-gray-600">Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.email ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-200'}`}
              placeholder="Enter your email"
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.emailFormat ? 'Invalid email format' : 'Email is required'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.password ? 'border-red-500 bg-red-50 animate-shake' : 'border-gray-200'}`}
              placeholder="Enter your password"
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">Password is required</p>
            )}
          </div>

          {fieldErrors.form && (
            <p className="text-red-500 text-sm mb-4">{fieldErrors.form}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#FF5D4B] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#FF5D4B]/90 focus:outline-none focus:ring-2 focus:ring-[#CA3177] focus:ring-offset-2"
          >
            Login
          </button>
        </form>
         <div className="text-center mt-4">
           <p className="text-sm text-gray-600">
             <button onClick={handleForgetPassword} className="text-[#FF5D4B] cursor-pointer hover:underline">
               Forgot Password?
            </button>
           </p>
         </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#FF5D4B] hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;