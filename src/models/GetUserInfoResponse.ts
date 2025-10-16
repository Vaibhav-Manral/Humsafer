import { IDrivingLicenseView } from "./DrivingLicenseView";
import { IPaymentMethodView } from "./PaymentMethodView";
import { IPayoutTransaction } from "./PayoutTransaction";
import { IRideView } from "./RideView";
import { IDriverProfile } from "./DriverProfile";
import { IUserRewardsView } from "./UserRewardsView";
import { IInsuranceView } from "./InsuranceView";
import { IBasicShipmentView } from "./analyse";

export interface IGetUserInfoResponse {
  userProfile: IDriverProfile;
  lastStarPointEarnedTime?: string;
  lastRideEndTime?: string;
  lastRedemptionEventTime?: string;
  payoutTransactions: IPayoutTransaction[];
  drivingLicenseView?: IDrivingLicenseView;
  paymentMethods?: IPaymentMethodView[];
  userRewardsView: IUserRewardsView;
  recentRides: IRideView[];
  recentShipments: IBasicShipmentView[]
  biradareeInsuranceView: IInsuranceView;
  userPerformanceView: IUserPerformanceView;
  devices?: Record<string, IDeviceData>;
  lastLiveLocations: ILiveLocationView[];
}

export interface IUserPerformanceView {
  starPointsEarnedThisMonth: number;
  moneyRedeemedInPaiseThisMonth: number;
  safeDistanceInMetresThisMonth: number;
}

export interface IDeviceData {
  appIdentifier: string;
  appVersion: string;
  lastUpdated: string;
  model: string;
  name: string;
  osVersion: string;
  type: string;
  grantedPermissions?: string[];
  pendingPermissions?: string[];
}


export interface ILiveLocationView {
  latitude: number;
  longitude: number;
  lastUpdated: string;
  source: string;
  currentBatteryCharging: boolean;
  currentBatteryPercent?: number;
  isExemptFromBatteryOptimization: boolean;
  isInPowerSaverMode: boolean;
}
