import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material';
import { AppHealth, IShipment } from '../../models/ShipmentsView';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppBlockingIcon from '@mui/icons-material/AppBlocking';
import MobileOffIcon from '@mui/icons-material/MobileOff';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import styles from "./ActiveShipmentInfo.module.css";

interface IShipmentInfoProps {
  shipmentData: IShipment;
}

const ActiveShipmentInfo: React.FC<IShipmentInfoProps> = ({ shipmentData }) => {

    const renderAppHealthIcon = (appHealth: AppHealth) => {
        switch (appHealth) {
            case AppHealth.HEALTHY:
                return (<div>
                    <Tooltip children={<CheckCircleIcon className={styles.shipment_details_app_status_healthy} />} title={"Healthy"} />
                </div>);
            case AppHealth.PERMISSIONS_PENDING:
                return (<div>
                    <Tooltip children={<AppBlockingIcon className={styles.shipment_details_app_status_unhealthy} />} title={"Permissions pending"} />
                </div>);

            case AppHealth.APP_NOT_INSTALLED:
                return (<div>
                    <Tooltip children={<MobileOffIcon className={styles.shipment_details_app_status_unhealthy} />} title={"App not installed"} />
                </div>);
            case AppHealth.APP_UPDATE_REQUIRED:
                return (<div>
                    <Tooltip children={<UpgradeIcon className={styles.shipment_details_app_status_unhealthy} />} title={"App update required"} />
                </div>);
        }
    };    

    return (
    <TableContainer component={Paper}>
        <Table aria-label="shipment information">
            <TableHead>
            <TableRow>
                <TableCell>Driver Name</TableCell>
                <TableCell>Vehicle Number</TableCell>
                <TableCell>App Health</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            <TableRow>
                <TableCell>{shipmentData.driverName}</TableCell>
                <TableCell>{shipmentData.vehicleNumber}</TableCell>
                <TableCell>
                        {renderAppHealthIcon(shipmentData.appHealth)}
                </TableCell>
            </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
  );
};

export default ActiveShipmentInfo;
