import { B2BAffiliation } from "../models/DriverProfile";
import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V1, post } from "../utils/Api";

export const bulkProvisionAffiliations = async (
    affiliation: B2BAffiliation,
    mobileNumbers: string[]
): Promise<HumsaferError | null> => {
    try {
        const response = await post(`${BACKEND_URL_V1}/affiliations/bulkProvision`,
            {
                affiliation: affiliation,
                mobileNumbers: mobileNumbers
            });

        if (Math.floor(response.status / 100) === 2) {
            return null;
        }
        const errorMessage =
            response.serverError?.error.message ?? "Affiliations could not be provisioned";
        return new HumsaferError(errorMessage);
    } catch (err) {
        // Change error state after http change
        return new HumsaferError("Something went wrong");
    }
};
