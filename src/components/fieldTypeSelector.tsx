import React, { useCallback } from 'react';
import { FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import type { FieldType } from '../types';
import { FIELD_TYPE_LABELS } from '../utils/constants';

interface FieldTypeSelectorProps {
 value: FieldType;
 onChange: (value: FieldType) => void;
}

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = React.memo(({ value, onChange }) => {
 const handleChange = useCallback((e: SelectChangeEvent) => {
   onChange(e.target.value as FieldType);
 }, [onChange]);

 return (
   <FormControl fullWidth size="small">
     <InputLabel>Field Type</InputLabel>
     <Select
       value={value}
       label="Field Type"
       onChange={handleChange}
     >
       {Object.entries(FIELD_TYPE_LABELS).map(([key, label]) => (
         <MenuItem key={key} value={key}>
           {label}
         </MenuItem>
       ))}
     </Select>
   </FormControl>
 );
});

FieldTypeSelector.displayName = 'FieldTypeSelector';