import React from 'react';
import type { ReactElement } from 'react';
import type { FormActionState } from '../app/profile/actions';

export function ActionMessage({ state }: { state: FormActionState }): ReactElement | null {
  if (state.status === 'idle' || !state.message) {
    return null;
  }

  return (
    <p className={`action-message action-message--${state.status}`} role={state.status === 'error' ? 'alert' : 'status'}>
      {state.message}
    </p>
  );
}
