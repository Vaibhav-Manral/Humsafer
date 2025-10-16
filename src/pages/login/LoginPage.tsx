import React, { useState, useCallback, useContext, useEffect } from "react";
import styles from "./LoginPage.module.css";
import { Auth } from "../../utils/Auth";
import "react-phone-number-input/style.css";
import PhoneInput, { Country } from "react-phone-number-input";
import { Config } from "../../utils/Config";
import PhoneNumber from "../../components/phoneNumber/PhoneNumber";
import { Button, Container, FormHelperText, useMediaQuery, Theme } from "@mui/material";
import { OtpInput } from "../../components/otpInput/OtpInput";
import { validatePhone } from "./Validate";
import { Navigate } from "react-router-dom";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { Loading } from "../../components/loading/Loading";
import { getSettings } from "../../api/Users";
import { HumsaferError } from "../../models/HumsaferError";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import classNames from "classnames";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import type { E164Number } from 'libphonenumber-js'

const LoginPage: React.FC = () => {
  const [isLoggedIn, setLoggedIn] = useState(Auth.getInstance().isLoggedIn());
  const [phoneNumber, setPhoneNumber] = useState<E164Number>();
  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [loginButtonClicked, setLoginButtonClicked] = useState(false);
  const [otpCode, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [timerCount, setTimerCount] = useState(0);
  const [authReferenceId, setAuthReferenceId] = useState<string | undefined>();

  const supportedCountries = Config.getInstance()
    .getSupportedCountries()
    .map((country) => {
      return country.countryCode as Country;
    });

  const validate = useCallback(
    async (phone: E164Number | undefined) => {
      if (nextButtonClicked || phone === undefined) {
        return;
      }

      setNextButtonClicked(true);
      const resultOrError = await validatePhone(phone);
      if (resultOrError instanceof HumsaferError) {
        setErrorMessage(resultOrError.message);
      } else {
        setAuthReferenceId(resultOrError.referenceId);
        setErrorMessage("");
        setOtpSent(true);
        setTimerCount(60);
      }
      setNextButtonClicked(false);
    },
    [nextButtonClicked, setNextButtonClicked, setOtpSent]
  );

  const login = useCallback(
    async (otpCode: string) => {
      try {
        if (loginButtonClicked || !authReferenceId) {
          return;
        }

        setLoginButtonClicked(true);
          const error = await Auth.getInstance().verifyOtpV2(authReferenceId, otpCode);
          if (error) {
            setErrorMessage(error.message);
          } else {
            const userSettingsOrError = await getSettings();
            if (userSettingsOrError instanceof HumsaferError) {
              setErrorMessage(userSettingsOrError.message);
            } else {
              setLoggedIn(true);
            }
          }
          setLoginButtonClicked(false);
      } catch (error) {
        console.error("API call failed:", error);
      }
    },
    [loginButtonClicked, authReferenceId]
  );

  const { logo, logoBg } = useContext(HumsaferThemeContext);
  function maskPhoneNumber(phoneNumber) {
    if (phoneNumber) {
      const visibleDigits = 3;
      const startIndex = phoneNumber.indexOf('+') === 0 ? 3 : 0;
      const masked = phoneNumber.slice(0, startIndex)
        + '*'.repeat(phoneNumber.length - (startIndex + visibleDigits))
        + phoneNumber.slice(-visibleDigits);
      return masked;
    } else {
      return "";

    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  useEffect(() => {
    let timer;
    if (timerCount > 0) {
      timer = setTimeout(() => {
        setTimerCount(timerCount - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timerCount]);

  if (isLoggedIn) {
    return <Navigate to={"/"} />;
  }
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <Container>
            <div className={styles.root} >
              <div>
                <img src={logo} alt="logo" className={styles.logo} />
                <form
                  className={classNames(styles.form, isMobile ? "" : styles.container_width)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    phoneNumber && validate(phoneNumber);
                  }}
                >
                  {!otpSent && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12} sm={12} justifyContent={"start"} >
                        <div className={styles.mainHeader}>Welcome!</div>
                        <div className={styles.subHeader}>Enter your contact no to log in </div>
                        <label className={styles.label}>Contact No</label>
                      </Grid>
                      <Grid item xs={12} md={12} sm={12}>
                        <PhoneInput
                          countries={supportedCountries}
                          addInternationalOption={false}
                          placeholder="Phone number"
                          value={phoneNumber}
                          onChange={(val) => {
                            if (val === undefined) {
                              return;
                            }

                            setPhoneNumber(val);
                            setErrorMessage("");
                          }}
                          inputComponent={PhoneNumber}
                          autoFocus={true}
                        />
                        <FormHelperText error={true}>{`${errorMessage}`}</FormHelperText>
                      </Grid>
                      <Grid item xs={12} md={12} sm={12}>
                        <Button
                          id={"validate"}
                          variant="contained"
                          size="small"
                          classes={{ root: styles.validate }}
                          onClick={() => phoneNumber && validate(phoneNumber)}
                        >
                          <Loading text="Send OTP" isLoading={nextButtonClicked} />
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                  {otpSent && (
                    <Grid spacing={2}>
                      <Grid item xs={12} md={12} sm={12}>
                        <div className={styles.otp_back}><KeyboardBackspaceIcon className={styles.otp_back_icon} onClick={() => setOtpSent(!otpSent)} /></div>
                        <div className={styles.subHeader}>
                          {`OTP has been sent on your number ${maskPhoneNumber(phoneNumber)}`}</div>

                        <div className={styles.otp_label}>Enter OTP</div>
                        <OtpInput
                          setOtp={setOtp}
                          onEnterPressed={() => {
                            login(otpCode);
                          }}
                        />
                        <FormHelperText error={true}>{` ${errorMessage}`}</FormHelperText>

                        <span className={styles.otp_resend_counter} >{timerCount ? formatTime(timerCount) : ""}</span>
                        <Button
                          id={"validate"}
                          classes={{ root: styles.validate }}
                          variant="contained"
                          size="small"
                          onClick={() => login(otpCode)}
                        >
                          <Loading text="Login" isLoading={loginButtonClicked} />
                        </Button>
                        {!timerCount ? <span className={styles.otp_resend} onClick={() => phoneNumber && validate(phoneNumber)}> Resend OTP</span> : ""}
                      </Grid>
                    </Grid>
                  )}
                </form>
              </div>
            </div>
          </Container>
        </Grid>
        <Hidden smDown>
          <Grid item xs={12} md={6} className={styles.bg_image} style={{ backgroundImage: `url(${logoBg})` }}>
          </Grid>
        </Hidden>
      </Grid>
    </Box>
  );
}

export default LoginPage;

