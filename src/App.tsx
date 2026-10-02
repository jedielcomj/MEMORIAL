import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { JourneyPage } from './pages/Journey';
import { StonesPage } from './pages/Stones';
import { LifeMapPage } from './pages/LifeMap';
import { DiscernSeasonPage } from './pages/DiscernSeason';
import { DreamBookPage } from './pages/DreamBook';
import { ProjectsPage } from './pages/Projects';
import { PrayerJournalPage } from './pages/PrayerJournal';
import { ReviewsPage } from './pages/Reviews';
import { ClosurePage } from './pages/Closure';
import { CommunityAppendixPage } from './pages/CommunityAppendix';
import { AccountPage } from './pages/Account';
import { AuthPage } from './pages/Auth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F0E7]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B49A6A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif italic text-sm text-[#383B32]">Abrindo seu memorial...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/entrar';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E7] text-[#383B32]">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!isAuthPage && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${isAuthPage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <Routes>
            {/* Public auth route */}
            <Route path="/entrar" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornada"
              element={
                <ProtectedRoute>
                  <JourneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pedras"
              element={
                <ProtectedRoute>
                  <StonesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mapa"
              element={
                <ProtectedRoute>
                  <LifeMapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discernir"
              element={
                <ProtectedRoute>
                  <DiscernSeasonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sonhos"
              element={
                <ProtectedRoute>
                  <DreamBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projetos"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/oracoes"
              element={
                <ProtectedRoute>
                  <PrayerJournalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revisoes"
              element={
                <ProtectedRoute>
                  <ReviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/encerramento"
              element={
                <ProtectedRoute>
                  <ClosurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comunidade"
              element={
                <ProtectedRoute>
                  <CommunityAppendixPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conta"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
