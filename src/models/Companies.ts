import { IUserProfile } from "./User";
export interface ICompany {
    id: string;
    panNumber: string;
    availableFeatures: AvailableFeatures[];
    companyType: CompanyType;
    associatedEntities: string[];
    pointOfContactUser: IUserProfile;
    name: string;
    driveModeConfig: IDriveModeConfig;
}

export interface IDriveModeConfig {
    isDriveModeAudioAlertsEnabled: Boolean;
}

export enum AvailableFeatures {
    HUMSAFER_PORTAL_V1 = "HUMSAFER_PORTAL_V1",
    HUMSAFER_SHIPMENTS = "HUMSAFER_SHIPMENTS",
}

export enum CompanyType {
    ENTERPRISE = "ENTERPRISE",
    TRANSPORTER = "TRANSPORTER"
}
