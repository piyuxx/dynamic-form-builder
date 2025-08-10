import type { FormField, ValidationRule, FieldValue, FieldType } from '../types';

export const getAvailableValidationRules = (fieldType: FieldType): ValidationRule['type'][] => {
  const baseRules: ValidationRule['type'][] = ['notEmpty'];
  
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return [...baseRules, 'minLength', 'maxLength', 'email', 'password'];
    
    case 'number':
      return [...baseRules, 'minLength', 'maxLength']; // For numbers, these represent min/max VALUE
    
    case 'select':
    case 'radio':
      return baseRules; // Only required validation
    
    case 'checkbox':
      return baseRules; // Only required validation (at least one selected)
    
    case 'date':
      return baseRules; // Only required validation
    
    default:
      return baseRules;
  }
};

export const validateField = (field: FormField, value: FieldValue): string | null => {
  for (const rule of field.validationRules) {
    const error = validateRule(rule, value, field.type);
    if (error) {
      return error;
    }
  }
  return null;
};

const validateRule = (rule: ValidationRule, value: FieldValue, fieldType: FieldType): string | null => {
  const stringValue = value?.toString() || '';

  switch (rule.type) {
    case 'notEmpty':
      if (fieldType === 'checkbox') {
        const arrayValue = Array.isArray(value) ? value : [];
        if (arrayValue.length === 0) {
          return rule.message;
        }
      } else {
        if (!stringValue.trim()) {
          return rule.message;
        }
      }
      break;

    case 'minLength':
      if (fieldType === 'number') {
        // For numbers, treat as minimum value
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < (rule.value || 0)) {
          return rule.message;
        }
      } else {
        // For text, treat as minimum length
        if (stringValue.length < (rule.value || 0)) {
          return rule.message;
        }
      }
      break;

    case 'maxLength':
      if (fieldType === 'number') {
        // For numbers, treat as maximum value
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > (rule.value || 0)) {
          return rule.message;
        }
      } else {
        // For text, treat as maximum length
        if (stringValue.length > (rule.value || 0)) {
          return rule.message;
        }
      }
      break;

    case 'email':
      { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (stringValue && !emailRegex.test(stringValue)) {
        return rule.message;
      }
      break; }

    case 'password':
      { const passwordRegex = /^(?=.*\d)(?=.*[a-z]).{8,}$/;
      if (stringValue && !passwordRegex.test(stringValue)) {
        return rule.message;
      }
      break; }

    default:
      break;
  }

  return null;
};
