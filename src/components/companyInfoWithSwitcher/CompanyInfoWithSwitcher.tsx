import { useContext, useState } from "react";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Button } from "@mui/material";
import CompanySwitcherDialog from "../companySwitcherDialog/CompanySwitcherDialog";

interface CompanyInfoWithSwitcherProps {
    onBeforeCompanySelect?: () => void;
}

const CompanyInfoWithSwitcher: React.FC<CompanyInfoWithSwitcherProps> = ({ onBeforeCompanySelect }) => {
    const {
        selectedCompany,
        selectCompany
    } = useContext(CompanyDataContext);

    const [showCompanySwitcherDialog, setShowCompanySwitcherDialog] = useState(false);

    return (
        <>
            {showCompanySwitcherDialog && <CompanySwitcherDialog
                isOpen={true}
                closeDialog={() => setShowCompanySwitcherDialog(false)}
                onCompanySelected={(company) => {
                    onBeforeCompanySelect?.();
                    selectCompany(company);
                    setShowCompanySwitcherDialog(false);
                }}
            />}
            <div>
                Selected Company: {selectedCompany?.name ?? "None"}
                <Button variant="text" onClick={() => setShowCompanySwitcherDialog(true)}>Switch</Button>
            </div>
        </>
    );
}

export default CompanyInfoWithSwitcher;
