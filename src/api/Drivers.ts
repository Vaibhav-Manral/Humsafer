import { IGetBiradareeInfoResponse } from "../models/GetBiradareeInfoResponse";
import { IGetUserInfoResponse } from "../models/GetUserInfoResponse";
import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V1, get, post } from "../utils/Api";

export const getUserInfo = async (
  mobileNumber: string
): Promise<IGetUserInfoResponse | HumsaferError> => {
  try {
    const response = await get<IGetUserInfoResponse>(
      `${BACKEND_URL_V1}/drivers/mobileNumber/${encodeURIComponent(mobileNumber)}`
    );

    if (Math.floor(response.status / 100) === 2) {
      if (response.parsedBody) {
        return response.parsedBody;
      }
    }

    const errorMessage = response.serverError?.error.message ?? "User could not be found";
    return new HumsaferError(errorMessage, response.serverError?.error?.errorCode);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

export const getUserBiradareeInfo = async (
  mobileNumber: string
): Promise<IGetBiradareeInfoResponse | HumsaferError> => {
  try {
    const response = await get<IGetBiradareeInfoResponse>(
      `${BACKEND_URL_V1}/drivers/mobileNumber/${encodeURIComponent(mobileNumber)}/biradareeInfo`
    );

    if (Math.floor(response.status / 100) === 2) {
      if (response.parsedBody) {
        return response.parsedBody;
      }
    }

    const errorMessage = response.serverError?.error.message ?? "User could not be found";
    return new HumsaferError(errorMessage, response.serverError?.error?.errorCode);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};


export const submitDriverDevicesRefreshRequest = async (
  mobileNumber: string
): Promise<void | HumsaferError> => {
  try {
    const response = await post<void>(
      `${BACKEND_URL_V1}/drivers/mobileNumber/${encodeURIComponent(mobileNumber)}/refreshDevice`
    );

    if (Math.floor(response.status / 100) === 2) {
      return;
    }

    const errorMessage = response.serverError?.error.message ?? "Something went wrong";
    return new HumsaferError(errorMessage, response.serverError?.error?.errorCode);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

