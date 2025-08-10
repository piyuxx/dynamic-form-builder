import type { FormSchema } from '../types';
import { STORAGE_KEYS } from './constants';

export const loadFormsFromStorage = (): FormSchema[] => {
  try {
    const savedForms = localStorage.getItem(STORAGE_KEYS.SAVED_FORMS);
    return savedForms ? JSON.parse(savedForms) : [];
  } catch (error) {
    console.error('Error loading forms from localStorage:', error);
    return [];
  }
};

export const saveFormsToStorage = (forms: FormSchema[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(forms));
    return true;
  } catch (error) {
    console.error('Error saving forms to localStorage:', error);
    return false;
  }
};

export const getFormById = (formId: string): FormSchema | null => {
  const forms = loadFormsFromStorage();
  return forms.find(form => form.id === formId) || null;
};

export const formExists = (formId: string): boolean => {
  return getFormById(formId) !== null;
};

export const deleteFormFromStorage = (formId: string): boolean => {
  try {
    const forms = loadFormsFromStorage();
    const updatedForms = forms.filter(form => form.id !== formId);
    return saveFormsToStorage(updatedForms);
  } catch (error) {
    console.error('Error deleting form from localStorage:', error);
    return false;
  }
};
