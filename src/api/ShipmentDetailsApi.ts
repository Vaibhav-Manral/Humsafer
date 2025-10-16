import { IShipmentDetails } from "../models/ShipmentDetailsView";
import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V1, BACKEND_URL_V2, get, post } from "../utils/Api";
import { ShipmentStatus } from "../models/ShipmentsView";
import { ILiveLocationRecord } from "../models/LiveLocationRecordView";
import { IShipmentDebugInfo } from "../models/ShipmentDebugInfoView";
import { ICurrentLocationData } from "../models/CurrentLocationResponse";
interface IGetShipmentDetails {
  shipmentDetails: IShipmentDetails;
}
interface IShipmentStatus {
  shipmentStatus: string
}
interface IGetShipmentTimeline {
  liveLocationRecords: ILiveLocationRecord[]
}
interface IGetShipmentDebugInfo {
  shipmentDebugInfoView: IShipmentDebugInfo;
}

interface IGetCurrentLocationInfo {
  location: ICurrentLocationData
}

export const getShipmentDetails = async (companyId: string, shipmentId: string): Promise<IShipmentDetails | HumsaferError> => {
  try {
    const response = await get<IGetShipmentDetails>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}`);
    if (response.parsedBody?.shipmentDetails) {
      return response.parsedBody.shipmentDetails;
    }
    const errorMessage = response.serverError?.error.message ?? "Shipment details not found";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getSharedShipmentDetails = async (shipmentId: string): Promise<IShipmentDetails | HumsaferError> => {
  try {
    const response = await get<IGetShipmentDetails>(`${BACKEND_URL_V1}/shared/shipments/${shipmentId}`);
    if (response.parsedBody?.shipmentDetails) {
      return response.parsedBody.shipmentDetails;
    }
    const errorMessage = response.serverError?.error.message ?? "Shipment details not found";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getCompleteTimelineForShipment = async (companyId: string, shipmentId: string): Promise<ILiveLocationRecord[] | HumsaferError> => {
  try {
    const response = await get<IGetShipmentTimeline>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/liveLocations`);
    if (response.parsedBody?.liveLocationRecords) {
      return response.parsedBody.liveLocationRecords;
    }
    const errorMessage = response.serverError?.error.message ?? "Shipment Timeline not found";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const changeShipmentDetailsStatus = async (companyId: string, shipmentId: string, status: ShipmentStatus): Promise<IShipmentStatus | HumsaferError> => {
  try {
    const response = await post(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/shipmentStatus/${status}`);
    if (response.parsedBody) {
      return response.parsedBody as IShipmentStatus;
    }
    const errorMessage = response.serverError?.error.message ?? "Unable to update shipment status";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const pullFastagDetails = async (companyId: string, shipmentId: string): Promise<null | HumsaferError> => {
  try {
    const response = await post(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/pullFastagDetails`);
    if (Math.floor(response.status / 100) === 2) {
      return null;
    }
    const errorMessage = response.serverError?.error.message ?? "Unable to populate vehicle's fastag details";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};

export const getDebugInfoForShipment = async (companyId: string, shipmentId: string): Promise<IShipmentDebugInfo | HumsaferError> => {
  try {
    const response = await get<IGetShipmentDebugInfo>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/debugInfo`);
    if (response.parsedBody?.shipmentDebugInfoView) {
      return response.parsedBody.shipmentDebugInfoView;
    }
    const errorMessage = response.serverError?.error.message ?? "Shipment Debug Info not found";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};


export const getCurrentLocationForShipment = async (companyId: string, shipmentId: string): Promise<ICurrentLocationData | HumsaferError> => {
  try {
    const response = await get<IGetCurrentLocationInfo>(`${BACKEND_URL_V2}/companies/${companyId}/shipments/${shipmentId}/currentLocation`);
    if (response.parsedBody?.location) {
      return response.parsedBody.location;
    }
    const errorMessage = response.serverError?.error.message ?? "Current location not found";
    return new HumsaferError(errorMessage);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
};
