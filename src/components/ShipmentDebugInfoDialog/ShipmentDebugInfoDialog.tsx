import HumsaferDialog from '../humsaferDialog/HumsaferDialog';
import { useCallback, useEffect, useState } from "react";
import { getDebugInfoForShipment } from "../../api/ShipmentDetailsApi";
import { HumsaferError } from "../../models/HumsaferError";
import { ICompany } from "../../models/Companies";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import { IShipmentDebugInfo } from "../../models/ShipmentDebugInfoView";
import { Loading } from '../loading/Loading';
import GenericTable from '../genericTable/GenericTable';
import { formatDateTime, formatMilliSecondsForDisplay } from "../../utils/DateUtils";
import { formatDistanceInMetersForDisplay, formatDistance } from '../../utils/DisplayUtils';
import { Button, Grid } from '@mui/material';
import { generateMapsUrl } from '../../utils/MapsUtils';

interface IShipmentDebugInfoDialogProps {
    show: boolean;
    setDebugInfoDialog: (boolean: boolean) => void;
    closeDialog: (boolean: boolean) => void;
    selectedCompany?: ICompany;
    shipmentId?: string;
}

const ShipmentDebugInfoDialog: React.FC<IShipmentDebugInfoDialogProps> = (props) => {
    const { show, setDebugInfoDialog, selectedCompany, shipmentId } = props;    
    const [isLoadingDebugInfoData, setIsLoadingDebugInfoData] = useState(false);
    const [completeShipmentDebugInfoData, setCompleteShipmentDebugInfoData] = useState<IShipmentDebugInfo>();

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
    
    const getShipmentDebugInfo = useCallback(async () => {
        setIsLoadingDebugInfoData(true);
        const responseOrError = await getDebugInfoForShipment(selectedCompany?.id ?? "", shipmentId ?? "");
        setIsLoadingDebugInfoData(false);
        
        if (responseOrError instanceof HumsaferError) {
            setShowToast({
                open: true,
                message: responseOrError.message,
                type: "error"
            });
            return;
        }
        
        setCompleteShipmentDebugInfoData(responseOrError);
    }, [setCompleteShipmentDebugInfoData, selectedCompany?.id, shipmentId])

    useEffect(() => {
        getShipmentDebugInfo();
    }, [getShipmentDebugInfo]);
    
    return (
        <>
            <Toast
                message={showToast.message}
                open={showToast.open}
                onClose={handleToastClose}
                type={showToast.type}
            />
            <HumsaferDialog
                isOpen={show}
                closeDialog={() => setDebugInfoDialog(false)}
                title="Complete Shipment Debug Information"
                buttonText={'Okay'}
                description={(
                    <>
                        {isLoadingDebugInfoData ? (
                                <Loading isLoading />
                            ) : (
                                <>
                                <Grid container spacing={2} padding={2}>
                                    <Grid item>
                                        <div>
                                            <span style={{ fontWeight: 'bold' }}>Drive Mode Distance:</span>{' '}
                                            {formatDistance(completeShipmentDebugInfoData?.driveModeDistance)}
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <div>
                                            <span style={{ fontWeight: 'bold' }}>Track Mode Distance:</span>{' '}
                                            {formatDistance(completeShipmentDebugInfoData?.trackModeDistance)}
                                        </div>
                                    </Grid>
                                </Grid>
                                
                                {completeShipmentDebugInfoData?.rideViewList && (
                                    <GenericTable
                                    headers={["Start Time", "End Time", "Duration (Drive Mode)", "Distance (Drive Mode)", "View Route"]}
                                    data={completeShipmentDebugInfoData?.rideViewList}
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
                                                return (
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                    
                                                            let waypointsList = Object.values(ride.periodicInfo.epochToCoordinateMap ?? {});
                                                            let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ride.rideStartLatitude},${ride.rideStartLongitude}&destination=${ride.rideEndLatitude},${ride.rideEndLongitude}&travelmode=driving&waypoints=`;
                    
                                                            window.open(generateMapsUrl(waypointsList, mapsUrl), '_blank', 'noreferrer');
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                );
                                        }
                                    }}
                                    />
                                )}
                                
                                </>
                            )
                        }
                    </>
                )}
            />
        </>
    );
}

export default ShipmentDebugInfoDialog;
