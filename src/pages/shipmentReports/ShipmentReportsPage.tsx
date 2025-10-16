import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useContext, useState } from "react";
import styles from "./ShipmentReportsPage.module.css";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import ShipmentReport from "../../components/shipmentListReport/ShipmentLIstReport";
import AccuracyRawReport from "../../components/accuracyRawReport/AccuracyRawReport";

enum ReportType {
  EXPORT_SHIPMENTS = "EXPORT_SHIPMENTS",
  ACCURACY_RAW_REPORT = "ACCURACY_RAW_REPORT",
}

const ShipmentReportsPage: React.FC = React.memo(() => {
  const { primaryColor } = useContext(HumsaferThemeContext);

  const [selectedReportType, setSelectedReportType] = useState(
    ReportType.EXPORT_SHIPMENTS
  );

  const handleReportSubmit = (startDate: Date, endDate: Date) => {
    // Handle the report submission if needed
    console.log("Report submitted with dates:", { startDate, endDate });
  };

  return (
    <Box>
      <Grid container>
        <Grid item lg={12} md={12} xs={12}>
          <Box className={styles.shipmentReportsPage_parentContainer}>
            <Box className={styles.title} style={{ color: primaryColor }}>
              Shipment Reports
            </Box>
            <FormControl sx={{ width: "50%" }}>
              <Typography className={styles.paymentInfo_label}>
                Report Type
              </Typography>
              <Select
                labelId="report-type-select-label"
                id="report-type-select"
                value={selectedReportType}
                onChange={(e) =>
                  setSelectedReportType(e.target.value as ReportType)
                }
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: primaryColor,
                  },
                  "& .MuiSelect-select": {
                    fontSize: "16px",
                    padding: "14px",
                  },
                }}
              >
                <MenuItem value={ReportType.EXPORT_SHIPMENTS}>
                  Export Shipments
                </MenuItem>
                <MenuItem value={ReportType.ACCURACY_RAW_REPORT}>
                  Accuracy raw report
                </MenuItem>
              </Select>
            </FormControl>
       
          </Box>
          <Grid
            className={styles.shipmentReportsPage_componentContainer}
            item
            lg={12}
            md={12}
            xs={12}
          >
            {selectedReportType === ReportType.EXPORT_SHIPMENTS && (
              <ShipmentReport
                onSubmit={handleReportSubmit}
                reportType="shipmentReport"
              />
            )}
            {selectedReportType === ReportType.ACCURACY_RAW_REPORT && (
              <AccuracyRawReport
                onSubmit={handleReportSubmit}
                reportType="accuracyRawReport"
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
});

export default ShipmentReportsPage;
