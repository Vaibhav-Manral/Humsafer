import { Grid ,Typography,Card, CardContent} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { getUserInfo } from "../../api/Drivers";
import BiradareeInfo from "../../components/biradareeInfo/BiradareeInfo";
import DriverProfileInfo from "../../components/driverProfileInfo/DriverProfileInfo";
import DriverSearch from "../../components/driverSearch/DriverSearch";
import DrivingLicenseInfo from "../../components/drivingLicenseInfo/DrivingLicenseInfo";
import RidesTable from "../../components/ridesTable/RidesTable";
import Toast, { IToastBasicProps } from "../../components/Toast/Toast";
import { IGetUserInfoResponse } from "../../models/GetUserInfoResponse";
import { HumsaferError } from "../../models/HumsaferError";
import styles from "./DriverSupportPage.module.css";
import DevicesTable from "../../components/devicesTable/DevicesTable";
import LiveLocationTable from "../../components/liveLocationTable/LiveLocationTable";
import DriverShipmentsTable from "../../components/driverShipmentsTable/DriverShipmentsTable";
import { LocalCache } from "../../utils/LocalCache";
import { getCompanies } from "../../api/Companies";
import { CompanyDataContext } from "../../contexts/CompanyDataContext";
import { ICompany } from "../../models/Companies";
import CustomTabs from "../../components/customTab/CustomTab";
import { Search } from "@mui/icons-material";
// import LiveLocationTable from "../../components/liveLocationTable/LiveLocationTable";

const DriverSupportPage: React.FC = React.memo(() => {
  const [driverProfile, setDriverProfile] = useState<IGetUserInfoResponse>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [companies, setCompanies] = useState<ICompany[]>([]);

  const { selectCompany } = useContext(CompanyDataContext);

  const [showToast, setShowToast] = useState<IToastBasicProps>({
    open: false,
    message: "",
    type: "success",
  });

  const handleToastClose = () => {
    setShowToast({
      open: false,
      message: showToast.message,
      type: showToast.type,
    });
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    const companiesOrError = await getCompanies();
    setIsLoading(false);
    if (companiesOrError instanceof HumsaferError) {
      setShowToast({
        open: true,
        message: companiesOrError.message,
        type: "error",
      });
      return;
    }

    LocalCache.saveCompanyList(companiesOrError);
  };

  const requestCompanySwitch = async (
    companyId: string,
    onCompanySwitchSuccess: () => void
  ) => {
    const companyExists = companies?.find(
      (company) => company.id === companyId
    );
    if (!companyExists) {
      await fetchCompanies();
      const newCompanies = LocalCache.getCompanyList();
      const foundCompany = newCompanies?.find(
        (company) => company.id === companyId
      );
      if (foundCompany) {
        selectCompany(foundCompany);
      }
    } else {
      selectCompany(companyExists);
    }
    onCompanySwitchSuccess();
  };

  useEffect(() => {
    const cachedCompanyList = LocalCache.getCompanyList();
    if (!cachedCompanyList) {
      fetchCompanies();
      return;
    }
    setCompanies(cachedCompanyList);
  }, []);

  const onSearchProfile = async (phoneNumber: string) => {
    setDriverProfile(undefined);
    setIsLoading(true);
    setErrorMessage(undefined);
    setPhoneNumber(phoneNumber);
    const userInfo = await getUserInfo(phoneNumber);
    setIsLoading(false);
    if (userInfo instanceof HumsaferError) {
      setErrorMessage(userInfo.getErrorMessage());
    } else {
      setDriverProfile(userInfo);
    }
  };
  const tabsData: any = [
    {
      label: "Driver Profile",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <DriverProfileInfo
            driverProfile={driverProfile.userProfile}
            lastPointsEarnedTime={driverProfile.lastStarPointEarnedTime}
            lastRedeemTime={driverProfile.lastRedemptionEventTime}
            lastRideEndTime={driverProfile.lastRideEndTime}
            userRewardsView={driverProfile.userRewardsView}
            userPerformanceView={driverProfile.userPerformanceView}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
    {
      label: "Device Info",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <DevicesTable
            devices={Object.values(
              driverProfile.devices ? driverProfile.devices : []
            )}
            driverProfile={driverProfile.userProfile}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
    {
      label: "Live Location",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <LiveLocationTable
            lastLiveLocations={Object.values(driverProfile.lastLiveLocations)}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
    {
      label: "Driver Licence",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <DrivingLicenseInfo
            drivingLicense={driverProfile.drivingLicenseView}
            allowVerification={true}
            refreshDL={(successMessage) => {
              if (successMessage) {
                setShowToast({
                  open: true,
                  message: successMessage,
                  type: "success",
                });
              }

              if (phoneNumber) {
                onSearchProfile(phoneNumber);
              }
            }}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
    {
      label: "Biradree Info",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <BiradareeInfo
            biradareeInsuranceView={driverProfile.biradareeInsuranceView}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
  ];

  const tabsData2: any = [
    {
      label: "Last 10 rides",
      content: driverProfile ? (
        // <Grid
        //   className={styles.driverSupport_componentContainer}
        //   item
        //   lg={12}
        //   md={12}
        //   xs={12}
        // >
          <RidesTable rides={driverProfile.recentRides} />
        // {/* </Grid> */}
      ) : (
        <div>No profile data</div>
      ),
    },
    {
      label: "Last 10 Shipments",
      content: driverProfile ? (
        <Grid
          className={styles.driverSupport_componentContainer}
          item
          lg={12}
          md={12}
          xs={12}
        >
          <DriverShipmentsTable
            shipments={driverProfile.recentShipments}
            requestCompanySwitch={requestCompanySwitch}
          />
        </Grid>
      ) : (
        <div>No profile data</div>
      ),
    },
  ];
  return (
    <div>
      <Toast
        message={showToast.message}
        open={showToast.open}
        onClose={handleToastClose}
        type={showToast.type}
      />
      {/* <div></div> */}
      <DriverSearch
        onSearchSumbit={onSearchProfile}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
      {driverProfile && (
        // <Grid container>
          <CustomTabs tabs={tabsData} />
        // {/* </Grid> */}
      )}
      {driverProfile && (
        // <Grid container>
          <CustomTabs tabs={tabsData2} />
        // {/* </Grid> */}
      )}
      {
  !driverProfile && (
    <Card 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 500, 
        margin: '40px auto',
        textAlign: 'center',
        height: 300,
        animation: 'fadeIn 1s ease-in',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <CardContent>
        <Search 
          sx={{ 
            fontSize: 80, 
            mb: 2 ,
            fontWeight: '600',
            color: '#f06b24',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.7,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }} 
        />
        <Typography variant="h6" color="text.secondary">
          Search Here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 ,fontSize: '14px' }}>
          Enter a Phone number / User Id to view driver profile
        </Typography>
      </CardContent>
    </Card>
  )
}
    </div>
  );
});

export default DriverSupportPage;
