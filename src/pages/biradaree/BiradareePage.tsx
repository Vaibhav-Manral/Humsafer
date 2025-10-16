import { Grid } from "@mui/material";
import React, { useState } from "react";
import { getUserBiradareeInfo } from "../../api/Drivers";
import BiradareeInfo from "../../components/biradareeInfo/BiradareeInfo";
import DriverSearch from "../../components/driverSearch/DriverSearch";
import DrivingLicenseInfo from "../../components/drivingLicenseInfo/DrivingLicenseInfo";
import { IDrivingLicenseView } from "../../models/DrivingLicenseView";
import { HumsaferError } from "../../models/HumsaferError";
import { IInsuranceView } from "../../models/InsuranceView";
import styles from "./BiradareePage.module.css";

const BiradareePage: React.FC = React.memo(() => {
    const [biradareeInfo, setBiradareeInfo] = useState<IInsuranceView>();
    const [drivingLicense, setDrivingLicense] = useState<IDrivingLicenseView>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    const onSearchBiradareeInfo = async (phoneNumber: string) => {
        setBiradareeInfo(undefined);
        setIsLoading(true);
        setErrorMessage(undefined)
        const biradareeInfo = await getUserBiradareeInfo(phoneNumber)
        setIsLoading(false);
        if (biradareeInfo instanceof HumsaferError) {
            setErrorMessage(biradareeInfo.getErrorMessage())
        } else {
            setBiradareeInfo(biradareeInfo.biradareeInsuranceView);
            setDrivingLicense(biradareeInfo.drivingLicenseView);
        }
    }

    return (
        <div>
            <DriverSearch
                onSearchSumbit={onSearchBiradareeInfo}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
            {biradareeInfo && (
                <Grid container>
                    <Grid className={styles.biradaree_componentContainer} item lg={12} md={12} xs={12}>
                        <BiradareeInfo biradareeInsuranceView={biradareeInfo} />
                    </Grid>

                    <Grid className={styles.biradaree_componentContainer} item lg={12} md={12} xs={12}>
                        <DrivingLicenseInfo drivingLicense={drivingLicense} allowVerification={false} />
                    </Grid>
                </Grid>
            )}
        </div>
    );
});

export default BiradareePage;
