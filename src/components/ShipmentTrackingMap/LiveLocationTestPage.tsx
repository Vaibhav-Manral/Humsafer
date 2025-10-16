
import React from "react";
import { ShipmentTrackingMap } from "./ShipmentTrackingMap";

// Test component to verify live location tracking fixes
const LiveLocationTestPage: React.FC = () => {
  // Test data using actual shipment and live location data from the user
  const testShipmentDataWithLiveLocations = {
    path: [
      {
        latitude: 12.9165847,
        longitude: 77.6219296,
        locationType: "SOURCE" as const,
      },
      {
        latitude: 12.9966024,
        longitude: 77.6687231,
        locationType: "DESTINATION" as const,
      },
    ],
    timeline: {
      timelineLocations: [
        {
          latitude: 12.9196315,
          longitude: 77.6352604,
          locationDescription: "Koramangala, Karnataka",
          timestamp: 1750055383591,
          isBatteryCharging: false,
          batteryPercentage: 24.0,
          completionPercentage: 0.0,
          source: "SHIPMENT_TRACKING_SETUP",
          stopDurationInMillis: 0,
          shouldDisplayInMap: true,
        },
      ],
    },
    googleMapsRouteInfo: {
      distanceInMeters: 16952.0,
      durationInSeconds: 4345.0,
      polyline:
        "exymA{owxMP|@tA]HM@k@EWi@K]BsAVE\\dAhFv@hDHl@J`BDrBB`JAlA[fF?POnCItL@fAIlJy@@uAIgCCw@EmIUJoFPeHcE}@{CeAc@QaCmAyAo@eBm@gAOqD_A_@Io@UuEeAgAS}ASmBc@kBm@{IvEUeBh@_BzE_R|@sCxAiFSGaX}HgMwDyBy@e@[cBeBaD_Es@_AcFuGiAmBg@cAo@mBc@eBQoAA]@mFCgHBiGAiAIs@[yAe@uAYi@a@s@iAoAq@k@}A_AyNyHqRaKaCoAaCaA_@Gi@A}@Fg@Pk@`@iDzD]b@k@Ve@NgAJg@Cu@O_@QaAe@gBs@oBcAoDgB{DeBa@Mm@IkGWwC?wA?wCJcBEaBI}AEgBMeC_@}AGmEFiFLkCD{FH}CBcP`@{A@kAFiDBgUf@cWd@aFDaD@_L\\}JTsA@Q@q@mC}@}DgAwDaBkFIa@}BgIiDcLuDgKqBsFuCaI{B{FuC_I_@iAo@aB_@mAwCcIkCyGmB_F_AoCeAuCuByFy@mCe@y@mBoF{@yBiAoDaCwGa@oAe@OOYoAgEoIwTyBwGeAgCGY?i@p@Qt@rBrCpIdBtErBlFrAtD`CnGFl@@^dArC",
      start: {
        latitude: 12.9165847,
        longitude: 77.6219296,
      },
      end: {
        latitude: 12.9966024,
        longitude: 77.6687231,
      },
      currentLocation: {
        latitude: 12.93636893,
        longitude: 77.6257377,
      },
      offRoutePoints: [
        {
          latitude: 12.92158707,
          longitude: 77.61370806,
        },
        {
          latitude: 12.92774091,
          longitude: 77.62096957,
        },
        {
          latitude: 12.93636893,
          longitude: 77.6257377,
        },
      ],
    },
    shipmentSourceAddress:
      "WJ8C+JQM, Central Silk Board Colony, Stage 2, BTM Layout, Bengaluru, Karnataka 560068, India",
    shipmentDestinationAddress:
      "XMW9+MC2, NH 44, Krishna Reddy Industrial Estate, Dooravani Nagar, Bengaluru, Karnataka 560016, India",
    shipmentCompletionPercentage: 100.0,
    lastLiveLocationReceivedTime: 1750055986199,
    // Add the actual live location records from the API
    liveLocationRecords: [
      {
        id: "RXXWD9JQA9yptLYBGiXJ",
        lastUpdated: "1750055381604",
        source: "SHIPMENT_TRACKING_SETUP",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 24.0,
        currentBatteryCharging: false,
        lat: 12.9196315,
        lng: 77.6352604,
      },
      {
        id: "3xejsLwW8tyc8befYQq0",
        lastUpdated: "1750055396530",
        source: "DRIVE_MODE",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 24.0,
        currentBatteryCharging: false,
        lat: 12.919623,
        lng: 77.6352589,
      },
      {
        id: "BPUDRwInmFU1HnSSkRMJ",
        lastUpdated: "1750055503972",
        source: "SHIPMENT_TRACKING_GEOFENCE",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 24.0,
        currentBatteryCharging: false,
        lat: 12.91658497,
        lng: 77.62193298,
      },
      {
        id: "iMMyMhnKVEPiIJfZY6lx",
        lastUpdated: "1750055563961",
        source: "DRIVE_MODE",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 23.0,
        currentBatteryCharging: false,
        lat: 12.92158707,
        lng: 77.61370806,
      },
      {
        id: "TXaKN4GZjo0G4xXLcPrw",
        lastUpdated: "1750055624014",
        source: "DRIVE_MODE",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 23.0,
        currentBatteryCharging: false,
        lat: 12.92774091,
        lng: 77.62096957,
      },
      {
        id: "OWqJm5Q9Gofq7bR5ZnsR",
        lastUpdated: "1750055644000",
        source: "DRIVE_MODE",
        userId: "5g4THncJPXDWhavA6IbU",
        currentBatteryPercent: 23.0,
        currentBatteryCharging: false,
        lat: 12.93239272,
        lng: 77.62283985,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧪 Live Location Tracking Test - Real Data</h2>
      <p>
        This test uses your actual shipment and live location data to verify the
        fixes:
      </p>
      <ul>
        <li>✅ Real polyline data from Bengaluru route (16.9km route)</li>
        <li>✅ Actual live location records with valid coordinates</li>
        <li>✅ Google Maps current location from API response</li>
        <li>✅ Off-route points for additional tracking visualization</li>
        <li>✅ Timeline data for waypoint markers</li>
      </ul>

      <div style={{ marginTop: "20px", marginBottom: "10px" }}>
        <strong>Expected behavior with your data:</strong>
        <br />• Map shows route in Bengaluru from BTM Layout to Krishna Reddy
        Industrial Estate
        <br />• Green polyline from source to current location (12.93636893,
        77.6257377)
        <br />• Red polyline from current location to destination
        <br />• Current location marker positioned at latest live location ping
        <br />• Waypoints showing timeline and live location pings
        <br />• Off-route points displayed as additional tracking markers
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          width: "100%",
          height: "600px",
          marginTop: "20px",
        }}
      >
        <ShipmentTrackingMap
          shipmentData={testShipmentDataWithLiveLocations}
          height="600px"
          width="100%"
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
        }}
      >
        <h4>🔍 Debug Information</h4>
        <p>Check the browser console for detailed logs showing:</p>
        <ul>
          <li>Timeline data processing</li>
          <li>Coordinate validation results</li>
          <li>Green polyline creation</li>
          <li>Current location marker positioning</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveLocationTestPage;
