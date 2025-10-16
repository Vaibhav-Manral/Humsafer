import { ILiveLocationRecord } from "../../models/LiveLocationRecordView";
import { formatTimestamp } from "../../utils/DateUtils";
import HumsaferDialog from '../humsaferDialog/HumsaferDialog';
import GenericTable from '../genericTable/GenericTable';
import { useCallback, useEffect, useState } from "react";
import { getCompleteTimelineForShipment } from "../../api/ShipmentDetailsApi";
import { HumsaferError } from "../../models/HumsaferError";
import { Loading } from "../loading/Loading";
import { ICompany } from "../../models/Companies";
import Toast, { IToastBasicProps } from "../Toast/Toast";

interface IShipmentTimelineDialogProps {
    show: boolean;
    setTimelineDialog: (boolean: boolean) => void;
    closeDialog: (boolean: boolean) => void;
    selectedCompany?: ICompany;
    shipmentId?: string;
}

const ShipmentTimelineDialog: React.FC<IShipmentTimelineDialogProps> = (props) => {
    const { show, setTimelineDialog, selectedCompany, shipmentId } = props;    
    const [isLoadingTimelineData, setIsLoadingTimelineDate] = useState(false);
    const [completeShipmentTimelineData, setCompleteShipmentTimelineData] = useState<ILiveLocationRecord[]>([]);

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
    
    const getShipmentTimeline = useCallback(async () => {
        setIsLoadingTimelineDate(true);
        const responseOrError = await getCompleteTimelineForShipment(selectedCompany?.id ?? "", shipmentId ?? "");
        setIsLoadingTimelineDate(false);
        
        if (responseOrError instanceof HumsaferError) {
            setShowToast({
                open: true,
                message: responseOrError.message,
                type: "error"
            });
            return;
        }

        setCompleteShipmentTimelineData(responseOrError);
    }, [setCompleteShipmentTimelineData, selectedCompany?.id, shipmentId])

    useEffect(() => {
        getShipmentTimeline();
    }, [getShipmentTimeline]);
    
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
                closeDialog={() => setTimelineDialog(false)}
                title="Complete Shipment Timeline"
                buttonText={'Okay'}
                description={(
                    <>
                        {
                            isLoadingTimelineData ? (
                                <Loading isLoading />
                            ) : (
                                <GenericTable
                                    headers={["Address", "Latitude", "Longitude", "Last Updated Time", "Battery Percentage"]}
                                    data={completeShipmentTimelineData}
                                    dataRenderer={(data, column) => {
                                        const view = data;
                                        switch (column) {
                                            case 0:
                                                const subLocality = view.address?.subLocality || '';
                                                const locality = view.address?.locality || '';
                                                const adminArea = view.address?.adminArea || '';
                                                return [subLocality, locality, adminArea].filter(Boolean).join(', ');
                                            case 1:
                                                return view.lat;
                                            case 2:
                                                return view.lng;
                                            case 3:
                                                return formatTimestamp(parseInt(view.lastUpdated, 10));
                                            case 4:
                                                return <span>{view.currentBatteryPercent} %</span>;
                                        }
                                    }}
                                />
                            )
                        }
                    </>
                )}
            />
        </>
    );
}

export default ShipmentTimelineDialog;
