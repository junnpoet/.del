import type { ListingType, PostType } from '../types';

export type PublishFlowType = 'SERVICIO' | 'AYUDA' | 'SOLIDARIO';

export const LISTING_TYPES: readonly ListingType[] = [
  'SERVICIO',
  'PRODUCTO',
  'AUXILIO',
] as const;

export const SERVICE_CATEGORIES = [
  'Gasfitería',
  'Electricidad',
  'Cerrajería',
  'Carpintería',
  'Paseador de mascotas',
  'Costura',
  'Cuidado',
  'Clases',
] as const;

export const DIRECTORY_FILTER_CATEGORIES = [
  'Todos',
  'Gasfitería',
  'Electricidad',
  'Cerrajería',
  'Carpintería',
  'Paseador de mascotas',
  'Clases',
] as const;

export const QUICK_PUBLISH_SERVICE_CATEGORIES = [
  'Gasfitería',
  'Electricidad',
  'Costura',
  'Carpintería',
  'Cuidado',
  'Clases',
] as const;

export const HELP_CATEGORIES = [
  'Medicinas',
  'Herramientas',
  'Movilidad',
  'Alimentos',
  'Compañía',
] as const;

export const SOLIDARY_CATEGORIES = [
  'Préstamo',
  'Donación',
  'Trueque',
  'Voluntariado',
] as const;

export const CATEGORIES_BY_PUBLISH_TYPE: Record<PublishFlowType, readonly string[]> = {
  SERVICIO: QUICK_PUBLISH_SERVICE_CATEGORIES,
  AYUDA: HELP_CATEGORIES,
  SOLIDARIO: SOLIDARY_CATEGORIES,
};

/**
 * Mapea una categoría solidaria al `post_type` aceptado por `solidary_posts`.
 */
export const SOLIDARY_POST_TYPE_BY_CATEGORY: Record<string, PostType> = {
  Préstamo: 'PRESTAMO',
  Donación: 'DONACION',
  Trueque: 'TRUEQUE',
  Voluntariado: 'VOLUNTARIADO',
};
