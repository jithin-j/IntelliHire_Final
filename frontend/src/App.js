import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/home.jsx';
import EmployeeSentimentSurvey from './components/survey.jsx';
import DataVisualization from './components/DataVisualization/DataVisualization.jsx';
import LoginPage from './components/LoginPage.jsx';
import './App.css';
import AdminDashboard from './components/AdminDashboard.jsx';
import SignUpPage from './components/SignUp.jsx';
import LandingPage from './components/LandingPage/LandingPage.jsx';
import AssignTask from './components/AssignTask/AssignTask.jsx';
import MyTasks from './components/MyTasks/MyTasks.jsx';
import PrivateRoutes from './utils/PrivateRoutes.jsx';
import FileUploadPage from './components/FileUploadPage.jsx';
import ResumeResults from './components/resume_results/ResumeResults.jsx';
import AdminViewTasks from './components/AdminViewTasks/AdminViewTasks.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/survey" element={<EmployeeSentimentSurvey />} />
          <Route path="/home" element={<Home />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-employee" element={<SignUpPage />} />
            <Route path="/admin/assign-task" element={<AssignTask />} />
            <Route path="/admin/visualize-responses" element={<DataVisualization />} />
            <Route path="/admin/file-upload" element={<FileUploadPage />} />
            <Route path="/admin/results" element={<ResumeResults />} />
            <Route path="/admin/view-tasks" element={<AdminViewTasks />} />
          </Route>
          <Route path="/tasks" element={<MyTasks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
