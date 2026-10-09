'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, Button, EmptyState, Modal, Input, Select, Toggle } from '@/components/ui';
import { formatRelativeTime, formatDate, cn } from '@/lib/utils';
import { Plus, Play, Pause, MoreVertical, GitBranch, Eye, Clock, ChevronRight } from 'lucide-react';
import type { Workflow, WorkflowStep } from '@/lib/types';

export default function WorkflowsPage() {
  const { state, dispatch, showToast, getClient, getWorker } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Reusable workflows that organize how Koala executes business work."
        actions={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Create workflow
          </Button>
        }
      />

      {/* Workflow list */}
      <div className="space-y-3">
        {state.workflows.map(wf => {
          const client = getClient(wf.clientId || '');
          const worker = getWorker(wf.workerId);
          return (
            <Card key={wf.id} padding={false} className="hover:border-koala-grey/40 transition-colors">
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0',
                  wf.status === 'active' ? 'bg-koala-lime/15' : 'bg-surface-muted'
                )}>
                  <GitBranch size={18} className={wf.status === 'active' ? 'text-koala-lime-muted' : 'text-koala-grey'} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/workflows/${wf.id}`} className="text-sm font-semibold text-deep-charcoal hover:text-koala-lime-muted transition-colors">
                      {wf.name}
                    </Link>
                    <StatusBadge status={wf.status} />
                    {wf.recentRunStatus && wf.recentRunStatus !== wf.status && (
                      <StatusBadge status={wf.recentRunStatus} />
                    )}
                  </div>
                  <p className="text-xs text-koala-grey mt-0.5 truncate max-w-md">{wf.description}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-koala-grey">
                    {client && <span>{client.name}</span>}
                    {worker && <span>Worker: {worker.name}</span>}
                    {wf.lastRun && <span className="font-[family-name:var(--font-mono)]">Last run: {formatRelativeTime(wf.lastRun)}</span>}
                    {wf.schedule && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {wf.schedule}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/workflows/${wf.id}`}>
                    <Button variant="ghost" size="sm"><Eye size={14} /> Open</Button>
                  </Link>
                  {wf.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        dispatch({ type: 'PAUSE_WORKFLOW', id: wf.id });
                        showToast(`${wf.name} paused`, 'info');
                      }}
                    >
                      <Pause size={14} />
                    </Button>
                  )}
                  {wf.status === 'paused' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        dispatch({ type: 'RESUME_WORKFLOW', id: wf.id });
                        showToast(`${wf.name} resumed`, 'success');
                      }}
                    >
                      <Play size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {state.workflows.length === 0 && (
        <EmptyState
          icon={<GitBranch size={32} />}
          title="No workflows yet"
          description="Create your first workflow to start automating business work."
          action={<Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={14} /> Create workflow</Button>}
        />
      )}

      {/* Create workflow modal */}
      <CreateWorkflowModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

function CreateWorkflowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, showToast } = useApp();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState(state.templates[0]?.id || '');
  const [clientId, setClientId] = useState(state.clients[0]?.id || '');
  const [workerId, setWorkerId] = useState(state.workers[0]?.id || '');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [dataSourceId, setDataSourceId] = useState(state.integrations[0]?.id || '');

  const template = state.templates.find(t => t.id === templateId);

  const handleCreate = () => {
    if (!name.trim()) return;
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description: template?.description || '',
      status: 'active',
      workerId,
      clientId,
      template: templateId,
      dataSourceIds: [dataSourceId],
      approvalRequired,
      approvalRules: approvalRequired ? ['Outputs require human approval'] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: template?.defaultSteps.map(s => ({
        ...s,
        status: 'pending' as const,
      })) || [],
    };
    dispatch({ type: 'CREATE_WORKFLOW', workflow: newWf });
    showToast(`Workflow "${name}" created`, 'success');
    onClose();
    setName('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Create workflow" size="lg">
      <div className="space-y-4">
        <Input label="Workflow name" value={name} onChange={setName} placeholder="e.g. Campaign Watch — Client Name" required />

        <Select
          label="Template"
          value={templateId}
          onChange={setTemplateId}
          options={state.templates.map(t => ({ value: t.id, label: t.name }))}
        />

        {template && (
          <div className="bg-surface-muted rounded-[var(--radius-md)] p-3">
            <p className="text-xs text-koala-grey mb-2">{template.description}</p>
            <div className="space-y-1">
              {template.defaultSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-divider-grey text-koala-grey flex items-center justify-center text-[10px] font-medium shrink-0">{i + 1}</span>
                  <span className="text-deep-charcoal">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Select
          label="Client account"
          value={clientId}
          onChange={setClientId}
          options={state.clients.map(c => ({ value: c.id, label: c.name }))}
        />

        <Select
          label="Data source"
          value={dataSourceId}
          onChange={setDataSourceId}
          options={state.integrations.map(i => ({ value: i.id, label: `${i.name} (${i.status})` }))}
        />

        <Select
          label="Responsible worker"
          value={workerId}
          onChange={setWorkerId}
          options={state.workers.map(w => ({ value: w.id, label: `${w.name} — ${w.role}` }))}
        />

        <Toggle
          label="Require human approval"
          checked={approvalRequired}
          onChange={setApprovalRequired}
          description="Outputs will be routed to the approval queue before execution."
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-divider-grey">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>Create workflow</Button>
        </div>
      </div>
    </Modal>
  );
}
