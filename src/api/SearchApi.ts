import { BACKEND_URL_V2, get } from "../utils/Api";


interface ISearchUserProfile {
    id: string;
    name?: string;
    mobileNumber: string;
    activeShipmentCompanyId: string;
    activeShipmentId: string;
}

interface IGetUser {
    userProfile: ISearchUserProfile;
}

export const getUserDetails = async (mobileNumber: string): Promise<ISearchUserProfile | null> => {
    try {
        const response = await get<IGetUser>(`${BACKEND_URL_V2}/search/users/mobileNumber/${mobileNumber}`);
        if (response.parsedBody?.userProfile) {
            return response.parsedBody.userProfile;
        }
        return null;
    } catch (error) {
        return null;
    }
};
