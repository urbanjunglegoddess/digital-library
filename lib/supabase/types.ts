/**
 * Hand-authored Database types for the schema in supabase/migrations/
 * (0001_init, 0002_search, 0003_assets_templates).
 *
 * In later phases this file can be regenerated from the live database with:
 *   supabase gen types typescript --project-id cmluzusujsbxscljszbn > lib/supabase/types.ts
 * For Phase 0 these types document the schema and give the Supabase clients
 * their generic shape so queries are typed end to end.
 */

export type ComponentStatus =
  | "idea"
  | "drafting"
  | "built"
  | "audited"
  | "reusable";

export type ReferenceSource = "mdn" | "so" | "github" | "apg" | "other";

export type AssetType =
  | "component"
  | "snippet"
  | "template"
  | "token"
  | "image";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          sort: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          sort?: number;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          sort?: number;
        };
        Relationships: [];
      };
      components: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category_id: string | null;
          status: ComponentStatus;
          summary: string | null;
          doc_md: string | null;
          clickup_page_id: string | null;
          meta: Record<string, unknown>;
        } & Timestamps;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category_id?: string | null;
          status?: ComponentStatus;
          summary?: string | null;
          doc_md?: string | null;
          clickup_page_id?: string | null;
          meta?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          category_id?: string | null;
          status?: ComponentStatus;
          summary?: string | null;
          doc_md?: string | null;
          clickup_page_id?: string | null;
          meta?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "components_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      visual_styles: {
        Row: {
          id: string;
          key: string;
          name: string;
          sort: number;
          is_core: boolean;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          sort?: number;
          is_core?: boolean;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          sort?: number;
          is_core?: boolean;
        };
        Relationships: [];
      };
      component_styles: {
        Row: { component_id: string; style_id: string };
        Insert: { component_id: string; style_id: string };
        Update: { component_id?: string; style_id?: string };
        Relationships: [
          {
            foreignKeyName: "component_styles_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "component_styles_style_id_fkey";
            columns: ["style_id"];
            referencedRelation: "visual_styles";
            referencedColumns: ["id"];
          },
        ];
      };
      code_snippets: {
        Row: {
          id: string;
          component_id: string;
          language: string;
          framework: string | null;
          code: string;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          component_id: string;
          language: string;
          framework?: string | null;
          code: string;
          is_primary?: boolean;
        };
        Update: {
          id?: string;
          component_id?: string;
          language?: string;
          framework?: string | null;
          code?: string;
          is_primary?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "code_snippets_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: { id: string; slug: string; name: string };
        Insert: { id?: string; slug: string; name: string };
        Update: { id?: string; slug?: string; name?: string };
        Relationships: [];
      };
      component_tags: {
        Row: { component_id: string; tag_id: string };
        Insert: { component_id: string; tag_id: string };
        Update: { component_id?: string; tag_id?: string };
        Relationships: [
          {
            foreignKeyName: "component_tags_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "component_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      references: {
        Row: {
          id: string;
          title: string;
          url: string;
          source: ReferenceSource;
          component_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          source?: ReferenceSource;
          component_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          source?: ReferenceSource;
          component_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "references_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          type: AssetType;
          title: string;
          storage_path: string | null;
          meta: Record<string, unknown> | null;
          owner_id: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: AssetType;
          title: string;
          storage_path?: string | null;
          meta?: Record<string, unknown> | null;
          owner_id?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: AssetType;
          title?: string;
          storage_path?: string | null;
          meta?: Record<string, unknown> | null;
          owner_id?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          config: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          config?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: string;
          preferences: Record<string, unknown>;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: string;
          preferences?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: string;
          preferences?: Record<string, unknown>;
        };
        Relationships: [];
      };
      collections: {
        Row: { id: string; owner_id: string; name: string };
        Insert: { id?: string; owner_id: string; name: string };
        Update: { id?: string; owner_id?: string; name?: string };
        Relationships: [];
      };
      collection_items: {
        Row: { collection_id: string; component_id: string };
        Insert: { collection_id: string; component_id: string };
        Update: { collection_id?: string; component_id?: string };
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey";
            columns: ["collection_id"];
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_items_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      search_components: {
        Args: {
          q?: string | null;
          category_slugs?: string[] | null;
          tag_slugs?: string[] | null;
          languages?: string[] | null;
          style_keys?: string[] | null;
          status_filter?: string[] | null;
          lim?: number;
          off?: number;
        };
        Returns: {
          id: string;
          slug: string;
          name: string;
          summary: string | null;
          status: ComponentStatus;
          category_slug: string | null;
          category_name: string | null;
          tags: string[];
          languages: string[];
          style_count: number;
          rank: number;
          total: number;
        }[];
      };
      component_tag_counts: {
        Args: Record<never, never>;
        Returns: { slug: string; name: string; count: number }[];
      };
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: {
      component_status: ComponentStatus;
      reference_source: ReferenceSource;
      asset_type: AssetType;
    };
    CompositeTypes: Record<never, never>;
  };
};
