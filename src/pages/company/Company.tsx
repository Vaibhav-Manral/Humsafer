import { Button, Card, CardContent, CircularProgress, Grid, IconButton } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AddOrEditCompanyDialog from '../../components/addOrEditCompanyDialog/AddOrEditCompanyDialog';
import GenericTable from '../../components/genericTable/GenericTable';
import Toast, { IToastBasicProps } from '../../components/Toast/Toast';
import { HumsaferThemeContext } from '../../contexts/HumsaferThemeContext';
import { HumsaferError } from '../../models/HumsaferError';
import styles from "./Company.module.css";
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { ICompany } from '../../models/Companies';
import { getCompanies } from '../../api/Companies';
import { LocalCache } from '../../utils/LocalCache';

const CompaniesPage: React.FC = React.memo(() => {
    const [companies, setCompanies] = useState<ICompany[]>();
    const [isFetching, setIsFetching] = useState(false);
    const [showAddCompany, setShowAddCompany] = useState(false);
    const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<ICompany>();
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const { primaryColor } = useContext(HumsaferThemeContext);

    const fetchCompanies = async () => {
        setIsFetching(true);
        const companiesOrError = await getCompanies();
        setIsFetching(false);
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

            {(showAddCompany || selectedCompanyForEdit !== undefined) && (
                <AddOrEditCompanyDialog
                    company={selectedCompanyForEdit}
                    show={true}
                    closeDialog={(didAddOrEditCompany) => {
                        const isEdit = selectedCompanyForEdit !== undefined;
                        setShowAddCompany(false);
                        setSelectedCompanyForEdit(undefined);
                        if (didAddOrEditCompany) {
                            setShowToast({
                                open: true,
                                message: `Company ${isEdit ? "updated" : "added"} successfully`,
                                type: "success"
                            });
                            fetchCompanies();
                        }
                    }}
                />
            )}

            {isFetching && (
                <CircularProgress size={25} />
            )}

            {!isFetching && companies && (
                <Grid container>
                    <Grid className={styles.company_componentContainer} item lg={12} md={12} xs={12}>
                        <Card className={styles.company_tableCard}>
                            <div className={styles.company_textHeadingConatiner}>
                                <div className={styles.company_tableTitle} style={{ color: primaryColor }}>
                                    Companies
                                    <Button
                                        variant="text"
                                        onClick={fetchCompanies}
                                    >
                                        <RefreshIcon />
                                    </Button>
                                </div>
                                <Button variant="outlined" onClick={() => setShowAddCompany(true)}>Add Companies</Button>
                            </div>
                            <CardContent className={styles.company_cardContent}>

                                <GenericTable
                                    headers={["Name", "Type", "PAN Number", "Actions"]}
                                    data={companies}
                                    dataRenderer={(data, column) => {
                                        const company = data;
                                        switch (column) {
                                            case 0:
                                                return company.name;
                                            case 1:
                                                return company.companyType;
                                            case 2:
                                                return company.panNumber;
                                            case 3:
                                                return (
                                                    <>
                                                        <IconButton onClick={() => setSelectedCompanyForEdit({ ...company, ...{ companyName: company.name }, ...{ associatedEntities: company.associatedEntities } })}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </>
                                                )
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </>
    );
});

export default CompaniesPage;
