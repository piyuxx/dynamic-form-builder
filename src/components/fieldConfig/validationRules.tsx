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
import { getAvailableValidationRules } from '../../utils/validation';
import type { ValidationRule, FieldType, ValidationRuleType } from '../../types';

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

  useEffect(() => {
    const hasRequiredRule = rules.some(rule => rule.type === 'notEmpty');
    
    if (isRequired && !hasRequiredRule) {
      const newRule: ValidationRule = {
        type: 'notEmpty',
        message: getDefaultMessage('notEmpty'),
      };
      onChange([...rules, newRule]);
    }
  }, [isRequired, rules, onChange, getDefaultMessage]);

  const addRule = useCallback(() => {
    const usedTypes = new Set(rules.map(rule => rule.type));
    const availableTypes = availableRuleTypes.filter(type => !usedTypes.has(type));
    
    if (availableTypes.length > 0) {
      const ruleType = availableTypes[0];
      const newRule: ValidationRule = {
        type: ruleType,
        message: getDefaultMessage(ruleType),
        // Fixed: Set default value for min/max rules
        ...(ruleType === 'minLength' || ruleType === 'maxLength' ? { value: 1 } : {})
      };
      onChange([...rules, newRule]);
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
    
    if (ruleToDelete.type === 'notEmpty') {
      onRequiredChange(false);
    }
    
    onChange(newRules);
  }, [rules, onChange, onRequiredChange]);

  const handleRuleTypeChange = useCallback((index: number, e: SelectChangeEvent) => {
    const newType = e.target.value as ValidationRuleType;
    const updatedRule: Partial<ValidationRule> = { 
      type: newType, 
      message: getDefaultMessage(newType) 
    };
    
    // Fixed: Set default value for min/max rules
    if (newType === 'minLength' || newType === 'maxLength') {
      updatedRule.value = 1;
    } else {
      // Remove value for rules that don't need it
      updatedRule.value = undefined;
    }
    
    updateRule(index, updatedRule);
  }, [updateRule, getDefaultMessage]);

  // Fixed: Validate value input to prevent empty values
  const handleValueChange = useCallback((index: number, value: string) => {
    if (value === '') {
      // When user clears the input, set to minimum value of 1
      updateRule(index, { value: 1 });
    } else {
      const numValue = parseInt(value);
      // Don't allow invalid values, keep minimum of 1
      if (!isNaN(numValue) && numValue >= 1) {
        updateRule(index, { value: numValue });
      }
    }
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

  // Fixed: Filter out irrelevant validation rules based on field type
  const getRelevantRules = useCallback((rules: ValidationRule[]) => {
    return rules.filter(rule => {
      // Email validation only for text, email, and textarea fields
      if (rule.type === 'email' && !['text', 'email', 'textarea'].includes(fieldType)) {
        return false;
      }
      // Password validation only for text and password fields
      if (rule.type === 'password' && !['text', 'password'].includes(fieldType)) {
        return false;
      }
      // Length validations not for checkbox/radio/select
      if ((rule.type === 'minLength' || rule.type === 'maxLength') && 
          ['checkbox', 'radio', 'select'].includes(fieldType)) {
        return false;
      }
      return true;
    });
  }, [fieldType]);

  // Clean up irrelevant rules when field type changes
  useEffect(() => {
    const relevantRules = getRelevantRules(rules);
    if (relevantRules.length !== rules.length) {
      onChange(relevantRules);
    }
  }, [fieldType, rules, onChange, getRelevantRules]);

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
                  value={rule.value || 1}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                  required
                  error={!rule.value || rule.value < 1}
                  helperText={(!rule.value || rule.value < 1) ? 'Required' : ''}
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
              required
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