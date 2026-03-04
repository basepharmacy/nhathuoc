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
          location_id: string
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
          location_id: string
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
          location_id?: string
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
        }
        Relationships: []
      }
      product_units: {
        Row: {
          conversion_factor: number
          cost_price: number
          created_at: string | null
          id: string
          is_base_unit: boolean
          product_id: string
          sell_price: number
          tenant_id: string
          unit_name: string
        }
        Insert: {
          conversion_factor: number
          cost_price: number
          created_at?: string | null
          id?: string
          is_base_unit?: boolean
          product_id: string
          sell_price: number
          tenant_id: string
          unit_name: string
        }
        Update: {
          conversion_factor?: number
          cost_price?: number
          created_at?: string | null
          id?: string
          is_base_unit?: boolean
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
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          jan_code: string | null
          made_company_name: string | null
          min_stock: number | null
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
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          min_stock?: number | null
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
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          jan_code?: string | null
          made_company_name?: string | null
          min_stock?: number | null
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
          name: string
          phone: string | null
          tenant_id: string
          updated_at: string | null
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
          batch_code: string
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
          batch_code?: string
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
          batch_code?: string
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
          status: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string
          tenant_id: string
          total_amount: number
          updated_at: string | null
          user_id: string
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
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          user_id: string
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
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
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
          issued_at: string | null
          location_id: string | null
          notes: string | null
          sale_order_code: string
          status: Database["public"]["Enums"]["sale_order_status"]
          tenant_id: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_paid_amount?: number
          discount?: number
          id?: string
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          sale_order_code: string
          status?: Database["public"]["Enums"]["sale_order_status"]
          tenant_id: string
          total_amount?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_paid_amount?: number
          discount?: number
          id?: string
          issued_at?: string | null
          location_id?: string | null
          notes?: string | null
          sale_order_code?: string
          status?: Database["public"]["Enums"]["sale_order_status"]
          tenant_id?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
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
          batch_code: string
          cost_price: number
          created_at: string | null
          expiry_date: string | null
          id: string
          location_id: string
          product_id: string
          quantity: number
          reason: string | null
          tenant_id: string
        }
        Insert: {
          batch_code: string
          cost_price?: number
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id: string
          product_id: string
          quantity: number
          reason?: string | null
          tenant_id: string
        }
        Update: {
          batch_code?: string
          cost_price?: number
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location_id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          tenant_id?: string
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
          is_payment_on_purchase_order: boolean
          note: string | null
          payment_date: string | null
          purchase_order_id: string | null
          reference_code: string | null
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          is_payment_on_purchase_order?: boolean
          note?: string | null
          payment_date?: string | null
          purchase_order_id?: string | null
          reference_code?: string | null
          supplier_id: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          is_payment_on_purchase_order?: boolean
          note?: string | null
          payment_date?: string | null
          purchase_order_id?: string | null
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
          tenant_code: string | null
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
          tenant_code?: string | null
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
          tenant_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_inventory_statistics: {
        Args: { p_location_id?: string }
        Returns: {
          total_products: number
          total_quantity: number
          total_value: number
        }[]
      }
      get_low_stock_products: {
        Args: { p_location_id?: string }
        Returns: Json
      }
      get_sales_statistics: {
        Args: {
          p_location_id?: string
          p_period?: string
          p_reference_date?: string
        }
        Returns: {
          current_completed_orders: number
          current_new_customers: number
          current_period_end: string
          current_period_start: string
          current_total_profit: number
          current_total_revenue: number
          previous_completed_orders: number
          previous_new_customers: number
          previous_period_end: string
          previous_period_start: string
          previous_total_profit: number
          previous_total_revenue: number
          top_5_products_by_profit: Json
          top_5_products_by_quantity: Json
          top_5_products_by_revenue: Json
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      location_status: "1_ACTIVE" | "2_INACTIVE" | "3_CLOSED"
      location_type: "1_WAREHOUSE" | "2_STORE" | "9_OTHER"
      product_status: "1_DRAFT" | "2_ACTIVE" | "3_INACTIVE" | "4_ARCHIVED"
      product_type: "1_OTC" | "2_PRESCRIPTION_REQUIRED"
      purchase_order_payment_status: "1_UNPAID" | "2_PARTIALLY_PAID" | "3_PAID"
      purchase_order_status:
        | "1_DRAFT"
        | "2_ORDERED"
        | "3_CHECKING"
        | "4_STORED"
        | "9_CANCELLED"
      sale_order_status: "1_DRAFT" | "2_COMPLETE" | "9_CANCELLED"
      tenant_status: "1_ACTIVE" | "2_LICENSE_EXPIRED" | "3_CANCELLED"
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
      location_status: ["1_ACTIVE", "2_INACTIVE", "3_CLOSED"],
      location_type: ["1_WAREHOUSE", "2_STORE", "9_OTHER"],
      product_status: ["1_DRAFT", "2_ACTIVE", "3_INACTIVE", "4_ARCHIVED"],
      product_type: ["1_OTC", "2_PRESCRIPTION_REQUIRED"],
      purchase_order_payment_status: ["1_UNPAID", "2_PARTIALLY_PAID", "3_PAID"],
      purchase_order_status: [
        "1_DRAFT",
        "2_ORDERED",
        "3_CHECKING",
        "4_STORED",
        "9_CANCELLED",
      ],
      sale_order_status: ["1_DRAFT", "2_COMPLETE", "9_CANCELLED"],
      tenant_status: ["1_ACTIVE", "2_LICENSE_EXPIRED", "3_CANCELLED"],
    },
  },
} as const
