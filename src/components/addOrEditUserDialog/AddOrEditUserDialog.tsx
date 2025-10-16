import { Checkbox, ListItemText, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { addUser, editUser, IAddUserRequest } from "../../api/Users";
import { HumsaferError } from "../../models/HumsaferError";
import { IUserProfile, Namespace, capabilitesForDMS, capabilitesForPortal } from "../../models/User";
import HumsaferDialog from "../humsaferDialog/HumsaferDialog";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import { addCompanyUser, editCompanyUser } from "../../api/Companies";


interface IAddUserDialogProps {
    companyId?: string;
    user?: IUserProfile;
    show: boolean;
    closeDialog: (didAddOrEditUser: boolean) => void;
}

const AddOrEditUserDialog: React.FC<IAddUserDialogProps> = (props) => {
    const { user, show, closeDialog, companyId } = props;
    const { register, handleSubmit, watch, formState: { errors } } = useForm<IAddUserRequest>({
        defaultValues: user
    });
    const watchCapabilities = watch("capabilities");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const onSubmit = async (props: IAddUserRequest) => {
        setIsSubmitting(true);

        let error: HumsaferError | null;
        if (user) {
            if (companyId) {
                error = await editCompanyUser(companyId, user.id, props);
            } else {
                error = await editUser(user.id, props);
            }
        } else {
            const { mobileNumber, ...rest } = props;
            let normalizedMobileNumber = mobileNumber;
            if (!normalizedMobileNumber.startsWith("+91")) {
                normalizedMobileNumber = "+91".concat(normalizedMobileNumber);
            }

            if (companyId) {
                error = await addCompanyUser(companyId, {
                    mobileNumber: normalizedMobileNumber,
                    ...rest
                });
            } else {
                error = await addUser({
                    mobileNumber: normalizedMobileNumber,
                    ...rest
                });
            }
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

    const applicableCapabilities = companyId === undefined ? capabilitesForPortal : capabilitesForDMS;

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
                title={user ? "Edit User" : "Add User"}
                onSubmit={handleSubmit(onSubmit)}
                buttonText={user ? "Edit" : "Add"}
                isLoading={isSubmitting}
                description={
                    <>
                        <form>
                            <TextField
                                {...register("firstName", {
                                    required: true
                                })}
                                error={errors.firstName !== undefined}
                                type={"text"}
                                label="First Name*"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />

                            <TextField
                                {...register("lastName", {
                                    required: true
                                })}
                                error={errors.lastName !== undefined}
                                type={"text"}
                                label="Last Name*"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />

                            <TextField
                                {...register("email", {
                                    required: true
                                })}
                                error={errors.email !== undefined}
                                type={"email"}
                                label="Email*"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                            />

                            <TextField
                                {...register("mobileNumber", {
                                    required: true
                                })}
                                error={errors.mobileNumber !== undefined}
                                type={user !== undefined ? "text" : "number"}
                                label="Mobile Number*"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                disabled={user !== undefined}
                            />

                            {companyId === undefined && (
                                <TextField
                                    {...register("namespace", {
                                        required: true
                                    })}
                                    error={errors.namespace !== undefined}
                                    type={"text"}
                                    label="Namespace*"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    defaultValue={user?.namespace ?? ""}
                                    select
                                >
                                    {Object.values(Namespace).map((namespace) => (
                                        <MenuItem key={namespace} value={namespace}>
                                            {namespace}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <TextField
                                {...register("capabilities", {
                                    required: true
                                })}
                                error={errors.capabilities !== undefined}
                                type={"text"}
                                label="Capabilities*"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                select
                                SelectProps={{
                                    multiple: true,
                                    defaultValue: user?.capabilities ?? [],
                                    renderValue: (values) => {
                                        const selectedValues = values as string[];
                                        return `${selectedValues.length} capabilities selected`;
                                    }
                                }}
                            >
                                {applicableCapabilities.map((capability) => (
                                    <MenuItem key={capability} value={capability}>
                                        <Checkbox
                                            color="primary"
                                            checked={watchCapabilities === undefined ? false : watchCapabilities.indexOf(capability) > -1} />
                                        <ListItemText primary={capability} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </form>
                    </>
                }
            />
        </>
    );
}

export default AddOrEditUserDialog;
