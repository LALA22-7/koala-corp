'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, MetricCard, Button, EmptyState } from '@/components/ui';
import { formatRelativeTime, formatDateTime, cn, statusColor, eventTypeLabel } from '@/lib/utils';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Clock, PlayCircle,
  ExternalLink, RefreshCw, Eye, ChevronRight,
} from 'lucide-react';

export default function OverviewPage() {
  const { state, getClient, getWorker, getWorkflow } = useApp();

  // Derived metrics
  const activeWorkflows = state.workflows.filter(w => w.status === 'active').length;
  const completedRuns = state.taskRuns.filter(r => r.status === 'completed').length;
  const pendingApprovals = state.approvals.filter(a => a.status === 'pending').length;
  const failedRuns = state.taskRuns.filter(r => r.status === 'failed').length;
  const needsAttention = pendingApprovals + failedRuns;

  // Recent work items (latest task runs)
  const recentRuns = [...state.taskRuns]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // Attention items
  const attentionItems = [
    ...state.approvals
      .filter(a => a.status === 'pending')
      .map(a => ({
        id: a.id,
        type: 'approval' as const,
        title: a.proposedAction,
        client: getClient(a.clientId)?.name || '',
        description: a.reason,
        time: a.createdAt,
        href: '/approvals',
      })),
    ...state.taskRuns
      .filter(r => r.status === 'failed')
      .map(r => ({
        id: r.id,
        type: 'failure' as const,
        title: r.name,
        client: getClient(r.clientId)?.name || '',
        description: r.error || 'Execution failed',
        time: r.updatedAt,
        href: '/activity',
      })),
    ...state.integrations
      .filter(i => i.status === 'needs_attention')
      .map(i => ({
        id: i.id,
        type: 'integration' as const,
        title: `${i.name} needs reauthorization`,
        client: '',
        description: i.attentionMessage || 'Connection needs attention',
        time: i.lastSync || '',
        href: '/integrations',
      })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Recent activity
  const recentActivity = state.activityEvents.slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Operations overview"
        description="Your team's AI-assisted work, execution status, and decisions that need attention."
        actions={
          <Link href="/workflows">
            <Button variant="primary" size="md">
              <PlayCircle size={16} />
              View workflows
            </Button>
          </Link>
        }
      />

      {/* ── Key metrics ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <MetricCard label="Active workflows" value={activeWorkflows} />
        </Card>
        <Card>
          <MetricCard label="Runs completed" value={completedRuns} change="Last 7 days" />
        </Card>
        <Card>
          <MetricCard
            label="Awaiting review"
            value={pendingApprovals}
            status={pendingApprovals > 0 ? 'needs_review' : undefined}
          />
        </Card>
        <Card>
          <MetricCard
            label="Needs attention"
            value={needsAttention}
            status={needsAttention > 0 ? 'failed' : undefined}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Current work ────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">Current work</h2>
            <Link href="/activity" className="text-xs text-koala-grey hover:text-deep-charcoal flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider-grey">
                    <th className="text-left px-4 py-3 text-xs font-medium text-koala-grey uppercase tracking-wider">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-koala-grey uppercase tracking-wider hidden sm:table-cell">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-koala-grey uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-koala-grey uppercase tracking-wider hidden md:table-cell">Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-koala-grey uppercase tracking-wider hidden lg:table-cell">Updated</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run, i) => {
                    const client = getClient(run.clientId);
                    const worker = getWorker(run.workerId);
                    return (
                      <tr key={run.id} className={cn('border-b border-divider-grey/50 hover:bg-surface-muted/50 transition-colors', i === recentRuns.length - 1 && 'border-b-0')}>
                        <td className="px-4 py-3">
                          <span className="font-medium text-deep-charcoal">{run.name}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-koala-grey">{client?.name || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-koala-grey text-xs">{worker?.name || '—'}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-koala-grey text-xs font-[family-name:var(--font-mono)]">{formatRelativeTime(run.updatedAt)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/workflows/${run.workflowId}`}>
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Needs attention ─────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">Needs attention</h2>
            {attentionItems.length > 0 && (
              <span className="text-xs bg-alert-amber-bg text-alert-amber px-2 py-0.5 rounded-full font-medium">{attentionItems.length}</span>
            )}
          </div>
          {attentionItems.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle2 size={24} className="mx-auto text-success-green mb-2" />
                <p className="text-sm text-koala-grey">Everything is up to date</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {attentionItems.map(item => (
                <Link key={item.id} href={item.href}>
                  <Card className="hover:border-koala-grey/50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 mt-0.5',
                        item.type === 'approval' ? 'bg-alert-amber-bg' : item.type === 'failure' ? 'bg-error-red-bg' : 'bg-alert-amber-bg'
                      )}>
                        {item.type === 'approval' ? <Clock size={14} className="text-alert-amber" /> :
                         item.type === 'failure' ? <AlertTriangle size={14} className="text-error-red" /> :
                         <RefreshCw size={14} className="text-alert-amber" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-deep-charcoal group-hover:text-koala-lime-muted transition-colors truncate">{item.title}</p>
                        {item.client && <p className="text-xs text-koala-grey mt-0.5">{item.client}</p>}
                        <p className="text-xs text-koala-grey mt-1 line-clamp-2">{item.description}</p>
                        <p className="text-xs text-koala-grey/60 mt-1 font-[family-name:var(--font-mono)]">{formatRelativeTime(item.time)}</p>
                      </div>
                      <ChevronRight size={14} className="text-koala-grey/40 group-hover:text-koala-grey mt-1 shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent activity ────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">Recent activity</h2>
          <Link href="/activity" className="text-xs text-koala-grey hover:text-deep-charcoal flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <Card padding={false}>
          <div className="divide-y divide-divider-grey/50">
            {recentActivity.map(event => {
              const colors = statusColor(event.status || 'info');
              return (
                <div key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/30 transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-deep-charcoal truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-koala-grey font-[family-name:var(--font-mono)] shrink-0 hidden sm:block">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
