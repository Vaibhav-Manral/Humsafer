import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "../../utils/GoogleMapsSingleton";

interface PolylineMarkersMapProps {
  shipmentData: {
    googleMapsRouteInfo?: {
      polyline?: string;
    };
    polyline?: string;
    encodedPolyline?: string;
    shipmentSourceAddress?: string;
    shipmentDestinationAddress?: string;
  };
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

export const PolylineMarkersMap: React.FC<PolylineMarkersMapProps> = ({
  shipmentData,
  height = "500px",
  width = "100%",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [sourcePoint, setSourcePoint] = useState<google.maps.LatLng | null>(
    null
  );
  const [destinationPoint, setDestinationPoint] =
    useState<google.maps.LatLng | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  // Process polyline data to extract route and endpoints
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.geometry) {
      console.log("⏳ Google Maps not loaded yet");
      return;
    }

    // Get polyline string from various possible sources
    const polylineString =
      shipmentData.googleMapsRouteInfo?.polyline ||
      shipmentData.polyline ||
      shipmentData.encodedPolyline;

    console.log("🔍 Polyline Debug:", {
      polylineString,
      hasGoogleMapsRouteInfo: !!shipmentData.googleMapsRouteInfo,
      hasPolyline: !!shipmentData.polyline,
      hasEncodedPolyline: !!shipmentData.encodedPolyline,
    });

    if (
      polylineString &&
      polylineString !== "..." &&
      polylineString.length > 0
    ) {
      try {
        // Decode the polyline to get route points
        const decodedPath =
          window.google.maps.geometry.encoding.decodePath(polylineString);

        console.log("✅ Successfully decoded polyline:", {
          totalPoints: decodedPath.length,
          firstPoint: decodedPath[0]?.toString(),
          lastPoint: decodedPath[decodedPath.length - 1]?.toString(),
        });

        if (decodedPath.length > 0) {
          setRoutePath(decodedPath);

          // Extract source (first point) and destination (last point)
          const source = decodedPath[0];
          const destination = decodedPath[decodedPath.length - 1];

          setSourcePoint(source);
          setDestinationPoint(destination);

          console.log("📍 Extracted endpoints:", {
            source: { lat: source.lat(), lng: source.lng() },
            destination: { lat: destination.lat(), lng: destination.lng() },
          });
        }
      } catch (error) {
        console.error("❌ Error decoding polyline:", error);
        // Clear markers if polyline fails
        setSourcePoint(null);
        setDestinationPoint(null);
        setRoutePath([]);
      }
    } else {
      console.log("⚠️ No valid polyline data found");
      // Clear markers if no polyline data
      setSourcePoint(null);
      setDestinationPoint(null);
      setRoutePath([]);
    }
  }, [isLoaded, shipmentData]);

  // Auto-fit map bounds to show the entire route
  useEffect(() => {
    if (map && routePath.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routePath.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    } else if (map && sourcePoint && destinationPoint) {
      // If no route path, fit bounds to source and destination
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(sourcePoint);
      bounds.extend(destinationPoint);
      map.fitBounds(bounds, { top: 100, right: 100, bottom: 100, left: 100 });
    }
  }, [map, routePath, sourcePoint, destinationPoint]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log("🗺️ Map loaded successfully");
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
      zoom={6}
      onLoad={onMapLoad}
      options={mapOptions}
    >
      {/* Route Polyline */}
      {routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            geodesic: true,
            strokeColor: "#FF0000", // Red route line
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}

      {/* Source Marker (from polyline start) */}
      {sourcePoint && (
        <Marker
          position={sourcePoint}
          title={`🟢 SOURCE: ${
            shipmentData.shipmentSourceAddress ?? "Route Start"
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

      {/* Destination Marker (from polyline end) */}
      {destinationPoint && (
        <Marker
          position={destinationPoint}
          title={`🔴 DESTINATION: ${
            shipmentData.shipmentDestinationAddress ?? "Route End"
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
    </GoogleMap>
  );
};

export default PolylineMarkersMap;
