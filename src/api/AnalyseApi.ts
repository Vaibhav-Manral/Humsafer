import { CompanyAnalytics, IDateRange, IDriverAnalytics } from "../models/analyse";
import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V2, get } from "../utils/Api";
import { downloadFile } from "../utils/FileUtils";

export interface ICompanyAnalytics {
    companyAnalytics: CompanyAnalytics;
}

export interface IDriverAnalyticsResponse {
    driverReportView: IDriverAnalytics;
}

export const getAnalyseDetails = async (companyId: string, dateRange: IDateRange): Promise<ICompanyAnalytics | HumsaferError> => {
    try {
        const response = await get<ICompanyAnalytics>(`${BACKEND_URL_V2}/companies/${companyId}/shipmentAnalytics?analysisRangeType=${dateRange}`);
        if (response.parsedBody?.companyAnalytics) {
            return response.parsedBody;
        }
        const errorMessage = response.serverError?.error.message ?? "Analyse details could not be retrieved";
        return new HumsaferError(errorMessage);
    } catch (err) {
        return new HumsaferError("Something went wrong");
    }
};

export const getDriverAnalysis = async (companyId: string, driverId: string, dateRange: IDateRange): Promise<IDriverAnalytics | HumsaferError> => {
    try {
        const response = await get<IDriverAnalyticsResponse>(`${BACKEND_URL_V2}/companies/${companyId}/drivers/${driverId}/driverAnalytics?analysisRangeType=${dateRange}`);
        if (response.parsedBody?.driverReportView) {
            return response.parsedBody.driverReportView;
        }
        const errorMessage = response.serverError?.error.message ?? "Analyse details could not be retrieved";
        return new HumsaferError(errorMessage);
    } catch (err) {
        return new HumsaferError("Something went wrong");
    }
};

export const getAnalyticsReportDownloadUrl = async (companyId: string, dateRange: IDateRange): Promise<null | HumsaferError> => {
    try {
        const response = await get(`${BACKEND_URL_V2}/companies/${companyId}/analyticsReport?analysisRangeType=${dateRange}`, false);
    
        if (Math.floor(response.status / 100) === 2) {
            downloadFile(
                response.headers,
                await response.blob(),
                `Company_Analytics_Report_${dateRange}.xlsx`
            );
            return null;
        }
    
        const errorMessage = response.serverError?.error.message ?? "Analytics report could not be downloaded";
        return new HumsaferError(errorMessage);
      } catch (err) {
        console.log(err);
        return new HumsaferError("Something went wrong");
      }
}
