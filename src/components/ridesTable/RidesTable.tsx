import { Button, Chip, Typography } from "@mui/material";
import { useState, useContext } from "react";
import { IRideView, RideEndMethod } from "../../models/RideView";
import { formatDateTime, formatMilliSecondsForDisplay } from "../../utils/DateUtils";
import { formatDistanceInMetersForDisplay, formatRideEndMethodForDisplay } from "../../utils/DisplayUtils";
import GenericTable from "../genericTable/GenericTable";
import HumsaferDialog from "../humsaferDialog/HumsaferDialog";
import styles from "./RidesTable.module.css";
import { generateMapsUrl } from "../../utils/MapsUtils";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";

interface IRidesTableProps {
    rides: IRideView[];
}

const RidesTable: React.FC<IRidesTableProps> = (props) => {
    const { rides } = props;
    const [selectedRide, setSelectedRide] = useState<IRideView>();
    const [selectedRideInfo, setSelectedRideInfo] = useState<IRideView>();
    const { primaryColor } = useContext(HumsaferThemeContext);

    return (
        <>
            <HumsaferDialog
                title="Points Deduction Reason"
                description={selectedRide && (
                    <GenericTable
                        headers={['Reason', 'Points']}
                        data={Object.entries(selectedRide?.rewardDistribution.pointsDeductionReasoningMap)}
                        dataRenderer={(data, column) => {
                            if (column === 0) {
                                return data[0];
                            } else {
                                return data[1]
                            }
                        }}
                    />
                )}
                buttonText={"Okay"}
                isOpen={selectedRide !== undefined}
                closeDialog={() => {
                    setSelectedRide(undefined);
                }}
            />
            <HumsaferDialog
                title="Ride Info"
                description={selectedRideInfo && (
                    <pre>{JSON.stringify(selectedRideInfo, null, 4)}</pre>
                )}
                buttonText={"Close"}
                isOpen={selectedRideInfo !== undefined}
                closeDialog={() => {
                    setSelectedRideInfo(undefined);
                }}
            />
            <div style={{ marginBottom: '20px' }}>
                {/* <Typography 
                    variant="h6" 
                    style={{ 
                        color: primaryColor, 
                        marginBottom: '16px',
                        paddingLeft: '20px',
                        fontSize: '24px',
                        textTransform: 'uppercase',
                        textAlign: 'left',
                    }}
                >
                    Last {rides.length} Rides
                </Typography> */}
                <GenericTable
                    headers={["Start time", "End time", "Duration", "Kms", "Points Earned", "Points Lost", "Level", "Multiplier", "Route", "End Method", "View Ride Info"]}
                    data={rides}
                    onRowClick={(data) => {
                        setSelectedRide(data);
                    }}
                    dataRenderer={(data, column) => {
                    const ride = data;
                    switch (column) {
                        case 0:
                            return formatDateTime(ride.rideStartTime);
                        case 1:
                            return formatDateTime(ride.rideEndTime);
                        case 2:
                            return formatMilliSecondsForDisplay(ride.rideDurationInMilliSeconds);
                        case 3:
                            return formatDistanceInMetersForDisplay(ride.distanceTravelledInMetres);
                        case 4:
                            return ride.rewardDistribution.awardedStarPoints;
                        case 5:
                            return `${ride.rewardDistribution.maxAwardableStarPoints - ride.rewardDistribution.awardedStarPoints}`;
                        case 6:
                            return ride.level?.level ?? "-";
                        case 7:
                            return ride.level?.pointsMultiplier ? `1km = ${ride.level?.pointsMultiplier} points` : "-";
                        case 8:
                            return (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        let waypointsList = Object.values(ride.periodicInfo.epochToCoordinateMap ?? {});
                                        let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ride.rideStartLatitude},${ride.rideStartLongitude}&destination=${ride.rideEndLatitude},${ride.rideEndLongitude}&travelmode=driving&waypoints=`;

                                        window.open(generateMapsUrl(waypointsList, mapsUrl), '_blank', 'noreferrer');
                                    }}
                                >
                                    View Route
                                </Button>
                            );
                        case 9:
                            const variant = ride.rideEndMethod === RideEndMethod.MANUAL ? "filled" : "outlined";
                            let chipStyle: string | undefined;
                            switch (ride.rideEndMethod) {
                                case RideEndMethod.AUTO:
                                case RideEndMethod.AUTO_LOW_LOCATION_MOVEMENTS:
                                    chipStyle = styles.ridesTable_chipStyleYellow;
                                    break;
                                case RideEndMethod.AUTO_NO_LOCATION_UPDATES:
                                    chipStyle = styles.ridesTable_chipStyleRed;
                                    break;
                            }
                            return (
                                <Chip
                                    label={formatRideEndMethodForDisplay(ride.rideEndMethod)}
                                    variant={variant}
                                    className={chipStyle}
                                />
                            );

                        case 10:
                            return (<Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRideInfo(ride)
                                }}
                            >
                                Ride Info
                            </Button>)
                    }
                }}
                />
            </div>
        </>
    )
}

export default RidesTable;
