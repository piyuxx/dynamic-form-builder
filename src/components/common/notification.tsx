import React from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

export interface NotificationProps {
  open: boolean;
  message: string;
  type?: AlertColor;
  duration?: number;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  type = 'success',
  duration = 4000,
  onClose
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity={type}
        onClose={onClose}
        variant="filled"
        sx={{ minWidth: '300px' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};