import React, { useState, useEffect, useContext } from "react";
import { Plus, TrendingUp ,Calendar as CalendarIcon, Clock, User, Flag } from "lucide-react";
import Sidebar from "./Sidebar";
import Calendar from 'react-calendar';
import { BackgroundLines } from "./ui/background-lines";
import 'react-calendar/dist/Calendar.css';
import CustomCalendar from "./CustomCalender";
import { ProfileContext } from "./ProfileContext";
import axios from 'axios';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';


const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    year:'numeric',
    month:'2-digit',
    day:'2-digit', 
  }));

  const { profile, setProfile } = useContext(ProfileContext);

  const [dateTime, setDateTime] = useState({
    time: '',
    date: ''
  });
  const [tasks, setTasks] = useState([]);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "",
    assigned_to: "",
    priority: "",
    time:"",
  });

  useEffect(()=>{
    const timer = setInterval(()=>{
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        year:'numeric',
        month:'2-digit',
        day:'2-digit'
      }));
    },1000)
    return ()=>clearInterval(timer);
  },[])

  const [fieldErrors, setFieldErrors] = useState({})
  const [pendingTasks, setPendingTasks] = useState([]);

  const formatDate = (dateString)=>{
    const options = {day:'2-digit',month:'2-digit',year:'numeric'};
    return new Date(dateString).toLocaleDateString('en-GB',options);
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = sessionStorage.getItem('user');
        if (userId) {
          const response = await axios.get(`http://localhost:3000/user/${userId}`);
          if(response.data && Array.isArray(response.data)){

            setTasks(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);
  
  useEffect(()=>{
    const pending = tasks.filter(task=>new Date(task.end_date) < new Date() && task.status!=="completed");
    setPendingTasks(pending);
  },[tasks]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setTaskDetails({ ...taskDetails, [name]: value });
  //   if (fieldErrors[name]) {

  //     setFieldErrors(prev => ({ ...prev, [name]: false }));

  //   }
  // };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedTaskDetails = { ...taskDetails, [name]: value };
  
    // Determine the status based on the start date and end date
    if (name === 'start_date' || name === 'end_date') {
      const currentDate = new Date();
      const startDate = new Date(updatedTaskDetails.start_date);
      const endDate = new Date(updatedTaskDetails.end_date);
  
      let status = 'upcoming';
      if (startDate <= currentDate && endDate >= currentDate) {
        status = 'ongoing';
      }
      else if(startDate <= currentDate && endDate <= currentDate){
        status = 'completed';
      }
      updatedTaskDetails.status = status;
    }
  
    setTaskDetails(updatedTaskDetails);
  
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };
  // const validateForm = () => {

  //   const errors = {};
  //   const requiredFields = ['title', 'description', 'start_date', 'end_date', 'assigned_to'];
  //   requiredFields.forEach(field => {

  //     if (!taskDetails[field]) {

  //       errors[field] = true;

  //     }

  //   });
  //   setFieldErrors(errors);

  //   return Object.keys(errors).length === 0;

  // };
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'assigned_to', 'priority'];
  
    // Check for required fields
    requiredFields.forEach(field => {
      if (!taskDetails[field]) {
        errors[field] = true;
      }
    });
  
    // Check if start date is less than end date
    const startDate = new Date(taskDetails.start_date);
    const endDate = new Date(taskDetails.end_date);
    if (startDate >= endDate) {
      errors.dateMessage = "Start date should be earlier than the end date.";
      errors.start_date = true;
      errors.end_date = true;
    }
  
    setFieldErrors(errors);
  
    return Object.keys(errors).length === 0;
  };


  const completedTasks = tasks.filter(task => task.status === "completed");

const getCompletedTasksCount = (period) => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  const oneMonthAgo = new Date(now);
  const oneYearAgo = new Date(now);
  
  oneWeekAgo.setDate(now.getDate() - 7);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // First check if task is completed, then categorize by time period
  return completedTasks.filter(task => {
    // Get the task's completion date - use end_date as completion timestamp
    const completionDate = new Date(task.end_date);
    
    switch (period) {
      case 'week':
        return completionDate >= oneWeekAgo;
      case 'month':
        return completionDate >= oneMonthAgo;
      case 'year':
        return completionDate >= oneYearAgo;
      default:
        return false;
    }
  }).length;
};

  const weeklyCompleted = getCompletedTasksCount('week');
  const monthlyCompleted = getCompletedTasksCount('month');
  const yearlyCompleted = getCompletedTasksCount('year');
  const nextHighPriorityTask = tasks.find(task => task.priority === "High" && task.status !== "completed");
  const upcomingTasks = tasks.filter(task=>task.status==="upcoming");
  const [showNotification, setShowNotification] = useState(false);  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const userId = sessionStorage.getItem('user');
      const response = await axios.post('http://localhost:3000/task/addTask', { ...taskDetails, created_by: userId });
      setTasks([...tasks, response.data]);
      setShowNotification(true);
      setIsModalOpen(false);
      setTaskDetails({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "",
        assigned_to: [],
        priority: "",
        time: "",
      });
      setTimeout(()=>{
        setShowNotification(false);
      },3000)
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const filterAndSortTasks = (tasks) => {
    const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
    const statusOrder = { "ongoing": 1, "upcoming": 2, "completed": 3 };

    return tasks
      .filter(task => task.priority === "High")
      .sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return statusOrder[a.status] - statusOrder[b.status];
      });
  };



  useEffect(() => {

    if (Object.keys(fieldErrors).length > 0) {

      const timer = setTimeout(() => {

        setFieldErrors({});

      }, 3000);

      return () => clearTimeout(timer);

    }

  }, [fieldErrors]);

  const sortedTasks = filterAndSortTasks(tasks);



  const nextTask = tasks.filter(task=>new Date(task.start_date)>= new Date())
  .sort((a,b)=> new Date(a.start_date)-new Date(b.start_date))[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // You can add additional functionality here when a date is selected
  };

  const motivationalQuotes = [
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Your time is limited, don't waste it living someone else's life.",
  ];
  
  const [randomQuote, setRandomQuote] = useState("");

  useEffect(() => {
    // Generate a random quote only once when the component mounts
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setRandomQuote(motivationalQuotes[randomIndex]);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(task => task.start_date <= today && task.end_date >= today);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#c2560c] to-[#f26b0f] rounded-xl p-6 md:p-8 mb-2 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{getGreeting()}, {profile.username}</h1>
              <p className="mt-2 text-white/80 italic text-sm md:text-base">{randomQuote}</p>
            </div>
            {showNotification && (
              <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                Task Created Successfully
              </div>
            )}
            <div className="flex items-center justify-end font-bold gap-2 text-white text-3xl">{currentTime}</div>
          </div>
          <div className="flex justify-end flex-col md:flex-row items-center gap-4 mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-[#c2560c] rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto justify-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </button>
          </div>
        </div>
           <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Tasks */}
          <div className="flex-1 gap-10 space-y-4">
            {/* Completed Tasks Card */}
            {/* <div className="bg-white flex space-x-10 rounded-lg shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg w-full transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Completed Tasks</h2>
              </div>
              <div className="flex space-x-20">
                <div className="group hover:bg-green-50 p-2 bg-green-200 rounded-full transition-colors duration-200">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-700">{weeklyCompleted}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Weekly</p>
                </div>
                <div className="group hover:bg-green-50 p-2  bg-green-200 rounded-full transition-colors duration-200">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-700">{monthlyCompleted}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Monthly</p>
                </div>
                <div className="group hover:bg-green-50 p-2  bg-green-200 rounded-full transition-colors duration-200">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-700">{yearlyCompleted}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Yearly</p>
                </div>
              </div>
            </div> */}
            {/* Completed Tasks Card */}
<div className="bg-white flex flex-col md:flex-row md:space-x-10 rounded-lg shadow-md p-4 border-l-4 border-green-500 hover:shadow-lg w-full transition-shadow duration-300">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-700">Completed Tasks</h2>
  </div>
  <div className="flex flex-col md:flex-row md:space-x-20 space-y-4 md:space-y-0">
    <div className="group hover:bg-green-50 p-2 bg-green-200 rounded-full transition-colors duration-200 flex flex-col items-center">
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-700">{weeklyCompleted}</span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Weekly</p>
    </div>
    <div className="group hover:bg-green-50 p-2 bg-green-200 rounded-full transition-colors duration-200 flex flex-col items-center">
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-700">{monthlyCompleted}</span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Monthly</p>
    </div>
    <div className="group hover:bg-green-50 p-2 bg-green-200 rounded-full transition-colors duration-200 flex flex-col items-center">
      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-700">{yearlyCompleted}</span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Yearly</p>
    </div>
  </div>
</div>

            {/* Next Task Card */}
            <div className="flex flex-col md:flex-row gap-16">
            {nextTask ? (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h2 className="text-xl font-semibold text-gray-700">Next Task</h2>
                <p className="text-lg font-semibold text-gray-700">{nextTask.title}</p>
                <p className="text-sm text-gray-600">{nextTask.description}</p>
                <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="break-words">
                    {formatDate(nextTask.start_date)} - {formatDate(nextTask.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                  <User className="h-4 w-4" />
                  <span className="break-words">{nextTask.assigned_to}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-semibold text-gray-800">No Next Task</h2>
                <p className="text-sm text-gray-600">You have no upcoming tasks.</p>
              </div>
            )}

            {/* Pending Tasks Card */}
            <div className="bg-white rounded-lg shadow-md border-l-4 border-red-700">
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 animate-pulse duration-500 text-red-700">Pending Tasks !</h2>
                <div className="space-y-4 overflow-y-auto max-h-52 pr-2">
                  {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => (
                      <div key={task.id} className="bg-white rounded-lg shadow-md p-6 w-full">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Task</h2>
                        <p className="text-lg font-semibold text-gray-700">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="break-words">Due: {formatDate(task.end_date)}</span>
                        </div>
                        {task.assigned_to && (
                          <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                            <User className="h-4 w-4" />
                            <span className="break-words">{task.assigned_to}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 w-full">
                      <h2 className="text-xl font-semibold text-gray-800">No Pending Tasks</h2>
                      <p className="text-sm text-gray-600">You have no pending tasks.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="md:w-4/12">
            <div className="bg-white rounded-lg shadow-md border-l-4 border-[#5e10a296] sticky top-4">
              <CustomCalendar tasks={tasks} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm gap-24 mt-10 overflow-hidden flex flex-col md:grid md:grid-cols-2">
          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">High Priority Tasks</h2>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="mb-4 p-4 bg-[#f2f3f5] rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        task.priority === "High" 
                          ? "bg-red-100 text-red-800"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        <Flag className="h-3 w-3" />
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        task.status === "ongoing" 
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "upcoming"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        <CalendarIcon className="h-3 w-3" />
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Upcoming Tasks</h2>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="mb-4 p-4 bg-[#f2f3f5] rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        task.priority === "High" 
                          ? "bg-red-100 text-red-800"
                          : task.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        <Flag className="h-3 w-3" />
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                        task.status === "ongoing" 
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "upcoming"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        <CalendarIcon className="h-3 w-3" />
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="p-6">
            <Calendar />
          </div> */}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleFormSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={taskDetails.title}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${fieldErrors.title ? 
                'border-red-500 bg-red-50 animate-shake' : 
                'border-gray-200'
              }`}
            placeholder="Enter task title"
          />
          {fieldErrors.title && (
            <p className="error-message text-red-500">Title is required</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows="3"
            value={taskDetails.description}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${fieldErrors.description ? 
                'border-red-500 bg-red-50 animate-shake' : 
                'border-gray-200'
              }`}
            placeholder="Enter task description"
          />
          {fieldErrors.description && (
            <p className="error-message text-red-500">Description is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={taskDetails.start_date}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.start_date ? 
                  'border-red-500 bg-red-50 animate-shake' : 
                  'border-gray-200'
                }`}
            />
            {fieldErrors.start_date && (
              <p className="error-message text-red-500">{fieldErrors.dateMessage || "Start date is required" }</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={taskDetails.end_date}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.end_date ? 
                  'border-red-500 bg-red-50 animate-shake' : 
                  'border-gray-200'
                }`}
            />
            {fieldErrors.end_date && (
              <p className="error-message text-red-500">
                {fieldErrors.dateMessage || "End date is required"}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="assigned_to"
              value={taskDetails.assigned_to}
              onChange={handleInputChange}
              className={`w-full pl-9 p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${fieldErrors.assigned_to ? 
                  'border-red-500 bg-red-50 animate-shake' : 
                  'border-gray-200'
                }`}
              placeholder="Enter assignee name"
            />
            {fieldErrors.assigned_to && (
              <p className="error-message text-red-500">Assignee is required</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              // className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 ${fieldErrors.priority ? 
                  'border-red-500 bg-red-50 animate-shake' : 
                  'border-gray-200'
                }`}
              value={taskDetails.priority}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            {fieldErrors.priority && (
              <p className="error-message text-red-500">Priority is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {/* <select
              name="status"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={taskDetails.status}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select> */}
            <input
              type="text"
              name="status"
              value={taskDetails.status}
              readOnly
              className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(false);
            setFieldErrors({});
            setFormSubmitted(false);
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#c2560c] text-white rounded-lg hover:bg-[#c2560c]/90 transition-colors"
        >
          Create Task
        </button>
      </div>
    </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;