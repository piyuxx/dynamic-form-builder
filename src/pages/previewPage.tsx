import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentForm } from '../store/slices/formBuilderSlice';
import { FormFieldRenderer } from '../components/preview/formRenderer';
import { validateField } from '../utils/validation';
import { getFormById } from '../utils/formStorage';
import { Notification } from '../components/common/notification';
import type { PreviewData, ValidationErrors, FieldValue, FormField } from '../types';
import { calculateDerivedValue } from '../utils/derivedFields';

// Types
interface CurrentForm {
  id: string;
  name: string;
  fields: FormField[];
}

interface FormStats {
  total: number;
  filled: number;
  errors: number;
}

// Memoized subcomponents
const FormNotFoundState = memo(() => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <WarningIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="error" gutterBottom>
        Form Not Found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The form you're trying to preview doesn't exist or has been deleted.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/myforms')}
        >
          Back to My Forms
        </Button>
        <Button 
          variant="contained" 
          onClick={() => navigate('/create')}
          startIcon={<EditIcon />}
        >
          Create New Form
        </Button>
      </Box>
    </Box>
  );
});

const NoFormState = memo(() => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No form to preview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create a form first to see the preview
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/create')}
        startIcon={<EditIcon />}
      >
        Create Form
      </Button>
    </Box>
  );
});

const EmptyFormState = memo(() => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Form has no fields
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add some fields to your form to see the preview
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/create')}
        startIcon={<EditIcon />}
      >
        Add Fields
      </Button>
    </Box>
  );
});

const FormHeader = memo(({ currentForm }: { currentForm: CurrentForm }) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Form Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interact with "{currentForm.name || 'Untitled Form'}" as an end user would
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/myforms')}
          startIcon={<ArrowBackIcon />}
        >
          My Forms
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/create')}
          startIcon={<EditIcon />}
        >
          Edit Form
        </Button>
      </Box>
    </Box>
  );
});

const FormStats = memo(({ formStats, currentForm }: { 
  formStats: FormStats; 
  currentForm: CurrentForm; 
}) => (
  <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Chip 
      label={`${formStats.filled}/${formStats.total} fields filled`} 
      color="primary" 
      variant="outlined" 
    />
    {formStats.errors > 0 && (
      <Chip 
        label={`${formStats.errors} validation error(s)`} 
        color="error" 
        variant="outlined" 
      />
    )}
    {currentForm.fields.filter((f: FormField) => f.isDerived).length > 0 && (
      <Chip 
        label={`${currentForm.fields.filter((f: FormField) => f.isDerived).length} derived field(s)`} 
        color="secondary" 
        variant="outlined" 
      />
    )}
  </Box>
));

