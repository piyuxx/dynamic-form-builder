import React, { useEffect, useCallback, useMemo } from 'react';
import { 
 Box, 
 Typography, 
 Button,
 FormControl, 
 InputLabel, 
 Select, 
 MenuItem, 
 TextField,
 Paper,
 IconButton,
 Alert,
 type SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ValidationRule, FieldType, ValidationRuleType } from '../types';
import { getAvailableValidationRules } from '../utils/validation';

interface ValidationRulesProps {
 rules: ValidationRule[];
 fieldType: FieldType;
 isRequired: boolean;
 onChange: (rules: ValidationRule[]) => void;
 onRequiredChange: (required: boolean) => void;
}

export const ValidationRules: React.FC<ValidationRulesProps> = React.memo(({ 
 rules, 
 fieldType,
 isRequired, 
 onChange, 
 onRequiredChange 
}) => {
 const availableRuleTypes = useMemo(() => 
   getAvailableValidationRules(fieldType), 
   [fieldType]
 );

 const getDefaultMessage = useCallback((type: ValidationRuleType): string => {
   switch (type) {
     case 'notEmpty': 
       return fieldType === 'checkbox' ? 'Please select at least one option' : 'This field is required';
     case 'email': 
       return 'Please enter a valid email address';
     case 'password': 
       return 'Password must be at least 8 characters with a number';
     case 'minLength': 
       return fieldType === 'number' ? 'Value must be at least the minimum' : 'Minimum length required';
     case 'maxLength': 
       return fieldType === 'number' ? 'Value must not exceed the maximum' : 'Maximum length exceeded';
     default: 
       return 'Invalid input';
   }
 }, [fieldType]);

 // Auto-add required rule when required is true
 useEffect(() => {
   const hasRequiredRule = rules.some(rule => rule.type === 'notEmpty');
   
   switch (isRequired && !hasRequiredRule) {
     case true: {
       const newRule: ValidationRule = {
         type: 'notEmpty',
         message: getDefaultMessage('notEmpty'),
       };
       onChange([...rules, newRule]);
       break;
     }
   }
 }, [isRequired, rules, onChange, getDefaultMessage]);

 const addRule = useCallback(() => {
   const usedTypes = new Set(rules.map(rule => rule.type));
   const availableTypes = availableRuleTypes.filter(type => !usedTypes.has(type));
   
   switch (availableTypes.length > 0) {
     case true: {
       const ruleType = availableTypes[0];
       const newRule: ValidationRule = {
         type: ruleType,
         message: getDefaultMessage(ruleType),
       };
       onChange([...rules, newRule]);
       break;
     }
   }
 }, [rules, availableRuleTypes, onChange, getDefaultMessage]);

 const updateRule = useCallback((index: number, updatedRule: Partial<ValidationRule>) => {
   const newRules = [...rules];
   newRules[index] = { ...newRules[index], ...updatedRule };
   onChange(newRules);
 }, [rules, onChange]);

 const deleteRule = useCallback((index: number) => {
   const ruleToDelete = rules[index];
   const newRules = rules.filter((_, i) => i !== index);
   
   // If deleting required rule, turn off required toggle
   switch (ruleToDelete.type) {
     case 'notEmpty':
       onRequiredChange(false);
       break;
   }
   
   onChange(newRules);
 }, [rules, onChange, onRequiredChange]);

 const handleRuleTypeChange = useCallback((index: number, e: SelectChangeEvent) => {
   const newType = e.target.value as ValidationRuleType;
   updateRule(index, { 
     type: newType, 
     message: getDefaultMessage(newType) 
   });
 }, [updateRule, getDefaultMessage]);

 const handleValueChange = useCallback((index: number, value: string) => {
   updateRule(index, { value: parseInt(value) || 0 });
 }, [updateRule]);

 const handleMessageChange = useCallback((index: number, message: string) => {
   updateRule(index, { message });
 }, [updateRule]);

 const getDisplayName = useCallback((type: ValidationRuleType): string => {
   switch (type) {
     case 'notEmpty': 
       return 'Required';
     case 'minLength': 
       return fieldType === 'number' ? 'Min Value' : 'Min Length';
     case 'maxLength': 
       return fieldType === 'number' ? 'Max Value' : 'Max Length';
     default: 
       return type.charAt(0).toUpperCase() + type.slice(1);
   }
 }, [fieldType]);

 // Memoized computed values
 const availableForAdd = useMemo(() => {
   const usedTypes = new Set(rules.map(rule => rule.type));
   return availableRuleTypes.filter(type => !usedTypes.has(type));
 }, [rules, availableRuleTypes]);

 const showScrollbar = useMemo(() => rules.length > 3, [rules.length]);

 const showAllRulesAddedAlert = useMemo(() => 
   availableForAdd.length === 0 && rules.length < availableRuleTypes.length,
   [availableForAdd.length, rules.length, availableRuleTypes.length]
 );

 return (
   <Box>
     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
       <Typography variant="h6">Validation Rules</Typography>
       <Button 
         size="small" 
         onClick={addRule} 
         startIcon={<AddIcon />}
         disabled={availableForAdd.length === 0}
       >
         Add Rule
       </Button>
     </Box>

     <Box sx={{ 
       maxHeight: 300, 
       overflowY: 'auto',
       pr: showScrollbar ? 1 : 0
     }}>
       {rules.map((rule, index) => (
         <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
           <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
             <FormControl sx={{ minWidth: 140 }}>
               <InputLabel>Rule Type</InputLabel>
               <Select
                 value={rule.type}
                 label="Rule Type"
                 onChange={(e) => handleRuleTypeChange(index, e)}
               >
                 <MenuItem value={rule.type}>
                   {getDisplayName(rule.type)}
                 </MenuItem>
                 {availableForAdd.map(type => (
                   <MenuItem key={type} value={type}>
                     {getDisplayName(type)}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>

             {(rule.type === 'minLength' || rule.type === 'maxLength') && (
               <TextField
                 type="number"
                 label={fieldType === 'number' ? 'Value' : 'Length'}
                 value={rule.value || ''}
                 onChange={(e) => handleValueChange(index, e.target.value)}
                 sx={{ width: 100 }}
                 inputProps={{ min: 0 }}
               />
             )}

             <IconButton 
               onClick={() => deleteRule(index)} 
               color="error"
               disabled={rule.type === 'notEmpty' && isRequired}
               title={rule.type === 'notEmpty' && isRequired ? 'Turn off Required toggle first' : 'Delete rule'}
             >
               <DeleteIcon />
             </IconButton>
           </Box>

           <TextField
             fullWidth
             label="Error Message"
             value={rule.message}
             onChange={(e) => handleMessageChange(index, e.target.value)}
           />
         </Paper>
       ))}
     </Box>
     
     {rules.length === 0 && (
       <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
         No validation rules added yet.
       </Typography>
     )}

     {showAllRulesAddedAlert && (
       <Alert severity="info" sx={{ mt: 2 }}>
         All available validation rules for this field type have been added.
       </Alert>
     )}
   </Box>
 );
});

ValidationRules.displayName = 'ValidationRules';