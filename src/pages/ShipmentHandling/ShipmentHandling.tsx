import React, { useState } from "react";
import {
  Box,
  TextField,
  InputLabel,
  Button,
  Card,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { get, BACKEND_URL_V1 } from "../../utils/Api";
import { HumsaferError } from "../../models/HumsaferError";
import styles from "./ShipmentHandling.module.css";
import { ShipmentStatus } from "../../models/ShipmentsView";
import { changeShipmentDetailsStatus } from "../../api/ShipmentDetailsApi";
import { IShipmentDetails } from "../../models/ShipmentDetailsView";
import { IToastBasicProps } from "../../components/Toast/Toast";
import Toast from "../../components/Toast/Toast";

interface IActiveShipment {
  id: string;
  companyId: string;
  status: ShipmentStatus;
  vehicleNumber: string;
  driverName: string;
  driverMobileNumber: string;
  shipmentStartCity: string;
  shipmentDestinationCity: string;
  creationTime: number;
  lastLiveLocationReceivedTime: number;
  shipmentCompletionPercentage: number;
  b2bAffiliation: string;
  vanityId: string;
  companyName: string;
  lastUpdateTime: number;
}

const ShipmentHandling = () => {
  const [identifier, setIdentifier] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });
  const [activeShipment, setActiveShipment] = useState<IActiveShipment | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchActiveShipment = async () => {
    if (!identifier) {
      setError("Please enter a shipment ID or mobile number");
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await get(
        `${BACKEND_URL_V1}/drivers/${identifier}/activeShipment`
      );

      if (response.status === 404) {
        setActiveShipment(null);
        setError("Shipment not found with this shipment ID / mobile number");
      }

      if (response.parsedBody) {
        setActiveShipment(response.parsedBody);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch active shipment");
      setActiveShipment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShipmentStatus = async (
    shipment: IShipmentDetails,
    setStatus: ShipmentStatus
  ) => {
    setIsFetching(true);
    const shipmentOrError = await changeShipmentDetailsStatus(
      shipment.companyId,
      shipment.id,
      setStatus
    );

    setIsFetching(false);
    if (shipmentOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: shipmentOrError.message,
        type: "error",
      });
      return;
    }

    setShowToast({
      open: true,
      message: `Shipment status ${setStatus} changed successfully`,
      type: "success",
    });
    setActiveShipment(null);
    setShowConfirmDialog(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(event.target.value);
    setError(null);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCloseToast = () => {
    setShowToast({ ...showToast, open: false });
  };

  return (
    <Box className={styles.container}>
      <Toast
        open={showToast.open}
        message={showToast.message}
        type={showToast.type}
        onClose={handleCloseToast}
      />
      <Box className={styles.inputContainer}>
        <InputLabel className={styles.label}>
          Shipment ID / Mobile Number
        </InputLabel>
        <Box className={styles.inputWrapper}>
          <TextField
            fullWidth
            value={identifier}
            onChange={handleInputChange}
            placeholder="Enter shipment ID or mobile number"
            error={!!error}
            helperText={error}
            className={styles.input}
          />
          <Button
            variant="contained"
            onClick={fetchActiveShipment}
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit"}
          </Button>
        </Box>
      </Box>
      {activeShipment && (
        <Card className={styles.shipmentCard}>
          <Box className={styles.shipmentHeader}>
            <Typography variant="h6">Shipment Details</Typography>
            {activeShipment.status !== ShipmentStatus.COMPLETE && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isLoading}
              >
                End Shipment
              </Button>
            )}
          </Box>
          {activeShipment && (
            <Grid container spacing={2} className={styles.shipmentDetails}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Shipment ID
                </Typography>
                <Typography variant="body1">
                  {activeShipment.vanityId}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body1">{activeShipment.status}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Company Name
                </Typography>
                <Typography variant="body1">
                  {activeShipment.companyName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Vehicle Number
                </Typography>
                <Typography variant="body1">
                  {activeShipment.vehicleNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  From
                </Typography>
                <Typography variant="body1">
                  {activeShipment.shipmentStartCity}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  To
                </Typography>
                <Typography variant="body1">
                  {activeShipment.shipmentDestinationCity}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Creation Time
                </Typography>
                <Typography variant="body1">
                  {formatTimestamp(activeShipment.creationTime)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatTimestamp(activeShipment.lastUpdateTime)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Trip Completion
                </Typography>
                <Typography variant="body1">
                  {activeShipment.shipmentCompletionPercentage.toFixed(0)}%
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  B2B Affiliation
                </Typography>
                <Typography variant="body1">
                  {activeShipment.b2bAffiliation}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Card>
      )}

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm End Shipment</DialogTitle>
        <DialogContent>
          <Typography>
            Ending this shipment will stop tracking and may result in data loss.
            Proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleShipmentStatus(
                activeShipment as unknown as IShipmentDetails,
                ShipmentStatus.COMPLETE
              )
            }
            color="error"
            variant="contained"
            disabled={isFetching}
          >
            {isFetching ? "Processing..." : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShipmentHandling;
