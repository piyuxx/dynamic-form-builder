import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Fab,
  CircularProgress,
  Backdrop,
  Grid
} from '@mui/material';

import { Add as AddIcon, Save as SaveIcon, Preview as PreviewIcon } from '@mui/icons-material';
import { nanoid } from 'nanoid';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createNewForm,
  addField,
  updateField,
  deleteField,
  updateFormName,
  reorderFields,
  clearCurrentForm,
} from '../store/slices/formBuilderSlice';
import { saveForm } from '../store/slices/savedFormsSlice';
import { FieldCard } from '../components/formBuilder/fieldCard';
import { FieldConfigPanel } from '../components/fieldConfig/fieldConfigPanel';
import type { FieldType, FormField } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

// Import your custom components
import { CustomDialog } from '../components/common/modal';
import { Notification } from '../components/common/notification';

// Types for saved forms
interface SavedForm {
  id: string;
  name: string;
  fields: FormField[];
}

// Memoized subcomponents
const EmptyState = memo(({ onAddField }: { onAddField: () => void }) => (
  <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa' }}>
    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
      No fields yet
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      Click "Add Field" to start building your form. You can drag fields to reorder them.
    </Typography>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onAddField}
    >
      Add Your First Field
    </Button>
  </Paper>
));

const HeaderSection = memo(({
  currentForm,
  onSaveForm
}: {
  currentForm: { name: string; fields: FormField[] };
  onSaveForm: () => void;
}) => (
  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Form Builder
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Create dynamic forms with drag-and-drop fields and custom validations
      </Typography>
    </Box>

    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={onSaveForm}
      disabled={currentForm.fields.length === 0}
      size="large"
    >
      Save Form
    </Button>
  </Box>
));

const ActionButtons = memo(({
  onAddField,
  onPreview,
  fieldsCount
}: {
  onAddField: () => void;
  onPreview: () => void;
  fieldsCount: number;
}) => (
  <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onAddField}
      size="large"
    >
      Add Field
    </Button>
    <Button
      variant="outlined"
      startIcon={<PreviewIcon />}
      onClick={onPreview}
      disabled={fieldsCount === 0}
    >
      Preview Form
    </Button>
  </Box>
));

