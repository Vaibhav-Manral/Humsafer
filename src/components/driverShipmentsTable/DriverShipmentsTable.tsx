import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { formatTimestamp } from "../../utils/DateUtils";
import GenericTable from "../genericTable/GenericTable";
import { IBasicShipmentView } from "../../models/analyse";
import styles from "./DriverShipmentsTable.module.css";
import { useContext, useState } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Loading } from "../loading/Loading";

interface IShipmentsTableProps {
    shipments: IBasicShipmentView[];
    requestCompanySwitch: (companyId: string, callback: () => void) => void;
}

const DriverShipmentsTable: React.FC<IShipmentsTableProps> = (props) => {
    const { shipments, requestCompanySwitch } = props;
    const { primaryColor } = useContext(HumsaferThemeContext);
    const { selectedCompany } = useContext(CompanyDataContext);
    const [loadingStates, setLoadingStates] = useState<{ [shipmentId: string]: boolean }>({});

    const goToShipmentDetailsPage = (shipmentId: string) => {
        window.open(`/shipments/${shipmentId}`, '_blank');
    }

    const handleSwitchCompanyAndView = async (companyId: string, shipmentId: string) => {
        setLoadingStates(prevStates => ({
            ...prevStates,
            [shipmentId]: true,
        }));
        
        await requestCompanySwitch(companyId, () => {
            setLoadingStates(prevStates => ({
                ...prevStates,
                [shipmentId]: false,
            }));
            goToShipmentDetailsPage(shipmentId);
        });
    }

    return (
        <>
            {!shipments && (
                <Card className={styles.driverShipmentsInfo_container}>
                    <div className={styles.driverShipmentsInfo_headingConatiner}>
                        <div className={styles.driverShipmentsInfo_title} style={{ color: primaryColor }}>Last Shipments</div>
                    </div>
                    <CardContent>
                        <Grid container className={styles.driverShipmentsInfo_row}>
                            <Grid item md={12}>
                                No shipments found for the driver
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
            {shipments && (
                <div style={{ marginBottom: '20px' }}>
                    {/* <Typography 
                        variant="h6" 
                        style={{ 
                            color: primaryColor, 
                            marginBottom: '16px',
                            paddingLeft: '20px',
                            fontSize: 'medium'
                        }}
                    >
                        Last {shipments.length} Shipments
                    </Typography> */}
                    <GenericTable
                        headers={["Company", "Shipment ID", "Truck No.", "From", "To", "Started On", "Completed On", "View Shipment Info"]}
                        data={shipments}
                        dataRenderer={(data, column) => {
                        const shipment = data;
                        switch (column) {
                            case 0:
                                return shipment.companyName;
                            case 1:
                                return shipment.shipmentVanityId;
                            case 2:
                                return shipment.vehicleNo;
                            case 3:
                                return shipment.sourceCity;
                            case 4:
                                return shipment.destinationCity;
                            case 5:
                                return formatTimestamp(shipment.shipmentStartDate);
                            case 6:
                                return formatTimestamp(shipment.shipmentEndDate);
                            case 7:
                                return (
                                    <Button
                                    className={styles.viewButton}
                                      type="button"
                                      variant="outlined"
                                      onClick={() =>
                                        selectedCompany?.id === shipment.companyId
                                          ? goToShipmentDetailsPage(shipment.shipmentId)
                                          : handleSwitchCompanyAndView(shipment.companyId, shipment.shipmentId)
                                      }
                                    >
                                      {selectedCompany?.id === shipment.companyId ? "View" : <Loading text="Switch Company and View" isLoading={loadingStates[shipment.shipmentId]} />}
                                    </Button>
                                );                      
                        }
                    }}
                    />
                </div>
            )}
        </>
    )
}

export default DriverShipmentsTable;
