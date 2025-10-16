import React, { useState, useEffect, useCallback, useRef } from "react";
import { ShipmentTrackingMap } from "./ShipmentTrackingMap";
import { getCompleteTimelineForShipment } from "../../api/ShipmentDetailsApi";
import { HumsaferError } from "../../models/HumsaferError";
import { ILiveLocationRecord } from "../../models/LiveLocationRecordView";

interface IntegratedTrackingMapProps {
  shipmentData: any; // Your shipment details from the API
  companyId: string;
  shipmentId: string;
  height?: string;
  width?: string;
  // autoRefresh?: boolean; // Whether to auto-refresh live location data
  // refreshInterval?: number; // Refresh interval in milliseconds (default: 30 minutes)
}

export const IntegratedTrackingMap: React.FC<IntegratedTrackingMapProps> = ({
  shipmentData,
  companyId,
  shipmentId,
  height = "600px",
  width = "100%",
  // autoRefresh = true,
  // refreshInterval = 1800000, // 30 minutes
}) => {
  const [liveLocationRecords, setLiveLocationRecords] = useState<
    ILiveLocationRecord[]
  >([]);
  const [, setIsLoadingLiveLocations] = useState(false);
  const [, setLastRefresh] = useState<Date | null>(null);
  const [, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const destination =
    shipmentData?.googleMapsRouteInfo?.end ||
    shipmentData?.path?.find((p: any) => p.locationType === "DESTINATION");
  const completion100 = shipmentData?.shipmentCompletionPercentage === 100;

  // Fetch live location data
  const fetchLiveLocations = useCallback(async () => {
    if (!companyId || !shipmentId) return;

    setIsLoadingLiveLocations(true);
    setError(null);

    try {
      const response = await getCompleteTimelineForShipment(
        companyId,
        shipmentId
      );

      if (response instanceof HumsaferError) {
        setError(response.message);
        console.error("❌ Failed to fetch live locations:", response.message);
      } else {
        setLiveLocationRecords(response);
        setLastRefresh(new Date());
        console.log("✅ Live locations fetched:", response.length, "records");
      }
    } catch (err) {
      const errorMessage = "Failed to fetch live location data";
      setError(errorMessage);
      console.error("❌ Error fetching live locations:", err);
    } finally {
      setIsLoadingLiveLocations(false);
    }
  }, [companyId, shipmentId]);

  // Initial fetch
  useEffect(() => {
    fetchLiveLocations();
  }, [fetchLiveLocations]);

  // Combine shipment data with live location records
  let enhancedLiveLocationRecords = liveLocationRecords;
  if (completion100 && destination) {
    const last = liveLocationRecords[liveLocationRecords.length - 1];
    const isAtDestination =
      last &&
      Math.abs(last.lat - destination.latitude) < 0.0001 &&
      Math.abs(last.lng - destination.longitude) < 0.0001;
    if (!isAtDestination) {
      enhancedLiveLocationRecords = [
        ...liveLocationRecords,
        {
          id: "synthetic-destination",
          lastUpdated: new Date().toISOString(),
          source: "synthetic",
          userId: last?.userId || "synthetic",
          currentBatteryPercent: last?.currentBatteryPercent || 0,
          currentBatteryCharging: false,
          lat: destination.latitude,
          lng: destination.longitude,
          address: last?.address || undefined,
          isExemptFromBatteryOptimization:
            last?.isExemptFromBatteryOptimization ?? false,
          isInPowerSaverMode: last?.isInPowerSaverMode ?? false,
          identifier: last?.identifier || "",
        },
      ];
    }
  }

  // Auto-refresh setup
  // useEffect(() => {
  //   const last =
  //     enhancedLiveLocationRecords[enhancedLiveLocationRecords.length - 1];
  //   const isAtDestination =
  //     completion100 &&
  //     destination &&
  //     last &&
  //     Math.abs(last.lat - destination.latitude) < 0.0001 &&
  //     Math.abs(last.lng - destination.longitude) < 0.0001;

  //   if (!autoRefresh || isAtDestination) return;

  //   intervalRef.current = setInterval(() => {
  //     fetchLiveLocations();
  //   }, refreshInterval);

  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //   };
  // }, [
  //   autoRefresh,
  //   refreshInterval,
  //   fetchLiveLocations,
  //   completion100,
  //   destination,
  //   enhancedLiveLocationRecords,
  // ]);

  // Effect to clear interval immediately when stop condition is met
  useEffect(() => {
    const last =
      enhancedLiveLocationRecords[enhancedLiveLocationRecords.length - 1];
    const isAtDestination =
      completion100 &&
      destination &&
      last &&
      Math.abs(last.lat - destination.latitude) < 0.0001 &&
      Math.abs(last.lng - destination.longitude) < 0.0001;
    if (isAtDestination && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [completion100, destination, enhancedLiveLocationRecords]);

  const enhancedShipmentData = {
    ...shipmentData,
    liveLocationRecords: enhancedLiveLocationRecords.map((record) => ({
      id: record.id,
      lastUpdated: record.lastUpdated,
      source: record.source,
      userId: record.userId,
      currentBatteryPercent: record.currentBatteryPercent,
      currentBatteryCharging: record.currentBatteryCharging,
      lat: record.lat,
      lng: record.lng,
      address: record.address,
    })),
  };

  return (
    <ShipmentTrackingMap
      shipmentData={enhancedShipmentData}
      height={height}
      width={width}
    />
  );
};

export default IntegratedTrackingMap;
