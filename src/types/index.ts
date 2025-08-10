// Field Types
export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

// Validation Rule Types
export type ValidationRuleType = 'notEmpty' | 'minLength' | 'maxLength' | 'email' | 'password';

// Field Value Types (instead of 'any')
export type FieldValue = string | number | boolean | string[] | Date | null;

// Validation Rule Interface
export interface ValidationRule {
  type: ValidationRuleType;
  value?: number; // for minLength/maxLength
  message: string;
}

// Derived Field Configuration
export interface DerivedFieldConfig {
  parentFieldIds: string[];
  formula: string; // 'sum' | 'age_from_birthdate' | custom formula
}

// Form Field Interface
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue: FieldValue;
  validationRules: ValidationRule[];
  options?: string[]; // for select, radio, checkbox
  isDerived: boolean;
  derivedConfig?: DerivedFieldConfig;
}

// Form Schema Interface
export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

// Form Preview Data
export interface PreviewData {
  [fieldId: string]: FieldValue;
}

// Validation Errors
export interface ValidationErrors {
  [fieldId: string]: string;
}
//confirmation dialog popup
interface ConfirmationConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'contained' | 'outlined' | 'text';
}
export interface ConfirmationContextType {
  confirm: (config: ConfirmationConfig) => Promise<boolean>;
}
