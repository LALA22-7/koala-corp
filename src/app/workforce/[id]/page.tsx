'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, MetricCard, Button, EmptyState, Modal, Input, Textarea, Select } from '@/components/ui';
import { formatRelativeTime, formatDuration, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft, Shield, Cpu, Activity, AlertTriangle, CheckCircle2,
  Clock, Pause, Play, Edit3, Settings, Lock, FileText, CheckSquare, Layers
} from 'lucide-react';
import type { Worker, Permission, WorkerStatus } from '@/lib/types';

export default function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { state, dispatch, showToast } = useApp();

  const worker = state.workers.find(w => w.id === resolvedParams.id);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'workflows' | 'history'>('profile');

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: worker?.name || '',
    role: worker?.role || '',
    description: worker?.description || '',
    status: worker?.status || 'active',
    restrictedActionsText: worker?.restrictedActions.join('\n') || '',
  });

  if (!worker) {
    return (
      <div>
        <Link href="/workforce" className="inline-flex items-center gap-1.5 text-xs text-koala-grey hover:text-deep-charcoal mb-4">
          <ArrowLeft size={14} /> Back to Workforce
        </Link>
        <EmptyState
          icon={<Cpu size={40} />}
          title="Worker Not Found"
          description={`The worker with ID "${resolvedParams.id}" could not be located in the current workspace.`}
          action={<Button onClick={() => router.push('/workforce')}>Return to Directory</Button>}
        />
      </div>
    );
  }

  const assignedWorkflowsList = state.workflows.filter(w => worker.assignedWorkflows.includes(w.id) || w.workerId === worker.id);
  const workerTaskRuns = state.taskRuns.filter(r => r.workerId === worker.id);
  const workerApprovals = state.approvals.filter(a => a.workerId === worker.id);

  const successRate = worker.recentTaskCount > 0
    ? Math.round((worker.successCount / worker.recentTaskCount) * 100)
    : 100;
  const initials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const handleToggleStatus = () => {
    const nextStatus: WorkerStatus = worker.status === 'active' ? 'idle' : 'active';
    dispatch({
      type: 'UPDATE_WORKER',
      worker: { ...worker, status: nextStatus },
    });
    showToast(`${worker.name} status updated to ${nextStatus}`, 'info');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Worker = {
      ...worker,
      name: editForm.name.trim(),
      role: editForm.role.trim(),
      description: editForm.description.trim(),
      status: editForm.status as WorkerStatus,
      restrictedActions: editForm.restrictedActionsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      configRevision: worker.configRevision + 1,
    };
    dispatch({ type: 'UPDATE_WORKER', worker: updated });
    showToast('Worker profile updated successfully', 'success');
    setEditModalOpen(false);
  };

  return (
    <div>
      {/* Navigation Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/workforce"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-koala-grey hover:text-deep-charcoal transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Workforce</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-deep-charcoal text-white font-mono text-lg flex items-center justify-center font-bold shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">
                {worker.name}
              </h1>
              <StatusBadge status={worker.status} size="md" />
            </div>
            <p className="text-sm text-koala-grey mt-0.5">{worker.role} • Rev {worker.configRevision}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleToggleStatus}
          >
            {worker.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            <span>{worker.status === 'active' ? 'Pause Worker' : 'Activate Worker'}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setEditForm({
                name: worker.name,
                role: worker.role,
                description: worker.description,
                status: worker.status,
                restrictedActionsText: worker.restrictedActions.join('\n'),
              });
              setEditModalOpen(true);
            }}
          >
            <Edit3 size={14} />
            <span>Configure</span>
          </Button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <MetricCard label="Total Executions" value={worker.recentTaskCount} />
          <MetricCard label="Success Rate" value={`${successRate}%`} status="active" />
          <MetricCard label="Pending Approvals" value={workerApprovals.filter(a => a.status === 'pending').length} />
          <MetricCard label="Active Workflows" value={assignedWorkflowsList.length} />
          <MetricCard label="Last Activity" value={formatRelativeTime(worker.lastActivity)} />
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-divider-grey mb-6">
        {[
          { id: 'profile', label: 'Operational Mandate & Governance', count: null },
          { id: 'workflows', label: 'Assigned Workflows', count: assignedWorkflowsList.length },
          { id: 'history', label: 'Execution Audit Log', count: workerTaskRuns.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-deep-charcoal text-deep-charcoal'
                : 'border-transparent text-koala-grey hover:text-deep-charcoal'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="text-xs bg-surface-muted px-1.5 py-0.5 rounded-full font-mono text-koala-grey">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Profile & Governance */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Mandate & Outputs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)] mb-3">
                Operational Mandate
              </h2>
              <p className="text-sm text-deep-charcoal leading-relaxed mb-6">
                {worker.description}
              </p>

              <h3 className="text-xs font-mono uppercase text-koala-grey mb-2.5">Granted Permissions</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {worker.permissions.map(perm => (
                  <span
                    key={perm}
                    className="inline-flex items-center gap-1.5 text-xs bg-koala-lime/15 text-deep-charcoal px-2.5 py-1 rounded-md font-medium"
                  >
                    <CheckCircle2 size={13} className="text-koala-lime-muted" />
                    <span>{perm.replace('_', ' ')}</span>
                  </span>
                ))}
              </div>

              <h3 className="text-xs font-mono uppercase text-koala-grey mb-2.5">Standard Operational Limits</h3>
              <ul className="space-y-2">
                {worker.limits.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-deep-charcoal">
                    <span className="w-1.5 h-1.5 rounded-full bg-koala-grey mt-1.5 shrink-0" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)] mb-3">
                Expected Output Artifacts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {worker.typicalOutputs.map((output, idx) => (
                  <div key={idx} className="p-3 bg-warm-paper rounded-[var(--radius-md)] border border-divider-grey text-xs">
                    <FileText size={16} className="text-koala-grey mb-1.5" />
                    <span className="font-medium text-deep-charcoal">{output}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Hard Guardrails & Boundaries */}
          <div className="space-y-6">
            <Card className="border-alert-amber/40 bg-alert-amber-bg/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-alert-amber" />
                <h2 className="text-sm font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">
                  Autonomous Boundaries
                </h2>
              </div>
              <p className="text-xs text-koala-grey mb-4">
                These constraints are strictly enforced in the Koala runtime. Violations pause execution and trigger human escalation.
              </p>
              <div className="space-y-2.5">
                {worker.restrictedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-surface rounded border border-divider-grey text-xs">
                    <Lock size={13} className="text-alert-amber shrink-0 mt-0.5" />
                    <span className="text-deep-charcoal font-medium">{action}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-mono uppercase text-koala-grey mb-3">Runtime Specifications</h3>
              <div className="space-y-2 text-xs text-deep-charcoal">
                <div className="flex justify-between py-1 border-b border-divider-grey">
                  <span className="text-koala-grey">Base Model</span>
                  <span className="font-mono">Claude 3.5 Sonnet</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider-grey">
                  <span className="text-koala-grey">Context Window</span>
                  <span className="font-mono">200k tokens</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider-grey">
                  <span className="text-koala-grey">Inference Temperature</span>
                  <span className="font-mono">0.15 (Deterministic)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-koala-grey">Timeout SLA</span>
                  <span className="font-mono">120 seconds / step</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Workflows */}
      {activeTab === 'workflows' && (
        <Card padding={false}>
          <div className="p-4 border-b border-divider-grey">
            <h2 className="text-sm font-semibold text-deep-charcoal">Assigned Operational Workflows</h2>
          </div>
          {assignedWorkflowsList.length === 0 ? (
            <div className="p-8 text-center text-sm text-koala-grey">
              No workflows currently assigned to this worker.
            </div>
          ) : (
            <div className="divide-y divide-divider-grey">
              {assignedWorkflowsList.map(wf => (
                <div key={wf.id} className="p-4 flex items-center justify-between hover:bg-surface-muted/50 transition-colors">
                  <div>
                    <Link
                      href={`/workflows/${wf.id}`}
                      className="font-semibold text-sm text-deep-charcoal hover:text-koala-lime-muted transition-colors font-[family-name:var(--font-display)]"
                    >
                      {wf.name}
                    </Link>
                    <p className="text-xs text-koala-grey mt-0.5">{wf.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-koala-grey">
                      <span>Schedule: {wf.schedule || 'On-demand'}</span>
                      <span>•</span>
                      <span>{wf.steps.length} sequential steps</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={wf.status} />
                    <Link
                      href={`/workflows/${wf.id}`}
                      className="p-1.5 text-koala-grey hover:text-deep-charcoal"
                      title="Inspect Workflow"
                    >
                      <Layers size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Execution History */}
      {activeTab === 'history' && (
        <Card padding={false}>
          <div className="p-4 border-b border-divider-grey">
            <h2 className="text-sm font-semibold text-deep-charcoal">Execution Runs Handled by {worker.name}</h2>
          </div>
          {workerTaskRuns.length === 0 ? (
            <div className="p-8 text-center text-sm text-koala-grey">
              No execution runs logged for this worker yet.
            </div>
          ) : (
            <div className="divide-y divide-divider-grey">
              {workerTaskRuns.map(run => {
                const client = state.clients.find(c => c.id === run.clientId);
                return (
                  <div key={run.id} className="p-4 flex items-center justify-between hover:bg-surface-muted/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-deep-charcoal">{run.name}</span>
                        {client && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${client.color}15`, color: client.color }}
                          >
                            {client.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-koala-grey">
                        <span>Started: {formatDateTime(run.startedAt)}</span>
                        {run.executionDuration && (
                          <>
                            <span>•</span>
                            <span>Duration: {formatDuration(run.executionDuration)}</span>
                          </>
                        )}
                      </div>
                      {run.error && (
                        <p className="mt-1 text-xs text-error-red font-mono bg-error-red-bg px-2 py-0.5 rounded inline-block">
                          {run.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={run.status} />
                      <Link
                        href={`/workflows/${run.workflowId}`}
                        className="text-xs font-medium text-koala-grey hover:text-deep-charcoal"
                      >
                        View Run →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Edit Worker Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Configure ${worker.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Worker Name"
            value={editForm.name}
            onChange={v => setEditForm(prev => ({ ...prev, name: v }))}
          />
          <Input
            label="Operational Role"
            value={editForm.role}
            onChange={v => setEditForm(prev => ({ ...prev, role: v }))}
          />
          <Textarea
            label="Mandate Description"
            rows={3}
            value={editForm.description}
            onChange={v => setEditForm(prev => ({ ...prev, description: v }))}
          />
          <Select
            label="Operational Status"
            value={editForm.status}
            onChange={v => setEditForm(prev => ({ ...prev, status: v as WorkerStatus }))}
            options={[
              { value: 'active', label: 'Active (Executing scheduled tasks)' },
              { value: 'idle', label: 'Idle (Standby)' },
              { value: 'disabled', label: 'Disabled (Maintenance)' },
            ]}
          />
          <Textarea
            label="Restricted Actions & Governance Rules (one per line)"
            rows={4}
            value={editForm.restrictedActionsText}
            onChange={v => setEditForm(prev => ({ ...prev, restrictedActionsText: v }))}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-divider-grey">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Configuration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
