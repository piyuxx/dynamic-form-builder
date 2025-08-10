import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { clearCurrentForm } from './store/slices/formBuilderSlice';
import { store } from './store';
import { CreatePage } from './pages/createPage';
import { PreviewPage } from './pages/previewPage';
import { MyFormsPage } from './pages/myFormsPage';
import { AppLayout } from './components/appLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Component to handle route changes and clear form state
function RouteHandler() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Clear current form when navigating to My Forms page
    // This ensures deleted forms don't persist in other routes
    if (location.pathname === '/myforms') {
      dispatch(clearCurrentForm());
    }
  }, [location.pathname, dispatch]);

  return null;
}

function AppContent() {
  return (
    <AppLayout>
      <RouteHandler />
      <Routes>
        <Route path="/" element={<Navigate to="/myforms" replace />} />
        <Route path="/myforms" element={<MyFormsPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="*" element={<Navigate to="/myforms" replace />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;