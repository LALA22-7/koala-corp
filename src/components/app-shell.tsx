'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, GitBranch, Users, CheckSquare, Activity,
  Plug, BarChart3, Settings, Search, Bell, Menu, X, ChevronDown,
  ArrowRight, Sparkles, Shield, AlertTriangle, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { KoalaLogo } from './logo';
import { DarkModeToggle } from './theme-toggle';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: GitBranch },
  { href: '/workforce', label: 'Workforce', icon: Users },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
  const failedRuns = state.taskRuns.filter(r => r.status === 'failed');
  const attentionItemsCount = pendingApprovals.length + failedRuns.length;

  // Global Command-K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items for command palette
  const filteredWorkflows = searchQuery.trim()
    ? state.workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : state.workflows.slice(0, 3);

  const filteredWorkers = searchQuery.trim()
    ? state.workers.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.role.toLowerCase().includes(searchQuery.toLowerCase()))
    : state.workers.slice(0, 3);

  const filteredApprovals = searchQuery.trim()
    ? state.approvals.filter(a => a.proposedAction.toLowerCase().includes(searchQuery.toLowerCase()))
    : state.approvals.slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-warm-paper text-deep-charcoal transition-colors duration-200">
      {/* ── Collapsable Sidebar ─────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 bg-nav-bg border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out lg:static lg:z-auto shadow-xl lg:shadow-none',
        sidebarCollapsed ? 'w-[76px]' : 'w-[240px]',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo Header with Authentic Mascot & Clean Typography */}
        <div className={cn(
          'flex items-center border-b border-white/10 transition-all duration-300',
          sidebarCollapsed ? 'flex-col justify-center py-4 px-2 gap-2.5' : 'justify-between px-4.5 py-4'
        )}>
          <div className={cn(
            'flex items-center min-w-0 transition-all',
            sidebarCollapsed ? 'justify-center' : 'gap-3'
          )}>
            <KoalaLogo size={sidebarCollapsed ? 38 : 46} withGlow={true} />
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <div className="font-[family-name:var(--font-display)] font-bold text-base text-white tracking-tight leading-tight flex items-center">
                  <span>koala corp</span>
                  <span className="text-koala-lime font-black text-lg ml-0.5">.</span>
                </div>
                <span className="text-[10px] text-koala-lime/90 font-mono tracking-wider uppercase font-semibold mt-0.5 whitespace-nowrap">
                  AI Workforce OS
                </span>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-nav-text hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'flex items-center rounded-[var(--radius-md)] text-sm font-medium transition-all group relative',
                  sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-koala-lime/15 text-koala-lime font-semibold shadow-[0_0_15px_rgba(164,210,51,0.15)]'
                    : 'text-nav-text hover:text-nav-text-active hover:bg-white/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={cn('transition-transform group-hover:scale-110 shrink-0', isActive && 'text-koala-lime')}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.label === 'Approvals' && pendingApprovals.length > 0 && (
                  sidebarCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert-amber rounded-full ring-2 ring-nav-bg animate-pulse" />
                  ) : (
                    <span className="ml-auto text-xs bg-alert-amber text-white px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
                      {pendingApprovals.length}
                    </span>
                  )
                )}

                {/* Hover label tooltip when sidebar is collapsed */}
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-deep-charcoal border border-white/10 text-white text-xs font-semibold rounded-md shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Workspace & Dark Mode Switch */}
        <div className={cn(
          'p-3 border-t border-white/10 space-y-3 bg-black/15 transition-all',
          sidebarCollapsed ? 'flex flex-col items-center' : ''
        )}>
          <div className={cn(
            'flex items-center transition-all',
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          )}>
            {!sidebarCollapsed && (
              <span className="text-[11px] text-nav-text font-medium">Theme Mode</span>
            )}
            <DarkModeToggle showLabel={false} />
          </div>

          <div className={cn(
            'flex items-center gap-2.5 pt-2 border-t border-white/5 transition-all',
            sidebarCollapsed ? 'justify-center' : ''
          )}>
            <div
              className="w-8 h-8 rounded-full bg-muted-olive text-white text-xs flex items-center justify-center font-bold ring-2 ring-white/10 shrink-0"
              title={sidebarCollapsed ? "Sarah Chen (Supervisor)" : undefined}
            >
              SC
            </div>
            {!sidebarCollapsed && (
              <div className="text-xs min-w-0 flex-1 animate-fade-in">
                <div className="text-nav-text-active font-semibold truncate">Sarah Chen</div>
                <div className="text-nav-text/60 text-[11px] truncate">{state.settings.organization}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ── Main content area ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Frosted Glass Header */}
        <header className="sticky top-0 z-20 glass-header transition-colors duration-200">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-14">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 text-koala-grey hover:text-deep-charcoal cursor-pointer rounded-md hover:bg-surface-muted transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop expand button if sidebar is collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:flex p-1.5 text-koala-grey hover:text-deep-charcoal rounded-md hover:bg-surface-muted transition-colors cursor-pointer mr-1"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            {/* Workspace & Logo Badge */}
            <div className="flex items-center gap-3 mr-auto">
              <div className="flex items-center gap-2.5">
                <KoalaLogo size={34} animate={true} />
                <span className="text-sm font-bold tracking-tight text-deep-charcoal">{state.settings.name}</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-koala-grey bg-surface-muted px-2 py-0.5 rounded-full border border-divider-grey hidden sm:inline-block">
                v1.0 prototype
              </span>
            </div>

            {/* Command Palette Button (⌘K) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-koala-grey bg-surface/80 dark:bg-surface/50 border border-divider-grey rounded-[var(--radius-md)] hover:border-koala-grey hover:bg-surface transition-all cursor-pointer min-w-[240px] shadow-sm group"
              >
                <Search size={14} className="text-koala-grey group-hover:text-deep-charcoal transition-colors" />
                <span>Search workflows, workers, tasks...</span>
                <kbd className="ml-auto text-[10px] text-koala-grey bg-surface-muted border border-divider-grey px-1.5 py-0.5 rounded font-mono font-semibold">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Top Bar Dark Mode Switch */}
            <div className="hidden sm:flex items-center">
              <DarkModeToggle />
            </div>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-koala-grey hover:text-deep-charcoal cursor-pointer rounded-lg hover:bg-surface-muted transition-colors"
                aria-label={`${attentionItemsCount} items need attention`}
              >
                <Bell size={18} />
                {attentionItemsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-alert-amber text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-warm-paper animate-pulse">
                    {attentionItemsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-[var(--radius-lg)] p-4 shadow-2xl z-50 animate-scale-in">
                    <div className="flex items-center justify-between pb-3 border-b border-divider-grey mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-alert-amber" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-deep-charcoal font-mono">Attention Items</h4>
                      </div>
                      <span className="text-[11px] font-mono font-semibold bg-alert-amber-bg text-alert-amber px-2 py-0.5 rounded-full">
                        {attentionItemsCount} pending
                      </span>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {pendingApprovals.map(approval => (
                        <Link
                          key={approval.id}
                          href="/approvals"
                          onClick={() => setNotificationsOpen(false)}
                          className="block p-2.5 rounded-[var(--radius-md)] bg-surface hover:bg-surface-muted border border-divider-grey transition-colors text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-deep-charcoal">
                            <span className="truncate">{approval.proposedAction}</span>
                            <span className="text-[10px] text-alert-amber uppercase font-mono ml-2">Approval</span>
                          </div>
                          <p className="text-[11px] text-koala-grey mt-0.5 line-clamp-1">{approval.reason}</p>
                        </Link>
                      ))}

                      {failedRuns.map(run => (
                        <Link
                          key={run.id}
                          href={`/workflows/${run.workflowId}`}
                          onClick={() => setNotificationsOpen(false)}
                          className="block p-2.5 rounded-[var(--radius-md)] bg-surface hover:bg-surface-muted border border-divider-grey transition-colors text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-error-red">
                            <span className="truncate">{run.name}</span>
                            <span className="text-[10px] text-error-red uppercase font-mono ml-2">Failed Run</span>
                          </div>
                          <p className="text-[11px] text-koala-grey mt-0.5 line-clamp-1">{run.error || 'Execution halted'}</p>
                        </Link>
                      ))}

                      {attentionItemsCount === 0 && (
                        <p className="text-xs text-koala-grey text-center py-4">All operational systems clear.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="w-8 h-8 rounded-full bg-muted-olive text-white text-xs flex items-center justify-center font-bold ring-2 ring-divider-grey">
              SC
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-6 max-w-[1280px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* ── Command Palette (⌘K) Modal ─────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSearchOpen(false)} />
          <div className="relative glass-panel rounded-[var(--radius-xl)] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in border border-white/20">
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-divider-grey">
              <Search size={18} className="text-koala-grey shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search workflows, AI workers, approvals, or integrations..."
                className="w-full bg-transparent text-sm text-deep-charcoal placeholder:text-koala-grey focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-koala-grey hover:text-deep-charcoal rounded cursor-pointer text-xs font-mono bg-surface-muted px-1.5"
              >
                ESC
              </button>
            </div>

            {/* Results Categories */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {/* Workflows */}
              {filteredWorkflows.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase text-koala-grey font-bold px-2 mb-1.5 flex items-center gap-1.5">
                    <GitBranch size={11} />
                    <span>Workflows</span>
                  </div>
                  <div className="space-y-1">
                    {filteredWorkflows.map(w => (
                      <button
                        key={w.id}
                        onClick={() => { router.push(`/workflows/${w.id}`); setSearchOpen(false); }}
                        className="w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] hover:bg-surface-muted text-left text-xs text-deep-charcoal cursor-pointer group"
                      >
                        <span className="font-semibold">{w.name}</span>
                        <span className="text-[11px] text-koala-grey group-hover:text-deep-charcoal font-mono">Jump →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Workers */}
              {filteredWorkers.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase text-koala-grey font-bold px-2 mb-1.5 flex items-center gap-1.5">
                    <Users size={11} />
                    <span>AI Workforce</span>
                  </div>
                  <div className="space-y-1">
                    {filteredWorkers.map(w => (
                      <button
                        key={w.id}
                        onClick={() => { router.push(`/workforce/${w.id}`); setSearchOpen(false); }}
                        className="w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] hover:bg-surface-muted text-left text-xs text-deep-charcoal cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold">{w.name}</div>
                          <div className="text-[11px] text-koala-grey">{w.role}</div>
                        </div>
                        <span className="text-[11px] text-koala-grey group-hover:text-deep-charcoal font-mono">Profile →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Approvals */}
              {filteredApprovals.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase text-koala-grey font-bold px-2 mb-1.5 flex items-center gap-1.5">
                    <CheckSquare size={11} />
                    <span>Approvals Queue</span>
                  </div>
                  <div className="space-y-1">
                    {filteredApprovals.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { router.push('/approvals'); setSearchOpen(false); }}
                        className="w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] hover:bg-surface-muted text-left text-xs text-deep-charcoal cursor-pointer group"
                      >
                        <span className="truncate max-w-[340px] font-medium">{a.proposedAction}</span>
                        <span className="text-[10px] font-mono text-alert-amber uppercase">Review</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
}

function ToastContainer() {
  const { state } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5">
      {state.toasts.map(toast => {
        const colors: Record<string, string> = {
          success: 'bg-success-green/95 border-success-green/50 text-white shadow-[0_4px_20px_rgba(52,122,83,0.35)]',
          error: 'bg-error-red/95 border-error-red/50 text-white shadow-[0_4px_20px_rgba(188,70,70,0.35)]',
          warning: 'bg-alert-amber/95 border-alert-amber/50 text-white shadow-[0_4px_20px_rgba(166,106,24,0.35)]',
          info: 'bg-deep-charcoal/95 border-white/20 text-white shadow-[0_4px_20px_rgba(32,34,30,0.35)]',
        };
        return (
          <div
            key={toast.id}
            className={cn(
              'px-4 py-3 rounded-[var(--radius-lg)] border backdrop-blur-md text-xs font-semibold toast-enter max-w-sm tracking-tight',
              colors[toast.type]
            )}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
