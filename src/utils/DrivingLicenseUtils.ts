import { DrivingLicenseVerifiedStatus, IClassOfVehicleView } from "../models/DrivingLicenseView";

export const truckDriverClassOfVehicles = ["HMV", "HPMV", "HTV", "Heavy", "Trailer", "TRANS", "LMV-TR", "Heavy Transport Vehicle"]

export function isTruckDriverLicense(covList?: IClassOfVehicleView[]): boolean {
  if (!covList && covList === null) {
    return false;
  }
  for (let i=0; covList !=null && i<covList?.length; i++) {
    let item = covList[i]
    if (!truckDriverClassOfVehicles.includes(item.cov)) {
      return false;
    }
  }
  return true;
}

export function isDlVerifiedByApi(dlStatus: DrivingLicenseVerifiedStatus): boolean {
  if (dlStatus === DrivingLicenseVerifiedStatus.VERIFIED_API || dlStatus === DrivingLicenseVerifiedStatus.VERIFIED_LEGACY_API) {
    return true;
  }
  return false;
}

export function isDlInReview(dlStatus: DrivingLicenseVerifiedStatus): boolean {
  if (dlStatus === DrivingLicenseVerifiedStatus.IN_REVIEW) {
    return true;
  }
  return false;
}
