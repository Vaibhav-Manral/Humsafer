export interface IUserProfile {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    capabilities: Capability[];
    namespace: Namespace;
    associatedCompanyId: string;
}

export enum Capability {
    ALL = "ALL",
    DRIVER_SUPPORT = "DRIVER_SUPPORT",
    DRIVER_BIRADAREE_SEARCH = "DRIVER_BIRADAREE_SEARCH",
    REVIEW_DRIVER_LICENSE = "REVIEW_DRIVER_LICENSE",
    USER_MANAGEMENT = "USER_MANAGEMENT",
    REPORTS = "REPORTS",
    ALL_DMS_FEATURES = "ALL_DMS_FEATURES",
    ADD_SHIPMENT = "ADD_SHIPMENT",
    VIEW_SHIPMENTS = "VIEW_SHIPMENTS",
    VIEW_SHIPMENT_DETAILS = "VIEW_SHIPMENT_DETAILS",
    SET_SHIPMENT_PRIORITY = "SET_SHIPMENT_PRIORITY",
    SET_SHIPMENT_STATUS = "SET_SHIPMENT_STATUS",
    VIEW_COMPANY_ANALYTICS = "VIEW_COMPANY_ANALYTICS",
    MANAGE_COMPANY_USERS = "MANAGE_COMPANY_USERS"
}

export const capabilitesForPortal = [Capability.ALL, Capability.DRIVER_SUPPORT, Capability.DRIVER_BIRADAREE_SEARCH,
Capability.REVIEW_DRIVER_LICENSE, Capability.USER_MANAGEMENT, Capability.REPORTS];

export const capabilitesForDMS = [Capability.ALL_DMS_FEATURES, Capability.ADD_SHIPMENT, Capability.VIEW_SHIPMENTS, Capability.VIEW_SHIPMENT_DETAILS,
Capability.SET_SHIPMENT_PRIORITY, Capability.SET_SHIPMENT_STATUS, Capability.VIEW_COMPANY_ANALYTICS, Capability.MANAGE_COMPANY_USERS];

export enum Namespace {
    HUMSAFER = "HUMSAFER"
}
