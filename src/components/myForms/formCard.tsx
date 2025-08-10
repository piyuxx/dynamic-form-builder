import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ListAlt as FieldsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { CustomDialog } from '../common/modal';
import type { FormSchema } from '../../types';

interface FormCardProps {
  form: FormSchema;
  onPreview: (form: FormSchema) => void;
  onEdit: (form: FormSchema) => void;
  onDelete: (formId: string) => void;
}

export const FormCard: React.FC<FormCardProps> = memo(({
  form,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = useCallback(() => {
    onDelete(form.id);
    setShowDeleteDialog(false);
  }, [form.id, onDelete]);

  const handlePreview = useCallback(() => {
    onPreview(form);
  }, [form, onPreview]);

  const handleEdit = useCallback(() => {
    onEdit(form);
  }, [form, onEdit]);

  const handleOpenDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const formattedDate = useMemo(() => {
    const date = new Date(form.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [form.createdAt]);

  const fieldTypeCount = useMemo(() => {
    const typeCount: Record<string, number> = {};
    form.fields.forEach(field => {
      typeCount[field.type] = (typeCount[field.type] || 0) + 1;
    });
    return typeCount;
  }, [form.fields]);

  const formStats = useMemo(() => ({
    requiredFields: form.fields.filter(field => field.required).length,
    derivedFields: form.fields.filter(field => field.isDerived).length,
    totalFields: form.fields.length
  }), [form.fields]);

  const displayName = useMemo(() => 
    form.name || 'Untitled Form', 
    [form.name]
  );

  const fieldTypesEntries = useMemo(() => 
    Object.entries(fieldTypeCount), 
    [fieldTypeCount]
  );

  const hasFieldTypes = useMemo(() => 
    Object.keys(fieldTypeCount).length > 0, 
    [fieldTypeCount]
  );

  const fieldsCountText = useMemo(() => 
    `${formStats.totalFields} field${formStats.totalFields !== 1 ? 's' : ''}`,
    [formStats.totalFields]
  );

  const cardStyles = useMemo(() => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
    '&:hover': { 
      boxShadow: 4,
      transform: 'translateY(-2px)'
    }
  }), []);

  return (
    <>
      <Card sx={cardStyles}>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Form Title */}
          <Typography variant="h6" gutterBottom fontWeight="bold" noWrap>
            {displayName}
          </Typography>

          {/* Creation Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              Created {formattedDate}
            </Typography>
          </Box>

          {/* Form Stats */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FieldsIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {fieldsCountText}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {formStats.requiredFields > 0 && (
                <Chip 
                  label={`${formStats.requiredFields} Required`} 
                  size="small" 
                  color="error" 
                  variant="outlined"
                />
              )}
              {formStats.derivedFields > 0 && (
                <Chip 
                  label={`${formStats.derivedFields} Derived`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Field Types */}
          {hasFieldTypes && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Field Types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {fieldTypesEntries.map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${type} (${count})`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}

          >
            Edit
          </Button>
          <IconButton
            color="error"
            onClick={handleOpenDeleteDialog}
            size="small"
            title="Delete form"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={showDeleteDialog}
        title="Delete Form"
        onClose={handleCloseDeleteDialog}
        primaryAction={{
          label: 'Delete',
          onClick: handleDelete,
          color: 'error'
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleCloseDeleteDialog
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WarningIcon color="error" />
          <Typography variant="body1" fontWeight="medium">
            Are you sure you want to delete this form?
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Form: "{displayName}"
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </CustomDialog>
    </>
  );
});

FormCard.displayName = 'FormCard';