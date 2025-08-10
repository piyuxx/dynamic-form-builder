import type { FormSchema, PreviewData, ValidationErrors } from "../types";

// Root State Interface
export interface RootState {
  formBuilder: FormBuilderState;
  preview: PreviewState;
  savedForms: SavedFormsState;
}

// Form Builder State
export interface FormBuilderState {
  currentForm: FormSchema | null;
  isLoading: boolean;
  error: string | null;
}

// Preview State
export interface PreviewState {
  previewData: PreviewData;
  validationErrors: ValidationErrors;
  isValidating: boolean;
}

// Saved Forms State
export interface SavedFormsState {
  forms: FormSchema[];
  isLoading: boolean;
  error: string | null;
}