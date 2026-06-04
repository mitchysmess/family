export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "admin" | "member";
          avatar_url: string | null;
          profile_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          role?: "admin" | "member";
          avatar_url?: string | null;
          profile_color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "admin" | "member";
          avatar_url?: string | null;
          profile_color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          task_date: string;
          assigned_to: string | null;
          created_by: string | null;
          status: "open" | "done";
          priority: "normal" | "high";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          task_date: string;
          assigned_to?: string | null;
          created_by?: string | null;
          status?: "open" | "done";
          priority?: "normal" | "high";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          task_date?: string;
          assigned_to?: string | null;
          created_by?: string | null;
          status?: "open" | "done";
          priority?: "normal" | "high";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
