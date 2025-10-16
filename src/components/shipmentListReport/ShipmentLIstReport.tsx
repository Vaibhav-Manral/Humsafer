import React, { useState, useContext } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { Moment } from "moment";
import styles from "./ShipmentListReport.module.css";
import { exportShipmentsReport } from "../../api/Reports";
import { Loading } from "../loading/Loading";
import { HumsaferError } from "../../models/HumsaferError";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Auth } from "../../utils/Auth";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";


interface ShipmentListReportProps {
  onSubmit: (startDate: Date, endDate: Date) => void;
  reportType?: string;
}

const ShipmentListReport: React.FC<ShipmentListReportProps> = ({
  onSubmit,
  reportType = "shipmentReport",
}) => {
  const [startDate, setStartDate] = useState<Moment | null>(
    moment().subtract(7, "days")
  );
  const [endDate, setEndDate] = useState<Moment | null>(
    moment().endOf("month")
  );
  const [isLoading, setIsLoading] = useState(false);

  const { selectedCompany } = useContext(CompanyDataContext);
  const { primaryColor } = useContext(HumsaferThemeContext);

  const onShipmentListReportRequest = async () => {
    let companyId = Auth.getInstance().getCompanySettings()?.id ?? "";
    let email = Auth.getInstance().getUserSettings()?.email ?? "";
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }

    setIsLoading(true);
    if (startDate && endDate) {
      const response = await exportShipmentsReport(
        companyId,
        `${startDate.startOf("day").valueOf()}`,
        `${endDate.endOf("day").valueOf()}`,
        email,
        reportType
      );

      setIsLoading(false);
      if (response instanceof HumsaferError) {
        toast.error(response.getErrorMessage());
      } else {
        toast.success("Report sent to registered email");
      }
    }
  };

  const handlefromDateChange = (date: Moment | null) => {
    if (date) {
      setStartDate(date);

      // Calculate the maximum allowed to date based on the selected from date
      const maxAllowedEndDate = moment(date).add(90, "days");

      // If the current to date is outside the 90-day range, set it to the max allowed date
      if (moment(endDate).isAfter(maxAllowedEndDate)) {
        setEndDate(maxAllowedEndDate);
      }
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Box className={styles.paymentInfo_container}>
        <Box className={styles.paymentInfo_row}>
          <Box className={styles.datePickerContainer}>
            <Typography className={styles.paymentInfo_label}>
              Start Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                value={startDate}
                onChange={handlefromDateChange}
                maxDate={endDate || undefined}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Select start date"
                  />
                )}
              />
            </LocalizationProvider>
          </Box>

          <Box className={styles.datePickerContainer}>
            <Typography className={styles.paymentInfo_label}>
              End Date
            </Typography>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || undefined}
                maxDate={
                  startDate ? moment(startDate).add(90, "days") : undefined
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    placeholder="Select end date"
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: primaryColor,
                        outlineColor: primaryColor,
                      },
                      borderRadius: "12px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e0e0e0",
                      },
                      "& .MuiSelect-select": {
                        fontSize: "16px",
                        padding: "14px",
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        <Box className={styles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={onShipmentListReportRequest}
            disabled={!startDate || !endDate}
            className={styles.submitButton}
          >
            <Loading text="Generate Report" isLoading={isLoading} />
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ShipmentListReport;
