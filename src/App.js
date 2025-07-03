import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './modules/auth/Login';
import SignUp from './modules/auth/SignUp';
import RmgDashboard from './modules/dashboard/RmgDashboard';
import MngDashboard from './modules/dashboard/MngDashboard';
import Approvals from './modules/approvals/Approvals';
import RecruitPool from './modules/recruits/RecruitPool';
import ManagerCandidates from './modules/candidates/ManagerCandidates';
import Layout from './modules/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './styles/Layout.css';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
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
        <Route path="/" element={
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
      </AuthProvider>
    </Router>
  );
}

export default App;
