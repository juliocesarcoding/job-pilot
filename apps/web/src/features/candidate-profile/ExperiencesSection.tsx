'use client';

import { useActionState, useState, type ReactElement } from 'react';
import type { ExperienceResponse } from '@job-pilot/shared';
import { ActionMessage } from '../../components/ActionMessage';
import { SubmitButton } from '../../components/SubmitButton';
import {
  createExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
  type FormActionState,
} from '../../app/profile/actions';
import { employmentTypeOptions } from './options';

const initialState: FormActionState = { status: 'idle', message: null };

export function ExperiencesSection({ experiences }: { experiences: ExperienceResponse[] }): ReactElement {
  const sortedExperiences = [...experiences].sort(sortExperiences);
  const [createState, createAction] = useActionState(createExperienceAction, initialState);

  return (
    <section className="panel" aria-labelledby="experiences-heading">
      <div className="section-heading">
        <h2 id="experiences-heading">Experience</h2>
        <p>Manage active work history for the current candidate profile.</p>
      </div>

      {sortedExperiences.length === 0 ? (
        <p className="empty-state">No experience has been added yet.</p>
      ) : (
        <div className="bounded-record-list stack" aria-label="Saved experience entries">
          {sortedExperiences.map((experience) => (
            <ExperienceEditor key={experience.id} experience={experience} />
          ))}
        </div>
      )}

      <details className="subsection subsection-drawer">
        <summary>Add experience</summary>
        <ExperienceForm action={createAction} submitLabel="Add experience" pendingLabel="Adding experience..." />
        <ActionMessage state={createState} />
      </details>
    </section>
  );
}

function ExperienceEditor({ experience }: { experience: ExperienceResponse }): ReactElement {
  const [updateState, updateAction] = useActionState(updateExperienceAction, initialState);
  const [deleteState, deleteAction] = useActionState(deleteExperienceAction, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details className="record record--collapsible">
      <summary className="record-summary">
        <div>
          <h3>{experience.roleTitle}</h3>
          <p>
            {experience.companyName}
            {experience.location ? ` · ${experience.location}` : ''}
          </p>
        </div>
        <span className="status-pill">{experience.current ? 'Current' : 'Previous'}</span>
      </summary>

      <div className="record-body">
        <ExperienceForm
          action={updateAction}
          experience={experience}
          submitLabel="Update experience"
          pendingLabel="Updating experience..."
        />
        <ActionMessage state={updateState} />

        <form action={deleteAction} className="delete-row">
          <input type="hidden" name="experienceId" value={experience.id} />
          <label className="checkbox-field">
            <input type="checkbox" checked={confirmDelete} onChange={(event) => setConfirmDelete(event.target.checked)} />
            <span>Confirm deletion</span>
          </label>
          <SubmitButton pendingLabel="Deleting..." disabled={!confirmDelete}>
            Delete experience
          </SubmitButton>
          <ActionMessage state={deleteState} />
        </form>
      </div>
    </details>
  );
}

function ExperienceForm({
  action,
  experience,
  submitLabel,
  pendingLabel,
}: {
  action: (formData: FormData) => void;
  experience?: ExperienceResponse;
  submitLabel: string;
  pendingLabel: string;
}): ReactElement {
  const [current, setCurrent] = useState(experience?.current ?? false);

  return (
    <form action={action} className="form-grid compact-form">
      {experience ? <input type="hidden" name="experienceId" value={experience.id} /> : null}
      <TextField label="Company name" name="companyName" defaultValue={experience?.companyName ?? ''} required />
      <TextField label="Role title" name="roleTitle" defaultValue={experience?.roleTitle ?? ''} required />
      <label className="field">
        <span>Employment type</span>
        <select name="employmentType" defaultValue={experience?.employmentType ?? ''}>
          <option value="">Not set</option>
          {employmentTypeOptions.map((type) => (
            <option key={type} value={type}>
              {formatEnum(type)}
            </option>
          ))}
        </select>
      </label>
      <TextField label="Location" name="location" defaultValue={experience?.location ?? ''} />
      <label className="field">
        <span>Start date</span>
        <input name="startDate" type="date" defaultValue={dateOnly(experience?.startDate)} required />
      </label>
      <label className="field">
        <span>End date</span>
        <input name="endDate" type="date" defaultValue={dateOnly(experience?.endDate)} disabled={current} />
      </label>
      <div className="checkbox-grid field--wide">
        <label className="checkbox-field">
          <input name="remote" type="checkbox" defaultChecked={experience?.remote ?? false} />
          <span>Remote</span>
        </label>
        <label className="checkbox-field">
          <input
            name="current"
            type="checkbox"
            checked={current}
            onChange={(event) => setCurrent(event.target.checked)}
          />
          <span>Current role</span>
        </label>
      </div>
      <label className="field field--wide">
        <span>Description</span>
        <textarea name="description" defaultValue={experience?.description ?? ''} rows={3} />
      </label>
      <TextField
        label="Achievements"
        name="achievements"
        defaultValue={experience?.achievements.join(', ') ?? ''}
        wide
      />
      <TextField
        label="Technologies"
        name="technologies"
        defaultValue={experience?.technologies.join(', ') ?? ''}
        wide
      />
      <div className="form-actions field--wide">
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required = false,
  wide = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  wide?: boolean;
}): ReactElement {
  return (
    <label className={`field${wide ? ' field--wide' : ''}`}>
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} />
    </label>
  );
}

function sortExperiences(left: ExperienceResponse, right: ExperienceResponse): number {
  if (left.current !== right.current) {
    return left.current ? -1 : 1;
  }

  return right.startDate.localeCompare(left.startDate);
}

function dateOnly(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

function formatEnum(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .split('_')
    .map((part) => `${part.charAt(0).toLocaleUpperCase('en-US')}${part.slice(1)}`)
    .join(' ');
}
