import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DiscoverJobsPage } from './pages/DiscoverJobsPage';
import { RecommendedJobsPage } from './pages/RecommendedJobsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResumePage } from './pages/ResumePage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="jobs" element={<DiscoverJobsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="recommended"
                  element={
                    <ProtectedRoute>
                      <RecommendedJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="applications"
                  element={
                    <ProtectedRoute>
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="resume"
                  element={
                    <ProtectedRoute>
                      <ResumePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
