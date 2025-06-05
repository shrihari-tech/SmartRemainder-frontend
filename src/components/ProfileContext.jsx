import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Default profile object with all necessary properties
const DEFAULT_PROFILE = {
  username: "",
  email: "",
  phone: "",
  image: "",
  role: "",
  location: ""
};

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const fetchProfile = async (userId) => {
    try {
      if (userId) {
        const response = await axios.get(`http://localhost:3000/user/profile/${userId}`);
        // Ensure all properties exist even if some are missing from the response
        setProfile({
          ...DEFAULT_PROFILE,
          ...response.data
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Reset to default profile if fetch fails
      setProfile(DEFAULT_PROFILE);
    }
  };

  const updateProfile = async (userId, updatedProfile) => {
    try {
      const response = await axios.put(`http://localhost:3000/user/update-profile/${userId}`, updatedProfile);
      // Merge updated profile with default to ensure all properties exist
      setProfile({
        ...DEFAULT_PROFILE,
        ...response.data.user
      });
      return response.data.message;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  };

  useEffect(() => {
    const userId = sessionStorage.getItem('user');
    fetchProfile(userId);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};