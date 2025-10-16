import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ReportIcon from "@mui/icons-material/Report";
import styles from "./Dialog.module.css";
import { Button } from "@mui/material";
import { Loading } from "../loading/Loading";
import { IShipment } from "../../models/ShipmentsView";
import ActiveShipmentInfo from "../activeShipmentInfo/ActiveShipmentInfo";

export interface IShipmentErrorData {
  existingShipmentId: String;
}

export interface IDialogProps {
  open: boolean;
  message: string;
  type: "error" | "success";
  onClose?: () => void;
  isLoading?: boolean;
  onEndActiveTrip?: () => void;
  isSameCompany?: boolean;
  shipmentData?: IShipment;
  errorData?: IShipmentErrorData;
}

const DialogMessage: React.FC<IDialogProps> = ({
  open,
  message,
  type,
  onClose,
  isLoading,
  onEndActiveTrip,
  isSameCompany,
  shipmentData,
  errorData,
}) => {
  const handleShipmentIdClick = () => {
    if (errorData?.existingShipmentId) {
      window.open(`/shipments/${errorData.existingShipmentId}`, "_blank");
    }
  };

  return (
    <div className={styles.dialog_border}>
      <Dialog
        open={open}
        maxWidth="xs"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle className={styles.dialog_icon}>
          {type === "error" ? (
            <ReportIcon className={styles.dialog_error_icon} />
          ) : (
            <img src="/assets/successIcon.svg" alt="icon" />
          )}
        </DialogTitle>

        <DialogContent>
          <DialogContentText className={styles.dialog_message}>
            {type === "error" && isSameCompany ? (
              <span>The Driver already has an active shipment.</span>
            ) : (
              <span>{message}</span>
            )}
            <br />
            {errorData && (
              <span
                className={styles.clickable_text}
                onClick={handleShipmentIdClick}
              >
                View Active Shipment
              </span>
            )}
          </DialogContentText>

          {type === "error" && isSameCompany && (
            <DialogContentText className={styles.dialog_message}>
              You can end this <b>driver's active shipment</b> and start the new
              one or <b>cancel</b>.
            </DialogContentText>
          )}
        </DialogContent>

        {shipmentData && (
          <DialogContent>
            <div className={styles.activeShipmentInfoContainer}>
              <ActiveShipmentInfo shipmentData={shipmentData} />
            </div>
          </DialogContent>
        )}

        <DialogActions className={styles.dialog_action}>
          {type === "error" && isSameCompany && (
            <Button
              variant="contained"
              disabled={isLoading}
              onClick={onEndActiveTrip}
              className={styles.dialog_button}
            >
              {isLoading ? (
                <Loading isLoading />
              ) : (
                "End Active Trip and Start New Trip"
              )}
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={onClose}
            className={styles.dialog_button}
          >
            {"OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialogMessage;
