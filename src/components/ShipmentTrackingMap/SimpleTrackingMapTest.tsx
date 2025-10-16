import React from "react";
import { SimpleTrackingMap } from "./SimpleTrackingMap";

// Test component to demonstrate source and destination markers
const SimpleTrackingMapTest: React.FC = () => {
  // Test data with valid source and destination
  const testShipmentDataWithMarkers = {
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
    shipmentSourceAddress: "Mumbai, Maharashtra",
    shipmentDestinationAddress: "Delhi, India",
    shipmentCompletionPercentage: 45,
    timeline: {
      timelineLocations: [
        {
          latitude: 19.076,
          longitude: 72.8777,
          timestamp: Date.now() - 3600000, // 1 hour ago
          locationDescription: "Mumbai Central",
          shouldDisplayInMap: true,
        },
        {
          latitude: 20.5937,
          longitude: 78.9629,
          timestamp: Date.now() - 1800000, // 30 minutes ago
          locationDescription: "Nagpur (Current)",
          shouldDisplayInMap: true,
        },
      ],
    },
  };

  // Test data without valid markers (to show fallback markers)
  const testShipmentDataWithoutMarkers = {
    path: [],
    shipmentSourceAddress: "Unknown Source",
    shipmentDestinationAddress: "Unknown Destination",
    shipmentCompletionPercentage: 0,
    timeline: {
      timelineLocations: [],
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Simple Tracking Map Test - Source & Destination Markers</h2>

      <div style={{ marginBottom: "30px" }}>
        <h3>✅ Test 1: With Valid Source & Destination Data</h3>
        <p>
          This map should show:
          <br />• 🟢 Source marker at Mumbai (18.96, 72.83)
          <br />• 🔴 Destination marker at Delhi (28.70, 77.10)
          <br />• 📍 Current location marker at Nagpur
          <br />• Red route line connecting the points
        </p>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            overflow: "hidden",
            width: "100%",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <SimpleTrackingMap
            shipmentData={testShipmentDataWithMarkers}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>🧪 Test 2: Without Valid Data (Fallback Markers)</h3>
        <p>
          This map should show fallback test markers:
          <br />• 🧪 Test source marker at Mumbai
          <br />• 🧪 Test destination marker at Delhi
          <br />• No route line (no valid data)
        </p>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            overflow: "hidden",
            width: "100%",
            height: "400px",
          }}
        >
          <SimpleTrackingMap
            shipmentData={testShipmentDataWithoutMarkers}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
        }}
      >
        <h4>🔍 Debugging Tips:</h4>
        <ul>
          <li>Open browser console to see marker debug logs</li>
          <li>Click on markers to see console messages</li>
          <li>Check if source/destination icons are loading properly</li>
          <li>Verify that markers appear at correct coordinates</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleTrackingMapTest;
