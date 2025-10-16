import { Button, CardContent, Grid, TextField } from "@mui/material";
import Card from "@mui/material/Card";
import { useState } from "react";
import styles from "./ShipmentCoverageReport.module.css";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { exportShipmentsCoverageReport } from "../../api/Reports";
import { Loading } from "../loading/Loading";
import { formatDateForBackend } from "../../utils/DateUtils"
import { HumsaferError } from "../../models/HumsaferError";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const ShipmentCoverageReport: React.FC = (props) => {
    const minDate = moment().subtract(30, 'd');
    const maxDate = moment();

    const [startDate, setStartDate] = useState(moment().subtract(1, "d"));
    const [endDate, setEndDate] = useState(moment());
    const [isLoading, setIsLoading] = useState(false);

    const onShipmentCoverageReportRequest = async () => {
        setIsLoading(true);
        const response = await exportShipmentsCoverageReport(
            formatDateForBackend(startDate.toDate()),
            formatDateForBackend(endDate.toDate())
        )

        setIsLoading(false);
        if (response instanceof HumsaferError) {
            toast.error(response.getErrorMessage())
        } else {
            toast.success("Report sent to registered email")
        }
    }

    const hasError = startDate > endDate;

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
            <Card className={styles.paymentInfo_container}>
                <CardContent>
                    <Grid container spacing={3} className={styles.paymentInfo_row}>
                        <>
                            <Grid item md={3}>
                                <div className={styles.paymentInfo_label}>Start Date</div>
                                <div className={styles.paymentInfo_label}>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            renderInput={props => 
                                                <TextField {...props} error={hasError} helperText={hasError && 'Start Date must be less than End Date'} />}
                                            value={startDate}
                                            onChange={(date) => {
                                                if (date) {
                                                    setStartDate(date)
                                                }
                                            }}
                                            minDate={minDate}
                                            maxDate={maxDate}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </Grid>
                            <Grid item md={3}>
                                <div className={styles.paymentInfo_label}>End Date</div>
                                <div className={styles.paymentInfo_label}>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker
                                            renderInput={props => <TextField {...props} error={hasError} />}
                                            value={endDate}
                                            onChange={(date) => {
                                                if (date) {
                                                    setEndDate(date)
                                                }
                                            }}
                                            maxDate={maxDate}
                                        />
                                    </LocalizationProvider>
                                </div>
                            </Grid>
                        </>
                        <Grid item md={6}>
                        </Grid>
                    </Grid>


                    <Grid container spacing={2} className={styles.paymentInfo_row}>
                        <Grid item md={3}>
                            <div className={styles.paymentInfo_label}>
                                <Button
                                    className={styles.submitButton}
                                    variant="contained"
                                    onClick={() => onShipmentCoverageReportRequest()}>
                                    <Loading text="Request Report" isLoading={isLoading} />
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </CardContent>

            </Card>

        </>
    );
}

export default ShipmentCoverageReport;
