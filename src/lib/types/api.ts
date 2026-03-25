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
  is_superuser: boolean;
  long_term_memory: string | null;
  global_instructions: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserUpdate {
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UpdateInstructionsRequest {
  instructions: string;
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
  credential_schema: CredentialSchemaField[] | null;
  workflow_config: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Group ────────────────────────────────────────────────────
export interface GroupCreate {
  name: string;
  description?: string | null;
}

export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ── AppInstance Access (ABAC) ──────────────────────────────
export type AccessorType = "USER" | "GROUP";
export type InstancePermission = "CREATE" | "READ" | "UPDATE" | "DELETE";

export interface AppInstanceAccessEntry {
  accessor_type: AccessorType;
  accessor_id: string;
  permission: InstancePermission;
}

export interface AppInstanceAccessGrant {
  accessor_type: AccessorType;
  accessor_id: string;
  permission: InstancePermission;
}

// ── App Instance ────────────────────────────────────────────
export interface AppInstanceCreate {
  name: string;
  app_id: string;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
}

export interface AppInstanceUpdate {
  name?: string | null;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
}

export interface AppInstanceResponse {
  id: string;
  name: string;
  app_id: string;
  instructions: string | null;
  has_credentials: boolean;
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

// ── Chat ─────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  app_instance_id?: string;
  conversation_id?: string;
}

export interface RagSource {
  source_id: string;
  filename: string;
  chunk_text: string;
  score: number;
}

export interface PlanMetadata {
  worker: string;
  type: string;
}

export interface ChatCompleteResponse {
  status: "complete";
  response: string;
  conversation_id: string;
  rag_sources: RagSource[];
}

export interface ChatPendingReviewResponse {
  status: "pending_review";
  plan: string;
  thread_id: string;
  conversation_id: string;
  plan_metadata: PlanMetadata;
}

export type ChatResponse = ChatCompleteResponse | ChatPendingReviewResponse;

export interface SupersetExecutionResult {
  status: "success" | "error";
  action: "GET_CHART_DATA" | "CREATE_CHART" | "CREATE_DASHBOARD";
  output: any;
}

export interface ResumeRequest {
  thread_id: string;
  approved: boolean;
  feedback?: string;
}
