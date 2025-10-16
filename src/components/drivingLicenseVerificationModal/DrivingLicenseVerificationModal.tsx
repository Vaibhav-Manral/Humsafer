import { Button, Dialog, IconButton } from "@mui/material";
import { IDrivingLicenseView } from "../../models/DrivingLicenseView";
import styles from "./DrivingLicenseVerificationModal.module.css";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { HumsaferError } from "../../models/HumsaferError";
import Toast, { IToastBasicProps } from "../Toast/Toast";
import { useState } from "react";
import { Loading } from "../loading/Loading";
import {
  manuallyVerifyDl,
  resetDl,
  revokeDlVerification,
} from "../../api/DrivingLicense";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  isDlInReview,
  isDlVerifiedByApi,
  isTruckDriverLicense,
  truckDriverClassOfVehicles,
} from "../../utils/DrivingLicenseUtils";
import { formatDate } from "../../utils/DateUtils";

interface IProps {
  drivingLicense: IDrivingLicenseView;
  onClose: (refresh: boolean, successMessage?: string) => void;
  allowVerification: boolean;
}

const DrivingLicenseVerificationModal: React.FC<IProps> = (props) => {
  const { drivingLicense, onClose, allowVerification } = props;

  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnverifying, setIsUnverifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [isFrontImageLoading, setIsFrontImageLoading] = useState(true);
  const [isBackImageLoading, setIsBackImageLoading] = useState(true);

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

  const onSubmitVerify = async () => {
    setIsVerifying(true);
    const dlVerificationResponse = await manuallyVerifyDl(drivingLicense.id);
    setIsVerifying(false);
    if (dlVerificationResponse instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: dlVerificationResponse.message,
        type: "error",
      });
    } else {
      onClose(true, "DL successfully verified");
    }
  };

  const onSubmitMarkUnverified = async () => {
    setIsUnverifying(true);
    const dlVerificationResponse = await revokeDlVerification(
      drivingLicense.id
    );
    setIsUnverifying(false);
    if (dlVerificationResponse instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: dlVerificationResponse.message,
        type: "error",
      });
    } else {
      onClose(true, "DL marked unverified");
    }
  };

  const onSubmitReset = async () => {
    setIsResetting(true);
    const dlResetResponse = await resetDl(drivingLicense.userId);
    setIsResetting(false);

    if (dlResetResponse instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: dlResetResponse.message,
        type: "error",
      });
    } else {
      onClose(true, "DL is deleted from driver");
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
      <Dialog
        className={styles.modalRoot}
        open={true}
        maxWidth={"xl"}
        onClose={() => onClose(false)}
        scroll={"body"}
      >
        <div className={styles.modalCloseIcon}>
          <IconButton
            name="close"
            color="inherit"
            onClick={() => onClose(false)}
          >
            <CloseRoundedIcon />
          </IconButton>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.license}>
            <div className={styles.driverInfo}>
              <div>
                <div className={styles.title}>Name</div>
                <span>{drivingLicense.name ?? "NA"}</span>
              </div>
              <div>
                <div className={styles.title}>DL Number</div>
                <span>{drivingLicense.drivingLicenseNumber}</span>
              </div>
              <div>
                <div className={styles.title}>Status</div>
                <span>{drivingLicense.verifiedStatus}</span>
              </div>
              <div>
                <div className={styles.title}>Date of Birth</div>
                <span>
                  {drivingLicense.dateOfBirth
                    ? formatDate(drivingLicense.dateOfBirth, "DD-MM-yyyy")
                    : "NA"}
                </span>
              </div>
            </div>

            <div className={styles.covs}>
              <div className={styles.title}>Valid COVs</div>
              <div>
                {truckDriverClassOfVehicles.map((cov, index) => (
                  <span key={index}>{cov}</span>
                ))}
              </div>
            </div>

            <div className={styles.dlImages}>
              {isFrontImageLoading && <Loading isLoading={true} />}
              <Zoom>
                <img
                  className={styles.dlImage}
                  src={drivingLicense.dlFrontImage?.toString()}
                  alt="Driving License Front"
                  onLoad={() => setIsFrontImageLoading(false)}
                  onError={() => setIsFrontImageLoading(false)}
                />
              </Zoom>
              {isBackImageLoading && <Loading isLoading={true} />}
              <Zoom>
                <img
                  className={styles.dlImage}
                  src={drivingLicense.dlBackImage?.toString()}
                  alt="Driving License Back"
                  onLoad={() => setIsBackImageLoading(false)}
                  onError={() => setIsBackImageLoading(false)}
                />
              </Zoom>
            </div>
            {allowVerification && (
              <div className={styles.actions}>
                {(isDlInReview(drivingLicense.verifiedStatus) ||
                  (isDlVerifiedByApi(drivingLicense.verifiedStatus) &&
                    !isTruckDriverLicense(drivingLicense.classOfVehicles))) && (
                  <Button
                    style={{
                      backgroundColor: "#0659bfd5",
                      color: "#fff",
                      width: "150px",
                    }}
                    onClick={onSubmitVerify}
                    disabled={isVerifying}
                  >
                    <Loading
                      text="Verify as Truck Driver"
                      isLoading={isVerifying}
                    />
                  </Button>
                )}
                {isDlInReview(drivingLicense.verifiedStatus) && (
                  <Button
                    style={{
                      backgroundColor: "#CA631E",
                      color: "#fff",
                      width: "150px",
                    }}
                    onClick={onSubmitMarkUnverified}
                    disabled={isUnverifying}
                  >
                    <Loading text="Mark Unverified" isLoading={isUnverifying} />
                  </Button>
                )}
                {/* display reset dl button for every dl */}
                <Button
                  style={{
                    backgroundColor: "#C83333",
                    color: "#fff",
                    width: "150px",
                  }}
                  onClick={onSubmitReset}
                  disabled={isResetting}
                >
                  <Loading text={"Reset DL"} isLoading={isResetting} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DrivingLicenseVerificationModal;
