import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./ShipmentDetails.module.css";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
// import { Config } from "../../utils/Config";
import { ILocation } from "../../models/ShipmentDetailsView";
import { IFuelingStopsInfo } from "../../models/FuelOptimazationResponse";
import { ICompany } from "../../models/Companies";
import { getCurrentLocationForShipment } from "../../api/ShipmentDetailsApi";
import { ICurrentLocationData } from "../../models/CurrentLocationResponse";
import { HumsaferError } from "../../models/HumsaferError";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button, Tooltip } from "@mui/material";
import { ShipmentStatus } from "../../models/ShipmentsView";
import { formatTimestamp } from "../../utils/DateUtils";
import { Auth } from "../../utils/Auth";
import { useGoogleMaps } from "../../utils/GoogleMapsSingleton";
// const libraries: ("places")[] = ["places"];

interface ShipmentDetails {
  path?: Location[];
  timeline?: {
    timelineLocations?: ILocation[];
  };
  assignedDriverUserId: string | undefined;
  status: ShipmentStatus;
}
interface Location {
  latitude: number;
  longitude: number;
  locationType?: string;
  fuelToBeAdded?: number;
  timestamp?: number;
}
interface DirectionMapRouteProps {
  shipmentDetails: ShipmentDetails;
  showFuelPlan: boolean;
  fuelingStopsInfo: IFuelingStopsInfo | undefined;
  selectedCompany?: ICompany;
  shipmentId?: string;
}

interface DriverData {
  latitude: number;
  longitude: number;
  lastUpdated: number;
  liveLocationSource: string;
}