export const CreatePage: React.FC = memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentForm } = useAppSelector((state) => state.formBuilder);

  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ fieldId: string; index: number } | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'success' });

  // Debug: Log state changes
  useEffect(() => {
    console.log('showSaveDialog changed:', showSaveDialog);
  }, [showSaveDialog]);

  useEffect(() => {
    console.log('notification changed:', notification);
  }, [notification]);

  // Computed values
  const showEmptyState = useMemo(() => !currentForm?.fields.length, [currentForm?.fields.length]);
  const availableFields = useMemo(() =>
    currentForm?.fields.filter(f => f.id !== selectedField?.id) || [],
    [currentForm?.fields, selectedField?.id]
  );

  // Initialize form if needed
  useEffect(() => {
    if (!currentForm) {
      dispatch(createNewForm());
    }
  }, [dispatch, currentForm]);

  // Keep selected field in sync with current form
  useEffect(() => {
    if (selectedField && currentForm) {
      const updatedField = currentForm.fields.find(f => f.id === selectedField.id);
      setSelectedField(updatedField || null);
    }
  }, [currentForm, selectedField]);

  // Clean up derived fields when parent fields are deleted
  useEffect(() => {
    if (!currentForm) return;

    const fieldsToUpdate: Array<{ fieldId: string; updates: Partial<FormField> }> = [];

    currentForm.fields.forEach(field => {
      if (field.isDerived && field.derivedConfig?.parentFieldIds) {
        const validParentIds = field.derivedConfig.parentFieldIds.filter(parentId =>
          currentForm.fields.some(f => f.id === parentId)
        );

        switch (true) {
          case validParentIds.length === 0:
            fieldsToUpdate.push({
              fieldId: field.id,
              updates: { isDerived: false, derivedConfig: undefined }
            });
            break;

          case validParentIds.length !== field.derivedConfig.parentFieldIds.length:
            fieldsToUpdate.push({
              fieldId: field.id,
              updates: {
                derivedConfig: {
                  ...field.derivedConfig,
                  parentFieldIds: validParentIds
                }
              }
            });
            break;
        }
      }
    });

    fieldsToUpdate.forEach(({ fieldId, updates }) => {
      dispatch(updateField({ fieldId, field: updates }));
    });
  }, [currentForm?.fields.length, dispatch, currentForm]);

  // Show notification helper
  const showNotificationHelper = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    console.log('showNotificationHelper called:', { message, type });
    setNotification({ show: true, message, type });
  }, []);

  // Field management
  const handleAddField = useCallback(() => {
    console.log('handleAddField called');
    const fieldCount = currentForm?.fields.length || 0;
    const newField: FormField = {
      id: nanoid(),
      type: 'text' as FieldType,
      label: `Field ${fieldCount + 1}`,
      required: false,
      defaultValue: '',
      validationRules: [],
      isDerived: false,
    };

    dispatch(addField(newField));
    setSelectedField(newField);
  }, [dispatch, currentForm?.fields.length]);

  const handleUpdateField = useCallback((updates: Partial<FormField>) => {
    if (!selectedField) return;
    dispatch(updateField({ fieldId: selectedField.id, field: updates }));
  }, [dispatch, selectedField]);

  const handleSaveField = useCallback(() => {
    if (!selectedField) return;
    showNotificationHelper('Field saved successfully!');
  }, [selectedField, showNotificationHelper]);

  const handleCancelField = useCallback(() => {
    if (!selectedField) return;
    setSelectedField(null);
  }, [selectedField]);

  const handleCloseField = useCallback(() => {
    setSelectedField(null);
  }, []);

  const handleEditField = useCallback((field: FormField) => {
    const latestField = currentForm?.fields.find(f => f.id === field.id);
    setSelectedField(latestField || field);
  }, [currentForm]);

  const handleDeleteField = useCallback((fieldId: string) => {
    dispatch(deleteField(fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    showNotificationHelper('Field deleted successfully!');
  }, [dispatch, selectedField?.id, showNotificationHelper]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      setDraggedItem(JSON.parse(data));
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (!draggedItem || !currentForm || draggedItem.index === dropIndex) return;

    const newFields = [...currentForm.fields];
    const draggedField = newFields[draggedItem.index];
    newFields.splice(draggedItem.index, 1);
    const insertIndex = draggedItem.index < dropIndex ? dropIndex - 1 : dropIndex;
    newFields.splice(insertIndex, 0, draggedField);

    dispatch(reorderFields(newFields));
    showNotificationHelper('Fields reordered successfully!');
  }, [draggedItem, currentForm, dispatch, showNotificationHelper]);

  const validateFormForSave = useCallback(() => {
    if (!currentForm) return { isValid: false, message: 'No form data' };
    if (!formName.trim()) return { isValid: false, message: 'Please enter a form name' };
    if (currentForm.fields.length === 0) return { isValid: false, message: 'Please add at least one field to the form' };
    return { isValid: true, message: '' };
  }, [currentForm, formName]);

  const handleSaveForm = useCallback(async () => {
    console.log('handleSaveForm called');
    const validation = validateFormForSave();

    if (!validation.isValid) {
      showNotificationHelper(validation.message, 'error');
      return;
    }

    setIsLoading(true);

    try {
      const updatedForm = { ...currentForm!, name: formName };
      dispatch(updateFormName(formName));
      dispatch(saveForm(updatedForm));

      const savedForms: SavedForm[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_FORMS) || '[]');
      const existingIndex = savedForms.findIndex((f: SavedForm) => f.id === updatedForm.id);

      if (existingIndex !== -1) {
        savedForms[existingIndex] = updatedForm;
      } else {
        savedForms.push(updatedForm);
      }

      localStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(savedForms));
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowSaveDialog(false);
      setFormName('');
      dispatch(clearCurrentForm());
      setSelectedField(null);

      showNotificationHelper('Form saved successfully! Starting with a new form.');
    } catch (error) {
      console.error('Error saving form:', error);
      showNotificationHelper('Error saving form to local storage', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentForm, formName, dispatch, validateFormForSave, showNotificationHelper]);

  // Save dialog handlers
  const handleOpenSaveDialog = useCallback(() => {
    console.log('Opening save dialog, currentForm:', currentForm);
    setFormName(currentForm?.name || '');
    setShowSaveDialog(true);
  }, [currentForm]);

  const handleCloseSaveDialog = useCallback(() => {
    console.log('Closing save dialog');
    setShowSaveDialog(false);
  }, []);

  if (!currentForm) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Loading Backdrop */}
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Saving form...</Typography>
        </Box>
      </Backdrop>

      {/* Header */}
      <HeaderSection
        currentForm={currentForm}
        onSaveForm={handleOpenSaveDialog}
      />

      <Grid container spacing={4}>
        {/* Left Panel - Fields */}
        <Grid size={{ xs: 12, md: selectedField ? 8 : 12 }}>
          <ActionButtons
            onAddField={handleAddField}
            onPreview={() => navigate('/preview')}
            fieldsCount={currentForm.fields.length}
          />
          
          {showEmptyState ? (
            <EmptyState onAddField={handleAddField} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentForm.fields.map((field, index) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={index}
                  isSelected={selectedField?.id === field.id}
                  isUnsaved={false}
                  onEdit={() => handleEditField(field)}
                  onDelete={() => handleDeleteField(field.id)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Right Panel - Field Configuration */}
        {selectedField && (
          <Grid size={{ xs: 12, md: 4 }}>
            <FieldConfigPanel
              key={selectedField.id}
              field={selectedField}
              availableFields={availableFields}
              onUpdate={handleUpdateField}
              onSave={handleSaveField}
              onCancel={handleCancelField}
              onClose={handleCloseField}
            />
          </Grid>
        )}
      </Grid>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        onClick={handleAddField}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Save Form Dialog using CustomDialog */}
      <CustomDialog
        open={showSaveDialog}
        title="Save Form"
        onClose={handleCloseSaveDialog}
        primaryAction={{
          label: 'Save Form',
          onClick: handleSaveForm,
          disabled: isLoading,
          loading: isLoading
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleCloseSaveDialog
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Form Name"
          fullWidth
          variant="outlined"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Enter a name for your form"
        />
      </CustomDialog>

      {/* Notification */}
      <Notification
        open={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </Box>
  );
});