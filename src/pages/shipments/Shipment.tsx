import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import DialogMessage, { IDialogProps } from "../../components/dialog/Dialog";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { HumsaferError } from "../../models/HumsaferError";
import styles from "./Shipment.module.css";
import { useForm } from "react-hook-form";
import { Loading } from "../../components/loading/Loading";
import { useMediaQuery, Theme } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Autocomplete } from "@react-google-maps/api";
import { addShipment } from "../../api/ShipmentsApi";
import { IAddShipmentRequest, IAddress } from "../../models/Shipments";
import { getUserDetails } from "../../api/SearchApi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import InputAdornment from "@mui/material/InputAdornment";
import { Auth } from "../../utils/Auth";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { isAllowedToSwitchCompanies } from "../../utils/CapabitilityUtils";
import CompanyInfoWithSwitcher from "../../components/companyInfoWithSwitcher/CompanyInfoWithSwitcher";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IShipment, ShipmentStatus } from "../../models/ShipmentsView";
import { changeShipmentDetailsStatus } from "../../api/ShipmentDetailsApi";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import { ErrorCode } from "../../models/HumsaferServerError";
import inputArrow from "../../assets/dropdownArrow.svg";
import { get } from "../../utils/Api";
import { B2BAffiliation } from "../../models/DriverProfile";
import { useGoogleMaps } from "../../utils/GoogleMapsSingleton";

interface IStart {
  startLatitude: number;
  startLongitude: number;
}
interface IDestination {
  destinationLatitude: number;
  destinationLongitude: number;
}

// const mapKey = Config.getInstance().getMapKeyConfig();
// const libraries: "places"[] = ["places"];
function getAddressFromGooglePlaceResult(
  place: google.maps.places.PlaceResult
) {
  let initialFromAddressData: Partial<IAddress> = {
    placeName: place.name,
    formattedAddress: place.formatted_address,
    latitude: place.geometry?.location?.lat() ?? 0,
    longitude: place.geometry?.location?.lng() ?? 0,
  };
  for (const addressData of place?.address_components ?? []) {
    if (addressData.types.includes("locality")) {
      initialFromAddressData.locality = addressData.long_name;
    }
    if (addressData.types.includes("administrative_area_level_3")) {
      initialFromAddressData.city = addressData.long_name;
    }
    if (addressData.types.includes("country")) {
      initialFromAddressData.country = addressData.long_name;
    }
    if (addressData.types.includes("postal_code")) {
      initialFromAddressData.pinCode = addressData.long_name;
    }
    if (addressData.types.includes("administrative_area_level_1")) {
      initialFromAddressData.state = addressData.long_name;
    }
  }

  return initialFromAddressData as IAddress;
}

