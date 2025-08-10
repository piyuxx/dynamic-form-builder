import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
    Paper,
    Box,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { FieldTypeSelector } from './fieldTypeSelector';
import { ValidationRules } from './validationRules';
import { DerivedFieldConfigComponent } from './derivedFieldConfig';
import { FieldOptions } from './fieldOptions';
import type { DerivedFieldConfig, FieldType, FormField, ValidationRule } from '../../types';

interface FieldConfigPanelProps {
    field: FormField;
    availableFields: FormField[];
    onUpdate: (updates: Partial<FormField>) => void;
    onSave: () => void;
    onCancel: () => void;
    onClose: () => void;
}

export const FieldConfigPanel: React.FC<FieldConfigPanelProps> = memo(({
    field,
    availableFields,
    onUpdate,
    onSave,
    onCancel,
    onClose,
}) => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalField, setOriginalField] = useState<FormField>(field);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

    useEffect(() => {
        setOriginalField(field);
        setHasUnsavedChanges(true);
    }, [field, field.id]);

    const handleUpdate = useCallback((updates: Partial<FormField>) => {
        onUpdate(updates);
        setHasUnsavedChanges(true);
    }, [onUpdate]);

    const handleSave = useCallback(() => {
        onSave();
        setHasUnsavedChanges(false);
        setOriginalField({ ...field });
        onClose();
    }, [onSave, field, onClose]);

    const handleCancel = useCallback(() => {
        onUpdate(originalField);
        onCancel();
        setHasUnsavedChanges(false);
        onClose();
    }, [onUpdate, onCancel, onClose, originalField]);

    const handleClose = useCallback(() => {
        switch (hasUnsavedChanges) {
            case true:
                setShowUnsavedDialog(true);
                break;
            default:
                onClose();
                break;
        }
    }, [hasUnsavedChanges, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowUnsavedDialog(false);
        handleCancel();
    }, [handleCancel]);

    const handleCancelClose = useCallback(() => {
        setShowUnsavedDialog(false);
    }, []);

    const handleRequiredToggle = useCallback((checked: boolean) => {
        const currentRules = field.validationRules || [];
        let newRules = [...currentRules];

        switch (checked) {
            case true: {
                const hasRequiredRule = newRules.some(rule => rule.type === 'notEmpty');
                switch (hasRequiredRule) {
                    case false:
                        newRules.unshift({
                            type: 'notEmpty',
                            message: field.type === 'checkbox' ? 'Please select at least one option' : 'This field is required'
                        });
                        break;
                }
                break;
            }
            default:
                newRules = newRules.filter(rule => rule.type !== 'notEmpty');
                break;
        }

        handleUpdate({
            required: checked,
            validationRules: newRules
        });
    }, [field.validationRules, field.type, handleUpdate]);

    const handleValidationRulesChange = useCallback((rules: ValidationRule[]) => {
        const hasRequiredRule = rules.some(rule => rule.type === 'notEmpty');
        handleUpdate({
            validationRules: rules,
            required: hasRequiredRule
        });
    }, [handleUpdate]);

    const handleFieldTypeChange = useCallback((type: FieldType) => {
        const updates: Partial<FormField> = { type };

        switch (true) {
            case !['select', 'radio', 'checkbox'].includes(type):
                updates.options = undefined;
                break;
            default:
                updates.options = field.options || [];
                break;
        }

        switch (type) {
            case 'number':
                break;
            default:
                updates.isDerived = false;
                updates.derivedConfig = undefined;
                break;
        }

        switch (true) {
            case (field.type === 'checkbox' && type !== 'checkbox') ||
                (field.type !== 'checkbox' && type === 'checkbox'):
                updates.defaultValue = '';
                break;
        }

        handleUpdate(updates);
    }, [field.options, field.type, handleUpdate]);

    const handleDefaultValueChange = useCallback((value: string) => {
        let processedValue: string | number = value;
        switch (field.type) {
            case 'number':
                processedValue = value ? Number(value) : '';
                break;
        }

        handleUpdate({ defaultValue: processedValue });
    }, [field.type, handleUpdate]);

    const handleOptionsChange = useCallback((options: string[]) => {
        const validOptions = options.filter(option => option.trim());
        handleUpdate({ options: validOptions });
    }, [handleUpdate]);

    const handleDefaultValueForOptionsChange = useCallback((value: string | string[] | undefined) => {
        handleUpdate({ defaultValue: value });
    }, [handleUpdate]);
    const handleDerivedFieldChange = useCallback((isDerived: boolean, derivedConfig?: DerivedFieldConfig) => {
        handleUpdate({ isDerived, derivedConfig });
    }, [handleUpdate]);

    // Memoized computed values
    const needsOptions = useMemo(() =>
        ['select', 'radio', 'checkbox'].includes(field.type),
        [field.type]
    );

    const defaultValueValidation = useMemo(() => {
        switch (field.type) {
            case 'number': {
                switch (!!field.defaultValue) {
                    case true: {
                        const numValue = Number(field.defaultValue);
                        const minRule = field.validationRules?.find(rule => rule.type === 'minLength');
                        const maxRule = field.validationRules?.find(rule => rule.type === 'maxLength');

                        switch (true) {
                            case minRule && numValue < (minRule.value || 0):
                                return {
                                    error: true,
                                    helperText: `Value must be at least ${minRule.value}`
                                };
                            case maxRule && numValue > (maxRule.value || 0):
                                return {
                                    error: true,
                                    helperText: `Value must be at most ${maxRule.value}`
                                };
                            default:
                                return { error: false, helperText: '' };
                        }
                    }
                    default:
                        return { error: false, helperText: '' };
                }
            }
            default:
                return { error: false, helperText: '' };
        }
    }, [field.type, field.defaultValue, field.validationRules]);

    const isSaveDisabled = useMemo(() => {
        switch (true) {
            case !field.label.trim():
            case needsOptions && (!field.options || field.options.length === 0):
            case defaultValueValidation.error:
                return true;
            default:
                return false;
        }
    }, [field.label, needsOptions, field.options, defaultValueValidation.error]);

    const filteredAvailableFields = useMemo(() =>
        availableFields.filter(f => f.id !== field.id),
        [availableFields, field.id]
    );

    return (
        <>
            <Paper sx={{
                p: 3,
                height: 'fit-content',
                position: 'sticky',
                top: 20,
                width: 400,
                minWidth: 400,
                maxWidth: 400
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">Configure Field</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {hasUnsavedChanges && (
                    <Box sx={{
                        mb: 2,
                        p: 1,
                        bgcolor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <WarningIcon sx={{ color: '#856404', fontSize: 18 }} />
                        <Typography variant="body2" color="#856404">
                            You have unsaved changes
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>Basic Settings</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Field Label"
                                value={field.label}
                                onChange={(e) => handleUpdate({ label: e.target.value })}
                                placeholder="Enter field label"
                                required
                                error={!field.label.trim()}
                                helperText={!field.label.trim() ? 'Field label is required' : ''}
                            />

                            <FieldTypeSelector
                                value={field.type}
                                onChange={handleFieldTypeChange}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={field.required}
                                        onChange={(e) => handleRequiredToggle(e.target.checked)}
                                    />
                                }
                                label="Required Field"
                            />

                            {/* Only show default value input for non-option fields */}
                            {!needsOptions && (
                                <TextField
                                    fullWidth
                                    label="Default Value"
                                    value={field.defaultValue?.toString() || ''}
                                    onChange={(e) => handleDefaultValueChange(e.target.value)}
                                    placeholder="Enter default value (optional)"
                                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                    inputProps={field.type === 'number' ? { min: 0 } : {}}
                                    error={defaultValueValidation.error}
                                    helperText={defaultValueValidation.helperText}
                                />
                            )}
                        </Box>
                    </Box>

                    <Divider />

                    {needsOptions && (
                        <>
                            <FieldOptions
                                options={field.options || []}
                                defaultValue={field.defaultValue as string | string[] | undefined}
                                fieldType={field.type}
                                onChange={handleOptionsChange}
                                onDefaultValueChange={handleDefaultValueForOptionsChange}
                            />
                            <Divider />
                        </>
                    )}

                    <ValidationRules
                        rules={field.validationRules || []}
                        fieldType={field.type}
                        isRequired={field.required}
                        onChange={handleValidationRulesChange}
                        onRequiredChange={handleRequiredToggle}
                    />

                    <Divider />

                    <DerivedFieldConfigComponent
                        fieldType={field.type}
                        isDerived={field.isDerived || false}
                        config={field.derivedConfig}
                        availableFields={filteredAvailableFields}
                        onChange={handleDerivedFieldChange}
                    />

                    <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            fullWidth
                            disabled={isSaveDisabled}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Unsaved Changes Confirmation Dialog */}
            <Dialog
                open={showUnsavedDialog}
                onClose={handleCancelClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        Unsaved Changes
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        You have unsaved changes that will be lost if you close this panel.
                        Are you sure you want to continue without saving?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose}>
                        Keep Editing
                    </Button>
                    <Button
                        onClick={handleConfirmClose}
                        color="warning"
                        variant="contained"
                    >
                        Discard Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

FieldConfigPanel.displayName = 'FieldConfigPanel';