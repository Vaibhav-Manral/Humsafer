import { B2BAffiliation } from "./DriverProfile";

export interface IAddShipmentRequest {
  estimatedEndTime: Date | null;
  associatedEntity: string;
  startLatitude: number;
  startLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  vehicleNumber: string;
  assignedDriverUserId: string | null;
  expectedDriverMobileNumber: string;
  expectedDriverFirstName: string;
  expectedDriverLastName: string;
  to: string;
  from: string;
  startAddress: IAddress;
  destinationAddress: IAddress;
  b2bAffiliation: B2BAffiliation;
}
export interface IAddress {
  placeName: string;
  formattedAddress: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  latitude: number;
  longitude: number;
}

export enum TripType {
  ONE_WAY = "ONE_WAY",
  ROUND_TRIP = "ROUND_TRIP",
}
