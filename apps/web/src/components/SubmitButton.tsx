'use client';

import { useFormStatus } from 'react-dom';
import type { ReactElement, ReactNode } from 'react';

export function SubmitButton({
  children,
  pendingLabel,
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel: string;
  disabled?: boolean;
}): ReactElement {
  const { pending } = useFormStatus();

  return (
    <button className="button button--primary" type="submit" disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
}
