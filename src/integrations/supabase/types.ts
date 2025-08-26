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
      answer: {
        Row: {
          Answer_Options: string | null
          Question_ID: string | null
          Value_Answer: number | null
        }
        Insert: {
          Answer_Options?: string | null
          Question_ID?: string | null
          Value_Answer?: number | null
        }
        Update: {
          Answer_Options?: string | null
          Question_ID?: string | null
          Value_Answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answer_Question_ID_fkey"
            columns: ["Question_ID"]
            isOneToOne: false
            referencedRelation: "Question"
            referencedColumns: ["Question_ID"]
          },
        ]
      }
      assessment_answers: {
        Row: {
          assessment_id: string
          category: string
          created_at: string
          id: string
          question_id: string
          question_title: string
          selected_label: string
          selected_score: number
          selected_value: string
        }
        Insert: {
          assessment_id: string
          category: string
          created_at?: string
          id?: string
          question_id: string
          question_title: string
          selected_label: string
          selected_score: number
          selected_value: string
        }
        Update: {
          assessment_id?: string
          category?: string
          created_at?: string
          id?: string
          question_id?: string
          question_title?: string
          selected_label?: string
          selected_score?: number
          selected_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_answers_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_date: string
          created_at: string
          id: string
          patient_age: number
          patient_gender: string
          patient_name: string
          total_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_date?: string
          created_at?: string
          id?: string
          patient_age: number
          patient_gender: string
          patient_name: string
          total_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_date?: string
          created_at?: string
          id?: string
          patient_age?: number
          patient_gender?: string
          patient_name?: string
          total_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assessments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Category: {
        Row: {
          Category_ID: string
          Category_Title: string | null
          PID: string | null
        }
        Insert: {
          Category_ID: string
          Category_Title?: string | null
          PID?: string | null
        }
        Update: {
          Category_ID?: string
          Category_Title?: string | null
          PID?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Category_PID_fkey"
            columns: ["PID"]
            isOneToOne: false
            referencedRelation: "Population"
            referencedColumns: ["PID"]
          },
        ]
      }
      Population: {
        Row: {
          PID: string
          Population: string | null
        }
        Insert: {
          PID: string
          Population?: string | null
        }
        Update: {
          PID?: string
          Population?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Question: {
        Row: {
          Category_ID: string | null
          PID: string | null
          Question_ID: string
          Question_Title: string | null
        }
        Insert: {
          Category_ID?: string | null
          PID?: string | null
          Question_ID: string
          Question_Title?: string | null
        }
        Update: {
          Category_ID?: string | null
          PID?: string | null
          Question_ID?: string
          Question_Title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Question_Category_ID_fkey"
            columns: ["Category_ID"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["Category_ID"]
          },
          {
            foreignKeyName: "Question_PID_fkey"
            columns: ["PID"]
            isOneToOne: false
            referencedRelation: "Population"
            referencedColumns: ["PID"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
