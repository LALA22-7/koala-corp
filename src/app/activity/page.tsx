'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { PageHeader, Card, MetricCard, Button, EmptyState, Input, Select, Modal } from '@/components/ui';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, Info, Download,
  Filter, Search, User, GitBranch, Shield, ArrowUpRight, Code
} from 'lucide-react';
import type { ActivityEvent, EventType } from '@/lib/types';

export default function ActivityPage() {
  const { state, showToast } = useApp();
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);

  // Filter events
  const filteredEvents = state.activityEvents.filter(event => {
    if (eventTypeFilter !== 'all') {
      if (eventTypeFilter === 'errors' && event.status !== 'error') return false;
      if (eventTypeFilter === 'approvals' && !event.type.includes('approval') && !event.type.includes('revision')) return false;
      if (eventTypeFilter === 'workflows' && !event.type.includes('workflow') && !event.type.includes('step') && !event.type.includes('task')) return false;
      if (eventTypeFilter === 'integrations' && !event.type.includes('integration')) return false;
    }
    if (workerFilter !== 'all' && event.workerId !== workerFilter) return false;
    if (clientFilter !== 'all' && event.clientId !== clientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = event.description.toLowerCase().includes(q);
      const matchDetails = event.details ? event.details.toLowerCase().includes(q) : false;
      if (!matchDesc && !matchDetails) return false;
    }
    return true;
  });

  const errorCount = state.activityEvents.filter(e => e.status === 'error').length;
  const approvalCount = state.activityEvents.filter(e => e.type.includes('approval')).length;

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `koala-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit log exported successfully (JSON)', 'success');
  };

  const getEventIcon = (status?: string, type?: EventType) => {
    if (status === 'error') return <XCircle size={16} className="text-error-red" />;
    if (status === 'warning') return <AlertTriangle size={16} className="text-alert-amber" />;
    if (type?.includes('approval')) return <Shield size={16} className="text-alert-amber" />;
    return <CheckCircle2 size={16} className="text-success-green" />;
  };

  return (
    <div>
      <PageHeader
        title="Activity & Audit Trail"
        description="Immutable record of system decisions, automated step executions, data transfers, and human interventions."
        actions={
          <Button variant="secondary" onClick={handleExportLogs}>
            <Download size={15} />
            <span>Export Audit Trail</span>
          </Button>
        }
      />

      {/* KPI Overview */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard label="Total Events Logged" value={state.activityEvents.length} change="Live system stream" />
          <MetricCard label="Governance Decisions" value={approvalCount} change="Supervisor actions recorded" />
          <MetricCard label="System Exceptions" value={errorCount} status={errorCount > 0 ? 'failed' : 'completed'} change={errorCount > 0 ? 'Requires attention' : 'Clean stream'} />
          <MetricCard label="Integrations Active" value={state.integrations.filter(i => i.status === 'connected').length} change="Synchronizing data" />
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-divider-grey rounded-[var(--radius-lg)] p-4 mb-6 shadow-[var(--shadow-sm)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search activity descriptions..."
          />

          <Select
            value={eventTypeFilter}
            onChange={setEventTypeFilter}
            options={[
              { value: 'all', label: 'All Event Categories' },
              { value: 'approvals', label: 'Approvals & Governance' },
              { value: 'workflows', label: 'Workflow Runs & Steps' },
              { value: 'integrations', label: 'Integration Syncs' },
              { value: 'errors', label: 'System Errors & Warnings' },
            ]}
          />

          <Select
            value={workerFilter}
            onChange={setWorkerFilter}
            options={[
              { value: 'all', label: 'All AI Workers' },
              ...state.workers.map(w => ({ value: w.id, label: w.name })),
            ]}
          />

          <Select
            value={clientFilter}
            onChange={setClientFilter}
            options={[
              { value: 'all', label: 'All Clients / Tenancies' },
              ...state.clients.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>

        {(eventTypeFilter !== 'all' || workerFilter !== 'all' || clientFilter !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-divider-grey text-xs">
            <span className="text-koala-grey">Showing {filteredEvents.length} of {state.activityEvents.length} total events</span>
            <button
              onClick={() => {
                setEventTypeFilter('all');
                setWorkerFilter('all');
                setClientFilter('all');
                setSearchQuery('');
              }}
              className="text-deep-charcoal font-medium hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Activity size={40} />}
          title="No events match criteria"
          description="Adjust your search filters or clear them to view the full workforce activity feed."
        />
      ) : (
        <div className="bg-surface border border-divider-grey rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] divide-y divide-divider-grey">
          {filteredEvents.map(event => {
            const client = state.clients.find(c => c.id === event.clientId);
            const worker = state.workers.find(w => w.id === event.workerId);
            const workflow = state.workflows.find(w => w.id === event.workflowId);

            return (
              <div
                key={event.id}
                className="p-4 hover:bg-surface-muted/60 transition-colors flex items-start gap-3.5 group"
              >
                <div className="mt-0.5 p-1 rounded-full bg-surface-muted shrink-0">
                  {getEventIcon(event.status, event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-medium text-koala-grey bg-surface-muted px-1.5 py-0.5 rounded">
                      {event.type}
                    </span>

                    {client && (
                      <span
                        className="text-[11px] font-mono px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: `${client.color}15`, color: client.color }}
                      >
                        {client.name}
                      </span>
                    )}

                    {worker && (
                      <Link
                        href={`/workforce/${worker.id}`}
                        className="text-[11px] font-mono text-koala-grey hover:text-deep-charcoal transition-colors"
                      >
                        @{worker.name}
                      </Link>
                    )}

                    {workflow && (
                      <Link
                        href={`/workflows/${workflow.id}`}
                        className="text-[11px] font-mono text-koala-grey hover:text-deep-charcoal transition-colors flex items-center gap-1"
                      >
                        <GitBranch size={10} />
                        <span>{workflow.name}</span>
                      </Link>
                    )}

                    <span className="text-xs text-koala-grey ml-auto whitespace-nowrap" title={formatDateTime(event.timestamp)}>
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-deep-charcoal leading-snug">
                    {event.description}
                  </p>

                  {event.details && (
                    <p className="mt-1 text-xs text-koala-grey font-mono bg-warm-paper p-2 rounded border border-divider-grey/60 line-clamp-2">
                      {event.details}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedEvent(event)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-koala-grey hover:text-deep-charcoal cursor-pointer"
                  title="Inspect Event JSON"
                >
                  <Code size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw Event Modal */}
      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Audit Log Event Inspection"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-koala-grey pb-2 border-b border-divider-grey">
              <span>Event ID: {selectedEvent.id}</span>
              <span>{formatDateTime(selectedEvent.timestamp)}</span>
            </div>

            <p className="text-sm font-semibold text-deep-charcoal">{selectedEvent.description}</p>

            <div>
              <span className="block text-xs font-mono uppercase text-koala-grey mb-1">Raw Event Payload</span>
              <pre className="p-3 bg-deep-charcoal text-white rounded-[var(--radius-md)] text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
