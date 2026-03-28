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

// ── Profile ─────────────────────────────────────────────────
export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_title: string | null;
  company: string | null;
  location: string | null;
  phone_number: string | null;
}

export interface UserProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  job_title?: string | null;
  company?: string | null;
  location?: string | null;
  phone_number?: string | null;
}

// ── User ────────────────────────────────────────────────────
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  profile?: UserProfile | null;
  is_active: boolean;
  is_superuser: boolean;
  long_term_memory: string | null;
  global_instructions: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreate {
  username: string;
  email: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  profile?: UserProfileUpdate;
}

export interface AdminUserUpdate {
  is_active?: boolean;
  is_superuser?: boolean;
  profile?: UserProfileUpdate;
}

export interface UpdateInstructionsRequest {
  instructions: string;
}

export interface UpdateMemoryRequest {
  long_term_memory: string;
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

export interface AppInstanceAccessCreate {
  instance_id: string;
  can_read: boolean;
  can_write: boolean;
  can_create: boolean;
  can_delete: boolean;
}

export interface AppInstanceAccessUpdate {
  can_read: boolean;
  can_write: boolean;
  can_create: boolean;
  can_delete: boolean;
}

export interface AppInstanceAccess extends AppInstanceAccessCreate {
  id: string;
  group_id: string;
  created_at: string;
  updated_at: string;
}

export interface AppInstanceAccessResponse extends AppInstanceAccess { }

// ── Group ────────────────────────────────────────────────────
export interface GroupCreate {
  name: string;
  description?: string | null;
  app_instance_accesses?: AppInstanceAccessCreate[];
}

export interface GroupUpdate {
  name?: string;
  description?: string | null;
  app_instance_accesses?: AppInstanceAccessCreate[];
}

export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  app_instance_accesses: AppInstanceAccess[];
  created_at: string;
}

// ── App Instance ────────────────────────────────────────────
export interface AppInstanceCreate {
  name: string;
  app_id: string;
  description?: string | null;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
}

export interface AppInstanceUpdate {
  name?: string | null;
  description?: string | null;
  instructions?: string | null;
  credentials?: Record<string, unknown> | null;
}

export interface AppInstanceResponse {
  id: string;
  name: string;
  app_id: string;
  description: string | null;
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
  mode?: "ask" | "plan" | "agent";
  model?: string;
  stream?: boolean;
}

export interface RagSource {
  document_id: string | null;
  chunk_text: string;
  score: number;
  tier: "app" | "instance" | "user";
  metadata?: Record<string, any>;
}

export interface PlanMetadata {
  worker: string;
  type: string;
}

export interface PlanStep {
  step_number: number;
  description: string;
  action_type: string;
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
  plan_id: string;
  steps: PlanStep[];
  confidence: number;
  thread_id: string;
  conversation_id: string;
  plan_metadata?: PlanMetadata;
}

export interface ClarificationInput {
  id: string;
  question: string;
  type: "select" | "text";
  options: string[];
}

export interface ChatPendingClarificationResponse {
  status: "pending_clarification";
  thread_id: string;
  required_inputs: ClarificationInput[];
  conversation_id: string;
}

export type ChatResponse = ChatCompleteResponse | ChatPendingReviewResponse | ChatPendingClarificationResponse;

export interface SupersetExecutionResult {
  status: "success" | "error";
  action: "GET_CHART_DATA" | "CREATE_CHART" | "CREATE_DASHBOARD";
  output: unknown;
}

export interface ResumeRequest {
  thread_id: string;
  approved: boolean;
  feedback?: string;
  stream?: boolean;
}

export interface ClarifyRequest {
  thread_id: string;
  answers: Record<string, {
    selected_index: number | null;
    custom_answer: string | null;
  }>;
  stream?: boolean;
}

// ── Models ───────────────────────────────────────────────────
export interface ModelEntry {
  id: string;
  name: string;
}

export interface ProviderModels {
  provider: string;
  models: ModelEntry[];
}
// ── UI Message Model ─────────────────────────────────────────
export type UIMessage =
  | { id: string; type: "user"; content: string }
  | {
    id: string;
    type: "assistant";
    content: string;
    thought?: string;
    isThinking?: boolean;
    ragSources?: RagSource[];
    executionResult?: SupersetExecutionResult;
  }
  | {
    id: string;
    type: "pending_review";
    plan: string;
    planId: string;
    steps: PlanStep[];
    confidence: number;
    threadId: string;
    planMetadata?: PlanMetadata;
    resolved: boolean;
  }
  | {
    id: string;
    type: "pending_clarification";
    threadId: string;
    requiredInputs: ClarificationInput[];
    resolved: boolean;
  };

// ── Conversations ───────────────────────────────────────────
export interface ConversationResponse {
  id: string;
  user_id: string;
  app_instance_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends ConversationResponse {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AdminConversation extends ConversationResponse {
  message_count: number;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
