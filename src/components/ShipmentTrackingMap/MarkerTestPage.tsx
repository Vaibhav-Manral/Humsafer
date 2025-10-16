import React from "react";

// Test page to verify markers are working
const MarkerTestPage: React.FC = () => {
  // Minimal test data
  // const testShipmentData = {
  //   id: "test-shipment",
  //   vanityId: "TEST-001",
  //   shipmentSourceAddress: "Mumbai, Maharashtra",
  //   shipmentDestinationAddress: "Delhi, India",
  //   shipmentCompletionPercentage: 50,
  //   path: [
  //     {
  //       latitude: 19.0760,
  //       longitude: 72.8777,
  //       locationType: "SOURCE" as const,
  //     },
  //     {
  //       latitude: 28.6139,
  //       longitude: 77.2090,
  //       locationType: "DESTINATION" as const,
  //     },
  //   ],
  //   timeline: {
  //     timelineLocations: [
  //       {
  //         latitude: 19.0760,
  //         longitude: 72.8777,
  //         timestamp: Date.now() - 7200000, // 2 hours ago
  //         locationDescription: "Mumbai - Started",
  //         shouldDisplayInMap: true,
  //       },
  //       {
  //         latitude: 20.5937,
  //         longitude: 78.9629,
  //         timestamp: Date.now() - 3600000, // 1 hour ago
  //         locationDescription: "Nagpur - Current Location",
  //         shouldDisplayInMap: true,
  //       },
  //     ],
  //   },
  // };

  // Empty data to test fallback markers
  // const emptyShipmentData = {
  //   id: "empty-shipment",
  //   vanityId: "EMPTY-001",
  //   shipmentSourceAddress: "Unknown Source",
  //   shipmentDestinationAddress: "Unknown Destination",
  //   shipmentCompletionPercentage: 0,
  //   path: [],
  //   timeline: {
  //     timelineLocations: [],
  //   },
  // };

  return (
    <div>
      {/* <h1>🗺️ Marker Test Page</h1>
      <p>This page tests if source and destination markers are working correctly.</p>

      <div style={{ marginBottom: "40px" }}>
        <h2>✅ Test 1: ShipmentTrackingMap with Valid Data</h2>
        <p>
          <strong>Expected markers:</strong>
          <br />• 🟢 Green source marker at Mumbai
          <br />• 🔴 Red destination marker at Delhi
          <br />• 🟢 Always visible source test marker (Mumbai Central)
          <br />• 🔴 Always visible destination test marker (New Delhi)
          <br />• 📍 Default marker test (Center of India)
          <br />• 🔵 Simple blue marker (Pune)
        </p>
        <div
          style={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            height: "500px",
            marginBottom: "20px",
          }}
        >
          <ShipmentTrackingMap
            shipmentData={testShipmentData as any}
            height="500px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🧪 Test 2: SimpleTrackingMap with Valid Data</h2>
        <p>
          <strong>Expected markers:</strong>
          <br />• 🟢 Green source marker at Mumbai
          <br />• 🔴 Red destination marker at Delhi
          <br />• 🔵 Blue current location marker at Nagpur
          <br />• 🟢 Always visible source test marker (Mumbai Central)
          <br />• 🔴 Always visible destination test marker (New Delhi)
        </p>
        <div
          style={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            height: "500px",
            marginBottom: "20px",
          }}
        >
          <SimpleTrackingMap
            shipmentData={testShipmentData}
            height="500px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🔄 Test 3: ShipmentTrackingMap with Empty Data</h2>
        <p>
          <strong>Expected markers (fallback):</strong>
          <br />• 🟢 Always visible source test marker (Mumbai Central)
          <br />• 🔴 Always visible destination test marker (New Delhi)
          <br />• 📍 Default marker test (Center of India)
          <br />• 🔵 Simple blue marker (Pune)
        </p>
        <div
          style={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            height: "500px",
            marginBottom: "20px",
          }}
        >
          <ShipmentTrackingMap
            shipmentData={emptyShipmentData as any}
            height="500px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🔄 Test 4: SimpleTrackingMap with Empty Data</h2>
        <p>
          <strong>Expected markers (fallback):</strong>
          <br />• 🧪 Test source marker at Mumbai (fallback)
          <br />• 🧪 Test destination marker at Delhi (fallback)
          <br />• 🟢 Always visible source test marker (Mumbai Central)
          <br />• 🔴 Always visible destination test marker (New Delhi)
        </p>
        <div
          style={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            height: "500px",
            marginBottom: "20px",
          }}
        >
          <SimpleTrackingMap
            shipmentData={emptyShipmentData}
            height="500px"
            width="100%"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h3>🔍 Debugging Instructions:</h3>
        <ol>
          <li>Open browser developer console (F12)</li>
          <li>Look for debug logs starting with "🔍 SHIPMENT TRACKING MAP DEBUG"</li>
          <li>Click on any marker to see console messages</li>
          <li>Check if all expected markers are visible on each map</li>
          <li>Verify marker colors and positions match the descriptions</li>
        </ol>

        <h4>🎯 Expected Results:</h4>
        <ul>
          <li>
            <strong>All maps should show multiple markers</strong> - if you see empty maps,
            there's a Google Maps loading issue
          </li>
          <li>
            <strong>Test markers should always be visible</strong> - these don't depend on
            shipment data
          </li>
          <li>
            <strong>Data-based markers</strong> should appear when valid coordinates are
            provided
          </li>
          <li>
            <strong>Console logs</strong> should show detailed debugging information
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default MarkerTestPage;
