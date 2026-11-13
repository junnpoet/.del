export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      care_assignments: {
        Row: {
          buddy_profile_id: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          vulnerable_profile_id: string
        }
        Insert: {
          buddy_profile_id: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vulnerable_profile_id: string
        }
        Update: {
          buddy_profile_id?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          vulnerable_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_assignments_buddy_profile_id_fkey"
            columns: ["buddy_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_assignments_vulnerable_profile_id_fkey"
            columns: ["vulnerable_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          provider_id: string
          service_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          provider_id: string
          service_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          provider_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_review_request: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_review_request?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_review_request?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_events: {
        Row: {
          activated_at: string | null
          activated_by: string
          description: string | null
          event_type: string
          group_id: string
          id: string
          status: string
        }
        Insert: {
          activated_at?: string | null
          activated_by: string
          description?: string | null
          event_type: string
          group_id: string
          id?: string
          status?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string
          description?: string | null
          event_type?: string
          group_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_events_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_join_requests: {
        Row: {
          address: string | null
          created_at: string | null
          full_name: string | null
          group_id: string
          id: string
          is_emergency: boolean | null
          is_from_whatsapp: boolean | null
          status: string | null
          user_id: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          full_name?: string | null
          group_id: string
          id?: string
          is_emergency?: boolean | null
          is_from_whatsapp?: boolean | null
          status?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          full_name?: string | null
          group_id?: string
          id?: string
          is_emergency?: boolean | null
          is_from_whatsapp?: boolean | null
          status?: string | null
          user_id?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_groups: {
        Row: {
          boundary: unknown
          created_at: string | null
          id: string
          leader_id: string | null
          name: string
          sector_name: string
        }
        Insert: {
          boundary?: unknown
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name: string
          sector_name: string
        }
        Update: {
          boundary?: unknown
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name?: string
          sector_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhood_groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_news: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sector_name: string
          source: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sector_name: string
          source?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sector_name?: string
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          group_id: string | null
          home_address: string
          home_location: unknown
          id: string
          is_vulnerable: boolean | null
          phone: string
          push_token: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          group_id?: string | null
          home_address: string
          home_location: unknown
          id: string
          is_vulnerable?: boolean | null
          phone: string
          push_token?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          group_id?: string | null
          home_address?: string
          home_location?: unknown
          id?: string
          is_vulnerable?: boolean | null
          phone?: string
          push_token?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          service_id: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          service_id: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reporter_id: string
          service_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          service_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          service_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reports_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          listing_type: string
          provider_id: string
          rating_average: number | null
          reviews_count: number | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          listing_type?: string
          provider_id: string
          rating_average?: number | null
          reviews_count?: number | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          listing_type?: string
          provider_id?: string
          rating_average?: number | null
          reviews_count?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solidary_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          is_accepted: boolean
          post_id: string
          whatsapp_sender_phone: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean
          post_id: string
          whatsapp_sender_phone?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean
          post_id?: string
          whatsapp_sender_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solidary_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solidary_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "solidary_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      solidary_posts: {
        Row: {
          accepted_helper_id: string | null
          author_id: string | null
          category: string
          created_at: string | null
          description: string
          group_id: string | null
          id: string
          is_ai_voice: boolean
          is_from_whatsapp: boolean | null
          post_type: string
          status: string | null
          target_volunteers: number | null
          urgency: string | null
          whatsapp_sender_name: string | null
          whatsapp_sender_phone: string | null
        }
        Insert: {
          accepted_helper_id?: string | null
          author_id?: string | null
          category: string
          created_at?: string | null
          description: string
          group_id?: string | null
          id?: string
          is_ai_voice?: boolean
          is_from_whatsapp?: boolean | null
          post_type: string
          status?: string | null
          target_volunteers?: number | null
          urgency?: string | null
          whatsapp_sender_name?: string | null
          whatsapp_sender_phone?: string | null
        }
        Update: {
          accepted_helper_id?: string | null
          author_id?: string | null
          category?: string
          created_at?: string | null
          description?: string
          group_id?: string | null
          id?: string
          is_ai_voice?: boolean
          is_from_whatsapp?: boolean | null
          post_type?: string
          status?: string | null
          target_volunteers?: number | null
          urgency?: string | null
          whatsapp_sender_name?: string | null
          whatsapp_sender_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solidary_posts_accepted_helper_id_fkey"
            columns: ["accepted_helper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solidary_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solidary_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_alerts: {
        Row: {
          audio_url: string | null
          created_at: string | null
          group_id: string | null
          id: string
          location: unknown
          sender_id: string
          status: string | null
          transcription: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          location: unknown
          sender_id: string
          status?: string | null
          transcription?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          location?: unknown
          sender_id?: string
          status?: string | null
          transcription?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "neighborhood_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_alerts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          role_note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          role_note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          role_note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "solidary_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_join_request: { Args: { request_id: string }; Returns: undefined }
      get_active_zone_emergency: {
        Args: {
          radius_meters?: number
          user_home_lat: number
          user_home_lng: number
        }
        Returns: {
          activated_at: string
          description: string | null
          event_type: string
          group_id: string
          group_name: string
          id: string
        }[]
      }
      get_nearby_groups: {
        Args: { radius_meters: number; user_lat: number; user_lng: number }
        Returns: {
          distance_meters: number
          group_id: string
          members_count: number
          name: string
          sector_name: string
        }[]
      }
      get_nearby_services: {
        Args: {
          radius_meters: number
          user_home_lat: number
          user_home_lng: number
        }
        Returns: {
          category: string
          description: string
          distance_meters: number
          listing_type: string
          provider_id: string
          provider_lat: number
          provider_lng: number
          provider_name: string
          rating_avg: number
          reviews_total: number
          service_id: string
          title: string
        }[]
      }
      get_search_zone_geojson: {
        Args: {
          radius_meters: number
          user_home_lat: number
          user_home_lng: number
        }
        Returns: Json | null
      }
      is_dirigente: { Args: { user_id: string }; Returns: boolean }
      is_padrino_of: {
        Args: { buddy_id: string; vulnerable_id: string }
        Returns: boolean
      }
      remove_group_member: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
