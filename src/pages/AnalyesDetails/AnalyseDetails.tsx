import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import styles from "./AnalyseDetails.module.css";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import CircleIcon from "@mui/icons-material/Circle";
import DriverAdherenceChart from "./DriverAdherenceChart";
import GenericTable from "../../components/genericTable/GenericTable";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import TransporterPerformanceDialog from "../../components/TransporterPerformanceDialog/TransporterPerformanceDialog";
import {
  AlertStatistics,
  IAnalytics,
  IDateRange,
  IDriverAnalytics,
  IPerAssociatedEntityShipmentAnalytics,
} from "../../models/analyse";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Auth } from "../../utils/Auth";
import { HumsaferError } from "../../models/HumsaferError";
import {
  ICompanyAnalytics,
  getAnalyseDetails,
  getAnalyticsReportDownloadUrl,
} from "../../api/AnalyseApi";
import CompanyInfoWithSwitcher from "../../components/companyInfoWithSwitcher/CompanyInfoWithSwitcher";
import { isAllowedToSwitchCompanies } from "../../utils/CapabitilityUtils";
import ErrorIcon from "@mui/icons-material/Error";
import DownloadIcon from "@mui/icons-material/Download";

const AnalyseDetailsPage: React.FC = React.memo(() => {
  enum IDriverPerformanceAdherenceFilterType {
    ALL,
    LOW,
  }

  const adherenceOptions = [
    { value: IDriverPerformanceAdherenceFilterType.ALL, label: "All Drivers" },
    {
      value: IDriverPerformanceAdherenceFilterType.LOW,
      label: "Low Adherence",
    },
  ];

  const { selectedCompany } = useContext(CompanyDataContext);

  const [isFetching, setIsFetching] = useState(false);
  const [showEntityDialog, setShowEntityDialog] = useState(false);
  const [dateRange, setDateRange] = useState<IDateRange>(IDateRange.WEEKLY);
  const [analyticsData, setAnalyticsData] = useState<IAnalytics>();
  const [analyticsAllData, setAnalyticsAllData] = useState<ICompanyAnalytics>();
  const [transporters, setTransporters] = useState<string[]>([]);
  const [isTransporters, setIsTransporters] =
    useState<string>("all_transporters");
  const [driverPerformanceData, setDriverPerformanceData] = useState<
    IDriverAnalytics[]
  >([]);
  const [driverPerformanceAllData, setDriverPerformanceAllData] = useState<
    IDriverAnalytics[]
  >([]);
  const [entityPerformanceData, setEntityPerformanceData] = useState<
    IPerAssociatedEntityShipmentAnalytics[]
  >([]);
  const [entityPerformanceAllData, setEntityPerformanceAllData] = useState<
    IPerAssociatedEntityShipmentAnalytics[]
  >([]);
  const [alerts, setAlerts] = useState<{
    overspeeding: number;
    chaiBreak: number;
    nightDriving: number;
    total: number;
    sleepStatus: number;
  }>();
  const [driverBehavior, setDriverBehavior] = useState<{
    good: number;
    goodPercent: number;
    needsImprovement: number;
    needsImprovementPercent: number;
  }>();
  const [
    driverPerformanceAdherenceFilterType,
    setDriverPerformanceAdherenceFilterType,
  ] = useState<IDriverPerformanceAdherenceFilterType>(
    IDriverPerformanceAdherenceFilterType.ALL
  );
  const [, setFilteredDriverPerformanceData] = useState<IDriverAnalytics[]>([]);
  const [isDownloadingAnalyticsReport, setIsDownloadingAnalyticsReport] =
    useState(false);

  const allowCompanySwitcher = isAllowedToSwitchCompanies();

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

  const searchFilterDriverPerformance = (e) => {
    const searchQuery = e.target.value;
    let filteredDriverList = [...driverPerformanceAllData];

    if (searchQuery) {
      filteredDriverList = filteredDriverList.filter((item) =>
        item.driverDisplayName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setDriverPerformanceData(filteredDriverList);
  };

  useEffect(() => {
    // always reset all data.
    let filteredData = driverPerformanceAllData;
    if (
      driverPerformanceAdherenceFilterType ===
      IDriverPerformanceAdherenceFilterType.LOW
    ) {
      filteredData = filteredData.filter((driver) =>
        isAdherenceRateLow(driver.alertStatistics)
      );
    }
    setFilteredDriverPerformanceData(filteredData);
    setDriverPerformanceData(filteredData);
  }, [
    driverPerformanceAdherenceFilterType,
    driverPerformanceAllData,
    isTransporters,
    IDriverPerformanceAdherenceFilterType.LOW,
  ]);

  useEffect(() => {
    let filteredData: IAnalytics;
    if (isTransporters !== "all_transporters") {
      filteredData =
        analyticsAllData?.companyAnalytics.perAssociatedEntityShipmentAnalyticsList.find(
          (item) => item.associatedEntity === isTransporters
        ) as IAnalytics;
    } else {
      filteredData = analyticsAllData?.companyAnalytics
        .consolidatedCompanyAnalytics as IAnalytics;
      setEntityPerformanceData(
        analyticsAllData?.companyAnalytics
          ?.perAssociatedEntityShipmentAnalyticsList ?? []
      );
      setEntityPerformanceAllData(
        analyticsAllData?.companyAnalytics
          .perAssociatedEntityShipmentAnalyticsList ?? []
      );
    }

    if (filteredData) {
      setAnalyticsData(filteredData);
      setFilteredDriverPerformanceData(filteredData?.driverAnalytics ?? []);
      setDriverPerformanceData(filteredData?.driverAnalytics ?? []);
      setDriverPerformanceAllData(filteredData?.driverAnalytics ?? []);
      let overspeedingCount = 0;
      let chaiBreakCount = 0;
      let nightDrivingCount = 0;
      let goodDriving = 0;
      let needsImprovementDriving = 0;
      let sleepStatusCount = 0;

      filteredData.driverAnalytics?.forEach((analytics) => {
        overspeedingCount +=
          analytics.alertStatistics.countPerAlert.OVER_SPEEDING ?? 0;
        chaiBreakCount +=
          analytics.alertStatistics.countPerAlert.CHAI_BREAK ?? 0;
        nightDrivingCount +=
          analytics.alertStatistics.countPerAlert.NIGHT_DRIVING ?? 0;
        sleepStatusCount +=
          analytics.alertStatistics.countPerAlert.SLEEP_STATUS_SLEEPING ?? 0;
        if (
          analytics.totalDistanceTravelledInMetersDrivingMode > 50000 &&
          analytics.alertStatistics.alertsPer100kms <= 5
        ) {
          goodDriving++;
        } else {
          needsImprovementDriving++;
        }
      });

      setAlerts({
        overspeeding: overspeedingCount,
        chaiBreak: chaiBreakCount,
        nightDriving: nightDrivingCount,
        total: overspeedingCount + chaiBreakCount + nightDrivingCount,
        sleepStatus: sleepStatusCount,
      });

      const total = goodDriving + needsImprovementDriving;
      let goodPercent = 0;
      let needsImprovementPercent = 0;
      if (total > 0) {
        goodPercent = (goodDriving * 100) / total;
        needsImprovementPercent = (needsImprovementDriving * 100) / total;
      }
      setDriverBehavior({
        good: goodDriving,
        goodPercent: goodPercent,
        needsImprovement: needsImprovementDriving,
        needsImprovementPercent: needsImprovementPercent,
      });
    }
  }, [analyticsAllData, isTransporters]);

  const searchFilterEntityPerformance = (e) => {
    const searchQuery = e.target.value;
    let filteredData = [...entityPerformanceAllData];
    if (searchQuery) {
      filteredData = filteredData.filter((item) =>
        item.associatedEntity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setEntityPerformanceData(filteredData);
  };

  const fetchAnalyse = useCallback(async () => {
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }

    if (companyId === undefined) {
      return;
    }

    const AnalyseOrError = await getAnalyseDetails(companyId, dateRange);
    setIsFetching(false);
    if (AnalyseOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: AnalyseOrError.message,
        type: "error",
      });
      return;
    }
    setAnalyticsAllData(AnalyseOrError);
    setTransporters(
      Array.from(
        new Set(
          AnalyseOrError.companyAnalytics?.perAssociatedEntityShipmentAnalyticsList.map(
            (item) => item.associatedEntity
          )
        )
      )
    );
  }, [dateRange, selectedCompany]);

  useEffect(() => {
    setIsFetching(true);
    fetchAnalyse();
  }, [dateRange, fetchAnalyse]);

  const navigateToDriverReportPage = (driverId: string) => {
    const newTab = window.open(`/driver-reports/${driverId}`, "_blank");
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

  const isAdherenceRateLow = (alertStatistics: AlertStatistics) => {
    return alertStatistics.adherenceRate < 60;
  };

  const getAdherenceRateTableComponent = (alertStatistics: AlertStatistics) => {
    if (
      alertStatistics.adherenceRate === 0 ||
      !isAdherenceRateLow(alertStatistics)
    ) {
      return <>{alertStatistics.adherenceRate.toFixed(0)}</>;
    }

    return (
      <>
        <div className={styles.low_adherence}>
          {alertStatistics.adherenceRate.toFixed(0)} <ErrorIcon />
        </div>
      </>
    );
  };

  const sumCountPerAlert = (
    countPerAlert: Record<string, number>
  ): React.ReactNode => {
    const sum = Object.values(countPerAlert).reduce(
      (sum, value) => sum + value,
      0
    );
    return sum.toFixed(0);
  };

  const handleDownloadReport = async () => {
    let companyId = Auth.getInstance().getCompanySettings()?.id;
    if (selectedCompany) {
      companyId = selectedCompany.id;
    }
    if (companyId === undefined) {
      return;
    }

    try {
      setIsDownloadingAnalyticsReport(true);

      // Get download URL
      const response = await getAnalyticsReportDownloadUrl(
        companyId,
        dateRange
      );

      if (response instanceof HumsaferError) {
        setShowToast({
          open: true,
          message: response.getErrorMessage(),
          type: "error",
        });
        return;
      }

      // If we get here, the download has started (response is null on success)
      setShowToast({
        open: true,
        message: "Analytics Report download has started",
        type: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      setShowToast({
        open: true,
        message: "Failed to download report",
        type: "error",
      });
    } finally {
      setIsDownloadingAnalyticsReport(false);
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

      {showEntityDialog && (
        <TransporterPerformanceDialog
          show={showEntityDialog}
          closeDialog={() => setShowEntityDialog(false)}
          setTransporterDialog={setShowEntityDialog}
          entityPerformanceData={entityPerformanceAllData}
        />
      )}

      {isFetching && (
        <div className={styles.analyse_loader}>
          <CircularProgress size={25} />
        </div>
      )}

      {!isFetching && (
        <>
          {allowCompanySwitcher && <CompanyInfoWithSwitcher />}

          <Grid container spacing={1} className={styles.analyse_container}>
            <Grid
              container
              item
              xs={12}
              className={styles.analyse_top_bar_align}
              sx={{
                flexWrap: {
                  xs: "wrap",
                  md: "nowrap",
                },
                gap: {
                  xs: 2,
                  md: 1,
                },
                alignItems: "center",
              }}
            >
              <Grid item xs={4} md={1}>
                <div className={styles.analyse_top_bar_title}>Analyse</div>
              </Grid>

              <Grid item xs={6} md={2}>
                <div className={styles.select_branch}>
                  <TextField
                    fullWidth
                    select
                    variant="standard"
                    value={isTransporters}
                    onChange={(e) => setIsTransporters(e.target.value)}
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottom: "none",
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottom: "none",
                      },
                      "& .MuiInput-underline:after": { borderBottom: "none" },
                      backgroundColor: "white",
                    }}
                  >
                    <MenuItem value="all_transporters">
                      All Transporters
                    </MenuItem>
                    {Object.values(transporters).map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </Grid>
              <Grid item xs={12} md={4}>
                <div className={styles.analyse_date_filter_align}>
                  <Button
                    className={
                      dateRange === IDateRange.WEEKLY
                        ? styles.analyse_date_filter_button_active
                        : styles.analyse_date_filter_button
                    }
                    onClick={() => setDateRange(IDateRange.WEEKLY)}
                    fullWidth
                    disabled={isDownloadingAnalyticsReport}
                  >
                    Past 7 days
                  </Button>
                  <Button
                    className={
                      dateRange === IDateRange.MONTHLY
                        ? styles.analyse_date_filter_button_active
                        : styles.analyse_date_filter_button
                    }
                    onClick={() => setDateRange(IDateRange.MONTHLY)}
                    fullWidth
                    disabled={isDownloadingAnalyticsReport}
                  >
                    Past 1 month
                  </Button>
                  <Button
                    className={
                      dateRange === IDateRange.QUARTERLY
                        ? styles.analyse_date_filter_button_active
                        : styles.analyse_date_filter_button
                    }
                    onClick={() => setDateRange(IDateRange.QUARTERLY)}
                    fullWidth
                    disabled={isDownloadingAnalyticsReport}
                  >
                    Past 3 months
                  </Button>
                </div>
              </Grid>
              <Grid
                item
                xs={12}
                md={2}
                className={styles.download_button_styles}
              >
                <Button
                  variant="contained"
                  onClick={handleDownloadReport}
                  className={styles.analyse_download_report_btn}
                  disabled={isDownloadingAnalyticsReport}
                  sx={{ borderRadius: "20px", width: "100%" }}
                >
                  {isDownloadingAnalyticsReport ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      <span>Starting Download...</span>
                    </Box>
                  ) : (
                    <>
                      EXPORT REPORT
                      <DownloadIcon style={{ marginLeft: "5px" }} />
                    </>
                  )}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
            <Box sx={{ flexGrow: 2 }} className={styles.analyse_container}>
              <Grid container spacing={1} className={""}>
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <div className={styles.analyse_total_card}>
                    <div className={styles.analyse_card_icon}>
                      <div className={styles.analyse_total_icon_bg}>
                        <ViewInArIcon />
                      </div>
                    </div>
                    <div className={styles.analyse_card_title}>
                      Total Completed Trips
                    </div>
                    <div className={styles.analyse_card_count}>
                      {analyticsData?.shipmentAnalytics.totalTrips}
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2}>
                  <div className={styles.analyse_total_card}>
                    <div className={styles.analyse_card_icon}>
                      <div className={styles.analyse_total_icon_bg}>
                        <ModeOfTravelIcon />
                      </div>
                    </div>
                    <div className={styles.analyse_card_title}>Total KMS</div>
                    <div className={styles.analyse_card_count}>
                      {(
                        (analyticsData?.shipmentAnalytics
                          ?.totalDistanceTravelledInMeters ?? 0) / 1000
                      ).toFixed(0)}
                    </div>
                  </div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <div className={styles.analyse_driver_card}>
                    <div className={styles.analyse_driver_title}>
                      Drivers
                      <span className={styles.analyse_driver_count}>
                        {analyticsData?.shipmentAnalytics?.totalDrivers ?? 0}
                      </span>
                    </div>
                    <div className={styles.analyse_driver_box}>
                      <div>
                        <List
                          sx={{
                            bgcolor: "background.paper",
                          }}
                        >
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar
                              className={styles.analyse_driver_color_icon}
                            >
                              <CircleIcon
                                className={
                                  styles.analyse_driver_color_icon_svg_color_high
                                }
                              />
                            </ListItemAvatar>
                            <ListItemText
                              className={styles.analyse_driver_text}
                              primary="Good Driving"
                              secondary={
                                <Typography
                                  sx={{ display: "inline" }}
                                  variant="body2"
                                  color="#67707E"
                                  fontSize={16}
                                  fontWeight={500}
                                  fontFamily="DM Sans, Sans-serif"
                                >
                                  {driverBehavior?.good ?? 0}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar
                              className={styles.analyse_driver_color_icon}
                            >
                              <CircleIcon
                                className={
                                  styles.analyse_driver_color_icon_svg_color_low
                                }
                              />
                            </ListItemAvatar>
                            <ListItemText
                              className={styles.analyse_driver_text}
                              primary="Needs Improvement"
                              secondary={
                                <Typography
                                  sx={{ display: "inline" }}
                                  variant="body2"
                                  color="#67707E"
                                  fontSize={16}
                                  fontWeight={500}
                                  fontFamily="DM Sans, Sans-serif"
                                  letterSpacing={"-2% "}
                                >
                                  {driverBehavior?.needsImprovement ?? 0}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </List>
                      </div>
                      <div>
                        <DriverAdherenceChart
                          highAdherence={driverBehavior?.goodPercent ?? 0}
                          lowAdherence={
                            driverBehavior?.needsImprovementPercent ?? 0
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12} md={12} lg={4}>
                  <div className={styles.analyse_alerts_card}>
                    <div className={styles.analyse_alert_driver_title}>
                      Alerts
                      <span className={styles.analyse_driver_count}>
                        {alerts?.total ?? 0}
                      </span>
                    </div>
                    <Grid container spacing={2} style={{ marginTop: "5px" }}>
                      {[
                        {
                          label: "Over speeding",
                          value: alerts?.overspeeding ?? 0,
                        },
                        { label: "4 Hr Break", value: alerts?.chaiBreak ?? 0 },
                        {
                          label: "Night driving",
                          value: alerts?.nightDriving ?? 0,
                        },
                        {
                          label: "Sleep detection",
                          value: alerts?.sleepStatus ?? 0,
                        },
                      ].map((alert, index) => (
                        <Grid
                          item
                          xs={6}
                          key={index}
                          className={styles.analyse_driver_alert_box}
                        >
                          <div className={styles.alert_label_style}>
                            {alert.label}
                            <span className={styles.alert_value_style}>
                              {alert.value}
                            </span>
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          {isTransporters === "all_transporters" && (
            <Grid container>
              <Grid
                className={styles.table_component_container}
                item
                lg={12}
                md={12}
                xs={12}
              >
                <Card className={styles.branch_box}>
                  <div className={styles.heading}>
                    <Grid
                      container
                      spacing={1}
                      className={styles.align_items_center}
                    >
                      <Grid item xs={12} md={4}>
                        <div className={styles.title}>
                          Transporter Performance
                        </div>
                      </Grid>
                      <Grid item xs={7} md={3}>
                        <TextField
                          fullWidth
                          variant="standard"
                          placeholder="Search transporter here..."
                          onChange={searchFilterEntityPerformance}
                          sx={{
                            "& .MuiInput-underline:before": {
                              borderBottom: "none",
                            },
                            "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                              {
                                borderBottom: "none",
                              },
                            "& .MuiInput-underline:after": {
                              borderBottom: "none",
                              content: "none",
                            },
                            backgroundColor: "#F8F9FA;",
                            borderRadius: "20px",
                            padding: "8px 6px 6px 15px",
                          }}
                          InputProps={{
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              </>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={5} md={5}>
                        <Button
                          type="button"
                          variant="outlined"
                          className={styles.view_All_button}
                          onClick={() => setShowEntityDialog(true)}
                        >
                          VIEW ALL
                        </Button>
                      </Grid>

                      <Grid item xs={12} md={12}>
                        <GenericTable
                          headers={[
                            "Transporter",
                            "KMS  driven",
                            "Total trips",
                            "Total drivers",
                            "Alerts per 100km",
                          ]}
                          data={entityPerformanceData}
                          dataRenderer={(data, column) => {
                            const entity = data;
                            switch (column) {
                              case 0:
                                return entity.associatedEntity;
                              case 1:
                                return (
                                  entity.shipmentAnalytics
                                    ?.totalDistanceTravelledInMeters / 1000
                                ).toFixed(0);
                              case 2:
                                return entity.shipmentAnalytics.totalTrips.toFixed(
                                  0
                                );
                              case 3:
                                return entity.shipmentAnalytics.totalDrivers.toFixed(
                                  0
                                );
                              case 4:
                                const driverAnalytics = entity.driverAnalytics;
                                if (
                                  driverAnalytics === undefined ||
                                  driverAnalytics.length === 0
                                ) {
                                  return "-";
                                }

                                const avgAlertsPer100kms =
                                  driverAnalytics
                                    .map(
                                      (driver) =>
                                        driver.alertStatistics.alertsPer100kms
                                    )
                                    .reduce((acc, curr) => acc + curr, 0) /
                                  driverAnalytics.length;
                                return avgAlertsPer100kms.toFixed(2);
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </Card>
              </Grid>
            </Grid>
          )}
          <Grid
            className={styles.table_component_container}
            item
            lg={12}
            md={12}
            xs={12}
          >
            <Card className={styles.branch_box}>
              <div className={styles.heading}>
                <Grid
                  container
                  spacing={1}
                  className={styles.align_items_center}
                >
                  <Grid item xs={12} md={4}>
                    <div className={styles.title}>Driver Performance </div>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Search driver here..."
                      onChange={searchFilterDriverPerformance}
                      sx={{
                        "& .MuiInput-underline:before": {
                          borderBottom: "none",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          {
                            borderBottom: "none",
                          },
                        "& .MuiInput-underline:after": {
                          borderBottom: "none",
                          content: "none",
                        },
                        backgroundColor: "#F8F9FA;",
                        borderRadius: "20px",
                        width: "90%",
                        padding: "8px 6px 6px 15px",
                      }}
                      InputProps={{
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          </>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Select
                      style={{ width: "100%" }}
                      className={styles.view_All_button}
                      value={driverPerformanceAdherenceFilterType}
                      onChange={(e) =>
                        setDriverPerformanceAdherenceFilterType(
                          e.target
                            .value as IDriverPerformanceAdherenceFilterType
                        )
                      }
                    >
                      {adherenceOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          onClick={() =>
                            setDriverPerformanceAdherenceFilterType(
                              option.value
                            )
                          }
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
              </div>
              <GenericTable
                headers={[
                  { header: "Driver Name" },
                  { header: "Mobile No." },
                  {
                    header: "KMs",
                    sortByField: "totalDistanceTravelledInMetersDrivingMode",
                  },
                  {
                    header: "Ignored OS Alerts",
                    sortByField: "alertStatistics.alertsIgnored",
                  },
                  {
                    header: "Obeyed OS Alerts",
                    sortByField: "alertStatistics.alertsObeyed",
                  },
                  {
                    header: "Total OS Alerts",
                    sortByField: "alertStatistics.totalAlerts",
                  },
                  {
                    header: "Alerts Per 100km",
                    sortByField: "alertStatistics.alertsPer100kms",
                  },
                  {
                    header: "4 HR Break",
                    sortByField: "alertStatistics.countPerAlert.CHAI_BREAK",
                  },
                  {
                    header: "Sleeping Alerts",
                    sortByField:
                      "alertStatistics.countPerAlert.SLEEP_STATUS_SLEEPING",
                  },
                  {
                    header: "Night Driving Distance",
                    sortByField: "totalNightDrivingDistanceInMetres",
                  },
                  {
                    header: "Over Speeding Distance",
                    sortByField: "totalOverSpeedingDistanceInMeters",
                  },
                  {
                    header: "Total Violations",
                    sortByField: "alertStatistics.countPerAlert",
                  },
                  {
                    header: "Adherence Rate",
                    sortByField: "alertStatistics.adherenceRate",
                  },
                  { header: "View Driver" },
                ]}
                data={driverPerformanceData.filter(
                  (driver) =>
                    (
                      (driver.totalDistanceTravelledInMetersDrivingMode ?? 0) /
                      1000
                    ).toFixed(0) !== "0"
                )}
                pagination
                dataRenderer={(data, column) => {
                  const driver = data;
                  switch (column) {
                    case 0:
                      return driver.driverDisplayName ?? "-";
                    case 1:
                      return driver.driverMobileNumber ?? "-";
                    case 2:
                      return (
                        (driver.totalDistanceTravelledInMetersDrivingMode ??
                          0) / 1000
                      ).toFixed(0);
                    case 3:
                      return driver.alertStatistics.alertsIgnored.toFixed(0);
                    case 4:
                      return driver.alertStatistics.alertsObeyed.toFixed(0);
                    case 5:
                      return (
                        driver.alertStatistics.alertsIgnored +
                        driver.alertStatistics.alertsObeyed
                      ).toFixed(0);
                    case 6:
                      return driver.alertStatistics.alertsPer100kms.toFixed(2);
                    case 7:
                      return driver.alertStatistics.countPerAlert.CHAI_BREAK.toFixed(
                        0
                      );
                    case 8:
                      return driver.alertStatistics.countPerAlert.SLEEP_STATUS_SLEEPING?.toFixed(
                        0
                      );
                    case 9:
                      return (
                        (driver.totalNightDrivingDistanceInMetres ?? 0) / 1000
                      ).toFixed(0);
                    case 10:
                      return (
                        (driver.totalOverSpeedingDistanceInMeters ?? 0) / 1000
                      ).toFixed(0);
                    case 11:
                      return sumCountPerAlert(
                        driver.alertStatistics?.countPerAlert
                      );
                    case 12:
                      return getAdherenceRateTableComponent(
                        driver.alertStatistics
                      );
                    case 13:
                      return (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() =>
                            navigateToDriverReportPage(data.driverUserId)
                          }
                        >
                          View
                        </Button>
                      );
                  }
                }}
              />
            </Card>
          </Grid>
        </>
      )}
    </>
  );
});

export default AnalyseDetailsPage;
