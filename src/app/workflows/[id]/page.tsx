'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, Button, ConfirmDialog, Input, Select, Toggle, EmptyState } from '@/components/ui';
import { formatRelativeTime, formatDateTime, formatDuration, cn, statusColor } from '@/lib/utils';
import {
  ArrowLeft, Play, Pause, Settings, CheckCircle2, XCircle, Clock,
  AlertTriangle, ChevronDown, ChevronRight, Edit3, Save, RefreshCw,
  Loader2, Eye,
} from 'lucide-react';

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch, showToast, getClient, getWorker } = useApp();
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'runs' | 'config'>('steps');

  const workflow = state.workflows.find(w => w.id === id);
  const client = getClient(workflow?.clientId || '');
  const worker = getWorker(workflow?.workerId || '');
  const runs = state.taskRuns.filter(r => r.workflowId === id).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // Editing state
  const [editName, setEditName] = useState('');
  const [editApproval, setEditApproval] = useState(true);
  const [editWorkerId, setEditWorkerId] = useState('');

  useEffect(() => {
    if (workflow) {
      setEditName(workflow.name);
      setEditApproval(workflow.approvalRequired);
      setEditWorkerId(workflow.workerId);
    }
  }, [workflow]);

  if (!workflow) {
    return (
      <EmptyState
        icon={<AlertTriangle size={32} />}
        title="Workflow not found"
        description="This workflow may have been removed or doesn't exist."
        action={<Link href="/workflows"><Button variant="secondary"><ArrowLeft size={14} /> Back to workflows</Button></Link>}
      />
    );
  }

  const handleRun = () => {
    setShowRunConfirm(false);
    dispatch({ type: 'RUN_WORKFLOW', workflowId: id });
    showToast('Simulated workflow run started', 'success');
    setSimRunning(true);
    // Simulate execution completing after delay
    setTimeout(() => {
      const latest = state.taskRuns.find(r => r.workflowId === id && r.status === 'running');
      if (latest) {
        dispatch({ type: 'COMPLETE_RUN', runId: latest.id });
        showToast('Simulated run completed', 'success');
      }
      setSimRunning(false);
    }, 3000);
  };

  const handleSaveEdit = () => {
    dispatch({
      type: 'UPDATE_WORKFLOW',
      workflow: { ...workflow, name: editName, approvalRequired: editApproval, workerId: editWorkerId },
    });
    showToast('Workflow updated', 'success');
    setIsEditing(false);
  };

  const stepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-success-green" />;
      case 'running': return <Loader2 size={16} className="text-koala-lime-muted animate-spin" />;
      case 'failed': return <XCircle size={16} className="text-error-red" />;
      case 'needs_review': return <Clock size={16} className="text-alert-amber" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-divider-grey" />;
    }
  };

  return (
    <div>
      {/* Back link */}
      <Link href="/workflows" className="inline-flex items-center gap-1 text-xs text-koala-grey hover:text-deep-charcoal mb-4 transition-colors">
        <ArrowLeft size={12} /> Back to workflows
      </Link>

      <PageHeader
        title={isEditing ? '' : workflow.name}
        description={isEditing ? undefined : workflow.description}
        actions={
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveEdit}><Save size={14} /> Save</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}><Edit3 size={14} /> Edit</Button>
                {workflow.status === 'active' && (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => { dispatch({ type: 'PAUSE_WORKFLOW', id }); showToast('Workflow paused', 'info'); }}>
                      <Pause size={14} /> Pause
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setShowRunConfirm(true)} disabled={simRunning}>
                      {simRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                      {simRunning ? 'Running...' : 'Run now'}
                    </Button>
                  </>
                )}
                {workflow.status === 'paused' && (
                  <Button variant="primary" size="sm" onClick={() => { dispatch({ type: 'RESUME_WORKFLOW', id }); showToast('Workflow resumed', 'success'); }}>
                    <Play size={14} /> Resume
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {isEditing && (
        <Card className="mb-6">
          <h3 className="text-sm font-semibold mb-3 font-[family-name:var(--font-display)]">Edit workflow configuration</h3>
          <div className="space-y-4">
            <Input label="Name" value={editName} onChange={setEditName} />
            <Select
              label="Responsible worker"
              value={editWorkerId}
              onChange={setEditWorkerId}
              options={state.workers.map(w => ({ value: w.id, label: w.name }))}
            />
            <Toggle label="Require human approval" checked={editApproval} onChange={setEditApproval} />
          </div>
        </Card>
      )}

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <StatusBadge status={workflow.status} size="md" />
        {workflow.recentRunStatus && <StatusBadge status={workflow.recentRunStatus} size="md" />}
        {client && <span className="text-koala-grey">Client: <span className="text-deep-charcoal font-medium">{client.name}</span></span>}
        {worker && <span className="text-koala-grey">Worker: <span className="text-deep-charcoal font-medium">{worker.name}</span></span>}
        {workflow.schedule && <span className="text-koala-grey flex items-center gap-1"><Clock size={12} /> {workflow.schedule}</span>}
        {workflow.lastRun && <span className="text-koala-grey font-[family-name:var(--font-mono)] text-xs">Last run: {formatRelativeTime(workflow.lastRun)}</span>}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-divider-grey mb-6">
        {(['steps', 'runs', 'config'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer capitalize',
              activeTab === tab
                ? 'border-koala-lime text-deep-charcoal'
                : 'border-transparent text-koala-grey hover:text-deep-charcoal'
            )}
          >
            {tab === 'runs' ? 'Recent runs' : tab}
          </button>
        ))}
      </div>

      {/* Steps tab */}
      {activeTab === 'steps' && (
        <div className="workflow-track space-y-0 ml-1">
          {workflow.steps.map((step, i) => (
            <StepRow key={step.id} step={step} isLast={i === workflow.steps.length - 1} index={i} />
          ))}
        </div>
      )}

      {/* Runs tab */}
      {activeTab === 'runs' && (
        <div className="space-y-2">
          {runs.length === 0 ? (
            <EmptyState icon={<Play size={24} />} title="No runs yet" description="Run this workflow to see execution history." />
          ) : (
            runs.map(run => (
              <Card key={run.id} padding={false} className="hover:border-koala-grey/40 transition-colors">
                <div className="flex items-center gap-4 px-5 py-3">
                  <StatusBadge status={run.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-deep-charcoal">{run.name}</p>
                    <p className="text-xs text-koala-grey mt-0.5">
                      Started {formatDateTime(run.startedAt)}
                      {run.executionDuration && ` · Duration: ${formatDuration(run.executionDuration)}`}
                    </p>
                  </div>
                  {run.isSimulated && <span className="text-[10px] text-koala-grey bg-surface-muted px-1.5 py-0.5 rounded font-[family-name:var(--font-mono)]">simulated</span>}
                  {run.status === 'failed' && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      dispatch({ type: 'RETRY_RUN', runId: run.id });
                      showToast('Retry initiated', 'info');
                    }}>
                      <RefreshCw size={14} /> Retry
                    </Button>
                  )}
                </div>
                {run.output && (
                  <div className="px-5 pb-3 border-t border-divider-grey/50 mt-0">
                    <p className="text-xs text-koala-grey mt-2 whitespace-pre-wrap">{run.output}</p>
                  </div>
                )}
                {run.error && (
                  <div className="px-5 pb-3 border-t border-error-red/10">
                    <p className="text-xs text-error-red mt-2">{run.error}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Config tab */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-sm font-semibold mb-3 font-[family-name:var(--font-display)]">Configuration</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-koala-grey">Template</dt><dd className="font-medium">{state.templates.find(t => t.id === workflow.template)?.name || workflow.template}</dd></div>
              <div><dt className="text-xs text-koala-grey">Approval required</dt><dd className="font-medium">{workflow.approvalRequired ? 'Yes' : 'No'}</dd></div>
              {workflow.approvalRules.length > 0 && (
                <div><dt className="text-xs text-koala-grey">Approval rules</dt><dd>{workflow.approvalRules.map((r, i) => <p key={i} className="text-xs text-muted-olive">· {r}</p>)}</dd></div>
              )}
              {workflow.thresholds && Object.keys(workflow.thresholds).length > 0 && (
                <div><dt className="text-xs text-koala-grey">Thresholds</dt><dd>{Object.entries(workflow.thresholds).map(([k, v]) => <p key={k} className="text-xs font-[family-name:var(--font-mono)]">{k}: {v}%</p>)}</dd></div>
              )}
              <div><dt className="text-xs text-koala-grey">Created</dt><dd className="text-xs font-[family-name:var(--font-mono)]">{formatDateTime(workflow.createdAt)}</dd></div>
              <div><dt className="text-xs text-koala-grey">Last updated</dt><dd className="text-xs font-[family-name:var(--font-mono)]">{formatDateTime(workflow.updatedAt)}</dd></div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-3 font-[family-name:var(--font-display)]">Data sources</h3>
            {workflow.dataSourceIds.length === 0 ? (
              <p className="text-xs text-koala-grey">No data sources configured.</p>
            ) : (
              <div className="space-y-2">
                {workflow.dataSourceIds.map(dsId => {
                  const integration = state.integrations.find(i => i.id === dsId);
                  return integration ? (
                    <div key={dsId} className="flex items-center gap-2 text-sm">
                      <div className={cn('w-2 h-2 rounded-full', statusColor(integration.status).dot)} />
                      <span className="font-medium">{integration.name}</span>
                      <StatusBadge status={integration.status} />
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Run confirmation */}
      <ConfirmDialog
        open={showRunConfirm}
        onClose={() => setShowRunConfirm(false)}
        onConfirm={handleRun}
        title="Start simulated run"
        message={`This will start a simulated execution of "${workflow.name}". The run uses demo data and does not access real accounts or APIs.`}
        confirmLabel="Start run"
      />
    </div>
  );
}

function StepRow({ step, isLast, index }: { step: any; isLast: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = statusColor(step.status);

  return (
    <div className="relative pl-8 pb-6">
      {/* Connector line */}
      {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-divider-grey" />}

      {/* Step marker */}
      <div className={cn('absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10', step.status === 'completed' ? 'bg-success-green-bg' : step.status === 'failed' ? 'bg-error-red-bg' : step.status === 'needs_review' || step.status === 'running' ? 'bg-alert-amber-bg' : 'bg-surface border-2 border-divider-grey')}>
        {step.status === 'completed' ? <CheckCircle2 size={14} className="text-success-green" /> :
         step.status === 'failed' ? <XCircle size={14} className="text-error-red" /> :
         step.status === 'needs_review' ? <Clock size={14} className="text-alert-amber" /> :
         step.status === 'running' ? <Loader2 size={14} className="text-koala-lime-muted animate-spin" /> :
         <span className="text-[10px] text-koala-grey font-medium">{index + 1}</span>}
      </div>

      {/* Step content */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left cursor-pointer group">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-deep-charcoal group-hover:text-koala-lime-muted transition-colors">{step.name}</span>
          <StatusBadge status={step.status} />
          {(step.output || step.error) && <ChevronDown size={12} className={cn('text-koala-grey transition-transform', expanded && 'rotate-180')} />}
        </div>
        <p className="text-xs text-koala-grey mt-0.5">{step.description}</p>
        {step.startedAt && (
          <p className="text-[11px] text-koala-grey/60 mt-1 font-[family-name:var(--font-mono)]">
            {formatDateTime(step.startedAt)}
            {step.completedAt && ` → ${formatDateTime(step.completedAt)}`}
          </p>
        )}
      </button>

      {expanded && (step.output || step.error) && (
        <div className={cn('mt-2 p-3 rounded-[var(--radius-md)] text-xs animate-fade-in', step.error ? 'bg-error-red-bg text-error-red' : 'bg-surface-muted text-deep-charcoal')}>
          {step.output && <p className="whitespace-pre-wrap">{step.output}</p>}
          {step.error && <p className="whitespace-pre-wrap">{step.error}</p>}
        </div>
      )}
    </div>
  );
}
