import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PreviewState } from '../types';
import type { FieldValue, PreviewData, ValidationErrors } from '../../types';

const initialState: PreviewState = {
  previewData: {},
  validationErrors: {},
  isValidating: false,
};

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    // Set field value
    setFieldValue: (state, action: PayloadAction<{ fieldId: string; value: FieldValue }>) => {
      state.previewData[action.payload.fieldId] = action.payload.value;
    },

    // Set all preview data
    setPreviewData: (state, action: PayloadAction<PreviewData>) => {
      state.previewData = action.payload;
    },

    // Clear preview data
    clearPreviewData: (state) => {
      state.previewData = {};
      state.validationErrors = {};
    },

    // Set validation errors
    setValidationErrors: (state, action: PayloadAction<ValidationErrors>) => {
      state.validationErrors = action.payload;
    },

    // Clear validation errors
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },

    // Set validating state
    setValidating: (state, action: PayloadAction<boolean>) => {
      state.isValidating = action.payload;
    },
  },
});

export const {
  setFieldValue,
  setPreviewData,
  clearPreviewData,
  setValidationErrors,
  clearValidationErrors,
  setValidating,
} = previewSlice.actions;

export default previewSlice.reducer;