const Shipment: React.FC = React.memo(() => {
  const { primaryColor } = useContext(HumsaferThemeContext);
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const [stepper, setStepper] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedEndTime, setEstimatedEndTime] = useState<Date | null>(
    new Date()
  );
  const [associatedEntity, setAssociatedEntity] = useState<string>("");
  const [fromPlace, setFromPlace] = useState<IStart | null>(null);
  const [fromPlaceValue, setFromPlaceValue] = useState<string>();
  const [toPlace, setToPlace] = useState<IDestination | null>(null);
  const [toPlaceValue, setToPlaceValue] = useState<string>();
  const [placeSelectedFrom, setPlaceSelectedFrom] = useState<boolean>(true);
  const [placeSelectedTo, setPlaceSelectedTo] = useState<boolean>(true);
  const fromAutocompleteRef = useRef<google.maps.places.Autocomplete>();
  const toAutocompleteRef = useRef<google.maps.places.Autocomplete>();
  const [showDialog, setShowDialog] = useState<IDialogProps>({
    open: false,
    message: "",
    type: "success",
  });
  const { shipmentBg } = useContext(HumsaferThemeContext);
  const [startAddress, setStartAddress] = useState<IAddress>();
  const [destinationAddress, setDestinationAddress] = useState<IAddress>();
  const mobileRef = useRef<HTMLInputElement>(null);
  const [expectedDriverFirstName, setExpectedDriverFirstName] =
    useState<string>("");
  const [expectedDriverLastName, setExpectedDriverLastName] =
    useState<string>("");
  const [expectedDriverMobileNumber, setExpectedDriverMobileNumber] =
    useState<string>("");
  const [nextFieldsEntered, setNextFieldsEntered] = useState(false);
  const [driverFieldsEntered, setDriverFieldsEntered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [driverActiveShipmetnId, setDriverActiveShipmentId] =
    useState<string>("");
  const [driverActiveShipmentCompanyId, setDriverActiveShipmentCompanyId] =
    useState<string>("");
  const [formData, setFormData] = useState<IAddShipmentRequest>();
  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const { selectedCompany } = useContext(CompanyDataContext);
  const allowCompanySwitcher = isAllowedToSwitchCompanies();
  const { isLoaded } = useGoogleMaps();
  const [affiliation, setAffiliation] = useState(
    B2BAffiliation.DORF_KETTLE
  );
  const [countryList] = useState(["India", "Nepal"]);

  // Helper to check if effective company is Dorf kettle
  const effectiveCompany = selectedCompany || Auth.getInstance().getCompanySettings();
  const isDorfKettle = effectiveCompany?.name?.toLowerCase() === "dorf kettle";

  const handleFromPlaceSelected = () => {
    if (fromAutocompleteRef?.current) {
      const place: google.maps.places.PlaceResult | null =
        fromAutocompleteRef.current.getPlace();
      if (place?.geometry) {
        const address = getAddressFromGooglePlaceResult(place);
        setFromPlace({
          startLatitude: address.latitude,
          startLongitude: address.longitude,
        });
        setPlaceSelectedFrom(true);
        setFromPlaceValue(getValues("from"));
        setStartAddress(address);
      } else {
        setPlaceSelectedFrom(false);
      }
    }
  };

  const handleToPlaceSelected = () => {
    if (toAutocompleteRef.current) {
      const place: google.maps.places.PlaceResult | null =
        toAutocompleteRef.current.getPlace();
      if (place?.geometry) {
        const address = getAddressFromGooglePlaceResult(place);
        setToPlace({
          destinationLatitude: address.latitude,
          destinationLongitude: address.longitude,
        });
        setPlaceSelectedTo(true);
        setToPlaceValue(getValues("to"));
        setDestinationAddress(address);
      } else {
        setPlaceSelectedTo(false);
      }
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<IAddShipmentRequest>();

  const Fields = watch();

  useEffect(() => {
    if (vehicleNumber && Fields.from && Fields.to && associatedEntity) {
      setNextFieldsEntered(true);
    } else {
      setNextFieldsEntered(false);
    }
  }, [Fields, associatedEntity, vehicleNumber]);

  useEffect(() => {
    if (
      expectedDriverMobileNumber &&
      expectedDriverFirstName &&
      expectedDriverLastName
    ) {
      setDriverFieldsEntered(true);
    } else {
      setDriverFieldsEntered(false);
    }
  }, [
    expectedDriverFirstName,
    expectedDriverLastName,
    expectedDriverMobileNumber,
  ]);

  useEffect(() => {
    fromPlaceValue !== getValues("from")
      ? setPlaceSelectedFrom(false)
      : setPlaceSelectedFrom(true);
    toPlaceValue !== getValues("to")
      ? setPlaceSelectedTo(false)
      : setPlaceSelectedTo(true);
  }, [fromPlaceValue, getValues, toPlaceValue]);

  const fetchUserDetails = async (mobileNumber: string) => {
    let MobileNumber = mobileNumber;
    if (!MobileNumber.startsWith("+91")) {
      MobileNumber = "+91".concat(MobileNumber);
    }

    const userInfo = await getUserDetails(MobileNumber);

    if (userInfo) {
      const { id, name, activeShipmentCompanyId, activeShipmentId } = userInfo;
      setUserId(id);
      setDriverActiveShipmentCompanyId(activeShipmentCompanyId);
      setDriverActiveShipmentId(activeShipmentId);
      if (name) {
        const [firstName, lastName] = name.split(" ");
        setExpectedDriverFirstName(firstName);
        setExpectedDriverLastName(lastName);
        setValue("expectedDriverFirstName", firstName);
        setValue("expectedDriverLastName", lastName);
      }
    }
  };

  const handleShipmentStatus = async (
    companyId: string,
    shipmentId: string,
    setStatus: ShipmentStatus
  ) => {
    setIsFetching(true);
    const shipmentOrError = await changeShipmentDetailsStatus(
      companyId,
      shipmentId,
      setStatus
    );
    setIsFetching(false);
    if (shipmentOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: shipmentOrError.message + " Please Try Again.",
        type: "error",
      });
      handleDialogClose();
      return;
    }

    setShowToast({
      open: true,
      message: `Shipment status ${setStatus} changed successfully!`,
      type: "success",
    });
    handleDialogClose();
    if (formData) {
      onSubmit(formData);
    }
  };

  const onSubmit = async (props: IAddShipmentRequest) => {
    setFormData(props);
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }

    if (companyId === undefined) {
      return;
    }

    setIsSubmitting(true);
    let shipmentOrError: IShipment | HumsaferError;
    const { expectedDriverMobileNumber, ...rest } = props;
    let MobileNumber = expectedDriverMobileNumber;
    if (!MobileNumber.startsWith("+91")) {
      MobileNumber = "+91".concat(MobileNumber);
    }
    // Only include b2bAffiliation if Dorf kettle
    const newShipmentRequest: Partial<IAddShipmentRequest> = {
      expectedDriverMobileNumber: MobileNumber,
      ...rest,
      ...toPlace,
      ...fromPlace,
      assignedDriverUserId: userId,
      estimatedEndTime: estimatedEndTime,
      startAddress: startAddress,
      destinationAddress: destinationAddress,
      ...(isDorfKettle ? { b2bAffiliation: affiliation } : {}),
    };
    shipmentOrError = await addShipment(
      companyId,
      newShipmentRequest as IAddShipmentRequest
    );

    setIsSubmitting(false);
    if (shipmentOrError instanceof HumsaferError) {
      const fallbackCompanyId =
        selectedCompany?.id ||
        Auth.getInstance().getCompanySettings()?.id ||
        "";
      if (
        shipmentOrError.errorCode ===
        ErrorCode.DRIVER_SHIPMENT_ALREADY_EXISTS_IN_COMPANY_EXCEPTION
      ) {
        setDriverActiveShipmentCompanyId(fallbackCompanyId);
        setDriverActiveShipmentId(
          shipmentOrError.details?.existingShipmentId || ""
        );
        setShowDialog({
          open: true,
          message: shipmentOrError.message,
          type: "error",
          errorData: shipmentOrError.details,
        });
        return;
      }
      if (
        shipmentOrError.errorCode ===
        ErrorCode.DRIVER_SHIPMENT_ALREADY_EXISTS_IN_DIFFERENT_COMPANY_EXCEPTION
      ) {
        setDriverActiveShipmentCompanyId("");
        setDriverActiveShipmentId(
          shipmentOrError.details?.existingShipmentId || ""
        );
        setShowDialog({
          open: true,
          message: shipmentOrError.message,
          type: "error",
          errorData: shipmentOrError.details,
        });
        return;
      }

      setShowToast({
        open: true,
        message: shipmentOrError.message,
        type: "error",
      });
      return;
    }

    setShowDialog({
      open: true,
      message: `Your shipment has been successfully created!`,
      type: "success",
      shipmentData: shipmentOrError,
    });
    setStepper(1);
    reset();
    setAssociatedEntity("");
    setExpectedDriverFirstName("");
    setExpectedDriverLastName("");
    setVehicleNumber("");
    setExpectedDriverMobileNumber("");
    setUserId(null);
    setDriverActiveShipmentCompanyId("");
    setDriverActiveShipmentId("");
  };
  async function fetchCountryFromCoordinates(
    lat: number,
    lon: number
  ): Promise<string | undefined> {
    try {
      const response: any = await get(
        `https://app.humsafer.co.in/api/portal/v1/location/reverse-geocode?lat=${lat}&lon=${lon}`
      );
      console.log(response, "response...");
      const data = await response?.parsedBody?.address?.country;
      console.log(response, "response...");

      return data || undefined;
    } catch (error) {
      return undefined;
    }
  }

  async function handleNextClick() {
    const isValid = await trigger();
    if (fromPlaceValue !== getValues("from")) {
      setPlaceSelectedFrom(false);
      return false;
    }
    if (toPlaceValue !== getValues("to")) {
      setPlaceSelectedTo(false);
      return false;
    }

    function delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    if (isValid && placeSelectedFrom && placeSelectedTo) {
      let startCountry: string | undefined = startAddress?.country;
      let destinationCountry: string | undefined = destinationAddress?.country;
      console.log(
        placeSelectedFrom,
        "placeSelectedFrom",
        startCountry,
        "startCountry",
        placeSelectedTo,
        "placeSelectedTo",
        destinationCountry,
        "destinationCountry"
      );

      if (!startCountry && startAddress?.latitude && startAddress?.longitude) {
        startCountry = await fetchCountryFromCoordinates(
          startAddress.latitude,
          startAddress.longitude
        );
      }

      await delay(1000);

      if (
        !destinationCountry &&
        destinationAddress?.latitude &&
        destinationAddress?.longitude
      ) {
        destinationCountry = await fetchCountryFromCoordinates(
          destinationAddress.latitude,
          destinationAddress.longitude
        );
      }
      let xyz = false;
      console.log(countryList, "countr");
      console.log(countryList.includes(startCountry as string));
      console.log(countryList.includes(destinationCountry as string));
      console.log(typeof destinationCountry);
      if (
        countryList.includes(startCountry as string) &&
        countryList.includes(destinationCountry as string)
      ) {
        xyz = true;
      }
      if (!xyz) {
        setShowToast({
          open: true,
          message: "From and To Addresses need to be in the same country.",
          type: "error",
        });
        return;
      }

      setStepper(2);
    }
  }

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const handleDialogClose = () => {
    setShowDialog((prevState) => ({
      ...prevState,
      open: false,
    }));
  };

  const handleFromAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete | any
  ) => {
    if (typeof google !== "undefined" && google.maps.places) {
      fromAutocompleteRef.current = autocomplete;
      autocomplete.setFields([
        "geometry",
        "name",
        "formatted_address",
        "address_components",
      ]);
    }
  };

  const handleToAutocompleteLoad = (
    autocomplete: google.maps.places.Autocomplete
  ) => {
    if (typeof google !== "undefined" && google.maps.places) {
      toAutocompleteRef.current = autocomplete;
      autocomplete.setFields([
        "geometry",
        "name",
        "formatted_address",
        "address_components",
      ]);
    }
  };

  let associatedEntities =
    Auth.getInstance().getCompanySettings()?.associatedEntities;
  if (selectedCompany) {
    associatedEntities = selectedCompany.associatedEntities;
  }
  if (associatedEntities === undefined) {
    associatedEntities = [];
  }
  // Sort the associatedEntities alphabetically (case-insensitive)
  associatedEntities = [...associatedEntities].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  return (
    <>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      <DialogMessage
        open={showDialog.open}
        message={showDialog.message}
        onClose={handleDialogClose}
        type={showDialog.type}
        isLoading={isFetching}
        onEndActiveTrip={() => {
          handleShipmentStatus(
            driverActiveShipmentCompanyId,
            driverActiveShipmetnId,
            ShipmentStatus.COMPLETE
          );
        }}
        isSameCompany={
          (selectedCompany?.id ||
            Auth.getInstance().getCompanySettings()?.id ||
            "") === driverActiveShipmentCompanyId
            ? true
            : false
        }
        shipmentData={showDialog.shipmentData}
        errorData={showDialog.errorData}
      />
      {allowCompanySwitcher && <CompanyInfoWithSwitcher />}
      <Card>
        <CardContent className={styles.shipment_cardContent}>
          <Grid container>
            <Grid item lg={6} md={6} xs={12}>
              <div
                className={
                  isMobile
                    ? styles.shipment_form_content_res
                    : styles.shipment_form_content
                }
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={1}>
                      {stepper === 1 ? (
                        <>
                          <Grid item xs={12} md={12}>
                            <div className={styles.shipment_form_heder}>
                              Create Shipment
                            </div>
                            {isMobile ? (
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <div
                                    className={styles.shipment_border_orange}
                                  ></div>
                                </Grid>
                                <Grid item xs={6}>
                                  <div className={styles.shipment_border_gray}>
                                    {" "}
                                  </div>
                                </Grid>
                              </Grid>
                            ) : (
                              ""
                            )}
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <InputLabel className={styles.form_label_style}>
                              Vehicle No
                            </InputLabel>
                            <TextField
                              {...register("vehicleNumber", {
                                required: "Vehicle number is required",
                              })}
                              className={styles.shipment_input}
                              error={errors.vehicleNumber !== undefined}
                              type={"text"}
                              placeholder="Eg. Gj KN 9021"
                              fullWidth
                              margin="normal"
                              variant="outlined"
                              size="small"
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              value={vehicleNumber}
                              sx={{
                                "& input:-webkit-autofill": {
                                  boxShadow: "0 0 0 1000px white inset",
                                  WebkitTextFillColor: "#000",
                                  transition:
                                    "background-color 5000s ease-in-out 0s",
                                },
                              }}
                            />
                          </Grid>
                          {isLoaded ? (
                            <>
                              <Grid item xs={12} md={12}>
                                <InputLabel className={styles.form_label_style}>
                                  From
                                </InputLabel>
                                <Autocomplete
                                  onLoad={handleFromAutocompleteLoad}
                                  onPlaceChanged={handleFromPlaceSelected}
                                >
                                  <TextField
                                    {...register("from", {
                                      required: "From required",
                                    })}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleFromPlaceSelected();
                                      }
                                    }}
                                    className={styles.shipment_input}
                                    placeholder="Enter city"
                                    error={
                                      (!!errors.from &&
                                        (touchedFields.from || isSubmitted)) ||
                                      !placeSelectedFrom
                                    }
                                    type={"text"}
                                    fullWidth
                                    name="from"
                                    margin="normal"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Autocomplete>
                              </Grid>
                              <Grid item xs={12} md={12}>
                                <InputLabel className={styles.form_label_style}>
                                  To
                                </InputLabel>
                                <Autocomplete
                                  onLoad={handleToAutocompleteLoad}
                                  onPlaceChanged={handleToPlaceSelected}
                                >
                                  <TextField
                                    {...register("to", {
                                      required: true,
                                    })}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleToPlaceSelected();
                                      }
                                    }}
                                    className={styles.shipment_input}
                                    placeholder="Enter city"
                                    error={
                                      (!!errors.to &&
                                        (touchedFields.to || isSubmitted)) ||
                                      !placeSelectedTo
                                    }
                                    type={"text"}
                                    name="to"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    size="small"
                                  />
                                </Autocomplete>
                              </Grid>
                            </>
                          ) : (
                            ""
                          )}
                          <Grid item xs={12} md={12}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                              <InputLabel className={styles.form_label_style}>
                                ETA Date
                              </InputLabel>
                              <DatePicker
                                renderInput={(props) => (
                                  <TextField
                                    {...props}
                                    className={styles.shipment_input}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    size="small"
                                  />
                                )}
                                value={estimatedEndTime}
                                onChange={(newValue) => {
                                  setEstimatedEndTime(
                                    newValue
                                      ? newValue.toDate()
                                      : moment().toDate()
                                  );
                                }}
                                minDate={moment()}
                              />
                            </LocalizationProvider>
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <InputLabel className={styles.form_label_style}>
                              Select Transporter
                            </InputLabel>
                            <TextField
                              {...register("associatedEntity", {
                                required: true,
                              })}
                              error={errors.associatedEntity !== undefined}
                              className={styles.shipment_input}
                              fullWidth
                              name="associatedEntity"
                              margin="normal"
                              variant="outlined"
                              select
                              size="small"
                              value={associatedEntity}
                              SelectProps={{
                                displayEmpty: true,
                                renderValue:
                                  associatedEntity !== ""
                                    ? undefined
                                    : () => "Select Transporter",
                                IconComponent: () => (
                                  <img
                                    src={inputArrow}
                                    alt="dropdown arrow"
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      right: "8px",
                                      position: "absolute",
                                      pointerEvents: "none",
                                    }}
                                  />
                                ),
                              }}
                              InputLabelProps={{ shrink: false }}
                              onChange={(e) => {
                                setAssociatedEntity(e.target.value);
                              }}
                            >
                              <MenuItem disabled value="">
                                <em>Select Transporter</em>
                              </MenuItem>
                              {associatedEntities.map((item) => (
                                <MenuItem key={item} value={item}>
                                  {item}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={12}
                            className={styles.next_button_style}
                          >
                            <Button
                              type="button"
                              onClick={() => handleNextClick()}
                              variant="contained"
                              className={
                                nextFieldsEntered
                                  ? styles.shipment_next_button_filled
                                  : styles.shipment_next_button
                              }
                            >
                              <Loading isLoading={isSubmitting} text="Next" />
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          <Grid item xs={12} md={12}>
                            <div className={styles.shipment_form_heder}>
                              {isMobile ? (
                                <span
                                  className={styles.shipment_back_button_res}
                                  onClick={() => setStepper(1)}
                                >
                                  <ArrowBackIosNewIcon
                                    className={styles.back_arrow_style}
                                  />{" "}
                                </span>
                              ) : (
                                <span
                                  className={styles.shipment_back_button}
                                  onClick={() => setStepper(1)}
                                >
                                  <ArrowBackIcon
                                    className={styles.back_arrow_style}
                                  />
                                </span>
                              )}
                              Driver Details
                            </div>
                            {isMobile ? (
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <div
                                    className={styles.shipment_border_orange}
                                  ></div>
                                </Grid>
                                <Grid item xs={6}>
                                  <div
                                    className={styles.shipment_border_orange}
                                  >
                                    {" "}
                                  </div>
                                </Grid>
                              </Grid>
                            ) : (
                              ""
                            )}
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <InputLabel className={styles.form_label_style}>
                              Enter Driver Contact No
                            </InputLabel>
                            <TextField
                              {...register("expectedDriverMobileNumber", {
                                required: true,
                                validate: {
                                  isValidMobile: (value) =>
                                    /^\d{10}$/.test(value) ||
                                    "Mobile number must be exactly 10 digits.",
                                },
                              })}
                              className={styles.shipment_input}
                              placeholder="Enter contact no"
                              onInput={() => {
                                const inputElement = mobileRef.current;
                                if (inputElement) {
                                  const numericValue =
                                    inputElement.value.replace(/\D/g, "");
                                  inputElement.value = numericValue;
                                  setExpectedDriverMobileNumber(numericValue);

                                  // Clear driver details as soon as user starts modifying the field
                                  setUserId(null);
                                  setDriverActiveShipmentCompanyId("");
                                  setDriverActiveShipmentId("");
                                  setExpectedDriverFirstName("");
                                  setExpectedDriverLastName("");
                                  setValue("expectedDriverFirstName", "");
                                  setValue("expectedDriverLastName", "");

                                  // Only fetch user details if the number is complete (10 digits)
                                  if (numericValue.length === 10) {
                                    fetchUserDetails(numericValue);
                                  }
                                }
                              }}
                              inputRef={mobileRef}
                              error={
                                errors.expectedDriverMobileNumber !== undefined
                              }
                              type={"tel"}
                              fullWidth
                              inputProps={{
                                maxLength: 10,
                                minLength: 10,
                                pattern: "\\d*",
                                autoComplete: "nope",
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    +91
                                  </InputAdornment>
                                ),
                              }}
                              name="expectedDriverMobileNumber"
                              margin="normal"
                              variant="outlined"
                              value={expectedDriverMobileNumber}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <InputLabel className={styles.form_label_style}>
                              Enter Driver First Name
                            </InputLabel>
                            <TextField
                              {...register("expectedDriverFirstName", {
                                required: true,
                              })}
                              error={
                                errors.expectedDriverFirstName !== undefined
                              }
                              placeholder="Enter driver first name"
                              className={styles.shipment_input}
                              type={"text"}
                              fullWidth
                              name="expectedDriverFirstName"
                              margin="normal"
                              variant="outlined"
                              size="small"
                              onChange={(e) =>
                                setExpectedDriverFirstName(e.target.value)
                              }
                              value={expectedDriverFirstName}
                              inputProps={{
                                autoComplete: "off",
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <InputLabel className={styles.form_label_style}>
                              Enter Driver Last Name
                            </InputLabel>
                            <TextField
                              {...register("expectedDriverLastName", {
                                required: true,
                              })}
                              className={styles.shipment_input}
                              error={
                                errors.expectedDriverLastName !== undefined
                              }
                              placeholder="Enter driver last name"
                              type={"text"}
                              fullWidth
                              name="expectedDriverLastName"
                              margin="normal"
                              variant="outlined"
                              size="small"
                              onChange={(e) =>
                                setExpectedDriverLastName(e.target.value)
                              }
                              value={expectedDriverLastName}
                              inputProps={{
                                autoComplete: "off",
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={12}>
                            {/* Only show B2B Affiliation if company is Dorf kettle */}
                            {isDorfKettle && (
                              <>
                                <InputLabel className={styles.form_label_style}>
                                  B2B Affiliation
                                </InputLabel>
                                <FormControl fullWidth>
                                  <Select
                                    value={affiliation}
                                    onChange={(event) => {
                                      setAffiliation(
                                        B2BAffiliation[event.target.value]
                                      );
                                    }}
                                    className={styles.shipment_input}
                                    sx={{
                                      borderRadius: "12px",
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#e0e0e0",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "#bdbdbd",
                                        },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: primaryColor,
                                        },
                                      "& .MuiSelect-select": {
                                        fontSize: "16px",
                                        padding: "14px",
                                        textAlign: "left",
                                      },
                                    }}
                                  >
                                    <MenuItem key="DORF_KETTLE" value="DORF_KETTLE">
                                      DORF_KETTLE
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </>
                            )}
                          </Grid>
                          <Grid item xs={12} md={12}>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              variant="contained"
                              className={
                                driverFieldsEntered
                                  ? styles.shipment_submit_button
                                  : styles.shipment_submit_button_gray
                              }
                            >
                              <Loading
                                isLoading={isSubmitting}
                                text="Create Shipment"
                              />
                            </Button>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </form>
              </div>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              style={{
                backgroundImage: `url(${shipmentBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
});

export default Shipment;
