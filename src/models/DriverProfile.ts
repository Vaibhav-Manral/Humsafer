import { IUserLifetimeStatsView } from "./UserLifetimeStatsView";

export enum B2BAffiliation {
  MSRTC = "MSRTC",
  UTTARAKHAND_GOVT = "UTTARAKHAND_GOVT",
  BEST_ROADWAYS = "BEST_ROADWAYS",
  REEMA_TRANSPORT = "REEMA_TRANSPORT",
  SHIPEASY = "SHIPEASY",
  AMAZON_SARKHEJ = "AMAZON_SARKHEJ",
  AMAZON_MAHINDRA = "AMAZON_MAHINDRA",
  AMAZON_EXSERVICEMAN = "AMAZON_EXSERVICEMAN",
  AMAZON_MEDALLION = "AMAZON_MEDALLION",
  AMAZON_MAYURESHWAR = "AMAZON_MAYURESHWAR",
  JFK = "JFK",
  HUL = "HUL",
  LETS_TRANSPORT = "LETS_TRANSPORT",
  NESTLE = "NESTLE",
  DORF_KETTLE = "DORF_KETTLE",
}

export interface IDriverProfile {
  id: string;
  mobileNumber: string;
  name: string;
  profileImage: URL;
  creationTime: number;
  languageCode: string;
  entitlements?: Entitlement[];
  userLifetimeStatsView: IUserLifetimeStatsView;
  liveLocationSharingEnabled: boolean;
  level: ILevel;
  b2BAffiliation: B2BAffiliation;
}

export enum Entitlement {
  OXYGEN_DRIVER = "OXYGEN_DRIVER",
  JFK_DRIVER = "JFK_DRIVER",
  REFERRAL_VOLUNTEER = "REFERRAL_VOLUNTEER",
}

export interface ILevel {
  level: number;
  lowerLimitInKm: number;
  upperLimitInKM: number;
  pointsMultiplier: number;
  monthlySafeDistanceTravelledInMetres: number;
}
