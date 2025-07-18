import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initAuth } from './store/slices/authSlice';
import Login from './modules/auth/Login';
import SignUp from './modules/auth/SignUp';
import Landing from './modules/landing/Landing';
import RmgDashboard from './modules/dashboard/RmgDashboard';
import MngDashboard from './modules/dashboard/MngDashboard';
import Approvals from './modules/approvals/Approvals';
import RecruitPool from './modules/recruits/RecruitPool';
import ManagerCandidates from './modules/candidates/ManagerCandidates';
import Notifications from './modules/notifications/Notifications';
import UserManagement from './modules/user-management/UserManagement';
import InterviewManagement from './modules/interview-management/InterviewManagement';
import Layout from './modules/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/Layout.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/rmg_dashboard" element={
          <ProtectedRoute allowedRoles={['RMG']}>
            <Layout><RmgDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/mng_dashboard" element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <Layout><MngDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/approvals" element={
          <ProtectedRoute allowedRoles={['RMG']}>
            <Layout><Approvals /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/job-openings" element={
          <Layout>
            <ManagerCandidates />
          </Layout>
        } />
        <Route path="/notifications" element={
          <Layout>
            <Notifications />
          </Layout>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={['RMG']}>
            <Layout><UserManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/interviews" element={
          <ProtectedRoute allowedRoles={['Manager', 'RMG']}>
            <Layout><InterviewManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {({ user }) => (
              <Navigate 
                to={user?.role === 'Manager' ? '/mng_dashboard' : '/rmg_dashboard'} 
                replace 
              />
            )}
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
