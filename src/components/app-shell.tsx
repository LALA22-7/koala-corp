'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, GitBranch, Users, CheckSquare, Activity,
  Plug, BarChart3, Settings, Search, Bell, Menu, X, ChevronDown,
} from 'lucide-react';
import { KoalaLogo, KoalaWordmark } from './logo';
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
  const { state } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingApprovals = state.approvals.filter(a => a.status === 'pending').length;
  const attentionItems = state.taskRuns.filter(r => r.status === 'failed').length + pendingApprovals;

  return (
    <div className="flex h-screen overflow-hidden bg-warm-paper">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-[220px] bg-nav-bg flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
        mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <KoalaLogo size={28} />
          <KoalaWordmark className="text-white" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-koala-lime/15 text-koala-lime'
                    : 'text-nav-text hover:text-nav-text-active hover:bg-white/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
                {item.label === 'Approvals' && pendingApprovals > 0 && (
                  <span className="ml-auto text-xs bg-alert-amber text-white px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center">
                    {pendingApprovals}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[10px] text-nav-text/50 uppercase tracking-widest mb-2">Demo environment</div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted-olive text-white text-xs flex items-center justify-center font-medium">SC</div>
            <div className="text-xs">
              <div className="text-nav-text-active font-medium">Sarah Chen</div>
              <div className="text-nav-text/60">{state.settings.organization}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ── Main content ────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-warm-paper border-b border-divider-grey">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 text-koala-grey hover:text-deep-charcoal cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Workspace */}
            <div className="flex items-center gap-2 mr-auto">
              <span className="text-sm font-medium text-deep-charcoal">{state.settings.name}</span>
              <span className="text-xs text-koala-grey bg-surface-muted px-1.5 py-0.5 rounded font-mono">prototype</span>
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-koala-grey bg-surface border border-divider-grey rounded-[var(--radius-md)] hover:border-koala-grey transition-colors cursor-pointer min-w-[200px]"
              >
                <Search size={14} />
                <span>Search workflows, tasks...</span>
                <kbd className="ml-auto text-[10px] text-koala-grey/60 bg-surface-muted px-1 py-0.5 rounded font-mono">⌘K</kbd>
              </button>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 text-koala-grey hover:text-deep-charcoal cursor-pointer"
              aria-label={`${attentionItems} items need attention`}
            >
              <Bell size={18} />
              {attentionItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-alert-amber text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {attentionItems}
                </span>
              )}
            </button>

            {/* User */}
            <button className="flex items-center gap-2 cursor-pointer" aria-label="User menu">
              <div className="w-8 h-8 rounded-full bg-muted-olive text-white text-xs flex items-center justify-center font-medium">SC</div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 lg:px-8 py-6 max-w-[1280px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Toast container - rendered via portal concept */}
      <ToastContainer />
    </div>
  );
}

function ToastContainer() {
  const { state } = useApp();

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {state.toasts.map(toast => {
        const colors: Record<string, string> = {
          success: 'bg-success-green text-white',
          error: 'bg-error-red text-white',
          warning: 'bg-alert-amber text-white',
          info: 'bg-deep-charcoal text-white',
        };
        return (
          <div key={toast.id} className={cn('px-4 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] text-sm font-medium toast-enter max-w-xs', colors[toast.type])}>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
