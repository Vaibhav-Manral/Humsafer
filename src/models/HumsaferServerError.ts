export interface IHumsaferServerError {
    error: IHumsaferServerErrorDetails;
}

export interface IHumsaferServerErrorDetails {
    message: string;
    errorCode?: ErrorCode;
    details?: any;
}

export enum ErrorCode {
    ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
    DRIVER_SHIPMENT_ALREADY_EXISTS_IN_COMPANY_EXCEPTION = "DRIVER_SHIPMENT_ALREADY_EXISTS_IN_COMPANY_EXCEPTION",
    DRIVER_SHIPMENT_ALREADY_EXISTS_IN_DIFFERENT_COMPANY_EXCEPTION = "DRIVER_SHIPMENT_ALREADY_EXISTS_IN_DIFFERENT_COMPANY_EXCEPTION"
}
