import React, { useContext, useState } from "react";
import { Home, Calendar, Menu, X } from "lucide-react";
import { MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { IoIosToday } from "react-icons/io";
import { FaBorderAll } from "react-icons/fa6";
import { ProfileContext } from "./ProfileContext";
import { TiTick } from "react-icons/ti";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useContext(ProfileContext);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: IoIosToday, label: "Today Tasks", path: "/todaytask" },
    { icon: FaBorderAll, label: "All Tasks", path: "/alltask" },
    { icon: TiTick, label: "Completed Tasks", path: "/completed" },
    { icon: CgProfile, label: "MyProfile", path: "/profile" },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleNavigation = (path, label) => {
    if (label === "Logout") {
      handleLogout();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static lg:translate-x-0 w-80 min-h-screen bg-white text-gray-800 p-4 transform transition-transform duration-300 z-50 flex flex-col shadow-lg`}
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src="/smr.png"
            alt="Microcollege"
            className="w-52 h-32 object-cover mb-4"
          />
          <div className="relative w-24 h-24">
            <div 
              className="profile-area cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#da600e] to-[#f26b0f] flex items-center justify-center text-white text-2xl">
                  {profile.username.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700 whitespace-nowrap -ml-5">{profile.username}</p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            className="lg:hidden text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <ul className="space-y-4 -mt-10 flex-grow">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                onClick={() => handleNavigation(item.path, item.label)}
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-2 rounded cursor-pointer ${
                    isActive
                      ? "bg-[#f26b0f] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            className="flex items-center space-x-4 w-full p-2 rounded cursor-pointer hover:bg-gray-100 text-gray-700"
            onClick={handleLogout}
          >
            <MdLogout className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-gray-400"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Sidebar;