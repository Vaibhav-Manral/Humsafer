export interface IPaymentMethodView {
    id: string;
    type: PaymentMethodType;
    upiAddress: string;
    status: PaymentMethodStatus
}

export enum PaymentMethodType {
    UPI = "UPI",
}

export enum PaymentMethodStatus {
    VALID = "VALID",
    INVALID = "INVALID",
}
