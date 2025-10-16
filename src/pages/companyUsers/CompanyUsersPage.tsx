import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import AddOrEditUserDialog from "../../components/addOrEditUserDialog/AddOrEditUserDialog";
import GenericTable from "../../components/genericTable/GenericTable";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import { HumsaferThemeContext } from "../../contexts/HumsaferThemeContext";
import { HumsaferError } from "../../models/HumsaferError";
import { IUserProfile } from "../../models/User";
import styles from "./CompanyUsersPage.module.css";
import EditIcon from "@mui/icons-material/Edit";
import { displayNameForPortalUser } from "../../utils/DisplayUtils";
import { deleteCompanyUser, getCompanyUsers } from "../../api/Companies";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { Auth } from "../../utils/Auth";
import CompanyInfoWithSwitcher from "../../components/companyInfoWithSwitcher/CompanyInfoWithSwitcher";
import { isAllowedToSwitchCompanies } from "../../utils/CapabitilityUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteUserConfirmationDialog from "../../components/deleteUserConfirmationDialog/DeleteUserConfirmationDialog";

const CompanyUsersPage: React.FC = React.memo(() => {
  const [users, setUsers] = useState<IUserProfile[]>();
  const [isFetching, setIsFetching] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<IUserProfile>();
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<IUserProfile>();
  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });

  const allowCompanySwitcher = isAllowedToSwitchCompanies();

  const { selectedCompany } = useContext(CompanyDataContext);

  const { primaryColor } = useContext(HumsaferThemeContext);

  let companyId = Auth.getInstance().getCompanySettings()?.id;
  if (selectedCompany) {
    companyId = selectedCompany.id;
  }

  const fetchUsers = useCallback(async () => {
    if (companyId === undefined) {
      return;
    }

    setIsFetching(true);
    const usersOrError = await getCompanyUsers(companyId);
    setIsFetching(false);
    if (usersOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: usersOrError.message,
        type: "error",
      });
      return;
    }

    setUsers(usersOrError);
  }, [companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (companyId === undefined) {
      return;
    }

    const error = await deleteCompanyUser(companyId, userId);

    if (error === null) {
      setShowToast({
        open: true,
        message: "User deleted successfully",
        type: "success",
      });
      fetchUsers();
    } else {
      setShowToast({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  };

  return (
    <>
      {allowCompanySwitcher && <CompanyInfoWithSwitcher />}
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      {companyId !== undefined &&
        (showAddUser || selectedUserForEdit !== undefined) && (
          <AddOrEditUserDialog
            companyId={companyId}
            user={selectedUserForEdit}
            show={true}
            closeDialog={(didAddOrEditUser) => {
              const isEdit = selectedUserForEdit !== undefined;
              setShowAddUser(false);
              setSelectedUserForEdit(undefined);
              if (didAddOrEditUser) {
                setShowToast({
                  open: true,
                  message: `User ${isEdit ? "updated" : "added"} successfully`,
                  type: "success",
                });
                fetchUsers();
              }
            }}
          />
        )}
      {selectedUserForDelete && companyId !== undefined && (
        <DeleteUserConfirmationDialog
          show={true}
          user={selectedUserForDelete}
          closeDialog={(didDeleteUser) => {
            if (didDeleteUser && selectedUserForDelete) {
              handleDeleteUser(selectedUserForDelete.id);
            }
            setSelectedUserForDelete(undefined);
          }}
        />
      )}
      {isFetching && <CircularProgress size={25} />}
      {!isFetching && users && (
        <Grid container>
          <Grid
            className={styles.userManagement_componentContainer}
            item
            lg={12}
            md={12}
            xs={12}
          >
            <Card className={styles.userManagement_tableCard}>
              <div className={styles.userManagement_textHeadingConatiner}>
                <div
                  className={styles.userManagement_tableTitle}
                  style={{ color: primaryColor }}
                >
                  Users
                </div>
                <Button variant="outlined" onClick={() => setShowAddUser(true)}>
                  Add User
                </Button>
              </div>
              <CardContent className={styles.userManagement_cardContent}>
                <GenericTable
                  headers={["Name", "Mobile Number", "Email", "Actions"]}
                  data={users}
                  dataRenderer={(data, column) => {
                    const user = data;
                    switch (column) {
                      case 0:
                        return displayNameForPortalUser(user);
                      case 1:
                        return user.mobileNumber;
                      case 2:
                        return user.email;
                      case 3:
                        return (
                          <>
                            <IconButton
                              onClick={() => setSelectedUserForEdit(user)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setSelectedUserForDelete(user)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        );
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

export default CompanyUsersPage;
