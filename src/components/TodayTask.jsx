import React, { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User, Flag } from "lucide-react";
import Sidebar from "./Sidebar";
import axios from 'axios';

const TodayTask = () => {

  const [tasks, setTasks] = useState([]);

  const [todayTasks, setTodayTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "",
    assigned_to: "",
    priority: "",
    time: "",
  });
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    // Ensure tasks is an array before filtering
    const taskArray = Array.isArray(tasks) ? tasks : [];
    
    const filteredTasks = taskArray.filter(task => {
      const startDate = task?.start_date ? new Date(task.start_date).toISOString().split("T")[0] : null;
      const endDate = task?.end_date ? new Date(task.end_date).toISOString().split("T")[0] : null;
      return startDate && endDate && startDate <= today && endDate >= today;
    });
    
    setTodayTasks(filteredTasks);

    // Update pending tasks calculation
    const pendingTasks = taskArray.filter(task => {
      return task?.end_date < today && task?.status !== "completed";
    });
    setPendingTasks(pendingTasks);
  }, [tasks]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };


  const PendingTaskCard = ({ task }) => (
    <div 
      className="min-w-[300px] p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer mr-4" 
      onClick={() => handleTaskClick(task)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 line-clamp-1">{task.title}</h3>
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center gap-1">
            <Flag className="h-3 w-3" />
            Overdue
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDate(task.end_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{task.assigned_to}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const [selectedTask, setSelectedTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [filterTime, setFilterTime] = useState("");
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
    const today = new Date().toISOString().split("T")[0];
    // const filteredTasks = tasks.filter(task => task.start_date <= today && task.end_date >= today);
    const filteredTasks = tasks.filter(task => {
      const startDate = task.start_date ? new Date(task.start_date).toISOString().split("T")[0] : null;
      const endDate = task.end_date ? new Date(task.end_date).toISOString().split("T")[0] : null;
      return startDate && endDate && startDate <= today && endDate >= today;
    });
    setTodayTasks(filteredTasks);
  }, [tasks]);

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
    const fetchTasks = async () => {
      try {
        const userId = sessionStorage.getItem('user');
        if (userId) {
          const response = await axios.get(`http://localhost:3000/user/${userId}`);
          // console.log('Tasks:', response.data);
          setTasks(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);


  const [fieldErrors, setFieldErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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


  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'assigned_to','priority'];
    requiredFields.forEach(field => {
      if (!taskDetails[field]) {
        errors[field] = true;
      }
    });
    if (taskDetails.start_date && taskDetails.end_date) {
      const startDate = new Date(taskDetails.start_date);
      const endDate = new Date(taskDetails.end_date);
      if (startDate > endDate) {
        errors.end_date = true;
        errors.startDateGreaterThanEndDate = "End date cannot be before start date";
      }
    }
    if (taskDetails.start_date && taskDetails.end_date) {
      const startDate = new Date(taskDetails.start_date);
      const endDate = new Date(taskDetails.end_date);
      if (endDate < startDate) {
        errors.start_date = true;
        errors.endDateLessThanStartDate = "Start date cannot be after end date";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);


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
        time: "",
      });
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleFilterChange = () => {
    const filteredTasks = tasks.filter(task => {
      const taskTime = task.time;
      return taskTime === filterTime;
    });
    setTodayTasks(filteredTasks);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetails(task);
    setIsModalOpen(true);
  };

  const highPriorityTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => (task?.priority === "High") && (task.status !="completed")) : [];
  const mediumPriorityTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => (task?.priority === "Medium") && (task.status !="completed")) : [];
  const lowPriorityTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => (task?.priority === "Low") && (task.status !="completed")) : [];

  const TaskCard = ({ task }) => (
    <div className="mb-4 p-4 bg-[#f2f3f5] rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer" onClick={() => handleTaskClick(task)}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 line-clamp-1">{task.title}</h3>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
              task.status === "onprocess" 
                ? "bg-blue-100 text-blue-800"
                : task.status === "upcoming"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}>
              <Calendar className="h-3 w-3" />
              {task.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDate(task.start_date)} - {formatDate(task.end_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{task.assigned_to}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PriorityColumn = ({ title, tasks, bgColor }) => (
    <div className="flex-1 min-w-0">
      <div className={`h-full bg-white rounded-xl shadow-md overflow-hidden border-2 ${bgColor}`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
          <div className="overflow-y-auto h-[calc(100vh-280px)] pr-2 space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#c2560c] to-[#f26b0f] rounded-xl p-6 md:p-8 mb-2 text-white shadow-lg">
            <div className="flex items-center justify-end font-bold gap-2 text-white text-xl">{currentTime}</div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Today's Tasks</h1>
              <p className="mt-1 text-white/80 text-sm">Keep track of your daily activities</p>
            </div>
            <button
              onClick={() => {
                setIsModalOpen(true);
                setTaskDetails({
                  title: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                  status: "",
                  assigned_to: "",
                  priority: "",
                  time: "",
                });
                setSelectedTask(null);
              }}
              className="flex items-center px-4 py-2 bg-white text-[#c2560c] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex">
          {/* <div className="bg-white rounded-lg shadow-md border-l-4 border-red-700 mb-6">
          <div className="p-4">
            <h2 className="text-xl font-semibol mb-4 animate-pulse duration-500 text-red-700">
              {pendingTasks.length > 0 ? 'Pending Tasks' : 'No Pending Tasks'}
            </h2>
            <div className="space-y-4 overflow-y-auto max-h-52 pr-2">
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex space-y-4"
                  ><PendingTaskCard key={task.id} task={task} /></div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 w-full">
                  <h2 className="text-xl font-semibold text-gray-800">No Pending Tasks</h2>
                  <p className="text-sm text-gray-600">You have no pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div> */}
        {/* Pending Task Section */}
<div className="bg-white rounded-lg shadow-md border-l-4 border-red-700 mb-6 w-full">
  <div className="p-4">
    <h2 className="text-xl font-semibold mb-4 animate-pulse duration-500 text-red-700">
      {pendingTasks.length > 0 ? 'Pending Tasks' : 'No Pending Tasks'}
    </h2>
    <div className="flex overflow-x-auto space-x-4 max-w-screen-lg pr-2">
      {pendingTasks.length > 0 ? (
        pendingTasks.map(task => (
          <PendingTaskCard key={task.id} task={task} />
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
 


        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-1 gap-6 h-[calc(100vh-200px)]">
          <PriorityColumn 
            title="High Priority" 
            tasks={highPriorityTasks} 
            bgColor="border-red-800"
          />
          <PriorityColumn 
            title="Medium Priority" 
            tasks={mediumPriorityTasks} 
            bgColor="border-yellow-500"
          />
          <PriorityColumn 
            title="Low Priority" 
            tasks={lowPriorityTasks} 
            bgColor="border-blue-500"
          />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-height-[90vh] overflow-y-auto">
              {selectedTask ? (
                // View Task Modal
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-red-700 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.title}</p>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <p className="p-2 bg-gray-50 rounded-lg">{formatDate(taskDetails.start_date)}</p>
                      </div>
                      <div>
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <p className="p-2 bg-gray-50 rounded-lg">{formatDate(taskDetails.end_date)}</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                      <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.assigned_to}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.priority}</p>
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.status}</p>
                      </div>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <p className="p-2 bg-gray-50 rounded-lg">{taskDetails.time}</p>
                    </div> */}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-white bg-[#c2560c] rounded-lg hover:bg-[#c2560c]/90 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                // Create/Edit Task Modal
                <>
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
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
            {/* {fieldErrors.start_date && (
              <p className="text-red-500 text-sm mt-1">Start date is required</p>
            )}
            {fieldErrors.start_date && fieldErrors.endDateLessThanStartDate && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.endDateLessThanStartDate}</p>
              )} */}
              {fieldErrors.start_date && (
                <p className="error-message text-red-500 text-sm mt-1">
                  {fieldErrors.endDateLessThanStartDate || "End date is required"}
                </p>
              )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
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
            {/* {fieldErrors.end_date && (
              <p className="text-red-500 text-sm mt-1">End date is required</p>
            )}
            {fieldErrors.end_date && fieldErrors.startDateGreaterThanEndDate && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.startDateGreaterThanEndDate}</p>
              )} */}
              {fieldErrors.end_date && (
              <p className="error-message text-red-500 text-sm mt-1">
                {fieldErrors.startDateGreaterThanEndDate || "End date is required"}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              className={`w-full pl-9 p-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {/* <select
              name="status"
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={taskDetails.status}
              onChange={handleInputChange}
            >
              <option value="onprocess">onProcess</option>
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
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TodayTask;