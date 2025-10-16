import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { Config } from "../../utils/Config";

interface RouteMapProps {
  polyline: Array<{ lat: number; lng: number }>;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const RouteMap: React.FC<RouteMapProps> = ({ polyline }) => {
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      setMapLoaded(true);

      const bounds = new window.google.maps.LatLngBounds();
      polyline.forEach((point) => {
        bounds.extend(point);
      });
      boundsRef.current = bounds;
      mapInstance.fitBounds(bounds);
    },
    [polyline]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
    setMapLoaded(false);
  }, []);

  const startPoint = polyline[0];
  const endPoint = polyline[polyline.length - 1];

  return (
    <LoadScript
      googleMapsApiKey={Config.getInstance().getMapKeyConfig()}
      libraries={["geometry"]}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={startPoint}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {mapLoaded && (
          <>
            {/* Start Marker */}
            <Marker
              position={startPoint}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />

            {/* End Marker */}
            <Marker
              position={endPoint}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />

            {/* Route Polyline */}
            <Polyline
              path={polyline}
              options={{
                strokeColor: "#4A89F3",
                strokeOpacity: 1.0,
                strokeWeight: 4,
                geodesic: true,
                editable: false,
                draggable: false,
              }}
            />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default RouteMap;
