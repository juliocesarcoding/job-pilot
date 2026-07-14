import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ActionMessage } from './ActionMessage';

describe('ActionMessage', () => {
  it('renders validation and API error states accessibly', () => {
    const markup = renderToStaticMarkup(
      <ActionMessage state={{ status: 'error', message: 'This skill is already on the profile.' }} />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('This skill is already on the profile.');
  });
});
