export interface ILiveLocationRecord {
    id: string;
    lastUpdated: string;
    source: string;
    userId: string;
    currentBatteryPercent: number;
    currentBatteryCharging: boolean;
    isExemptFromBatteryOptimization: boolean;
    isInPowerSaverMode: boolean;
    address: Address;
    identifier: string;
    lat: number;
    lng: number;
}

export interface Address {
    adminArea: string;
    countryCode: string;
    countryName: string;
    locality: string;
    postalCode: string;
    subAdminArea: string;
    subLocality: string;
    thoroughfare: string;
}
