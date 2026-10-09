import type { RunStatus, ApprovalStatus, IntegrationStatus, WorkerStatus, EventType } from './types';

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return iso;
  }
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} at ${formatTime(iso)}`;
}

// Stable reference timestamp matching the seed data timeline
const STABLE_NOW = new Date('2026-10-09T13:00:00Z').getTime();

export function formatRelativeTime(iso: string): string {
  try {
    const target = new Date(iso).getTime();
    if (isNaN(target)) return 'Recently';
    const diff = Math.max(0, STABLE_NOW - target);
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  } catch {
    return 'Recently';
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

export function statusColor(status: RunStatus | ApprovalStatus | IntegrationStatus | WorkerStatus | string): {
  bg: string; text: string; dot: string;
} {
  switch (status) {
    case 'completed': case 'approved': case 'connected': case 'active':
      return { bg: 'bg-success-green-bg', text: 'text-success-green', dot: 'bg-success-green' };
    case 'running': case 'queued':
      return { bg: 'bg-koala-lime/15', text: 'text-koala-lime-muted', dot: 'bg-koala-lime' };
    case 'needs_review': case 'pending': case 'needs_attention':
      return { bg: 'bg-alert-amber-bg', text: 'text-alert-amber', dot: 'bg-alert-amber' };
    case 'failed': case 'rejected': case 'error': case 'disabled':
      return { bg: 'bg-error-red-bg', text: 'text-error-red', dot: 'bg-error-red' };
    case 'paused': case 'saved_for_later': case 'draft': case 'idle':
      return { bg: 'bg-surface-muted', text: 'text-koala-grey', dot: 'bg-koala-grey' };
    case 'revision_requested':
      return { bg: 'bg-info-blue-bg', text: 'text-info-blue', dot: 'bg-info-blue' };
    default:
      return { bg: 'bg-surface-muted', text: 'text-koala-grey', dot: 'bg-koala-grey' };
  }
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function eventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    workflow_started: 'Workflow started',
    workflow_completed: 'Workflow completed',
    workflow_failed: 'Workflow failed',
    data_retrieved: 'Data retrieved',
    validation_passed: 'Validation passed',
    validation_failed: 'Validation failed',
    summary_generated: 'Summary generated',
    output_corrected: 'Output corrected',
    approval_requested: 'Approval requested',
    approval_granted: 'Approval granted',
    approval_rejected: 'Approval rejected',
    revision_requested: 'Revision requested',
    task_created: 'Task created',
    integration_connected: 'Integration connected',
    integration_disconnected: 'Integration disconnected',
    retry_initiated: 'Retry initiated',
    step_completed: 'Step completed',
    error_occurred: 'Error occurred',
  };
  return labels[type] || type;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
