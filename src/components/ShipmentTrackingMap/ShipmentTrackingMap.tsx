import { useState, useEffect } from "react";
import {
  GoogleMap,
  Polyline,
  Marker,
  DirectionsService,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../../utils/GoogleMapsSingleton";
import { Config } from "../../utils/Config";

interface TimelineLocation {
  latitude: number;
  longitude: number;
  locationDescription?: string;
  timestamp?: number;
  isBatteryCharging?: boolean;
  batteryPercentage?: number;
  completionPercentage?: number;
  source?: string;
  stopDurationInMillis?: number;
  shouldDisplayInMap?: boolean;
  locationType?: string;
}

interface PathLocation {
  latitude: number;
  longitude: number;
  locationType?: "SOURCE" | "DESTINATION" | "INTERMEDIATE_STOP";
}

interface GoogleMapsRouteInfo {
  distanceInMeters: number;
  durationInSeconds: number;
  polyline: string;
  start: {
    latitude: number;
    longitude: number;
  };
  end: {
    latitude: number;
    longitude: number;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  offRoutePoints: Array<{
    latitude: number;
    longitude: number;
  }>;
}

interface LiveLocationRecord {
  id: string;
  lastUpdated: string;
  source: string;
  userId: string;
  currentBatteryPercent: number;
  currentBatteryCharging: boolean;
  lat: number;
  lng: number;
  address?: {
    adminArea: string;
    countryCode: string;
    countryName: string;
    locality: string;
    postalCode: string;
    subAdminArea: string;
    subLocality: string;
    thoroughfare: string;
  };
}

interface ShipmentData {
  path?: PathLocation[];
  timeline?: {
    timelineLocations: TimelineLocation[];
  };
  lastLiveLocationReceivedTime?: number;
  shipmentCompletionPercentage?: number;
  // Add polyline support
  polyline?: string;
  encodedPolyline?: string;
  // Add Google Maps route info support
  googleMapsRouteInfo?: GoogleMapsRouteInfo;
  // Add address support
  shipmentSourceAddress?: string;
  shipmentDestinationAddress?: string;
  // Add live location support
  liveLocationRecords?: LiveLocationRecord[];
}

interface ShipmentTrackingMapProps {
  shipmentData: ShipmentData;
  height?: string;
  width?: string;
}

export const ShipmentTrackingMap: React.FC<ShipmentTrackingMapProps> = ({
  shipmentData,
  height = "500px",
  width = "100%",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [completedPath, setCompletedPath] = useState<google.maps.LatLng[]>([]);
  const [remainingPath, setRemainingPath] = useState<google.maps.LatLng[]>([]);
  const [fullRoutePath, setFullRoutePath] = useState<google.maps.LatLng[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<google.maps.LatLng | null>(null);
  const [hasLiveTracking, setHasLiveTracking] = useState<boolean>(false);
  const [shouldFetchDirections, setShouldFetchDirections] =
    useState<boolean>(false);
  const [routeWaypoints, setRouteWaypoints] = useState<google.maps.LatLng[]>(
    []
  );

  // Extract source and destination from polyline if available - HOOKS MUST BE AT TOP LEVEL
  const [polylineSourcePoint, setPolylineSourcePoint] =
    useState<google.maps.LatLng | null>(null);
  const [polylineDestinationPoint, setPolylineDestinationPoint] =
    useState<google.maps.LatLng | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const themeConfig = Config.getInstance().themeConfig();

  // Helper function to validate if coordinates are valid GPS coordinates
  const isValidGPSCoordinate = (lat: number, lng: number): boolean => {
    // Check if coordinates are within valid GPS ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }

    // Filter out coordinates that are exactly 0,0 or extremely close to 0,0
    // Use a much smaller threshold to allow legitimate small coordinates
    const ZERO_COORDINATE_THRESHOLD = 0.001; // ~100 meters

    // If both coordinates are extremely close to 0,0, it's likely invalid
    if (
      Math.abs(lat) < ZERO_COORDINATE_THRESHOLD &&
      Math.abs(lng) < ZERO_COORDINATE_THRESHOLD
    ) {
      return false;
    }

    // Additional validation: check for obviously invalid patterns
    // Filter out coordinates that are suspiciously small but not zero
    // This catches coordinates like 0.00007707, 0.0002960 which are likely relative/offset coordinates
    if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) {
      console.log(
        `⚠️ Filtering out suspicious small coordinates: lat=${lat}, lng=${lng}`
      );
      return false;
    }

    return true;
  };

  // Process shipment data to create route segments
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.geometry) {
      console.log("⏳ Google Maps not loaded yet");
      return;
    }

    console.log("🚀 Processing shipment data:", {
      hasGoogleMapsRouteInfo: !!shipmentData.googleMapsRouteInfo,
      hasPolyline: !!shipmentData.polyline,
      hasEncodedPolyline: !!shipmentData.encodedPolyline,
      hasPath: !!shipmentData.path,
      pathLength: shipmentData.path?.length || 0,
      timelineLocations: shipmentData.timeline?.timelineLocations?.length || 0,
      pathDetails: shipmentData.path,
      timelineData: shipmentData.timeline?.timelineLocations,
    });

    // First, try to get the full route from polyline or path
    let fullRoute: google.maps.LatLng[] = [];

    // Try to decode polyline if available (prioritize googleMapsRouteInfo)
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
        fullRoute =
          window.google.maps.geometry.encoding.decodePath(polylineString);
        console.log("✅ Using polyline data with", fullRoute.length, "points");

        // Log the source of polyline data
        if (shipmentData.googleMapsRouteInfo?.polyline) {
          console.log("📍 Polyline source: googleMapsRouteInfo");
        } else if (shipmentData.polyline) {
          console.log("📍 Polyline source: shipmentData.polyline");
        } else {
          console.log("📍 Polyline source: shipmentData.encodedPolyline");
        }

        // Extract waypoints in priority order: intermediate stops -> timeline locations -> route points
        const actualWaypoints: google.maps.LatLng[] = [];
        let waypointSource = "";

        // Show intermediate stops as waypoints
        if (shipmentData.path) {
          const intermediateStops = shipmentData.path.filter(
            (point) => point.locationType === "INTERMEDIATE_STOP"
          );

          intermediateStops.forEach((stop) => {
            if (stop.latitude && stop.longitude) {
              actualWaypoints.push(
                new window.google.maps.LatLng(stop.latitude, stop.longitude)
              );
            }
          });

          if (actualWaypoints.length > 0) {
            waypointSource = "intermediate_stops";
            console.log(
              "🗺️ Found",
              actualWaypoints.length,
              "actual waypoints (intermediate stops)"
            );
          }
        }

        // Add timeline locations as waypoints for tracking visualization
        if (shipmentData.timeline?.timelineLocations) {
          const validTimelineLocations = shipmentData.timeline.timelineLocations
            .filter(
              (loc) =>
                loc.shouldDisplayInMap !== false &&
                loc.latitude &&
                loc.longitude &&
                isValidGPSCoordinate(loc.latitude, loc.longitude)
            )
            .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

          // Add timeline locations as waypoints (these will be shown as pings on the tracked route)
          validTimelineLocations.forEach((loc) => {
            actualWaypoints.push(
              new window.google.maps.LatLng(loc.latitude, loc.longitude)
            );
          });

          if (validTimelineLocations.length > 0) {
            waypointSource =
              actualWaypoints.length > validTimelineLocations.length
                ? "mixed"
                : "timeline_locations";
            console.log(
              "🗺️ Added",
              validTimelineLocations.length,
              "timeline locations as waypoints for tracking visualization"
            );
          }
        }

        // Store waypoint source for rendering logic
        (window as any).waypointSource = waypointSource;
        setRouteWaypoints(actualWaypoints);
      } catch (error) {
        console.error("❌ Error decoding polyline:", error);
        setRouteWaypoints([]); // Clear waypoints on error
      }
    } else {
      setRouteWaypoints([]); // Clear waypoints if no polyline
    }

    // Use path points to create route (this is what we have from the API)
    if (
      fullRoute.length === 0 &&
      shipmentData.path &&
      shipmentData.path.length > 0
    ) {
      // Sort path points: SOURCE -> INTERMEDIATE_STOP -> DESTINATION
      const sortedPath = [...shipmentData.path].sort((a, b) => {
        const order = { SOURCE: 0, INTERMEDIATE_STOP: 1, DESTINATION: 2 };
        return (
          (order[a.locationType as keyof typeof order] || 1) -
          (order[b.locationType as keyof typeof order] || 1)
        );
      });

      fullRoute = sortedPath.map(
        (point) =>
          new window.google.maps.LatLng(point.latitude, point.longitude)
      );

      // Trigger directions fetch if we only have source and destination
      if (sortedPath.length === 2) {
        setShouldFetchDirections(true);
      }
    }

    // Log final route status
    if (fullRoute.length > 0) {
      console.log("✅ Route processing complete:", {
        routePoints: fullRoute.length,
        routeType: polylineString ? "polyline" : "path points",
      });
    } else {
      console.log("⚠️ No route data available - map will show markers only");
    }

    setFullRoutePath(fullRoute);

    // Process all available location data sources
    console.log("🔍 Processing all location data sources:", {
      timelineLocations: shipmentData.timeline?.timelineLocations?.length || 0,
      liveLocationRecords: shipmentData.liveLocationRecords?.length || 0,
      googleMapsCurrentLocation:
        shipmentData.googleMapsRouteInfo?.currentLocation,
      offRoutePoints:
        shipmentData.googleMapsRouteInfo?.offRoutePoints?.length || 0,
    });

    // 1. Process timeline locations (waypoints)
    const timelineLocations =
      shipmentData.timeline?.timelineLocations
        ?.filter(
          (loc) =>
            loc.shouldDisplayInMap !== false &&
            loc.timestamp &&
            isValidGPSCoordinate(loc.latitude, loc.longitude)
        )
        ?.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) || [];

    // 2. Process live location records (if available)
    const liveLocationRecords =
      shipmentData.liveLocationRecords
        ?.filter((loc) => isValidGPSCoordinate(loc.lat, loc.lng))
        ?.sort(
          (a, b) =>
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime()
        ) || [];

    // 3. Process off-route points from Google Maps
    const offRoutePoints =
      shipmentData.googleMapsRouteInfo?.offRoutePoints?.filter((point) =>
        isValidGPSCoordinate(point.latitude, point.longitude)
      ) || [];

    // 4. Get current location from Google Maps route info
    const googleMapsCurrentLocation =
      shipmentData.googleMapsRouteInfo?.currentLocation;

    console.log("✅ Processed location data:", {
      validTimelineLocations: timelineLocations.length,
      validLiveLocationRecords: liveLocationRecords.length,
      validOffRoutePoints: offRoutePoints.length,
      hasGoogleMapsCurrentLocation: !!googleMapsCurrentLocation,
    });

    // Determine the most recent current location (priority order)
    let currentLocationData: {
      lat: number;
      lng: number;
      source: string;
    } | null = null;

    // Priority 1: Live location records (most recent)
    if (liveLocationRecords.length > 0) {
      const latest = liveLocationRecords[liveLocationRecords.length - 1];
      currentLocationData = {
        lat: latest.lat,
        lng: latest.lng,
        source: "liveLocationRecords",
      };
    }
    // Priority 2: Google Maps current location
    else if (
      googleMapsCurrentLocation &&
      isValidGPSCoordinate(
        googleMapsCurrentLocation.latitude,
        googleMapsCurrentLocation.longitude
      )
    ) {
      currentLocationData = {
        lat: googleMapsCurrentLocation.latitude,
        lng: googleMapsCurrentLocation.longitude,
        source: "googleMapsRouteInfo.currentLocation",
      };
    }
    // Priority 3: Latest timeline location
    else if (timelineLocations.length > 0) {
      const latest = timelineLocations[timelineLocations.length - 1];
      currentLocationData = {
        lat: latest.latitude,
        lng: latest.longitude,
        source: "timeline",
      };
    }

    console.log("🎯 Current location determined:", currentLocationData);

    const hasTracking = currentLocationData !== null;
    setHasLiveTracking(hasTracking);

    if (hasTracking && currentLocationData) {
      // Set current location marker
      const currentPos = new window.google.maps.LatLng(
        currentLocationData.lat,
        currentLocationData.lng
      );
      setCurrentLocation(currentPos);

      console.log("🎯 Setting current location marker at:", {
        lat: currentLocationData.lat,
        lng: currentLocationData.lng,
        source: currentLocationData.source,
      });

      // Find the closest point on the route to the current location
      let closestIndex = 0;
      let minDistance = Number.MAX_VALUE;

      if (fullRoute.length > 0) {
        fullRoute.forEach((routePoint, index) => {
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              currentPos,
              routePoint
            );
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        console.log("🔍 Closest route point found:", {
          index: closestIndex,
          distance: minDistance,
          totalRoutePoints: fullRoute.length,
        });

        // Split the route at the closest point
        const completedRoute = fullRoute.slice(0, closestIndex + 1);
        // Add current location as the last point of completed route
        completedRoute.push(currentPos);
        setCompletedPath(completedRoute);

        const remainingRoute = [
          currentPos,
          ...fullRoute.slice(closestIndex + 1),
        ];
        setRemainingPath(remainingRoute);

        console.log("✅ Green polyline created:", {
          completedRoutePoints: completedRoute.length,
          remainingRoutePoints: remainingRoute.length,
        });
      } else {
        // No route polyline, create simple paths
        const completedRoute: google.maps.LatLng[] = [];
        const source = shipmentData.path?.find(
          (p) => p.locationType === "SOURCE"
        );
        if (source) {
          completedRoute.push(
            new window.google.maps.LatLng(source.latitude, source.longitude)
          );
        }
        completedRoute.push(currentPos);
        setCompletedPath(completedRoute);

        const remainingRoute = [currentPos];
        const destination = shipmentData.path?.find(
          (p) => p.locationType === "DESTINATION"
        );
        if (destination) {
          remainingRoute.push(
            new window.google.maps.LatLng(
              destination.latitude,
              destination.longitude
            )
          );
        }
        setRemainingPath(remainingRoute);

        console.log("✅ Simple green polyline created (no route data):", {
          completedRoutePoints: completedRoute.length,
          remainingRoutePoints: remainingRoute.length,
        });
      }
    } else {
      // No live tracking - show full route in red
      setCurrentLocation(null);
      setCompletedPath([]);
      setRemainingPath(fullRoute);

      // Log when we have timeline data but no valid coordinates
      if (
        shipmentData.timeline?.timelineLocations &&
        shipmentData.timeline.timelineLocations.length > 0
      ) {
        console.log(
          "Timeline data exists but no valid GPS coordinates found. Showing route without live tracking."
        );
      }
    }
  }, [isLoaded, shipmentData]);

  // Extract polyline endpoints useEffect
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.geometry) return;

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
        const decodedPath =
          window.google.maps.geometry.encoding.decodePath(polylineString);
        if (decodedPath.length > 0) {
          setPolylineSourcePoint(decodedPath[0]);
          setPolylineDestinationPoint(decodedPath[decodedPath.length - 1]);
          console.log("✅ Extracted polyline endpoints:", {
            source: { lat: decodedPath[0].lat(), lng: decodedPath[0].lng() },
            destination: {
              lat: decodedPath[decodedPath.length - 1].lat(),
              lng: decodedPath[decodedPath.length - 1].lng(),
            },
          });
        }
      } catch (error) {
        console.error("❌ Error extracting polyline endpoints:", error);
      }
    }
  }, [isLoaded, shipmentData]);

  // Directions service callback
  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && result) {
      setShouldFetchDirections(false);

      // Extract the route polyline from directions
      const route = result.routes[0];
      if (route && route.overview_path) {
        const directionsRoute = route.overview_path;

        console.log(
          "✅ Google Directions Service returned route with",
          directionsRoute.length,
          "points"
        );

        // Update the fullRoute with the directions result
        setFullRoutePath(directionsRoute);

        // Re-process the route splitting logic with the new route data
        if (hasLiveTracking && currentLocation) {
          // Find the closest point on the new route to the current location
          let closestIndex = 0;
          let minDistance = Number.MAX_VALUE;

          directionsRoute.forEach((routePoint, index) => {
            const distance =
              window.google.maps.geometry.spherical.computeDistanceBetween(
                currentLocation,
                routePoint
              );
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          });

          // Split the route at the closest point
          const completedRoute = directionsRoute.slice(0, closestIndex + 1);
          completedRoute.push(currentLocation);
          setCompletedPath(completedRoute);

          const remainingRoute = [
            currentLocation,
            ...directionsRoute.slice(closestIndex + 1),
          ];
          setRemainingPath(remainingRoute);

          console.log("✅ Updated route splitting with directions data:", {
            completedRoutePoints: completedRoute.length,
            remainingRoutePoints: remainingRoute.length,
          });
        } else {
          // No live tracking - show full route in red
          setCompletedPath([]);
          setRemainingPath(directionsRoute);

          console.log(
            "✅ No live tracking - showing full directions route in red"
          );
        }
      }
    } else {
      console.error("Directions request failed:", status);
      setShouldFetchDirections(false);
    }
  };

  // Auto-fit map bounds when data is loaded
  useEffect(() => {
    if (
      map &&
      (completedPath.length > 0 ||
        remainingPath.length > 0 ||
        fullRoutePath.length > 0)
    ) {
      const bounds = new window.google.maps.LatLngBounds();

      // Include all points in bounds
      const allPoints = [...completedPath, ...remainingPath, ...fullRoutePath];
      if (allPoints.length > 0) {
        allPoints.forEach((point) => {
          bounds.extend(point);
        });

        // Fit map with padding
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    }
  }, [map, completedPath, remainingPath, fullRoutePath]);

  const onMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  if (loadError) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Error loading Google Maps: {loadError.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  if (!isLoaded) return <div>Loading map...</div>;

  // Prioritize googleMapsRouteInfo start/end over path data
  const sourceLocation =
    shipmentData.googleMapsRouteInfo?.start ||
    shipmentData.path?.find((p) => p.locationType === "SOURCE");
  const destinationLocation =
    shipmentData.googleMapsRouteInfo?.end ||
    shipmentData.path?.find((p) => p.locationType === "DESTINATION");

  // Debug logging for markers
  const sourceValid = !!(
    sourceLocation &&
    sourceLocation.latitude &&
    sourceLocation.longitude
  );
  const destinationValid = !!(
    destinationLocation &&
    destinationLocation.latitude &&
    destinationLocation.longitude
  );

  // COMPREHENSIVE DEBUG LOGGING
  console.log("🔍 SHIPMENT TRACKING MAP DEBUG:", {
    shipmentData,
    sourceLocation,
    destinationLocation,
    sourceValid,
    destinationValid,
    hasGoogleMapsRouteInfo: !!shipmentData.googleMapsRouteInfo,
    hasPath: !!shipmentData.path,
    pathLength: shipmentData.path?.length || 0,
    googleMapsStart: shipmentData.googleMapsRouteInfo?.start,
    googleMapsEnd: shipmentData.googleMapsRouteInfo?.end,
    pathSource: shipmentData.path?.find((p) => p.locationType === "SOURCE"),
    pathDestination: shipmentData.path?.find(
      (p) => p.locationType === "DESTINATION"
    ),
    polylineSourcePoint: polylineSourcePoint
      ? { lat: polylineSourcePoint.lat(), lng: polylineSourcePoint.lng() }
      : null,
    polylineDestinationPoint: polylineDestinationPoint
      ? {
          lat: polylineDestinationPoint.lat(),
          lng: polylineDestinationPoint.lng(),
        }
      : null,
  });

  console.log("🔍 Marker Debug Info:", {
    hasGoogleMapsRouteInfo: !!shipmentData.googleMapsRouteInfo,
    googleMapsStart: shipmentData.googleMapsRouteInfo?.start,
    googleMapsEnd: shipmentData.googleMapsRouteInfo?.end,
    pathData: shipmentData.path,
    sourceLocation,
    destinationLocation,
    sourceValid,
    destinationValid,
    themeConfigSourceIcon: themeConfig.sourceIcon,
    themeConfigDestinationIcon: themeConfig.destinationIcon,
  });

  // Additional logging for marker rendering
  if (sourceValid) {
    console.log(
      "✅ Source marker SHOULD render at:",
      sourceLocation.latitude,
      sourceLocation.longitude
    );
    console.log("🔍 Source marker details:", {
      lat: sourceLocation.latitude,
      lng: sourceLocation.longitude,
      address: shipmentData.shipmentSourceAddress,
      source: shipmentData.googleMapsRouteInfo?.start
        ? "googleMapsRouteInfo"
        : "path",
      iconUrl: themeConfig.sourceIcon,
    });
  } else {
    console.log("❌ Source marker will NOT render - validation failed");
    console.log("🔍 Source validation details:", {
      sourceLocation,
      hasSourceLocation: !!sourceLocation,
      hasLatitude: sourceLocation?.latitude,
      hasLongitude: sourceLocation?.longitude,
      googleMapsStart: shipmentData.googleMapsRouteInfo?.start,
      pathSourceData: shipmentData.path?.find(
        (p) => p.locationType === "SOURCE"
      ),
    });
  }

  if (destinationValid) {
    console.log(
      "✅ Destination marker SHOULD render at:",
      destinationLocation.latitude,
      destinationLocation.longitude
    );
    console.log("🔍 Destination marker details:", {
      lat: destinationLocation.latitude,
      lng: destinationLocation.longitude,
      address: shipmentData.shipmentDestinationAddress,
      source: shipmentData.googleMapsRouteInfo?.end
        ? "googleMapsRouteInfo"
        : "path",
    });
  } else {
    console.log("❌ Destination marker will NOT render - validation failed");
  }

  // Check if we have timeline data but no valid coordinates
  const hasTimelineData =
    shipmentData.timeline?.timelineLocations &&
    shipmentData.timeline.timelineLocations.length > 0;
  const hasValidTimelineCoordinates = hasLiveTracking;
  const showInvalidCoordinatesWarning =
    hasTimelineData && !hasValidTimelineCoordinates;

  return (
    <GoogleMap
      mapContainerStyle={{ height, width }}
      center={{ lat: 20.5937, lng: 78.9629 }} // Default India center
      zoom={10}
      onLoad={onMapLoad}
    >
      {/* Warning message for invalid coordinates */}
      {showInvalidCoordinatesWarning && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            color: "#856404",
            padding: "12px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontSize: "14px",
            maxWidth: "300px",
            zIndex: 1000,
          }}
        >
          <strong>⚠️ Data Notice:</strong>
          <br />
          Timeline data is available but contains invalid GPS coordinates.
          Showing route without live tracking.
        </div>
      )}
      {/* Directions Service - fetch route when needed */}
      {shouldFetchDirections && sourceLocation && destinationLocation && (
        <DirectionsService
          options={{
            destination: {
              lat: destinationLocation.latitude,
              lng: destinationLocation.longitude,
            },
            origin: {
              lat: sourceLocation.latitude,
              lng: sourceLocation.longitude,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
          }}
          callback={directionsCallback}
        />
      )}
      {/* Completed Route (Green) */}
      {completedPath.length > 1 && (
        <Polyline
          path={completedPath}
          options={{
            geodesic: true,
            strokeColor: "#00FF00", // Green for completed
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}
      {/* Remaining Route (Red) */}
      {remainingPath.length > 1 && (
        <Polyline
          path={remainingPath}
          options={{
            geodesic: true,
            strokeColor: "#FF0000", // Red for remaining
            strokeOpacity: 1.0,
            strokeWeight: 4,
          }}
        />
      )}

      {/* Fallback: Full Route (Blue) - when no live tracking but we have route data */}
      {fullRoutePath.length > 1 &&
        completedPath.length === 0 &&
        remainingPath.length === 0 && (
          <Polyline
            path={fullRoutePath}
            options={{
              geodesic: true,
              strokeColor: "#2196F3", // Blue for full route
              strokeOpacity: 1.0,
              strokeWeight: 4,
            }}
          />
        )}

      {/* Source Marker (from polyline) */}
      {polylineSourcePoint && (
        <Marker
          position={polylineSourcePoint}
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

      {/* Destination Marker (from polyline) */}
      {polylineDestinationPoint && (
        <Marker
          position={polylineDestinationPoint}
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

      {/* Source Marker (from path data) - fallback when no polyline */}
      {!polylineSourcePoint && sourceValid && (
        <Marker
          position={{
            lat: sourceLocation.latitude,
            lng: sourceLocation.longitude,
          }}
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

      {/* Destination Marker (from path data) - fallback when no polyline */}
      {!polylineDestinationPoint && destinationValid && (
        <Marker
          position={{
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          }}
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

      {/* Waypoint Markers */}
      {routeWaypoints.map((waypoint, index) => {
        const waypointSource = (window as any).waypointSource || "route_points";

        // Find matching timeline location for better titles
        let timelineLocation: TimelineLocation | undefined = undefined;
        if (shipmentData.timeline?.timelineLocations) {
          timelineLocation = shipmentData.timeline.timelineLocations.find(
            (loc) =>
              Math.abs(loc.latitude - waypoint.lat()) < 0.0001 &&
              Math.abs(loc.longitude - waypoint.lng()) < 0.0001
          );
        }

        // Determine if this is an intermediate stop
        const isIntermediateStop = shipmentData.path?.some(
          (point) =>
            point.locationType === "INTERMEDIATE_STOP" &&
            Math.abs(point.latitude - waypoint.lat()) < 0.0001 &&
            Math.abs(point.longitude - waypoint.lng()) < 0.0001
        );

        // Determine marker properties based on waypoint type
        let title = "";
        let color = "#4285F4";
        let label = "";
        let zIndex = 500;

        if (isIntermediateStop) {
          title = `🚩 Intermediate Stop ${index + 1}`;
          color = "#FF6B35";
          label = "W";
          zIndex = 600;
        } else if (timelineLocation) {
          title = timelineLocation.locationDescription
            ? `📍 ${timelineLocation.locationDescription}`
            : `📍 Timeline Ping ${index + 1}`;
          color = "#03A89E"; // Teal color for timeline pings
          label = "•"; // Small dot for timeline pings
          zIndex = 550;
        } else {
          // Skip rendering if it's neither intermediate stop nor timeline location
          return null;
        }

        return (
          <Marker
            key={`waypoint-${waypointSource}-${index}-${waypoint.lat()}-${waypoint.lng()}`}
            position={waypoint}
            title={title}
            icon={{
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                  <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="6" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
                    ${
                      label
                        ? `<text x="8" y="11" text-anchor="middle" fill="#FFFFFF" font-size="8" font-weight="bold">${label}</text>`
                        : ""
                    }
                  </svg>
                `),
              scaledSize: new window.google.maps.Size(16, 16),
              anchor: new window.google.maps.Point(8, 8),
            }}
            zIndex={zIndex}
          />
        );
      })}
      {/* Current Live Location Marker */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          title={`Current Location (${
            shipmentData.shipmentCompletionPercentage ?? 0
          }% complete)`}
          icon={{
            url: themeConfig.currentLocationIcon,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          }}
          zIndex={1500}
        />
      )}
      {/* Timeline markers are now handled by the waypoint system above */}
    </GoogleMap>
  );
};
