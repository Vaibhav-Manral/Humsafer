import { useState } from "react";
import { deleteUser } from "../../api/Users";
import { IUserProfile } from "../../models/User";
import { displayNameForPortalUser } from "../../utils/DisplayUtils";
import HumsaferDialog from "../humsaferDialog/HumsaferDialog";
import Toast, { IToastBasicProps } from "../Toast/Toast";


interface IAddUserDialogProps {
    user: IUserProfile
    show: boolean;
    closeDialog: (didDeleteUser: boolean) => void;
}

const DeleteUserConfirmationDialog: React.FC<IAddUserDialogProps> = (props) => {
    const { user, show, closeDialog } = props;
    const [isDeleting, setIsDeleting] = useState(false);
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const onDeleteConfirm = async () => {
        setIsDeleting(true);
        const error = await deleteUser(user.id);
        setIsDeleting(false);

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
                title={"Remove User"}
                onSubmit={onDeleteConfirm}
                buttonText={"Remove"}
                isLoading={isDeleting}
                description={
                    <>
                        Are you sure you want to remove <strong>{displayNameForPortalUser(user)}</strong> from accessing the Humsafer portal?
                    </>
                }
            />
        </>
    );
}

export default DeleteUserConfirmationDialog;
