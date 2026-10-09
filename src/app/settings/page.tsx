'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { PageHeader, Card, Button, Input, Select, Toggle, ConfirmDialog } from '@/components/ui';
import { DarkModeToggle } from '@/components/theme-toggle';
import { KoalaLogo, KoalaWordmark, KoalaFullBrand } from '@/components/logo';
import {
  Settings, Shield, Bell, Database, RefreshCw, CheckCircle2,
  Lock, AlertTriangle, Building, Users, Sparkles, Moon, Sun, Palette
} from 'lucide-react';

export default function SettingsPage() {
  const { state, dispatch, showToast } = useApp();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Form states initialized from store
  const [name, setName] = useState(state.settings.name);
  const [organization, setOrganization] = useState(state.settings.organization);
  const [approvalMode, setApprovalMode] = useState(state.settings.defaultApprovalMode);
  const [internalRequiresApproval, setInternalRequiresApproval] = useState(state.settings.internalTasksRequireApproval);
  const [externalRequiresApproval, setExternalRequiresApproval] = useState(state.settings.externalMessagesRequireApproval);
  const [campaignProhibited, setCampaignProhibited] = useState(state.settings.campaignChangesProhibited);
  const [notifications, setNotifications] = useState(state.settings.notificationsEnabled);
  const [emailDigest, setEmailDigest] = useState(state.settings.emailDigest);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: {
        name,
        organization,
        defaultApprovalMode: approvalMode as any,
        internalTasksRequireApproval: internalRequiresApproval,
        externalMessagesRequireApproval: externalRequiresApproval,
        campaignChangesProhibited: campaignProhibited,
        notificationsEnabled: notifications,
        emailDigest: emailDigest as any,
      },
    });
    showToast('Workspace settings saved successfully', 'success');
  };

  const handleResetDemoData = () => {
    dispatch({ type: 'RESET_DEMO' });
    showToast('Prototype state restored to baseline seed data', 'info');
  };

  return (
    <div>
      <PageHeader
        title="Settings & Workspace Policies"
        description="Configure workspace identities, theme appearance, autonomy thresholds, human-in-the-loop policies, and notification rules."
      />

      <div className="space-y-6 max-w-4xl">
        {/* Brand Identity & Theme Appearance Card */}
        <Card className="border-koala-lime/30 bg-surface/90">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-koala-lime" />
            <h2 className="text-base font-bold text-deep-charcoal font-[family-name:var(--font-display)]">
              Brand Identity & Theme Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Mascot Showcase with Float Animation */}
            <div className="p-4.5 rounded-[var(--radius-lg)] bg-surface-muted/60 border border-divider-grey flex items-center gap-5 shadow-sm">
              <div className="p-3 rounded-2xl bg-koala-lime/25 border-2 border-koala-lime/40 shadow-md shrink-0">
                <KoalaLogo size={82} animate={true} withGlow={true} />
              </div>
              <div>
                <KoalaWordmark />
                <p className="text-xs text-koala-grey mt-1">
                  Authentic Koala Corp. brand mascot with micro-float physics.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-koala-lime bg-deep-charcoal px-2 py-0.5 rounded-full">
                    <Sparkles size={10} /> Active Mascot
                  </span>
                  <span className="text-[10px] font-mono text-koala-grey">Glassmorphic UI v1.0</span>
                </div>
              </div>
            </div>

            {/* Dark Mode Switch Box */}
            <div className="p-4 rounded-[var(--radius-lg)] bg-surface-muted/60 border border-divider-grey flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-deep-charcoal">Theme Mode</div>
                <p className="text-xs text-koala-grey mt-0.5">
                  Toggle between high-contrast dark obsidian and warm paper light mode.
                </p>
              </div>
              <DarkModeToggle showLabel={false} />
            </div>
          </div>
        </Card>

        {/* Workspace Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Organization Profile */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Building size={18} className="text-koala-grey" />
              <h2 className="text-base font-bold text-deep-charcoal font-[family-name:var(--font-display)]">
                Workspace Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Workspace Name"
                value={name}
                onChange={setName}
              />
              <Input
                label="Parent Organization"
                value={organization}
                onChange={setOrganization}
              />
            </div>
          </Card>

          {/* Autonomous Guardrails & Policies */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-alert-amber" />
              <h2 className="text-base font-bold text-deep-charcoal font-[family-name:var(--font-display)]">
                Autonomy Boundaries & Human-in-the-Loop Policies
              </h2>
            </div>
            <p className="text-xs text-koala-grey mb-5">
              Strict policy bounds applied to all AI workers across this organization regardless of model prompt.
            </p>

            <div className="space-y-5">
              <Select
                label="Default Approval Policy"
                value={approvalMode}
                onChange={setApprovalMode as any}
                options={[
                  { value: 'draft_only', label: 'Draft Only — Human must review all external actions' },
                  { value: 'auto_approve', label: 'Auto-Approve — Only escalate if above risk threshold' },
                  { value: 'always_approve', label: 'Always Require Approval — Zero autonomous writes' },
                ]}
              />

              <div className="pt-2 border-t border-divider-grey space-y-4">
                <Toggle
                  label="External Communications Require Approval"
                  description="Any outbound email, webhook, or invoice notification to a client contact pauses for supervisor review."
                  checked={externalRequiresApproval}
                  onChange={setExternalRequiresApproval}
                />

                <Toggle
                  label="Internal System Tasks Require Approval"
                  description="Require supervisor confirmation before AI workers update internal CRM or accounting records."
                  checked={internalRequiresApproval}
                  onChange={setInternalRequiresApproval}
                />

                <Toggle
                  label="Campaign & Pricing Mutations Strictly Prohibited"
                  description="Completely forbid AI workers from changing active discount tiers, pricing rules, or advertising spend."
                  checked={campaignProhibited}
                  onChange={setCampaignProhibited}
                />
              </div>
            </div>
          </Card>

          {/* Notifications & Digest */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-koala-grey" />
              <h2 className="text-base font-bold text-deep-charcoal font-[family-name:var(--font-display)]">
                Supervisor Alerts & Digests
              </h2>
            </div>

            <div className="space-y-4">
              <Toggle
                label="In-App Real-Time Alerts"
                description="Notify when a task run encounters an exception or an approval request arrives."
                checked={notifications}
                onChange={setNotifications}
              />

              <Select
                label="Failure Digest Frequency"
                value={emailDigest}
                onChange={setEmailDigest as any}
                options={[
                  { value: 'off', label: 'Off — No email digests' },
                  { value: 'daily', label: 'Daily Briefing — 8:00 AM summary' },
                  { value: 'weekly', label: 'Weekly Executive Recap — Monday 9:00 AM' },
                ]}
              />
            </div>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button type="submit">
              Save Workspace Settings
            </Button>
          </div>
        </form>

        {/* Danger Zone / Reset Demo */}
        <div className="mt-12">
          <Card className="border-divider-grey bg-surface-muted/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-deep-charcoal font-[family-name:var(--font-display)]">
                  Reset Prototype State
                </h3>
                <p className="text-xs text-koala-grey mt-0.5">
                  Restore all seed workflows, workers, pending approvals, and execution logs to their initial baseline state.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setResetDialogOpen(true)}
                className="text-error-red hover:bg-error-red-bg"
              >
                <RefreshCw size={14} />
                <span>Reset State</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetDemoData}
        title="Reset Prototype Data?"
        message="This will reset all workflows, tasks, pending approvals, and integrations back to the initial sample dataset. Any changes made during this session will be replaced."
        confirmLabel="Reset Everything"
        variant="danger"
      />
    </div>
  );
}
