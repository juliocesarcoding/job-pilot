import React from 'react';
import type { ReactElement, ReactNode } from 'react';

export type DashboardNavItemName =
  | 'Dashboard'
  | 'Jobs'
  | 'Applications'
  | 'AI Review'
  | 'Profile'
  | 'Resume'
  | 'Settings';

export interface DashboardShellProps {
  activeItem: DashboardNavItemName;
  currentUserLabel: string;
  attentionCounts: Partial<Record<DashboardNavItemName, number>>;
  headerEyebrow?: string;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

const navItems: Array<{ name: DashboardNavItemName; href: string; disabled?: boolean; description: string }> = [
  { name: 'Dashboard', href: '/', description: 'Command center' },
  { name: 'Profile', href: '/profile', description: 'Candidate foundation' },
  { name: 'Resume', href: '/profile#resume-heading', description: 'Resume workflow' },
  { name: 'AI Review', href: '/profile#analysis-heading', description: 'Review AI findings' },
  { name: 'Jobs', href: '#jobs-coming-soon', disabled: true, description: 'Coming soon' },
  { name: 'Applications', href: '#applications-coming-soon', disabled: true, description: 'Coming soon' },
  { name: 'Settings', href: '#settings-coming-soon', disabled: true, description: 'Coming soon' },
];

export function DashboardShell({
  activeItem,
  currentUserLabel,
  attentionCounts,
  headerEyebrow = `Welcome back, ${currentUserLabel}`,
  title = 'Dashboard',
  description = 'Your job-search command center. Start with the highest-impact next step.',
  headerActions,
  children,
}: DashboardShellProps): ReactElement {
  const actions = headerActions ?? (
    <>
      <input aria-label="Future search" disabled placeholder="Search jobs, applications, reviews..." />
      <a className="button" href="/profile#resume-heading">
        Upload resume
      </a>
      <a className="button" href="/profile#analysis-heading">
        Open AI Review
      </a>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="app-brand">
          <strong>JobPilot</strong>
          <span>AI job-search copilot</span>
        </div>
        <nav>
          <ul className="sidebar-list">
            {navItems.map((item) => {
              const count = attentionCounts[item.name] ?? 0;
              const active = item.name === activeItem;

              return (
                <li key={item.name}>
                  {item.disabled ? (
                    <span className="sidebar-link sidebar-link--disabled" aria-disabled="true">
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.description}</small>
                      </span>
                      <span className="sidebar-badge sidebar-badge--muted">Soon</span>
                    </span>
                  ) : (
                    <a className={`sidebar-link${active ? ' sidebar-link--active' : ''}`} href={item.href}>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.description}</small>
                      </span>
                      {count > 0 ? <span className="sidebar-badge">{count}</span> : null}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="app-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{headerEyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {actions ? (
            <div className="dashboard-header-actions" aria-label="Page quick actions">
              {actions}
            </div>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
