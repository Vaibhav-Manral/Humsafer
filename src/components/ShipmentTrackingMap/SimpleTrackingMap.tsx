import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../utils/GoogleMapsSingleton";
import { Config } from "../../utils/Config";

interface TimelineLocation {
  latitude: number;
  longitude: number;
  locationDescription?: string;
  timestamp?: number;
  shouldDisplayInMap?: boolean;
}

interface PathLocation {
  latitude: number;
  longitude: number;
  locationType?: "SOURCE" | "DESTINATION" | "INTERMEDIATE_STOP";
}

interface GoogleMapsRouteInfo {
  polyline: string;
  start: {
    latitude: number;
    longitude: number;
  };
  end: {
    latitude: number;
    longitude: number;
  };
}

interface ShipmentData {
  path?: PathLocation[];
  timeline?: {
    timelineLocations: TimelineLocation[];
  };
  shipmentCompletionPercentage?: number;
  polyline?: string;
  encodedPolyline?: string;
  googleMapsRouteInfo?: GoogleMapsRouteInfo;
  shipmentSourceAddress?: string;
  shipmentDestinationAddress?: string;
}

interface SimpleTrackingMapProps {
  shipmentData: ShipmentData;
  height?: string;
  width?: string;
}

// const mapContainerStyle = {
//   width: "100%",
//   height: "500px",
// };

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629, // India center
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export const SimpleTrackingMap: React.FC<SimpleTrackingMapProps> = ({
  shipmentData,
  height = "500px",
  width = "100%",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLng | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const themeConfig = Config.getInstance().themeConfig();

  // Helper function to validate GPS coordinates
  const isValidGPSCoordinate = useCallback(
    (lat: number, lng: number): boolean => {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return false;
      }

      // Filter out coordinates that are exactly 0,0 or extremely close to 0,0
      const ZERO_COORDINATE_THRESHOLD = 0.001; // ~100 meters

      if (
        Math.abs(lat) < ZERO_COORDINATE_THRESHOLD &&
        Math.abs(lng) < ZERO_COORDINATE_THRESHOLD
      ) {
        return false;
      }

      // Filter out coordinates that are suspiciously small but not zero
      // This catches coordinates like 0.00007707, 0.0002960 which are likely relative/offset coordinates
      if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) {
        console.log(
          `⚠️ SimpleTrackingMap: Filtering out suspicious small coordinates: lat=${lat}, lng=${lng}`
        );
        return false;
      }

      return true;
    },
    []
  );

  // Get source and destination locations
  const sourceLocation =
    shipmentData.googleMapsRouteInfo?.start ||
    shipmentData.path?.find((p) => p.locationType === "SOURCE");

  const destinationLocation =
    shipmentData.googleMapsRouteInfo?.end ||
    shipmentData.path?.find((p) => p.locationType === "DESTINATION");

  // Validate markers
  const sourceValid = !!(
    sourceLocation &&
    sourceLocation.latitude &&
    sourceLocation.longitude &&
    isValidGPSCoordinate(sourceLocation.latitude, sourceLocation.longitude)
  );

  const destinationValid = !!(
    destinationLocation &&
    destinationLocation.latitude &&
    destinationLocation.longitude &&
    isValidGPSCoordinate(
      destinationLocation.latitude,
      destinationLocation.longitude
    )
  );

  // Debug logging for markers
  console.log("🔍 SimpleTrackingMap Marker Debug:", {
    sourceLocation,
    destinationLocation,
    sourceValid,
    destinationValid,
    sourceIcon: themeConfig.sourceIcon,
    destinationIcon: themeConfig.destinationIcon,
  });

  // Process route data
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.geometry) {
      return;
    }

    let route: google.maps.LatLng[] = [];

    // Try to decode polyline first
    const polylineString =
      shipmentData.googleMapsRouteInfo?.polyline ||
      shipmentData.polyline ||
      shipmentData.encodedPolyline;

    if (
      polylineString &&
      polylineString !== "..." &&
      polylineString.length > 0
    ) {
      try {
        route = window.google.maps.geometry.encoding.decodePath(polylineString);
        console.log("✅ Using polyline data with", route.length, "points");
      } catch (error) {
        console.error("❌ Error decoding polyline:", error);
      }
    }

    // Fallback to path points if no polyline
    if (
      route.length === 0 &&
      shipmentData.path &&
      shipmentData.path.length > 0
    ) {
      const sortedPath = [...shipmentData.path].sort((a, b) => {
        const order = { SOURCE: 0, INTERMEDIATE_STOP: 1, DESTINATION: 2 };
        return (
          (order[a.locationType as keyof typeof order] || 1) -
          (order[b.locationType as keyof typeof order] || 1)
        );
      });

      route = sortedPath
        .filter((point) =>
          isValidGPSCoordinate(point.latitude, point.longitude)
        )
        .map(
          (point) =>
            new window.google.maps.LatLng(point.latitude, point.longitude)
        );
    }

    setRoutePath(route);

    // Process timeline for current location
    const timelineLocations =
      shipmentData.timeline?.timelineLocations
        ?.filter(
          (loc) =>
            loc.shouldDisplayInMap !== false &&
            loc.timestamp &&
            isValidGPSCoordinate(loc.latitude, loc.longitude)
        )
        ?.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) || [];

    if (timelineLocations.length > 0) {
      const latestLocation = timelineLocations[timelineLocations.length - 1];
      setCurrentLocation(
        new window.google.maps.LatLng(
          latestLocation.latitude,
          latestLocation.longitude
        )
      );
    }
  }, [isLoaded, shipmentData, isValidGPSCoordinate]);

  // Auto-fit map bounds
  useEffect(() => {
    if (map && routePath.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));

      if (currentLocation) {
        bounds.extend(currentLocation);
      }

      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, routePath, currentLocation]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  if (loadError) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Error loading Google Maps: {loadError.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Loading map...</div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ height, width }}
      center={defaultCenter}
      zoom={10}
      onLoad={onMapLoad}
      options={mapOptions}
    >
      {/* Route Polyline */}
      {routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            geodesic: true,
            strokeColor: "#FF0000", // Red for route
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}

      {/* Source Marker - Default Google Maps Style */}
      {sourceValid && (
        <Marker
          position={{
            lat: sourceLocation.latitude,
            lng: sourceLocation.longitude,
          }}
          title={`🟢 SOURCE: ${
            shipmentData.shipmentSourceAddress ?? "Start Location"
          }`}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#4CAF50", // Green
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          }}
          zIndex={2000}
        />
      )}

      {/* Destination Marker - Default Google Maps Style */}
      {destinationValid && (
        <Marker
          position={{
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          }}
          title={`🔴 DESTINATION: ${
            shipmentData.shipmentDestinationAddress ?? "End Location"
          }`}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#F44336", // Red
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          }}
          zIndex={2000}
        />
      )}

      {/* Current Location Marker */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          title={`Current Location (${
            shipmentData.shipmentCompletionPercentage ?? 0
          }% complete)`}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#2196F3", // Blue
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 8,
          }}
          zIndex={1500}
        />
      )}
    </GoogleMap>
  );
};

export default SimpleTrackingMap;
