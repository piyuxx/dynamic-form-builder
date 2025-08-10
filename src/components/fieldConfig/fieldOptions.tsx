import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, IconButton, Button, Paper, Alert, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, type SelectChangeEvent } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface FieldOptionsProps {
    options: string[];
    defaultValue?: string | string[];
    fieldType?: string;
    onChange: (options: string[]) => void;
    onDefaultValueChange?: (value: string | string[]) => void;
}

export const FieldOptions: React.FC<FieldOptionsProps> = React.memo(({
    options,
    defaultValue,
    fieldType,
    onChange,
    onDefaultValueChange
}) => {
    const [newOption, setNewOption] = useState('');

    const addOption = useCallback(() => {
        switch (!!newOption.trim()) {
            case true:
                onChange([...options, newOption.trim()]);
                setNewOption('');
                break;
        }
    }, [newOption, options, onChange]);

    const updateOption = useCallback((index: number, value: string) => {
        const oldValue = options[index];
        const newOptions = [...options];
        newOptions[index] = value;
        onChange(newOptions);

        // Update default value if it was referencing the old option
        switch (fieldType) {
            case 'checkbox': {
                const currentDefaults = Array.isArray(defaultValue) ? defaultValue : [];
                switch (currentDefaults.includes(oldValue)) {
                    case true: {
                        const newDefaults = currentDefaults.map(def => def === oldValue ? value : def);
                        onDefaultValueChange?.(newDefaults);
                        break;
                    }
                }
                break;
            }
            default:
                switch (defaultValue === oldValue) {
                    case true:
                        onDefaultValueChange?.(value);
                        break;
                }
                break;
        }
    }, [options, onChange, fieldType, defaultValue, onDefaultValueChange]);

    const deleteOption = useCallback((index: number) => {
        const optionToDelete = options[index];
        const newOptions = options.filter((_, i) => i !== index);
        onChange(newOptions);

        // Handle default value cleanup
        switch (fieldType) {
            case 'checkbox': {
                const currentDefaults = Array.isArray(defaultValue) ? defaultValue : [];
                const newDefaults = currentDefaults.filter(val => val !== optionToDelete);
                onDefaultValueChange?.(newDefaults);
                break;
            }
            default:
                switch (defaultValue === optionToDelete) {
                    case true:
                        onDefaultValueChange?.('');
                        break;
                }
                break;
        }
    }, [options, onChange, fieldType, defaultValue, onDefaultValueChange]);

    const handleCheckboxDefaultChange = useCallback((option: string, checked: boolean) => {
        const currentDefaults = Array.isArray(defaultValue) ? defaultValue : [];
        let newDefaults;

        switch (checked) {
            case true:
                newDefaults = [...currentDefaults, option];
                break;
            default:
                newDefaults = currentDefaults.filter(val => val !== option);
                break;
        }

        onDefaultValueChange?.(newDefaults);
    }, [defaultValue, onDefaultValueChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                addOption();
                break;
        }
    }, [addOption]);

    const handleNewOptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewOption(e.target.value);
    }, []);

    // Update the handler to use the correct type
    const handleDefaultValueSelectChange = useCallback((e: SelectChangeEvent) => {
        onDefaultValueChange?.(e.target.value as string);
    }, [onDefaultValueChange]);
    // Memoized computed values
    const showDefaultSelection = useMemo(() =>
        options.length > 0 && (fieldType === 'select' || fieldType === 'radio'),
        [options.length, fieldType]
    );

    const checkboxDefaults = useMemo(() =>
        fieldType === 'checkbox' && Array.isArray(defaultValue) ? defaultValue : [],
        [fieldType, defaultValue]
    );

    const showCheckboxDefaultsAlert = useMemo(() =>
        fieldType === 'checkbox' && Array.isArray(defaultValue) && defaultValue.length > 0,
        [fieldType, defaultValue]
    );

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Options</Typography>

            {/* Add new option */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter new option"
                    value={newOption}
                    onChange={handleNewOptionChange}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    onClick={addOption}
                    startIcon={<AddIcon />}
                    disabled={!newOption.trim()}
                >
                    Add
                </Button>
            </Box>

            {/* Existing options */}
            {options.map((option, index) => (
                <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            error={!option.trim()}
                            helperText={!option.trim() ? 'Option cannot be empty' : ''}
                            size="small"
                        />

                        {/* Checkbox for default selection (only for checkbox fields) */}
                        {fieldType === 'checkbox' && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checkboxDefaults.includes(option)}
                                        onChange={(e) => handleCheckboxDefaultChange(option, e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Default"
                                sx={{ minWidth: 'fit-content' }}
                            />
                        )}

                        <IconButton
                            onClick={() => deleteOption(index)}
                            color="error"
                            size="small"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            ))}

            {/* Default value selection for select/radio fields */}
            {showDefaultSelection && (
                <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Default Value (Optional)</InputLabel>
                        <Select
                            value={defaultValue as string || ''}
                            label="Default Value (Optional)"
                            onChange={handleDefaultValueSelectChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {options.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}

            {/* Show current defaults for checkbox */}
            {showCheckboxDefaultsAlert && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Default values:</strong> {checkboxDefaults.join(', ')}
                    </Typography>
                </Alert>
            )}

            {options.length === 0 && (
                <Alert severity="info">
                    Add at least one option for this field type.
                </Alert>
            )}
        </Box>
    );
});

FieldOptions.displayName = 'FieldOptions';