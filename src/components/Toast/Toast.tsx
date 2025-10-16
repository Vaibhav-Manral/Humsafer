import { Alert, Snackbar, SnackbarOrigin } from "@mui/material";
import React from "react";

export interface IToastBasicProps {
  open: boolean;
  message: string;
  type: "error" | "success";
}

interface IProps {
  position?: SnackbarOrigin;
  onClose: () => void;
  showDurationInMilliSec?: number;
}

const Toast: React.FC<IToastBasicProps & IProps> = ({
  message,
  position = { vertical: "top", horizontal: "center" },
  open,
  type,
  showDurationInMilliSec = 3000,
  onClose,
}) => {
  return (
    <Snackbar
      autoHideDuration={showDurationInMilliSec}
      anchorOrigin={position}
      open={open}
      onClose={onClose}
    >
      <Alert elevation={6} variant="filled" severity={type} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
