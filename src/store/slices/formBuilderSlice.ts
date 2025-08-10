import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import type { FormBuilderState } from '../types';
import type { FormField, FormSchema } from '../../types';

const initialState: FormBuilderState = {
  currentForm: null,
  isLoading: false,
  error: null,
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    // Create new form
    createNewForm: (state) => {
      const newForm: FormSchema = {
        id: nanoid(),
        name: 'Untitled Form',
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.currentForm = newForm;
    },

    // Set current form (used when loading from My Forms)
    setCurrentForm: (state, action: PayloadAction<FormSchema | null>) => {
      state.currentForm = action.payload;
    },

    // Update form name
    updateFormName: (state, action: PayloadAction<string>) => {
      if (state.currentForm) {
        state.currentForm.name = action.payload;
        state.currentForm.updatedAt = new Date().toISOString();
      }
    },

    // Add field
    addField: (state, action: PayloadAction<FormField>) => {
      if (state.currentForm) {
        state.currentForm.fields.push(action.payload);
        state.currentForm.updatedAt = new Date().toISOString();
      }
    },

    // Update field
    updateField: (state, action: PayloadAction<{ fieldId: string; field: Partial<FormField> }>) => {
      if (state.currentForm) {
        const fieldIndex = state.currentForm.fields.findIndex(f => f.id === action.payload.fieldId);
        if (fieldIndex !== -1) {
          state.currentForm.fields[fieldIndex] = {
            ...state.currentForm.fields[fieldIndex],
            ...action.payload.field,
          };
          state.currentForm.updatedAt = new Date().toISOString();
        }
      }
    },

    // Delete field
    deleteField: (state, action: PayloadAction<string>) => {
      if (state.currentForm) {
        state.currentForm.fields = state.currentForm.fields.filter(f => f.id !== action.payload);
        state.currentForm.updatedAt = new Date().toISOString();
      }
    },

    // Reorder fields
    reorderFields: (state, action: PayloadAction<FormField[]>) => {
      if (state.currentForm) {
        state.currentForm.fields = action.payload;
        state.currentForm.updatedAt = new Date().toISOString();
      }
    },

    // Clear current form
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  createNewForm,
  setCurrentForm,
  updateFormName,
  addField,
  updateField,
  deleteField,
  reorderFields,
  clearCurrentForm,
  setLoading,
  setError,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;