import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HumsaferError } from "../../models/HumsaferError";
import HumsaferDialog from "../humsaferDialog/HumsaferDialog";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import { ICompany, CompanyType, AvailableFeatures } from "../../models/Companies";
import { IAddCompanyRequest, addCompany, editCompany } from "../../api/Companies";
import InputAdornment from '@mui/material/InputAdornment';

interface IAddCompanyDialogProps {
    company?: ICompany;
    show: boolean;
    closeDialog: (didAddOrEditUser: boolean) => void;
}

const AddOrEditCompanyDialog: React.FC<IAddCompanyDialogProps> = (props) => {
    const { company, show, closeDialog } = props;
    const { register, handleSubmit, formState: { errors } } = useForm<IAddCompanyRequest>({
        defaultValues: company
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [associatedEntities, setAssociatedEntities] = useState('' || company?.associatedEntities.join(","));

    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const onSubmit = async (props: IAddCompanyRequest) => {
        setIsSubmitting(true);
        let error: HumsaferError | null;

        const trimmedProps = Object.fromEntries(
            Object.entries(props).map(
                ([key, value]) => [key, typeof value === 'string' ? value.trim() : value]
            )
        ) as IAddCompanyRequest;

        const associatedEntitiesValue = associatedEntities?.split(',').map(item => item.trim());

        if (company) {
            error = await editCompany(company.id, { ...trimmedProps, associatedEntities: associatedEntitiesValue ? associatedEntitiesValue : [] });
        } else {
            const { adminMobileNumber, ...rest } = trimmedProps;
            let normalizedMobileNumber = adminMobileNumber;
            if (!normalizedMobileNumber.startsWith("+91")) {
                normalizedMobileNumber = "+91".concat(normalizedMobileNumber).trim();
            }
            error = await addCompany({
                ...rest, adminMobileNumber: normalizedMobileNumber,
                availableFeatures: [AvailableFeatures.HUMSAFER_PORTAL_V1, AvailableFeatures.HUMSAFER_SHIPMENTS],
                associatedEntities: associatedEntitiesValue ? associatedEntitiesValue : []
            });
        }

        setIsSubmitting(false);

        if (error === null) {
            closeDialog(true);
            return;
        }

        setShowToast({
            open: true,
            message: error.message,
            type: "error"
        })
    }

    const handleToastClose = () => {
        setShowToast({
            open: false,
            message: showToast.message,
            type: showToast.type,
        });
    };

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
                closeDialog={() => closeDialog(false)}
                title={company ? "Edit Company" : "Add Company"}
                onSubmit={handleSubmit(onSubmit)}
                buttonText={company ? "Edit" : "Add"}
                isLoading={isSubmitting}
                description={
                    <>
                        <form>
                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("companyName", {
                                                required: "Company name is required"
                                            })}
                                            error={errors.companyName !== undefined}
                                            helperText={errors.companyName && errors.companyName.message}
                                            type={"text"}
                                            label="Company Name*"
                                            fullWidth
                                            margin="normal"
                                            size="small"
                                            variant="outlined"
                                            disabled={company !== undefined}

                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("panNumber", {
                                                required: "PAN number is required.",
                                                validate: {
                                                    isValidPan: (value) => /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value.toUpperCase()) || "Invalid PAN number format."
                                                }
                                            })}
                                            inputProps={{ style: { textTransform: "uppercase" } }}
                                            error={Boolean(errors.panNumber)}
                                            helperText={errors.panNumber && errors.panNumber.message}
                                            type={"text"}
                                            label="PAN Number*"
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                            disabled={company !== undefined}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("companyType", {
                                                required: "Select company type"
                                            })}
                                            error={errors.companyType !== undefined}
                                            helperText={errors.companyType && errors.companyType.message}
                                            type={"text"}
                                            label="Company Type*"
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            size="small"
                                            defaultValue={company?.companyType ?? ""}
                                            select
                                        >
                                            {Object.values(CompanyType).map((companyType) => (
                                                <MenuItem key={companyType} value={companyType}>
                                                    {companyType}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    {!company ? <>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                {...register("adminFirstName", {
                                                    required: "First name is required"
                                                })}
                                                error={errors.adminFirstName !== undefined}
                                                helperText={errors.adminFirstName && errors.adminFirstName.message}
                                                type={"text"}
                                                label="First Name*"
                                                fullWidth
                                                size="small"
                                                margin="normal"
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                {...register("adminLastName", {
                                                    required: "Last name is required"
                                                })}
                                                error={errors.adminLastName !== undefined}
                                                helperText={errors.adminLastName && errors.adminLastName.message}
                                                type={"text"}
                                                label="Last Name*"
                                                fullWidth
                                                size="small"
                                                margin="normal"
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                {...register("adminEmail", {
                                                    required: "Email-id is required"
                                                })}
                                                error={errors.adminEmail !== undefined}
                                                helperText={errors.adminEmail && errors.adminEmail.message}
                                                type={"email"}
                                                label="Email*"
                                                size="small"
                                                fullWidth
                                                margin="normal"
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                {...register("adminMobileNumber", {
                                                    required: "Mobile number is required",
                                                    validate: {
                                                        isValidMobile: (value) =>
                                                            /^\d{10}$/.test(value) || "Mobile number must be exactly 10 digits."
                                                    }
                                                })}
                                                error={Boolean(errors.adminMobileNumber)}
                                                helperText={errors.adminMobileNumber && errors.adminMobileNumber.message}
                                                type={company !== undefined ? "text" : "number"}
                                                label="Mobile Number*"
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                                                }}
                                                size="small"
                                                margin="normal"
                                                variant="outlined"
                                            />

                                        </Grid>

                                    </> : ""}
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            {...register("associatedEntities", {
                                                required: "Transporter names required"

                                            })}
                                            error={Boolean(errors.associatedEntities)}
                                            helperText={errors.associatedEntities && errors.associatedEntities.message}
                                            type={"text"}
                                            label="Transporter Names*"
                                            placeholder="Enter comma separated values"
                                            value={associatedEntities}
                                            onChange={(e) => setAssociatedEntities(e.target.value)}
                                            fullWidth
                                            size="small"
                                            margin="normal"
                                            variant="outlined"
                                        />

                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="audio-alert-config-label">Audio Alerts on</InputLabel>
                                            <Select
                                                labelId="audio-alert-config-label"
                                                defaultValue={(company?.driveModeConfig && company.driveModeConfig.isDriveModeAudioAlertsEnabled.toString()) || "false"}
                                                label="Audio Alerts on"
                                                {...register("isDriveModeAudioAlertsEnabled", {
                                                    required: "Drive Mode Audio alert config required"
                                                })}
                                                size="small"
                                            >
                                                <MenuItem value={"true"}>Enabled</MenuItem>
                                                <MenuItem value={"false"}>Disabled</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </>
                }
            />
        </>
    );
}

export default AddOrEditCompanyDialog;
