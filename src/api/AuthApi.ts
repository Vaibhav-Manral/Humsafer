import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V2, post, BACKEND_URL_V1 } from "../utils/Api";

export interface IInitiateAuthSessionResponse {
    referenceId: string;
}

interface IVerifyAuthSessionResponse {
    customToken: string;
}

export const initiateAuthSession = async (
    mobileNumber: string,
    languageCode: string,
): Promise<IInitiateAuthSessionResponse | HumsaferError> => {
    try {
        const response = await post<IInitiateAuthSessionResponse>(`${BACKEND_URL_V1}/auth/init`,
            {
                mobileNumber: mobileNumber,
                languageCode: languageCode,
            });

        if (Math.floor(response.status / 100) === 2 &&  response.parsedBody) {
            return response.parsedBody;
        }
        const errorMessage =
            response.serverError?.error.message ?? "Could not initiate auth session request";
        return new HumsaferError(errorMessage);
    } catch (err) {
        // Change error state after http change
        return new HumsaferError("Something went wrong");
    }
};

export const resendSessionIdOtp = async (
    referenceId: string,
): Promise<IInitiateAuthSessionResponse | HumsaferError> => {
    try {
        const response = await post<IInitiateAuthSessionResponse>(`${BACKEND_URL_V2}/authSession/${referenceId}/resend`, {
                referenceId: referenceId,
            });

        if (Math.floor(response.status / 100) === 2 &&  response.parsedBody) {
            return response.parsedBody;
        }
        const errorMessage =
            response.serverError?.error.message ?? "Could not resend OTP";
        return new HumsaferError(errorMessage);
    } catch (err) {
        // Change error state after http change
        return new HumsaferError("Something went wrong");
    }
};


export const verifyAuthSession = async (
    referenceId: string,
    otp: string
): Promise<IVerifyAuthSessionResponse | HumsaferError> => {
    try {
        const response = await post<IVerifyAuthSessionResponse>(`${BACKEND_URL_V2}/authSession/${referenceId}/verify`, {
                otp: otp,
            });

        if (Math.floor(response.status / 100) === 2 &&  response.parsedBody) {
            return response.parsedBody;
        }
        const errorMessage =
            response.serverError?.error.message ?? "Could not verify OTP";
        return new HumsaferError(errorMessage);
    } catch (err) {
        // Change error state after http change
        return new HumsaferError("Something went wrong");
    }
};
