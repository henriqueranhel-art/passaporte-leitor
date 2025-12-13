import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Family, Child, Achievement } from './types';

interface AppState {
  // Family data
  familyId: string | null;
  family: Family | null;
  children: Child[];
  selectedChildId: string | null;
  
  // UI state
  isOnboardingComplete: boolean;
  showConfetti: boolean;
  recentAchievements: Achievement[];
  
  // Actions
  setFamily: (family: Family) => void;
  setFamilyId: (id: string) => void;
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  removeChild: (id: string) => void;
  setSelectedChild: (id: string | null) => void;
  completeOnboarding: () => void;
  triggerConfetti: () => void;
  addRecentAchievements: (achievements: Achievement[]) => void;
  clearRecentAchievements: () => void;
  reset: () => void;
}

const initialState = {
  familyId: null,
  family: null,
  children: [],
  selectedChildId: null,
  isOnboardingComplete: false,
  showConfetti: false,
  recentAchievements: [],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setFamily: (family) => set({ family, familyId: family.id }),
      
      setFamilyId: (id) => set({ familyId: id }),
      
      setChildren: (children) => {
        set({ children });
        // Auto-select first child if none selected
        if (!get().selectedChildId && children.length > 0) {
          set({ selectedChildId: children[0].id });
        }
      },
      
      addChild: (child) => {
        set((state) => ({ children: [...state.children, child] }));
        // Select new child if it's the first one
        if (get().children.length === 1) {
          set({ selectedChildId: child.id });
        }
      },
      
      updateChild: (id, data) => {
        set((state) => ({
          children: state.children.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },
      
      removeChild: (id) => {
        set((state) => ({
          children: state.children.filter((c) => c.id !== id),
          selectedChildId: state.selectedChildId === id ? null : state.selectedChildId,
        }));
      },
      
      setSelectedChild: (id) => set({ selectedChildId: id }),
      
      completeOnboarding: () => set({ isOnboardingComplete: true }),
      
      triggerConfetti: () => {
        set({ showConfetti: true });
        setTimeout(() => set({ showConfetti: false }), 3000);
      },
      
      addRecentAchievements: (achievements) => {
        set((state) => ({
          recentAchievements: [...achievements, ...state.recentAchievements].slice(0, 5),
        }));
      },
      
      clearRecentAchievements: () => set({ recentAchievements: [] }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'passaporte-leitor-storage',
      partialize: (state) => ({
        familyId: state.familyId,
        selectedChildId: state.selectedChildId,
        isOnboardingComplete: state.isOnboardingComplete,
      }),
    }
  )
);

// Selectors
export const useFamily = () => useStore((state) => state.family);
export const useFamilyId = () => useStore((state) => state.familyId);
export const useChildren = () => useStore((state) => state.children);
export const useSelectedChild = () => {
  const children = useStore((state) => state.children);
  const selectedId = useStore((state) => state.selectedChildId);
  return children.find((c) => c.id === selectedId) || null;
};
export const useIsOnboardingComplete = () => useStore((state) => state.isOnboardingComplete);
export const useShowConfetti = () => useStore((state) => state.showConfetti);
export const useRecentAchievements = () => useStore((state) => state.recentAchievements);
