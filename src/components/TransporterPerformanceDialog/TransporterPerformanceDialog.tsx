import { Grid, TextField } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GenericTable from "../genericTable/GenericTable";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { IPerAssociatedEntityShipmentAnalytics } from "../../models/analyse";
import { useState } from "react";

interface ITransporterPerformanceDialogProps {
    show: boolean;
    setTransporterDialog: (boolean: boolean) => void;
    closeDialog: (boolean: boolean) => void;
    entityPerformanceData: IPerAssociatedEntityShipmentAnalytics[]
}

const TransporterPerformanceDialog: React.FC<ITransporterPerformanceDialogProps> = (props) => {
    const { show, setTransporterDialog, entityPerformanceData: branchPerformanceData } = props;
    const [filterTransportData, setFilterTransportData] = useState<IPerAssociatedEntityShipmentAnalytics[]>(branchPerformanceData);
    const searchFilterTransportPerformance = (e) => {
        const searchQuery = e.target.value;
        let filteredData = [...branchPerformanceData]
        if (searchQuery) {
            filteredData = filteredData.filter(item =>
                item.associatedEntity.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilterTransportData(filteredData);
    };
    return (
        <>
            <Dialog
                fullWidth={true}
                maxWidth={"md"}
                onClose={() => setTransporterDialog(false)}
                aria-labelledby="customized-dialog-title"
                open={show}
                sx={{ overflow: 'visible' }}
                PaperProps={{ style: { overflow: 'visible' } }}
            >

                <IconButton
                    aria-label="close"
                    onClick={() => setTransporterDialog(false)}
                    sx={{
                        position: 'absolute',
                        right: '0px',
                        top: '-48px',
                        background: "#fff",
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <Grid container spacing={1} style={{ display: 'flex', alignItems: 'center' }} >
                        <Grid item xs={12} md={4}>
                            <div style={{ fontSize: "18px", fontWeight: " 700" }}> Transporter Performance</div>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                variant="standard"
                                placeholder="Search here..."
                                onChange={searchFilterTransportPerformance}
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottom: "none"
                                    },
                                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                                        borderBottom: "none"
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottom: "none",
                                        content: "none"
                                    },
                                    backgroundColor: "#F8F9FA;",
                                    borderRadius: "20px",
                                    width: "90%",
                                    padding: "3px 10px 3px 10px"
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        </>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>

                    <GenericTable
                        headers={["Transporter", "KMS  driven", "Total trips", "Driver Adherence", "Total drivers"]}
                        data={filterTransportData}
                        dataRenderer={(data, column) => {
                            const branch = data;
                            switch (column) {
                                case 0:
                                    return branch.associatedEntity;
                                case 1:
                                    return (branch.shipmentAnalytics?.totalDistanceTravelledInMeters / 1000).toFixed(0);
                                case 2:
                                    return branch.shipmentAnalytics.totalTrips.toFixed(0);
                                case 3: {
                                    const total = branch.driverAnalytics ? branch.driverAnalytics?.map(driver => driver.alertStatistics.adherenceRate).reduce((acc, val) => acc + val, 0) : 0;
                                    const length = branch.driverAnalytics ? branch.driverAnalytics.filter(driver => driver.alertStatistics.adherenceRate !== 0).length : 1;
                                    return length === 0 ? total : total / length;
                                }
                                case 4:
                                    return branch.shipmentAnalytics.totalDrivers.toFixed(0);
                            }
                        }}
                    />
                </DialogContent>

            </Dialog>
        </>
    );
}

export default TransporterPerformanceDialog;
