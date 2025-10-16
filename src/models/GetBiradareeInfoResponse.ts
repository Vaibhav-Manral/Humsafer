import { IDrivingLicenseView } from "./DrivingLicenseView";
import { IInsuranceView } from "./InsuranceView";

export interface IGetBiradareeInfoResponse {
    biradareeInsuranceView: IInsuranceView;
    drivingLicenseView: IDrivingLicenseView | undefined;
}
