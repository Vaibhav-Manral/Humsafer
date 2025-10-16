import { Button, Card, CardContent, CircularProgress, Grid, IconButton } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { getUsers } from '../../api/Users';
import AddOrEditUserDialog from '../../components/addOrEditUserDialog/AddOrEditUserDialog';
import GenericTable from '../../components/genericTable/GenericTable';
import Toast, { IToastBasicProps } from '../../components/Toast/Toast';
import { HumsaferThemeContext } from '../../contexts/HumsaferThemeContext';
import { HumsaferError } from '../../models/HumsaferError';
import { IUserProfile } from '../../models/User';
import styles from "./UserManagement.module.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteUserConfirmationDialog from '../../components/deleteUserConfirmationDialog/DeleteUserConfirmationDialog';
import { displayNameForPortalUser } from '../../utils/DisplayUtils';

const UserManagement: React.FC = React.memo(() => {
    const [users, setUsers] = useState<IUserProfile[]>();
    const [isFetching, setIsFetching] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState<IUserProfile>();
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<IUserProfile>();
    const [showToast, setShowToast] = useState<IToastBasicProps>({
        open: false,
        message: "",
        type: "success",
    });

    const { primaryColor } = useContext(HumsaferThemeContext);

    const fetchUsers = async () => {
        setIsFetching(true);
        const usersOrError = await getUsers();
        setIsFetching(false);
        if (usersOrError instanceof HumsaferError) {
            setShowToast({
                open: true,
                message: usersOrError.message,
                type: "error"
            })
            return;
        }

        setUsers(usersOrError);
    }

    useEffect(() => {
        fetchUsers();
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

            {(showAddUser || selectedUserForEdit !== undefined) && (
                <AddOrEditUserDialog
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
                                type: "success"
                            });
                            fetchUsers();
                        }
                    }}
                />
            )}

            {selectedUserForDelete && (
                <DeleteUserConfirmationDialog
                    show={true}
                    user={selectedUserForDelete}
                    closeDialog={(didDeleteUser) => {
                        setSelectedUserForDelete(undefined);
                        if (didDeleteUser) {
                            setShowToast({
                                open: true,
                                message: "User deleted successfully",
                                type: "success"
                            });
                            fetchUsers();
                        }
                    }}
                />
            )}

            {isFetching && (
                <CircularProgress size={25} />
            )}

            {!isFetching && users && (
                <Grid container>
                    <Grid className={styles.userManagement_componentContainer} item lg={12} md={12} xs={12}>
                        <Card className={styles.userManagement_tableCard}>
                            <div className={styles.userManagement_textHeadingConatiner}>
                                <div className={styles.userManagement_tableTitle} style={{ color: primaryColor }}>Users</div>
                                <Button variant="outlined" onClick={() => setShowAddUser(true)}>Add User</Button>
                            </div>
                            <CardContent className={styles.userManagement_cardContent}>
                                <GenericTable
                                    headers={["Name", "Mobile Number", "Email", "Capabilities", "Actions"]}
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
                                                return user.capabilities.toString();
                                            case 4:
                                                return (
                                                    <>
                                                        <IconButton onClick={() => setSelectedUserForEdit(user)}>
                                                            <EditIcon />
                                                        </IconButton>

                                                        <IconButton onClick={() => setSelectedUserForDelete(user)}>
                                                            <DeleteIcon />
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

export default UserManagement;
