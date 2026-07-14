import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DashboardView } from './DashboardView';
import type { DashboardModel } from './dashboard-model';

describe('DashboardView', () => {
  it('renders the primary resume workspace and compact readiness', () => {
    const markup = renderToStaticMarkup(<DashboardView dashboard={dashboard()} />);

    expect(markup).toContain('Resume and AI review');
    expect(markup).toContain('resume.pdf');
    expect(markup).toContain('Text extraction');
    expect(markup).toContain('AI analysis');
    expect(markup).toContain('Candidate Readiness');
    expect(markup).toContain('Profile');
  });

  it('shows exactly one primary action', () => {
    const markup = renderToStaticMarkup(<DashboardView dashboard={dashboard()} />);

    expect(markup.match(/button--primary/g) ?? []).toHaveLength(1);
  });

  it('keeps future jobs and applications lightweight without fake content', () => {
    const markup = renderToStaticMarkup(<DashboardView dashboard={dashboard()} />);

    expect(markup).toContain('Jobs and Applications');
    expect(markup).toContain('No fake jobs are shown here.');
    expect(markup).toContain('Applications: Coming soon');
    expect(markup).not.toContain('Senior Backend Engineer');
  });

  it('hides the attention queue when there are no action items', () => {
    const markup = renderToStaticMarkup(<DashboardView dashboard={dashboard({ attentionItems: [] })} />);

    expect(markup).not.toContain('Attention Queue');
  });

  it('renders attention queue, AI activity, and recent progress', () => {
    const markup = renderToStaticMarkup(
      <DashboardView
        dashboard={dashboard({
          attentionItems: [
            {
              id: 'profile-incomplete',
              title: 'Profile needs verified career details',
              message: 'Missing profile information limits matching.',
              href: '/profile',
              priority: 50,
            },
          ],
          recentAiActivity: [
            {
              id: 'analysis-completed',
              title: 'Resume analysis completed',
              message: 'AI prepared structured resume findings for review.',
              occurredAt: '2026-07-14T10:00:00.000Z',
              href: '/profile#analysis-heading',
            },
          ],
        })}
      />,
    );

    expect(markup).toContain('Attention Queue');
    expect(markup).toContain('Resume analysis completed');
    expect(markup).toContain('Profile updated');
  });
});

function dashboard(overrides: Partial<DashboardModel> = {}): DashboardModel {
  return {
    nextBestAction: {
      id: 'ai-review-pending',
      title: 'Review AI resume findings',
      message: 'AI prepared resume insights for review.',
      label: 'Review AI findings',
      href: '/profile#analysis-heading',
    },
    workspace: {
      resume: {
        fileName: 'resume.pdf',
        version: 1,
        uploadedAt: '2026-07-14T10:00:00.000Z',
        statusLabel: 'Active resume ready',
      },
      extraction: {
        statusLabel: 'Completed',
        detail: 'Extraction completed with 120 words.',
      },
      analysis: {
        statusLabel: 'Completed',
        detail: 'AI findings are ready for review. Candidate profile was not modified.',
        proposalNotice: 'AI findings are proposals only. Your candidate profile has not been changed.',
        summary: {
          skillsCount: 2,
          experienceCount: 1,
          languagesCount: 1,
          certificationsCount: 0,
        },
      },
    },
    readiness: [
      {
        key: 'profile',
        label: 'Profile',
        status: 'ready',
        summary: 'Candidate foundation is ready.',
        actionLabel: 'Open Profile',
        href: '/profile',
      },
      {
        key: 'resume',
        label: 'Resume',
        status: 'ready',
        summary: 'Active resume: resume.pdf.',
        actionLabel: 'Open Resume',
        href: '/profile#resume-heading',
      },
      {
        key: 'extraction',
        label: 'Resume extraction',
        status: 'ready',
        summary: 'Extraction completed.',
        actionLabel: 'View extraction',
        href: '/profile#resume-heading',
      },
      {
        key: 'analysis',
        label: 'AI review',
        status: 'ready',
        summary: 'AI findings are ready for review.',
        actionLabel: 'Review AI findings',
        href: '/profile#analysis-heading',
      },
    ],
    attentionItems: [],
    recommendedJobs: {
      state: 'not-available',
      title: 'Job discovery is coming later',
      message: 'No fake jobs are shown here.',
      actionLabel: 'View profile readiness',
      href: '/profile',
    },
    applicationsSummary: {
      title: 'Applications are not active yet',
      message: 'Tracked applications will appear here later.',
    },
    recentAiActivity: [],
    recentProgress: [
      {
        id: 'profile-updated',
        title: 'Profile updated',
        message: 'Candidate profile foundation changed.',
        occurredAt: '2026-07-14T10:00:00.000Z',
        href: '/profile',
      },
    ],
    sectionErrors: {
      resumes: null,
      extraction: null,
      analysis: null,
    },
    sidebarAttentionCounts: {},
    ...overrides,
  };
}
