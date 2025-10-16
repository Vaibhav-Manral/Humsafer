import { ICompany } from "../models/Companies";
import { HumsaferError } from "../models/HumsaferError";
import { Capability, IUserProfile, Namespace } from "../models/User";
import { BACKEND_URL_V1, deletee, get, post } from "../utils/Api";
import { Auth } from "../utils/Auth";
interface IGetSettings {
  userProfile: IUserProfile;
  companyView: ICompany | undefined;
}
interface IGetUsers {
  users: IUserProfile[];
}

export interface IAddUserRequest {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  namespace: Namespace;
  capabilities: Capability[];
}

export const getSettings = async (): Promise<IUserProfile | HumsaferError> => {
  try {
    const response = await get<IGetSettings>(`${BACKEND_URL_V1}/users/me/settings`);
    if (response.parsedBody?.userProfile) {
      // for each get setting call, save the latest in auth session
      Auth.getInstance().saveUserSettings(response.parsedBody.userProfile);
      if (response.parsedBody.companyView) {
        Auth.getInstance().saveUserCompanySettings(response.parsedBody.companyView)
      }

      return response.parsedBody.userProfile;
    }

    const errorMessage = response.serverError?.error.message ?? "User settings could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getUsers = async (): Promise<IUserProfile[] | HumsaferError> => {
  try {
    const response = await get<IGetUsers>(`${BACKEND_URL_V1}/users`);
    if (response.parsedBody?.users) {
      return response.parsedBody.users;
    }

    const errorMessage = response.serverError?.error.message ?? "Users could not be retrieved";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
};


export const addUser = async (request: IAddUserRequest): Promise<null | HumsaferError> => {
  try {
    const response = await post(`${BACKEND_URL_V1}/users`, request);
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage = response.serverError?.error.message ?? "User could not be added";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
}

export const editUser = async (userId: string, request: IAddUserRequest): Promise<null | HumsaferError> => {
  try {
    const response = await post(`${BACKEND_URL_V1}/users/${userId}`, request);
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage = response.serverError?.error.message ?? "User could not be updated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
}

export const deleteUser = async (userId: string): Promise<null | HumsaferError> => {
  try {
    const response = await deletee(`${BACKEND_URL_V1}/users/${userId}`);
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }

    const errorMessage = response.serverError?.error.message ?? "User could not be deleted";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.log(err);
    return new HumsaferError("Something went wrong");
  }
}

