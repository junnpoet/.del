import AsyncStorage from '@react-native-async-storage/async-storage';

// Misma clave que ya usaban el perfil y el selector de personas demo.
export const ACCESSIBLE_MODE_KEY = 'accessible_mode';
const ACCESSIBLE_MODE_USER_PREFIX = 'accessible_mode_user_';

export const DEFAULT_ACCESSIBLE_USER_IDS = new Set([
  '1d6d874a-0cb0-4c64-a3c8-0e2ac0bed653', // Mauro Lázaro
]);

let activeUserId: string | null = null;

export function setActiveAccessibleModeUser(userId: string | null): void {
  activeUserId = userId;
}

export function shouldDefaultToAccessibleMode(
  profile: {
    id?: string | null;
    phone?: string | null;
    is_vulnerable?: boolean | null;
  } | null | undefined,
  user?: { id?: string | null; email?: string | null } | null
): boolean {
  if (profile?.is_vulnerable === true) return true;
  const userId = profile?.id ?? user?.id ?? null;
  if (userId && DEFAULT_ACCESSIBLE_USER_IDS.has(userId)) return true;
  if (profile?.phone === '907530293') return true;
  if (user?.email?.toLowerCase() === '907530293@sumayni.pe') return true;
  return false;
}

export async function syncAccessibleModeForUser(
  userId: string,
  defaultEnabled: boolean
): Promise<boolean> {
  setActiveAccessibleModeUser(userId);
  try {
    const userOverride = await AsyncStorage.getItem(
      `${ACCESSIBLE_MODE_USER_PREFIX}${userId}`
    );
    const resolved =
      userOverride !== null ? userOverride === 'true' : defaultEnabled;
    await AsyncStorage.setItem(
      ACCESSIBLE_MODE_KEY,
      resolved ? 'true' : 'false'
    );
    return resolved;
  } catch {
    return defaultEnabled;
  }
}

export async function isAccessibleModeEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ACCESSIBLE_MODE_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setAccessibleModeEnabled(enabled: boolean): Promise<void> {
  const serialized = enabled ? 'true' : 'false';
  await AsyncStorage.setItem(ACCESSIBLE_MODE_KEY, serialized);
  if (activeUserId) {
    await AsyncStorage.setItem(
      `${ACCESSIBLE_MODE_USER_PREFIX}${activeUserId}`,
      serialized
    );
  }
}
