import { HumsaferError } from "../models/HumsaferError";
import {
  DrivingLicenseVerifiedStatus,
  IDrivingLicenseView,
} from "../models/DrivingLicenseView";
import { BACKEND_URL_V1, deletee, get, post } from "../utils/Api";

interface IDrivingLicenseResponse {
  drivingLicenseList: IDrivingLicenseView[];
}

export const getDrivingLicenses = async (
  dlVerifiedStatus: DrivingLicenseVerifiedStatus
): Promise<IDrivingLicenseView[] | HumsaferError> => {
  try {
    const response = await get<IDrivingLicenseResponse>(
      `${BACKEND_URL_V1}/drivingLicense?drivingLicenseVerifiedStatus=${dlVerifiedStatus}`
    );

    if (Math.floor(response.status / 100) === 2) {
      if (response.parsedBody?.drivingLicenseList) {
        return response.parsedBody.drivingLicenseList;
      }

      return [];
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Driving license could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

export const manuallyVerifyDl = async (
  drivingLicenseId: string
): Promise<HumsaferError | null> => {
  try {
    const response = await post(
      `${BACKEND_URL_V1}/drivingLicense/${drivingLicenseId}/verify`
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ?? "DL could not be verified";
    return new HumsaferError(errorMessage);
  } catch (err) {
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};

export const revokeDlVerification = async (
  drivingLicenseId: string
): Promise<HumsaferError | null> => {
  try {
    const response = await post(
      `${BACKEND_URL_V1}/drivingLicense/${drivingLicenseId}/revokeVerification`
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "DL verifictation could not be revoked";
    return new HumsaferError(errorMessage);
  } catch (err) {
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};

export const resetDl = async (
  userId: string
): Promise<HumsaferError | null> => {
  try {
    const response = await deletee(
      `${BACKEND_URL_V1}/drivingLicense/users/${userId}/delete`
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "DL verifictation could not be reset";
    return new HumsaferError(errorMessage);
  } catch (err) {
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};
