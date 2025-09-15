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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_integrations: {
        Row: {
          api_key: string
          created_at: string
          error_message: string | null
          id: string
          integration_type: string
          last_validated_at: string | null
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type: string
          last_validated_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_type?: string
          last_validated_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      approval_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "approval_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_links: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_active: boolean
          post_id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean
          post_id: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          post_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_links_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "approval_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_media: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          mime_type: string | null
          order_index: number | null
          post_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          mime_type?: string | null
          order_index?: number | null
          post_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          mime_type?: string | null
          order_index?: number | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "approval_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content_caption: string | null
          created_at: string
          deadline: string | null
          id: string
          platform: string
          priority: string
          rejection_reason: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content_caption?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          platform: string
          priority?: string
          rejection_reason?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content_caption?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          platform?: string
          priority?: string
          rejection_reason?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comercial_representatives: {
        Row: {
          cidades_atendidas: string[]
          created_at: string
          escritorio: string
          estado: string | null
          id: string
          link_whatsapp: string | null
          nome_completo: string
          status: string
          telefone: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cidades_atendidas?: string[]
          created_at?: string
          escritorio: string
          estado?: string | null
          id?: string
          link_whatsapp?: string | null
          nome_completo: string
          status?: string
          telefone: string
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cidades_atendidas?: string[]
          created_at?: string
          escritorio?: string
          estado?: string | null
          id?: string
          link_whatsapp?: string | null
          nome_completo?: string
          status?: string
          telefone?: string
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commemorative_dates: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_mandatory: boolean
          post_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_mandatory?: boolean
          post_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_mandatory?: boolean
          post_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          created_at: string
          followers_count: number
          following_count: number
          id: string
          instagram_username: string | null
          posts_count: number
          profile_image_url: string | null
          updated_at: string
          user_id: string
          verified: boolean
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          instagram_username?: string | null
          posts_count?: number
          profile_image_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          instagram_username?: string | null
          posts_count?: number
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          notes: string | null
          status: string
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          transaction_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          status?: string
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          id: string
          module_name: string
          role: string
          updated_at: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          id?: string
          module_name: string
          role: string
          updated_at?: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          id?: string
          module_name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      processing_units: {
        Row: {
          cnpj: string
          created_at: string | null
          email_financeiro: string
          email_rh: string
          endereco: string
          id: string
          razao_social: string
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          email_financeiro: string
          email_rh: string
          endereco: string
          id?: string
          razao_social: string
          tipo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          email_financeiro?: string
          email_rh?: string
          endereco?: string
          id?: string
          razao_social?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sector_responsibles: {
        Row: {
          created_at: string | null
          department: string
          id: string
          link_whatsapp: string | null
          name: string
          nome: string
          processing_unit_id: string | null
          setor_departamento: string
          unidade: string
          updated_at: string | null
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          link_whatsapp?: string | null
          name: string
          nome: string
          processing_unit_id?: string | null
          setor_departamento: string
          unidade: string
          updated_at?: string | null
          user_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          link_whatsapp?: string | null
          name?: string
          nome?: string
          processing_unit_id?: string | null
          setor_departamento?: string
          unidade?: string
          updated_at?: string | null
          user_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sector_responsibles_processing_unit_id_fkey"
            columns: ["processing_unit_id"]
            isOneToOne: false
            referencedRelation: "processing_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      financial_summary: {
        Row: {
          category: string | null
          month: string | null
          status: string | null
          total_amount: number | null
          transaction_count: number | null
          type: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_approval_links: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_approval_token: {
        Args: Record<PropertyKey, never>
        Returns: string
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  DefaultSchemaCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends DefaultSchemaCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = DefaultSchemaCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : DefaultSchemaCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][DefaultSchemaCompositeTypeNameOrOptions]
    : never