import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import style from "./CompanySwitcherDialog.module.css";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useContext, useEffect, useState } from "react";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { ICompany } from "../../models/Companies";
import GenericTable from "../genericTable/GenericTable";
import { getCompanies } from "../../api/Companies";
import { HumsaferError } from "../../models/HumsaferError";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import { LocalCache } from "../../utils/LocalCache";

interface IProps {
    isOpen: boolean;
    closeDialog: () => void;
    onCompanySelected: (company: ICompany) => void;
}

function CompanySwitcherDialog(props: IProps) {
    const {
        isOpen,
        closeDialog,
        onCompanySelected
    } = props;

    const { primaryColor } = useContext(HumsaferThemeContext);
    const [companies, setCompanies] = useState<ICompany[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const fetchCompanies = async () => {
        setIsLoading(true);
        const companiesOrError = await getCompanies();
        setIsLoading(false);
        if (companiesOrError instanceof HumsaferError) {
            setShowToast({
                open: true,
                message: companiesOrError.message,
                type: "error"
            })
            return;
        }

        setCompanies(companiesOrError);
        LocalCache.saveCompanyList(companiesOrError);
    }

    useEffect(() => {
        const cachedCompanyList = LocalCache.getCompanyList();
        if (!cachedCompanyList) {
            fetchCompanies();
            return;
        } 
        setCompanies(cachedCompanyList);
    }, []);

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
            <Dialog
                open={isOpen}
                sx={{
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
                    <div>
                        Select Company
                        <Button
                            variant="text"
                            onClick={fetchCompanies}
                        >
                            <RefreshIcon />
                        </Button>
                        <IconButton className={style.humsaferDialog__TitleCross} onClick={closeDialog}>
                            <CancelOutlinedIcon style={{ fontSize: "24" }} />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent style={{ background: "#FFFFFF" }} className={style.humsaferDialog__Container}>
                    <div className={style.humsaferDialog__descriptionContainer}>
                        <GenericTable
                            headers={["Companies"]}
                            data={companies}
                            dataRenderer={(company) => {
                                return company.name;
                            }}
                            isLoading={isLoading}
                            onRowClick={(company) => {
                                onCompanySelected(company);
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CompanySwitcherDialog
