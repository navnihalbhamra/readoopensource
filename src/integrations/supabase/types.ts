export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          id: string;
          match_source: string | null;
          matched_at: string | null;
          open_library_key: string | null;
          published_year: number | null;
          subjects: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          match_source?: string | null;
          matched_at?: string | null;
          open_library_key?: string | null;
          published_year?: number | null;
          subjects?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          match_source?: string | null;
          matched_at?: string | null;
          open_library_key?: string | null;
          published_year?: number | null;
          subjects?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          author: string | null;
          content: string;
          created_at: string;
          id: string;
          progress: number;
          source: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          author?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          progress?: number;
          source?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          author?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          progress?: number;
          source?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      highlights: {
        Row: {
          author: string | null;
          book_id: string | null;
          book_title: string;
          created_at: string;
          document_id: string | null;
          highlighted_at: string;
          id: string;
          location: string | null;
          note: string | null;
          source: string;
          text: string;
          user_id: string;
        };
        Insert: {
          author?: string | null;
          book_id?: string | null;
          book_title: string;
          created_at?: string;
          document_id?: string | null;
          highlighted_at?: string;
          id?: string;
          location?: string | null;
          note?: string | null;
          source?: string;
          text: string;
          user_id: string;
        };
        Update: {
          author?: string | null;
          book_id?: string | null;
          book_title?: string;
          created_at?: string;
          document_id?: string | null;
          highlighted_at?: string;
          id?: string;
          location?: string | null;
          note?: string | null;
          source?: string;
          text?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "highlights_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "highlights_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          api_key: string;
          created_at: string;
          digest_email: string | null;
          digest_enabled: boolean;
          digest_frequency: string;
          display_name: string | null;
          email: string | null;
          id: string;
          last_digest_at: string | null;
          linked_emails: string[];
          onboarding_completed: boolean;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          plan: string;
          plan_renews_at: string | null;
          plan_source: string | null;
          reading_goals: string[];
          updated_at: string;
        };
        Insert: {
          api_key?: string;
          created_at?: string;
          digest_email?: string | null;
          digest_enabled?: boolean;
          digest_frequency?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          last_digest_at?: string | null;
          linked_emails?: string[];
          onboarding_completed?: boolean;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          plan?: string;
          plan_renews_at?: string | null;
          plan_source?: string | null;
          reading_goals?: string[];
          updated_at?: string;
        };
        Update: {
          api_key?: string;
          created_at?: string;
          digest_email?: string | null;
          digest_enabled?: boolean;
          digest_frequency?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          last_digest_at?: string | null;
          linked_emails?: string[];
          onboarding_completed?: boolean;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          plan?: string;
          plan_renews_at?: string | null;
          plan_source?: string | null;
          reading_goals?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
