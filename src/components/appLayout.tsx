import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    text: 'My Forms',
    icon: <DashboardIcon />,
    path: '/myforms',
  },
  {
    text: 'Create Form',
    icon: <AddIcon />,
    path: '/create',
  },
  {
    text: 'Preview',
    icon: <VisibilityIcon />,
    path: '/preview',
  },
];

export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    switch (isMobile) {
      case true:
        setMobileOpen(false);
        break;
    }
  }, [navigate, isMobile]);

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const appBarTitle = useMemo(() => 
    menuItems.find(item => item.path === location.pathname)?.text || 'Form Builder',
    [location.pathname]
  );

  const appBarStyles = useMemo(() => ({
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    ml: { md: `${DRAWER_WIDTH}px` },
    bgcolor: 'white',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e0e0e0',
  }), []);

  const mainContentStyles = useMemo(() => ({
    flexGrow: 1,
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    bgcolor: '#f8fafc',
    minHeight: '100vh',
  }), []);

  const mobileDrawerStyles = useMemo(() => ({
    display: { xs: 'block', md: 'none' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: DRAWER_WIDTH,
    },
  }), []);

  const desktopDrawerStyles = useMemo(() => ({
    display: { xs: 'none', md: 'block' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: DRAWER_WIDTH,
    },
  }), []);

  const getListItemButtonStyles = useCallback((isActive: boolean) => ({
    borderRadius: 2,
    py: 1.5,
    px: 2,
    bgcolor: isActive ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
    color: isActive ? '#2196f3' : 'rgba(255,255,255,0.8)',
    '&:hover': {
      bgcolor: isActive 
        ? 'rgba(33, 150, 243, 0.3)' 
        : 'rgba(255,255,255,0.08)',
    },
    transition: 'all 0.2s ease',
  }), []);

  const getListItemIconStyles = useCallback((isActive: boolean) => ({
    color: isActive ? '#2196f3' : 'rgba(255,255,255,0.8)',
    minWidth: 40,
  }), []);

  const getListItemTextStyles = useCallback((isActive: boolean) => ({
    '& .MuiTypography-root': {
      fontWeight: isActive ? 600 : 400,
      fontSize: '0.95rem',
    },
  }), []);

  const renderMenuItem = useCallback((item: typeof menuItems[0]) => {
    const isActive = location.pathname === item.path;
    
    return (
      <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={getListItemButtonStyles(isActive)}
        >
          <ListItemIcon sx={getListItemIconStyles(isActive)}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={getListItemTextStyles(isActive)}
          />
        </ListItemButton>
      </ListItem>
    );
  }, [location.pathname, handleNavigation, getListItemButtonStyles, getListItemIconStyles, getListItemTextStyles]);

  const drawer = useMemo(() => (
    <Box sx={{ height: '100%', bgcolor: '#1a1a2e', color: 'white' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="white">
          Form Builder
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
          Dynamic Forms
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map(renderMenuItem)}
      </List>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.12)',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          © 2025 Form Builder
        </Typography>
      </Box>
    </Box>
  ), [renderMenuItem]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={appBarStyles}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {appBarTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Welcome back!
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={mobileDrawerStyles}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={desktopDrawerStyles}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={mainContentStyles}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
});

AppLayout.displayName = 'AppLayout';