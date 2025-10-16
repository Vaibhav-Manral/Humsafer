import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import styles from "./ShipmentDetails.module.css";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import AvTimerIcon from "@mui/icons-material/AvTimer";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import RefreshIcon from "@mui/icons-material/Refresh";
import ModeOfTravelOutlinedIcon from "@mui/icons-material/ModeOfTravelOutlined";
import DistanceChart from "./DistanceChart";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import WhereToVoteIcon from "@mui/icons-material/WhereToVote";
import {
  changeShipmentDetailsStatus,
  getSharedShipmentDetails,
  getShipmentDetails,
  pullFastagDetails,
} from "../../api/ShipmentDetailsApi";
import { HumsaferError } from "../../models/HumsaferError";
import {
  IShipmentDetails,
  LiveLocationSource,
  ShipmentEndMethod,
} from "../../models/ShipmentDetailsView";
import {
  formatTimestamp,
  formatTimestampForDate,
  convertMillisToMinutes,
} from "../../utils/DateUtils";
import { changeShipmentPriority } from "../../api/ShipmentsListApi";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {
  isAllowedToSetShipmentPriority,
  isAllowedToSetShipmentStatus,
} from "../../utils/CapabitilityUtils";
import { getDisplayTextForShipmentStatus } from "../../utils/DisplayUtils";
import {
  ShipmentPriority,
  ShipmentStatus,
  ShipmentTrackingStatus,
} from "../../models/ShipmentsView";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Auth } from "../../utils/Auth";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery60Icon from "@mui/icons-material/Battery60";
import { Capability } from "../../models/User";
import { Loading } from "../../components/loading/Loading";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import SnoozeIcon from "@mui/icons-material/Snooze";
import ShipmentTimelineDialog from "../../components/ShipmentTimelineDialog/ShipmentTimelineDialog";
import ShipmentDebugInfoDialog from "../../components/ShipmentDebugInfoDialog/ShipmentDebugInfoDialog";
import { generateMapsUrl } from "../../utils/MapsUtils";
import GenericTable from "../../components/genericTable/GenericTable";
import { IFuelingStopsInfo } from "../../models/FuelOptimazationResponse";
import { FuelPlanParametersDialog } from "../../components/fuelPlanParametersDialog/FuelPlanParametersDialog";
import ConditionalTrackingMap from "../../components/shipmentListReport/ConditionalTrackingMap";

interface IProps {
  isSharedShipment: boolean;
  isLoaded: boolean;
}

const shipmentIconWidth = 70;

