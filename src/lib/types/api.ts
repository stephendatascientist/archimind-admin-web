// ============================================================
// Archimind API — TypeScript types derived from OpenAPI schema
// ============================================================

// ── Auth ────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── User ────────────────────────────────────────────────────
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  long_term_memory: string | null;
  global_instructions: string | null;
  created_at: string;
  updated_at: string;
}

// ── Credential Schema ────────────────────────────────────────
export type CredentialFieldType = "text" | "password" | "select" | "number";

export interface CredentialSchemaField {
  key: string;
  label: string;
  type: CredentialFieldType;
  options?: string[];
  default?: string;
  required?: boolean;
}

// ── App ─────────────────────────────────────────────────────
export interface AppCreate {
  name: string;
  slug: string;
  description?: string | null;
  instructions?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AppUpdate {
  name?: string | null;
  description?: string | null;
  instructions?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AppResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Pipeline Config ─────────────────────────────────────────
export interface PipelineConfig {
  llm_provider: string;
  llm_model: string;
  temperature: number;
  retrieval_top_k: number;
  rag_tiers: string[];
  context_window: number;
  enable_citations: boolean;
  ranking_strategy: string;
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  llm_provider: "openai",
  llm_model: "gpt-4o",
  temperature: 0.7,
  retrieval_top_k: 10,
  rag_tiers: [],
  context_window: 8192,
  enable_citations: true,
  ranking_strategy: "reciprocal_rank_fusion",
};

// ── App Instance ────────────────────────────────────────────
export interface AppInstanceCreate {
  name: string;
  app_id: string;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
  pipeline_config?: PipelineConfig | null;
}

export interface AppInstanceUpdate {
  name?: string | null;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
  pipeline_config?: PipelineConfig | null;
}

export interface AppInstanceResponse {
  id: string;
  name: string;
  app_id: string;
  instructions: string | null;
  has_credentials: boolean;
  pipeline_config: PipelineConfig | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Document ────────────────────────────────────────────────
export interface DocumentResponse {
  id: string;
  filename: string;
  source_type: string;
  source_id: string;
  vector_status: string;
  chunk_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ── Pagination ──────────────────────────────────────────────
export interface ListParams {
  skip?: number;
  limit?: number;
}

export interface AppInstanceListParams extends ListParams {
  app_id?: string;
}

export interface DocumentListParams extends ListParams {
  source_type?: string;
  source_id?: string;
}

// ── Audit Log ────────────────────────────────────────────────
export interface AuditLogResponse {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogListParams {
  skip?: number;
  limit?: number;
}
