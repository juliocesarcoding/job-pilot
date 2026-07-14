'use server';

import { revalidatePath } from 'next/cache';
import { createJobPilotApiClient, getUserFacingApiError } from '../../lib/api';
import {
  experienceCreateInputFromFormData,
  experienceUpdateInputFromFormData,
  profileInputFromFormData,
  skillCreateInputFromFormData,
  skillUpdateInputFromFormData,
} from '../../features/candidate-profile/form-data';
import { validateSelectedResumeFile } from '../../features/resume/file-validation';

export interface FormActionState {
  status: 'idle' | 'success' | 'error';
  message: string | null;
}

const success = (message: string): FormActionState => ({ status: 'success', message });
const failure = (message: string): FormActionState => ({ status: 'error', message });

export async function updateProfileAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    await createJobPilotApiClient().updateCandidateProfile(profileInputFromFormData(formData));
    revalidatePath('/profile');
    return success('Profile saved.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function createExperienceAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  try {
    await createJobPilotApiClient().createExperience(experienceCreateInputFromFormData(formData));
    revalidatePath('/profile');
    return success('Experience added.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function updateExperienceAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = stringField(formData, 'experienceId');

  try {
    await createJobPilotApiClient().updateExperience(id, experienceUpdateInputFromFormData(formData));
    revalidatePath('/profile');
    return success('Experience updated.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function deleteExperienceAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const id = stringField(formData, 'experienceId');

  try {
    await createJobPilotApiClient().deleteExperience(id);
    revalidatePath('/profile');
    return success('Experience deleted.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function createSkillAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  try {
    await createJobPilotApiClient().createSkill(skillCreateInputFromFormData(formData));
    revalidatePath('/profile');
    return success('Skill added.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function updateSkillAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = stringField(formData, 'candidateSkillId');

  try {
    await createJobPilotApiClient().updateSkill(id, skillUpdateInputFromFormData(formData));
    revalidatePath('/profile');
    return success('Skill updated.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function deleteSkillAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = stringField(formData, 'candidateSkillId');

  try {
    await createJobPilotApiClient().deleteSkill(id);
    revalidatePath('/profile');
    return success('Skill deleted.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function uploadResumeAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const file = formData.get('file');
  const selectedFile = file instanceof File ? file : null;
  const validation = validateSelectedResumeFile(selectedFile);

  if (!validation.valid || !selectedFile) {
    return failure(validation.message ?? 'Choose a valid resume file.');
  }

  try {
    await createJobPilotApiClient().uploadResume(selectedFile);
    revalidatePath('/profile');
    return success('Resume uploaded.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function deleteResumeAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = stringField(formData, 'resumeId');

  try {
    await createJobPilotApiClient().deleteResume(id);
    revalidatePath('/profile');
    return success('Resume version deleted.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function extractResumeAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = stringField(formData, 'resumeId');

  try {
    await createJobPilotApiClient().extractResume(id);
    revalidatePath('/profile');
    return success('Resume text extracted.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

export async function analyzeResumeAction(_state: FormActionState, formData: FormData): Promise<FormActionState> {
  const id = stringField(formData, 'resumeId');

  try {
    await createJobPilotApiClient().analyzeResume(id);
    revalidatePath('/profile');
    return success('Resume analysis completed.');
  } catch (error: unknown) {
    return failure(getUserFacingApiError(error));
  }
}

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}
