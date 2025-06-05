// import React from "react";
// import LoginPage from "./components/LoginPage";
// import SignupPage from "./components/SignupPage";
// import Dashboard from "./components/Dashboard";
// import TodayTask from "./components/TodayTask";
// import AllTask from "./components/AllTask";
// import Completed from "./components/Completed";
// import Profile from "./components/Profile";
// import Forgotpassword from "./components/Forgotpassword";
// import { ProfileProvider } from "./components/ProfileContext";
// import {BrowserRouter, Routes, Route} from "react-router-dom";

// const App = () => {
//   return (
//     <>
//     <ProfileProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/todaytask" element={<TodayTask />} />
//           <Route path="/alltask" element={<AllTask />} />
//           <Route path="/completed" element={<Completed />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/forgot-password" element={<Forgotpassword />} />
//         </Routes>
//       </BrowserRouter>
//     </ProfileProvider>
//     </>
//   )
// }
// export default App;

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import TodayTask from "./components/TodayTask";
import AllTask from "./components/AllTask";
import Completed from "./components/Completed";
import Profile from "./components/Profile";
import Forgotpassword from "./components/Forgotpassword";
import { ProfileProvider } from "./components/ProfileContext";

// PrivateRoute Component to Restrict Access
const PrivateRoute = () => {
  const userUUID = sessionStorage.getItem("user");
  return userUUID ? <Outlet /> : <Navigate to="/" />;
};

const App = () => {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/todaytask" element={<TodayTask />} />
            <Route path="/alltask" element={<AllTask />} />
            <Route path="/completed" element={<Completed />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
};

export default App;
