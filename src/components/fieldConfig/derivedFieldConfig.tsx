import React, { useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import type { DerivedFieldConfig, FieldType, FormField } from '../../types';

interface DerivedFieldConfigProps {
    fieldType: FieldType;
    isDerived: boolean;
    config?: DerivedFieldConfig;
    availableFields: FormField[];
    onChange: (isDerived: boolean, config?: DerivedFieldConfig) => void;
}

export const DerivedFieldConfigComponent: React.FC<DerivedFieldConfigProps> = React.memo(({
    fieldType,
    isDerived,
    config,
    availableFields,
    onChange,
}) => {
    // Only number fields can be derived
    const canBeDerivable = useMemo(() => fieldType === 'number', [fieldType]);

    // Get compatible parent fields based on formula
    const getCompatibleFields = useCallback((formula?: string) => {
        switch (formula) {
            case 'sum':
                // Sum can only work with number fields (not derived ones to avoid circular dependency)
                return availableFields.filter(f => f.type === 'number' && !f.isDerived);
            case 'age_from_birthdate':
                // Age calculation only works with date fields
                return availableFields.filter(f => f.type === 'date');
            default:
                return [];
        }
    }, [availableFields]);

    const handleDerivedToggle = useCallback((checked: boolean) => {
        switch (true) {
            case checked && canBeDerivable: {
                // Default to age calculation if date fields exist, otherwise sum
                const hasDateFields = availableFields.some(f => f.type === 'date');
                const defaultFormula = hasDateFields ? 'age_from_birthdate' : 'sum';

                const defaultConfig: DerivedFieldConfig = {
                    parentFieldIds: [],
                    formula: defaultFormula,
                };
                onChange(true, defaultConfig);
                break;
            }
            default:
                onChange(false);
                break;
        }
    }, [canBeDerivable, availableFields, onChange]);

    const updateConfig = useCallback((updates: Partial<DerivedFieldConfig>) => {
        switch (!!config) {
            case true: {
                const newConfig = { ...config, ...updates } as DerivedFieldConfig;
                switch (!!updates.formula) {
                    case true:
                        newConfig.parentFieldIds = [];
                        break;
                }
                onChange(true, newConfig);
                break;
            }
        }
    }, [config, onChange]);

    // Memoize expensive calculations
    const { hasNumberFields, hasDateFields } = useMemo(() => ({
        hasNumberFields: availableFields.some(f => f.type === 'number' && !f.isDerived),
        hasDateFields: availableFields.some(f => f.type === 'date')
    }), [availableFields]);

    const compatibleFields = useMemo(() =>
        getCompatibleFields(config?.formula),
        [getCompatibleFields, config?.formula]
    );

    const handleFormulaChange = useCallback((formula: string) => {
        updateConfig({ formula });
    }, [updateConfig]);

    const handleParentFieldsChange = useCallback((value: unknown) => {
        const newValue = config?.formula === 'sum'
            ? value as string[]
            : [value as string];
        updateConfig({ parentFieldIds: newValue });
    }, [config?.formula, updateConfig]);

    switch (canBeDerivable) {
        case false:
            return (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Only number fields can be derived. Derived fields calculate their value from other fields (e.g., age from birthdate, sum of amounts).
                </Alert>
            );
    }

    switch (hasNumberFields || hasDateFields) {
        case false:
            return (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    Add other fields first to enable derived field functionality. You can derive from number fields (for sum) or date fields (for age calculation).
                </Alert>
            );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={isDerived}
                        onChange={(e) => handleDerivedToggle(e.target.checked)}
                    />
                }
                label="Make this a derived field"
            />

            {isDerived && config && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Derived Field Configuration</Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Formula</InputLabel>
                        <Select
                            value={config.formula}
                            label="Formula"
                            onChange={(e) => handleFormulaChange(e.target.value)}
                        >
                            {hasNumberFields && (
                                <MenuItem value="sum">Sum of number fields</MenuItem>
                            )}
                            {hasDateFields && (
                                <MenuItem value="age_from_birthdate">Calculate age from birthdate</MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    {compatibleFields.length > 0 ? (
                        <FormControl fullWidth>
                            <InputLabel>Parent Fields</InputLabel>
                            <Select
                                multiple={config.formula === 'sum'}
                                value={config.formula === 'sum' ? config.parentFieldIds : (config.parentFieldIds[0] || '')}
                                label="Parent Fields"
                                onChange={(e) => handleParentFieldsChange(e.target.value)}
                            >
                                {compatibleFields.map((field) => (
                                    <MenuItem key={field.id} value={field.id}>
                                        {field.label} ({field.type})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Alert severity="warning">
                            No compatible fields available for the selected formula.
                            {config.formula === 'sum' && ' Add number fields first.'}
                            {config.formula === 'age_from_birthdate' && ' Add date fields first.'}
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
});