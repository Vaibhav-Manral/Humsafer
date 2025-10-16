import React from "react";
import { PolylineMarkersMap } from "./PolylineMarkersMap";
import { ShipmentTrackingMap } from "./ShipmentTrackingMap";

// Test component to demonstrate polyline-based markers
const PolylineMarkersTest: React.FC = () => {
  // Sample encoded polyline data (Mumbai to Delhi route)
  const samplePolylineData = {
    // This is a real encoded polyline from Mumbai to Delhi
    googleMapsRouteInfo: {
      polyline:
        "mhrlDkxwlMzBhAf@|@Zr@Vr@Xv@\\|@`@~@d@~@h@~@l@|@p@z@t@x@x@v@|@t@~@r@`Ap@bAn@dAl@fAj@hAh@jAf@lAd@nAb@pA`@rA^tA\\vAZxAXzAV|AS~AQ`BO`BM`BKbBIbBGdBEdBCdBA",
    },
    shipmentSourceAddress: "Mumbai, Maharashtra, India",
    shipmentDestinationAddress: "Delhi, India",
  };

  // Alternative polyline data (shorter route for testing)
  const shortPolylineData = {
    polyline: "qjvlDmhwlM}@aBkAcBmAeBoBgCqBiCsBkCuBmCwBoC",
    shipmentSourceAddress: "Point A",
    shipmentDestinationAddress: "Point B",
  };

  // Data with encoded polyline field
  const encodedPolylineData = {
    encodedPolyline:
      "mhrlDkxwlMzBhAf@|@Zr@Vr@Xv@\\|@`@~@d@~@h@~@l@|@p@z@t@x@x@v@|@t@~@r@`Ap@bAn@dAl@fAj@hAh@jAf@lAd@nAb@pA`@rA^tA\\vAZxAXzAV|AS~AQ`BO`BM`BKbBIbBGdBEdBCdBA",
    shipmentSourceAddress: "Mumbai Central",
    shipmentDestinationAddress: "New Delhi",
  };

  // Empty data to test fallback
  const emptyData = {
    shipmentSourceAddress: "Unknown Source",
    shipmentDestinationAddress: "Unknown Destination",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🗺️ Polyline-Based Markers Test</h1>
      <p>
        This page demonstrates how to extract source and destination markers
        directly from polyline data.
      </p>

      <div style={{ marginBottom: "40px" }}>
        <h2>✅ Test 1: PolylineMarkersMap with Google Maps Route Info</h2>
        <p>
          <strong>Data source:</strong>{" "}
          shipmentData.googleMapsRouteInfo.polyline
          <br />
          <strong>Expected:</strong> Red route line with small green source
          marker (scale 8) and small red destination marker (scale 8) at actual
          polyline endpoints
        </p>
        <div
          style={{
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            overflow: "hidden",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <PolylineMarkersMap
            shipmentData={samplePolylineData}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🔄 Test 2: PolylineMarkersMap with Direct Polyline</h2>
        <p>
          <strong>Data source:</strong> shipmentData.polyline
          <br />
          <strong>Expected:</strong> Shorter route with markers at polyline
          start/end points
        </p>
        <div
          style={{
            border: "2px solid #FF9800",
            borderRadius: "8px",
            overflow: "hidden",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <PolylineMarkersMap
            shipmentData={shortPolylineData}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🧪 Test 3: PolylineMarkersMap with Encoded Polyline</h2>
        <p>
          <strong>Data source:</strong> shipmentData.encodedPolyline
          <br />
          <strong>Expected:</strong> Route with markers extracted from encoded
          polyline data
        </p>
        <div
          style={{
            border: "2px solid #9C27B0",
            borderRadius: "8px",
            overflow: "hidden",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <PolylineMarkersMap
            shipmentData={encodedPolylineData}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🔄 Test 4: PolylineMarkersMap with No Data (Fallback)</h2>
        <p>
          <strong>Data source:</strong> No polyline data
          <br />
          <strong>Expected:</strong> Fallback markers at Mumbai and Delhi + blue
          test marker
        </p>
        <div
          style={{
            border: "2px solid #F44336",
            borderRadius: "8px",
            overflow: "hidden",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <PolylineMarkersMap
            shipmentData={emptyData}
            height="400px"
            width="100%"
          />
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>🚀 Test 5: Enhanced ShipmentTrackingMap with Polyline Markers</h2>
        <p>
          <strong>Data source:</strong> Enhanced original component with
          polyline extraction
          <br />
          <strong>Expected:</strong> All previous markers PLUS medium
          polyline-based markers (scale 12)
        </p>
        <div
          style={{
            border: "2px solid #2196F3",
            borderRadius: "8px",
            overflow: "hidden",
            height: "400px",
            marginBottom: "20px",
          }}
        >
          <ShipmentTrackingMap
            shipmentData={samplePolylineData as any}
            height="400px"
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
        <h3>🔍 How Polyline-Based Markers Work:</h3>
        <ol>
          <li>
            <strong>Extract Polyline:</strong> Get encoded polyline string from
            shipmentData.googleMapsRouteInfo.polyline, shipmentData.polyline, or
            shipmentData.encodedPolyline
          </li>
          <li>
            <strong>Decode Path:</strong> Use Google Maps
            geometry.encoding.decodePath() to convert encoded string to LatLng
            array
          </li>
          <li>
            <strong>Extract Endpoints:</strong> First point = source, last point
            = destination
          </li>
          <li>
            <strong>Place Markers:</strong> Create markers at extracted
            coordinates
          </li>
          <li>
            <strong>Fallback:</strong> If polyline fails, use default
            coordinates
          </li>
        </ol>

        <h4>🎯 Expected Results:</h4>
        <ul>
          <li>
            <strong>PolylineMarkersMap:</strong> Clean, simple map with only
            route line and small source/destination markers (scale 8)
          </li>
          <li>
            <strong>Enhanced ShipmentTrackingMap:</strong> All existing markers
            PLUS medium polyline-based markers (scale 12)
          </li>
          <li>
            <strong>Console Logs:</strong> Detailed debugging showing polyline
            decoding process
          </li>
          <li>
            <strong>Auto-fit Bounds:</strong> Map automatically zooms to show
            entire route
          </li>
        </ul>

        <h4>🔧 Usage in Your App:</h4>
        <pre
          style={{
            backgroundColor: "#f1f1f1",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {`// Simple polyline-based markers only
<PolylineMarkersMap 
  shipmentData={yourShipmentData}
  height="500px"
  width="100%"
/>

// Enhanced version with all markers
<ShipmentTrackingMap 
  shipmentData={yourShipmentData}
  height="500px"
  width="100%"
/>`}
        </pre>
      </div>
    </div>
  );
};

export default PolylineMarkersTest;