const DebugPanel = memo(({ formData, validationErrors }: { 
  formData: PreviewData; 
  validationErrors: ValidationErrors; 
}) => (
  <Box sx={{ width: { md: 300 }, flexShrink: 0 }}>
    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom>
        Form Data
      </Typography>
      
      <Box sx={{ fontSize: '0.75rem', fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto', maxHeight: 400 }}>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Box>

      {Object.keys(validationErrors).length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Validation Errors
          </Typography>
          <Box sx={{ fontSize: '0.75rem', fontFamily: 'monospace', bgcolor: '#ffebee', p: 2, borderRadius: 1, overflow: 'auto', maxHeight: 200 }}>
            <pre>{JSON.stringify(validationErrors, null, 2)}</pre>
          </Box>
        </>
      )}
    </Paper>
  </Box>
));

export const PreviewPage: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { currentForm } = useAppSelector((state) => state.formBuilder);
  
  const [formData, setFormData] = useState<PreviewData>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);
  const [formNotFound, setFormNotFound] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', type: 'success' });

  // Check if we need to load a specific form
  useEffect(() => {
    const formId = searchParams.get('id');
    
    switch (true) {
      case formId && (!currentForm || currentForm.id !== formId): {
        const form = getFormById(formId);
        switch (!!form) {
          case true:
            dispatch(setCurrentForm(form));
            setFormNotFound(false);
            break;
          case false:
            setFormNotFound(true);
            break;
        }
        break;
      }
      case !formId && !currentForm:
        setFormNotFound(true);
        break;
    }
  }, [searchParams, currentForm, dispatch]);

  // Initialize form data with default values
  useEffect(() => {
    if (currentForm?.fields) {
      const initialData: PreviewData = {};
      
      currentForm.fields.forEach(field => {
        if (!field.isDerived && field.defaultValue !== undefined && field.defaultValue !== '') {
          initialData[field.id] = field.defaultValue;
        }
      });
      
      setFormData(initialData);
      setValidationErrors({});
      setShowValidation(false);
    }
  }, [currentForm]);

  // Calculate derived fields whenever form data changes
  useEffect(() => {
    if (!currentForm?.fields) return;

    const updatedData = { ...formData };
    let hasChanges = false;

    currentForm.fields
      .filter(field => field.isDerived)
      .forEach(field => {
        const derivedValue = calculateDerivedValue(field, formData);
        if (updatedData[field.id] !== derivedValue) {
          updatedData[field.id] = derivedValue;
          hasChanges = true;
        }
      });

    if (hasChanges) {
      setFormData(updatedData);
    }
  }, [formData, currentForm]);

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, type });
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    if (!currentForm?.fields) return {};

    const errors: ValidationErrors = {};
    
    currentForm.fields.forEach(field => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
      }
    });

    return errors;
  }, [currentForm, formData]);

  // Handle field value change
  const handleFieldChange = useCallback((fieldId: string, value: FieldValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Handle form submission (validation)
  const handleSubmit = useCallback(() => {
    const errors = validateForm();
    setValidationErrors(errors);
    setShowValidation(true);

    switch (Object.keys(errors).length === 0) {
      case true:
        showNotification('Form is valid! In a real application, this would submit the data.', 'success');
        break;
      case false:
        showNotification(`Form has ${Object.keys(errors).length} validation error(s). Please fix them before submitting.`, 'error');
        break;
    }
  }, [validateForm, showNotification]);

  // Handle form clear
  const handleClearForm = useCallback(() => {
    setFormData({});
    setValidationErrors({});
    setShowValidation(false);
    showNotification('Form cleared successfully', 'info');
  }, [showNotification]);

  // Memoized form stats
  const formStats = useMemo(() => {
    if (!currentForm?.fields) return { total: 0, filled: 0, errors: 0 };

    const total = currentForm.fields.length;
    const filled = currentForm.fields.filter(field => {
      const value = formData[field.id];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    const errors = Object.keys(validationErrors).length;

    return { total, filled, errors };
  }, [currentForm, formData, validationErrors]);

  // Determine component state using switch
  const componentState = useMemo(() => {
    switch (true) {
      case formNotFound:
        return 'form-not-found';
      case !currentForm:
        return 'no-form';
      case currentForm?.fields.length === 0:
        return 'empty-form';
      default:
        return 'form-preview';
    }
  }, [formNotFound, currentForm]);

  // Render appropriate component based on state
  switch (componentState) {
    case 'form-not-found':
      return <FormNotFoundState />;
    
    case 'no-form':
      return <NoFormState />;
    
    case 'empty-form':
      return <EmptyFormState />;
    
    case 'form-preview':
      return currentForm ? (
        <Box>
          <FormHeader currentForm={currentForm} />
          <FormStats formStats={formStats} currentForm={currentForm} />

          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {currentForm.name || 'Untitled Form'}
                </Typography>
                
                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {currentForm.fields.map((field) => (
                    <FormFieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      error={showValidation ? validationErrors[field.id] : undefined}
                      onChange={(value) => handleFieldChange(field.id, value)}
                    />
                  ))}

                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button 
                      type="submit"
                      variant="contained" 
                      size="large"
                    >
                      Validate Form
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleClearForm}
                    >
                      Clear Form
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <DebugPanel formData={formData} validationErrors={validationErrors} />
          </Box>

          {/* Notification Component */}
          <Notification
            open={notification.open}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          />
        </Box>
      ) : <NoFormState />;
    
    default:
      return <NoFormState />;
  }
});