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
          assessment_data: Json | null
          assessment_date: string
          bed_id: string | null
          created_at: string
          created_by: string | null
          id: string
          patient_age: number
          patient_gender: string
          patient_id: string | null
          patient_name: string
          room_id: string | null
          shift: string | null
          total_score: number | null
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          assessment_date?: string
          bed_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          patient_age: number
          patient_gender: string
          patient_id?: string | null
          patient_name: string
          room_id?: string | null
          shift?: string | null
          total_score?: number | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          assessment_date?: string
          bed_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          patient_age?: number
          patient_gender?: string
          patient_id?: string | null
          patient_name?: string
          room_id?: string | null
          shift?: string | null
          total_score?: number | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assessments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_status: string | null
          bed_type: string | null
          created_at: string
          id: string
          is_occupied: boolean | null
          label: string
          room_id: string
          updated_at: string
        }
        Insert: {
          bed_number: string
          bed_status?: string | null
          bed_type?: string | null
          created_at?: string
          id?: string
          is_occupied?: boolean | null
          label: string
          room_id: string
          updated_at?: string
        }
        Update: {
          bed_number?: string
          bed_status?: string | null
          bed_type?: string | null
          created_at?: string
          id?: string
          is_occupied?: boolean | null
          label?: string
          room_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
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
      patients: {
        Row: {
          admission_date: string
          age: number
          bed_id: string | null
          created_at: string
          discharge_date: string | null
          gender: string
          id: string
          name: string
          patient_id: string
          room_id: string | null
          status: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          admission_date?: string
          age: number
          bed_id?: string | null
          created_at?: string
          discharge_date?: string | null
          gender: string
          id?: string
          name: string
          patient_id: string
          room_id?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          admission_date?: string
          age?: number
          bed_id?: string | null
          created_at?: string
          discharge_date?: string | null
          gender?: string
          id?: string
          name?: string
          patient_id?: string
          room_id?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
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
          unit_id: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
      rooms: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          room_number: string
          room_type: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name: string
          room_number: string
          room_type?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          room_number?: string
          room_type?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          floor_number: number | null
          hospital_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          hospital_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          floor_number?: number | null
          hospital_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
