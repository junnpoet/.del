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
  /** Junta vecinal a la que pertenece (null = aún no admitido en la Capa Privada). */
  group_id: string | null;
  lat: number | null;
  lng: number | null;
}

export interface SignUpInput {
  password: string;
  fullName: string;
  phone: string;
  homeAddress: string;
  latitude: number;
  longitude: number;
  pushToken?: string | null;
}

export interface RequestOtpResult {
  success: boolean;
  whatsappSent?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  signIn: (phoneOrEmail: string, password: string) => Promise<void>;
  signInWithOtp: (phone: string, token: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<RequestOtpResult>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function normalizeNationalPhone(phone: string): string {
  const digits = phone.trim().replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('51') ? digits.slice(2) : digits;
}

export function phoneToAuthEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  return `${normalizeNationalPhone(trimmed)}@sumayni.pe`;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, home_address, role, is_vulnerable, group_id, home_location')
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
    group_id: data.group_id,
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

  const requestOtp = useCallback(async (phone: string): Promise<RequestOtpResult> => {
    const nationalDigits = normalizeNationalPhone(phone);

    const { data, error } = await supabase.functions.invoke('send-whatsapp-otp', {
      body: { phone: nationalDigits },
    });
    if (!error && data?.success) {
      return {
        success: true,
        whatsappSent: data.whatsappSent,
      };
    }

    if (data?.error) {
      throw new Error(String(data.error));
    }
    if (error) {
      throw new Error(error.message || 'No se pudo generar el código OTP.');
    }

    throw new Error(
      'No se pudo generar el código. Verifica que el celular esté registrado.'
    );
  }, []);

  const signInWithOtp = useCallback(async (phone: string, token: string) => {
    const email = phoneToAuthEmail(phone);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: 'magiclink',
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const nationalDigits = normalizeNationalPhone(input.phone);
    if (nationalDigits.length !== 9) {
      throw new Error('Ingresa un número celular peruano de 9 dígitos.');
    }
    const email = phoneToAuthEmail(nationalDigits);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
    });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('CONFIRM_EMAIL');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: input.fullName.trim(),
      phone: nationalDigits,
      home_address: input.homeAddress.trim(),
      home_location: `SRID=4326;POINT(${input.longitude} ${input.latitude})`,
      role: 'vecino',
      group_id: null,
      push_token: input.pushToken ?? null,
    });
    if (profileError) {
      // Evita dejar una sesión autenticada sin fila en `profiles` si falla la inserción.
      await supabase.auth.signOut().catch(() => {});
      throw profileError;
    }

    setProfile(await fetchProfile(data.user.id));
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.clear();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signInWithOtp,
      requestOtp,
      signUp,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      signIn,
      signInWithOtp,
      requestOtp,
      signUp,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
