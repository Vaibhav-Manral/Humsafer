import moment from "moment";
import { Entitlement } from "../models/DriverProfile";
import { IDrivingLicenseView } from "../models/DrivingLicenseView";
import { RideEndMethod } from "../models/RideView";
import { AppHealth, IDateRange, ShipmentStatus } from "../models/ShipmentsView";
import { IUserProfile } from "../models/User";

export function covListFromDrivingLicense(drivingLicense: IDrivingLicenseView) {
  const classOfVehicles = drivingLicense.classOfVehicles;
  if (!classOfVehicles || classOfVehicles.length === 0) {
    return "-";
  }

  return classOfVehicles.map((cov) => cov.cov).toString();
}

export function formatEntitlementsForDisplay(entitlements: Entitlement[]) {
  return entitlements.toString();
}

export function formatDistanceInMetersForDisplay(distanceInMeters: number) {
  return `${(distanceInMeters / 1000).toFixed()} kms`;
}

export function formatAmountInPaiseForDisplay(amountInPaise: number) {
  return `₹ ${(amountInPaise / 100).toFixed()}`;
}

export function displayNameForPortalUser(user: IUserProfile) {
  return `${user.firstName} ${user.lastName}`;
}

export function formatRideEndMethodForDisplay(rideEndMethod: RideEndMethod) {
  switch (rideEndMethod) {
    case RideEndMethod.MANUAL:
      return "Manual";
    case RideEndMethod.AUTO:
    case RideEndMethod.AUTO_LOW_LOCATION_MOVEMENTS:
      return "Auto (no movements)";
    case RideEndMethod.AUTO_NO_LOCATION_UPDATES:
      return "Auto (no location updates)";
  }
}

export function getDisplayTextForShipmentStatus(status: ShipmentStatus) {
  switch (status) {
    case ShipmentStatus.CREATED:
      return "Created";
    case ShipmentStatus.IN_TRANSIT:
      return "In Transit";
    case ShipmentStatus.COMPLETE:
      return "Complete";
    case ShipmentStatus.CANCELLED:
      return "Cancelled";
    case ShipmentStatus.NOT_TRACKED:
      return "Not Tracked";
    case ShipmentStatus.IN_COMPLETE:
      return "Incomplete";
  }
}

export function getDisplayNameForAppHealth(health: AppHealth) {
  switch (health) {
    case AppHealth.HEALTHY:
      return "Healthy";
    case AppHealth.APP_NOT_INSTALLED:
      return "App not installed";
    case AppHealth.APP_UPDATE_REQUIRED:
      return "App update required";
    case AppHealth.PERMISSIONS_PENDING:
      return "Permissions pending";
  }
}

export function getDisplayDateRange(dateRange: IDateRange) {
  switch (dateRange) {
    case IDateRange.TODAY:
      return moment().format("DD MMM");

    case IDateRange.LAST_WEEK:
      const lastWeekStart = moment().startOf("day").subtract(7, "days");
      const lastWeekEnd = moment().startOf("day").subtract(1, "days");
      return `${lastWeekStart.format("DD MMM")} - ${lastWeekEnd.format(
        "DD MMM"
      )}`;

    case IDateRange.LAST_MONTH:
      const lastMonthStart = moment().startOf("day").subtract(30, "days");
      const lastMonthEnd = moment().startOf("day").subtract(1, "days");
      return `${lastMonthStart.format("DD MMM")} - ${lastMonthEnd.format(
        "DD MMM"
      )}`;

    default:
      return "";
  }
}

export const formatDistance = (distanceInMeters?: number): string => {
  if (distanceInMeters !== undefined) {
    const distanceInKm = distanceInMeters / 1000;
    return `${distanceInKm.toFixed(2)} km`;
  }
  return "N/A";
};
