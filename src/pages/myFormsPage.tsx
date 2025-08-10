import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { setCurrentForm } from '../store/slices/formBuilderSlice';
import { loadSavedForms, deleteForm } from '../store/slices/savedFormsSlice';
import { FormCard } from '../components/myForms/formCard';
import { Notification } from '../components/common/notification';
import type { FormSchema } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

type SortOption = 'newest' | 'oldest' | 'name' | 'fields';

// Memoized subcomponents
const StatsAlert = memo(({ forms }: { forms: FormSchema[] }) => {
  const stats = useMemo(() => ({
    totalForms: forms.length,
    totalFields: forms.reduce((sum, form) => sum + form.fields.length, 0),
    derivedFields: forms.reduce((sum, form) => sum + form.fields.filter(f => f.isDerived).length, 0),
  }), [forms]);

  if (forms.length === 0) return null;

  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon fontSize="small" />
          <Typography variant="body2">
            Total Forms: {stats.totalForms}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon fontSize="small" />
          <Typography variant="body2">
            Total Fields: {stats.totalFields}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlashOnIcon fontSize="small" />
          <Typography variant="body2">
            Derived Fields: {stats.derivedFields}
          </Typography>
        </Box>
      </Box>
    </Alert>
  );
});

const HeaderSection = memo(({ onCreateNew }: { onCreateNew: () => void }) => (
  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Forms
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage all your saved forms and configurations
      </Typography>
    </Box>

    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onCreateNew}
      size="large"
    >
      Create New Form
    </Button>
  </Box>
));

const SearchAndFilterControls = memo(({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultsCount,
  showControls
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultsCount: number;
  showControls: boolean;
}) => {
  const getSortLabel = useCallback((option: SortOption) => {
    switch (option) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'name': return 'Name (A-Z)';
      case 'fields': return 'Most Fields';
      default: return option;
    }
  }, []);

  if (!showControls) return null;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid  size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder="Search forms by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid  size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="newest">{getSortLabel('newest')}</MenuItem>
              <MenuItem value="oldest">{getSortLabel('oldest')}</MenuItem>
              <MenuItem value="name">{getSortLabel('name')}</MenuItem>
              <MenuItem value="fields">{getSortLabel('fields')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {resultsCount} result{resultsCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
});

const EmptyState = memo(({ 
  type, 
  onCreateNew, 
  onClearSearch 
}: { 
  type: 'no-forms' | 'no-results';
  onCreateNew: () => void;
  onClearSearch: () => void;
}) => {
  if (type === 'no-results') {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No forms found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Try adjusting your search query or filters
        </Typography>
        <Button onClick={onClearSearch}>Clear Search</Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa' }}>
      <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No forms yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create your first form to get started with the form builder
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />}
        onClick={onCreateNew}
        size="large"
      >
        Create Your First Form
      </Button>
    </Paper>
  );
});

const FormsGrid = memo(({ 
  forms, 
  onPreview, 
  onEdit, 
  onDelete 
}: {
  forms: FormSchema[];
  onPreview: (form: FormSchema) => void;
  onEdit: (form: FormSchema) => void;
  onDelete: (formId: string) => void;
}) => (
  <Grid container spacing={3}>
    {forms.map((form) => (
      <Grid size={{ xs: 12, sm: 6, lg:2.5 }} key={form.id}>
        <FormCard
          form={form}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Grid>
    ))}
  </Grid>
));

export const MyFormsPage: React.FC = memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', type: 'success' });

  // Load forms from localStorage
  useEffect(() => {
    try {
      const savedForms = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_FORMS) || '[]');
      setForms(savedForms);
      dispatch(loadSavedForms(savedForms));
    } catch (error) {
      console.error('Error loading forms:', error);
      setNotification({
        show: true,
        message: 'Error loading saved forms',
        type: 'error',
      });
    }
  }, [dispatch]);

  // Memoized filtered and sorted forms
  const filteredForms = useMemo(() => {
    const filtered = forms.filter(form =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort forms
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'fields':
          return b.fields.length - a.fields.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [forms, searchQuery, sortBy]);

  // Show notification helper
  const showNotificationHelper = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
  }, []);

  // Handle form preview
  const handlePreview = useCallback((form: FormSchema) => {
    dispatch(setCurrentForm(form));
    navigate('/preview');
  }, [dispatch, navigate]);

  // Handle form edit
  const handleEdit = useCallback((form: FormSchema) => {
    dispatch(setCurrentForm(form));
    navigate('/create');
  }, [dispatch, navigate]);

  // Handle form delete - direct delete without modal
  const handleDelete = useCallback((formId: string) => {
    try {
      const updatedForms = forms.filter(form => form.id !== formId);
      setForms(updatedForms);
      localStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(updatedForms));
      dispatch(deleteForm(formId));
      
      showNotificationHelper('Form deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      showNotificationHelper('Error deleting form', 'error');
    }
  }, [forms, dispatch, showNotificationHelper]);

  // Create new form
  const handleCreateNew = useCallback(() => {
    dispatch(setCurrentForm(null)); // Clear current form to start fresh
    navigate('/create');
  }, [dispatch, navigate]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Determine what to show
  const showContent = () => {
    if (filteredForms.length > 0) {
      return (
        <FormsGrid
          forms={filteredForms}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    }

    if (forms.length > 0) {
      return (
        <EmptyState 
          type="no-results" 
          onCreateNew={handleCreateNew}
          onClearSearch={handleClearSearch}
        />
      );
    }

    return (
      <EmptyState 
        type="no-forms" 
        onCreateNew={handleCreateNew}
        onClearSearch={handleClearSearch}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <HeaderSection onCreateNew={handleCreateNew} />

      {/* Stats */}
      <StatsAlert forms={forms} />

      {/* Search and Filter Controls */}
      <SearchAndFilterControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={filteredForms.length}
        showControls={forms.length > 0}
      />

      {/* Main Content */}
      {showContent()}

      {/* Notification */}
      <Notification
        open={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </Box>
  );
});