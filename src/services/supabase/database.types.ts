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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_history: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          discount: number
          id: string
          location_id: string | null
          metadata: Json | null
          notification_sent: boolean
          reference_code: string | null
          tenant_id: string
          total_amount: number
          user_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          discount?: number
          id?: string
          location_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean
          reference_code?: string | null
          tenant_id: string
          total_amount?: number
          user_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          discount?: number
          id?: string
          location_id?: string | null
          metadata?: Json | null
          notification_sent?: boolean
          reference_code?: string | null
          tenant_id?: string
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_history_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_bin: string
          created_at: string | null
          id: string
          is_default: boolean | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_bin: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_bin?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          location_id: string | null
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          name: string
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          name?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_batches: {
        Row: {
          average_cost_price: number
          batch_code: string
          created_at: string | null
          cumulative_quantity: number
          expiry_date: string | null
          id: string
          location_id: string | null
          product_id: string
          quantity: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          average_cost_price?: number
          batch_code?: string
          created_at?: string | null
          cumulative_quantity?: number
          expiry_date?: string | null
          id?: string
          location_id?: string | null
          product_id: string
          quantity?: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          average_cost_price?: number
          batch_code?: string
          created_at?: string | null
          cumulative_quantity?: number
          expiry_date?: string | null
          id?: string
          location_id?: string | null
          product_id?: string
          quantity?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_monthly_snapshots: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          location_id: string | null
          snapshot_month: string
          tenant_id: string
          total_export_quantity: number
          total_export_value: number
          total_import_quantity: number
          total_import_value: number
          total_inventory_value: number
          total_quantity: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          snapshot_month: string
          tenant_id: string
          total_export_quantity?: number
          total_export_value?: number
          total_import_quantity?: number
          total_import_value?: number
          total_inventory_value?: number
          total_quantity?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          snapshot_month?: string
          tenant_id?: string
          total_export_quantity?: number
          total_export_value?: number
          total_import_quantity?: number
          total_import_value?: number
          total_inventory_value?: number
          total_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_monthly_snapshots_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_monthly_snapshots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_monthly_snapshots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["location_status"]
          tenant_id: string
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["location_status"]
          tenant_id: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["location_status"]
          tenant_id?: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          enabled: boolean
          expo_push_token: string | null
          id: string
          profile_id: string
          purchase_order_cancelled: boolean
          purchase_order_ordered: boolean
          purchase_order_stored: boolean
          sale_order_cancelled: boolean
          sale_order_completed: boolean
          stock_adjustment_created: boolean
          supplier_payment_created: boolean
          supplier_payment_deleted: boolean
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          expo_push_token?: string | null
          id?: string
          profile_id: string
          purchase_order_cancelled?: boolean
          purchase_order_ordered?: boolean
          purchase_order_stored?: boolean
          sale_order_cancelled?: boolean
          sale_order_completed?: boolean
          stock_adjustment_created?: boolean
          supplier_payment_created?: boolean
          supplier_payment_deleted?: boolean
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          expo_push_token?: string | null
          id?: string
          profile_id?: string
          purchase_order_cancelled?: boolean
          purchase_order_ordered?: boolean
          purchase_order_stored?: boolean
          sale_order_cancelled?: boolean
          sale_order_completed?: boolean
          stock_adjustment_created?: boolean
          supplier_payment_created?: boolean
          supplier_payment_deleted?: boolean
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          allocated_amount: number
          created_at: string | null
          id: string
          purchase_order_id: string
          supplier_payment_id: string
          tenant_id: string
        }
        Insert: {
          allocated_amount?: number
          created_at?: string | null
          id?: string
          purchase_order_id: string
          supplier_payment_id: string
          tenant_id: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string | null
          id?: string
          purchase_order_id?: string
          supplier_payment_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_supplier_payment_id_fkey"
            columns: ["supplier_payment_id"]
            isOneToOne: false
            referencedRelation: "supplier_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_master_units: {
        Row: {
          conversion_factor: number
          id: string
          is_base_unit: boolean
          product_master_id: string
          unit_name: string
        }
        Insert: {
          conversion_factor: number
          id?: string
          is_base_unit?: boolean
          product_master_id: string
          unit_name: string
        }
        Update: {
          conversion_factor?: number
          id?: string
          is_base_unit?: boolean
          product_master_id?: string
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_master_units_product_master_id_fkey"
            columns: ["product_master_id"]
            isOneToOne: false
            referencedRelation: "product_masters"
            referencedColumns: ["id"]
          },
        ]
      }
      product_masters: {
        Row: {
          active_ingredient: string | null
          description: string | null
          id: string
          jan_code: string | null
          made_company_name: string | null
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          regis_number: string | null
          sale_company_name: string | null
          source: string | null
        }
        Insert: {
          active_ingredient?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          product_name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          regis_number?: string | null
          sale_company_name?: string | null
          source?: string | null
        }
        Update: {
          active_ingredient?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          regis_number?: string | null
          sale_company_name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      product_units: {
        Row: {
          conversion_factor: number
          cost_price: number | null
          created_at: string | null
          id: string
          is_base_unit: boolean
          product_id: string
          sell_price: number | null
          tenant_id: string
          unit_name: string
        }
        Insert: {
          conversion_factor: number
          cost_price?: number | null
          created_at?: string | null
          id?: string
          is_base_unit?: boolean
          product_id: string
          sell_price?: number | null
          tenant_id: string
          unit_name: string
        }
        Update: {
          conversion_factor?: number
          cost_price?: number | null
          created_at?: string | null
          id?: string
          is_base_unit?: boolean
          product_id?: string
          sell_price?: number | null
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
          {
            foreignKeyName: "product_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active_ingredient: string | null
          avg_daily_sales_30d: number
          avg_daily_sales_60d: number
          avg_daily_sales_7d: number
          avg_daily_sales_90d: number
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          jan_code: string | null
          made_company_name: string | null
          min_stock: number | null
          product_master_id: string | null
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          regis_number: string | null
          sale_company_name: string | null
          status: Database["public"]["Enums"]["product_status"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active_ingredient?: string | null
          avg_daily_sales_30d?: number
          avg_daily_sales_60d?: number
          avg_daily_sales_7d?: number
          avg_daily_sales_90d?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          min_stock?: number | null
          product_master_id?: string | null
          product_name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          regis_number?: string | null
          sale_company_name?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active_ingredient?: string | null
          avg_daily_sales_30d?: number
          avg_daily_sales_60d?: number
          avg_daily_sales_7d?: number
          avg_daily_sales_90d?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          min_stock?: number | null
          product_master_id?: string | null
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          regis_number?: string | null
          sale_company_name?: string | null
          status?: Database["public"]["Enums"]["product_status"]
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
          {
            foreignKeyName: "products_product_master_id_fkey"
            columns: ["product_master_id"]
            isOneToOne: false
            referencedRelation: "product_masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          location_id: string | null
          login_id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          login_id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          login_id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          batch_code: string | null
          created_at: string | null
          discount: number | null
          expiry_date: string | null
          id: number
          product_id: string
          product_unit_id: string | null
          purchase_order_id: string
          quantity: number
          tenant_id: string
          unit_price: number
        }
        Insert: {
          batch_code?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: never
          product_id: string
          product_unit_id?: string | null
          purchase_order_id: string
          quantity?: number
          tenant_id: string
          unit_price?: number
        }
        Update: {
          batch_code?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: never
          product_id?: string
          product_unit_id?: string | null
          purchase_order_id?: string
          quantity?: number
          tenant_id?: string
          unit_price?: number
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
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          discount: number
          id: string
          issued_at: string | null
          location_id: string | null
          notes: string | null
          paid_amount: number
          payment_status: Database["public"]["Enums"]["purchase_order_payment_status"]
          purchase_order_code: string
          purchase_period_id: number | null
          status: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string | null
          tenant_id: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number
          id?: string
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["purchase_order_payment_status"]
          purchase_order_code: string
          purchase_period_id?: number | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string | null
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number
          id?: string
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["purchase_order_payment_status"]
          purchase_order_code?: string
          purchase_period_id?: number | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_purchase_period_id_fkey"
            columns: ["purchase_period_id"]
            isOneToOne: false
            referencedRelation: "purchase_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_periods: {
        Row: {
          created_at: string | null
          from_date: string
          id: number
          name: string | null
          number: number
          tenant_id: string
          to_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_date: string
          id?: never
          name?: string | null
          number: number
          tenant_id: string
          to_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_date?: string
          id?: never
          name?: string | null
          number?: number
          tenant_id?: string
          to_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_order_items: {
        Row: {
          batch_id: string
          created_at: string | null
          discount: number
          id: number
          product_id: string
          product_unit_id: string | null
          quantity: number
          sale_order_id: string
          tenant_id: string
          unit_price: number
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          discount?: number
          id?: never
          product_id: string
          product_unit_id?: string | null
          quantity?: number
          sale_order_id: string
          tenant_id: string
          unit_price?: number
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          discount?: number
          id?: never
          product_id?: string
          product_unit_id?: string | null
          quantity?: number
          sale_order_id?: string
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_order_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_product_unit_id_fkey"
            columns: ["product_unit_id"]
            isOneToOne: false
            referencedRelation: "product_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_sale_order_id_fkey"
            columns: ["sale_order_id"]
            isOneToOne: false
            referencedRelation: "sale_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_orders: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_paid_amount: number
          discount: number
          id: string
          is_offline: boolean
          issued_at: string | null
          location_id: string | null
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          sale_completed_time: number | null
          sale_order_code: string
          status: Database["public"]["Enums"]["sale_order_status"]
          tenant_id: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_paid_amount?: number
          discount?: number
          id?: string
          is_offline?: boolean
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_completed_time?: number | null
          sale_order_code: string
          status?: Database["public"]["Enums"]["sale_order_status"]
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_paid_amount?: number
          discount?: number
          id?: string
          is_offline?: boolean
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_completed_time?: number | null
          sale_order_code?: string
          status?: Database["public"]["Enums"]["sale_order_status"]
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          batch_code: string | null
          cost_price: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          location_id: string | null
          product_id: string
          quantity: number
          reason: string | null
          reason_code: Database["public"]["Enums"]["reason_code"]
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          batch_code?: string | null
          cost_price?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reason_code?: Database["public"]["Enums"]["reason_code"]
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          batch_code?: string | null
          cost_price?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reason_code?: Database["public"]["Enums"]["reason_code"]
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_bin: string
          created_at: string | null
          id: string
          is_default: boolean | null
          supplier_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_bin: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          supplier_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_bin?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          supplier_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_bank_accounts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_bank_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          note: string | null
          payment_date: string | null
          purchase_order_id: string | null
          purchase_period_id: number | null
          reference_code: string | null
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          note?: string | null
          payment_date?: string | null
          purchase_order_id?: string | null
          purchase_period_id?: number | null
          reference_code?: string | null
          supplier_id: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          note?: string | null
          payment_date?: string | null
          purchase_order_id?: string | null
          purchase_period_id?: number | null
          reference_code?: string | null
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_purchase_period_id_fkey"
            columns: ["purchase_period_id"]
            isOneToOne: false
            referencedRelation: "purchase_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          representative: string | null
          supplier_code: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          representative?: string | null
          supplier_code?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          representative?: string | null
          supplier_code?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          license_expiration: string | null
          location_license: number
          name: string
          phone: string | null
          product_license: number
          representative: string | null
          staff_license: number
          status: Database["public"]["Enums"]["tenant_status"]
          tenant_code: string
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          license_expiration?: string | null
          location_license?: number
          name: string
          phone?: string | null
          product_license?: number
          representative?: string | null
          staff_license?: number
          status?: Database["public"]["Enums"]["tenant_status"]
          tenant_code: string
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          license_expiration?: string | null
          location_license?: number
          name?: string
          phone?: string | null
          product_license?: number
          representative?: string | null
          staff_license?: number
          status?: Database["public"]["Enums"]["tenant_status"]
          tenant_code?: string
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      capture_inventory_monthly_snapshot: { Args: never; Returns: undefined }
      create_sale_order: {
        Args: {
          p_customer_id?: string
          p_customer_paid_amount?: number
          p_discount?: number
          p_is_offline?: boolean
          p_issued_at?: string
          p_items?: Json
          p_location_id?: string
          p_notes?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_sale_order_code?: string
          p_status?: Database["public"]["Enums"]["sale_order_status"]
          p_total_amount?: number
        }
        Returns: string
      }
      get_advance_sale_statistics: {
        Args: {
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
        }
        Returns: {
          current_avg_sale_speed: number
          current_period_end: string
          current_period_start: string
          current_profit_margin: number
          current_return_rate: number
          current_returning_customers: number
          previous_avg_sale_speed: number
          previous_period_end: string
          previous_period_start: string
          previous_profit_margin: number
          previous_return_rate: number
          previous_returning_customers: number
        }[]
      }
      get_categories_by_inventories: {
        Args: { p_location_id?: string }
        Returns: {
          category_id: string
          category_name: string
          total_inventory_value: number
          total_quantity: number
        }[]
      }
      get_dead_value_inventory: {
        Args: { p_location_id?: string; p_type?: number }
        Returns: {
          average_cost_price: number
          last_sold_at: string
          product_id: string
          product_name: string
          product_unit_id: string
          product_unit_name: string
          total_inventory_value: number
          total_quantity: number
        }[]
      }
      get_inventory_batches_list: {
        Args: {
          p_expiry_status?: string
          p_location_id?: string
          p_page_index?: number
          p_page_size?: number
          p_search?: string
          p_sort_by?: string
          p_sort_order?: string
          p_stock_status?: string
        }
        Returns: {
          average_cost_price: number
          batch_code: string
          created_at: string
          cumulative_quantity: number
          expiry_date: string
          id: string
          location_id: string
          location_name: string
          product_id: string
          product_name: string
          product_status: Database["public"]["Enums"]["product_status"]
          product_units: Json
          quantity: number
          tenant_id: string
          total: number
          updated_at: string
        }[]
      }
      get_inventory_products_list: {
        Args: {
          p_expiry_status?: string
          p_location_id?: string
          p_page_index?: number
          p_page_size?: number
          p_search?: string
          p_sort_by?: string
          p_sort_order?: string
          p_stock_status?: string
        }
        Returns: {
          average_cost_price: number
          batch_numbers: number
          created_at: string
          cumulative_quantity: number
          id: string
          location_id: string
          location_name: string
          nearest_expiry_date: string
          product_name: string
          product_status: Database["public"]["Enums"]["product_status"]
          product_units: Json
          quantity: number
          tenant_id: string
          total: number
          updated_at: string
        }[]
      }
      get_inventory_statistics_v2: {
        Args: { p_location_id?: string }
        Returns: {
          total_batches: number
          total_products: number
          total_quantity: number
          total_value: number
        }[]
      }
      get_inventory_value_by_month: {
        Args: {
          p_category_id?: string
          p_from_date?: string
          p_location_id?: string
          p_to_date?: string
        }
        Returns: {
          snapshot_month: string
          total_export_quantity: number
          total_export_value: number
          total_import_quantity: number
          total_import_value: number
          total_inventory_value: number
          total_quantity: number
        }[]
      }
      get_low_stock_inventory: {
        Args: { p_location_id?: string; p_type?: number }
        Returns: {
          average_cost_price: number
          avg_daily_sales: number
          estimated_days_of_stock: number
          product_id: string
          product_name: string
          product_unit_id: string
          product_unit_name: string
          total_inventory_value: number
          total_quantity: number
        }[]
      }
      get_low_stock_products_v2: {
        Args: { p_location_id?: string }
        Returns: {
          id: string
          min_stock: number
          product_name: string
          stock: number
          unit_name: string
        }[]
      }
      get_potential_loss_inventory: {
        Args: { p_location_id?: string; p_type?: number }
        Returns: {
          average_cost_price: number
          avg_daily_sales: number
          batch_code: string
          batch_id: string
          days_until_expiry: number
          expiry_date: string
          potential_loss_quantity: number
          potential_loss_value: number
          product_id: string
          product_name: string
          product_unit_id: string
          product_unit_name: string
          quantity: number
          sellable_quantity: number
        }[]
      }
      get_purchases_statistics_v2: {
        Args: {
          p_location_id?: string
          p_purchase_period_id?: number
          p_supplier_id?: string
        }
        Returns: {
          total_debt: number
          total_order_amount: number
          total_orders: number
          total_paid_amount: number
        }[]
      }
      get_sales_statistics_v2: {
        Args: {
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
        }
        Returns: {
          current_completed_orders: number
          current_period_end: string
          current_period_start: string
          current_total_loss: number
          current_total_profit: number
          current_total_revenue: number
          previous_completed_orders: number
          previous_period_end: string
          previous_period_start: string
          previous_total_loss: number
          previous_total_profit: number
          previous_total_revenue: number
        }[]
      }
      get_sales_time_series: {
        Args: {
          p_group_by?: string
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
          p_type?: string
        }
        Returns: {
          order_count: number
          profit: number
          quantity: number
          revenue: number
          time_key: number
        }[]
      }
      get_tenant_overview_v2: {
        Args: { p_location_id?: string }
        Returns: {
          total_customers: number
          total_products_active: number
          total_products_inactive: number
          total_staff: number
          total_suppliers_active: number
          total_suppliers_inactive: number
        }[]
      }
      get_top_categories: {
        Args: {
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
          p_type?: string
        }
        Returns: {
          id: string
          name: string
          profit: number
          quantity_sold: number
          revenue: number
        }[]
      }
      get_top_customers: {
        Args: {
          p_limit?: number
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
          p_type?: string
        }
        Returns: {
          id: string
          name: string
          phone: string
          profit: number
          quantity_sold: number
          revenue: number
        }[]
      }
      get_top_products: {
        Args: {
          p_limit?: number
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
          p_type?: string
        }
        Returns: {
          id: string
          name: string
          profit: number
          quantity: number
          revenue: number
          unit_name: string
        }[]
      }
      get_top_purchased_products: {
        Args: {
          p_limit?: number
          p_location_id?: string
          p_purchase_period_id?: number
          p_type: string
        }
        Returns: {
          active_ingredient: string
          product_id: string
          product_name: string
          stat_value: number
          unit_name: string
        }[]
      }
      get_top_slow_sell_products: {
        Args: {
          p_limit?: number
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
          p_timezone?: string
          p_type?: string
        }
        Returns: {
          current_stock: number
          id: string
          name: string
          profit: number
          quantity_sold: number
          revenue: number
          unit_name: string
        }[]
      }
      get_top_suppliers: {
        Args: {
          p_limit?: number
          p_location_id?: string
          p_purchase_period_id?: number
          p_type: string
        }
        Returns: {
          address: string
          created_at: string
          description: string
          is_active: boolean
          name: string
          phone: string
          representative: string
          stat_value: number
          supplier_code: string
          supplier_id: string
          updated_at: string
        }[]
      }
      suggest_quick_purchase_orders: {
        Args: {
          p_location_id?: string
          p_reorder_days?: number
          p_target_days?: number
          p_type?: number
        }
        Returns: {
          avg_daily_sales: number
          base_unit_id: string
          base_unit_name: string
          current_stock: number
          estimated_cost: number
          estimated_days_remaining: number
          last_cost_price: number
          last_order_unit_id: string
          last_order_unit_name: string
          min_stock: number
          product_id: string
          product_name: string
          suggested_quantity: number
          supplier_id: string
          supplier_name: string
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_product_avg_daily_sales: { Args: never; Returns: undefined }
    }
    Enums: {
      activity_type:
        | "PURCHASE_ORDER_ORDERED"
        | "PURCHASE_ORDER_STORED"
        | "PURCHASE_ORDER_CANCELLED"
        | "SALE_ORDER_COMPLETED"
        | "SALE_ORDER_CANCELLED"
        | "STOCK_ADJUSTMENT_CREATED"
        | "SUPPLIER_PAYMENT_CREATED"
        | "SUPPLIER_PAYMENT_DELETED"
      location_status: "1_ACTIVE" | "2_INACTIVE"
      location_type: "1_WAREHOUSE" | "2_STORE" | "9_OTHER"
      payment_method: "1_CASH" | "2_BANK_TRANSFER"
      product_status: "1_DRAFT" | "2_ACTIVE" | "3_INACTIVE" | "4_ARCHIVED"
      product_type: "1_OTC" | "2_PRESCRIPTION_REQUIRED" | "9_OTHERS"
      purchase_order_payment_status: "1_UNPAID" | "2_PARTIALLY_PAID" | "3_PAID"
      purchase_order_status:
        | "1_DRAFT"
        | "2_ORDERED"
        | "3_CHECKING"
        | "4_STORED"
        | "9_CANCELLED"
      reason_code:
        | "1_FIRST_STOCK"
        | "2_DAMAGED"
        | "3_EXPIRED"
        | "4_LOST"
        | "9_OTHER"
      sale_order_status:
        | "1_DRAFT"
        | "2_COMPLETE"
        | "7_DAV_ERROR"
        | "8_INSUFFICIENT_STOCK"
        | "9_CANCELLED"
      staff_role: "OWNER" | "MANAGER" | "STAFF"
      tenant_status: "1_ACTIVE" | "2_LICENSE_EXPIRED" | "3_CANCELLED"
      tenant_type: "1_NORMAL" | "2_PRO" | "3_ENTERPRISE"
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
      activity_type: [
        "PURCHASE_ORDER_ORDERED",
        "PURCHASE_ORDER_STORED",
        "PURCHASE_ORDER_CANCELLED",
        "SALE_ORDER_COMPLETED",
        "SALE_ORDER_CANCELLED",
        "STOCK_ADJUSTMENT_CREATED",
        "SUPPLIER_PAYMENT_CREATED",
        "SUPPLIER_PAYMENT_DELETED",
      ],
      location_status: ["1_ACTIVE", "2_INACTIVE"],
      location_type: ["1_WAREHOUSE", "2_STORE", "9_OTHER"],
      payment_method: ["1_CASH", "2_BANK_TRANSFER"],
      product_status: ["1_DRAFT", "2_ACTIVE", "3_INACTIVE", "4_ARCHIVED"],
      product_type: ["1_OTC", "2_PRESCRIPTION_REQUIRED", "9_OTHERS"],
      purchase_order_payment_status: ["1_UNPAID", "2_PARTIALLY_PAID", "3_PAID"],
      purchase_order_status: [
        "1_DRAFT",
        "2_ORDERED",
        "3_CHECKING",
        "4_STORED",
        "9_CANCELLED",
      ],
      reason_code: [
        "1_FIRST_STOCK",
        "2_DAMAGED",
        "3_EXPIRED",
        "4_LOST",
        "9_OTHER",
      ],
      sale_order_status: [
        "1_DRAFT",
        "2_COMPLETE",
        "7_DAV_ERROR",
        "8_INSUFFICIENT_STOCK",
        "9_CANCELLED",
      ],
      staff_role: ["OWNER", "MANAGER", "STAFF"],
      tenant_status: ["1_ACTIVE", "2_LICENSE_EXPIRED", "3_CANCELLED"],
      tenant_type: ["1_NORMAL", "2_PRO", "3_ENTERPRISE"],
    },
  },
} as const
