import { Button, FormHelperText, IconButton, TextField, Typography } from "@mui/material";
import styles from "./DriverSearch.module.css";
import { useState } from "react";
import { Loading } from "../loading/Loading";
import InputAdornment from "@mui/material/InputAdornment";
import {Search ,Help } from "@mui/icons-material";

interface IDriverSearchProps {
  onSearchSumbit: (phoneNumber: string) => void;
  errorMessage: string | undefined;
  isLoading: boolean;
}

const DriverSearch: React.FC<IDriverSearchProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { onSearchSumbit, errorMessage, isLoading } = props;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <TextField
          className={styles.textBox}
          autoFocus={true}
          size="small"
          placeholder="Enter Phone Number / UserId"
          margin="normal"
          variant="outlined"
          onChange={(event) => setPhoneNumber(event.target.value)}
          name="phoneNumber"
          value={phoneNumber}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSearchSumbit(phoneNumber);
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
            },
            "& input:-webkit-autofill": {
              boxShadow: "0 0 0 1000px white inset",
              WebkitTextFillColor: "#000",
              transition: "background-color 5000s ease-in-out 0s",
            },
          }}
        />
        <Button
          className={styles.submitButton}
          variant="contained"
          onClick={() => onSearchSumbit(phoneNumber)}
        >
          <Loading text="Search" isLoading={isLoading} />
        </Button>
      </div>
      {/* <div className={styles.supportCenter}>
        <Typography variant="h6" className={styles.supportCenterTitle}>
          <Help className={styles.supportCenterIcon}/>
          <div className={styles.supportCenterTitleTextContainer}>
            <span className={styles.supportCenterTitleText}>SEARCH DRIVER HERE</span>
          </div>
        </Typography>
      </div> */}
      <FormHelperText error={true} className={styles.errorMessage}>{`${
        errorMessage ?? ""
      }`}</FormHelperText>
    </div>
  );
};

export default DriverSearch;
