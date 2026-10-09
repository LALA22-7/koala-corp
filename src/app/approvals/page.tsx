'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { StatusBadge, PageHeader, Card, MetricCard, Button, EmptyState, Modal, Textarea, Select } from '@/components/ui';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import {
  CheckCircle2, XCircle, AlertCircle, Clock, Shield, Check, X,
  RotateCcw, Bookmark, ChevronRight, Eye, FileText, ArrowRight, User
} from 'lucide-react';
import type { Approval, ApprovalStatus } from '@/lib/types';

export default function ApprovalsPage() {
  const { state, dispatch, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  // Decision modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetApprovalForReject, setTargetApprovalForReject] = useState<Approval | null>(null);

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [targetApprovalForRevision, setTargetApprovalForRevision] = useState<Approval | null>(null);

  const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
  const resolvedApprovals = state.approvals.filter(a => a.status !== 'pending');

  const displayedApprovals = activeTab === 'pending'
    ? pendingApprovals
    : activeTab === 'resolved'
    ? resolvedApprovals
    : state.approvals;

  const handleApprove = (approval: Approval) => {
    dispatch({
      type: 'APPROVE_ITEM',
      id: approval.id,
      decidedBy: 'Sarah Chen (Supervisor)',
    });
    showToast(`Approved: ${approval.proposedAction}. Task run resumed.`, 'success');
    if (selectedApproval?.id === approval.id) {
      setSelectedApproval(null);
    }
  };

  const openRejectDialog = (approval: Approval) => {
    setTargetApprovalForReject(approval);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!targetApprovalForReject) return;
    dispatch({
      type: 'REJECT_ITEM',
      id: targetApprovalForReject.id,
      reason: rejectReason.trim() || 'Declined by human supervisor',
      decidedBy: 'Sarah Chen (Supervisor)',
    });
    showToast(`Rejected: ${targetApprovalForReject.proposedAction}`, 'error');
    setRejectModalOpen(false);
    if (selectedApproval?.id === targetApprovalForReject.id) {
      setSelectedApproval(null);
    }
    setTargetApprovalForReject(null);
  };

  const openRevisionDialog = (approval: Approval) => {
    setTargetApprovalForRevision(approval);
    setRevisionNote('');
    setRevisionModalOpen(true);
  };

  const confirmRevision = () => {
    if (!targetApprovalForRevision) return;
    dispatch({
      type: 'REQUEST_REVISION',
      id: targetApprovalForRevision.id,
      note: revisionNote.trim() || 'Please re-verify parameters with client team',
    });
    showToast(`Revision requested for: ${targetApprovalForRevision.proposedAction}`, 'info');
    setRevisionModalOpen(false);
    if (selectedApproval?.id === targetApprovalForRevision.id) {
      setSelectedApproval(null);
    }
    setTargetApprovalForRevision(null);
  };

  const handleSaveForLater = (approval: Approval) => {
    dispatch({
      type: 'SAVE_FOR_LATER',
      id: approval.id,
    });
    showToast(`Snoozed approval: ${approval.proposedAction}`, 'info');
  };

  return (
    <div>
      <PageHeader
        title="Approvals & Oversight"
        description="Review high-consequence AI worker proposals before external execution or irreversible database changes."
      />

      {/* KPI Overview */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard
            label="Pending Action"
            value={pendingApprovals.length}
            status={pendingApprovals.length > 0 ? 'needs_review' : 'completed'}
            change={pendingApprovals.length > 0 ? 'Requires supervisor review' : 'All clear'}
          />
          <MetricCard
            label="Approved (Past 30d)"
            value={state.approvals.filter(a => a.status === 'approved').length}
            change="Passed directly to runtime"
          />
          <MetricCard
            label="Revisions Requested"
            value={state.approvals.filter(a => a.status === 'revision_requested').length}
            change="Returned to AI worker"
          />
          <MetricCard
            label="Rejected"
            value={state.approvals.filter(a => a.status === 'rejected').length}
            change="Blocked permanently"
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-divider-grey mb-6">
        {[
          { id: 'pending', label: 'Pending Review', count: pendingApprovals.length },
          { id: 'resolved', label: 'Resolved History', count: resolvedApprovals.length },
          { id: 'all', label: 'All Items', count: state.approvals.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-deep-charcoal text-deep-charcoal font-semibold'
                : 'border-transparent text-koala-grey hover:text-deep-charcoal'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              tab.id === 'pending' && tab.count > 0
                ? 'bg-alert-amber text-white font-bold'
                : 'bg-surface-muted text-koala-grey'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {displayedApprovals.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={40} className="text-success-green" />}
          title={activeTab === 'pending' ? 'Approvals queue is clear' : 'No records found'}
          description={
            activeTab === 'pending'
              ? 'All AI worker proposals have been reviewed. Workflows are operating within authorized autonomous bounds.'
              : 'There are no historical approval events matching this view.'
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedApprovals.map(approval => {
            const client = state.clients.find(c => c.id === approval.clientId);
            const worker = state.workers.find(w => w.id === approval.workerId);
            const workflow = state.workflows.find(w => w.id === approval.workflowId);

            return (
              <div
                key={approval.id}
                className="bg-surface border border-divider-grey rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] hover:border-koala-grey transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Summary */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={approval.status} />
                      {client && (
                        <span
                          className="text-xs px-2 py-0.5 rounded font-mono font-medium"
                          style={{ backgroundColor: `${client.color}15`, color: client.color }}
                        >
                          {client.name}
                        </span>
                      )}
                      {worker && (
                        <Link
                          href={`/workforce/${worker.id}`}
                          className="text-xs text-koala-grey hover:text-deep-charcoal flex items-center gap-1 font-mono"
                        >
                          <User size={12} />
                          <span>{worker.name}</span>
                        </Link>
                      )}
                      <span className="text-xs text-koala-grey">•</span>
                      <span className="text-xs text-koala-grey">{formatRelativeTime(approval.createdAt)}</span>
                    </div>

                    <h3 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">
                      {approval.proposedAction}
                    </h3>

                    <p className="text-xs text-koala-grey leading-relaxed">
                      {approval.description}
                    </p>

                    {/* Trigger reason alert */}
                    <div className="flex items-start gap-2 p-2.5 bg-alert-amber-bg/50 border border-alert-amber/30 rounded-[var(--radius-md)] text-xs text-alert-amber">
                      <Shield size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Review Requirement: </span>
                        <span>{approval.reason}</span>
                      </div>
                    </div>

                    {/* Resolution metadata if already decided */}
                    {approval.status !== 'pending' && approval.decidedAt && (
                      <div className="text-xs text-koala-grey pt-1">
                        Resolved by <span className="font-medium text-deep-charcoal">{approval.decidedBy}</span> on {formatDateTime(approval.decidedAt)}
                        {approval.rejectionReason && (
                          <span className="text-error-red block mt-0.5 font-medium">
                            Reason: {approval.rejectionReason}
                          </span>
                        )}
                        {approval.revisionNote && (
                          <span className="text-info-blue block mt-0.5 font-medium">
                            Revision Note: {approval.revisionNote}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-divider-grey">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedApproval(approval)}
                    >
                      <Eye size={14} />
                      <span>Inspect Payload</span>
                    </Button>

                    {approval.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(approval)}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openRevisionDialog(approval)}
                        >
                          <RotateCcw size={14} />
                          <span>Revise</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRejectDialog(approval)}
                          className="text-error-red hover:bg-error-red-bg"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Payload & Evidence Modal */}
      <Modal
        open={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title={selectedApproval ? selectedApproval.proposedAction : 'Approval Details'}
        size="lg"
      >
        {selectedApproval && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={selectedApproval.status} />
                <span className="text-xs text-koala-grey font-mono">ID: {selectedApproval.id}</span>
              </div>
              <p className="text-sm text-deep-charcoal leading-relaxed">{selectedApproval.description}</p>
            </div>

            <div className="p-3 bg-alert-amber-bg/40 border border-alert-amber/30 rounded-[var(--radius-md)] text-xs text-alert-amber">
              <span className="font-bold">Governance Rule: </span>
              <span>{selectedApproval.reason}</span>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase text-koala-grey mb-2">Collected Evidence & Context</h4>
              <div className="p-3 bg-warm-paper border border-divider-grey rounded-[var(--radius-md)] text-xs text-deep-charcoal leading-relaxed">
                {selectedApproval.evidence}
              </div>
            </div>

            {selectedApproval.proposedContent && (
              <div>
                <h4 className="text-xs font-mono uppercase text-koala-grey mb-2">Proposed Artifact / Execution Content</h4>
                <pre className="p-3 bg-deep-charcoal text-white rounded-[var(--radius-md)] text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedApproval.proposedContent}
                </pre>
              </div>
            )}

            {selectedApproval.status === 'pending' && (
              <div className="flex items-center justify-between pt-4 border-t border-divider-grey">
                <Button variant="ghost" onClick={() => handleSaveForLater(selectedApproval)}>
                  <Bookmark size={14} />
                  <span>Snooze for Later</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={() => { setSelectedApproval(null); openRejectDialog(selectedApproval); }}>
                    Reject Proposal
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setSelectedApproval(null); openRevisionDialog(selectedApproval); }}>
                    Request Revision
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => handleApprove(selectedApproval)}>
                    Authorize Execution
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Proposed Action"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-koala-grey">
            Provide a mandatory rationale for rejecting this proposal. The AI worker will log this decision in the workspace audit trail.
          </p>
          <Textarea
            label="Rejection Rationale"
            rows={3}
            placeholder="e.g. Account balance reconciliation still pending with client controller..."
            value={rejectReason}
            onChange={setRejectReason}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Revision Modal */}
      <Modal
        open={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        title="Request Worker Revision"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-koala-grey">
            Specify the corrections or updated parameters you want the AI worker to incorporate before re-submitting.
          </p>
          <Textarea
            label="Revision Instructions"
            rows={3}
            placeholder="e.g. Adjust grace period to 14 days and cc accounting@apexlogistics.com..."
            value={revisionNote}
            onChange={setRevisionNote}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmRevision}>
              Send Revision Mandate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
