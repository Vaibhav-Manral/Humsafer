import { ErrorCode } from "./HumsaferServerError";

export class HumsaferError {
    message: string;
    errorCode?: ErrorCode
    details?: any

    constructor(message: string, errorCode?: ErrorCode, details?: any) {
        this.message = message;
        this.errorCode = errorCode;
        this.details = details
    }

    public getErrorMessage() {
        if (this.errorCode) {
            return this.getErrorMessageForErrorCode(this.errorCode);
        }

        return this.message;
    }

    private getErrorMessageForErrorCode(errorCode: ErrorCode) {
        switch (errorCode) {
            case ErrorCode.ENTITY_NOT_FOUND:
                return "User not found";
            case ErrorCode.DRIVER_SHIPMENT_ALREADY_EXISTS_IN_COMPANY_EXCEPTION:
                return "Driver shipment already exists in company";

            case ErrorCode.DRIVER_SHIPMENT_ALREADY_EXISTS_IN_DIFFERENT_COMPANY_EXCEPTION:
                return "Driver shipment already exists in different company";
        }
    }
}
