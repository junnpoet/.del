export * from './database';

// Uniones de valores permitidos (CHECK de la SPEC-02). Se mantienen aquí porque
// database.ts se regenera con "supabase gen types" y tipa esas columnas como string.
export type UserRole = 'vecino' | 'dirigente' | 'padrino';
export type PostType = 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
export type UrgencyLevel = 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
export type PostStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CareStatus = 'AL_DIA' | 'SEGUIMIENTO_REQUERIDO' | 'ALERTA_ACTIVA';
export type EmergencyType = 'SISMO' | 'HUAICO' | 'INCENDIO' | 'CORTE_SERVICIOS' | 'INSEGURIDAD';
export type SosStatus = 'ACTIVE' | 'ATTENDED' | 'CANCELLED';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  homeAddress: string;
  homeLocation: GeoLocation;
  role: 'vecino' | 'dirigente' | 'padrino';
  isVulnerable: boolean;
  pushToken?: string | null;
  groupId?: string | null;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  providerName?: string;
  title: string;
  category: string;
  description: string;
  ratingAverage: number;
  reviewsCount: number;
  distanceMeters?: number;
  isFavorite?: boolean;
}

export interface SolidaryPostItem {
  id: string;
  authorId?: string | null;
  authorName?: string;
  postType: 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';
  category: string;
  description: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  isFromWhatsapp: boolean;
  createdAt: string;
}

export interface EmergencyState {
  isActive: boolean;
  eventType?: 'SISMO' | 'HUAICO' | 'INCENDIO' | 'CORTE_SERVICIOS' | 'INSEGURIDAD';
  description?: string;
  activatedAt?: string;
}
