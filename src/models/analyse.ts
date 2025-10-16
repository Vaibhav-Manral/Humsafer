import { PointDeductionReason } from "./RideView";
import { AppHealth } from "./ShipmentsView";

interface ShipmentAnalytics {
    totalTrips: number;
    totalDistanceTravelledInMeters: number;
    totalDrivers: number;
}

export interface IPerAssociatedEntityShipmentAnalytics {
    associatedEntity: string;
    shipmentAnalytics: ShipmentAnalytics;
    driverAnalytics?: IDriverAnalytics[]
}

interface ConsolidatedCompanyAnalytics {
    shipmentAnalytics: ShipmentAnalytics;
}

export interface CompanyAnalytics {
    consolidatedCompanyAnalytics: ConsolidatedCompanyAnalytics;
    perAssociatedEntityShipmentAnalyticsList: IPerAssociatedEntityShipmentAnalytics[];
}

export enum IDateRange {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY"
}

export interface AlertStatistics {
    countPerAlert: { [alertType in PointDeductionReason]: number; };
    totalAlerts: number;
    adherenceRate: number;
    alertsPer100kms: number;
    alertsObeyed: number;
    alertsIgnored: number;
}

export interface IDriverAnalytics {
    associatedEntity?: string;
    driverUserId: string;
    driverDisplayName: string;
    driverMobileNumber: string;
    totalDistanceTravelledInMetersForShipments: number;
    totalDistanceTravelledInMetersTrackingMode: number;
    totalDistanceTravelledInMetersDrivingMode: number;
    totalNightDrivingDistanceInMetres: number;
    totalOverSpeedingDistanceInMeters: number;
    alertStatistics: AlertStatistics;
    shipments: IBasicShipmentView[];
    driverInfo?: IDriverInfoView;
    distanceDrivenInLastYearMap?: { [key: string]: number },
    appHealth: AppHealth;
}

interface IDriverInfoView {
    firstName?: string;
    lastName?: string;
    vehicleNumber?: string;
    lastKnownLocality?: string;
    affiliation?: string;
    mobileNumber: string
}

export interface IBasicShipmentView {
    companyId: string;
    companyName: string;
    shipmentId: string;
    shipmentVanityId: string;
    vehicleNo: string;
    sourceCity: string;
    destinationCity: string;
    shipmentStartDate: number;
    shipmentEndDate: number;
}

export interface IAnalytics {
    associatedEntity?: string;
    shipmentAnalytics: ShipmentAnalytics;
    driverAnalytics: IDriverAnalytics[]
}
