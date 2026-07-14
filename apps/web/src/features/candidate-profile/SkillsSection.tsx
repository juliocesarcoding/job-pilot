'use client';

import { useActionState, useState, type ReactElement } from 'react';
import type { CandidateSkillResponse } from '@job-pilot/shared';
import { ActionMessage } from '../../components/ActionMessage';
import { SubmitButton } from '../../components/SubmitButton';
import { createSkillAction, deleteSkillAction, updateSkillAction, type FormActionState } from '../../app/profile/actions';
import { proficiencyLevelOptions, skillCategoryOptions } from './options';

const initialState: FormActionState = { status: 'idle', message: null };

export function SkillsSection({ skills }: { skills: CandidateSkillResponse[] }): ReactElement {
  const [createState, createAction] = useActionState(createSkillAction, initialState);

  return (
    <section className="panel" aria-labelledby="skills-heading">
      <div className="section-heading">
        <h2 id="skills-heading">Skills</h2>
        <p>Manage candidate skill metadata without editing the global skill catalog.</p>
      </div>

      {skills.length === 0 ? (
        <p className="empty-state">No skills have been added yet.</p>
      ) : (
        <div className="bounded-record-list skill-grid" aria-label="Saved skills">
          {skills.map((skill) => (
            <SkillEditor key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      <details className="subsection subsection-drawer">
        <summary>Add skill</summary>
        <form action={createAction} className="form-grid compact-form">
          <TextField label="Skill name" name="name" defaultValue="" required />
          <SelectField label="Category" name="category" defaultValue={null} options={skillCategoryOptions} />
          <SelectField label="Proficiency" name="proficiencyLevel" defaultValue={null} options={proficiencyLevelOptions} />
          <NumberField label="Years of experience" name="yearsOfExperience" defaultValue={null} />
          <NumberField label="Last used year" name="lastUsedYear" defaultValue={null} />
          <label className="checkbox-field">
            <input name="isPrimary" type="checkbox" />
            <span>Primary skill</span>
          </label>
          <div className="form-actions field--wide">
            <SubmitButton pendingLabel="Adding skill...">Add skill</SubmitButton>
            <ActionMessage state={createState} />
          </div>
        </form>
      </details>
    </section>
  );
}

function SkillEditor({ skill }: { skill: CandidateSkillResponse }): ReactElement {
  const [updateState, updateAction] = useActionState(updateSkillAction, initialState);
  const [deleteState, deleteAction] = useActionState(deleteSkillAction, initialState);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <details className="record record--collapsible">
      <summary className="record-summary">
        <div>
          <h3>{skill.name}</h3>
          <p>
            {skill.category ? formatEnum(skill.category) : 'Uncategorized'}
            {skill.proficiencyLevel ? ` · ${formatEnum(skill.proficiencyLevel)}` : ''}
          </p>
        </div>
        {skill.isPrimary ? <span className="status-pill">Primary</span> : null}
      </summary>

      <div className="record-body">
        <form action={updateAction} className="form-grid compact-form">
          <input type="hidden" name="candidateSkillId" value={skill.id} />
          <SelectField
            label="Proficiency"
            name="proficiencyLevel"
            defaultValue={skill.proficiencyLevel}
            options={proficiencyLevelOptions}
          />
          <NumberField label="Years of experience" name="yearsOfExperience" defaultValue={skill.yearsOfExperience} />
          <NumberField label="Last used year" name="lastUsedYear" defaultValue={skill.lastUsedYear} />
          <label className="checkbox-field">
            <input name="isPrimary" type="checkbox" defaultChecked={skill.isPrimary} />
            <span>Primary skill</span>
          </label>
          <div className="form-actions field--wide">
            <SubmitButton pendingLabel="Updating skill...">Update skill</SubmitButton>
            <ActionMessage state={updateState} />
          </div>
        </form>

        <form action={deleteAction} className="delete-row">
          <input type="hidden" name="candidateSkillId" value={skill.id} />
          <label className="checkbox-field">
            <input type="checkbox" checked={confirmDelete} onChange={(event) => setConfirmDelete(event.target.checked)} />
            <span>Confirm deletion</span>
          </label>
          <SubmitButton pendingLabel="Deleting..." disabled={!confirmDelete}>
            Delete skill
          </SubmitButton>
          <ActionMessage state={deleteState} />
        </form>
      </div>
    </details>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}): ReactElement {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue} required={required} />
    </label>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number | null;
}): ReactElement {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type="number" min="0" step="1" defaultValue={defaultValue ?? ''} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  options: readonly string[];
}): ReactElement {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? ''}>
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatEnum(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatEnum(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .split('_')
    .map((part) => `${part.charAt(0).toLocaleUpperCase('en-US')}${part.slice(1)}`)
    .join(' ');
}
