import { configureStore } from '@reduxjs/toolkit';
import formBuilderReducer from './slices/formBuilderSlice';
import previewReducer from './slices/previewSlice';
import savedFormsReducer from './slices/savedFormsSlice';

export const store = configureStore({
  reducer: {
    formBuilder: formBuilderReducer,
    preview: previewReducer,
    savedForms: savedFormsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;