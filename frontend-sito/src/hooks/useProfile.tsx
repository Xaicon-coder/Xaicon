import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Profile {
  id: string;
  name: string;
  avatar: string; // URL immagine personaggio
  createdAt: number;
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  selectProfile: (id: string) => void;
  createProfile: (name: string, avatar: string) => void;
  deleteProfile: (id: string) => void;
  logout: () => void;
}

const PROFILES_KEY = 'anistream-profiles';
const ACTIVE_KEY = 'anistream-active-profile';

// Personaggi anime iconici con immagini da MyAnimeList
export const AVATAR_OPTIONS = [
  { name: 'Naruto', url: '/avatars/naruto.jpg' },
  { name: 'Goku', url: '/avatars/goku.jpg' },
  { name: 'Luffy', url: '/avatars/luffy.jpg' },
  { name: 'Tanjiro', url: '/avatars/tanjiro.jpg' },
  { name: 'Gojo', url: '/avatars/gojo.jpg' },
  { name: 'Levi', url: '/avatars/levi.jpg' },
  { name: 'Zoro', url: '/avatars/zoro.jpg' },
  { name: 'Eren', url: '/avatars/eren.jpg' },
  { name: 'Gon', url: '/avatars/gon.jpg' },
  { name: 'Senku', url: '/avatars/senku.jpg' },
  { name: 'Denji', url: '/avatars/denji.jpg' },
  { name: 'Anya', url: '/avatars/anya.jpg' },
];

function loadProfiles(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function loadActiveId(): string | null {
  return sessionStorage.getItem(ACTIVE_KEY);
}

function saveActiveId(id: string | null) {
  if (id) sessionStorage.setItem(ACTIVE_KEY, id);
  else sessionStorage.removeItem(ACTIVE_KEY);
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [activeId, setActiveId] = useState<string | null>(loadActiveId);

  const activeProfile = profiles.find(p => p.id === activeId) || null;

  const selectProfile = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const createProfile = useCallback((name: string, avatar: string) => {
    // Fallback for browsers without crypto.randomUUID (e.g. TV browsers on HTTP)
    const generateId = (): string => {
      try {
        return crypto.randomUUID();
      } catch {
        return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
      }
    };
    const newProfile: Profile = {
      id: generateId(),
      name: name.trim(),
      avatar,
      createdAt: Date.now(),
    };
    setProfiles(prev => {
      const next = [...prev, newProfile];
      saveProfiles(next);
      return next;
    });
    selectProfile(newProfile.id);
  }, [selectProfile]);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveProfiles(next);
      return next;
    });
    if (activeId === id) {
      setActiveId(null);
      saveActiveId(null);
    }
  }, [activeId]);

  const logout = useCallback(() => {
    setActiveId(null);
    saveActiveId(null);
  }, []);

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, selectProfile, createProfile, deleteProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}


