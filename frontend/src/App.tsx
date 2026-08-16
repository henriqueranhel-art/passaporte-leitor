import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useStore, useIsOnboardingComplete, useFamilyId, useShowConfetti, useUserType } from './lib/store';
import { familyApi, childrenApi } from './lib/api';

// Components (loaded immediately - needed for layout)
import Layout from './components/Layout';
import Confetti from './components/Confetti';
import LoadingScreen from './components/LoadingScreen';

// Lazy-loaded pages (code splitting)
const AuthPage = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const ReadingSessions = lazy(() => import('./pages/ReadingSessions'));
const MapPage = lazy(() => import('./pages/Map'));
const AchievementsPage = lazy(() => import('./pages/Achievements'));
const PrintPage = lazy(() => import('./pages/Print'));
const Settings = lazy(() => import('./pages/Settings'));
const SchoolAdminPage = lazy(() => import('./pages/SchoolAdmin'));

export default function App() {
  const location = useLocation();
  const isOnboardingComplete = useIsOnboardingComplete();
  const familyId = useFamilyId();
  const userType = useUserType();
  const showConfetti = useShowConfetti();
  const { setFamily, setChildren, logout } = useStore();

  const isAuthPage = location.pathname === '/auth';
  const hasToken = !!localStorage.getItem('authToken');
  const isSchoolAdmin = userType === 'school_admin';

  // Only fetch data when authenticated as a family and not on auth page
  const shouldFetchData = !isSchoolAdmin && !!familyId && isOnboardingComplete && hasToken && !isAuthPage;

  // Fetch family data if we have an ID
  const { data: familyData, isLoading: familyLoading, error: familyError } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => familyApi.get(familyId!),
    enabled: shouldFetchData,
    retry: 1,
  });

  // Fetch children
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children', familyId],
    queryFn: () => childrenApi.getByFamily(familyId!),
    enabled: shouldFetchData,
    retry: 1,
  });

  useEffect(() => {
    if (familyData) setFamily(familyData);
  }, [familyData, setFamily]);

  useEffect(() => {
    if (childrenData) setChildren(childrenData);
  }, [childrenData, setChildren]);

  // Handle auth error on family fetch (e.g., 401 unauthorized)
  useEffect(() => {
    if (familyError) {
      logout();
    }
  }, [familyError, logout]);

  const isLoading = familyLoading || childrenLoading;

  // /auth is always accessible without token
  if (!hasToken) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Show Auth if onboarding not complete (even with token)
  if (!isOnboardingComplete) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // School admin: área própria de gestão de turmas (sem dados de família)
  if (isSchoolAdmin) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/escola" element={<SchoolAdminPage />} />
          <Route path="/auth" element={<Navigate to="/escola" replace />} />
          <Route path="*" element={<Navigate to="/escola" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // If familyId missing but has token and onboarding complete, show loading
  if (!familyId) {
    return <LoadingScreen />;
  }

  // Show loading while fetching data
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If family data failed to load, the useEffect above will handle logout
  if (familyError) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/livros" element={<Books />} />
            <Route path="/leituras" element={<ReadingSessions />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/conquistas" element={<AchievementsPage />} />
            <Route path="/imprimir" element={<PrintPage />} />
            <Route path="/definicoes" element={<Settings />} />
          </Route>
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Confetti active={showConfetti} />
    </>
  );
}
