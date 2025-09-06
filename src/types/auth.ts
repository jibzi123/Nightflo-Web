export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clubId?: string;
  permissions: string[];
}

export type UserRole = 'super_admin' | 'CLUB_OWNER' | 'door_team' | 'event_promoter' | 'club_staff';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}