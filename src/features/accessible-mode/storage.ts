import AsyncStorage from '@react-native-async-storage/async-storage';

// Misma clave que ya usaban el perfil y el selector de personas demo.
export const ACCESSIBLE_MODE_KEY = 'accessible_mode';

export async function isAccessibleModeEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ACCESSIBLE_MODE_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setAccessibleModeEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ACCESSIBLE_MODE_KEY, enabled ? 'true' : 'false');
}
