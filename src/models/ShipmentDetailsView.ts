import { IFuelingStopsInfo } from "./FuelOptimazationResponse";
import {
  ShipmentPriority,
  ShipmentStatus,
  ShipmentTrackingStatus,
} from "./ShipmentsView";

// New interface for Google Maps route info
export interface IGoogleMapsRouteInfo {
  distanceInMeters: number;
  durationInSeconds: number;
  polyline: string;
  start: {
    latitude: number;
    longitude: number;
  };
  end: {
    latitude: number;
    longitude: number;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  offRoutePoints: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export interface IShipmentDetails {
  id: string;
  vanityId: string;
  companyId: string;
  createdByUserId: string;
  startTime: number;
  dispatchTime: number;
  estimatedEndTime: number;
  actualEndTime: string;
  associatedEntity: string;
  status: ShipmentStatus;
  vehicleNumber: string;
  driverAssignmentStatus: DriverAssignmentStatus;
  assignedDriverUserId: string;
  shipmentTrackingStatus: ShipmentTrackingStatus;
  shipmentCompletionPercentage: number;
  isShipmentActivelyTracked: true;
  driverName: string;
  driverMobileNumber: string;
  path: IPath[];
  haversineDistanceInMetresForTrip: number;
  haversineDistanceInMetresToDestination: number;
  lastLiveLocationReceivedTime: number;
  timeline: ITimeline;
  shipmentStartCity: string;
  shipmentDestinationCity: string;
  priority: ShipmentPriority;
  shipmentSourceAddress: string;
  shipmentDestinationAddress: string;
  shipmentEndMethod: ShipmentEndMethod;
  fuelingStopsInfo: IFuelingStopsInfo;
  // New fields for enhanced API structure
  googleMapsRouteInfo?: IGoogleMapsRouteInfo;
  lastLiveLocationAddress?: {
    adminArea: string;
    countryCode: string;
    countryName: string;
    locality: string;
    postalCode: string;
    subAdminArea: string;
    subLocality: string;
  };
}

export enum ShipmentEndMethod {
  MANUAL = "MANUAL",
  AUTO = "AUTO",
}

export enum DriverAssignmentStatus {
  VERIFIED_DRIVER_ASSIGNED = "VERIFIED_DRIVER_ASSIGNED",
  DRIVER_INFO_PROVIDED = "DRIVER_INFO_PROVIDED",
}

export interface IPath {
  latitude: number;
  longitude: number;
  locationType: LocationType;
}
export enum LocationType {
  SOURCE = "SOURCE",
  INTERMEDIATE_STOP = "INTERMEDIATE_STOP",
  DESTINATION = "DESTINATION",
}

export interface ILocation {
  latitude: number;
  longitude: number;
  locationType?: string;
  locationDescription?: string;
  timestamp?: number;
  isBatteryCharging?: boolean;
  batteryPercentage?: number;
  source?: LiveLocationSource;
  stopDurationInMillis?: number;
  shouldDisplayInMap?: boolean;
}

export enum LiveLocationSource {
  TRACKING_SERVICE = "TRACKING_SERVICE",
  DRIVE_MODE = "DRIVE_MODE",
  FASTAG = "FASTAG",
}

interface ITimeline {
  timelineLocations: ILocation[];
}
