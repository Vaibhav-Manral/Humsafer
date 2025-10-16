import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInWithCustomToken } from "firebase/auth";
import { HumsaferError } from "../models/HumsaferError";
import { IUserProfile } from "../models/User";
import { Config } from "./Config";
import { ICompany } from "../models/Companies";
import { Environment } from "./Environment";
import { LocalCache } from "./LocalCache";
import { IInitiateAuthSessionResponse, initiateAuthSession, verifyAuthSession } from "../api/AuthApi";

export class Auth {
  private static instance: Auth;
  private authSession: ConfirmationResult | undefined;

  private static readonly userSettingsStorageKey = "userSettings";
  private static readonly userCompanySettingsStorageKey = "companySettings";
  private static readonly userCompanyListStorageKey = "companyList"

  private constructor() {
    initializeApp(Config.getInstance().getFirebaseConfig());
    if (Config.getInstance().getEnvironment() === Environment.DEV
      || Config.getInstance().getEnvironment() === Environment.STAGE) {
      getAuth().settings.appVerificationDisabledForTesting = true;
    }
  }

  public static getInstance() {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  public async getToken(): Promise<string | HumsaferError> {

    const overrideSessionToken = this.getOverrideSessionToken();
    if (overrideSessionToken !== null) {
      return new Promise<string>(function (resolve) {
        resolve(overrideSessionToken);
      });
    }

    return new Promise<string | HumsaferError>(function (resolve, reject) {
      getAuth().onAuthStateChanged(async function (user) {
        if (user) {
          const token = await user.getIdToken();
          if (token) {
            resolve(token);
          }
          reject(new HumsaferError("token not found"));
        } else {
          reject(new HumsaferError("user not found"));
        }
      });
    }).catch((error) => {
      if (error instanceof HumsaferError) {
        return error;
      }
      console.log(error);
      return new HumsaferError("Something went wrong");
    });
  }

  public async refreshToken() {
    await getAuth().currentUser?.getIdToken(true);
  }

  public isLoggedIn() {
    return this.getUserSettings() ? true : false;
  }

  public logout() {
    getAuth().signOut();
    this.clearUserSettings();
    LocalCache.clearCompanyList();
  }

  public saveUserSettings(userSettings: IUserProfile) {
    window.localStorage.setItem(Auth.userSettingsStorageKey, JSON.stringify(userSettings));
  }

  public getUserSettings(): IUserProfile | undefined {
    const userSettingsJson = window.localStorage.getItem(Auth.userSettingsStorageKey);
    if (userSettingsJson) {
      return JSON.parse(userSettingsJson);
    }
    return undefined;
  }

  public saveUserCompanySettings(companyView: ICompany) {
    window.localStorage.setItem(Auth.userCompanySettingsStorageKey, JSON.stringify(companyView));
  }

  public getCompanySettings(): ICompany | undefined {
    const companySettingsJson = window.localStorage.getItem(Auth.userCompanySettingsStorageKey);
    if (companySettingsJson) {
      return JSON.parse(companySettingsJson);
    }
    return undefined;
  }

  private clearUserSettings() {
    window.localStorage.removeItem(Auth.userSettingsStorageKey);
  }

  public async signInWithCustomToken(
    customToken: string
  ): Promise<HumsaferError | undefined> {

    return await signInWithCustomToken(getAuth(), customToken)
      .then((result) => {
        return undefined;
      })
      .catch((error) => {
        console.log(error);
        return new HumsaferError("Something went wrong");
      })
  }

  public async verifyOtpV2(referenceId: string, otp: string): Promise<HumsaferError | undefined> {
    if (otp.length < 6) {
      return new HumsaferError("Please enter a valid OTP");
    }

    const resultOrError = await verifyAuthSession(referenceId, otp);

    if (!(resultOrError instanceof HumsaferError)) {
      await signInWithCustomToken(getAuth(), resultOrError.customToken)
      return;
    }
    console.log(resultOrError);
    return new HumsaferError("Invalid OTP entered, please try again.");
  }


  public async signInWithPhoneNumberV2(
    phoneNumber: string
  ): Promise<HumsaferError | IInitiateAuthSessionResponse> {
    const resultOrError = await initiateAuthSession(phoneNumber, "eng");
    if (!(resultOrError instanceof HumsaferError)) {
      return resultOrError
    } else {
      console.log(resultOrError);
      return new HumsaferError("Something went wrong");
    }
  }

  public async signInWithPhoneNumber(
    phoneNumber: string
  ): Promise<HumsaferError | undefined> {
    const appVerifier = new RecaptchaVerifier("validate", {
      size: "invisible",
      callback: function () {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    },
      getAuth()
    );

    const self = this;
    return await signInWithPhoneNumber(getAuth(), phoneNumber, appVerifier)
      .then((result) => {
        self.authSession = result;
        return undefined;
      })
      .catch((error) => {
        console.log(error);
        return new HumsaferError("Something went wrong");
      });
  }

  public async verifyOtp(otp: string): Promise<HumsaferError | undefined> {
    if (!this.authSession) {
      return new HumsaferError("No auth session in progress");
    }

    if (otp.length < 6) {
      return new HumsaferError("Please enter a valid OTP");
    }

    const self = this;
    return await this.authSession
      .confirm(otp)
      .then((result) => {
        if (result && result.user) {
          self.authSession = undefined;
          this.clearOverrideSessionToken();
          return;
        }
        console.log(result);
        return new HumsaferError("Something went wrong");
      })
      .catch((error) => {
        console.log(error);
        return new HumsaferError("Invalid OTP entered, please try again.");
      });
  }

  public setOverrideSessionToken(sessionToken: string) {
    // We are using sessionStorage on purpose here so that when the user closes the tab, the session goes away.
    sessionStorage.setItem("overrideSessionToken", sessionToken);
  }

  private clearOverrideSessionToken() {
    sessionStorage.removeItem("overrideSessionToken");
  }

  public getOverrideSessionToken() {
    return sessionStorage.getItem("overrideSessionToken");
  }
}
