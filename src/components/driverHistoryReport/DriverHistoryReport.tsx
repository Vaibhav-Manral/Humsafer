import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import styles from "./DriverHistoryReport.module.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { IDrivingHistoryReportType } from "../../api/Reports";
import { Loading } from "../loading/Loading";
import { triggerDrivingHistoryReport } from "../../api/Reports";
import {
  firstOfThisMonth,
  formatDateForBackend,
  lastOfThisMonth,
} from "../../utils/DateUtils";
import { HumsaferError } from "../../models/HumsaferError";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DriverHistoryReport: React.FC = () => {
  const [startDate, setStartDate] = useState(firstOfThisMonth());
  const [endDate, setEndDate] = useState(lastOfThisMonth());
  const [reportType, setReportType] = useState(
    IDrivingHistoryReportType.WEEKLY
  );
  const [mobileNumbersString, setMobileNumbersString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNumbersError, setMobileNumbersError] = useState(false);
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([]);

  const onDrivingHistoryReportRequest = async () => {
    evaluateMobileNumbersInput();
    if (mobileNumbersError) {
      return;
    }
    setIsLoading(true);
    const response = await triggerDrivingHistoryReport(
      formatDateForBackend(startDate),
      formatDateForBackend(endDate),
      reportType,
      mobileNumbers
    );

    setIsLoading(false);
    if (response instanceof HumsaferError) {
      toast.error(response.getErrorMessage());
    } else {
      toast.success("Report sent to registered email");
    }
  };

  const evaluateMobileNumbersInput = () => {
    const splitNumbers = mobileNumbersString
      .split("\n")
      .join(",")
      .split(" ")
      .join(",")
      .split(",");

    var errorFound = false;
    const mostlyValidNumbers: string[] = [];
    for (var possibleNumber of splitNumbers) {
      const trimmedNumber = possibleNumber.trim();
      if (trimmedNumber === "") {
        continue;
      }
      if (trimmedNumber.length < 10) {
        setMobileNumbersError(true);
        errorFound = true;
        break;
      }
      mostlyValidNumbers.push(trimmedNumber);
    }

    if (!errorFound) {
      setMobileNumbersError(false);
      setMobileNumbers(mostlyValidNumbers);
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
              History Report Type
            </Typography>
            <FormControl fullWidth>
              <Select
                value={reportType}
                onChange={(event) => {
                  setReportType(IDrivingHistoryReportType[event.target.value]);
                }}
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#bdbdbd",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary-color)",
                  },
                  "& .MuiSelect-select": {
                    fontSize: "16px",
                    padding: "14px",
                  },
                }}
              >
                <MenuItem value={IDrivingHistoryReportType.WEEKLY}>
                  Weekly
                </MenuItem>
                <MenuItem value={IDrivingHistoryReportType.MONTHLY}>
                  Monthly
                </MenuItem>
                <MenuItem value={IDrivingHistoryReportType.DAILY}>
                  Daily
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {reportType === IDrivingHistoryReportType.DAILY && (
            <Box className={styles.datePickerContainer}>
              <Typography className={styles.paymentInfo_label}>
                For Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  value={startDate}
                  onChange={(date) => {
                    if (date) {
                      setStartDate(date);
                      setEndDate(date);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Select date"
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>
          )}
          {reportType !== IDrivingHistoryReportType.DAILY && (
            <>
              <Box className={styles.datePickerContainer}>
                <Typography className={styles.paymentInfo_label}>
                  Start Date
                </Typography>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    value={startDate}
                    onChange={(date) => {
                      if (date) {
                        setStartDate(date);
                      }
                    }}
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
                    onChange={(date) => {
                      if (date) {
                        setEndDate(date);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Select end date"
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>
            </>
          )}
        </Box>

        <Box className={styles.paymentInfo_row}>
          <Box className={styles.datePickerContainer}>
            <Typography className={styles.paymentInfo_label}>
              Mobile Numbers (max 100 numbers allowed)
            </Typography>
            <TextField
              variant="outlined"
              multiline={true}
              rows={3}
              type="text"
              fullWidth
              helperText={
                mobileNumbersError
                  ? "Comma separated valid numbers required"
                  : ""
              }
              error={mobileNumbersError}
              onFocus={() => {
                setMobileNumbersError(false);
              }}
              onBlur={() => {
                evaluateMobileNumbersInput();
              }}
              onChange={(event) => {
                setMobileNumbersString(event.target.value);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#bdbdbd",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--primary-color)",
                },
              }}
            />
          </Box>
        </Box>

        <Box className={styles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={onDrivingHistoryReportRequest}
            className={styles.submitButton}
          >
            <Loading text="Request Report" isLoading={isLoading} />
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DriverHistoryReport;
