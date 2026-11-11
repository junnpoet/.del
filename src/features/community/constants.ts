import type { CareStatus, PostType } from '../../types';
import type { TranslationKey } from '../../i18n';

export type FeedFilter = 'TODOS' | PostType;

/** Chips del Muro Solidario (SPEC-04 §2.1). El texto sale del diccionario: t(`filter.${value}`). */
export const FEED_FILTERS: FeedFilter[] = [
  'TODOS',
  'PRESTAMO',
  'DONACION',
  'TRUEQUE',
  'VOLUNTARIADO',
  'AYUDA',
];

export const postTypeKey = (type: PostType): TranslationKey => `postType.${type}`;
export const careStatusKey = (status: CareStatus): TranslationKey => `careStatus.${status}`;

export const CARE_STATUS_META: Record<CareStatus, { color: string; tint: string; emoji: string }> = {
  AL_DIA: { color: '#16A34A', tint: '#DCFCE7', emoji: '🟢' },
  SEGUIMIENTO_REQUERIDO: { color: '#D97706', tint: '#FEF3C7', emoji: '🟡' },
  ALERTA_ACTIVA: { color: '#DC2626', tint: '#FEE2E2', emoji: '🔴' },
};

/** Un vecino vulnerable está "al día" si fue contactado en los últimos 7 días. */
export const CARE_FRESH_DAYS = 7;

/** Centro por defecto del Sector 4 (San Martín de Porres) para el mapa. */
export const DEFAULT_REGION = {
  latitude: -12.0125,
  longitude: -77.0815,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};
