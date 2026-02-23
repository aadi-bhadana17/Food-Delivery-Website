import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Unauthorized from './components/auth/Unauthorized';
import { ROLES } from './utils/constants';

// Simple placeholder components for demonstration
const CustomerDashboard = () => <h1>Customer Home</h1>;
const AdminPanel = () => <h1>Admin Dashboard</h1>;
const RestaurantPanel = () => <h1>Restaurant Management</h1>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes based on USER_ROLE */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/restaurant" 
            element={
              <ProtectedRoute allowedRoles={[ROLES.RESTAURANT_OWNER]}>
                <RestaurantPanel />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;