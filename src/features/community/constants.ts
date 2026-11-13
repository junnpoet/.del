import type { CareStatus, PostStatus, PostType } from '../../types';
import type { TranslationKey } from '../../i18n';

export type FeedFilter = 'TODOS' | 'PRESTAMO' | 'DONACION' | 'ACCION_COMUNAL';

/** Chips consolidados del Muro Solidario (SPEC-04 §2.2). */
export const FEED_FILTERS: FeedFilter[] = ['TODOS', 'PRESTAMO', 'DONACION', 'ACCION_COMUNAL'];

export const FEED_FILTER_META: Record<FeedFilter, { color: string; tint: string }> = {
  TODOS: { color: '#374151', tint: '#F3F4F6' },
  PRESTAMO: { color: '#0369A1', tint: '#E0F2FE' },
  DONACION: { color: '#B45309', tint: '#FEF3C7' },
  ACCION_COMUNAL: { color: '#1E5E45', tint: '#E8F3EE' },
};

export function feedFilterKey(filter: FeedFilter): TranslationKey {
  if (filter === 'ACCION_COMUNAL') return 'feed.filter.ACCION_COMUNAL';
  return `filter.${filter}`;
}

export function matchesFeedFilter(postType: PostType, filter: FeedFilter): boolean {
  if (filter === 'TODOS') return true;
  if (filter === 'ACCION_COMUNAL') {
    return postType === 'TRUEQUE' || postType === 'VOLUNTARIADO' || postType === 'AYUDA';
  }
  return postType === filter;
}

export const postTypeKey = (type: PostType): TranslationKey => `postType.${type}`;
export const postStatusKey = (status: PostStatus): TranslationKey => `post.status.${status}`;
export const careStatusKey = (status: CareStatus): TranslationKey => `careStatus.${status}`;

export const POST_STATUS_META: Record<PostStatus, { color: string; tint: string }> = {
  OPEN: { color: '#1E5E45', tint: '#E8F3EE' },
  IN_PROGRESS: { color: '#B45309', tint: '#FEF3C7' },
  RESOLVED: { color: '#4B5563', tint: '#E5E7EB' },
};

export const CARE_STATUS_META: Record<CareStatus, { color: string; tint: string }> = {
  AL_DIA: { color: '#16A34A', tint: '#DCFCE7' },
  SEGUIMIENTO_REQUERIDO: { color: '#D97706', tint: '#FEF3C7' },
  ALERTA_ACTIVA: { color: '#DC2626', tint: '#FEE2E2' },
};

export const CARE_VOLUNTEER_CATEGORIES = ['Cuidado', 'Compañía', 'Cuidado Vecinal'] as const;

export function isCareVolunteerPost(postType: PostType, category: string): boolean {
  return (
    postType === 'AYUDA' &&
    (CARE_VOLUNTEER_CATEGORIES as readonly string[]).includes(category)
  );
}

/** Un vecino vulnerable está "al día" si fue contactado en los últimos 7 días. */
export const CARE_FRESH_DAYS = 7;

/** Centro por defecto del Sector 4 (San Martín de Porres) para el mapa. */
export const DEFAULT_REGION = {
  latitude: -12.0125,
  longitude: -77.0815,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};
