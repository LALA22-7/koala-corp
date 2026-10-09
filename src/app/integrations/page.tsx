'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, MetricCard, Button, EmptyState, Modal, Input } from '@/components/ui';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import {
  Plug, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink,
  Shield, Layers, Info, Check, X, ArrowRight, Key
} from 'lucide-react';
import type { Integration, IntegrationStatus } from '@/lib/types';

export default function IntegrationsPage() {
  const { state, dispatch, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'connected' | 'available' | 'attention'>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [targetForConnect, setTargetForConnect] = useState<Integration | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const connectedCount = state.integrations.filter(i => i.status === 'connected').length;
  const attentionCount = state.integrations.filter(i => i.status === 'needs_attention').length;
  const totalCount = state.integrations.length;

  const filteredIntegrations = state.integrations.filter(i => {
    if (filter === 'connected') return i.status === 'connected';
    if (filter === 'available') return i.status === 'not_connected';
    if (filter === 'attention') return i.status === 'needs_attention';
    return true;
  });

  const handleToggleConnection = (integration: Integration) => {
    if (integration.status === 'connected' || integration.status === 'needs_attention') {
      dispatch({ type: 'DISCONNECT_INTEGRATION', id: integration.id });
      showToast(`Disconnected ${integration.name}`, 'info');
      if (selectedIntegration?.id === integration.id) {
        setSelectedIntegration(prev => prev ? { ...prev, status: 'not_connected' } : null);
      }
    } else {
      setTargetForConnect(integration);
      setApiKeyInput('');
      setConnectModalOpen(true);
    }
  };

  const confirmConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetForConnect) return;
    dispatch({ type: 'CONNECT_INTEGRATION', id: targetForConnect.id });
    showToast(`Connected ${targetForConnect.name} successfully`, 'success');
    setConnectModalOpen(false);
    if (selectedIntegration?.id === targetForConnect.id) {
      setSelectedIntegration(prev => prev ? { ...prev, status: 'connected', lastSync: new Date().toISOString() } : null);
    }
    setTargetForConnect(null);
  };

  return (
    <div>
      <PageHeader
        title="Integrations Directory"
        description="External systems, CRMs, communication channels, and ledger sources hooked into the Koala autonomous workforce."
      />

      {/* KPI Overview */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard label="Active Connections" value={connectedCount} change={`${totalCount} total catalog`} />
          <MetricCard label="Needs Attention" value={attentionCount} status={attentionCount > 0 ? 'needs_attention' : 'completed'} change={attentionCount > 0 ? 'Auth renewal required' : 'All channels verified'} />
          <MetricCard label="Dependent Workflows" value={state.workflows.length} change="Relying on live sync" />
          <MetricCard label="API Gateway Health" value="100.0%" change="Zero rate-limit throttles" />
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-divider-grey mb-6">
        {[
          { id: 'all', label: 'All Integrations', count: totalCount },
          { id: 'connected', label: 'Connected', count: connectedCount },
          { id: 'attention', label: 'Needs Attention', count: attentionCount },
          { id: 'available', label: 'Available Catalog', count: totalCount - connectedCount - attentionCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              filter === tab.id
                ? 'border-deep-charcoal text-deep-charcoal font-semibold'
                : 'border-transparent text-koala-grey hover:text-deep-charcoal'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              tab.id === 'attention' && tab.count > 0
                ? 'bg-alert-amber text-white font-bold'
                : 'bg-surface-muted text-koala-grey'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIntegrations.map(integration => {
          const isConnected = integration.status === 'connected';
          const needsAttention = integration.status === 'needs_attention';
          const dependentWorkflows = state.workflows.filter(w =>
            integration.dependentWorkflows.includes(w.id) || w.dataSourceIds.includes(integration.id)
          );

          return (
            <div
              key={integration.id}
              className="bg-surface border border-divider-grey rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] hover:border-koala-grey transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-muted border border-divider-grey flex items-center justify-center font-bold text-sm text-deep-charcoal">
                      {integration.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-deep-charcoal text-base font-[family-name:var(--font-display)]">
                        {integration.name}
                      </h3>
                      <span className="text-xs text-koala-grey font-mono">{integration.category}</span>
                    </div>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>

                {/* Description */}
                <p className="text-xs text-koala-grey leading-relaxed mb-4">
                  {integration.description}
                </p>

                {/* Attention Warning */}
                {needsAttention && integration.attentionMessage && (
                  <div className="mb-4 p-2.5 bg-alert-amber-bg border border-alert-amber/40 rounded-[var(--radius-md)] text-xs text-alert-amber flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{integration.attentionMessage}</span>
                  </div>
                )}

                {/* Data Categories & Last Sync */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {integration.dataCategories.map(cat => (
                      <span key={cat} className="text-[10px] bg-warm-paper border border-divider-grey px-1.5 py-0.5 rounded text-deep-charcoal font-mono">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {isConnected && integration.lastSync && (
                    <div className="text-[11px] text-koala-grey flex items-center gap-1.5 pt-1">
                      <RefreshCw size={11} className="text-success-green" />
                      <span>Last sync: {formatRelativeTime(integration.lastSync)}</span>
                    </div>
                  )}
                </div>

                {/* Dependent Workflows */}
                {dependentWorkflows.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-divider-grey/60 text-xs">
                    <span className="text-koala-grey text-[11px] font-mono uppercase block mb-1">
                      Powering {dependentWorkflows.length} Workflows:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dependentWorkflows.slice(0, 2).map(wf => (
                        <Link
                          key={wf.id}
                          href={`/workflows/${wf.id}`}
                          className="text-[11px] bg-surface-muted px-2 py-0.5 rounded text-deep-charcoal hover:bg-divider-grey transition-colors truncate max-w-[200px]"
                        >
                          {wf.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-divider-grey flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <Info size={14} />
                  <span>Configure</span>
                </Button>

                <Button
                  variant={isConnected || needsAttention ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleConnection(integration)}
                >
                  {isConnected || needsAttention ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Details / Config Modal */}
      <Modal
        open={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        title={selectedIntegration ? `${selectedIntegration.name} Configuration` : 'Integration'}
        size="md"
      >
        {selectedIntegration && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-koala-grey font-mono uppercase">Category: {selectedIntegration.category}</span>
                <p className="text-sm font-medium text-deep-charcoal mt-1">{selectedIntegration.description}</p>
              </div>
              <StatusBadge status={selectedIntegration.status} />
            </div>

            {selectedIntegration.attentionMessage && (
              <div className="p-3 bg-alert-amber-bg border border-alert-amber/40 rounded-[var(--radius-md)] text-xs text-alert-amber flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Attention Needed: </span>
                  <span>{selectedIntegration.attentionMessage}</span>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-mono uppercase text-koala-grey mb-1.5">Authorized Data Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedIntegration.dataCategories.map(cat => (
                  <span key={cat} className="text-xs bg-warm-paper border border-divider-grey px-2 py-1 rounded text-deep-charcoal font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {selectedIntegration.setupNotes && (
              <div>
                <h4 className="text-xs font-mono uppercase text-koala-grey mb-1">Architecture & Ingestion Notes</h4>
                <p className="text-xs text-koala-grey bg-warm-paper p-3 rounded border border-divider-grey leading-relaxed">
                  {selectedIntegration.setupNotes}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-divider-grey">
              <Button
                variant={selectedIntegration.status === 'connected' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  handleToggleConnection(selectedIntegration);
                }}
              >
                {selectedIntegration.status === 'connected' ? 'Disconnect Provider' : 'Authorize Provider'}
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setSelectedIntegration(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Connect Integration Modal */}
      <Modal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title={targetForConnect ? `Authorize ${targetForConnect.name}` : 'Connect Integration'}
        size="sm"
      >
        <form onSubmit={confirmConnect} className="space-y-4">
          <p className="text-xs text-koala-grey leading-relaxed">
            Connect {targetForConnect?.name} to enable automated ingestion and action execution for authorized workflows.
          </p>

          <Input
            label="API Key or OAuth Grant Token"
            placeholder="live_key_••••••••••••••••"
            value={apiKeyInput}
            onChange={setApiKeyInput}
          />

          <div className="p-3 bg-warm-paper rounded text-xs text-koala-grey border border-divider-grey/60 space-y-1">
            <div className="flex items-center gap-1 font-medium text-deep-charcoal">
              <Shield size={12} className="text-success-green" />
              <span>Zero-Knowledge Credential Vault:</span>
            </div>
            <p className="text-[11px]">API tokens are encrypted at rest with AES-256 and never logged or exposed to client models.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Verify & Connect
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
