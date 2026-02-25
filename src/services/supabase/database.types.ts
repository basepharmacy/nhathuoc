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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          lot_number: string | null
          product_id: string
          quantity_remaining: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          product_id: string
          quantity_remaining: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          product_id?: string
          quantity_remaining?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_unit_id: string | null
          quantity: number
          quantity_base: number
          tenant_id: string
          unit_name: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_unit_id?: string | null
          quantity: number
          quantity_base: number
          tenant_id: string
          unit_name: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_unit_id?: string | null
          quantity?: number
          quantity_base?: number
          tenant_id?: string
          unit_name?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_unit_id_fkey"
            columns: ["product_unit_id"]
            isOneToOne: false
            referencedRelation: "product_units"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          order_type: string
          original_order_id: string | null
          status: string
          tenant_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_type?: string
          original_order_id?: string | null
          status?: string
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_type?: string
          original_order_id?: string | null
          status?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_original_order_id_fkey"
            columns: ["original_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_units: {
        Row: {
          conversion_factor: number
          created_at: string | null
          id: string
          is_active: boolean | null
          product_id: string
          sell_price: number
          tenant_id: string
          unit_name: string
        }
        Insert: {
          conversion_factor: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          sell_price: number
          tenant_id: string
          unit_name: string
        }
        Update: {
          conversion_factor?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          sell_price?: number
          tenant_id?: string
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_unit: string
          category_id: string | null
          cost_price: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          jan_code: string | null
          min_stock: number | null
          product_name: string
          sell_price: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          base_unit: string
          category_id?: string | null
          cost_price: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jan_code?: string | null
          min_stock?: number | null
          product_name: string
          sell_price: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          base_unit?: string
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jan_code?: string | null
          min_stock?: number | null
          product_name?: string
          sell_price?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          expected_quantity: number
          id: string
          product_id: string
          product_unit_id: string | null
          purchase_order_id: string
          received_quantity: number
          tenant_id: string
          unit_name: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          expected_quantity: number
          id?: string
          product_id: string
          product_unit_id?: string | null
          purchase_order_id: string
          received_quantity?: number
          tenant_id: string
          unit_name: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          expected_quantity?: number
          id?: string
          product_id?: string
          product_unit_id?: string | null
          purchase_order_id?: string
          received_quantity?: number
          tenant_id?: string
          unit_name?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_unit_id_fkey"
            columns: ["product_unit_id"]
            isOneToOne: false
            referencedRelation: "product_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          status: string
          supplier_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          supplier_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          supplier_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          product_id: string
          quantity_delta: number
          reason: string
          tenant_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          product_id: string
          quantity_delta: number
          reason: string
          tenant_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          quantity_delta?: number
          reason?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          avatar: string | null
          created_at: string | null
          id: string
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["store_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          created_at?: string | null
          id?: string
          name: string
          tenant_id: string
          type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          phone: string | null
          representative: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          phone?: string | null
          representative?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          phone?: string | null
          representative?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rpc_inventory_receive_batch: {
        Args: {
          p_expiry_date?: string
          p_lot_number?: string
          p_product_id: string
          p_purchase_order_item_id?: string
          p_quantity_base: number
        }
        Returns: string
      }
      rpc_pos_complete_sale: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      search_customers:
        | {
            Args: { p_limit?: number; p_query: string }
            Returns: {
              address: string | null
              created_at: string | null
              id: string
              name: string
              phone: string | null
              tenant_id: string
              updated_at: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "customers"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { p_limit?: number; p_query: string; p_tenant_id: string }
            Returns: {
              address: string | null
              created_at: string | null
              id: string
              name: string
              phone: string | null
              tenant_id: string
              updated_at: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "customers"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      search_products:
        | {
            Args: { p_limit?: number; p_query: string }
            Returns: {
              base_unit: string
              category_id: string | null
              cost_price: number
              created_at: string | null
              description: string | null
              id: string
              is_active: boolean | null
              jan_code: string | null
              min_stock: number | null
              product_name: string
              sell_price: number
              tenant_id: string
              updated_at: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "products"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { p_limit?: number; p_query: string; p_tenant_id: string }
            Returns: {
              base_unit: string
              category_id: string | null
              cost_price: number
              created_at: string | null
              description: string | null
              id: string
              is_active: boolean | null
              jan_code: string | null
              min_stock: number | null
              product_name: string
              sell_price: number
              tenant_id: string
              updated_at: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "products"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      store_type: "MAIN" | "BRANCH"
      user_role: "OWNER" | "STAFF"
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
    Enums: {
      store_type: ["MAIN", "BRANCH"],
      user_role: ["OWNER", "STAFF"],
    },
  },
} as const
