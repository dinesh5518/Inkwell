import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import MainLayout from './layouts/MainLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WritePage from './pages/WritePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #111)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
              }
            }}
          />

          <Routes>
            {/* Guest-only routes (redirect if logged in) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Main layout */}
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/post/:slug" element={<PostPage />} />
              <Route path="/u/:username" element={<ProfilePage />} />

              {/* Protected routes */}
              <Route path="/write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
              <Route path="/write/:id" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
