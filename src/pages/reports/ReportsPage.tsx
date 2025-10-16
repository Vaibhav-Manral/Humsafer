import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useContext, useState } from "react";
import DriverHistoryReport from "../../components/driverHistoryReport/DriverHistoryReport";
import styles from "./ReportsPage.module.css";
import ShipmentCoverageReport from "../../components/shipmentCoverageReport/ShipmentCoverageReport";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";

enum ReportType {
  DRIVING_HISTORY_REPORT = "DRIVING_HISTORY_REPORT",
  SHIPMENT_COVERAGE_REPORT = "SHIPMENT_COVERAGE_REPORT",
}

const ReportsPage: React.FC = React.memo(() => {
  const { primaryColor } = useContext(HumsaferThemeContext);
  const [selectedReportType, setSelectedReportType] = useState(
    ReportType.DRIVING_HISTORY_REPORT
  );

  return (
    <Box>
      <Grid container>
        <Grid item lg={12} md={12} xs={12}>
          <Box className={styles.reportsPage_parentContainer}>
            <Box className={styles.title} style={{ color: primaryColor }}>
              Internal Reports
            </Box>
            <FormControl sx={{ width: "50%" }}>
              <Typography className={styles.paymentInfo_label}>
                Report Type
              </Typography>
              <Select
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
                <MenuItem value={ReportType.DRIVING_HISTORY_REPORT}>
                  Driving History Report
                </MenuItem>
                <MenuItem value={ReportType.SHIPMENT_COVERAGE_REPORT}>
                  Shipment Coverage Report
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Grid
            className={styles.reportsPage_componentContainer}
            item
            lg={12}
            md={12}
            xs={12}
          >
            {selectedReportType === ReportType.DRIVING_HISTORY_REPORT ? (
              <DriverHistoryReport />
            ) : (
              <ShipmentCoverageReport />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
});

export default ReportsPage;
