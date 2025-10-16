import { useContext, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import "./App.css";
import { Auth } from "./utils/Auth";
import { HumsaferThemeContext } from "./contexts/HumsaferThemeContext";
import { Config } from "./utils/Config";
import LoginPage from "./pages/login/LoginPage";
import HomePage from "./pages/home/HomePage";
import PrivateRouteWithLayout from "./utils/PrivateRouteWithLayout";
import Logout from "./pages/logout/logout";
import DriverSupportPage from "./pages/driverSupport/DriverSupportPage";
import DrivingLicense from "./pages/drivingLicense/DrivingLicense";
import UserManagement from "./pages/userManagement/UserManagement";
import BiradareePage from "./pages/biradaree/BiradareePage";
import ReportsPage from "./pages/reports/ReportsPage";
import BuenoLandingPage from "./pages/bueno/BuenoLandingPage";
import PartnershipsPage from "./pages/partnerships/PartnershipsPage";
import CompaniesPage from "./pages/company/Company";
import ShipmentDetailsPage from "./pages/ShipmentDetails/ShipmentDetails";
import ShipmentListPage from "./pages/ShipmentsList/ShipmentsList";
import ViewShipmentsPage from "./pages/shipments/Shipment";
import TokenBasedRoute from "./utils/TokenBasedRoute";
import ViewDriverReportsPage from "./pages/DriverReports/DriverReports";
import CompanyUsersPage from "./pages/companyUsers/CompanyUsersPage";
import AnalyseDetailsPage from "./pages/AnalyesDetails/AnalyseDetails";
import * as Sentry from "@sentry/react";
import ShipmentReportsPage from "./pages/shipmentReports/ShipmentReportsPage";
import ShipmentHandling from "./pages/ShipmentHandling/ShipmentHandling";

function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: Config.getInstance().getMapKeyConfig(),
    libraries: ["places", "geometry"],
  });

  useEffect(() => {
    // initializes firebase
    Auth.getInstance();
  });

  const { favIcon } = useContext(HumsaferThemeContext);
  const element = document.getElementById("favicon");
  if (element && element instanceof HTMLLinkElement) {
    element.href = favIcon;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/buenoLanding" element={<BuenoLandingPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/"
            element={<PrivateRouteWithLayout path="/" element={<HomePage />} />}
          />
          <Route
            path="/support"
            element={
              <PrivateRouteWithLayout
                path="/support"
                element={<DriverSupportPage />}
              />
            }
          />
          <Route
            path="/driving-license"
            element={
              <PrivateRouteWithLayout
                path="/driving-license"
                element={<DrivingLicense />}
              />
            }
          />
          <Route
            path="/user-management"
            element={
              <PrivateRouteWithLayout
                path="/user-management"
                element={<UserManagement />}
              />
            }
          />
          <Route
            path="/biradaree-info"
            element={
              <PrivateRouteWithLayout
                path="/biradaree-info"
                element={<BiradareePage />}
              />
            }
          />
          <Route
            path="/internal-reports"
            element={
              <PrivateRouteWithLayout
                path="/internal-reports"
                element={<ReportsPage />}
              />
            }
          />
          <Route
            path="/partnerships"
            element={
              <PrivateRouteWithLayout
                path="/partnerships"
                element={<PartnershipsPage />}
              />
            }
          />
          <Route
            path="/handle-shipments"
            element={
              <PrivateRouteWithLayout
                path="/handle-shipments"
                element={<ShipmentHandling />}
              />
            }
          />
          <Route
            path="/companies"
            element={
              <PrivateRouteWithLayout
                path="/companies"
                element={<CompaniesPage />}
              />
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRouteWithLayout
                path="/users"
                element={<CompanyUsersPage />}
              />
            }
          />
          <Route path="/shipments">
            <Route
              path=""
              element={
                <PrivateRouteWithLayout
                  path="/shipments"
                  element={<ShipmentListPage />}
                />
              }
            />
            <Route
              path=":shipmentId"
              element={
                <PrivateRouteWithLayout
                  path="/shipments/:shipmentId"
                  element={
                    <ShipmentDetailsPage
                      isSharedShipment={false}
                      isLoaded={isLoaded}
                    />
                  }
                />
              }
            />
            <Route
              path="create"
              element={
                <PrivateRouteWithLayout
                  path="/shipments/create"
                  element={<ViewShipmentsPage />}
                />
              }
            />
          </Route>
          <Route path="/sharedShipments">
            <Route
              path=":shipmentId"
              element={
                <TokenBasedRoute
                  element={() => (
                    <ShipmentDetailsPage
                      isSharedShipment={true}
                      isLoaded={isLoaded}
                    />
                  )}
                />
              }
            />
          </Route>
          <Route
            path="/driver-reports/:driverId"
            element={
              <PrivateRouteWithLayout
                path="/driver-reports/:driverId"
                element={<ViewDriverReportsPage />}
              />
            }
          />
          <Route
            path="/analyse"
            element={
              <PrivateRouteWithLayout
                path="/analyse"
                element={<AnalyseDetailsPage />}
              />
            }
          />
          <Route
            path="/shipment-reports"
            element={
              <PrivateRouteWithLayout
                path="/shipment-reports"
                element={<ShipmentReportsPage />}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default Sentry.withProfiler(App);
