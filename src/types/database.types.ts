export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          skill_level: 'beginner' | 'intermediate' | 'advanced' | null
          interests: string[] | null
          bio: string | null
          level: number
          points: number
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null
          interests?: string[] | null
          bio?: string | null
          level?: number
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null
          interests?: string[] | null
          bio?: string | null
          level?: number
          points?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      resources: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          url: string
          type: 'article' | 'video' | 'course' | 'tool' | 'book' | 'other'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category_id: string | null
          author_id: string
          is_featured: boolean
          view_count: number
          upvotes: number
          downvotes: number
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          url: string
          type: 'article' | 'video' | 'course' | 'tool' | 'book' | 'other'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category_id?: string | null
          author_id: string
          is_featured?: boolean
          view_count?: number
          upvotes?: number
          downvotes?: number
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          url?: string
          type?: 'article' | 'video' | 'course' | 'tool' | 'book' | 'other'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category_id?: string | null
          author_id?: string
          is_featured?: boolean
          view_count?: number
          upvotes?: number
          downvotes?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "resources_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          slug: string
          parent_id: string | null
          icon: string | null
          color: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          slug: string
          parent_id?: string | null
          icon?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          slug?: string
          parent_id?: string | null
          icon?: string | null
          color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          author_id: string
          category: 'question' | 'discussion' | 'showcase' | 'tutorial'
          tags: string[]
          upvotes: number
          downvotes: number
          view_count: number
          is_published: boolean
          is_featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          author_id: string
          category: 'question' | 'discussion' | 'showcase' | 'tutorial'
          tags?: string[]
          upvotes?: number
          downvotes?: number
          view_count?: number
          is_published?: boolean
          is_featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          author_id?: string
          category?: 'question' | 'discussion' | 'showcase' | 'tutorial'
          tags?: string[]
          upvotes?: number
          downvotes?: number
          view_count?: number
          is_published?: boolean
          is_featured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          author_id: string
          post_id: string
          parent_id: string | null
          upvotes: number
          downvotes: number
          is_edited: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          author_id: string
          post_id: string
          parent_id?: string | null
          upvotes?: number
          downvotes?: number
          is_edited?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          author_id?: string
          post_id?: string
          parent_id?: string | null
          upvotes?: number
          downvotes?: number
          is_edited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          resource_id: string | null
          post_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          resource_id?: string | null
          post_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          resource_id?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          id: string
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          id?: string
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_paths: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration_hours: number
          author_id: string
          is_published: boolean
          is_featured: boolean
          tags: string[]
          prerequisites: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration_hours: number
          author_id: string
          is_published?: boolean
          is_featured?: boolean
          tags?: string[]
          prerequisites?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration_hours?: number
          author_id?: string
          is_published?: boolean
          is_featured?: boolean
          tags?: string[]
          prerequisites?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_path_steps: {
        Row: {
          id: string
          created_at: string
          path_id: string
          resource_id: string
          order_index: number
          title: string
          description: string | null
          is_required: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          path_id: string
          resource_id: string
          order_index: number
          title: string
          description?: string | null
          is_required?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          path_id?: string
          resource_id?: string
          order_index?: number
          title?: string
          description?: string | null
          is_required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_steps_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_steps_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          resource_id: string | null
          post_id: string | null
          comment_id: string | null
          vote_type: 'upvote' | 'downvote'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          resource_id?: string | null
          post_id?: string | null
          comment_id?: string | null
          vote_type: 'upvote' | 'downvote'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          resource_id?: string | null
          post_id?: string | null
          comment_id?: string | null
          vote_type?: 'upvote' | 'downvote'
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          type: 'public' | 'private' | 'direct'
          created_by: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          type: 'public' | 'private' | 'direct'
          created_by: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          type?: 'public' | 'private' | 'direct'
          created_by?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          room_id: string
          user_id: string
          content: string
          type: 'text' | 'image' | 'file'
          file_url: string | null
          is_edited: boolean
          edited_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          room_id: string
          user_id: string
          content: string
          type?: 'text' | 'image' | 'file'
          file_url?: string | null
          is_edited?: boolean
          edited_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          room_id?: string
          user_id?: string
          content?: string
          type?: 'text' | 'image' | 'file'
          file_url?: string | null
          is_edited?: boolean
          edited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          created_at: string
          room_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          room_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          room_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          last_read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
