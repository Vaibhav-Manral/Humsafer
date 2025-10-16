import { HumsaferError } from "../models/HumsaferError";
import { ICompany, AvailableFeatures, CompanyType } from "../models/Companies";
import { BACKEND_URL_V2, get, post, deletee } from "../utils/Api";
import { IUserProfile } from "../models/User";
import { IAddUserRequest } from "./Users";
import { IFuelingStopsInfo } from "../models/FuelOptimazationResponse";

interface IGetCompaniesResponse {
  companies: ICompany[];
}
export interface IAddCompanyRequest {
  companyName: string;
  panNumber: string;
  availableFeatures: AvailableFeatures[];
  companyType: CompanyType;
  associatedEntities: string[];
  adminFirstName: string;
  adminLastName: string;
  adminMobileNumber: string;
  adminEmail: string;
  isDriveModeAudioAlertsEnabled: boolean;
}
export interface IUpdateCompanyRequest {
  availableFeatures: AvailableFeatures[];
  companyType: CompanyType;
  associatedEntities: string[];
  isDriveModeAudioAlertsEnabled: boolean;
}

export interface IFuelOptimizationRequest {
  maxStops: number;
  mileageInKmsPerLtr: number;
  initialFuelLtrs: number;
  tankCapacityInLtrs: number;
  reserveFuelInLtrs: number;
  minFuelToPurchaseInLtrs: number;
}

export const getCompanies = async (): Promise<ICompany[] | HumsaferError> => {
  try {
    const response = await get<IGetCompaniesResponse>(
      `${BACKEND_URL_V2}/companies`
    );
    if (response.parsedBody?.companies) {
      return response.parsedBody.companies;
    }
    const errorMessage =
      response.serverError?.error.message ?? "Companies could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const addCompany = async (
  request: IAddCompanyRequest
): Promise<null | HumsaferError> => {
  try {
    const response = await post(`${BACKEND_URL_V2}/companies`, request);
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ?? "Company could not be added";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const editCompany = async (
  companyId: string,
  request: IUpdateCompanyRequest
): Promise<null | HumsaferError> => {
  try {
    const response = await post(
      `${BACKEND_URL_V2}/companies/${companyId}`,
      request
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ?? "Company could not be updated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getCompanyUsers = async (
  companyId: string
): Promise<IUserProfile[] | HumsaferError> => {
  try {
    const response = await get<{ users: IUserProfile[] }>(
      `${BACKEND_URL_V2}/companies/${companyId}/users`
    );
    if (response.parsedBody?.users) {
      return response.parsedBody.users;
    }

    const errorMessage =
      response.serverError?.error.message ?? "Users could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

export const addCompanyUser = async (
  companyId: string,
  request: IAddUserRequest
): Promise<null | HumsaferError> => {
  try {
    const response = await post(
      `${BACKEND_URL_V2}/companies/${companyId}/users`,
      request
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage =
      response.serverError?.error.message ?? "User could not be added";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

export const editCompanyUser = async (
  companyId: string,
  userId: string,
  request: IAddUserRequest
): Promise<null | HumsaferError> => {
  try {
    const response = await post(
      `${BACKEND_URL_V2}/companies/${companyId}/users/${userId}`,
      request
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage =
      response.serverError?.error.message ?? "User could not be updated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};

export const getShipmentFuelPlan = async (
  shipmentId: string,
  request: IFuelOptimizationRequest | null
): Promise<IFuelingStopsInfo | HumsaferError> => {
  try {
    const response = await post<IFuelingStopsInfo>(
      `${BACKEND_URL_V2}/companies/fuelOptimization/shipments/${shipmentId}`,
      request
    );
    if (response.parsedBody) {
      return response.parsedBody as IFuelingStopsInfo;
    }

    const errorMessage =
      response.serverError?.error.message ??
      "Unable to create fuel plan for the shipment";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const deleteCompanyUser = async (
  companyId: string,
  userId: string
): Promise<null | HumsaferError> => {
  try {
    const response = await deletee(
      `${BACKEND_URL_V2}/companies/${companyId}/users/${userId}`
    );
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage =
      response.serverError?.error.message ?? "User could not be deleted";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};
