import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { FormField } from '../../types';
import { FIELD_TYPE_LABELS } from '../../utils/constants';

interface FieldCardProps {
  field: FormField;
  isSelected: boolean;
  isUnsaved?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  index?: number;
}

export const FieldCard: React.FC<FieldCardProps> = memo(({
  field,
  isSelected,
  isUnsaved = false,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  index
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteDialog(false);
    onDelete();
  }, [onDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', field.id);
    e.dataTransfer.setData('application/json', JSON.stringify({ fieldId: field.id, index }));
    onDragStart?.(e);
  }, [field.id, index, onDragStart]);

  // Memoized computed values
  const cardStyles = useMemo(() => ({
    cursor: 'pointer',
    border: isSelected ? '2px solid #1976d2' : isUnsaved ? '2px solid #ff9800' : '1px solid #e0e0e0',
    backgroundColor: isUnsaved ? '#fff8e1' : 'white',
    '&:hover': { boxShadow: 3 },
    '&:active': { cursor: 'grabbing' },
    position: 'relative'
  }), [isSelected, isUnsaved]);

  const displayLabel = useMemo(() => 
    field.label || 'Untitled Field', 
    [field.label]
  );

  const validationRulesCount = useMemo(() => 
    field.validationRules?.length || 0, 
    [field.validationRules]
  );

  const deleteDialogMessage = useMemo(() => 
    isUnsaved 
      ? `"${field.label}" has unsaved changes. Are you sure you want to delete it?`
      : `Are you sure you want to delete "${field.label}"?`,
    [field.label, isUnsaved]
  );

  return (
    <>
      <Card 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={onDrop}
        sx={cardStyles}
        onClick={onEdit}
      >
        {/* Unsaved indicator */}
        {isUnsaved && (
          <Box sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}>
            <Badge color="warning" variant="dot">
              <SaveIcon sx={{ color: '#ff9800', fontSize: 16 }} />
            </Badge>
          </Box>
        )}

        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <DragIcon sx={{ color: 'text.secondary', mt: 0.5, cursor: 'grab' }} />
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                  {displayLabel}
                </Typography>
                {isUnsaved && (
                  <Chip 
                    label="Unsaved" 
                    size="small" 
                    color="warning" 
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Chip 
                  label={FIELD_TYPE_LABELS[field.type]} 
                  size="small" 
                  color="primary" 
                />
                {field.required && (
                  <Chip label="Required" size="small" color="error" />
                )}
                {field.isDerived && (
                  <Chip label="Derived" size="small" color="secondary" />
                )}
              </Box>

              {validationRulesCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {validationRulesCount} validation rule(s)
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <IconButton size="small" onClick={handleEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={handleCancelDelete}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            Delete Field
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

FieldCard.displayName = 'FieldCard';