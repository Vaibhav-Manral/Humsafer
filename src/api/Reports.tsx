import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V1, BACKEND_URL_V2, post } from "../utils/Api";

export const triggerDrivingHistoryReport = async (
  startDate: string,
  endDate: string,
  type: IDrivingHistoryReportType,
  mobileNumbers: string[]
): Promise<HumsaferError | null> => {
  try {
    const response = await post(
      `${BACKEND_URL_V1}/reports/driversHistoryReport`,
      {
        startDate: startDate,
        endDate: endDate,
        type: type,
        mobileNumbers: mobileNumbers,
      }
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Driver histry report could not be generated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error("Driver history report error:", err);
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};

export const exportShipmentsCoverageReport = async (
  startDate: string,
  endDate: string
): Promise<HumsaferError | null> => {
  try {
    const response = await post(
      `${BACKEND_URL_V1}/reports/exportShipmentsCoverage`,
      {
        startDate: startDate,
        endDate: endDate,
      }
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Shipment coverage report could not be generated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error("Shipment coverage report error:", err);
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};

export const exportShipmentsListReport = async (
  companyId: string,
  startDate: string,
  endDate: string
): Promise<HumsaferError | null> => {
  try {
    const response = await post(
      `${BACKEND_URL_V1}/externalReports/${companyId}/shipmentsListReport`,
      {
        startDate: startDate,
        endDate: endDate,
      }
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Shipment list report could not be generated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error("Shipments list report error:", err);
    // Change error state after http change
    return new HumsaferError("Something went wrong");
  }
};

export const exportShipmentsReport = async (
  companyId: string,
  startDate: string,
  endDate: string,
  email: string,
  reportType?: string,
  jobRequest?: string
): Promise<HumsaferError | null> => {
  try {
    const requestPayload: any = {
      startTime: startDate,
      endTime: endDate,
      receiverEmail: email,
      companyId: companyId,
      reportType: reportType ?? "shipmentReport",
      jobRequest: jobRequest ?? "shipmentReport", // Specify the job type for shipment reports
    };

    const response = await post(
      `${BACKEND_URL_V2}/companies/submitJob`,
      requestPayload
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Shipment list report could not be generated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const exportAccuracyRawReport = async (
  companyId: string,
  startDate: string,
  endDate: string,
  email: string,
  reportType?: string,
  jobRequest?: string
): Promise<HumsaferError | null> => {
  try {
    const requestPayload: any = {
      startTime: startDate,
      endTime: endDate,
      receiverEmail: email,
      companyId: companyId,
      reportType: reportType ?? "accuracyRawReport",
      jobRequest: jobRequest ?? "accuracyRawReport",
    };

    const response = await post(
      `${BACKEND_URL_V2}/companies/submitJob`,
      requestPayload
    );

    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage =
      response.serverError?.error.message ??
      "Accuracy raw report could not be generated";
    return new HumsaferError(errorMessage);
  } catch (err) {
    console.error("Accuracy raw report error:", err);
    return new HumsaferError("Something went wrong");
  }
};

export enum IDrivingHistoryReportType {
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
  DAILY = "DAILY",
}
