'use client';

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  type Workflow, type Worker, type TaskRun, type Approval, type ActivityEvent,
  type Integration, type WorkspaceSettings, type ApprovalStatus, type RunStatus,
  type WorkflowStatus, type IntegrationStatus, type WorkerStatus, type EventType,
  type WorkflowStep,
} from './types';
import {
  initialWorkflows, initialTaskRuns, initialApprovals, initialActivityEvents,
  initialIntegrations, initialSettings, workers as initialWorkers,
  clients as initialClients, workflowTemplates,
} from './seed-data';
import type { Client, WorkflowTemplate } from './types';

// ── State Shape ────────────────────────────────────────────

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

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

// ── Actions ────────────────────────────────────────────────

type Action =
  | { type: 'APPROVE_ITEM'; id: string; decidedBy: string }
  | { type: 'REJECT_ITEM'; id: string; reason: string; decidedBy: string }
  | { type: 'REQUEST_REVISION'; id: string; note: string }
  | { type: 'SAVE_FOR_LATER'; id: string }
  | { type: 'UPDATE_WORKFLOW'; workflow: Workflow }
  | { type: 'CREATE_WORKFLOW'; workflow: Workflow }
  | { type: 'PAUSE_WORKFLOW'; id: string }
  | { type: 'RESUME_WORKFLOW'; id: string }
  | { type: 'RUN_WORKFLOW'; workflowId: string }
  | { type: 'COMPLETE_RUN'; runId: string }
  | { type: 'FAIL_RUN'; runId: string; error: string }
  | { type: 'RETRY_RUN'; runId: string }
  | { type: 'CREATE_WORKER'; worker: Worker }
  | { type: 'UPDATE_WORKER'; worker: Worker }
  | { type: 'CONNECT_INTEGRATION'; id: string }
  | { type: 'DISCONNECT_INTEGRATION'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<WorkspaceSettings> }
  | { type: 'ADD_ACTIVITY'; event: ActivityEvent }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'RESET_DEMO' };

// ── Helpers ────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function makeEvent(type: EventType, description: string, extra?: Partial<ActivityEvent>): ActivityEvent {
  return {
    id: `evt-${makeId()}`,
    type,
    description,
    timestamp: now(),
    status: type.includes('fail') || type.includes('error') ? 'error' : type.includes('warn') ? 'warning' : 'success',
    ...extra,
  };
}

