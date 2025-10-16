import { ILiveLocationView } from "../models/GetUserInfoResponse";

export function createArrayWithNumbers(length: number): number[] {
    return Array.from({ length }, (_, k) => k);
}

export function getGoogleMapsUrlFor(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function getGoogleMapsUrlForLocations(locations: ILiveLocationView[]) {
    // contruct a google maps url with all locations added as waypoints
    const waypoints = locations.map(location => `${location.latitude},${location.longitude}`);
    const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints.join('|')}`;
    return url;
}
