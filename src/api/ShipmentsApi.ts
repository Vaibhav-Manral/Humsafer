import { HumsaferError } from "../models/HumsaferError";
import { BACKEND_URL_V2, post } from "../utils/Api";
import { IAddShipmentRequest } from "../models/Shipments";
import { IShipment } from "../models/ShipmentsView";

interface IGetShipment {
  shipmentView: IShipment;
}

export const addShipment = async (companyId: string, request: IAddShipmentRequest): Promise<IShipment | HumsaferError> => {
  try {

    const response = await post<IGetShipment>(`${BACKEND_URL_V2}/companies/${companyId}/shipments`, request);
    if (response.parsedBody?.shipmentView) {
      return response.parsedBody.shipmentView;
    }
    const errorMessage = response.serverError?.error.message ?? "Your shipment could not be created, please try again!";

    return new HumsaferError(errorMessage, response.serverError?.error.errorCode, response.serverError?.error.details);
  } catch (err) {
    return new HumsaferError("Something went wrong");
  }
}
