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
  const { data: familyData, isLoading: familyLoading } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => familyApi.get(familyId!),
    enabled: !!familyId && isOnboardingComplete,
  });

  // Fetch children
  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ['children', familyId],
    queryFn: () => childrenApi.getByFamily(familyId!),
    enabled: !!familyId && isOnboardingComplete,
  });

  useEffect(() => {
    if (familyData) setFamily(familyData);
  }, [familyData, setFamily]);

  useEffect(() => {
    if (childrenData) setChildren(childrenData);
  }, [childrenData, setChildren]);

  const isLoading = familyLoading || childrenLoading;

  // Check for auth token (legacy support)
  const hasToken = !!localStorage.getItem('authToken');

  // Show Auth if not logged in / onboarding not complete
  if (!isOnboardingComplete || !hasToken) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // Show loading while fetching data
  if (isLoading) {
    return <LoadingScreen />;
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
      </Routes>
      <Confetti active={showConfetti} />
    </>
  );
}
