import React, { useState, useEffect } from "react";
import { Plus, User, Flag } from "lucide-react";
import Sidebar from "./Sidebar";
import axios from 'axios';

const Completed = () => {

  const [tasks, setTasks] = useState([]);

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "",
    assigned_to: "",
    priority: "",
  });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', 
    { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      year:'numeric',
      month:'2-digit',
      day:'2-digit' 
    }));

  useEffect(() => {
     const fetchTasks = async () => {
      try {
        const userId = sessionStorage.getItem('user');
        if (userId) {
          const response = await axios.get(`http://localhost:3000/user/${userId}`);
          console.log(response.data);
          setTasks(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  },[]);
  
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString('en-GB', 
          { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            year:'numeric',
            month:'2-digit',
            day:'2-digit'
          }));
      }, 1000);
  
      return () => clearInterval(timer);
    }, []);
  

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([]); // If tasks are not present or empty, set an empty filteredTasks array.
      return;
    }
    const filtered = tasks
      .filter(task => task.status === "completed")
      .filter(task => task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(task => (filterPriority ? task.priority === filterPriority : true))
      .filter(task => (filterStartDate ? new Date(task.start_date) >= new Date(filterStartDate) : true))
      .filter(task => (filterEndDate ? new Date(task.end_date) <= new Date(filterEndDate) : true));
    const sorted = filtered.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
    setFilteredTasks(sorted);
  }, [tasks, searchQuery, filterPriority, filterStartDate, filterEndDate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'assigned_to', 'status', 'priority'];
    
    requiredFields.forEach(field => {
      if (!taskDetails[field]) {
        errors[field] = true;
      }
    });

    // Additional date validation
    if (taskDetails.start_date && taskDetails.end_date) {
      if (new Date(taskDetails.end_date) < new Date(taskDetails.start_date)) {
        errors.end_date = true;
        errors.dateMessage = "End date must be after start date";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setTaskDetails({ ...taskDetails, [name]: value });
  // };

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
      updatedTaskDetails.status = status;
    }
  
    setTaskDetails(updatedTaskDetails);
  
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const userId = sessionStorage.getItem('user');
      const response = await axios.post('http://localhost:3000/task/addTask', { 
        ...taskDetails, 
        created_by: userId 
      });
      
      setTasks([...tasks, response.data]);
      setShowNotification(true);
      setIsModalOpen(false);
      setTaskDetails({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "",
        assigned_to: "",
        priority: "",
      });
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Clear errors after timeout
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);


  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const handleClearFilters = () =>{
    setSearchQuery("");
    setFilterPriority("");
    setFilterStartDate("");
    setFilterEndDate("");
  };



  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#c2560c] to-[#f26b0f] rounded-xl p-6 md:p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-end font-bold gap-2 text-white text-xl">{currentTime}</div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Completed Tasks</h1>
              <p className="mt-2 text-white/80 italic text-sm md:text-base">Manage your completed tasks</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-[#c2560c] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> 
              Create Task
            </button>
          </div>
          {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            Task Created Successfully
          </div>
        )}
        </div>

        {/* Search Section */}
        <div className="bg-white p-2 rounded-lg shadow-sm ">
          <label className="block text-sm font-medium text-gray-700 ">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            placeholder="Search by title"
          />
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleClearFilters}
            className="px-4 py-2 bg-[#f26b0f] text-white rounded-lg hover:bg-[#f26b0f]/90 transition-colors"
          >Clear Filter
          </button>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Completed Tasks</h2>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="mb-4 p-4 bg-[#f2f3f5] rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <span>{task.description}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <span>Remarks: {task.remarks}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <span>{formatDate(task.end_date)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                          task.priority === "High" 
                            ? "bg-red-100 text-red-800"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            :  "bg-green-100 text-green-800"
                        }`}>
                          <Flag className="h-3 w-3" />
                          {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                          task.status === "completed" 
                            ? "bg-green-100 text-green-800"
                            : ""
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No completed tasks found.</p>
              )}
            </div>
          </div>
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
                      <p className="text-red-500 text-sm mt-1">Title is required</p>
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
                      <p className="text-red-500 text-sm mt-1">Description is required</p>
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
                        <p className="text-red-500 text-sm mt-1">Start date is required</p>
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
                        <p className="text-red-500 text-sm mt-1">
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
                        <p className="text-red-500 text-sm mt-1">Assignee is required</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="priority"
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
                        <p className="text-red-500 text-sm mt-1">Priority is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      {/* <select
                        name="status"
                        className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${fieldErrors.status ? 
                            'border-red-500 bg-red-50 animate-shake' : 
                            'border-gray-200'
                          }`}
                        value={taskDetails.status}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                      {fieldErrors.status && (
                        <p className="text-red-500 text-sm mt-1">Status is required</p>
                      )} */}
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

export default Completed;