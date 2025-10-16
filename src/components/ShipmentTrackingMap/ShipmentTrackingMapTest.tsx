import React from "react";
import { ShipmentTrackingMap } from "./ShipmentTrackingMap";

// Test component with your actual API response data
const ShipmentTrackingMapTest: React.FC = () => {
  const testShipmentData = {
    path: [
      {
        latitude: 18.9581934,
        longitude: 72.8320729,
        locationType: "SOURCE" as const,
      },
      {
        latitude: 28.7040592,
        longitude: 77.10249019999999,
        locationType: "DESTINATION" as const,
      },
    ],
    timeline: {
      timelineLocations: [
        {
          latitude: 7.707e-5, // Invalid - too small
          longitude: 2.9607e-4, // Invalid - too small
          timestamp: 1749107834494,
          isBatteryCharging: false,
          batteryPercentage: 30.0,
          completionPercentage: 100.0,
          source: "DRIVE_MODE",
          stopDurationInMillis: 0,
          shouldDisplayInMap: true,
        },
        {
          latitude: 0.24101296, // Invalid - too small
          longitude: 0.92590432, // Invalid - too small
          timestamp: 1749109567337,
          isBatteryCharging: false,
          batteryPercentage: 21.0,
          completionPercentage: 0.0,
          source: "SHIPMENT_TRACKING_GEOFENCE",
          stopDurationInMillis: 0,
          shouldDisplayInMap: true,
        },
        {
          latitude: 0.48197396, // Invalid - too small
          longitude: 1.85160901, // Invalid - too small
          timestamp: 1749113131003,
          isBatteryCharging: false,
          batteryPercentage: 12.0,
          completionPercentage: 0.0,
          source: "SHIPMENT_TRACKING_GEOFENCE",
          stopDurationInMillis: 0,
          shouldDisplayInMap: true,
        },
      ],
    },
    lastLiveLocationReceivedTime: 1749114949125,
    shipmentCompletionPercentage: 0.0,
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Shipment Tracking Map Test</h2>
      <p>
        This test uses the actual API response data you provided. The timeline
        coordinates are invalid (values like 0.00007707, 0.24101296, 0.48197396)
        and should be filtered out as they are too close to 0,0.
      </p>
      <p>
        Expected behavior: Map should show route from Mumbai (18.96, 72.83) to
        Delhi (28.70, 77.10) in red (no live tracking) with a warning message
        about invalid coordinates.
      </p>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          width: "100%",
          height: "600px",
        }}
      >
        <ShipmentTrackingMap
          shipmentData={testShipmentData}
          height="600px"
          width="100%"
        />
      </div>
    </div>
  );
};

export default ShipmentTrackingMapTest;