// ── Reducer ────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'APPROVE_ITEM': {
      const approval = state.approvals.find(a => a.id === action.id);
      if (!approval) return state;
      const updatedApprovals = state.approvals.map(a =>
        a.id === action.id ? { ...a, status: 'approved' as ApprovalStatus, decidedAt: now(), decidedBy: action.decidedBy } : a
      );
      const event = makeEvent('approval_granted', `Approved: ${approval.proposedAction}`, {
        workflowId: approval.workflowId, workerId: approval.workerId, clientId: approval.clientId, taskRunId: approval.taskRunId,
      });
      // Update task run status
      const updatedRuns = state.taskRuns.map(r =>
        r.id === approval.taskRunId ? { ...r, status: 'completed' as RunStatus, updatedAt: now(), completedAt: now() } : r
      );
      // Update workflow recent run status
      const updatedWorkflows = state.workflows.map(w =>
        w.id === approval.workflowId ? { ...w, recentRunStatus: 'completed' as RunStatus, updatedAt: now() } : w
      );
      return { ...state, approvals: updatedApprovals, activityEvents: [event, ...state.activityEvents], taskRuns: updatedRuns, workflows: updatedWorkflows };
    }

    case 'REJECT_ITEM': {
      const approval = state.approvals.find(a => a.id === action.id);
      if (!approval) return state;
      const updatedApprovals = state.approvals.map(a =>
        a.id === action.id ? { ...a, status: 'rejected' as ApprovalStatus, decidedAt: now(), decidedBy: action.decidedBy, rejectionReason: action.reason } : a
      );
      const event = makeEvent('approval_rejected', `Rejected: ${approval.proposedAction}. Reason: ${action.reason}`, {
        workflowId: approval.workflowId, workerId: approval.workerId, clientId: approval.clientId, taskRunId: approval.taskRunId,
      });
      return { ...state, approvals: updatedApprovals, activityEvents: [event, ...state.activityEvents] };
    }

    case 'REQUEST_REVISION': {
      const approval = state.approvals.find(a => a.id === action.id);
      if (!approval) return state;
      const updatedApprovals = state.approvals.map(a =>
        a.id === action.id ? { ...a, status: 'revision_requested' as ApprovalStatus, revisionNote: action.note } : a
      );
      const event = makeEvent('revision_requested', `Revision requested: ${approval.proposedAction}`, {
        workflowId: approval.workflowId, workerId: approval.workerId, clientId: approval.clientId, taskRunId: approval.taskRunId,
      });
      return { ...state, approvals: updatedApprovals, activityEvents: [event, ...state.activityEvents] };
    }

    case 'SAVE_FOR_LATER': {
      const updatedApprovals = state.approvals.map(a =>
        a.id === action.id ? { ...a, status: 'saved_for_later' as ApprovalStatus } : a
      );
      return { ...state, approvals: updatedApprovals };
    }

    case 'UPDATE_WORKFLOW': {
      const updatedWorkflows = state.workflows.map(w =>
        w.id === action.workflow.id ? { ...action.workflow, updatedAt: now() } : w
      );
      return { ...state, workflows: updatedWorkflows };
    }

    case 'CREATE_WORKFLOW': {
      const event = makeEvent('task_created', `Workflow created: ${action.workflow.name}`, { workflowId: action.workflow.id });
      return { ...state, workflows: [...state.workflows, action.workflow], activityEvents: [event, ...state.activityEvents] };
    }

    case 'PAUSE_WORKFLOW': {
      const wf = state.workflows.find(w => w.id === action.id);
      if (!wf) return state;
      const updatedWorkflows = state.workflows.map(w =>
        w.id === action.id ? { ...w, status: 'paused' as WorkflowStatus, nextScheduledRun: undefined, updatedAt: now() } : w
      );
      const event = makeEvent('workflow_completed', `Workflow paused: ${wf.name}`, { workflowId: action.id, status: 'info' });
      return { ...state, workflows: updatedWorkflows, activityEvents: [event, ...state.activityEvents] };
    }

    case 'RESUME_WORKFLOW': {
      const wf = state.workflows.find(w => w.id === action.id);
      if (!wf) return state;
      const updatedWorkflows = state.workflows.map(w =>
        w.id === action.id ? { ...w, status: 'active' as WorkflowStatus, updatedAt: now() } : w
      );
      const event = makeEvent('workflow_started', `Workflow resumed: ${wf.name}`, { workflowId: action.id, status: 'info' });
      return { ...state, workflows: updatedWorkflows, activityEvents: [event, ...state.activityEvents] };
    }

    case 'RUN_WORKFLOW': {
      const wf = state.workflows.find(w => w.id === action.workflowId);
      if (!wf) return state;

      const runId = `run-${makeId()}`;
      const steps: WorkflowStep[] = wf.steps.map(s => ({
        ...s,
        id: `${runId}-${s.id}`,
        status: 'queued' as const,
        startedAt: undefined,
        completedAt: undefined,
        output: undefined,
        error: undefined,
      }));

      const newRun: TaskRun = {
        id: runId,
        workflowId: wf.id,
        clientId: wf.clientId || '',
        workerId: wf.workerId,
        name: `${wf.name} — Simulated run`,
        status: 'running',
        startedAt: now(),
        updatedAt: now(),
        isSimulated: true,
        steps,
      };

      const event = makeEvent('workflow_started', `Simulated run started: ${wf.name}`, {
        workflowId: wf.id, workerId: wf.workerId, clientId: wf.clientId, taskRunId: runId,
      });

      const updatedWorkflows = state.workflows.map(w =>
        w.id === action.workflowId ? { ...w, recentRunStatus: 'running' as RunStatus, lastRun: now(), updatedAt: now() } : w
      );

      return {
        ...state,
        taskRuns: [newRun, ...state.taskRuns],
        workflows: updatedWorkflows,
        activityEvents: [event, ...state.activityEvents],
      };
    }

    case 'COMPLETE_RUN': {
      const run = state.taskRuns.find(r => r.id === action.runId);
      if (!run) return state;
      const completedSteps = run.steps.map(s => ({ ...s, status: 'completed' as RunStatus, completedAt: now(), output: s.output || 'Completed (simulated)' }));
      const updatedRuns = state.taskRuns.map(r =>
        r.id === action.runId ? { ...r, status: 'completed' as RunStatus, updatedAt: now(), completedAt: now(), steps: completedSteps, output: 'Simulated execution completed successfully.' } : r
      );
      const updatedWorkflows = state.workflows.map(w =>
        w.id === run.workflowId ? { ...w, recentRunStatus: 'completed' as RunStatus, updatedAt: now() } : w
      );
      const event = makeEvent('workflow_completed', `Simulated run completed: ${run.name}`, {
        workflowId: run.workflowId, workerId: run.workerId, clientId: run.clientId, taskRunId: run.id,
      });
      return { ...state, taskRuns: updatedRuns, workflows: updatedWorkflows, activityEvents: [event, ...state.activityEvents] };
    }

    case 'FAIL_RUN': {
      const run = state.taskRuns.find(r => r.id === action.runId);
      if (!run) return state;
      const updatedRuns = state.taskRuns.map(r =>
        r.id === action.runId ? { ...r, status: 'failed' as RunStatus, updatedAt: now(), error: action.error } : r
      );
      const updatedWorkflows = state.workflows.map(w =>
        w.id === run.workflowId ? { ...w, recentRunStatus: 'failed' as RunStatus, updatedAt: now() } : w
      );
      const event = makeEvent('workflow_failed', `Simulated run failed: ${run.name}. ${action.error}`, {
        workflowId: run.workflowId, workerId: run.workerId, clientId: run.clientId, taskRunId: run.id, status: 'error',
      });
      return { ...state, taskRuns: updatedRuns, workflows: updatedWorkflows, activityEvents: [event, ...state.activityEvents] };
    }

    case 'RETRY_RUN': {
      const run = state.taskRuns.find(r => r.id === action.runId);
      if (!run) return state;
      const retryEvent = makeEvent('retry_initiated', `Retry initiated for: ${run.name}`, {
        workflowId: run.workflowId, workerId: run.workerId, clientId: run.clientId, taskRunId: run.id, status: 'info',
      });
      // Create a new run
      const newRunId = `run-${makeId()}`;
      const newRun: TaskRun = {
        ...run,
        id: newRunId,
        status: 'running',
        startedAt: now(),
        updatedAt: now(),
        error: undefined,
        steps: run.steps.map(s => ({ ...s, id: `${newRunId}-${s.id}`, status: 'queued' as const, error: undefined, output: undefined })),
      };
      const updatedWorkflows = state.workflows.map(w =>
        w.id === run.workflowId ? { ...w, recentRunStatus: 'running' as RunStatus, updatedAt: now() } : w
      );
      return {
        ...state,
        taskRuns: [newRun, ...state.taskRuns],
        workflows: updatedWorkflows,
        activityEvents: [retryEvent, ...state.activityEvents],
      };
    }

    case 'CREATE_WORKER': {
      const event = makeEvent('task_created', `Worker created: ${action.worker.name}`);
      return { ...state, workers: [...state.workers, action.worker], activityEvents: [event, ...state.activityEvents] };
    }

    case 'UPDATE_WORKER': {
      const updatedWorkers = state.workers.map(w =>
        w.id === action.worker.id ? action.worker : w
      );
      return { ...state, workers: updatedWorkers };
    }

    case 'CONNECT_INTEGRATION': {
      const integration = state.integrations.find(i => i.id === action.id);
      if (!integration) return state;
      const updatedIntegrations = state.integrations.map(i =>
        i.id === action.id ? { ...i, status: 'connected' as IntegrationStatus, connectedAt: now(), lastSync: now(), attentionMessage: undefined } : i
      );
      const event = makeEvent('integration_connected', `Connected: ${integration.name} (demo mode)`, { status: 'success' });
      return { ...state, integrations: updatedIntegrations, activityEvents: [event, ...state.activityEvents] };
    }

    case 'DISCONNECT_INTEGRATION': {
      const integration = state.integrations.find(i => i.id === action.id);
      if (!integration) return state;
      const updatedIntegrations = state.integrations.map(i =>
        i.id === action.id ? { ...i, status: 'not_connected' as IntegrationStatus, connectedAt: undefined, lastSync: undefined } : i
      );
      const event = makeEvent('integration_disconnected', `Disconnected: ${integration.name}`, { status: 'info' });
      return { ...state, integrations: updatedIntegrations, activityEvents: [event, ...state.activityEvents] };
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }

    case 'ADD_TOAST': {
      return { ...state, toasts: [...state.toasts, action.toast] };
    }

    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    }

    case 'RESET_DEMO': {
      return getInitialState();
    }

    default:
      return state;
  }
}

// ── Initial State ──────────────────────────────────────────

function getInitialState(): AppState {
  return {
    workflows: structuredClone(initialWorkflows),
    workers: structuredClone(initialWorkers),
    taskRuns: structuredClone(initialTaskRuns),
    approvals: structuredClone(initialApprovals),
    activityEvents: structuredClone(initialActivityEvents),
    integrations: structuredClone(initialIntegrations),
    settings: structuredClone(initialSettings),
    clients: structuredClone(initialClients),
    templates: structuredClone(workflowTemplates),
    toasts: [],
  };
}

// ── Context ────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  showToast: (message: string, type?: Toast['type']) => void;
  getClient: (id: string) => Client | undefined;
  getWorker: (id: string) => Worker | undefined;
  getWorkflow: (id: string) => Workflow | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = makeId();
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type, timestamp: Date.now() } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000);
  }, []);

  const getClient = useCallback((id: string) => state.clients.find(c => c.id === id), [state.clients]);
  const getWorker = useCallback((id: string) => state.workers.find(w => w.id === id), [state.workers]);
  const getWorkflow = useCallback((id: string) => state.workflows.find(w => w.id === id), [state.workflows]);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast, getClient, getWorker, getWorkflow }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
