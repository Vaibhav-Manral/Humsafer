import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import styles from "./DriverReports.module.css";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import GenericTable from "../../components/genericTable/GenericTable";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import BackupIcon from "@mui/icons-material/Backup";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import OverSpeedingAlertsChart from "./OverSpeedingAlertsChart";
import SDSScoreChart from "./SDSScoreChart";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import NightlightOutlinedIcon from "@mui/icons-material/NightlightOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import DriveEtaOutlinedIcon from "@mui/icons-material/DriveEtaOutlined";
import TotalKMSDrivenChart from "./TotalKMSDrivenChart";
import { useNavigate, useParams } from "react-router-dom";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { getDriverAnalysis } from "../../api/AnalyseApi";
import { IDateRange, IDriverAnalytics } from "../../models/analyse";
import { HumsaferError } from "../../models/HumsaferError";
import { formatTimestamp } from "../../utils/DateUtils";
import { ModeOfTravelOutlined, WarningOutlined } from "@mui/icons-material";
import { Auth } from "../../utils/Auth";
import Tooltip from "@mui/material/Tooltip";

const getAlertCountCard = (icon: any, count: number, text: string) => {
  return (
    <Grid item xs={12} md={4}>
      <div className={styles.driver_count_card}>
        <div className={styles.icon_bg}>
          <>{icon}</>
        </div>
        <div className={styles.text_content}>
          <div className={styles.count}>{count}</div>
          <span className={styles.text}>{text}</span>
        </div>
      </div>
    </Grid>
  );
};

const getAlertCountChartCard = (icon: any, count: number) => {
  return (
    <Grid item xs={12}>
      <div className={styles.alert_percent_card}>
        <div className={styles.icon_bg}>{icon}</div>
        <div className={styles.text_content}>
          <div className={styles.count}>
            {count.toFixed(0)} Alerts / 100 kms
          </div>
        </div>
      </div>
    </Grid>
  );
};

