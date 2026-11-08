export * from './database';

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
