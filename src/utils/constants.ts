// Local Storage Keys
export const STORAGE_KEYS = {
  SAVED_FORMS: 'formBuilder_savedForms',
} as const;

// Field Type Labels
export const FIELD_TYPE_LABELS = {
  text: 'Text',
  number: 'Number', 
  textarea: 'Textarea',
  select: 'Select',
  radio: 'Radio',
  checkbox: 'Checkbox',
  date: 'Date',
} as const;

// Validation Rule Labels
export const VALIDATION_RULE_LABELS = {
  notEmpty: 'Not Empty',
  minLength: 'Minimum Length',
  maxLength: 'Maximum Length', 
  email: 'Email Format',
  password: 'Password Rules',
} as const;

// Derived Field Formulas
export const DERIVED_FORMULAS = {
  SUM: 'sum',
  AGE_FROM_BIRTHDATE: 'age_from_birthdate',
} as const;