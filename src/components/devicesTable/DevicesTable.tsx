import Card from "@mui/material/Card";
import { IDeviceData } from "../../models/GetUserInfoResponse";
import { formatDateTime } from "../../utils/DateUtils";
import GenericTableWithTitle from "../genericTable/GenericTableWithTitle";
import CardContent from "@mui/material/CardContent";
import { useContext, useState } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import styles from "./DevicesTable.module.css";
import { Button } from "@mui/material";
import { Loading } from "../loading/Loading";
import { IDriverProfile } from "../../models/DriverProfile";
import { submitDriverDevicesRefreshRequest } from "../../api/Drivers";
import { HumsaferError } from "../../models/HumsaferError";
import { ToastContainer, toast } from "react-toastify";
import HumsaferDialog from "../humsaferDialog/HumsaferDialog";

interface IDevicesTableProps {
    devices: IDeviceData[];
    driverProfile: IDriverProfile;
}

const DevicesTable: React.FC<IDevicesTableProps> = (props) => {
    const { devices, driverProfile } = props;
    const { primaryColor } = useContext(HumsaferThemeContext);
    const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);
    const [selectedDeviceForPermissions, setSelectedDeviceForPermissions] = useState<IDeviceData>();

    const submitRefreshDevicesRequest = async () => {
        setIsRefreshingDevices(true);
        const response = await submitDriverDevicesRefreshRequest(driverProfile.mobileNumber)
        setIsRefreshingDevices(false);
        if (response instanceof HumsaferError) {
            toast.error(response.getErrorMessage())
        } else {
            toast.success("Refresh request has been sent. Data typically updates within 5 mins.")
        }
    }
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <HumsaferDialog
                title="Permissions Info"
                description={selectedDeviceForPermissions && (
                    <>
                        {selectedDeviceForPermissions.grantedPermissions && (
                            <GenericTableWithTitle
                                title="Granted Permissions"
                                headers={['Name']}
                                data={selectedDeviceForPermissions.grantedPermissions}
                                dataRenderer={(dataRow) => {
                                    return dataRow;
                                }}
                            />
                        )}

                        {selectedDeviceForPermissions.pendingPermissions && (
                            <GenericTableWithTitle
                                title="Pending Permissions"
                                headers={['Name']}
                                data={selectedDeviceForPermissions.pendingPermissions}
                                dataRenderer={(dataRow) => {
                                    return dataRow;
                                }}
                            />
                        )}
                    </>
                )}
                buttonText={"Okay"}
                isOpen={selectedDeviceForPermissions !== undefined}
                closeDialog={() => {
                    setSelectedDeviceForPermissions(undefined);
                }}
            />
            <Card className={styles.devicesTable__container}>
                <div className={styles.devicesTable__headingConatiner}>
                    <div className={styles.devicesTable__title} style={{ color: primaryColor }}>Device Info</div>
                    <Button
                        className={styles.submitButton}
                        variant="contained"
                        onClick={() => submitRefreshDevicesRequest()}>
                        <Loading text="Submit Device Refresh request" isLoading={isRefreshingDevices} />
                    </Button>
                </div>
                <CardContent>
                    <GenericTableWithTitle
                        title={`Devices`}
                        headers={["Model", "Name", "Type", "OS Version", "App version", "Last Updated on", "App Identifier", "Permissions"]}
                        data={devices}
                        isLoading={false}
                        dataRenderer={(dataRow, column) => {
                            const device = dataRow;
                            switch (column) {
                                case 0:
                                    return device.model;
                                case 1:
                                    return device.name;
                                case 2:
                                    return device.type;
                                case 3:
                                    return device.osVersion;
                                case 4:
                                    return device.appVersion;
                                case 5:
                                    return formatDateTime(device.lastUpdated);
                                case 6:
                                    return device.appIdentifier;
                                case 7:
                                    if (!device.grantedPermissions && !device.pendingPermissions) {
                                        return "No permissions synced";
                                    }
                                    return (
                                        <Button
                                        className={styles.permissionsButton}
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDeviceForPermissions(device);
                                            }}
                                        >View Permissions</Button>
                                    );
                            }
                        }}
                    />
                </CardContent>
            </Card>
        </>
    )
}

export default DevicesTable
