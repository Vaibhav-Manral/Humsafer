export interface IShipment {
  id: string;
  companyId: string;
  createdByUserId: string;
  creationTime: number;
  startTime: number;
  dispatchTime: Date;
  estimatedEndTime: Date;
  actualEndTime: Date;
  associatedEntity: string;
  associatedLocation: string;
  status: ShipmentStatus;
  vehicleNumber: string;
  driverAssignmentStatus: DriverAssignmentStatus;
  shipmentTrackingStatus: ShipmentTrackingStatus;
  driverName: string;
  driverMobileNumber: string;
  priority: ShipmentPriority;
  shipmentStartCity: string;
  shipmentDestinationCity: string;
  vanityId: string;
  shipmentCompletionPercentage: number;
  lastLiveLocationReceivedTime: number;
  appHealth: AppHealth;
  isShipmentActivelyTracked: boolean;
  lastUpdateTime: number;
  shipmentEndMethod: IShipmentEndMethod;
  loadPLantCode?: string;
  loadPlantDescription?: string;
}

export interface IFilterShipmentResponse {
  lastVisibleShipmentId: string | null;
  firstVisibleShipmentId: string | null;
  shipments: IShipment[];
  filteredRecords: number;
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

export interface Plant {
  loadPlantCode: string;
  loadPlantName: string;
}

export interface IQueryHelperResponseObject {
  companyId: string;
  Transporter_Names: string[];
  from: string[];
  to: string[];
  loadPlantCodes: string[];
  plantDetails: Plant[];
  consigneeZone: string[];
  consignerZone: string[];
}

export interface IQueryHelperResponse {
  queryHelperList: IQueryHelperResponseObject[];
}

export interface ICountObject {
  appSetUpIncompleteShipmentsCount: number;
  unTrackedShipmentsCount: number;
  inTransitShipmentsCount: number;
  prioritizedShipmentsCount: number;
  totalShipmentsCount: number;
  completedShipmentsCount: number;
  awaitingSyncShipmentsCount: number;
}

export interface IStatCountREsponse {
  shipmentsStatusWiseCount: ICountObject;
}

export enum IShipmentEndMethod {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
}

export enum ShipmentTrackingStatus {
  ACTIVELY_TRACKED = "ACTIVELY_TRACKED",
  INTERMITTENTLY_TRACKED = "INTERMITTENTLY_TRACKED",
  MISSING_TRACKING_INFO = "MISSING_TRACKING_INFO",
}

export enum AppHealth {
  HEALTHY = "HEALTHY",
  PERMISSIONS_PENDING = "PERMISSIONS_PENDING",
  APP_NOT_INSTALLED = "APP_NOT_INSTALLED",
  APP_UPDATE_REQUIRED = "APP_UPDATE_REQUIRED",
}

export enum ShipmentStatus {
  CREATED = "CREATED",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETE = "COMPLETE",
  CANCELLED = "CANCELLED",
  NOT_TRACKED = "NOT_TRACKED",
  IN_COMPLETE = "IN_COMPLETE",
}

export enum DriverAssignmentStatus {
  VERIFIED_DRIVER_ASSIGNED = "VERIFIED_DRIVER_ASSIGNED",
  DRIVER_INFO_PROVIDED = "DRIVER_INFO_PROVIDED",
  COMPLETE = "COMPLETE",
  CANCELLED = "CANCELLED",
}

export enum IDateRange {
  TODAY = "TODAY",
  YESTERDAY = "YESTERDAY",
  LAST_WEEK = "LAST_WEEK",
  LAST_MONTH = "LAST_MONTH",
}

export enum ISearchType {
  SEARCH = "SEARCH",
  FILTER = "FILTER",
  STATUS = "STATUS",
}

export enum IFilterStatus {
  ALL = "ALL",
  APP_STATUS_UNHEALTHY = "APP_STATUS_UNHEALTHY",
  IN_TRANSIT = "IN_TRANSIT",
  UNTRACKED = "UNTRACKED",
  COMPLETED = "COMPLETED",
  PRIORITIZED = "PRIORITIZED",
  AWAITING_SYNC = "AWAITING_SYNC",
}

export enum ShipmentPriority {
  PRIORITIZED = "PRIORITIZED",
  DEFAULT = "DEFAULT",
}
