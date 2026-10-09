'use client';

import React from 'react';
import { statusColor, statusLabel, cn } from '@/lib/utils';

export function StatusBadge({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const colors = statusColor(status);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      colors.bg, colors.text,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot, (status === 'running' || status === 'queued') && 'status-pulse')} />
      {statusLabel(status)}
    </span>
  );
}

export function Button({
  children, variant = 'primary', size = 'md', onClick, disabled, className, type = 'button',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-koala-lime text-deep-charcoal hover:bg-koala-lime-light active:bg-koala-lime-muted',
    secondary: 'bg-surface border border-divider-grey text-deep-charcoal hover:bg-surface-muted active:bg-divider-grey',
    ghost: 'text-koala-grey hover:text-deep-charcoal hover:bg-surface-muted',
    danger: 'bg-error-red text-white hover:bg-error-red/90',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-md)]',
    md: 'px-4 py-2 text-sm rounded-[var(--radius-md)]',
    lg: 'px-5 py-2.5 text-sm rounded-[var(--radius-lg)]',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}

export function Card({ children, className, padding = true }: { children: React.ReactNode; className?: string; padding?: boolean }) {
  return (
    <div className={cn(
      'bg-surface border border-divider-grey rounded-[var(--radius-lg)]',
      padding && 'p-5',
      'shadow-[var(--shadow-sm)]',
      className
    )}>
      {children}
    </div>
  );
}

export function PageHeader({
  title, description, actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-deep-charcoal font-[family-name:var(--font-display)]">{title}</h1>
        {description && <p className="mt-1 text-sm text-koala-grey max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function MetricCard({ label, value, change, status }: { label: string; value: string | number; change?: string; status?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-koala-grey font-medium uppercase tracking-wider">{label}</span>
      <span className={cn(
        'text-2xl font-semibold font-[family-name:var(--font-display)]',
        status ? statusColor(status).text : 'text-deep-charcoal'
      )}>{value}</span>
      {change && <span className="text-xs text-muted-olive">{change}</span>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-koala-grey">{icon}</div>}
      <h3 className="text-lg font-medium text-deep-charcoal font-[family-name:var(--font-display)]">{title}</h3>
      <p className="mt-1 text-sm text-koala-grey max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-deep-charcoal/40" onClick={onClose} />
      <div className={cn(
        'relative bg-surface rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] w-full animate-scale-in',
        widths[size],
        'max-h-[85vh] flex flex-col'
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider-grey">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">{title}</h2>
          <button onClick={onClose} className="p-1 text-koala-grey hover:text-deep-charcoal cursor-pointer" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'primary' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; variant?: 'primary' | 'danger';
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-koala-grey mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ToastContainer is implemented directly in AppShell for cleaner context binding

export function Select({ label, value, onChange, options, className }: {
  label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-koala-grey mb-1">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-surface border border-divider-grey rounded-[var(--radius-md)] text-deep-charcoal focus:outline-none focus:ring-2 focus:ring-koala-lime cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Input({ label, value, onChange, placeholder, type = 'text', required, className }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-koala-grey mb-1">{label}{required && <span className="text-error-red ml-0.5">*</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm bg-surface border border-divider-grey rounded-[var(--radius-md)] text-deep-charcoal placeholder:text-koala-grey focus:outline-none focus:ring-2 focus:ring-koala-lime"
      />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, className }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-koala-grey mb-1">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm bg-surface border border-divider-grey rounded-[var(--radius-md)] text-deep-charcoal placeholder:text-koala-grey focus:outline-none focus:ring-2 focus:ring-koala-lime resize-none"
      />
    </div>
  );
}

export function Toggle({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors shrink-0 mt-0.5 cursor-pointer',
          checked ? 'bg-koala-lime' : 'bg-divider-grey'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
          checked && 'translate-x-4'
        )} />
      </button>
      <div>
        <span className="text-sm font-medium text-deep-charcoal">{label}</span>
        {description && <p className="text-xs text-koala-grey mt-0.5">{description}</p>}
      </div>
    </label>
  );
}
