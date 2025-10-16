import { Card, CardContent, Grid } from "@mui/material";
import { useContext } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { IDriverProfile } from "../../models/DriverProfile";
import { IUserRewardsView } from "../../models/UserRewardsView";
import { IUserPerformanceView } from "../../models/GetUserInfoResponse";
import {
  formatDate,
  formatDateTime,
  formatMilliSecondsForDisplay,
} from "../../utils/DateUtils";
import {
  formatAmountInPaiseForDisplay,
  formatDistanceInMetersForDisplay,
} from "../../utils/DisplayUtils";
import styles from "./DriverProfileInfo.module.css";

interface IDriverProfileInfo {
  driverProfile: IDriverProfile;
  lastPointsEarnedTime: string | undefined;
  lastRedeemTime: string | undefined;
  lastRideEndTime: string | undefined;
  userRewardsView: IUserRewardsView;
  userPerformanceView: IUserPerformanceView;
}

const DriverProfileInfo: React.FC<IDriverProfileInfo> = (props) => {
  const {
    driverProfile,
    lastRedeemTime,
    userPerformanceView,
  } = props;
  const { primaryColor } = useContext(HumsaferThemeContext);
  return (
    <Card className={styles.driverProfileInfo__container}>
      <div className={styles.driverProfileInfo__headingConatiner}>
        <div
          className={styles.driverProfileInfo__title}
          style={{ color: primaryColor }}
        >
          Driver Profile Info
        </div>
      </div>
      <CardContent>
        <Grid container spacing={4} className={styles.driverProfileInfo__row}>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>Name</div>
            <div className={styles.driverProfileInfo__value}>
              {driverProfile.name}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>Mobile Number</div>
            <div className={styles.driverProfileInfo__value}>
              {driverProfile.mobileNumber}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Account Created On
            </div>
            <div className={styles.driverProfileInfo__value}>
              {formatDateTime(driverProfile.creationTime)}
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={4} className={styles.driverProfileInfo__row}>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Current Points Multipler
            </div>
            <div className={styles.driverProfileInfo__value}>
              1km = {driverProfile.level.pointsMultiplier} points
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Last Redeem On
            </div>
            <div className={styles.driverProfileInfo__value}>
              {lastRedeemTime ? formatDate(lastRedeemTime) : "-"}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4}>
            <div className={styles.driverProfileInfo__label}>
              Live Location Enabled
            </div>
            <div className={styles.driverProfileInfo__value}>
              {driverProfile.liveLocationSharingEnabled ? "Yes" : "No"}
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={4} className={styles.driverProfileInfo__row}>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Lifetime Points Earned (Via Rides)
            </div>
            <div className={styles.driverProfileInfo__value}>
              {
                driverProfile.userLifetimeStatsView
                  .totalStarPointsEarnedViaRides
              }
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Lifetime Money Earned
            </div>
            <div className={styles.driverProfileInfo__value}>
              {formatAmountInPaiseForDisplay(
                driverProfile.userLifetimeStatsView.totalMoneyEarnedInPaise
              )}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Lifetime Violation Points Lost
            </div>
            <div className={styles.driverProfileInfo__value}>
              {driverProfile.userLifetimeStatsView.totalViolationPoints}
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={4} className={styles.driverProfileInfo__row}>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Money Redeemed This Month
            </div>
            <div className={styles.driverProfileInfo__value}>
              ₹ {userPerformanceView.moneyRedeemedInPaiseThisMonth / 100}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Star Points Earned This Month
            </div>
            <div className={styles.driverProfileInfo__value}>
              {userPerformanceView.starPointsEarnedThisMonth}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Safe Distance Travelled This Month
            </div>
            <div className={styles.driverProfileInfo__value}>
              {(
                userPerformanceView.safeDistanceInMetresThisMonth / 1000
              ).toFixed()}{" "}
              kms
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={4} className={styles.driverProfileInfo__row}>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Lifetime Distance Travelled
            </div>
            <div className={styles.driverProfileInfo__value}>
              {formatDistanceInMetersForDisplay(
                driverProfile.userLifetimeStatsView
                  .totalDistanceTravelledInMeters
              )}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              Lifetime Duration Travelled
            </div>
            <div className={styles.driverProfileInfo__value}>
              {formatMilliSecondsForDisplay(
                driverProfile.userLifetimeStatsView
                  .totalDurationTravelledInMilliSeconds
              )}
            </div>
          </Grid>
          <Grid item xs={6} sm={6} md={4} lg={4} >
            <div className={styles.driverProfileInfo__label}>
              B2B Affiliation
            </div>
            <div className={styles.driverProfileInfo__value}>
              {driverProfile.b2BAffiliation}
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DriverProfileInfo;
