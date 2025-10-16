import { Button, Card, CardContent, Grid } from "@mui/material";
import { ILiveLocationView } from "../../models/GetUserInfoResponse";
import { formatDateTime } from "../../utils/DateUtils";
import { useContext, useEffect, useState } from "react";
import styles from "./LiveLocationTable.module.css";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { getGoogleMapsUrlFor, getGoogleMapsUrlForLocations } from "../../utils/Utils";

interface ILiveLocationTableProps {
    lastLiveLocations: ILiveLocationView[];
}

const LiveLocationTable: React.FC<ILiveLocationTableProps> = (props) => {
    const { lastLiveLocations } = props;
    const [latestLocationShared, setLatestLocationShared] = useState<ILiveLocationView>();
    const { primaryColor } = useContext(HumsaferThemeContext);

    useEffect(() => {
        // get latest location from the list
        if (lastLiveLocations.length > 0) {
            setLatestLocationShared(lastLiveLocations[0]);
        }
    }, [lastLiveLocations])

    return (
        <>
            <Card className={styles.liveLocationTable_container}>
                <div className={styles.liveLocationTable_headingConatiner}>
                    <div className={styles.liveLocationTable_title} style={{ color: primaryColor }}>Live Location Info</div>
                </div>
                <CardContent>
                    {latestLocationShared && (
                        <div >
                            <Grid container spacing={2} className={styles.liveLocationTable__row}>
                                <Grid item md={3}>
                                    <div className={styles.liveLocationTable__label}>Last updated on</div>
                                    <div className={styles.liveLocationTable__value}>{formatDateTime(latestLocationShared.lastUpdated)}</div>
                                </Grid>
                                <Grid item md={3}>
                                    <div className={styles.liveLocationTable__value}>
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = getGoogleMapsUrlFor(latestLocationShared.latitude, latestLocationShared.longitude);
                                                window.open(url);
                                            }}
                                        >Show Last location on Map</Button>
                                    </div>
                                </Grid>
                                <Grid item md={3}>
                                    <div className={styles.liveLocationTable__value}>
                                        <Button
                                            variant="outlined"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = getGoogleMapsUrlForLocations(lastLiveLocations);
                                                window.open(url);
                                            }}
                                        >Show Last 10 locations on Map</Button>
                                    </div>
                                </Grid>
                                <Grid item md={3}>

                                </Grid>
                            </Grid>
                            {latestLocationShared.currentBatteryPercent && (
                                <Grid container spacing={2} className={styles.liveLocationTable__row}>
                                    <Grid item md={3}>
                                        <div className={styles.liveLocationTable__label}>Charging</div>
                                        <div className={styles.liveLocationTable__value}>{String(latestLocationShared.currentBatteryCharging)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.liveLocationTable__label}>Battery</div>
                                        <div className={styles.liveLocationTable__value}>{latestLocationShared.currentBatteryPercent} %</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.liveLocationTable__label}>Power Saver mode</div>
                                        <div className={styles.liveLocationTable__value}>{String(latestLocationShared.isInPowerSaverMode)}</div>
                                    </Grid>
                                    <Grid item md={3}>
                                        <div className={styles.liveLocationTable__label}>Is exempt from Doze Mode</div>
                                        <div className={styles.liveLocationTable__value}>{String(latestLocationShared.isExemptFromBatteryOptimization)}</div>
                                    </Grid>
                                </Grid>)}
                            <br />
                        </div>
                    )}
                </CardContent>
            </Card >
        </>
    )
}

export default LiveLocationTable
