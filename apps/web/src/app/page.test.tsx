import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DashboardShell } from '../components/dashboard/DashboardShell';

describe('Dashboard shell', () => {
  it('renders the Dashboard as the active home navigation item', () => {
    const markup = renderToStaticMarkup(
      <DashboardShell activeItem="Dashboard" currentUserLabel="Julio" attentionCounts={{ Dashboard: 1 }}>
        <main>Dashboard content</main>
      </DashboardShell>,
    );

    expect(markup).toContain('JobPilot');
    expect(markup).toContain('Dashboard');
    expect(markup).toContain('Welcome back, Julio');
    expect(markup).toContain('Search jobs, applications, reviews...');
  });

  it('does not link unavailable navigation items to Profile', () => {
    const markup = renderToStaticMarkup(
      <DashboardShell activeItem="Dashboard" currentUserLabel="Julio" attentionCounts={{}}>
        <main>Dashboard content</main>
      </DashboardShell>,
    );

    expect(markup).toContain('Jobs');
    expect(markup).toContain('Applications');
    expect(markup).toContain('aria-disabled="true"');
    expect(markup).not.toContain('href="/profile">Jobs');
    expect(markup).not.toContain('href="/profile">Applications');
  });

  it('renders an API unavailable state inside the dashboard shell', () => {
    const markup = renderToStaticMarkup(
      <DashboardShell activeItem="Dashboard" currentUserLabel="Julio" attentionCounts={{}}>
        <section className="dashboard-unavailable">
          <h1>Live job-search state could not be loaded.</h1>
          <p>The API is unavailable.</p>
        </section>
      </DashboardShell>,
    );

    expect(markup).toContain('Live job-search state could not be loaded.');
    expect(markup).toContain('The API is unavailable.');
  });
});
