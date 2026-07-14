'use client';

import { useActionState, type ReactElement } from 'react';
import type { CandidateProfileResponse } from '@job-pilot/shared';
import { ActionMessage } from '../../components/ActionMessage';
import { SubmitButton } from '../../components/SubmitButton';
import { updateProfileAction, type FormActionState } from '../../app/profile/actions';
import { englishLevelOptions } from './options';

const initialState: FormActionState = { status: 'idle', message: null };

export function ProfileSection({ profile }: { profile: CandidateProfileResponse }): ReactElement {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <section className="panel" aria-labelledby="candidate-profile-heading">
      <div className="section-heading">
        <h2 id="candidate-profile-heading">Candidate Profile</h2>
        <p>Core information used by future job matching and application material workflows.</p>
      </div>

      <form action={formAction} className="profile-form">
        <details className="profile-form-section" open>
          <summary className="profile-form-section-heading">
            <h3>Career identity</h3>
            <p>The short version of who you are and what you are targeting.</p>
          </summary>
          <div className="form-grid">
            <TextField label="Headline" name="headline" defaultValue={profile.headline} />
            <TextField label="Desired role" name="desiredRole" defaultValue={profile.desiredRole} />
            <TextField label="Current location" name="currentLocation" defaultValue={profile.currentLocation} />
            <NumberField label="Years of experience" name="yearsOfExperience" defaultValue={profile.yearsOfExperience} />
            <label className="field field--wide">
              <span>Summary</span>
              <textarea name="summary" defaultValue={profile.summary ?? ''} rows={4} />
            </label>
          </div>
        </details>

        <details className="profile-form-section">
          <summary className="profile-form-section-heading">
            <h3>Search preferences</h3>
            <p>Constraints and preferences JobPilot should respect later.</p>
          </summary>
          <div className="form-grid">
            <TextField label="Country code" name="countryCode" defaultValue={profile.countryCode} maxLength={2} />
            <TextField label="Timezone" name="timezone" defaultValue={profile.timezone} />
            <SelectField
              label="English level"
              name="englishLevel"
              defaultValue={profile.englishLevel}
              options={englishLevelOptions}
            />
            <TextField
              label="Salary currency"
              name="desiredSalaryCurrency"
              defaultValue={profile.desiredSalaryCurrency}
              maxLength={3}
            />
            <NumberField label="Minimum desired salary" name="desiredSalaryMin" defaultValue={profile.desiredSalaryMin} />
            <NumberField label="Maximum desired salary" name="desiredSalaryMax" defaultValue={profile.desiredSalaryMax} />
            <div className="checkbox-grid field--wide">
              <CheckboxField label="Remote only" name="remoteOnly" defaultChecked={profile.remoteOnly} />
              <CheckboxField label="Open to contract" name="openToContract" defaultChecked={profile.openToContract} />
              <CheckboxField label="Open to full-time" name="openToFullTime" defaultChecked={profile.openToFullTime} />
              <CheckboxField
                label="Requires visa sponsorship"
                name="requiresVisaSponsorship"
                defaultChecked={profile.requiresVisaSponsorship}
              />
            </div>
          </div>
        </details>

        <details className="profile-form-section">
          <summary className="profile-form-section-heading">
            <h3>Public links</h3>
            <p>Useful references for future application workflows.</p>
          </summary>
          <div className="form-grid">
            <TextField label="LinkedIn URL" name="linkedinUrl" defaultValue={profile.linkedinUrl} />
            <TextField label="GitHub URL" name="githubUrl" defaultValue={profile.githubUrl} />
            <TextField label="Portfolio URL" name="portfolioUrl" defaultValue={profile.portfolioUrl} />
          </div>
        </details>

        <div className="form-actions">
          <SubmitButton pendingLabel="Saving profile...">Save profile</SubmitButton>
          <ActionMessage state={state} />
        </div>
      </form>
    </section>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  maxLength?: number;
}): ReactElement {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue ?? ''} maxLength={maxLength} />
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

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}): ReactElement {
  return (
    <label className="checkbox-field">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span>{label}</span>
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
