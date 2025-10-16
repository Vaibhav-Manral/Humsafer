// Enhanced ConditionalTrackingMap.tsx
import React from "react";
import { IntegratedTrackingMap } from "../ShipmentTrackingMap/IntegratedTrackingMap";
import DirectionMapRoute from "../oldDirectionsMap/DirectionsMapRoute";
// Import your release branch map component
// import { LegacyTrackingMap } from "./LegacyTrackingMap"; // Your release branch map

interface ConditionalTrackingMapProps {
  shipmentData: any;
  companyId: string;
  shipmentId: string;
  height?: string;
  width?: string;
  // autoRefresh?: boolean;
  // refreshInterval?: number;
  showFuelPlan?: boolean;
  fuelingStopsInfo?: any;
  selectedCompany?: any;
  isLoaded?: boolean;
}

// Simplified detection logic - only two variants
const getAPIFormatType = (shipmentData: any): "NEW_WITH_POLYLINE" | "OLD" => {
  const hasPolyline = !!shipmentData?.googleMapsRouteInfo?.polyline;

  // Only use enhanced tracking if we have polyline data
  if (hasPolyline) {
    return "NEW_WITH_POLYLINE";
  } else {
    return "OLD"; // Everything else uses the old/legacy approach
  }
};

const ConditionalTrackingMap: React.FC<ConditionalTrackingMapProps> = ({
  shipmentData,
  companyId,
  shipmentId,
  height = "600px",
  width = "100%",
  // autoRefresh = false,
  // refreshInterval = 1800000,
  showFuelPlan = false,
  fuelingStopsInfo = undefined,
  selectedCompany = undefined,
  isLoaded = false,
}) => {
  const formatType = getAPIFormatType(shipmentData);

  switch (formatType) {
    case "NEW_WITH_POLYLINE":
      // Full featured tracking with polyline
      console.log("✅ Using NEW API with POLYLINE - IntegratedTrackingMap");
      return (
        <div style={{ position: "relative" }}>
          {/* <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#28a745",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 1000,
              opacity: 0.8,
            }}
          >
          
          </div> */}
          <IntegratedTrackingMap
            shipmentData={shipmentData}
            companyId={companyId}
            shipmentId={shipmentId}
            height={height}
            width={width}
            // autoRefresh={autoRefresh}
            // refreshInterval={refreshInterval}
          />
        </div>
      );

    case "OLD":
      // Old API or new API without polyline - use ShipmentTrackingMap
      console.log("🔄 Using OLD/LEGACY API - ShipmentTrackingMap");
      return (
        <div style={{ position: "relative" }}>
          {/* <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#6c757d",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 1000,
              opacity: 0.8,
            }}
          >
            LEGACY API
          </div> */}
          <DirectionMapRoute
            shipmentDetails={shipmentData}
            showFuelPlan={showFuelPlan}
            fuelingStopsInfo={fuelingStopsInfo}
            selectedCompany={selectedCompany}
            shipmentId={shipmentId}
            isLoaded={isLoaded}
          />
        </div>
      );

    default:
      // Fallback - should never reach here with simplified logic
      return (
        <div style={{ position: "relative" }}>
          {/* <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#dc3545",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 1000,
              opacity: 0.8,
            }}
          >
            FALLBACK
          </div> */}
          {/* Placeholder for the missing ShipmentTrackingMap component */}
        </div>
      );
  }
};

export default ConditionalTrackingMap;
