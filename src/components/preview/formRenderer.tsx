import React, { memo, useCallback, useMemo } from 'react';
import {
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Select,
    MenuItem,
    InputLabel,
    FormGroup,
    FormHelperText,
    Box,
    Typography,
    type SelectChangeEvent,
} from '@mui/material';
import type { FormField, FieldValue } from '../../types';

interface FormFieldRendererProps {
    field: FormField;
    value: FieldValue;
    error?: string;
    onChange: (value: FieldValue) => void;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = memo(({
    field,
    value,
    error,
    onChange,
}) => {
    const handleChange = useCallback((newValue: FieldValue) => {
        onChange(newValue);
    }, [onChange]);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e.target.value);
    }, [handleChange]);

    const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = e.target.value ? Number(e.target.value) : '';
        handleChange(numValue);
    }, [handleChange]);

    const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
        handleChange(e.target.value);
    }, [handleChange]);

    const handleRadioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e.target.value);
    }, [handleChange]);

    const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
        const checkboxValues = Array.isArray(value) ? value : [];
        switch (checked) {
            case true:
                handleChange([...checkboxValues, option]);
                break;
            default:
                handleChange(checkboxValues.filter(v => v !== option));
                break;
        }
    }, [value, handleChange]);

    const displayValue = useMemo(() => value?.toString() || '', [value]);
    const placeholder = useMemo(() => field.defaultValue?.toString() || '', [field.defaultValue]);
    const checkboxValues = useMemo(() => Array.isArray(value) ? value : [], [value]);
    const hasError = useMemo(() => !!error, [error]);

    const filteredOptions = useMemo(() =>
        field.options?.filter(option => option.trim()) || [],
        [field.options]
    );

    const renderField = useCallback(() => {
        switch (field.type) {
            case 'text':
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        value={displayValue}
                        onChange={handleTextChange}
                        error={hasError}
                        helperText={error}
                        required={field.required}
                        placeholder={placeholder}
                        disabled={field.isDerived}
                    />
                );

            case 'number':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        label={field.label}
                        value={displayValue}
                        onChange={handleNumberChange}
                        error={hasError}
                        helperText={error}
                        required={field.required}
                        placeholder={placeholder}
                        disabled={field.isDerived}
                        inputProps={{ min: 0 }}
                    />
                );

            case 'textarea':
                return (
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={field.label}
                        value={displayValue}
                        onChange={handleTextChange}
                        error={hasError}
                        helperText={error}
                        required={field.required}
                        placeholder={placeholder}
                    />
                );

            case 'date':
                return (
                    <TextField
                        fullWidth
                        type="date"
                        label={field.label}
                        value={displayValue}
                        onChange={handleTextChange}
                        error={hasError}
                        helperText={error}
                        required={field.required}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                );

            case 'select':
                return (
                    <FormControl fullWidth error={hasError}>
                        <InputLabel>{field.label}</InputLabel>
                        <Select<string>
                            value={value as string || ''}
                            label={field.label}
                            onChange={handleSelectChange}
                            required={field.required}
                        >
                            {filteredOptions.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                        {error && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>
                );

            case 'radio':
                return (
                    <FormControl component="fieldset" error={hasError}>
                        <FormLabel component="legend">{field.label}</FormLabel>
                        <RadioGroup
                            value={value || ''}
                            onChange={handleRadioChange}
                        >
                            {filteredOptions.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                />
                            ))}
                        </RadioGroup>
                        {error && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>
                );

            case 'checkbox':
                return (
                    <FormControl component="fieldset" error={hasError}>
                        <FormLabel component="legend">{field.label}</FormLabel>
                        <FormGroup>
                            {filteredOptions.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            checked={checkboxValues.includes(option)}
                                            onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                                        />
                                    }
                                    label={option}
                                />
                            ))}
                        </FormGroup>
                        {error && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>
                );

            default:
                return (
                    <TextField
                        fullWidth
                        label={field.label}
                        value={displayValue}
                        onChange={handleTextChange}
                        error={hasError}
                        helperText={error}
                        required={field.required}
                    />
                );
        }
    }, [field, displayValue, placeholder, hasError, error, filteredOptions, checkboxValues, handleTextChange, handleNumberChange, handleSelectChange, handleRadioChange, handleCheckboxChange, value]);

    return (
        <Box sx={{ mb: 3 }}>
            {field.isDerived && (
                <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
                    Derived Field (Auto-calculated)
                </Typography>
            )}
            {renderField()}
        </Box>
    );
});

FormFieldRenderer.displayName = 'FormFieldRenderer';