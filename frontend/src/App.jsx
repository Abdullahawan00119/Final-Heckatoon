import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import JobPostPage from './pages/jobs/JobPostPage';
import JobApplicantsPage from './pages/jobs/JobApplicantsPage';
import ServicesPage from './pages/services/ServicesPage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import ServiceCreatePage from './pages/services/ServiceCreatePage';
import MessagesPage from './pages/messages/MessagesPage';
import OrdersPage from './pages/orders/OrdersPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="jobs/:id/applicants" element={<JobApplicantsPage />} />
            <Route path="jobs/post" element={<JobPostPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/create" element={<ServiceCreatePage />} />
            <Route path="services/:slug" element={<ServiceDetailPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:id" element={<PublicProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
