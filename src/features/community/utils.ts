import { Alert, Linking, Platform } from 'react-native';
import { tr } from '../../i18n';

/**
 * Alert.alert no hace nada en react-native-web, así que en web se usan los
 * diálogos del navegador. Así los flujos de la Capa Privada funcionan en ambos.
 */
export function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(
  title: string,
  message: string,
  confirmLabel = tr('common.confirm'),
  destructive = false
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: tr('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

/** Normaliza un celular peruano a formato internacional para wa.me (51XXXXXXXXX). */
export function toWhatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return `51${digits}`;
  if (digits.length >= 10) return digits;
  return null;
}

export async function openWhatsapp(phone: string | null | undefined, text: string) {
  const number = toWhatsappNumber(phone);
  if (!number) {
    showMessage(tr('post.noWhatsappTitle'), tr('post.noWhatsapp'));
    return;
  }
  await Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
}

export async function callPhone(phone: string | null | undefined) {
  if (!phone) {
    showMessage(tr('post.noPhoneTitle'), tr('post.noPhone'));
    return;
  }
  await Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
}

/** "Hace 5 min", "Ayer"… en el idioma activo. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return tr('time.justNow');
  if (minutes < 60) return tr('time.minutes', { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return tr('time.hours', { n: hours });
  const days = Math.round(hours / 24);
  return days === 1 ? tr('time.yesterday') : tr('time.days', { n: days });
}

/**
 * Nombre de canal Realtime único por montaje: si dos pantallas del stack usan el
 * mismo hook a la vez, supabase-js reutilizaría el canal ya suscrito y fallaría
 * al añadirle callbacks.
 */
export function channelName(base: string): string {
  return `${base}-${Math.random().toString(36).slice(2, 10)}`;
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return tr('common.unexpectedError');
}
