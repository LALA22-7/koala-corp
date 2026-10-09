// ============================================================
// Koala Corp. — Core Data Models
// ============================================================

// ── Enums ──────────────────────────────────────────────────

export type WorkflowStatus = 'active' | 'paused' | 'draft' | 'archived';
export type RunStatus = 'queued' | 'running' | 'needs_review' | 'completed' | 'failed' | 'paused';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested' | 'saved_for_later';
export type IntegrationStatus = 'connected' | 'not_connected' | 'needs_attention' | 'disabled';
export type WorkerStatus = 'active' | 'idle' | 'error' | 'disabled';
export type EventType =
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'data_retrieved'
  | 'validation_passed'
  | 'validation_failed'
  | 'summary_generated'
  | 'output_corrected'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_rejected'
  | 'revision_requested'
  | 'task_created'
  | 'integration_connected'
  | 'integration_disconnected'
  | 'retry_initiated'
  | 'step_completed'
  | 'error_occurred';

export type Permission =
  | 'read_data'
  | 'draft_outputs'
  | 'create_tasks'
  | 'update_fields'
  | 'send_external'
  | 'modify_campaigns';

// ── Core Entities ──────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  industry: string;
  color: string; // brand color for UI differentiation
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  description: string;
  status: WorkerStatus;
  permissions: Permission[];
  restrictedActions: string[];
  assignedWorkflows: string[]; // workflow IDs
  recentTaskCount: number;
  successCount: number;
  failureCount: number;
  lastActivity: string; // ISO date
  typicalOutputs: string[];
  limits: string[];
  configRevision: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: RunStatus | 'pending' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  output?: string;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  workerId: string; // primary responsible worker
  clientId?: string;
  template: string;
  dataSourceIds: string[]; // integration IDs
  steps: WorkflowStep[];
  approvalRequired: boolean;
  approvalRules: string[];
  schedule?: string; // e.g. "Daily at 9:00 AM"
  lastRun?: string; // ISO date
  nextScheduledRun?: string; // ISO date
  recentRunStatus?: RunStatus;
  createdAt: string;
  updatedAt: string;
  thresholds?: Record<string, number>;
}

export interface TaskRun {
  id: string;
  workflowId: string;
  clientId: string;
  workerId: string;
  name: string;
  status: RunStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  steps: WorkflowStep[];
  output?: string;
  error?: string;
  executionDuration?: number; // seconds
  isSimulated: boolean;
}

export interface Approval {
  id: string;
  taskRunId: string;
  workflowId: string;
  workerId: string;
  clientId: string;
  proposedAction: string;
  description: string;
  evidence: string;
  proposedContent?: string;
  reason: string; // why approval is required
  status: ApprovalStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
  revisionNote?: string;
}

export interface ActivityEvent {
  id: string;
  type: EventType;
  description: string;
  workflowId?: string;
  workerId?: string;
  clientId?: string;
  taskRunId?: string;
  timestamp: string;
  details?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: IntegrationStatus;
  description: string;
  dataCategories: string[];
  dependentWorkflows: string[]; // workflow IDs
  lastSync?: string; // ISO date
  connectedAt?: string;
  setupNotes?: string;
  attentionMessage?: string;
}

export interface WorkspaceSettings {
  name: string;
  organization: string;
  defaultApprovalMode: 'draft_only' | 'auto_approve' | 'always_approve';
  internalTasksRequireApproval: boolean;
  externalMessagesRequireApproval: boolean;
  campaignChangesProhibited: boolean;
  notificationsEnabled: boolean;
  emailDigest: 'off' | 'daily' | 'weekly';
}

// ── Template Types ─────────────────────────────────────────

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  defaultSteps: Omit<WorkflowStep, 'status' | 'startedAt' | 'completedAt' | 'output' | 'error'>[];
}
