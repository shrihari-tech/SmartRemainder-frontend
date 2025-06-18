 import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import Sidebar from "./Sidebar";
import axios from 'axios';
const AllTasks = () => {

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "ongoing",
    assigned_to: "",
    priority: "",
    remarks:"",
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', 
    { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      year:'numeric',
      month:'2-digit',
      day:'2-digit'
    }));
  const [modalMode, setModalMode] = useState('view');
  const [showNotification, setShowNotification] =  useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete]= useState(null);
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const formatDate = (dateString)=>{
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = sessionStorage.getItem('user');
        if (userId) {
          const response = await axios.get(`https://smart-remainder-backend.vercel.app/user/${userId}`);
          setTasks(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleEditClick = () =>{
    setModalMode('edit');
  }

  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://smart-remainder-backend.vercel.app/task/${taskToDelete}/deleteTask`);
      setTasks(tasks.filter(task => task._id !== taskToDelete));
      setIsModalOpen(false);
      setSelectedTask(null);
      setShowDeleteConfirmation(false);
      setShowDeleteNotification(true);
      
      // Hide delete success notification after 3 seconds
      setTimeout(() => {
        setShowDeleteNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

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
    const filterAndSearchTasks = () => {
      // Ensure tasks is an array
      if (!Array.isArray(tasks)) {
        setFilteredTasks([]);
        return;
      }
  
      const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
      const statusOrder = { "onprocess": 1, "upcoming": 2, "completed": 3 };
  
      const filtered = tasks
        .filter(task => (filterPriority ? task.priority === filterPriority : true))
        .filter(task => (filterStatus ? task.status === filterStatus : true))
        .filter(task => (filterStartDate ? new Date(task.start_date) >= new Date(filterStartDate) : true))
        .filter(task => (filterEndDate ? new Date(task.end_date) <= new Date(filterEndDate) : true))
        .filter(task => task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return statusOrder[a.status] - statusOrder[b.status];
        });
  
      setFilteredTasks(filtered);
    };
  
    filterAndSearchTasks();
  }, [tasks, filterPriority, filterStatus, filterStartDate, filterEndDate, searchQuery]);

  const handlePriorityFilterChange = (e) => {
    setFilterPriority(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleStartDateFilterChange = (e) => {
    setFilterStartDate(e.target.value);
  };

  const handleEndDateFilterChange = (e) => {
    setFilterEndDate(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'assigned_to','priority'];
    
    requiredFields.forEach(field => {
      if (!taskDetails[field]) {
        errors[field] = true;
      }
    });

    // Additional date validation
    if (taskDetails.start_date && taskDetails.end_date) {
      if (new Date(taskDetails.end_date) < new Date(taskDetails.start_date)) {
        errors.end_date = true;
        errors.dateMessage = "End date cannot be before start date";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const formattedTaskDetails = {
      ...taskDetails,
      start_date: new Date(taskDetails.start_date).toISOString().split("T")[0],
      end_date: new Date(taskDetails.end_date).toISOString().split("T")[0],
    };
    
    if (isEditing) {
      try {
        const response = await axios.put(`https://smart-remainder-backend.vercel.app/task/${selectedTask._id}/updateTask`, formattedTaskDetails);
        const updatedTasks = tasks.map(task => task._id === selectedTask._id ? { ...task, ...formattedTaskDetails } : task);
        setTasks(updatedTasks);
        setSelectedTask(null);
        setIsModalOpen(false);
        setIsEditing(false);
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      try {
        const userId = sessionStorage.getItem('user');
        const response = await axios.post('https://smart-remainder-backend.vercel.app/task/addTask', { ...formattedTaskDetails, created_by: userId });
        setTasks([...tasks, response.data]);
        setIsModalOpen(false);
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors])
  
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetails({
      ...task,
      start_date: new Date(task.start_date).toISOString().split("T")[0],
      end_date: new Date(task.end_date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
    setIsEditing(true);
    setModalMode('view');
  };
  
  const handleCreateTask = () => {
    setTaskDetails({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "ongoing",
      assigned_to: "",
      priority: "",
    });
    setIsEditing(false);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const clearAllFilters = () => {
    setFilterPriority("");
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#c2560c] to-[#f26b0f] rounded-xl p-6 md:p-8 mb-2 text-white shadow-lg">
        <div className="flex items-center justify-end font-bold gap-2 text-white text-xl">{currentTime}</div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">All Tasks</h1>
              <p className="mt-2 text-white/80 italic text-sm md:text-base">Manage all your tasks</p>
            </div>
            <button
              onClick={handleCreateTask}
              className="flex items-center px-4 py-2 bg-white text-[#c2560c] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </button>
          </div>
          {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
            Task edited successfully!
          </div>
          )}
          {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-scaleIn">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
          
        </div>

        {/* Filter and Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={handlePriorityFilterChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={handleStatusFilterChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="onprocess">On Process</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Start Date</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={handleStartDateFilterChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by End Date</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={handleEndDateFilterChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
            />
          </div>
          <div className="bg-white p-2 rounded-lg w-full flex shadow-sm md:col-span-3">
            <label className="block text-sm font-medium p-2 text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
              placeholder="Search by title"
            />
            
          </div>
          <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-[#c2560c] text-white rounded-lg w-fit hover:bg-[#c2560c]/90 transition-colors flex items-center gap-6"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Tasks</h2>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="mb-4 p-4 bg-[#f2f3f5] rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                          <span>{task.description}</span>
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
                          {task.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                          task.status === "onprocess" 
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "upcoming"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No tasks found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
              {isModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {modalMode === 'view' ? 'View Task' : modalMode === 'edit' ? 'Edit Task' : 'Create New Task'}
          </h2>
          <div className="flex items-center gap-2">
            {modalMode === 'view' && selectedTask && (
              <>
                <button
                  onClick={handleEditClick}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-5 text-green-700 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedTask._id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 text-red-700 w-5" />
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setModalMode('view');
                setSelectedTask(null);
              }}
              className="text-red-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
        {modalMode === 'view' ? (
          // View Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <p className="p-2 bg-gray-50 rounded-lg">{formatDate(taskDetails.start_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <p className="p-2 bg-gray-50 rounded-lg">{formatDate(taskDetails.end_date)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.assigned_to}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.priority}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.status}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {taskDetails.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.remarks}</p>
                </div>
              )}
            </div> 
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalMode('view');
                  setSelectedTask(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
              <form onSubmit={handleFormSubmit}>
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
                className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
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
                className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
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
                  className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
                    ${fieldErrors.start_date ? 
                      'border-red-500 bg-red-50 animate-shake' : 
                      'border-gray-200'
                    } ${isEditing && new Date(taskDetails.start_date) <= new Date() ? 'bg-gray-300' : ''}`}
                  disabled = {isEditing && new Date(taskDetails.start_date) <= new Date()}
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
                  className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
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
                <input
                  type="text"
                  name="assigned_to"
                  value={taskDetails.assigned_to}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
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
                  className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
                    ${fieldErrors.assigned_to ? 
                      'border-red-500 bg-red-50 animate-shake' : 
                      'border-gray-200'
                    }`}
                  value={taskDetails.priority}
                  onChange={handleInputChange}
                >
                  <option value="">Select Priority</option>
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
                  className={`w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent
                    ${fieldErrors.status ? 
                      'border-red-500 bg-red-50 animate-shake' : 
                      'border-gray-200'
                    }`}
                  required
                  value={taskDetails.status}
                  onChange={handleInputChange}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                {fieldErrors.status && (
                  <p className="text-red-500 text-sm mt-1">Status is required</p>
                )} */}
                { isEditing && (
                  <select
                    name="status"
                    className={`...`}
                    required={isEditing}
                    value={taskDetails.status}
                    onChange={handleInputChange}
                  >
                    <option value="onprocess">On Process</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                { modalMode === 'create' && (
                  <input
                  type="text"
                  name="status"
                  value={taskDetails.status}
                  readOnly
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100"
                />
                )}
                {/* <input
                  type="text"
                  name="status"
                  value={taskDetails.status}
                  readOnly
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100"
                /> */}
                
              </div>
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea 
                  name="remarks"
                  rows="3"
                  value={taskDetails.remarks}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#FF5D4B] focus:border-transparent"
                  placeholder="Enter remarks"
                />
              </div>
            )}
          </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditing(false);
                      setSelectedTask(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#c2560c] text-white rounded-lg hover:bg-[#c2560c]/90 transition-colors"
                  >
                    {isEditing ? "Save Changes" : "Create Task"}
                  </button>
                </div>
              </form>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllTasks;  