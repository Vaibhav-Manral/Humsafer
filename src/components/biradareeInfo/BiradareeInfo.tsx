import { Card, CardContent, Grid } from "@mui/material";
import { useContext } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { IInsuranceView } from "../../models/InsuranceView";
import { formatDateTime, googleMapLinkForLatLong } from "../../utils/DateUtils";
import styles from "./BiradareeInfo.module.css";

interface IBiradareeInfoProps {
    biradareeInsuranceView: IInsuranceView;
}

const BiradareeInfo: React.FC<IBiradareeInfoProps> = (props) => {
    const { biradareeInsuranceView } = props;
    const { primaryColor } = useContext(HumsaferThemeContext);

    let googleMapsLink: string | undefined;
    if (biradareeInsuranceView.onboardingLatitude && biradareeInsuranceView.onboardingLongitude) {
        googleMapsLink = googleMapLinkForLatLong(biradareeInsuranceView.onboardingLatitude, biradareeInsuranceView.onboardingLongitude);
    }

    return (
        <Card className={styles.biradareeInfo_container}>
            <div className={styles.biradareeInfo_headingConatiner}>
                <div className={styles.biradareeInfo_title} style={{ color: primaryColor }}>Biradaree Insurance Info</div>
            </div>
            <CardContent>
                <Grid container spacing={2} className={styles.biradareeInfo_row}>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>Enrolled</div>
                        <div className={styles.biradareeInfo_value}>{biradareeInsuranceView.isInsuranceDeclarationAccepted ? "Yes" : "No"}</div>
                    </Grid>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>Enrollment Date</div>
                        <div className={styles.biradareeInfo_value}>{biradareeInsuranceView.insuranceTermsAcceptedDate ? formatDateTime(biradareeInsuranceView.insuranceTermsAcceptedDate) : "-"}</div>
                    </Grid>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>Policy Number</div>
                        <div className={styles.biradareeInfo_value}>{biradareeInsuranceView.insuranceId ?? "-"}</div>
                    </Grid>
                </Grid>
                <Grid container spacing={2} className={styles.biradareeInfo_row}>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>Policy Generated On</div>
                        <div className={styles.biradareeInfo_value}>{biradareeInsuranceView.insuranceIdGeneratedDate ? formatDateTime(biradareeInsuranceView.insuranceIdGeneratedDate) : "-"}</div>
                    </Grid>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>ID Card</div>
                        <div className={styles.biradareeInfo_value}>{biradareeInsuranceView.cardUri ? <a href={biradareeInsuranceView.cardUri} target="_blank" rel="noreferrer">View</a> : "-"}</div>
                    </Grid>
                    <Grid item md={4}>
                        <div className={styles.biradareeInfo_label}>Onboarding Location</div>
                        <div className={styles.biradareeInfo_value}>{googleMapsLink ? <a href={googleMapsLink} target="_blank" rel="noreferrer">View on maps</a> : "-"}</div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

export default BiradareeInfo;
