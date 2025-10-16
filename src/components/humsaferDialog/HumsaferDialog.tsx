import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import style from "./HumsaferDialog.module.css";
import { ReactNode, useContext } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { Loading } from "../loading/Loading";

interface IProps {
    isOpen: boolean;
    closeDialog: () => void;
    title: string;
    description: string | ReactNode;
    buttonText: string;
    onSubmit?: () => void;
    isLoading?: boolean;
}

function HumsaferDialog(props: IProps) {
    const {
        isOpen,
        closeDialog,
        title,
        description,
        buttonText,
        onSubmit = closeDialog,
        isLoading = false
    } = props;

    const { primaryColor } = useContext(HumsaferThemeContext);

    return (
        <Dialog open={isOpen} sx={{
            "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                    width: "100%",
                    maxWidth: "900px",
                    background: "#FFFFFF 0% 0% no-repeat padding-box!important",
                    boxShadow: "0px 3px 6px #00000029!important",
                    border: "1px solid #CCCCCC!important",
                    borderRadius: "10px"
                },
            }
        }}
        >
            <DialogTitle
                className={style.humsaferDialog__TitleContainer}
                style={{ color: primaryColor }}>
                {title}
                <IconButton className={style.humsaferDialog__TitleCross} onClick={closeDialog}>
                    <CancelOutlinedIcon style={{ fontSize: "24" }} />
                </IconButton>
            </DialogTitle>
            <DialogContent style={{ background: "#FFFFFF" }} className={style.humsaferDialog__Container}>
                <div className={style.humsaferDialog__descriptionContainer}>
                    {description}
                </div>
                <div className={style.humsaferDialog__btnTextContainer}>
                    <Button
                        variant="contained"
                        onClick={onSubmit}>
                        <Loading isLoading={isLoading} text={buttonText} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default HumsaferDialog
