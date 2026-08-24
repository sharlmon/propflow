import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';
import { apiRequest, ApiError } from '../api/client';
import type { User } from '../api/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    role: 'landlord' | 'renter';
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const meKey = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: meKey,
    queryFn: ({ signal }) => apiRequest<User>('/me', { signal }),
    retry: false,
    staleTime: 60_000,
  });
  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiRequest<User>('/auth/login', { method: 'POST', body: input }),
    onSuccess: (user) => queryClient.setQueryData(meKey, user),
  });
  const registerMutation = useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      full_name: string;
      phone: string;
      role: 'landlord' | 'renter';
    }) => apiRequest<User>('/auth/register', { method: 'POST', body: input }),
    onSuccess: (user) => queryClient.setQueryData(meKey, user),
  });
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryClient.setQueryData(meKey, null);
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' });
    },
  });

  const unauthenticated = me.error instanceof ApiError && me.error.status === 401;
  return (
    <AuthContext.Provider
      value={{
        user: unauthenticated ? null : (me.data ?? null),
        isLoading: me.isLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
