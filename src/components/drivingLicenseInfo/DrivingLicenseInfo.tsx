import { Card, CardActionArea, CardContent, Grid } from "@mui/material";
import { useContext, useState } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { displayStringForVerificationStatus, IDrivingLicenseView } from "../../models/DrivingLicenseView";
import { formatDate } from "../../utils/DateUtils";
import { covListFromDrivingLicense } from "../../utils/DisplayUtils";
import DrivingLicenseVerificationModal from "../drivingLicenseVerificationModal/DrivingLicenseVerificationModal";
import styles from "./DrivingLicenseInfo.module.css";

export interface IDrivingLicenseInfoProps {
    drivingLicense: IDrivingLicenseView | undefined;
    refreshDL?: (successMessage?: string) => void
    allowVerification: boolean;
}

const DrivingLicenseInfo: React.FC<IDrivingLicenseInfoProps> = (props) => {
    const {
        drivingLicense,
        allowVerification,
        refreshDL = () => { }
    } = props;
    const { primaryColor } = useContext(HumsaferThemeContext);
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            {!drivingLicense && (
                <Card className={styles.drivingLicenseInfo_container}>
                    <div className={styles.drivingLicenseInfo_headingConatiner}>
                        <div className={styles.drivingLicenseInfo_title} style={{ color: primaryColor }}>Driving License Info</div>
                    </div>
                    <CardContent>
                        <Grid container className={styles.drivingLicenseInfo_row}>
                            <Grid item md={12}>
                                No driving license found for user
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
            {drivingLicense && (
                <>
                    {showModal && (
                        <DrivingLicenseVerificationModal
                            drivingLicense={drivingLicense}
                            onClose={(forceRefresh, successMessage) => {
                                setShowModal(false);
                                if (forceRefresh) {
                                    refreshDL(successMessage);
                                }
                            }}
                            allowVerification={allowVerification}
                        />
                    )}
                    <Card className={styles.drivingLicenseInfo_container}>
                        <CardActionArea onClick={() => setShowModal(true)}>
                            <div className={styles.drivingLicenseInfo_headingConatiner}>
                                <div className={styles.drivingLicenseInfo_title} style={{ color: primaryColor }}>Driving License Info</div>
                            </div>
                            <CardContent>
                                <Grid container spacing={2} className={styles.drivingLicenseInfo_row}>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Driving License Name</div>
                                        <div className={styles.drivingLicenseInfo_value}>{drivingLicense.name ?? "-"}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Driving License Number</div>
                                        <div className={styles.drivingLicenseInfo_value}>{drivingLicense.drivingLicenseNumber}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Driving License Added on</div>
                                        <div className={styles.drivingLicenseInfo_value}>{formatDate(drivingLicense.creationTime)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Date of Birth</div>
                                        <div className={styles.drivingLicenseInfo_value}>{drivingLicense.dateOfBirth ? formatDate(drivingLicense.dateOfBirth, "DD-MM-yyyy") : "-"}</div>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} className={styles.drivingLicenseInfo_row}>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>COVs</div>
                                        <div className={styles.drivingLicenseInfo_value}>{covListFromDrivingLicense(drivingLicense)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Verified Status</div>
                                        <div className={styles.drivingLicenseInfo_value}>{displayStringForVerificationStatus(drivingLicense.verifiedStatus)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Verified on</div>
                                        <div className={styles.drivingLicenseInfo_value}>{formatDate(drivingLicense.verificationTime)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.drivingLicenseInfo_label}>Verified By</div>
                                        <div className={styles.drivingLicenseInfo_value}>{drivingLicense.verifiedBy ?? "-"}</div>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </>
            )}
        </>
    );
}

export default DrivingLicenseInfo;
