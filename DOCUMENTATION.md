# 🐨 Koala Corp. — Technical Documentation & Architecture Specification

> **Version**: 1.0 (Production Prototype)  
> **Status**: Verified & Production-Ready  
> **Framework**: Next.js 16 (App Router + Turbopack) / React 19 / TypeScript 5 / Tailwind CSS v4

---

## 1. Architectural Philosophy

Koala Corp. is designed around five core product and engineering tenets:

1. **Work First, Agents Second**: Work is modeled as deterministic, structured state machines (workflows) rather than ephemeral conversational threads.
2. **Explicit Autonomous Boundaries**: Digital workers do not have open-ended write permissions. Every worker has declared permissions (`read_data`, `draft_outputs`, `update_fields`) and non-negotiable boundaries.
3. **Native Human-in-the-Loop (HITL) Gateways**: Consequential decisions automatically suspend execution and generate an approval ticket with collected evidence and diff payloads.
4. **Observable Operational State**: Every event is committed to a persistent chronological audit log with full event typing and JSON payloads.
5. **Decoupled Intelligence Layer**: The orchestrator is model-agnostic, supporting Claude 3.5 Sonnet, GPT-4o, and specialized task models through a unified schema.

---

## 2. Core Entity Schemas & TypeScript Contracts

Located in [`src/lib/types.ts`](file:///d:/PROJECTS/StartUp%20conclave/koala-corp/src/lib/types.ts):

### 2.1 Workflow (`Workflow`)
```typescript
export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  workerId: string;             // Primary assigned AI worker
  clientId?: string;            // Tenancy attribution
  template: string;
  dataSourceIds: string[];      // Associated integrations
  steps: WorkflowStep[];        // Ordered sequential steps
  approvalRequired: boolean;
  approvalRules: string[];      // E.g. "Monetary amount > $500"
  schedule?: string;            // E.g. "Daily at 9:00 AM"
  lastRun?: string;
  nextScheduledRun?: string;
  recentRunStatus?: RunStatus;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 Digital Worker (`Worker`)
```typescript
export interface Worker {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'error' | 'disabled';
  permissions: Permission[];    // Granted capabilities
  restrictedActions: string[];  // Hard policy bounds
  assignedWorkflows: string[];  // Workflow IDs under management
  recentTaskCount: number;
  successCount: number;
  failureCount: number;
  lastActivity: string;
  typicalOutputs: string[];     // E.g. "Drafted email", "Reconciled CSV"
  limits: string[];             // Rate limits, concurrency bounds
  configRevision: number;
}
```

### 2.3 Approval Proposal (`Approval`)
```typescript
export interface Approval {
  id: string;
  taskRunId: string;
  workflowId: string;
  workerId: string;
  clientId: string;
  proposedAction: string;       // E.g. "Send $1,450 Overdue Invoice Notice"
  description: string;
  evidence: string;             // Structured evidence gathered by worker
  proposedContent?: string;     // Exact artifact / email draft to be executed
  reason: string;               // Why human intervention was triggered
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested' | 'saved_for_later';
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
  revisionNote?: string;
}
```

---

## 3. State Management & Reactive Store

The application uses a centralized React Context with a predictable Reducer pattern ([`src/lib/store.tsx`](file:///d:/PROJECTS/StartUp%20conclave/koala-corp/src/lib/store.tsx)):

### 3.1 State Shape (`AppState`)
```typescript
interface AppState {
  workflows: Workflow[];
  workers: Worker[];
  taskRuns: TaskRun[];
  approvals: Approval[];
  activityEvents: ActivityEvent[];
  integrations: Integration[];
  settings: WorkspaceSettings;
  clients: Client[];
  templates: WorkflowTemplate[];
  toasts: Toast[];
}
```

### 3.2 Key Reducer Dispatches
* `APPROVE_ITEM`: Transitions approval status to `approved`, advances the associated `TaskRun` to `completed`, updates workflow telemetry, logs an `approval_granted` activity event, and dispatches a success toast.
* `REJECT_ITEM`: Stores supervisor rejection rationale, records `approval_rejected` event, and preserves audit records.
* `REQUEST_REVISION`: Stores supervisor instructions note and transitions status to `revision_requested`.
* `RUN_WORKFLOW`: Spawns a new `TaskRun` with queued steps, sets workflow status to `running`, and initiates simulated step progression.
* `CONNECT_INTEGRATION` / `DISCONNECT_INTEGRATION`: Updates connection state, clears attention warnings, and records audit telemetry.
* `RESET_DEMO`: Restores the complete initial mock dataset using deep structural cloning (`structuredClone(initialState)`).

---

## 4. Design System & CSS Token Architecture

Located in [`src/app/globals.css`](file:///d:/PROJECTS/StartUp%20conclave/koala-corp/src/app/globals.css):

### 4.1 Color Palettes
* **Brand Primary**: Koala Lime (`--koala-lime: #A4D233` light, `#A6F33C` dark)
* **Base Dark**: Obsidian Charcoal (`--warm-paper: #121411` dark, `--nav-bg: #0E100D` dark)
* **Base Light**: Warm Paper (`--warm-paper: #F6F6F0` light, `--surface: #FFFFFF` light)
* **Semantics**:
  * Success: `--success-green: #347A53` (light) / `#4ADE80` (dark)
  * Alert: `--alert-amber: #A66A18` (light) / `#FBBF24` (dark)
  * Error: `--error-red: #BC4646` (light) / `#F87171` (dark)
  * Info: `--info-blue: #4A7FB5` (light) / `#60A5FA` (dark)

### 4.2 Glassmorphism Utilities
* **`.glass-panel`**:
  ```css
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  ```
* **`.glass-card`**: Applied by default to all UI cards with subtle hover elevation and glowing border transition.
* **`.glass-header`**: Top navigation header bar with frosted translucent backdrop blur.

### 4.3 Typography Hierarchy
* Headings: `font-[family-name:var(--font-display)]` → **Space Grotesk**
* Body & UI: `font-[family-name:var(--font-body)]` → **Inter**
* Data & Code: `font-[family-name:var(--font-mono)]` → **JetBrains Mono**

---

## 5. Security & Autonomy Guardrails

### 5.1 The Zero-Knowledge Credential Model
Third-party API credentials (OAuth tokens, Google Ads client secrets, HubSpot tokens) are treated as write-only vault items. They are encrypted at rest and injected into runtime tool invocations without being passed into LLM prompt context windows.

### 5.2 Deterministic Execution Safety Gate
Before any external API mutation (sending an email, modifying a ad budget, deleting a record) is dispatched:
1. The payload is validated against the active workflow's `approvalRules`.
2. If any threshold is exceeded (e.g. monetary claim > $500, recipient count > 50), the runtime throws a `HumanReviewRequiredException`.
3. The step transitions to `needs_review` and creates an immutable `Approval` item.
4. Execution halts until an authorized supervisor executes `APPROVE_ITEM`.

---

## 6. Production Deployment Checklist (Vercel)

1. **Verify Static Pre-rendering**:
   ```bash
   npm run build
   ```
   *Expected output*: `✓ Generating static pages using 11 workers (11/11)` and `The command exited with code 0`.

2. **Git Commit & Tag**:
   ```bash
   git add .
   git commit -m "feat: complete Koala Corp prototype for production deployment"
   git tag -a v1.0.0 -m "Release v1.0.0"
   ```

3. **Vercel Settings**:
   * **Framework Preset**: Next.js
   * **Build Command**: `npm run build`
   * **Output Directory**: `.next`
   * **Node.js Version**: 20.x

4. **Post-Deployment Verification**:
   * Verify all 10 routes load cleanly on the production domain.
   * Test the Dark Mode toggle switch across multiple pages.
   * Open the Command Palette (`⌘K`) and verify quick jumps.
   * Execute one approval in the Approvals queue and verify toast notification and status change.

---

*Koala Corp. Architecture & Engineering Documentation — v1.0*
