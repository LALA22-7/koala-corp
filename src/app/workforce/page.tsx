'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, MetricCard, Button, EmptyState, Modal, Input, Textarea, Select, Toggle } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { Plus, Users, Shield, Cpu, ExternalLink, Pause, Play, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { Worker, Permission, WorkerStatus } from '@/lib/types';

export default function WorkforcePage() {
  const { state, dispatch, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New worker form state
  const [newWorker, setNewWorker] = useState<{
    name: string;
    role: string;
    description: string;
    status: WorkerStatus;
    permissions: Permission[];
    restrictedActionsText: string;
    assignedWorkflows: string[];
  }>({
    name: '',
    role: '',
    description: '',
    status: 'active',
    permissions: ['read_data', 'draft_outputs', 'create_tasks'],
    restrictedActionsText: 'Cannot send external communications without sign-off\nCannot mutate production database directly',
    assignedWorkflows: [],
  });

  // Calculate metrics
  const totalWorkers = state.workers.length;
  const activeWorkers = state.workers.filter(w => w.status === 'active').length;
  const idleWorkers = state.workers.filter(w => w.status === 'idle').length;
  const totalTasks = state.workers.reduce((acc, w) => acc + w.recentTaskCount, 0);
  const totalSuccess = state.workers.reduce((acc, w) => acc + w.successCount, 0);
  const overallSuccessRate = totalTasks > 0 ? ((totalSuccess / totalTasks) * 100).toFixed(1) : '100.0';

  // Filtered workers
  const filteredWorkers = state.workers.filter(w => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchRole = w.role.toLowerCase().includes(q);
      const matchDesc = w.description.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchDesc) return false;
    }
    return true;
  });

  const handleToggleWorkerStatus = (worker: Worker) => {
    const nextStatus: WorkerStatus = worker.status === 'active' ? 'idle' : 'active';
    dispatch({
      type: 'UPDATE_WORKER',
      worker: { ...worker, status: nextStatus },
    });
    showToast(`${worker.name} status updated to ${nextStatus}`, 'info');
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name.trim() || !newWorker.role.trim()) {
      showToast('Please provide both worker name and role', 'error');
      return;
    }

    const createdWorker: Worker = {
      id: `wkr-${Date.now().toString(36)}`,
      name: newWorker.name.trim(),
      role: newWorker.role.trim(),
      description: newWorker.description.trim() || 'Custom AI operational worker.',
      status: newWorker.status,
      permissions: newWorker.permissions,
      restrictedActions: newWorker.restrictedActionsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
      assignedWorkflows: newWorker.assignedWorkflows,
      recentTaskCount: 0,
      successCount: 0,
      failureCount: 0,
      lastActivity: new Date().toISOString(),
      typicalOutputs: ['Automated draft', 'Structured audit log', 'Execution metric'],
      limits: ['10 concurrent actions per minute', 'Human review trigger on critical error'],
      configRevision: 1,
    };

    dispatch({ type: 'CREATE_WORKER', worker: createdWorker });
    showToast(`Worker ${createdWorker.name} provisioned successfully`, 'success');
    setCreateModalOpen(false);
    setNewWorker({
      name: '',
      role: '',
      description: '',
      status: 'active',
      permissions: ['read_data', 'draft_outputs', 'create_tasks'],
      restrictedActionsText: 'Cannot send external communications without sign-off',
      assignedWorkflows: [],
    });
  };

  const togglePermission = (perm: Permission) => {
    setNewWorker(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleWorkflowAssignment = (wfId: string) => {
    setNewWorker(prev => ({
      ...prev,
      assignedWorkflows: prev.assignedWorkflows.includes(wfId)
        ? prev.assignedWorkflows.filter(id => id !== wfId)
        : [...prev.assignedWorkflows, wfId],
    }));
  };

  return (
    <div>
      <PageHeader
        title="Workforce"
        description="Supervised AI workers operating specialized business workflows under explicit operational boundaries."
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} />
            <span>Deploy Worker</span>
          </Button>
        }
      />

      {/* KPI Stats */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard label="Total Digital Workers" value={totalWorkers} change="Across all client teams" />
          <MetricCard label="Currently Active" value={activeWorkers} change={`${idleWorkers} idle / on-call`} />
          <MetricCard label="Processed Tasks (30d)" value={totalTasks} change="99.4% SLA adherence" />
          <MetricCard label="Workforce Accuracy" value={`${overallSuccessRate}%`} change="Verified human pass-rate" />
        </div>
      </Card>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 bg-surface border border-divider-grey rounded-[var(--radius-md)] p-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Workers' },
            { id: 'active', label: 'Active' },
            { id: 'idle', label: 'Idle' },
            { id: 'error', label: 'Needs Attention' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-deep-charcoal text-white'
                  : 'text-koala-grey hover:text-deep-charcoal hover:bg-surface-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter by name, role, or skill..."
          />
        </div>
      </div>

      {/* Worker Cards Grid */}
      {filteredWorkers.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title="No workers match criteria"
          description="Adjust your search filters or deploy a new worker to this workspace."
          action={<Button onClick={() => { setFilterStatus('all'); setSearchQuery(''); }}>Reset filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map(worker => {
            const successRate = worker.recentTaskCount > 0
              ? Math.round((worker.successCount / worker.recentTaskCount) * 100)
              : 100;
            const initials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2);

            return (
              <div
                key={worker.id}
                className="bg-surface border border-divider-grey rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] hover:border-koala-grey transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-deep-charcoal text-white font-mono text-xs flex items-center justify-center font-bold">
                        {initials}
                      </div>
                      <div>
                        <Link
                          href={`/workforce/${worker.id}`}
                          className="font-semibold text-deep-charcoal hover:text-koala-lime-muted transition-colors text-base font-[family-name:var(--font-display)]"
                        >
                          {worker.name}
                        </Link>
                        <p className="text-xs text-koala-grey font-medium">{worker.role}</p>
                      </div>
                    </div>
                    <StatusBadge status={worker.status} />
                  </div>

                  {/* Worker Description */}
                  <p className="text-xs text-koala-grey leading-relaxed mb-4 line-clamp-2">
                    {worker.description}
                  </p>

                  {/* Operational Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-surface-muted rounded-[var(--radius-md)] mb-4 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-koala-grey">Tasks</div>
                      <div className="text-sm font-semibold text-deep-charcoal">{worker.recentTaskCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-koala-grey">Accuracy</div>
                      <div className="text-sm font-semibold text-success-green">{successRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-koala-grey">Active</div>
                      <div className="text-xs font-medium text-koala-grey mt-0.5">{formatRelativeTime(worker.lastActivity)}</div>
                    </div>
                  </div>

                  {/* Assigned Workflows */}
                  <div className="mb-4">
                    <div className="text-[11px] font-mono uppercase text-koala-grey mb-1.5 flex items-center gap-1">
                      <Cpu size={12} />
                      <span>Assigned Workflows ({worker.assignedWorkflows.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {worker.assignedWorkflows.length === 0 ? (
                        <span className="text-xs text-koala-grey italic">No active workflows</span>
                      ) : (
                        worker.assignedWorkflows.map(wfId => {
                          const wf = state.workflows.find(w => w.id === wfId);
                          return (
                            <Link
                              key={wfId}
                              href={`/workflows/${wfId}`}
                              className="text-[11px] bg-white border border-divider-grey px-2 py-0.5 rounded text-deep-charcoal hover:border-koala-grey hover:bg-surface-muted transition-colors"
                            >
                              {wf ? wf.name : wfId}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Guardrails / Restriction summary */}
                  <div className="mb-4 p-2.5 bg-warm-paper rounded-[var(--radius-md)] border border-divider-grey/60 text-xs text-koala-grey">
                    <div className="flex items-center gap-1 font-medium text-deep-charcoal text-[11px] mb-1">
                      <Shield size={12} className="text-alert-amber" />
                      <span>Autonomous Boundaries:</span>
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      {worker.restrictedActions.slice(0, 2).map((rule, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-koala-grey">•</span>
                          <span className="line-clamp-1">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-divider-grey flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleWorkerStatus(worker)}
                    className="inline-flex items-center gap-1.5 text-xs text-koala-grey hover:text-deep-charcoal cursor-pointer font-medium"
                  >
                    {worker.status === 'active' ? (
                      <>
                        <Pause size={13} />
                        <span>Pause Worker</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>Resume Worker</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/workforce/${worker.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-deep-charcoal hover:text-koala-lime-muted transition-colors"
                  >
                    <span>Inspect Profile</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deploy Worker Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Deploy Autonomous AI Worker"
        size="lg"
      >
        <form onSubmit={handleCreateWorker} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Worker Name"
              required
              placeholder="e.g. Elena Rostova"
              value={newWorker.name}
              onChange={v => setNewWorker(prev => ({ ...prev, name: v }))}
            />
            <Input
              label="Operational Role"
              required
              placeholder="e.g. Lead Dispute Analyst"
              value={newWorker.role}
              onChange={v => setNewWorker(prev => ({ ...prev, role: v }))}
            />
          </div>

          <Textarea
            label="Operational Mandate & Description"
            placeholder="Describe the responsibilities, expected accuracy criteria, and routine behavior for this worker..."
            rows={2}
            value={newWorker.description}
            onChange={v => setNewWorker(prev => ({ ...prev, description: v }))}
          />

          <div>
            <label className="block text-xs font-medium text-koala-grey mb-2">Granted Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'read_data', label: 'Read Data' },
                { id: 'draft_outputs', label: 'Draft Outputs' },
                { id: 'create_tasks', label: 'Create Tasks' },
                { id: 'update_fields', label: 'Update CRM Fields' },
                { id: 'send_external', label: 'Send External Communications' },
                { id: 'modify_campaigns', label: 'Modify Active Campaigns' },
              ].map(p => {
                const checked = newWorker.permissions.includes(p.id as Permission);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.id as Permission)}
                    className={`flex items-center gap-2 p-2 rounded border text-xs text-left cursor-pointer transition-colors ${
                      checked
                        ? 'bg-koala-lime/10 border-koala-lime text-deep-charcoal font-medium'
                        : 'bg-surface border-divider-grey text-koala-grey hover:bg-surface-muted'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${checked ? 'bg-koala-lime text-deep-charcoal border-koala-lime' : 'border-divider-grey'}`}>
                      {checked && '✓'}
                    </div>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-koala-grey mb-2">Assign Workflows</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-divider-grey rounded-[var(--radius-md)]">
              {state.workflows.map(wf => {
                const assigned = newWorker.assignedWorkflows.includes(wf.id);
                return (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => toggleWorkflowAssignment(wf.id)}
                    className={`flex items-center justify-between p-2 rounded text-xs text-left cursor-pointer transition-colors ${
                      assigned
                        ? 'bg-koala-lime/15 text-deep-charcoal font-medium'
                        : 'hover:bg-surface-muted text-koala-grey'
                    }`}
                  >
                    <span className="truncate">{wf.name}</span>
                    <span className="font-mono text-[10px] uppercase ml-2">{assigned ? 'Assigned' : '+ Add'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Operational Boundaries & Restrictions (one per line)"
            rows={3}
            value={newWorker.restrictedActionsText}
            onChange={v => setNewWorker(prev => ({ ...prev, restrictedActionsText: v }))}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-divider-grey">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Provision Worker
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
