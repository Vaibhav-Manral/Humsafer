import { CircularProgress, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getDrivingLicenses } from "../../api/DrivingLicense";
import { HumsaferError } from "../../models/HumsaferError";
import {
  DrivingLicenseVerifiedStatus,
  IDrivingLicenseView,
} from "../../models/DrivingLicenseView";
import DrivingLicenseVerificationModal from "../drivingLicenseVerificationModal/DrivingLicenseVerificationModal";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import GenericTableWithTitle from "../genericTable/GenericTableWithTitle";
import { formatDate } from "../../utils/DateUtils";

const DrivingLicenseTable: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDrivingLicense, setSelectedDrivingLicense] =
    useState<IDrivingLicenseView>();
  const [isLoading, setIsLoading] = useState(false);
  const [drivingLicenseList, setDrivingLicenseList] = useState<
    IDrivingLicenseView[]
  >([]);

  const fetchInReviewDrivingLicenses = async () => {
    setIsLoading(true);
    const dls = await getDrivingLicenses(
      DrivingLicenseVerifiedStatus.IN_REVIEW
    );

    setIsLoading(false);
    if (dls instanceof HumsaferError) {
      const message = dls?.message ?? "Something went wrong!";
      setShowToast({
        open: true,
        message: message,
        type: "error",
      });
    } else {
      dls.sort((a, b) => (a.lastUpdateTime > b.lastUpdateTime ? 1 : -1));
      setDrivingLicenseList([...dls]);
    }
  };

  useEffect(() => {
    fetchInReviewDrivingLicenses();
  }, []);

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });

  const onClose = (refresh: boolean, successMessage?: string) => {
    setShowModal(false);
    if (refresh) {
      fetchInReviewDrivingLicenses();
      if (successMessage) {
        setShowToast({
          open: true,
          message: successMessage,
          type: "success",
        });
      }
    }
  };

  return (
    <>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      {showModal && selectedDrivingLicense && (
        <DrivingLicenseVerificationModal
          drivingLicense={selectedDrivingLicense}
          onClose={onClose}
          allowVerification={true}
        />
      )}

      {isLoading && <CircularProgress size={25} />}

      {drivingLicenseList.length > 0 && (
        <Grid
          style={{ marginLeft: "20px", marginRight: "20px" }}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <GenericTableWithTitle
            title="In-Review Driving Licenses"
            headers={["#", "Name", "DL No.", "Last Updated On"]}
            data={drivingLicenseList}
            onRowClick={(data) => {
              setSelectedDrivingLicense(data);
              setShowModal(true);
            }}
            dataRenderer={(data, column, row) => {
              const drivingLicense = data;
              switch (column) {
                case 0:
                  return row + 1;
                case 1:
                  return drivingLicense.name ?? "-";
                case 2:
                  return drivingLicense.drivingLicenseNumber;
                case 3:
                  return formatDate(drivingLicense.lastUpdateTime);
              }
            }}
            getWidth={(column: number) => {
              switch (column) {
                case 0: return 40;   // "#" - 8% of table width
                case 1: return 100;  // "Name" - 30% of table width
                case 2: return 300;  // "DL No." - 20% of table width
                case 3: return 200;  // "Last Updated On" - 20% of table width
                default: return 100;
              }
            }}
          />
        </Grid>
      )}
    </>
  );
};

export default DrivingLicenseTable;
