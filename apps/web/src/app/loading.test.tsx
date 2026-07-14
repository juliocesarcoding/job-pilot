import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DashboardLoading from './loading';

describe('DashboardLoading', () => {
  it('renders the dashboard loading state', () => {
    const markup = renderToStaticMarkup(<DashboardLoading />);

    expect(markup).toContain('Preparing your job-search command center.');
    expect(markup).toContain('Next Best Action');
    expect(markup).toContain('Candidate Readiness');
  });
});
