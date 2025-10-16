import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { bulkProvisionAffiliations } from "../../api/affiliations";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { B2BAffiliation } from "../../models/DriverProfile";
import { HumsaferError } from "../../models/HumsaferError";
import { Loading } from "../loading/Loading";
import styles from "./AffiliationProvisioning.module.css";

const AffiliationProvisioning: React.FC = () => {
  const { primaryColor } = useContext(HumsaferThemeContext);
  const [mobileNumbersString, setMobileNumbersString] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNumbersError, setMobileNumbersError] = useState(false);
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([]);
  const [affiliation, setAffiliation] = useState(
    B2BAffiliation.UTTARAKHAND_GOVT
  );

  const onSubmitAffiliationRequest = async () => {
    evaluateMobileNumbersInput();
    if (mobileNumbersError) {
      return;
    }
    setIsLoading(true);
    const response = await bulkProvisionAffiliations(
      affiliation,
      mobileNumbers
    );

    setIsLoading(false);
    if (response instanceof HumsaferError) {
      toast.error(response.getErrorMessage());
    } else {
      toast.success("Affiliation has been provisioned");
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
    <div>
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
      <Card className={styles.affiliationProvisioning_container} elevation={0}>
        <CardContent>
          <Box className={styles.affiliationProvisioning_row}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box className={styles.inputContainer}>
                  <Typography className={styles.affiliationProvisioning_label}>
                    Affiliation to add
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={affiliation}
                      onChange={(event) => {
                        setAffiliation(B2BAffiliation[event.target.value]);
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
                          borderColor: primaryColor,
                        },
                        "& .MuiSelect-select": {
                          fontSize: "16px",
                          padding: "14px",
                          textAlign: "left",
                        },
                      }}
                    >
                      {Object.keys(B2BAffiliation).map((key) => (
                        <MenuItem key={key} value={key}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className={styles.inputContainer}>
                  <Typography className={styles.affiliationProvisioning_label}>
                    Mobile Numbers (max 100 numbers allowed)
                  </Typography>
                  <div
                    className={
                      styles.affiliationProvisioning_mobileNumbersDialogBox
                    }
                  >
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
                    />
                  </div>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box className={styles.affiliationProvisioning_row}>
            <Box className={styles.buttonContainer}>
              <Button
                className={styles.submitButton}
                variant="contained"
                onClick={onSubmitAffiliationRequest}
                style={{ backgroundColor: primaryColor }}
              >
                <Loading
                  text="Submit provision request"
                  isLoading={isLoading}
                />
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliationProvisioning;
