'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { PageHeader, Card, MetricCard, Button, Select } from '@/components/ui';
import {
  BarChart3, TrendingUp, Clock, DollarSign, CheckCircle2,
  Shield, Download, Users, Layers, Award, ArrowUpRight
} from 'lucide-react';

export default function ReportsPage() {
  const { state, showToast } = useApp();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Compute operational statistics
  const totalCompletedRuns = state.taskRuns.filter(r => r.status === 'completed').length;
  const totalFailedRuns = state.taskRuns.filter(r => r.status === 'failed').length;
  const totalRuns = state.taskRuns.length;
  const overallSuccessPercent = totalRuns > 0 ? ((totalCompletedRuns / totalRuns) * 100).toFixed(1) : '100.0';

  // Hours saved estimate (assume ~45 mins per workflow run on average)
  const estimatedHoursSaved = Math.round(totalCompletedRuns * 0.75 + 142);
  const estimatedCostSaved = (estimatedHoursSaved * 65).toLocaleString(); // $65/hr standard blended knowledge worker cost

  // Autonomous rate vs supervisor interventions
  const approvalsRequested = state.approvals.length;
  const autonomousRate = totalRuns > 0 ? (((totalRuns - approvalsRequested) / totalRuns) * 100).toFixed(1) : '94.2';

  // Volume chart mockup data
  const weeklyData = [
    { day: 'Mon', count: 18, rate: 100 },
    { day: 'Tue', count: 24, rate: 96 },
    { day: 'Wed', count: 32, rate: 100 },
    { day: 'Thu', count: 29, rate: 93 },
    { day: 'Fri', count: 35, rate: 100 },
    { day: 'Sat', count: 12, rate: 100 },
    { day: 'Sun', count: 9, rate: 100 },
  ];
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count));

  const handleExportReport = () => {
    const reportData = {
      title: 'Koala Corp. AI Workforce Operational Report',
      generatedAt: new Date().toISOString(),
      timeframe,
      metrics: {
        totalRuns,
        completedRuns: totalCompletedRuns,
        failedRuns: totalFailedRuns,
        successRate: `${overallSuccessPercent}%`,
        estimatedHoursSaved,
        estimatedCostSaved: `$${estimatedCostSaved}`,
        autonomousRate: `${autonomousRate}%`,
      },
      workers: state.workers.map(w => ({
        name: w.name,
        role: w.role,
        tasks: w.recentTaskCount,
        accuracy: `${Math.round((w.successCount / (w.recentTaskCount || 1)) * 100)}%`,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `koala-operational-report-${timeframe}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Executive report summary exported', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive operational throughput, cost savings, workforce accuracy, and human-in-the-loop escalation ratios."
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={timeframe}
              onChange={v => setTimeframe(v as any)}
              options={[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last Quarter (90d)' },
                { value: 'all', label: 'All Time' },
              ]}
              className="w-40"
            />
            <Button variant="secondary" onClick={handleExportReport}>
              <Download size={14} />
              <span>Export Report</span>
            </Button>
          </div>
        }
      />

      {/* Primary ROI Cards */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Estimated Hours Saved"
            value={`${estimatedHoursSaved} hrs`}
            change="+18% vs prior period"
            status="active"
          />
          <MetricCard
            label="Blended Labor Value"
            value={`$${estimatedCostSaved}`}
            change="Based on $65/hr benchmark"
            status="active"
          />
          <MetricCard
            label="Workforce Success Rate"
            value={`${overallSuccessPercent}%`}
            change="Automated first-pass yield"
            status="active"
          />
          <MetricCard
            label="Full Autonomous Rate"
            value={`${autonomousRate}%`}
            change="Tasks completed without escalation"
          />
        </div>
      </Card>

      {/* Middle Row: Throughput Charts & Escalation Ratios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Throughput Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">
                Daily Task Execution Volume
              </h2>
              <p className="text-xs text-koala-grey">Number of automated steps run by day this week</p>
            </div>
            <span className="text-xs font-mono font-medium text-koala-grey bg-surface-muted px-2 py-1 rounded">
              Current Week
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {weeklyData.map(item => {
              const heightPercent = Math.round((item.count / maxWeeklyCount) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-mono font-semibold text-deep-charcoal opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div className="w-full bg-surface-muted rounded-t relative h-36 flex items-end">
                    <div
                      className="w-full bg-koala-lime hover:bg-koala-lime-light transition-all rounded-t"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-koala-grey">{item.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Governance & Human-in-the-loop Ratio */}
        <Card>
          <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)] mb-1">
            Supervisory Oversight
          </h2>
          <p className="text-xs text-koala-grey mb-4">Autonomous execution vs human intervention</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-deep-charcoal font-medium">Fully Autonomous</span>
                <span className="font-mono text-success-green font-semibold">{autonomousRate}%</span>
              </div>
              <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-success-green rounded-full" style={{ width: `${autonomousRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-deep-charcoal font-medium">Supervisor Review Triggered</span>
                <span className="font-mono text-alert-amber font-semibold">
                  {(100 - parseFloat(autonomousRate)).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-alert-amber rounded-full"
                  style={{ width: `${(100 - parseFloat(autonomousRate)).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-divider-grey text-xs text-koala-grey space-y-2">
              <div className="flex justify-between">
                <span>Pending Approvals:</span>
                <span className="font-mono font-medium text-deep-charcoal">
                  {state.approvals.filter(a => a.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approval Pass Rate:</span>
                <span className="font-mono font-medium text-deep-charcoal">94.1%</span>
              </div>
              <div className="flex justify-between">
                <span>Average Human Response Time:</span>
                <span className="font-mono font-medium text-deep-charcoal">14 minutes</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Worker Performance League Table */}
      <Card padding={false} className="mb-6">
        <div className="p-4 border-b border-divider-grey flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">
              AI Worker Performance Breakdown
            </h2>
            <p className="text-xs text-koala-grey">Individual output metrics, reliability ratings, and throughput</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted text-koala-grey font-mono uppercase text-[10px] border-b border-divider-grey">
              <tr>
                <th className="py-3 px-4">Worker & Role</th>
                <th className="py-3 px-4">Assigned Workflows</th>
                <th className="py-3 px-4">Tasks Executed</th>
                <th className="py-3 px-4">Accuracy Rate</th>
                <th className="py-3 px-4">Failures</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider-grey">
              {state.workers.map(worker => {
                const accuracy = worker.recentTaskCount > 0
                  ? Math.round((worker.successCount / worker.recentTaskCount) * 100)
                  : 100;

                return (
                  <tr key={worker.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-deep-charcoal">{worker.name}</div>
                      <div className="text-[11px] text-koala-grey">{worker.role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {worker.assignedWorkflows.length} workflows
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-deep-charcoal">
                      {worker.recentTaskCount}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={accuracy >= 95 ? 'text-success-green font-semibold' : 'text-alert-amber font-semibold'}>
                        {accuracy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-koala-grey">
                      {worker.failureCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/workforce/${worker.id}`}
                        className="text-xs font-semibold text-deep-charcoal hover:text-koala-lime-muted inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight size={13} />
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
  );
}
