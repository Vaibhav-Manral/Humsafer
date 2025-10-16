export interface IDrivingLicenseView {
  id: string;
  userId: string;
  verifiedStatus: DrivingLicenseVerifiedStatus;
  creationTime: number;
  lastUpdateTime: number;
  drivingLicenseNumber: string;
  addresses: IAddressView[];
  bloodGroup: string;
  classOfVehicles?: IClassOfVehicleView[];
  dateOfBirth?: string;
  expiryDate: string;
  fatherOrHusbandName: string;
  base64Image: string;
  issueDate: string;
  name?: string;
  state: string;
  endorseDate: string;
  endorseNumber: string;
  status: IStatusView;
  validity: IValidityView;
  verificationTransactionId: string;
  verificationTime: number;
  verifiedBy?: string;
  dlFrontImage?: URL;
  dlBackImage?: URL;
}

export interface IAddressView {
  addressLine1: string;
  completeAddress: string;
  country: string;
  district: string;
  pin: string;
  state: string;
  type: string;
}

export interface IStatusView {
  status: string;
  from: string;
  remarks: string;
  to: string;
}

export interface IClassOfVehicleView {
  cov: string;
  expiryDate: string;
  issueDate: string;
}

export interface IValidityView {
  nonTransport: IDatesView;
  transport: IDatesView;
}

export interface IDatesView {
  from: string;
  to: string;
}

export enum DrivingLicenseVerifiedStatus {
  VERIFIED_API = "VERIFIED_API",
  VERIFIED_LEGACY_API = "VERIFIED_LEGACY_API",
  VERIFIED_MANUAL = "VERIFIED_MANUAL",
  IN_REVIEW = "IN_REVIEW",
  UNVERIFIED = "UNVERIFIED",
}

export function displayStringForVerificationStatus(verifiedStatus: DrivingLicenseVerifiedStatus) {
  switch (verifiedStatus) {
    case DrivingLicenseVerifiedStatus.VERIFIED_API:
    case DrivingLicenseVerifiedStatus.VERIFIED_LEGACY_API:
      return "Verified via API";
    case DrivingLicenseVerifiedStatus.VERIFIED_MANUAL:
      return "Verified Manually";
    case DrivingLicenseVerifiedStatus.IN_REVIEW:
      return "In Review";
    case DrivingLicenseVerifiedStatus.UNVERIFIED:
      return "Unverified";
  }
}
