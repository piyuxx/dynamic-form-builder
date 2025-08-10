import React, { useCallback } from 'react';
import {
 Box,
 Paper,
 Typography,
 IconButton,
 Chip,
} from '@mui/material';
import {
 DragIndicator as DragIcon,
 Edit as EditIcon,
 Delete as DeleteIcon,
} from '@mui/icons-material';
import type { FormField } from '../../types';
import { FIELD_TYPE_LABELS } from '../../utils/constants';

interface FieldListProps {
 fields: FormField[];
 onEdit: (field: FormField) => void;
 onDelete: (fieldId: string) => void;
 onReorder: (fields: FormField[]) => void;
}

export const FieldList: React.FC<FieldListProps> = React.memo(({
 fields,
 onEdit,
 onDelete,
}) => {
 const handleEdit = useCallback((field: FormField) => {
   onEdit(field);
 }, [onEdit]);

 const handleDelete = useCallback((fieldId: string) => {
   onDelete(fieldId);
 }, [onDelete]);

switch (fields.length) {
  case 0:
    return (
      <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">
          No fields added yet. Click "Add Field" to get started.
        </Typography>
      </Paper>
    );
  default:
   return (
   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
     {fields.map((field) => (
       <Paper key={field.id} sx={{ p: 2 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
           <DragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
           
           <Box sx={{ flexGrow: 1 }}>
             <Typography variant="subtitle1" fontWeight="medium">
               {field.label}
             </Typography>
             <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
               <Chip 
                 label={FIELD_TYPE_LABELS[field.type]} 
                 size="small" 
                 color="primary" 
                 variant="outlined" 
               />
               {field.required && (
                 <Chip label="Required" size="small" color="error" variant="outlined" />
               )}
               {field.isDerived && (
                 <Chip label="Derived" size="small" color="secondary" variant="outlined" />
               )}
             </Box>
           </Box>

           <IconButton onClick={() => handleEdit(field)} color="primary">
             <EditIcon />
           </IconButton>
           <IconButton onClick={() => handleDelete(field.id)} color="error">
             <DeleteIcon />
           </IconButton>
         </Box>
       </Paper>
     ))}
   </Box>
 );
}

});

FieldList.displayName = 'FieldList';