const ShipmentDetails: React.FC<IProps> = React.memo((props) => {
  const [showCopyNumberTooltip, setShowCopyNumberTooltip] =
    useState<boolean>(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingFastagData, setIsLoadingFastagData] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState<IShipmentDetails>();
  const { shipmentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const allowSetShipmentPriority = isAllowedToSetShipmentPriority();
  const allowSetShipmentStatus = isAllowedToSetShipmentStatus();
  const [showLiveLocationsDialog, setShowLiveLocationsDialog] = useState(false);
  const [showShipmentDebugInfo, setShowShipmentDebugInfo] = useState(false);
  const [showFuelPlan, setShowFuelPlan] = useState(false);
  const [showFuelPlanParametersDialog, setShowFuelPlanParametersDialog] =
    useState(false);
  const [fuelingStopsInfo, setFuelingStopsInfo] = useState<IFuelingStopsInfo>();
  const [isRefreshingMap, setIsRefreshingMap] = useState(false);

  const nagivate = useNavigate();

  const { isSharedShipment, isLoaded } = props;

  const { selectedCompany } = useContext(CompanyDataContext);
  const { fastagLogo } = useContext(HumsaferThemeContext);

  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const handleTooltipClose = () => {
    setShowCopyNumberTooltip(false);
  };

  const fetchShipment = useCallback(
    async (shipmentId: string) => {
      let companyId = "";

      if (!isSharedShipment) {
        companyId = Auth.getInstance().getCompanySettings()?.id ?? "";
        if (selectedCompany) {
          companyId = selectedCompany.id;
        }

        if (companyId === undefined || companyId.length === 0) {
          return;
        }
      }

      setIsFetching(true);
      let shipmentOrError: IShipmentDetails | HumsaferError;
      if (isSharedShipment) {
        shipmentOrError = await getSharedShipmentDetails(shipmentId);
      } else {
        shipmentOrError = await getShipmentDetails(companyId, shipmentId);
      }
      setIsFetching(false);
      if (shipmentOrError instanceof HumsaferError) {
        setShowToast({
          open: true,
          message: shipmentOrError.message,
          type: "error",
        });
        return;
      }
      document.title = `Humsafer Shipment ${shipmentOrError.vanityId}`;

      setShipmentDetails(shipmentOrError);
      setFuelingStopsInfo(shipmentOrError.fuelingStopsInfo);
    },
    [isSharedShipment, selectedCompany]
  );

  const populateFastagData = useCallback(async () => {
    setIsLoadingFastagData(true);
    const responseOrError = await pullFastagDetails(
      selectedCompany?.id ?? "",
      shipmentId ?? ""
    );
    setIsLoadingFastagData(false);
    if (responseOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: responseOrError.message,
        type: "error",
      });
      return;
    }
    fetchShipment(shipmentId ?? "");
  }, [fetchShipment, selectedCompany?.id, shipmentId]);

  const handleMapRefresh = useCallback(async () => {
    if (!shipmentId) return;
    
    setIsRefreshingMap(true);
    try {
      // Refresh the shipment details which will trigger map re-render
      await fetchShipment(shipmentId);
      setShowToast({
        open: true,
        message: "Map data refreshed successfully",
        type: "success",
      });
    } catch (error) {
      setShowToast({
        open: true,
        message: "Failed to refresh map data",
        type: "error",
      });
    } finally {
      setIsRefreshingMap(false);
    }
  }, [fetchShipment, shipmentId]);

  useEffect(() => {
    if (shipmentId) {
      fetchShipment(shipmentId);
    }
  }, [fetchShipment, shipmentId]);

  const handlePrioritised = async (shipment: IShipmentDetails) => {
    setIsFetching(true);
    const setPriority =
      shipment.priority === ShipmentPriority.DEFAULT
        ? ShipmentPriority.PRIORITIZED
        : ShipmentPriority.DEFAULT;
    const shipmentOrError = await changeShipmentPriority(
      shipment.companyId,
      shipment.id,
      setPriority
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
    fetchShipment(shipment.id);
    setShowToast({
      open: true,
      message: `Shipment priority ${setPriority} set successfully`,
      type: "success",
    });
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
    fetchShipment(shipment.id);
    setShowToast({
      open: true,
      message: `Shipment status ${setStatus} changed successfully`,
      type: "success",
    });
  };

  useEffect(() => {
    searchParams.delete("tk");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const timeline = shipmentDetails?.timeline?.timelineLocations.sort((a, b) => {
    const aTimestamp = a?.timestamp || 0;
    const bTimestamp = b?.timestamp || 0;

    return bTimestamp - aTimestamp;
  });

  function getTrackingClass(shipment: IShipmentDetails) {
    if (shipment.status === ShipmentStatus.COMPLETE) {
      return styles.shipment_details_tracking_card;
    }

    switch (shipment.shipmentTrackingStatus) {
      case ShipmentTrackingStatus.ACTIVELY_TRACKED:
        return styles.shipment_details_tracking_card;

      case ShipmentTrackingStatus.INTERMITTENTLY_TRACKED:
        return styles.shipment_details_tracking_card_intermittent_track;

      case ShipmentTrackingStatus.MISSING_TRACKING_INFO:
        return styles.shipment_details_tracking_card_not_track;
    }
  }

  function getShipmentTrackingStatusDesc(shipment: IShipmentDetails) {
    if (shipment.status === ShipmentStatus.COMPLETE) {
      return "Trip Completed";
    }
    switch (shipment.shipmentTrackingStatus) {
      case ShipmentTrackingStatus.ACTIVELY_TRACKED:
        return "Tracking";

      case ShipmentTrackingStatus.INTERMITTENTLY_TRACKED:
        return "Patchy Tracking";

      case ShipmentTrackingStatus.MISSING_TRACKING_INFO:
        return "Not Tracking";
    }
  }

  return (
    <>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />

      {showLiveLocationsDialog && (
        <ShipmentTimelineDialog
          show={showLiveLocationsDialog}
          closeDialog={() => setShowLiveLocationsDialog(false)}
          setTimelineDialog={setShowLiveLocationsDialog}
          selectedCompany={selectedCompany}
          shipmentId={shipmentId}
        />
      )}

      {showShipmentDebugInfo && (
        <ShipmentDebugInfoDialog
          show={showShipmentDebugInfo}
          closeDialog={() => setShowShipmentDebugInfo(false)}
          setDebugInfoDialog={setShowShipmentDebugInfo}
          selectedCompany={selectedCompany}
          shipmentId={shipmentId}
        />
      )}

      {isFetching && (
        <div className={styles.shipment_loader}>
          <CircularProgress size={25} />
        </div>
      )}

      {!isFetching && shipmentDetails && (
        <>
          <Grid container>
            <Box
              sx={{ flexGrow: 2 }}
              className={styles.shipment_details_top_bar}
            >
              <Grid
                container
                spacing={2}
                className={styles.shipment_details_top_bar_align}
              >
                <Grid item xs={12} md={6}>
                  <div className={styles.shipment_details_title_align}>
                    {!isSharedShipment && (
                      <span
                        className={styles.shipment_details_back}
                        onClick={() => nagivate("/shipments")}
                      >
                        <KeyboardBackspaceIcon />
                      </span>
                    )}
                    <span className={styles.shipment_details_top_bar_text}>
                      Shipment ID {shipmentDetails.vanityId}
                    </span>
                  </div>
                </Grid>

                {!isSharedShipment && (
                  <Grid item xs={12} md={6} className={styles.topbar_tyles}>
                    <div className={styles.shipment_status_button}>
                      {Auth.getInstance()
                        .getUserSettings()
                        ?.capabilities.includes(Capability.ALL) && (
                        <Button
                          type="button"
                          variant={"text"}
                          className={styles.shipment_details_pri_btn}
                          onClick={(e) => {
                            e.stopPropagation();

                            let waypointsList = Object.values(
                              shipmentDetails.path ?? {}
                            );
                            let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${shipmentDetails.shipmentSourceAddress}&destination=${shipmentDetails.shipmentDestinationAddress}&travelmode=driving&waypoints=`;

                            window.open(
                              generateMapsUrl(waypointsList, mapsUrl),
                              "_blank",
                              "noreferrer"
                            );
                          }}
                        >
                          View on Google Maps
                        </Button>
                      )}

                      {allowSetShipmentPriority && (
                        <Button
                          type="button"
                          variant={
                            shipmentDetails.priority ===
                            ShipmentPriority.DEFAULT
                              ? "outlined"
                              : "contained"
                          }
                          className={
                            shipmentDetails.priority ===
                            ShipmentPriority.DEFAULT
                              ? styles.shipment_details_pri_btn
                              : styles.shipment_details_fill_btn
                          }
                          startIcon={<BookmarkAddedIcon />}
                          onClick={() => handlePrioritised(shipmentDetails)}
                        >
                          {shipmentDetails.priority === ShipmentPriority.DEFAULT
                            ? "Prioritise"
                            : "Prioritised"}
                        </Button>
                      )}

                      {allowSetShipmentStatus && (
                        <>
                          {(shipmentDetails.status ===
                            ShipmentStatus.IN_TRANSIT ||
                            shipmentDetails.status ===
                              ShipmentStatus.CREATED) && (
                            <Button
                              type="button"
                              onClick={() =>
                                handleShipmentStatus(
                                  shipmentDetails,
                                  ShipmentStatus.COMPLETE
                                )
                              }
                              className={styles.shipment_details_end_button}
                              variant="contained"
                            >
                              End Trip
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
          {/* <Grid>
            <Grid>
              <ShipmentTrackingMap
                shipmentData={shipmentDetails as any}
                height="500px"
                width="100%"
              />
            </Grid>
          </Grid> */}
          <Grid container className={styles.shipment__details_m15}>
            <Box sx={{ flexGrow: 2 }} className={styles.shipmentDetails_box}>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={9}
                  className={styles.shipment__details_m15}
                >
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      className={styles.shipment__details_m15}
                    >
                      <div className={getTrackingClass(shipmentDetails)}>
                        <div
                          className={styles.shipment_details_tracking_status}
                        >
                          {`${getShipmentTrackingStatusDesc(shipmentDetails)} ${
                            shipmentDetails.shipmentEndMethod ===
                            ShipmentEndMethod.MANUAL
                              ? "(Manually)"
                              : ""
                          }`}
                        </div>
                        <div
                          className={
                            styles.shipment_details_tracking_icon_detail
                          }
                        >
                          <div
                            className={styles.shipment_details_tracking_icon}
                          >
                            <LocalShippingIcon />
                          </div>
                        </div>
                        <div
                          className={styles.shipment_details_tracking_vehicle}
                        >
                          {shipmentDetails.vehicleNumber}
                        </div>
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      className={styles.shipment__details_m15}
                    >
                      <div className={styles.shipment_place_card}>
                        <div className={styles.shipment_place_icon_bg}>
                          <LocationOnIcon />
                        </div>
                        <div>
                          <div className={styles.shipment_place}>From</div>
                          <span className={styles.shipment_place_text}>
                            {shipmentDetails.shipmentSourceAddress}
                          </span>
                        </div>
                      </div>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      className={styles.shipment__details_m15}
                    >
                      <div className={styles.shipment_place_card}>
                        <div className={styles.shipment_place_icon_bg}>
                          <LocationOnIcon />
                        </div>
                        <div>
                          <div className={styles.shipment_place}>To</div>
                          <span className={styles.shipment_place_text}>
                            {shipmentDetails.shipmentDestinationAddress}
                          </span>
                        </div>
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      className={styles.shipment__details_m15}
                    >
                      <div className={styles.shipment_driver_card}>
                        <div className={styles.shipment_driver_icon_bg}>
                          <PermIdentityIcon />
                        </div>
                        <div>
                          <div className={styles.shipment_driver}>
                            Driver details
                          </div>
                          <div className={styles.shipment_driver_text}>
                            {shipmentDetails.driverName}
                          </div>
                          <div className={styles.shipment_driver_text}>
                            {shipmentDetails.driverMobileNumber}
                            <Tooltip
                              title="Copied!"
                              open={showCopyNumberTooltip}
                              arrow
                              placement="right-end"
                              disableHoverListener
                              disableFocusListener
                              disableTouchListener
                            >
                              <span
                                className={styles.shipment_details_copy}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    shipmentDetails.driverMobileNumber
                                  );
                                  setShowCopyNumberTooltip(
                                    !showCopyNumberTooltip
                                  );
                                  setTimeout(handleTooltipClose, 1000);
                                }}
                              >
                                Copy
                              </span>
                            </Tooltip>
                          </div>
                          <div className={styles.shipment_driver_text}>
                            Transporter: {shipmentDetails.associatedEntity}
                          </div>
                        </div>
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={8}
                      className={styles.shipment__details_m15}
                    >
                      <Grid container>
                        <Box
                          sx={{ flexGrow: 1 }}
                          className={styles.shipment_details_card_dispatch_info}
                        >
                          <Grid
                            item
                            xs={12}
                            md={6}
                            className={styles.shipment__details_m15}
                          >
                            <div
                              className={styles.shipment_details_card_dispatch}
                            >
                              <div className={styles.shipment_details_icon_bg}>
                                <LocationOnIcon />
                              </div>
                              <div>
                                <div className={styles.shipment_title}>
                                  {" "}
                                  {shipmentDetails.dispatchTime != null
                                    ? "Dispatched at"
                                    : "Created at"}
                                </div>
                                <span className={styles.shipment_text}>
                                  {shipmentDetails.dispatchTime != null
                                    ? formatTimestamp(
                                        shipmentDetails.dispatchTime
                                      )
                                    : formatTimestamp(
                                        shipmentDetails.startTime
                                      )}
                                </span>
                              </div>
                            </div>
                            <div
                              className={styles.shipment_details_card_dispatch}
                            >
                              <div className={styles.shipment_details_icon_bg}>
                                <AvTimerIcon />
                              </div>
                              <div>
                                <div className={styles.shipment_title}>
                                  {" "}
                                  ETA
                                </div>
                                <span className={styles.shipment_text}>
                                  {shipmentDetails.status ===
                                  ShipmentStatus.COMPLETE
                                    ? "Reached on"
                                    : "Will reach on"}{" "}
                                  {formatTimestampForDate(
                                    shipmentDetails.estimatedEndTime
                                  )}
                                </span>
                              </div>
                            </div>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            md={6}
                            className={styles.shipment__details_m15}
                          >
                            <div
                              className={styles.shipment_details_card_dispatch}
                            >
                              <div className={styles.shipment_details_icon_bg}>
                                <LocationSearchingIcon />
                              </div>
                              <div>
                                <div className={styles.shipment_title}>
                                  Last tracked
                                </div>
                                <span className={styles.shipment_text}>
                                  {formatTimestamp(
                                    shipmentDetails.lastLiveLocationReceivedTime
                                  )}
                                </span>
                              </div>
                            </div>
                            <div
                              className={styles.shipment_details_card_dispatch}
                            >
                              <div className={styles.shipment_details_icon_bg}>
                                <ModeOfTravelOutlinedIcon />
                              </div>
                              <div>
                                <div className={styles.shipment_title}>
                                  Status
                                </div>
                                <span className={styles.shipment_text}>
                                  {getDisplayTextForShipmentStatus(
                                    shipmentDetails.status
                                  )}
                                </span>
                              </div>
                            </div>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={3}
                  className={styles.shipment__details_m15}
                >
                  <div className={styles.shipment_chart}>
                    <DistanceChart
                      shipmentCompletionPercentage={
                        shipmentDetails.shipmentCompletionPercentage
                      }
                    />
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid container className={styles.shipment__details_m15}>
            <Box sx={{ flexGrow: 2 }} className={styles.shipment_details_map}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        padding: "10px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <Typography variant="h6" style={{ margin: 0 }}>
                        Shipment Tracking Map
                      </Typography>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleMapRefresh}
                        disabled={isRefreshingMap}
                        className={styles.shipment_details_pri_btn}
                      >
                        {isRefreshingMap ? "Refreshing..." : "Refresh Map"}
                      </Button>
                    </div>
                    {shipmentDetails && shipmentId && (
                      <ConditionalTrackingMap
                        shipmentData={shipmentDetails as any}
                        companyId={
                          selectedCompany?.id ??
                          Auth.getInstance().getCompanySettings()?.id ??
                          (shipmentDetails as any).companyId
                        }
                        shipmentId={shipmentId}
                        height="600px"
                        width="100%"
                        // autoRefresh={false}
                        // refreshInterval={1800000}
                        showFuelPlan={showFuelPlan}
                        fuelingStopsInfo={fuelingStopsInfo}
                        selectedCompany={selectedCompany}
                        isLoaded={isLoaded}
                      />
                    )}
                  </div>
                </Grid>
                <Grid
                  item
                  xs={11}
                  md={6}
                  className={styles.shipment_info_container}
                  style={{}}
                >
                  <div className={styles.shipment_details_map_box}>
                    <Typography className={styles.title_text_style}>
                      {showFuelPlan ? "Fuel Plan" : "Timeline"}
                    </Typography>
                    <div
                      className={styles.shipment_timeline_title}
                      style={{ overflowX: "scroll" }}
                    >
                      {Auth.getInstance()
                        .getUserSettings()
                        ?.capabilities.includes(Capability.ALL) && (
                        <Button
                          type="button"
                          variant={"text"}
                          className={styles.shipment_details_pri_btn}
                          onClick={() => setShowFuelPlan(!showFuelPlan)}
                        >
                          {showFuelPlan ? "Timeline" : "Fuel Plan"}
                        </Button>
                      )}

                      {Auth.getInstance()
                        .getUserSettings()
                        ?.capabilities.includes(Capability.ALL) && (
                        <Button
                          type="button"
                          variant={"text"}
                          className={styles.shipment_details_pri_btn}
                          onClick={() => {
                            setShowLiveLocationsDialog(true);
                          }}
                        >
                          all locations
                        </Button>
                      )}

                      {Auth.getInstance()
                        .getUserSettings()
                        ?.capabilities.includes(Capability.ALL) && (
                        <Button
                          type="button"
                          variant={"text"}
                          className={styles.shipment_details_pri_btn}
                          onClick={() => {
                            setShowShipmentDebugInfo(true);
                          }}
                        >
                          Debug Info
                        </Button>
                      )}

                      {Auth.getInstance()
                        .getUserSettings()
                        ?.capabilities.includes(Capability.ALL) && (
                        <Button
                          type="button"
                          variant={"outlined"}
                          className={styles.shipment_details_pri_btn}
                          onClick={() => {
                            populateFastagData();
                          }}
                        >
                          <Loading
                            text="FASTAG"
                            isLoading={isLoadingFastagData}
                          />
                        </Button>
                      )}
                    </div>
                    {!showFuelPlan && (
                      <div className={styles.shipment_timeline_ml40}>
                        {timeline?.map((stop, index) => {
                          const stopTimeInMinutes =
                            stop.stopDurationInMillis &&
                            stop.stopDurationInMillis > 0
                              ? convertMillisToMinutes(
                                  stop.stopDurationInMillis
                                )
                              : null;
                          return (
                            <div key={index} className={styles.shipment_step}>
                              <div
                                className={styles.shipment_icon_container}
                                style={{ width: shipmentIconWidth }}
                              >
                                {index === 0 ? (
                                  <WhereToVoteIcon
                                    style={{
                                      color: "#f05a00",
                                      fontSize: "2.2rem",
                                    }}
                                  />
                                ) : index ===
                                  shipmentDetails.timeline?.timelineLocations
                                    .length -
                                    1 ? (
                                  <ModeOfTravelIcon
                                    style={{
                                      color: "#9A99",
                                      fontSize: "2.2rem",
                                    }}
                                  />
                                ) : stop.source ===
                                  LiveLocationSource.FASTAG ? (
                                  <img
                                    src={fastagLogo}
                                    alt={"fastag logo"}
                                    height={"auto"}
                                    width={shipmentIconWidth}
                                  />
                                ) : !stopTimeInMinutes ? (
                                  <LocationOnIcon
                                    style={{
                                      color: "#03A89E",
                                      fontSize: "2.2rem",
                                    }}
                                  />
                                ) : (
                                  <SnoozeIcon
                                    style={{
                                      color: "#FBAA00",
                                      fontSize: "2.2rem",
                                    }}
                                  />
                                )}
                                {index !==
                                  shipmentDetails.timeline?.timelineLocations
                                    .length -
                                    1 && (
                                  <span
                                    className={styles.shipment_line}
                                    style={{ flexGrow: 1 }}
                                  ></span>
                                )}
                              </div>
                              <div>
                                <div>
                                  <p className={styles.shipment_text}>
                                    {stop.locationDescription}
                                  </p>
                                </div>
                                <span className={styles.shipment_date}>
                                  {formatTimestamp(stop.timestamp)}
                                </span>
                                <br />

                                {stopTimeInMinutes && (
                                  <span className={styles.shipment_date}>
                                    {`Stop detected for approximately: ${stopTimeInMinutes} mins`}
                                  </span>
                                )}
                              </div>
                              <div className={styles.battery_info_container}>
                                {stop.batteryPercentage && (
                                  <>
                                    {stop.isBatteryCharging && (
                                      <BatteryChargingFullIcon
                                        style={{ color: "green" }}
                                      />
                                    )}
                                    {stop.isBatteryCharging === false && (
                                      <Battery60Icon />
                                    )}
                                    <span
                                      className={styles.battery_percentage_text}
                                    >
                                      {stop.batteryPercentage} %
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {showFuelPlan &&
                      (!fuelingStopsInfo || showFuelPlanParametersDialog) && (
                        <FuelPlanParametersDialog
                          show={true}
                          shipmentId={shipmentId ?? ""}
                          fuelParameters={fuelingStopsInfo?.request}
                          setFuelingStopsInfo={setFuelingStopsInfo}
                          setShowFuelPlanParametersDialog={
                            setShowFuelPlanParametersDialog
                          }
                          closeDialog={() => {
                            setShowFuelPlanParametersDialog(false);
                            if (!fuelingStopsInfo) {
                              setShowFuelPlan(false);
                            }
                          }}
                        />
                      )}

                    {showFuelPlan && fuelingStopsInfo && (
                      <>
                        <div className={styles.shipment_fuel_parameters_info}>
                          <h3>Parameters</h3>
                          <Button
                            type="button"
                            variant={"text"}
                            className={styles.shipment_details_pri_btn}
                            onClick={() =>
                              setShowFuelPlanParametersDialog(
                                !showFuelPlanParametersDialog
                              )
                            }
                          >
                            Edit
                          </Button>
                        </div>
                        <Grid container>
                          <Box
                            sx={{ flexGrow: 1 }}
                            className={styles.shipment_fuel_plan_card_info}
                          >
                            <Grid
                              item
                              xs={12}
                              md={5}
                              className={styles.shipment__details_m15}
                            >
                              <div className={styles.shipment_fuel_plan_card}>
                                <div className={styles.shipment_title}>
                                  Max Stops :{" "}
                                  {fuelingStopsInfo.request.maxStops}
                                </div>
                              </div>
                              <div className={styles.shipment_fuel_plan_card}>
                                <div className={styles.shipment_title}>
                                  Mileage (in Kmph) :{" "}
                                  {fuelingStopsInfo.request.mileageInKmsPerLtr}
                                </div>
                              </div>
                              <div className={styles.shipment_fuel_plan_card}>
                                <div className={styles.shipment_title}>
                                  Initial Fuel (in Ltrs) :{" "}
                                  {fuelingStopsInfo.request.initialFuelLtrs}
                                </div>
                              </div>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              md={7}
                              className={styles.shipment__details_m15}
                            >
                              <div className={styles.shipment_fuel_plan_card}>
                                <div>
                                  <div className={styles.shipment_title}>
                                    Tank Capacity (in Ltrs) :{" "}
                                    {
                                      fuelingStopsInfo.request
                                        .tankCapacityInLtrs
                                    }
                                  </div>
                                </div>
                              </div>
                              <div className={styles.shipment_fuel_plan_card}>
                                <div>
                                  <div className={styles.shipment_title}>
                                    Reserve Fuel (in Ltrs) :{" "}
                                    {fuelingStopsInfo.request.reserveFuelInLtrs}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.shipment_fuel_plan_card}>
                                <div>
                                  <div className={styles.shipment_title}>
                                    Min Fuel to Purchase (in Ltrs) :{" "}
                                    {
                                      fuelingStopsInfo.request
                                        .minFuelToPurchaseInLtrs
                                    }
                                  </div>
                                </div>
                              </div>
                            </Grid>
                          </Box>
                        </Grid>

                        <GenericTable
                          headers={[
                            "Sl no",
                            "Station name",
                            "Provider",
                            "Fuel price",
                            "Fuel to get",
                          ]}
                          data={fuelingStopsInfo.fuelingStops}
                          dataRenderer={(data, column, row) => {
                            const fuelStop = data;
                            const destinationIndex =
                              fuelingStopsInfo.fuelingStops.length - 1;
                            const lastRow = row === destinationIndex;

                            const destination =
                              fuelingStopsInfo.fuelingStops[destinationIndex];
                            const totalPriceForFuel =
                              destination?.totalCost ?? "-";

                            switch (column) {
                              case 0:
                                if (lastRow) {
                                  return <b>Fuel left (ltrs)</b>;
                                }
                                return row + 1 + ".";
                              case 1:
                                if (lastRow) {
                                  return fuelStop.fuelAvailableInLitres;
                                }
                                return fuelStop.fuelingStationName;
                              case 2:
                                if (lastRow) {
                                  return;
                                }
                                return fuelStop.provider;

                              case 3:
                                if (lastRow) {
                                  return <b>Total Price (₹)</b>;
                                }
                                return fuelStop.dieselPrice;
                              case 4:
                                if (lastRow) {
                                  return totalPriceForFuel;
                                }
                                return fuelStop.fuelToGetInLtrs;
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </>
      )}
    </>
  );
});

export default ShipmentDetails;
