import { useState } from "react"
import Toast, { IToastBasicProps } from "../Toast/Toast"
import HumsaferDialog from "../humsaferDialog/HumsaferDialog"
import { useForm } from "react-hook-form";
import { getShipmentFuelPlan, IFuelOptimizationRequest } from "../../api/Companies";
import { Box, Grid, TextField } from "@mui/material";
import { HumsaferError } from "../../models/HumsaferError";
import { IFuelingStopsInfo } from "../../models/FuelOptimazationResponse";


interface IFuelPlanParametersDialog {
    show: boolean;
    shipmentId: string;
    fuelParameters: IFuelOptimizationRequest | undefined;
    setFuelingStopsInfo: React.Dispatch<React.SetStateAction<IFuelingStopsInfo | undefined>>;
    setShowFuelPlanParametersDialog: React.Dispatch<React.SetStateAction<boolean>>;
    closeDialog: () => void;
}

export const FuelPlanParametersDialog: React.FC<IFuelPlanParametersDialog> = (props) => {
    const { show, shipmentId, fuelParameters, closeDialog, setFuelingStopsInfo, setShowFuelPlanParametersDialog } = props;
    const { register, handleSubmit } = useForm<IFuelOptimizationRequest>({
        defaultValues: fuelParameters
    })
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success"
    })

    const handleToastClose = () => {
        setShowToast({
            open: false,
            message: showToast.message,
            type: showToast.type
        })
    }

    const onSubmit = async (props: IFuelOptimizationRequest) => {
        setIsSubmitting(true);

        const response = await getShipmentFuelPlan(shipmentId, props)

        setIsSubmitting(false);

        if (response instanceof HumsaferError) {
            setShowToast({
                open: true,
                message: response.message,
                type: "error"
            })
            return
        }

        setFuelingStopsInfo(response)
        setShowFuelPlanParametersDialog(false)

    }

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
                closeDialog={closeDialog}
                title={"Fuel Plan Parameters"}
                onSubmit={handleSubmit(onSubmit)}
                buttonText="Generate Fuel Plan"
                isLoading={isSubmitting}
                description={
                    <>
                        <form>
                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("maxStops", {
                                                required: "maxStops is required"
                                            })}
                                            type={"number"}
                                            label="Max Stops*"
                                            fullWidth
                                            margin="normal"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("mileageInKmsPerLtr", {
                                                required: "mileageInKmsPerLtr is required."
                                            })}
                                            type={"number"}
                                            label="Mileage (in Kmpl)*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("initialFuelLtrs", {
                                                required: "initialFuelLtrs is required."
                                            })}
                                            type={"number"}
                                            label="Intial Fuel (in Ltrs)*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("tankCapacityInLtrs", {
                                                required: "tankCapacityInLtrs is required."
                                            })}
                                            type={"number"}
                                            label="Tank Capacity (in Ltrs)*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("reserveFuelInLtrs", {
                                                required: "reserveFuelInLtrs is required."
                                            })}
                                            type={"number"}
                                            label="Reserve Fuel (in Ltrs)*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("minFuelToPurchaseInLtrs", {
                                                required: "minFuelToPurchaseInLtrs is required."
                                            })}
                                            type={"number"}
                                            label="Min. Fuel To Purchase (in Ltrs)*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </>
                }

            />

        </>
    )
}

