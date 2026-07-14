import React from 'react';
import type { ReactElement } from 'react';
import { DashboardShell } from '../components/dashboard/DashboardShell';

export default function DashboardLoading(): ReactElement {
  return (
    <DashboardShell activeItem="Dashboard" currentUserLabel="there" attentionCounts={{}}>
      <main className="dashboard-main" aria-busy="true" aria-label="Dashboard loading">
        <section className="dashboard-hero dashboard-loading-block">
          <p className="eyebrow">Loading dashboard</p>
          <h1>Preparing your job-search command center.</h1>
          <p>Checking profile, resume, AI review, and available workflow status.</p>
        </section>
        <section className="dashboard-section dashboard-loading-block">
          <h2>Next Best Action</h2>
          <p>Loading the most useful next step.</p>
        </section>
        <section className="dashboard-section dashboard-loading-block">
          <h2>Candidate Readiness</h2>
          <p>Loading readiness state.</p>
        </section>
      </main>
    </DashboardShell>
  );
}
