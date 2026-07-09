export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  provider: string | null;
  verified: boolean;
  watchPreference: string | null;
  favoriteGenres: string[];
  favoriteProviders: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const profileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  provider: true,
  verified: true,
  watchPreference: true,
  favoriteGenres: true,
  favoriteProviders: true,
  createdAt: true,
  updatedAt: true,
} as const;