const DirectionMapRoute: React.FC<DirectionMapRouteProps> = (data) => {
  const shipmentDetails = data.shipmentDetails;
  const showFuelPlan = data.showFuelPlan;
  const fuelingStopsInfo = data.fuelingStopsInfo;
  const shipmentId = data.shipmentId;
  const selectedCompany = data.selectedCompany;
  const {
    sourceIcon,
    destinationIcon,
    intermediateIcon,
    fuelStopIcon,
    currentLocationIcon,
  } = useContext(HumsaferThemeContext);
  const [directions, setDirections] = useState(null);
  // const mapKey = Config.getInstance().getMapKeyConfig();
  const [key, setKey] = useState(0);
  const [currentDriverData, setCurrentDriverData] = useState<DriverData | null>(
    null
  );

  const markerRef = useRef<google.maps.Marker | null>(null); // Marker reference // Reference to store the marker instance

  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const getCurrentlocaiton = useCallback(async () => {
    let companyId = "";
    const userSettings = Auth.getInstance().getUserSettings();
    if (userSettings?.id) {
      companyId = userSettings.id;
    }
    const responseOrError = await getCurrentLocationForShipment(
      selectedCompany?.id ?? companyId,
      shipmentId ?? ""
    );

    if (responseOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: responseOrError.message,
        type: "error",
      });
    } else {
      const { latitude, longitude } = responseOrError as ICurrentLocationData;

      if (!mapRef.current) return;
      const mapInstance = mapRef.current.state.map;
      if (!mapInstance) return;

      const updateCurrentLocationMarker = () => {
        if (markerRef.current) {
          // Update position of existing marker
          markerRef.current.setPosition({ lat: latitude, lng: longitude });
        } else {
          // Create new marker
          markerRef.current = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstance,
            icon: currentLocationIcon,
            title: `Driver's location`,
          });
        }
      };

      // Show marker on the UI
      updateCurrentLocationMarker();

      // Update state with current driver data
      setCurrentDriverData(responseOrError as ICurrentLocationData);
    }
  }, [selectedCompany?.id, shipmentId, currentLocationIcon]);

  const mapRef = useRef<GoogleMap | null>(null);
  const { isLoaded } = useGoogleMaps();
  // const { isLoaded } = useJsApiLoader({
  //     id: 'google-map-script',
  //     googleMapsApiKey: mapKey,
  //     libraries: libraries
  // });

  const directionsCallback = useCallback((response) => {
    if (response !== null) {
      if (response.status === "OK") {
        setDirections(response);
      }
    }
  }, []);

  const wayPointsData =
    shipmentDetails?.timeline?.timelineLocations &&
    shipmentDetails?.timeline?.timelineLocations.length > 0
      ? (shipmentDetails?.path || []).concat(
          shipmentDetails?.timeline?.timelineLocations
            .filter((location) => location.shouldDisplayInMap === true)
            .map((location) => ({
              ...location,
              locationType:
                (location as any).locationType || "INTERMEDIATE_STOP",
            }))
        )
      : shipmentDetails?.path || [];

  const findNearestWaypoints = (
    path?: Location[],
    waypoints?: Location[]
  ): Location[] => {
    const source = path?.[0];
    const destination = path?.[1];
    if (!source || !destination) return [];
    const sortedWaypoints = (waypoints || [])
      .filter((waypoint) => waypoint.locationType === "INTERMEDIATE_STOP")
      .sort((a, b) => {
        const aTimestamp = a?.timestamp || 0;
        const bTimestamp = b?.timestamp || 0;

        return aTimestamp - bTimestamp;
      });

    return sortedWaypoints;
  };

  const sortedWaypoints =
    shipmentDetails && shipmentDetails.path
      ? findNearestWaypoints(shipmentDetails?.path, wayPointsData)
      : [];

  const fuelStopLocations: Location[] =
    fuelingStopsInfo?.fuelingStops?.map((stop) => ({
      latitude: stop.coordinates.latitude,
      longitude: stop.coordinates.longitude,
      locationType: "FUELING_STOP",
    })) ?? [];

  const balancedWaypoints =
    sortedWaypoints.length > 0
      ? sortedWaypoints.concat(fuelStopLocations)
      : fuelStopLocations;
  const markerPointsData =
    balancedWaypoints && balancedWaypoints.length > 0
      ? (shipmentDetails?.path || []).concat(
          balancedWaypoints.map((location) => ({
            ...location,
            locationType: (location as any).locationType || "INTERMEDIATE_STOP",
          }))
        )
      : shipmentDetails?.path || [];

  const addMarkers = () => {
    if (!mapRef.current) return;
    const mapInstance = mapRef.current.state.map;
    if (!mapInstance) return;

    const addLocationMarkers = () => {
      if (!markerPointsData || showFuelPlan) return;

      markerPointsData
        .filter((location) => location.locationType !== "FUELING_STOP")
        .forEach((location) => {
          let icon;
          switch (location.locationType) {
            case "SOURCE":
              icon = { url: sourceIcon };
              break;
            case "INTERMEDIATE_STOP":
              icon = { url: intermediateIcon };
              break;
            case "DESTINATION":
              icon = { url: destinationIcon };
              break;
            default:
              icon = { url: destinationIcon };
          }

          return new window.google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: mapInstance,
            icon,
            title: location.locationType,
          });
        });
    };

    const addFuelStopMarkers = () => {
      if (!fuelingStopsInfo || !showFuelPlan) return;

      const sourceLocation = markerPointsData.find(
        (location) => location.locationType === "SOURCE"
      );
      if (sourceLocation) {
        new window.google.maps.Marker({
          position: {
            lat: sourceLocation.latitude,
            lng: sourceLocation.longitude,
          },
          map: mapInstance,
          icon: { url: sourceIcon },
          title: sourceLocation.locationType,
        });
      }

      const destinationLocation = markerPointsData.find(
        (location) => location.locationType === "DESTINATION"
      );
      if (destinationLocation) {
        new window.google.maps.Marker({
          position: {
            lat: destinationLocation.latitude,
            lng: destinationLocation.longitude,
          },
          map: mapInstance,
          icon: { url: destinationIcon },
          title: destinationLocation.locationType,
        });
      }

      // Add fuel stop markers
      fuelingStopsInfo.fuelingStops.slice(0, -1).forEach((fuelStop) => {
        new window.google.maps.Marker({
          position: {
            lat: fuelStop.coordinates.latitude,
            lng: fuelStop.coordinates.longitude,
          },
          map: mapInstance,
          icon: { url: fuelStopIcon },
          title: "Fuel Stop",
        });
      });
    };

    addLocationMarkers();
    addFuelStopMarkers();
  };

  useEffect(() => {
    setDirections(null);
    setKey((key) => key + 1);
  }, [showFuelPlan, fuelingStopsInfo]);

  return (
    <div>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      <div className={styles.shipment_details_map_box}>
        {shipmentDetails?.path && isLoaded ? (
          <>
            {(shipmentDetails?.status === ShipmentStatus.CREATED ||
              shipmentDetails?.status === ShipmentStatus.IN_TRANSIT) && (
              <Tooltip
                children={
                  <Button
                    variant="text"
                    className={styles.driver_location_refresh}
                    onClick={() => getCurrentlocaiton()}
                  >
                    <RefreshIcon />
                    Driver location
                  </Button>
                }
                title={formatTimestamp(currentDriverData?.lastUpdated)}
              />
            )}
            <GoogleMap
              key={key}
              ref={mapRef}
              onLoad={addMarkers}
              mapContainerStyle={{
                width: "100%",
                height: "550px",
              }}
              center={{
                lat: 21.1458,
                lng: 79.0882,
              }}
              zoom={8}
              options={{
                mapTypeId: "roadmap",
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              {directions === null && (
                <DirectionsService
                  options={{
                    origin: {
                      lat: shipmentDetails?.path[0].latitude,
                      lng: shipmentDetails?.path[0].longitude,
                    },
                    destination: {
                      lat: shipmentDetails?.path[
                        shipmentDetails?.path.length - 1
                      ].latitude,
                      lng: shipmentDetails?.path[
                        shipmentDetails?.path.length - 1
                      ].longitude,
                    },
                    waypoints: balancedWaypoints.map((location) => ({
                      location: {
                        lat: location.latitude,
                        lng: location.longitude,
                      },
                      stopover: true,
                    })),
                    travelMode: window.google.maps.TravelMode.DRIVING,
                    provideRouteAlternatives: false,
                    optimizeWaypoints: true,
                  }}
                  callback={directionsCallback}
                />
              )}
              {directions && (
                <DirectionsRenderer
                  options={{
                    directions: directions,
                    suppressMarkers: true,

                    polylineOptions: {
                      strokeColor: "#4A89F3",
                      strokeWeight: 5,
                    },
                  }}
                />
              )}
            </GoogleMap>
          </>
        ) : null}
      </div>
    </div>
  );
};
export default DirectionMapRoute;
