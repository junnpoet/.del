import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { queryClient } from './queryClient';
import { parseGeoPoint } from './geo';

export interface AuthProfile {
  id: string;
  full_name: string;
  phone: string;
  home_address: string;
  role: string | null;
  is_vulnerable: boolean | null;
  lat: number | null;
  lng: number | null;
}

export interface SignUpInput {
  email?: string;
  password: string;
  fullName: string;
  phone: string;
  homeAddress: string;
  latitude: number;
  longitude: number;
  pushToken?: string | null;
}

interface AuthContextValue {
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  signIn: (phoneOrEmail: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function phoneToAuthEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const digits = trimmed.replace(/\D/g, '');
  const nationalDigits =
    digits.length === 11 && digits.startsWith('51') ? digits.slice(2) : digits;
  return `${nationalDigits}@sumayni.pe`;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, home_address, role, is_vulnerable, home_location')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const point = parseGeoPoint(data.home_location);
  return {
    id: data.id,
    full_name: data.full_name,
    phone: data.phone,
    home_address: data.home_address,
    role: data.role,
    is_vulnerable: data.is_vulnerable,
    lat: point?.lat ?? null,
    lng: point?.lng ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await fetchProfile(userId));
    } catch (err) {
      console.warn('No se pudo cargar el perfil', err);
    }
  }, [userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signIn = useCallback(async (phoneOrEmail: string, password: string) => {
    const email = phoneToAuthEmail(phoneOrEmail);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const email = input.email?.trim() || phoneToAuthEmail(input.phone);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
    });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('CONFIRM_EMAIL');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      home_address: input.homeAddress.trim(),
      home_location: `SRID=4326;POINT(${input.longitude} ${input.latitude})`,
      role: 'vecino',
      group_id: null,
      push_token: input.pushToken ?? null,
    });
    if (profileError) throw profileError;

    setProfile(await fetchProfile(data.user.id));
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.clear();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, signIn, signUp, signOut, refreshProfile }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
