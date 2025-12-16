import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useStore, useIsOnboardingComplete, useFamilyId, useShowConfetti } from './lib/store';
import { familyApi, childrenApi } from './lib/api';

// Pages
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import BooksPage from './pages/Books';
import AchievementsPage from './pages/Achievements';
import PrintPage from './pages/Print';

// Components
import Layout from './components/Layout';
import Confetti from './components/Confetti';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const isOnboardingComplete = useIsOnboardingComplete();
  const familyId = useFamilyId();
  const showConfetti = useShowConfetti();
  const { setFamily, setChildren } = useStore();

  // Fetch family data if we have an ID
  const { data: familyData, isLoading: familyLoading, error: familyError } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => familyApi.get(familyId!),
    enabled: !!familyId && isOnboardingComplete,
    retry: 1, // Only retry once to avoid long waits on auth errors
  });

  // Fetch children
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children', familyId],
    queryFn: () => childrenApi.getByFamily(familyId!),
    enabled: !!familyId && isOnboardingComplete,
    retry: 1,
  });

  useEffect(() => {
    if (familyData) setFamily(familyData);
  }, [familyData, setFamily]);

  useEffect(() => {
    if (childrenData) setChildren(childrenData);
  }, [childrenData, setChildren]);

  const isLoading = familyLoading || childrenLoading;

  // Check for auth token - this is the primary authentication check
  const hasToken = !!localStorage.getItem('authToken');

  // Redirect to auth if no token, regardless of onboarding state
  // This prevents bypass via persisted state
  if (!hasToken) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Show Auth if onboarding not complete (even with token)
  if (!isOnboardingComplete) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Check if familyId is missing - logout and redirect
  if (!familyId) {
    useStore.getState().logout();
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Show loading while fetching data
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If family data failed to load (e.g., 401 unauthorized), logout and redirect
  if (familyError) {
    useStore.getState().logout();
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapa" element={<MapPage />} />
          <Route path="livros" element={<BooksPage />} />
          <Route path="conquistas" element={<AchievementsPage />} />
          <Route path="imprimir" element={<PrintPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
      </Routes>
      <Confetti active={showConfetti} />
    </>
  );
}