const DriverReportsPage: React.FC = React.memo(() => {
  const { driverId } = useParams();
  const { selectedCompany } = useContext(CompanyDataContext);
  const [dateRange, setDateRange] = useState<IDateRange>(IDateRange.QUARTERLY);
  const [isFetching, setIsFetching] = useState(false);
  const [driverReport, setDriverReport] = useState<IDriverAnalytics>();
  const [isWeeklyDisabled, setIsWeeklyDisabled] = useState(false);
  const [isMonthlyDisabled, setIsMonthlyDisabled] = useState(false);

  const navigate = useNavigate();

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

  const fetchDriverAnalysis = useCallback(async () => {
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }

    if (!companyId || !driverId) {
      return;
    }

    setIsFetching(true);
    const driverReportOrError = await getDriverAnalysis(
      companyId,
      driverId,
      dateRange
    );

    setIsFetching(false);
    if (driverReportOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: driverReportOrError.message,
        type: "error",
      });

      setTimeout(() => {
        navigate("/analyse");
      }, 2000);
      return;
    }
    setDriverReport(driverReportOrError);

    const currentTimestamp = new Date().getTime();
    const lastWeekTimestamp = currentTimestamp - 7 * 24 * 60 * 60 * 1000;
    const lastMonthTimestamp = currentTimestamp - 30 * 24 * 60 * 60 * 1000;

    const hasShipmentsInLastWeek = driverReportOrError?.shipments?.some(
      (shipment) => shipment.shipmentStartDate >= lastWeekTimestamp
    );

    const hasShipmentsInLastMonth = driverReportOrError?.shipments?.some(
      (shipment) => shipment.shipmentStartDate >= lastMonthTimestamp
    );

    setIsWeeklyDisabled(!hasShipmentsInLastWeek);
    setIsMonthlyDisabled(!hasShipmentsInLastMonth);
  }, [dateRange, driverId, selectedCompany, navigate]);

  useEffect(() => {
    fetchDriverAnalysis();
  }, [fetchDriverAnalysis]);

  const goToAnalysePage = () => {
    navigate("/analyse");
  };

  const goToShipmentDetailsPage = (shipmentId: string) => {
    const newTab = window.open(`/shipments/${shipmentId}`, "_blank");
    if (newTab) {
      newTab.focus();
    } else {
      setShowToast({
        open: true,
        message: "Could not open a new tab",
        type: "error",
      });
      return;
    }
  };

  return (
    <>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      <>
        {isFetching && (
          <div className={styles.driver_loader}>
            <CircularProgress size={25} />
          </div>
        )}
        {!isFetching && (
          <>
            <Grid container>
              <Box sx={{ flexGrow: 2 }} className={styles.driver_container}>
                <Grid
                  container
                  spacing={1}
                  className={styles.driver_top_bar_align}
                >
                  <Grid item xs={6} md={7}>
                    <div className={styles.driver_top_title_bar}>
                      <span className={styles.back} onClick={goToAnalysePage}>
                        <KeyboardBackspaceIcon />
                      </span>
                      <span className={styles.title}>Driver report</span>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <div className={styles.driver_date_filter_align}>
                      <span>
                        <Tooltip
                          title={
                            isWeeklyDisabled
                              ? "No shipments in the past 7 days"
                              : ""
                          }
                          placement="bottom"
                        >
                          <div>
                            <Button
                              className={
                                isWeeklyDisabled
                                  ? styles.driver_date_filter_button_disabled
                                  : dateRange === IDateRange.WEEKLY
                                  ? styles.driver_date_filter_button_active
                                  : styles.driver_date_filter_button
                              }
                              onClick={() => setDateRange(IDateRange.WEEKLY)}
                              variant="text"
                              disabled={isWeeklyDisabled}
                            >
                              Past 7 days
                            </Button>
                          </div>
                        </Tooltip>
                      </span>
                      <span>
                        <Tooltip
                          title={
                            isMonthlyDisabled
                              ? "No shipments in the past 1 month"
                              : ""
                          }
                          placement="bottom"
                        >
                          <div>
                            <Button
                              className={
                                isMonthlyDisabled
                                  ? styles.driver_date_filter_button_disabled
                                  : dateRange === IDateRange.MONTHLY
                                  ? styles.driver_date_filter_button_active
                                  : styles.driver_date_filter_button
                              }
                              onClick={() => setDateRange(IDateRange.MONTHLY)}
                              variant="text"
                              disabled={isMonthlyDisabled}
                            >
                              Past 1 month
                            </Button>
                          </div>
                        </Tooltip>
                      </span>
                      <Button
                        className={
                          dateRange === IDateRange.QUARTERLY
                            ? styles.driver_date_filter_button_active
                            : styles.driver_date_filter_button
                        }
                        onClick={() => setDateRange(IDateRange.QUARTERLY)}
                        variant="text"
                      >
                        {" "}
                        Past 3 month
                      </Button>
                    </div>
                  </Grid>

                  {/* do not show this for now */}
                  <Grid item xs={12} md={4} visibility={"hidden"}>
                    <Button
                      type="button"
                      variant="contained"
                      className={styles.export_csv_button}
                    >
                      Export CSV
                    </Button>
                    <FormControlLabel
                      control={<Checkbox />}
                      sx={{
                        "& .MuiCheckbox-root": {
                          color: "#F06B24",
                          "& .MuiSvgIcon-root": {
                            borderColor: "#F06B24",
                          },
                        },
                      }}
                      label="Consultation Done"
                    />

                    <Button
                      type="button"
                      variant="contained"
                      className={styles.export_icon_button}
                    >
                      <BackupIcon />
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid container>
              <Box sx={{ flexGrow: 2 }} className={styles.driver_container}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <div className={styles.driver_card}>
                      {driverReport?.driverInfo && (
                        <div className={styles.driver_box}>
                          <div className={styles.divide_box}>
                            <List sx={{ bgcolor: "background.paper" }}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar
                                  className={styles.driver_box_icon}
                                >
                                  <AccountCircleOutlinedIcon />
                                </ListItemAvatar>
                                <ListItemText
                                  className={styles.primary_text}
                                  primary="Driver details"
                                  secondary={
                                    <>
                                      <Typography className="primary_text_subtext">
                                        <div>{`${
                                          driverReport?.driverDisplayName ?? "-"
                                        }`}</div>
                                        <div>
                                          {" "}
                                          {
                                            driverReport?.driverInfo
                                              .mobileNumber
                                          }
                                        </div>
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            </List>
                          </div>
                          <div className={styles.divide_box}>
                            <List sx={{ bgcolor: "background.paper" }}>
                              <ListItem alignItems="flex-start">
                                <ListItemAvatar
                                  className={styles.driver_box_icon}
                                >
                                  <ModeOfTravelOutlined />
                                </ListItemAvatar>
                                <ListItemText
                                  className={styles.primary_text}
                                  primary="Total trips"
                                  secondary={
                                    <>
                                      <Typography className="primary_text_subtext">
                                        {driverReport?.shipments.length ?? " -"}
                                        <div>
                                          {" "}
                                          <span className={styles.font_bold}>
                                            KMS driven:{" "}
                                          </span>
                                          {(
                                            driverReport?.totalDistanceTravelledInMetersDrivingMode /
                                            1000
                                          ).toFixed(2) ?? " -"}
                                        </div>
                                      </Typography>
                                    </>
                                  }
                                />
                              </ListItem>
                            </List>
                          </div>
                        </div>
                      )}
                      {!driverReport?.driverInfo && (
                        <Box
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          width={"100%"}
                        >
                          Driver details not found
                        </Box>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={4}>
                        <div className={styles.driver_chart_card}>
                          <div className={styles.title}>
                            Over-speeding Alerts
                          </div>
                          <OverSpeedingAlertsChart
                            percentage={
                              driverReport !== undefined
                                ? driverReport.alertStatistics.adherenceRate
                                : 0
                            }
                          />
                        </div>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <div className={styles.driver_chart_card}>
                          <div className={styles.title}>Alerts/ 100km</div>
                          {getAlertCountChartCard(
                            <WarningOutlined />,
                            driverReport !== undefined
                              ? driverReport.alertStatistics.alertsPer100kms
                              : 0
                          )}
                        </div>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <div className={styles.driver_chart_card}>
                          <div className={styles.title}>SDS Score</div>
                          <SDSScoreChart percentage={0} />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid container>
              <Box sx={{ flexGrow: 2 }} className={styles.driver_container}>
                <Grid container spacing={1}>
                  {driverReport?.distanceDrivenInLastYearMap && (
                    <Grid item xs={12} md={6}>
                      <div className={styles.driver_card_chart}>
                        <Grid
                          container
                          spacing={1}
                          className={styles.align_items_center}
                        >
                          <Grid item xs={12} md={10}>
                            <div className={styles.title}>
                              KMS driven chart (last 12 months)
                            </div>
                          </Grid>

                          <Grid item xs={12} md={12}>
                            <TotalKMSDrivenChart
                              distanceDrivenInLastYearMap={
                                driverReport?.distanceDrivenInLastYearMap
                              }
                              hideLegend
                            />
                          </Grid>
                        </Grid>
                      </div>
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    md={driverReport?.distanceDrivenInLastYearMap ? 6 : 12}
                  >
                    <Grid container spacing={1}>
                      {getAlertCountCard(
                        <SpeedOutlinedIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .OVER_SPEEDING ?? 0
                          : 0,
                        "Over-speeding Alerts"
                      )}

                      {getAlertCountCard(
                        <ViewInArIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .SLEEP_STATUS_SLEEPING ?? 0
                          : 0,
                        "Sleep detection"
                      )}

                      {getAlertCountCard(
                        <DriveEtaOutlinedIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .CHAI_BREAK ?? 0
                          : 0,
                        "Continuous driving"
                      )}

                      {getAlertCountCard(
                        <ViewInArIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .SAFE_DISTANCE_EXCEEDED ?? 0
                          : 0,
                        "Exceeded daily distance"
                      )}

                      {getAlertCountCard(
                        <WatchLaterOutlinedIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .SAFE_DRIVING_TIME_EXCEEDED ?? 0
                          : 0,
                        "Exceeded daily time"
                      )}

                      {getAlertCountCard(
                        <NightlightOutlinedIcon />,
                        driverReport !== undefined
                          ? driverReport.alertStatistics.countPerAlert
                              .NIGHT_DRIVING ?? 0
                          : 0,
                        "Night driving"
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid container>
              <Grid
                className={styles.table_component_container}
                item
                lg={12}
                md={12}
                xs={12}
              >
                <Card className={styles.trip_details_box}>
                  <div className={styles.heading}>
                    <Grid
                      container
                      spacing={1}
                      className={styles.align_items_center}
                    >
                      <div className={styles.title}>Trip Details</div>
                      <Grid item xs={12} md={12}>
                        <GenericTable
                          headers={[
                            "Shipment ID",
                            "Truck No.",
                            "From",
                            "To",
                            "Started On",
                            "Completed On",
                            "View Trip",
                          ]}
                          data={driverReport?.shipments ?? []}
                          dataRenderer={(data, column) => {
                            const trip = data;
                            switch (column) {
                              case 0:
                                return trip.shipmentVanityId;
                              case 1:
                                return trip.vehicleNo;
                              case 2:
                                return trip.sourceCity;
                              case 3:
                                return trip.destinationCity;
                              case 4:
                                return formatTimestamp(trip.shipmentStartDate);
                              case 5:
                                return formatTimestamp(trip.shipmentEndDate);
                              case 6:
                                return (
                                  <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() =>
                                      goToShipmentDetailsPage(trip.shipmentId)
                                    }
                                  >
                                    View
                                  </Button>
                                );
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </>
    </>
  );
});

export default DriverReportsPage;
