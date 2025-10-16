export interface IRideView {
    id: string;
    rideStartTime: number;
    rideStartLatitude: number;
    rideStartLongitude: number;
    rideEndTime: number;
    rideEndLatitude: number;
    rideEndLongitude: number;
    rideDurationInMilliSeconds: number;
    distanceTravelledInMetres: number;
    safeDistanceTravelledInMetres: number;
    rewardDistribution: IRideRewardDistributionView;
    level: ILevel;
    rideEndMethod: RideEndMethod;
    periodicInfo: IPeriodicInfo;
}

export interface IPeriodicInfo {
    epochToDistanceMap: EpochToDistanceMap;
    epochToCoordinateMap: EpochToCoordinateMap;
}

export type EpochToDistanceMap = {
    [epoch: number]: number;
}

export type EpochToCoordinateMap = {
    [epoch: number]: ICoordinates;
}

export interface ICoordinates {
    latitude: number;
    longitude: number;
}

export interface IRideRewardDistributionView {
    maxAwardableStarPoints: number;
    awardedStarPoints: number;
    pointsDeductionReasoningMap: PointsDeductionReasoningMap;
}

export interface ILevel {
    level: number;
    lowerLimitInKm: number;
    upperLimitInKM: number;
    pointsMultiplier: number;
    monthlySafeDistanceTravelledInMetres: number;
}

export type PointsDeductionReasoningMap = {
    [pointDeductionReason in PointDeductionReason]: number;
};

export enum PointDeductionReason {
    SAFE_DISTANCE_EXCEEDED = "SAFE_DISTANCE_EXCEEDED",
    SAFE_DRIVING_TIME_EXCEEDED = "SAFE_DRIVING_TIME_EXCEEDED",
    OVER_SPEEDING = "OVER_SPEEDING",
    DANGER = "DANGER",
    CHAI_BREAK = "CHAI_BREAK",
    FUEL_OVERUSE = "FUEL_OVERUSE",
    MONTHLY_DRIVING_LIMIT_REACHED = "MONTHLY_DRIVING_LIMIT_REACHED",
    NIGHT_DRIVING = "NIGHT_DRIVING",
    SLEEP_STATUS_SLEEPING = "SLEEP_STATUS_SLEEPING"
}

export enum RideEndMethod {
    MANUAL = "MANUAL",
    AUTO = "AUTO", // legacy kept for compatibility with older app versions
    AUTO_NO_LOCATION_UPDATES = "AUTO_NO_LOCATION_UPDATES",
    AUTO_LOW_LOCATION_MOVEMENTS = "AUTO_LOW_LOCATION_MOVEMENTS"
}


