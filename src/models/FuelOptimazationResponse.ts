import { IFuelOptimizationRequest } from "../api/Companies";

export interface IFuelingStopsInfo {
    request: IFuelOptimizationRequest
    fuelingStops: IFuelingStop[]
}

export interface IFuelingStop {
    fuelToGetInLtrs: number;
    distanceFromPreviousStopInKm: number;
    totalCost: number;
    fuelAvailableInLitres: number;
    coordinates: ICoordinates;
    fuelingStationName: string;
    provider: FuelingStationProvider;
    dieselPrice: number;
}

export enum FuelingStationProvider {
    JIO_BP = "JIO_BP"
}

export interface ICoordinates {
    latitude: number;
    longitude: number;
}

