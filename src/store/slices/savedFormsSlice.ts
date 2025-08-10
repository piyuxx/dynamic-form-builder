import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SavedFormsState } from '../types';
import type { FormSchema } from '../../types';

const initialState: SavedFormsState = {
  forms: [],
  isLoading: false,
  error: null,
};

const savedFormsSlice = createSlice({
  name: 'savedForms',
  initialState,
  reducers: {
    // Load forms from localStorage
    loadSavedForms: (state, action: PayloadAction<FormSchema[]>) => {
      state.forms = action.payload;
    },

    // Save form
    saveForm: (state, action: PayloadAction<FormSchema>) => {
      const existingIndex = state.forms.findIndex(f => f.id === action.payload.id);
      if (existingIndex !== -1) {
        state.forms[existingIndex] = action.payload;
      } else {
        state.forms.push(action.payload);
      }
    },

    // Delete form
    deleteForm: (state, action: PayloadAction<string>) => {
      state.forms = state.forms.filter(f => f.id !== action.payload);
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
  loadSavedForms,
  saveForm,
  deleteForm,
  setLoading,
  setError,
} = savedFormsSlice.actions;

export default savedFormsSlice.reducer;