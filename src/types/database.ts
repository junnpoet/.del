export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'vecino' | 'dirigente' | 'padrino';

export type PostType = 'PRESTAMO' | 'DONACION' | 'TRUEQUE' | 'VOLUNTARIADO' | 'AYUDA';

export type UrgencyLevel = 'BAJA' | 'MEDIA' | 'ALTA_CRITICA';

export type PostStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CareStatus = 'AL_DIA' | 'SEGUIMIENTO_REQUERIDO' | 'ALERTA_ACTIVA';

export type EmergencyType = 'SISMO' | 'HUAICO' | 'INCENDIO' | 'CORTE_SERVICIOS' | 'INSEGURIDAD';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          home_address: string;
          home_location: unknown; // PostGIS Point geography
          role: UserRole;
          is_vulnerable: boolean;
          push_token: string | null;
          group_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone: string;
          home_address: string;
          home_location: unknown;
          role?: UserRole;
          is_vulnerable?: boolean;
          push_token?: string | null;
          group_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          home_address?: string;
          home_location?: unknown;
          role?: UserRole;
          is_vulnerable?: boolean;
          push_token?: string | null;
          group_id?: string | null;
          created_at?: string;
        };
      };
      neighborhood_groups: {
        Row: {
          id: string;
          name: string;
          sector_name: string;
          leader_id: string | null;
          boundary: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sector_name: string;
          leader_id?: string | null;
          boundary?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sector_name?: string;
          leader_id?: string | null;
          boundary?: unknown | null;
          created_at?: string;
        };
      };
      group_join_requests: {
        Row: {
          id: string;
          group_id: string;
          user_id: string | null;
          whatsapp_phone: string | null;
          full_name: string | null;
          address: string | null;
          status: RequestStatus;
          is_emergency: boolean;
          is_from_whatsapp: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id?: string | null;
          whatsapp_phone?: string | null;
          full_name?: string | null;
          address?: string | null;
          status?: RequestStatus;
          is_emergency?: boolean;
          is_from_whatsapp?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string | null;
          whatsapp_phone?: string | null;
          full_name?: string | null;
          address?: string | null;
          status?: RequestStatus;
          is_emergency?: boolean;
          is_from_whatsapp?: boolean;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          category: string;
          description: string;
          rating_average: number;
          reviews_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          category: string;
          description: string;
          rating_average?: number;
          reviews_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          category?: string;
          description?: string;
          rating_average?: number;
          reviews_count?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          service_id: string;
          client_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          client_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          client_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      user_favorites: {
        Row: {
          user_id: string;
          service_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          service_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          service_id?: string;
          created_at?: string;
        };
      };
      service_reports: {
        Row: {
          id: string;
          reporter_id: string;
          service_id: string;
          reason: 'COBRO_ABUSIVO' | 'INCUMPLIMIENTO' | 'PERFIL_FALSO' | 'FALTA_RESPETO' | 'OTRO';
          details: string | null;
          status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          service_id: string;
          reason: 'COBRO_ABUSIVO' | 'INCUMPLIMIENTO' | 'PERFIL_FALSO' | 'FALTA_RESPETO' | 'OTRO';
          details?: string | null;
          status?: 'PENDING' | 'REVIEWED' | 'DISMISSED';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          service_id?: string;
          reason?: 'COBRO_ABUSIVO' | 'INCUMPLIMIENTO' | 'PERFIL_FALSO' | 'FALTA_RESPETO' | 'OTRO';
          details?: string | null;
          status?: 'PENDING' | 'REVIEWED' | 'DISMISSED';
          created_at?: string;
        };
      };
      neighborhood_news: {
        Row: {
          id: string;
          sector_name: string;
          title: string;
          content: string;
          source: 'MUNICIPAL' | 'SERVICIOS_PUBLICOS' | 'DIRIGENCIA';
          created_at: string;
        };
        Insert: {
          id?: string;
          sector_name: string;
          title: string;
          content: string;
          source?: 'MUNICIPAL' | 'SERVICIOS_PUBLICOS' | 'DIRIGENCIA';
          created_at?: string;
        };
        Update: {
          id?: string;
          sector_name?: string;
          title?: string;
          content?: string;
          source?: 'MUNICIPAL' | 'SERVICIOS_PUBLICOS' | 'DIRIGENCIA';
          created_at?: string;
        };
      };
      solidary_posts: {
        Row: {
          id: string;
          author_id: string | null;
          group_id: string | null;
          whatsapp_sender_phone: string | null;
          whatsapp_sender_name: string | null;
          post_type: PostType;
          category: string;
          description: string;
          urgency: UrgencyLevel;
          is_from_whatsapp: boolean;
          status: PostStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          group_id?: string | null;
          whatsapp_sender_phone?: string | null;
          whatsapp_sender_name?: string | null;
          post_type: PostType;
          category: string;
          description: string;
          urgency?: UrgencyLevel;
          is_from_whatsapp?: boolean;
          status?: PostStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          group_id?: string | null;
          whatsapp_sender_phone?: string | null;
          whatsapp_sender_name?: string | null;
          post_type?: PostType;
          category?: string;
          description?: string;
          urgency?: UrgencyLevel;
          is_from_whatsapp?: boolean;
          status?: PostStatus;
          created_at?: string;
        };
      };
      emergency_events: {
        Row: {
          id: string;
          group_id: string;
          event_type: EmergencyType;
          status: 'ACTIVE' | 'RESOLVED';
          activated_by: string;
          description: string | null;
          activated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          event_type: EmergencyType;
          status?: 'ACTIVE' | 'RESOLVED';
          activated_by: string;
          description?: string | null;
          activated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          event_type?: EmergencyType;
          status?: 'ACTIVE' | 'RESOLVED';
          activated_by?: string;
          description?: string | null;
          activated_at?: string;
        };
      };
      care_assignments: {
        Row: {
          id: string;
          vulnerable_profile_id: string;
          buddy_profile_id: string;
          status: CareStatus;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vulnerable_profile_id: string;
          buddy_profile_id: string;
          status?: CareStatus;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vulnerable_profile_id?: string;
          buddy_profile_id?: string;
          status?: CareStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      chat_conversations: {
        Row: {
          id: string;
          service_id: string;
          client_id: string;
          provider_id: string;
          last_message: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          client_id: string;
          provider_id: string;
          last_message?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          client_id?: string;
          provider_id?: string;
          last_message?: string | null;
          updated_at?: string;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          is_review_request: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          message: string;
          is_review_request?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          message?: string;
          is_review_request?: boolean;
          created_at?: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          location: unknown; // Point
          status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location: unknown;
          status?: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location?: unknown;
          status?: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
          created_at?: string;
        };
      };
    };
  };
}
